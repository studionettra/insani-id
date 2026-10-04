<?php

use App\Mail\DonationSuccessNotification;
use App\Models\Category;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    Permission::firstOrCreate(['name' => 'donation.view']);

    $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $adminRole->givePermissionTo('donation.view');

    Role::firstOrCreate(['name' => 'campaigner']);

    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

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
    for ($i = 0; $i < 3; $i++) {
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

test('admin can confirm offline donation with transfer proof', function () {
    Mail::fake();
    Storage::fake('public');

    $donation = Donation::create([
        'donation_code' => 'DON-OFFLINE',
        'program_id' => $this->program->id,
        'donor_name' => 'Donor',
        'donor_email' => 'donor@test.com',
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
        'paid_amount' => 100000,
    ]);

    $file = UploadedFile::fake()->image('struk_transfer.jpg', 600, 800);

    $response = $this->actingAs($this->admin)->post("/admin/donations/{$donation->id}/confirm", [
        'transfer_proof' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Donasi manual berhasil diverifikasi dan dikonfirmasi.');

    expect($payment->fresh()->gateway_status)->toBe('PAID');
    expect($donation->fresh()->status)->toBe('paid');
    expect($payment->fresh()->transfer_proof)->not->toBeNull();

    Storage::disk('local')->assertExists($payment->fresh()->transfer_proof);

    // Check program collected amount updated
    expect($this->program->fresh()->collected_amount)->toEqual(100000);

    Mail::assertSent(DonationSuccessNotification::class);
});

test('admin cannot confirm offline donation without uploading transfer proof', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-OFFLINE-NOPROOF',
        'program_id' => $this->program->id,
        'donor_name' => 'Donor',
        'donor_email' => 'donor@test.com',
        'donor_phone' => '08123456789',
        'channel' => 'offline',
        'status' => 'pending',
        'amount' => 100000,
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'gateway' => 'manual',
        'payment_method' => 'bank_transfer_manual',
        'gateway_status' => 'PENDING',
        'paid_amount' => 100000,
    ]);

    $response = $this->actingAs($this->admin)->post("/admin/donations/{$donation->id}/confirm", []);

    $response->assertSessionHasErrors(['transfer_proof']);
    expect($donation->fresh()->status)->toBe('pending');
});
