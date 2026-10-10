<?php

use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Services\MidtransCorePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it validates maximum nominal limit for specific payment channels', function () {
    $program = Program::factory()->create(['status' => 'published']);

    // QRIS max is 10,000,000. Attempting 15,000,000 should fail validation.
    $response = $this->post(route('donation.store', ['program' => $program->slug]), [
        'amount' => 15000000,
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'online',
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
    ]);

    $response->assertSessionHasErrors(['amount']);
});

test('it validates minimum nominal limit for payment channels', function () {
    $program = Program::factory()->create(['status' => 'published']);

    // Minimum is 10,000. Attempting 5,000 should fail validation.
    $response = $this->post(route('donation.store', ['program' => $program->slug]), [
        'amount' => 5000,
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'online',
        'payment_method' => 'virtual_account',
        'payment_channel' => 'BCA',
    ]);

    $response->assertSessionHasErrors(['amount']);
});

test('it stores selected payment_channel and payment_method for offline transfer', function () {
    $program = Program::factory()->create(['status' => 'published']);

    $response = $this->post(route('donation.store', ['program' => $program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Ahmad Fauzi',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
    ]);

    $donation = Donation::latest()->first();
    expect($donation)->not->toBeNull();

    $payment = $donation->payments()->first();
    expect($payment)->not->toBeNull()
        ->and($payment->payment_channel)->toBe('MANUAL_BSI')
        ->and($payment->payment_destination)->toBe('713 219 5026')
        ->and($payment->payment_method)->toBe('bank_transfer_manual');
});

test('it triggers fallback status sync when visiting status page for pending online donation', function () {
    $program = Program::factory()->create(['status' => 'published']);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-SYNC-TEST',
        'amount' => 100000,
        'status' => 'pending',
        'channel' => 'online',
    ]);

    $payment = Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-SYNC-TEST',
        'gateway_status' => 'pending',
    ]);

    $mockService = Mockery::mock(MidtransCorePaymentService::class);
    $mockService->shouldReceive('syncPaymentStatus')
        ->once()
        ->withArgs(function ($arg) use ($payment) {
            return $arg->id === $payment->id;
        })
        ->andReturnUsing(function ($arg) {
            $arg->update([
                'gateway_status' => 'settlement',
                'paid_amount' => 100000,
                'paid_at' => now(),
                'payment_method' => 'qris',
                'payment_channel' => 'qris',
            ]);

            return true;
        });

    $this->app->instance(MidtransCorePaymentService::class, $mockService);

    $response = $this->get(route('donation.status', ['donationCode' => 'DON-SYNC-TEST']));

    $response->assertOk();

    $donation->refresh();
    expect($donation->status)->toBe('paid');
});

test('it enforces QRIS maximum limit when payment_channel is omitted for online donation', function () {
    $program = Program::factory()->create(['status' => 'published']);

    // Attempting 15,000,000 without payment_channel should fallback to QRIS and fail validation
    $response = $this->post(route('donation.store', ['program' => $program->slug]), [
        'amount' => 15000000,
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'online',
        'payment_method' => 'qris',
    ]);

    $response->assertSessionHasErrors(['amount']);
});

test('it rejects invalid payment_channel for online donations', function () {
    $program = Program::factory()->create(['status' => 'published']);

    $response = $this->post(route('donation.store', ['program' => $program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'online',
        'payment_method' => 'qris',
        'payment_channel' => 'INVALID_CHANNEL_XYZ',
    ]);

    $response->assertSessionHasErrors(['payment_channel']);
});

test('program total_gateway_fees excludes unpaid or expired payment attempts for the same donation', function () {
    $program = Program::factory()->create(['status' => 'published']);

    // Donasi senilai 100.000 berstatus paid
    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'amount' => 100000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    // Percobaan 1: Expired dengan estimasi fee 4.440 (tidak boleh dihitung)
    Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'midtrans',
        'gateway_status' => 'EXPIRED',
        'gateway_fee' => 4440,
        'paid_amount' => null,
        'paid_at' => null,
    ]);

    // Percobaan 2: Sukses via QRIS dengan fee 700 (hanya ini yang dihitung)
    Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'midtrans',
        'gateway_status' => 'PAID',
        'gateway_fee' => 700,
        'paid_amount' => 100000,
        'paid_at' => now(),
    ]);

    // Program total gateway fees hanya boleh 700, bukan 5.140
    expect((float) $program->total_gateway_fees)->toBe(700.0);
});
