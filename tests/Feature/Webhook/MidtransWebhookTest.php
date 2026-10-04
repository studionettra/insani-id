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
