<?php

use App\Models\Category;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');

    Role::firstOrCreate(['name' => 'Administrator']);
    Permission::firstOrCreate(['name' => 'donation.view']);

    $category = Category::factory()->create();
    $this->program = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
    ]);
});

test('manual donation proof is stored on local private disk and not in public storage', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');
    $admin->givePermissionTo('donation.view');

    $donation = Donation::create([
        'donation_code' => 'DON-TEST-12345',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '081234567890',
        'amount' => 500000,
        'channel' => 'offline',
        'status' => 'pending',
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PENDING',
    ]);

    $file = UploadedFile::fake()->image('struk_transfer.jpg');

    $response = $this->actingAs($admin)->post("/admin/donations/{$donation->id}/confirm", [
        'transfer_proof' => $file,
    ]);

    $response->assertRedirect();

    $payment = $donation->payments()->whereNotNull('transfer_proof')->first();
    expect($payment)->not->toBeNull();

    // Verify it is on local disk and NOT on public disk
    Storage::disk('local')->assertExists($payment->transfer_proof);
    Storage::disk('public')->assertMissing($payment->transfer_proof);
});

test('guest cannot access donation proof without valid signature', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-SEC-001',
        'program_id' => $this->program->id,
        'donor_name' => 'Ahmad',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '081234567891',
        'amount' => 100000,
        'channel' => 'offline',
        'status' => 'paid',
    ]);

    $path = UploadedFile::fake()->image('proof.jpg')->store('donation-proofs', 'local');

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PAID',
        'transfer_proof' => $path,
    ]);

    // Unsigned request must be forbidden
    $response = $this->get("/donasi/{$donation->id}/proof");
    $response->assertForbidden();
});

test('donor with valid temporary signed url can view donation proof', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-SEC-002',
        'program_id' => $this->program->id,
        'donor_name' => 'Fatimah',
        'donor_email' => 'fatimah@example.com',
        'donor_phone' => '081234567892',
        'amount' => 250000,
        'channel' => 'offline',
        'status' => 'paid',
    ]);

    $path = UploadedFile::fake()->image('proof.jpg')->store('donation-proofs', 'local');

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PAID',
        'transfer_proof' => $path,
    ]);

    $signedUrl = URL::temporarySignedRoute(
        'donation.proof',
        now()->addMinutes(60),
        ['donation' => $donation->id]
    );

    $response = $this->get($signedUrl);
    $response->assertOk();
});

test('guest or unauthorized user cannot access admin donation proof route', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-SEC-003',
        'program_id' => $this->program->id,
        'donor_name' => 'Budi',
        'donor_email' => 'budi@example.com',
        'donor_phone' => '081234567893',
        'amount' => 150000,
        'channel' => 'offline',
        'status' => 'paid',
    ]);

    $path = UploadedFile::fake()->image('proof.jpg')->store('donation-proofs', 'local');

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PAID',
        'transfer_proof' => $path,
    ]);

    // Guest -> Redirect to login
    $guestResponse = $this->get("/admin/donations/{$donation->id}/proof");
    $guestResponse->assertRedirect('/login');

    // Regular authenticated user without permission -> 403 Forbidden
    $regularUser = User::factory()->create();
    $userResponse = $this->actingAs($regularUser)->get("/admin/donations/{$donation->id}/proof");
    $userResponse->assertForbidden();
});

test('admin with donation.view permission can view donation proof', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');
    $admin->givePermissionTo('donation.view');

    $donation = Donation::create([
        'donation_code' => 'DON-SEC-004',
        'program_id' => $this->program->id,
        'donor_name' => 'Siti',
        'donor_email' => 'siti@example.com',
        'donor_phone' => '081234567894',
        'amount' => 300000,
        'channel' => 'offline',
        'status' => 'paid',
    ]);

    $path = UploadedFile::fake()->image('proof.jpg')->store('donation-proofs', 'local');

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PAID',
        'transfer_proof' => $path,
    ]);

    $response = $this->actingAs($admin)->get("/admin/donations/{$donation->id}/proof");
    $response->assertOk();
});

test('viewing missing donation proof file returns 404', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');
    $admin->givePermissionTo('donation.view');

    $donation = Donation::create([
        'donation_code' => 'DON-SEC-005',
        'program_id' => $this->program->id,
        'donor_name' => 'Hendro',
        'donor_email' => 'hendro@example.com',
        'donor_phone' => '081234567895',
        'amount' => 100000,
        'channel' => 'offline',
        'status' => 'paid',
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PAID',
        'transfer_proof' => 'donation-proofs/non_existent.jpg',
    ]);

    $response = $this->actingAs($admin)->get("/admin/donations/{$donation->id}/proof");
    $response->assertNotFound();
});
