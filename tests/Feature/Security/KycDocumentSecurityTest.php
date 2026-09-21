<?php

use App\Models\CampaignerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');

    // Create required roles and permissions
    Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Donatur']);
    Permission::firstOrCreate(['name' => 'campaigner.verify']);
});

test('campaigner registration stores KYC documents on local private disk instead of public disk', function () {
    $user = User::factory()->create();

    $ktpFile = UploadedFile::fake()->image('ktp.jpg');
    $selfieFile = UploadedFile::fake()->image('selfie.jpg');
    $bukuRekeningFile = UploadedFile::fake()->image('buku_rekening.jpg');

    $response = $this->actingAs($user)->post(route('campaigner.register.store'), [
        'type' => 'individu',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $user->name,
        'address' => 'Jl. Kebaikan No. 10 Jakarta',
        'phone' => '08123456789',
        'ktp' => $ktpFile,
        'selfie_ktp' => $selfieFile,
        'buku_rekening' => $bukuRekeningFile,
    ]);

    $response->assertRedirect(route('campaigner.status'));

    $profile = CampaignerProfile::where('user_id', $user->id)->first();
    expect($profile)->not->toBeNull();

    $docs = $profile->documents;
    expect($docs)->toHaveCount(3);

    foreach ($docs as $doc) {
        // Must be saved in local disk, NOT in public disk
        Storage::disk('local')->assertExists($doc->file_path);
        Storage::disk('public')->assertMissing($doc->file_path);
    }
});

test('unauthorized user cannot view another campaigners verification documents', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $profile = CampaignerProfile::create([
        'user_id' => $owner->id,
        'type' => 'individu',
        'verification_status' => 'pending',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $owner->name,
        'address' => 'Jl. Kebaikan No. 10',
        'phone' => '08123456789',
    ]);

    $doc = $profile->documents()->create([
        'document_type' => 'ktp',
        'file_path' => 'verification_documents/'.$owner->id.'/test_ktp.jpg',
        'status' => 'pending',
    ]);

    Storage::disk('local')->put($doc->file_path, 'dummy ktp binary content');

    // Guest cannot access
    $this->get(route('campaigner.document', $doc->id))
        ->assertRedirect(route('login'));

    // Another user cannot access
    $this->actingAs($otherUser)
        ->get(route('campaigner.document', $doc->id))
        ->assertForbidden();

    // Owner can access
    $this->actingAs($owner)
        ->get(route('campaigner.document', $doc->id))
        ->assertOk();
});

test('admin with campaigner.verify permission can view verification documents', function () {
    Role::firstOrCreate(['name' => 'Verifikator']);
    Role::firstOrCreate(['name' => 'Customer Service']);

    $admin = User::factory()->create();
    $admin->assignRole('Verifikator');
    $admin->givePermissionTo('campaigner.verify');

    $owner = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $owner->id,
        'type' => 'individu',
        'verification_status' => 'pending',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $owner->name,
        'address' => 'Jl. Kebaikan No. 10',
        'phone' => '08123456789',
    ]);

    $doc = $profile->documents()->create([
        'document_type' => 'ktp',
        'file_path' => 'verification_documents/'.$owner->id.'/test_ktp.jpg',
        'status' => 'pending',
    ]);

    Storage::disk('local')->put($doc->file_path, 'dummy ktp binary content');

    // Admin without permission
    $nonVerifAdmin = User::factory()->create();
    $nonVerifAdmin->assignRole('Customer Service');
    $this->actingAs($nonVerifAdmin)
        ->get(route('admin.campaigners.document', ['id' => $profile->id, 'docId' => $doc->id]))
        ->assertForbidden();

    // Verifier Admin with permission can view
    $this->actingAs($admin)
        ->get(route('admin.campaigners.document', ['id' => $profile->id, 'docId' => $doc->id]))
        ->assertOk();
});
