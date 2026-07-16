<?php

use App\Models\Category;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use App\Mail\DonationSuccessNotification;

use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'admin']);
    Role::create(['name' => 'campaigner']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->campaigner = User::factory()->create();
    $this->campaigner->assignRole('campaigner');

    $category = Category::create([
        'name' => 'Kategori Test',
        'slug' => 'kategori-test',
        'description' => 'Test',
        'is_active' => true,
    ]);

    $this->program = Program::factory()->create([
        'program_code' => 'PRG-TEST',
        'category_id' => $category->id,
        'title' => 'Program Test',
        'slug' => 'program-test',
        'story' => 'Test',
        'target_amount' => 1000000,
        'created_by' => $this->campaigner->id,
        'campaigner_type' => 'internal',
        'cover_image' => 'cover.jpg',
        'status' => 'active',
    ]);
});

test('admin can view donations list', function () {
    for($i=0; $i<3; $i++) {
        Donation::create([
            'donation_code' => "DON-00$i",
            'program_id' => $this->program->id,
            'donor_name' => "Donor $i",
            'donor_email' => "donor$i@test.com",
            'donor_phone' => '08123456789',
            'amount' => 10000,
            'status' => 'paid',
            'channel' => 'online',
        ]);
    }

    $response = $this->actingAs($this->admin)->get('/admin/donations');

    $response->assertStatus(200);
});

test('admin can confirm offline donation', function () {
    Mail::fake();

    $donation = Donation::create([
        'donation_code' => "DON-OFFLINE",
        'program_id' => $this->program->id,
        'donor_name' => "Donor",
        'donor_email' => "donor@test.com",
        'donor_phone' => '08123456789',
        'channel' => 'offline',
        'status' => 'pending',
        'amount' => 100000,
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'gateway' => 'manual',
        'payment_method' => 'bank_transfer_manual',
        'gateway_status' => 'PENDING',
        'amount' => 100000,
    ]);

    $response = $this->actingAs($this->admin)->post("/admin/donations/{$donation->id}/confirm");

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Donasi manual berhasil dikonfirmasi.');

    expect($payment->fresh()->gateway_status)->toBe('PAID');
    expect($donation->fresh()->status)->toBe('paid');
    
    // Check program collected amount updated
    expect($this->program->fresh()->collected_amount)->toEqual(100000);

    Mail::assertSent(DonationSuccessNotification::class);
});
