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

    // Another user cannot access (uniform 404 to prevent ID enumeration)
    $this->actingAs($otherUser)
        ->get(route('campaigner.document', $doc->id))
        ->assertNotFound();

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

test('rejected campaigner can resubmit registration with revised documents and status resets to pending', function () {
    $user = User::factory()->create();

    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'verification_status' => 'rejected',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $user->name,
        'address' => 'Jl. Kebaikan No. 10',
        'phone' => '08123456789',
    ]);

    $oldDoc = $profile->documents()->create([
        'document_type' => 'ktp',
        'file_path' => 'verification_documents/'.$user->id.'/old_ktp.jpg',
        'status' => 'rejected',
        'notes' => 'Foto KTP buram',
    ]);

    $profile->documents()->create([
        'document_type' => 'selfie_ktp',
        'file_path' => 'verification_documents/'.$user->id.'/old_selfie.jpg',
        'status' => 'verified',
    ]);

    $profile->documents()->create([
        'document_type' => 'buku_rekening',
        'file_path' => 'verification_documents/'.$user->id.'/old_buku.jpg',
        'status' => 'verified',
    ]);

    Storage::disk('local')->put($oldDoc->file_path, 'old ktp content');

    // Can access register form when rejected
    $this->actingAs($user)
        ->get(route('campaigner.register'))
        ->assertOk();

    // Resubmit with new KTP file
    $newKtpFile = UploadedFile::fake()->image('new_ktp.jpg');

    $response = $this->actingAs($user)->post(route('campaigner.register.store'), [
        'type' => 'individu',
        'bank_name' => 'BSI',
        'bank_account_number' => '9876543210',
        'bank_account_name' => $user->name,
        'address' => 'Jl. Kebaikan No. 20 Jakarta',
        'phone' => '08987654321',
        'ktp' => $newKtpFile,
    ]);

    $response->assertRedirect(route('campaigner.status'));

    $profile->refresh();
    expect($profile->verification_status)->toBe('pending');
    expect($profile->bank_name)->toBe('BSI');

    $updatedKtp = $profile->documents()->where('document_type', 'ktp')->first();
    expect($updatedKtp->status)->toBe('pending');
    expect($updatedKtp->notes)->toBeNull();
    Storage::disk('local')->assertExists($updatedKtp->file_path);
});

test('campaigner registration endpoint is rate limited to 6 requests per minute', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 6; $i++) {
        $this->actingAs($user)->post(route('campaigner.register.store'), []);
    }

    $response = $this->actingAs($user)->post(route('campaigner.register.store'), []);
    $response->assertStatus(429);
});

test('smart redirect /campaigner directs users according to their role and status', function () {
    // 1. Guest
    $this->get('/campaigner')
        ->assertRedirect(route('campaigner.register'));

    // 2. Admin
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');
    $this->actingAs($admin)
        ->get('/campaigner')
        ->assertRedirect(route('admin.campaigners.index'));

    // 3. Campaigner with verified profile
    $campaignerUser = User::factory()->create();
    CampaignerProfile::create([
        'user_id' => $campaignerUser->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $campaignerUser->name,
        'address' => 'Jl. Kebaikan No. 1',
        'phone' => '08123456789',
    ]);
    $this->actingAs($campaignerUser)
        ->get('/campaigner')
        ->assertRedirect(route('akun.programs.index'));

    // 4. User with pending profile
    $pendingUser = User::factory()->create();
    CampaignerProfile::create([
        'user_id' => $pendingUser->id,
        'type' => 'individu',
        'verification_status' => 'pending',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $pendingUser->name,
        'address' => 'Jl. Kebaikan No. 1',
        'phone' => '08123456789',
    ]);
    $this->actingAs($pendingUser)
        ->get('/campaigner')
        ->assertRedirect(route('campaigner.status'));

    // 5. Regular donor without profile
    $donor = User::factory()->create();
    $this->actingAs($donor)
        ->get('/campaigner')
        ->assertRedirect(route('campaigner.register'));
});

test('admin cannot register as campaigner and is redirected to admin panel', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    // GET /campaigner/register
    $this->actingAs($admin)
        ->get(route('campaigner.register'))
        ->assertRedirect(route('admin.campaigners.index'))
        ->assertSessionHas('info');

    // POST /campaigner/register
    $this->actingAs($admin)
        ->post(route('campaigner.register.store'), [
            'type' => 'individu',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => $admin->name,
            'address' => 'Jl. Admin No. 1',
            'phone' => '08123456789',
        ])
        ->assertRedirect(route('admin.campaigners.index'))
        ->assertSessionHas('error');
});
