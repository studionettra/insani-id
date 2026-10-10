<?php

use App\Models\Category;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::create([
        'name' => 'Kemanusiaan',
        'slug' => 'kemanusiaan',
        'is_active' => true,
    ]);

    $this->creator = User::factory()->create();

    $this->program = Program::create([
        'program_code' => 'PRG-STALE-001',
        'title' => 'Program Uji Donasi Kedaluwarsa',
        'slug' => 'program-uji-donasi-kedaluwarsa',
        'category_id' => $this->category->id,
        'campaigner_type' => 'internal',
        'created_by' => $this->creator->id,
        'target_amount' => 10000000,
        'collected_amount' => 0,
        'status' => 'published',
        'story' => 'Cerita program bantuan',
        'cover_image' => 'programs/covers/test.jpg',
    ]);
});

test('donations:expire-stale marks offline pending donations older than 24 hours as expired', function () {
    // 1. Stale offline donation (created 26 hours ago)
    $staleDonation = Donation::create([
        'donation_code' => 'DON-STALE-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Lama',
        'donor_email' => 'lama@example.com',
        'donor_phone' => '08123456789',
        'amount' => 50000,
        'channel' => 'offline',
        'status' => 'pending',
    ]);
    $staleDonation->forceFill(['created_at' => now()->subHours(26)])->saveQuietly();

    Payment::create([
        'donation_id' => $staleDonation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PENDING',
    ]);

    // 2. Fresh offline donation (created 2 hours ago)
    $freshDonation = Donation::create([
        'donation_code' => 'DON-FRESH-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Baru',
        'donor_email' => 'baru@example.com',
        'donor_phone' => '08123456789',
        'amount' => 75000,
        'channel' => 'offline',
        'status' => 'pending',
        'created_at' => now()->subHours(2),
    ]);

    // Run command with default 24 hours
    $this->artisan('donations:expire-stale')
        ->assertSuccessful();

    // Assert stale donation became expired
    expect($staleDonation->fresh()->status)->toBe('expired');
    expect($staleDonation->payments()->first()->gateway_status)->toBe('EXPIRED');

    // Assert fresh donation is still pending
    expect($freshDonation->fresh()->status)->toBe('pending');
});

test('donations:expire-stale marks online pending donations older than 24 hours as expired', function () {
    // 1. Stale online donation (created 26 hours ago)
    $staleOnlineDonation = Donation::create([
        'donation_code' => 'DON-STALE-ONLINE-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Online Lama',
        'donor_email' => 'onlinelama@example.com',
        'donor_phone' => '08123456789',
        'amount' => 100000,
        'channel' => 'online',
        'status' => 'pending',
    ]);
    $staleOnlineDonation->forceFill(['created_at' => now()->subHours(26)])->saveQuietly();

    Payment::create([
        'donation_id' => $staleOnlineDonation->id,
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-STALE-ONLINE-01',
        'gateway_status' => 'PENDING',
    ]);

    // 2. Fresh online donation (created 1 hour ago)
    $freshOnlineDonation = Donation::create([
        'donation_code' => 'DON-FRESH-ONLINE-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Online Baru',
        'donor_email' => 'onlinebaru@example.com',
        'donor_phone' => '08123456789',
        'amount' => 150000,
        'channel' => 'online',
        'status' => 'pending',
        'created_at' => now()->subHours(1),
    ]);

    Payment::create([
        'donation_id' => $freshOnlineDonation->id,
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-FRESH-ONLINE-01',
        'gateway_status' => 'PENDING',
    ]);

    // Run command
    $this->artisan('donations:expire-stale')
        ->assertSuccessful();

    // Assert stale online donation became expired
    expect($staleOnlineDonation->fresh()->status)->toBe('expired');
    expect($staleOnlineDonation->payments()->first()->gateway_status)->toBe('EXPIRED');

    // Assert fresh online donation is still pending
    expect($freshOnlineDonation->fresh()->status)->toBe('pending');
    expect($freshOnlineDonation->payments()->first()->gateway_status)->toBe('PENDING');
});

test('donations:expire-stale rescues paid online donation if Midtrans API reports settlement', function () {
    config([
        'services.midtrans.server_key' => 'SB-Mid-server-testkey12345',
        'services.midtrans.is_production' => false,
    ]);

    Http::fake([
        'https://api.sandbox.midtrans.com/v2/DON-SAVED-ONLINE-01/status' => Http::response([
            'status_code' => '200',
            'transaction_status' => 'settlement',
            'gross_amount' => '50000.00',
            'payment_type' => 'qris',
            'order_id' => 'DON-SAVED-ONLINE-01',
        ], 200),
    ]);

    $savedDonation = Donation::create([
        'donation_code' => 'DON-SAVED-ONLINE-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Terselamatkan',
        'donor_email' => 'terselamatkan@example.com',
        'donor_phone' => '08123456789',
        'amount' => 50000,
        'channel' => 'online',
        'status' => 'pending',
    ]);
    $savedDonation->forceFill(['created_at' => now()->subHours(30)])->saveQuietly();

    Payment::create([
        'donation_id' => $savedDonation->id,
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'gateway' => 'midtrans',
        'gateway_reference_id' => 'DON-SAVED-ONLINE-01',
        'gateway_status' => 'PENDING',
    ]);

    // Run command
    $this->artisan('donations:expire-stale')
        ->assertSuccessful();

    // Assert donation was rescued as paid
    expect($savedDonation->fresh()->status)->toBe('paid');
    expect($savedDonation->payments()->first()->gateway_status)->toBe('PAID');
});
