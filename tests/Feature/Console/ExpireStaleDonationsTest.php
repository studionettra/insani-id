<?php

use App\Models\Category;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

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

test('donations:expire-stale marks offline pending donations older than 48 hours as expired', function () {
    // 1. Stale offline donation (created 50 hours ago)
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
    $staleDonation->forceFill(['created_at' => now()->subHours(50)])->saveQuietly();

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

    // Run command
    $this->artisan('donations:expire-stale --hours=48')
        ->assertSuccessful();

    // Assert stale donation became expired
    expect($staleDonation->fresh()->status)->toBe('expired');
    expect($staleDonation->payments()->first()->gateway_status)->toBe('EXPIRED');

    // Assert fresh donation is still pending
    expect($freshDonation->fresh()->status)->toBe('pending');
});
