<?php

use App\Jobs\SendDonationPaidNotification;
use App\Models\Comment;
use App\Models\Donation;
use App\Models\Fundraiser;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use App\Services\MidtransCorePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-testkey12345']);
});

function generateMidtransSignature(string $orderId, string $statusCode, string $grossAmount, string $serverKey): string
{
    return hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);
}

test('midtrans webhook returns 400 when order_id or status_code is missing', function () {
    $response = $this->postJson(route('webhooks.midtrans'), [
        'transaction_status' => 'settlement',
    ]);

    $response->assertStatus(400);
    expect($response->json('message'))->toBe('Missing required webhook parameters');
});

test('midtrans webhook returns 403 when signature_key is invalid', function () {
    $response = $this->postJson(route('webhooks.midtrans'), [
        'order_id' => 'DON-123456',
        'status_code' => '200',
        'gross_amount' => '50000.00',
        'signature_key' => 'invalid-signature-hash',
        'transaction_status' => 'settlement',
    ]);

    $response->assertStatus(403);
    expect($response->json('message'))->toBe('Invalid signature');
});

test('midtrans webhook returns 404 when payment is not found', function () {
    $orderId = 'DON-NONEXISTENT';
    $statusCode = '200';
    $grossAmount = '50000.00';
    $signature = generateMidtransSignature($orderId, $statusCode, $grossAmount, 'SB-Mid-server-testkey12345');

    $response = $this->postJson(route('webhooks.midtrans'), [
        'order_id' => $orderId,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
    ]);

    $response->assertStatus(404);
    expect($response->json('message'))->toBe('Payment not found');
});

test('midtrans webhook successfully processes settlement and updates donation, comments, and program collected amount', function () {
    Queue::fake();

    $program = Program::factory()->create([
        'target_amount' => 10000000,
        'collected_amount' => 0,
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-MIDTRANS-001',
        'amount' => 100000,
        'status' => 'pending',
        'message' => 'Semoga berkah dan bermanfaat.',
        'donor_name' => 'Ahmad Fauzi',
        'donor_email' => 'ahmad@example.com',
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'payment_destination' => 'QRIS',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-MIDTRANS-001',
        'gateway_status' => 'PENDING',
    ]);

    $orderId = 'DON-MIDTRANS-001';
    $statusCode = '200';
    $grossAmount = '100000.00';
    $signature = generateMidtransSignature($orderId, $statusCode, $grossAmount, 'SB-Mid-server-testkey12345');

    $response = $this->postJson(route('webhooks.midtrans'), [
        'order_id' => $orderId,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
        'settlement_time' => now()->format('Y-m-d H:i:s'),
    ]);

    $response->assertStatus(200);
    expect($response->json('message'))->toBe('Midtrans webhook processed successfully');

    // Verify payment updated
    $payment->refresh();
    expect($payment->gateway_status)->toBe('PAID')
        ->and((float) $payment->paid_amount)->toBe(100000.0)
        ->and((float) $payment->gateway_fee)->toBe(700.0) // 0.7% of 100,000 for QRIS
        ->and($payment->paid_at)->not->toBeNull();

    // Verify donation updated via observer
    $donation->refresh();
    expect($donation->status)->toBe('paid')
        ->and($donation->paid_at)->not->toBeNull();

    // Verify program collected amount correctly aggregated from paid donations
    $program->refresh();
    expect((float) $program->collected_amount)->toBe(100000.0);

    // Verify public comment created
    $comment = Comment::where('donation_id', $donation->id)->first();
    expect($comment)->not->toBeNull()
        ->and($comment->body)->toBe('Semoga berkah dan bermanfaat.')
        ->and($comment->is_hidden)->toBeFalse();

    // Verify notification queued
    Queue::assertPushed(SendDonationPaidNotification::class, function ($job) use ($donation) {
        return $job->donation->id === $donation->id;
    });
});

test('midtrans webhook marks donation as expired when status is expire', function () {
    $program = Program::factory()->create();
    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-MIDTRANS-EXP',
        'amount' => 50000,
        'status' => 'pending',
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'virtual_account',
        'payment_channel' => 'BSI',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-MIDTRANS-EXP',
        'gateway_status' => 'PENDING',
    ]);

    $orderId = 'DON-MIDTRANS-EXP';
    $statusCode = '200';
    $grossAmount = '50000.00';
    $signature = generateMidtransSignature($orderId, $statusCode, $grossAmount, 'SB-Mid-server-testkey12345');

    $response = $this->postJson(route('webhooks.midtrans'), [
        'order_id' => $orderId,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => 'expire',
    ]);

    $response->assertStatus(200);

    $payment->refresh();
    $donation->refresh();

    expect($payment->gateway_status)->toBe('EXPIRED')
        ->and($donation->status)->toBe('expired');
});

test('midtrans syncPaymentStatus updates payment, donation, comments for Tab Donatur and recalculates fundraiser for Tab Fundraiser', function () {
    Http::fake([
        'https://api.sandbox.midtrans.com/v2/DON-SYNC-001/status' => Http::response([
            'status_code' => '200',
            'transaction_status' => 'settlement',
            'gross_amount' => '75000.00',
            'payment_type' => 'bank_transfer',
            'va_numbers' => [
                ['bank' => 'bca', 'va_number' => '12345678901'],
            ],
        ], 200),
    ]);

    $program = Program::factory()->create([
        'target_amount' => 10000000,
        'collected_amount' => 0,
    ]);

    $fundraiserUser = User::factory()->create();
    $fundraiser = Fundraiser::create([
        'user_id' => $fundraiserUser->id,
        'program_id' => $program->id,
        'referral_code' => 'relawan-test',
        'collected_amount' => 0,
        'donors_count' => 0,
        'is_active' => true,
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'fundraiser_id' => $fundraiser->id,
        'donation_code' => 'DON-SYNC-001',
        'amount' => 75000,
        'status' => 'pending',
        'message' => 'Doa dari donatur fundraiser',
        'donor_name' => 'Budi Santoso',
        'is_anonymous' => false,
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'virtual_account',
        'payment_channel' => 'BCA',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-SYNC-001',
        'gateway_status' => 'PENDING',
    ]);

    $service = app(MidtransCorePaymentService::class);
    $isPaid = $service->syncPaymentStatus($payment);

    expect($isPaid)->toBeTrue();

    // Verify payment updated to PAID
    $payment->refresh();
    expect($payment->gateway_status)->toBe('PAID')
        ->and((float) $payment->paid_amount)->toBe(75000.0)
        ->and((float) $payment->gateway_fee)->toBe(4440.0) // Flat Rp 4.000 + PPN 11% for VA
        ->and($payment->payment_destination)->toBe('12345678901');

    // Verify donation updated to paid
    $donation->refresh();
    expect($donation->status)->toBe('paid');

    // Verify comment created for Tab Donatur
    $comment = Comment::where('donation_id', $donation->id)->first();
    expect($comment)->not->toBeNull()
        ->and($comment->body)->toBe('Doa dari donatur fundraiser')
        ->and($comment->name)->toBe('Budi Santoso');

    // Verify fundraiser updated for Tab Fundraiser
    $fundraiser->refresh();
    expect((float) $fundraiser->collected_amount)->toBe(75000.0)
        ->and($fundraiser->donors_count)->toBe(1);

    // Verify program collected amount updated
    $program->refresh();
    expect((float) $program->collected_amount)->toBe(75000.0);
});

test('midtrans calculateGatewayFee computes precise fees according to official pricing and VAT', function () {
    // 1. QRIS: 0.7% MDR all-in
    expect(MidtransCorePaymentService::calculateGatewayFee('qris', 100000))->toBe(700.0)
        ->and(MidtransCorePaymentService::calculateGatewayFee('QRIS ', 50000))->toBe(350.0);

    // 2. E-Wallets: 2% + 11% PPN = 2.22%
    expect(MidtransCorePaymentService::calculateGatewayFee('gopay', 100000))->toBe(2220.0)
        ->and(MidtransCorePaymentService::calculateGatewayFee('ShopeePay', 100000))->toBe(2220.0);

    // 3. Virtual Accounts: Flat Rp 4.000 + 11% PPN (Rp 440) = Rp 4.440
    expect(MidtransCorePaymentService::calculateGatewayFee('bank_transfer', 50000))->toBe(4440.0)
        ->and(MidtransCorePaymentService::calculateGatewayFee('echannel', 100000))->toBe(4440.0)
        ->and(MidtransCorePaymentService::calculateGatewayFee('cimb_va', 75000))->toBe(4440.0)
        ->and(MidtransCorePaymentService::calculateGatewayFee('bca_va', 25000))->toBe(4440.0);

    // 4. Credit Card: 2.9% + (Rp 2.000 * 1.11 PPN) = 2.9% + Rp 2.220
    expect(MidtransCorePaymentService::calculateGatewayFee('credit_card', 100000))->toBe(5120.0);

    // 5. Manual / Unknown: Rp 0
    expect(MidtransCorePaymentService::calculateGatewayFee('manual', 100000))->toBe(0.0)
        ->and(MidtransCorePaymentService::calculateGatewayFee('unknown_channel', 100000))->toBe(0.0);
});

test('midtrans webhook quarantines payment when gross_amount does not match donation amount', function () {
    Queue::fake();

    $program = Program::factory()->create([
        'target_amount' => 10000000,
        'collected_amount' => 0,
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-MISMATCH-001',
        'amount' => 100000,
        'status' => 'pending',
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-MISMATCH-001',
        'gateway_status' => 'PENDING',
    ]);

    $orderId = 'DON-MISMATCH-001';
    $statusCode = '200';
    $tamperedAmount = '50000.00'; // Donasi 100.000 tapi dibayar 50.000
    $signature = generateMidtransSignature($orderId, $statusCode, $tamperedAmount, 'SB-Mid-server-testkey12345');

    $response = $this->postJson(route('webhooks.midtrans'), [
        'order_id' => $orderId,
        'status_code' => $statusCode,
        'gross_amount' => $tamperedAmount,
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
    ]);

    $response->assertStatus(200);
    expect($response->json('message'))->toBe('Nominal mismatch; payment quarantined for review');

    // Payment should be marked as MISMATCH
    $payment->refresh();
    expect($payment->gateway_status)->toBe('MISMATCH')
        ->and($payment->paid_amount)->toBeNull();

    // Donation must remain pending
    $donation->refresh();
    expect($donation->status)->toBe('pending');

    // Program collected amount must NOT increase
    $program->refresh();
    expect((float) $program->collected_amount)->toBe(0.0);

    // No notification should be dispatched
    Queue::assertNothingPushed();
});

test('midtrans webhook ignores out-of-order expired webhook if payment is already paid', function () {
    $program = Program::factory()->create(['collected_amount' => 100000]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-ORDER-001',
        'amount' => 100000,
        'status' => 'paid',
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-ORDER-001',
        'gateway_status' => 'PAID',
        'paid_amount' => 100000,
        'paid_at' => now(),
    ]);

    $orderId = 'DON-ORDER-001';
    $statusCode = '200';
    $grossAmount = '100000.00';
    $signature = generateMidtransSignature($orderId, $statusCode, $grossAmount, 'SB-Mid-server-testkey12345');

    // Simulasikan webhook expire tiba belakangan
    $response = $this->postJson(route('webhooks.midtrans'), [
        'order_id' => $orderId,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => 'expire',
    ]);

    $response->assertStatus(200);
    expect($response->json('message'))->toBe('Ignored out-of-order webhook; payment already settled');

    // Status harus tetap PAID dan tidak tertimpa menjadi EXPIRED
    $payment->refresh();
    expect($payment->gateway_status)->toBe('PAID')
        ->and((float) $payment->paid_amount)->toBe(100000.0);

    $donation->refresh();
    expect($donation->status)->toBe('paid');
});

test('midtrans webhook is idempotent and does not send duplicate notifications on repeat callbacks', function () {
    Queue::fake();

    $program = Program::factory()->create();
    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-IDEMP-001',
        'amount' => 50000,
        'status' => 'pending',
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-IDEMP-001',
        'gateway_status' => 'PENDING',
    ]);

    $orderId = 'DON-IDEMP-001';
    $statusCode = '200';
    $grossAmount = '50000.00';
    $signature = generateMidtransSignature($orderId, $statusCode, $grossAmount, 'SB-Mid-server-testkey12345');

    $payload = [
        'order_id' => $orderId,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
    ];

    // Callback pertama
    $this->postJson(route('webhooks.midtrans'), $payload)->assertStatus(200);

    // Callback kedua (duplicate retry dari gateway)
    $this->postJson(route('webhooks.midtrans'), $payload)->assertStatus(200);

    // Notifikasi hanya boleh di-push 1 kali
    Queue::assertPushed(SendDonationPaidNotification::class, 1);
});
