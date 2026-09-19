<?php

namespace Tests\Feature;

use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->campaigner = User::factory()->create();
    $this->profile = CampaignerProfile::create([
        'user_id' => $this->campaigner->id,
        'type' => 'individu',
        'full_name' => 'Test Campaigner',
        'identity_number' => '1234567890123456',
        'address' => 'Test',
        'city' => 'Test',
        'province' => 'Test',
        'postal_code' => '12345',
        'phone' => '08123456789',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Test Campaigner',
        'verification_status' => 'verified',
    ]);

    Permission::firstOrCreate(['name' => 'program.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'program.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'program.update', 'guard_name' => 'web']);

    $this->campaignerRole = Role::firstOrCreate(['name' => 'Campaigner', 'guard_name' => 'web']);
    $this->campaignerRole->givePermissionTo(['program.view', 'program.create', 'program.update']);
    $this->campaigner->assignRole('Campaigner');

    $this->category = Category::create([
        'name' => 'Zakat',
        'slug' => 'zakat',
        'platform_fee_percent' => 5.0,
    ]);

    $this->program = Program::factory()->create([
        'program_code' => 'PRG-1',
        'title' => 'Test Program',
        'slug' => 'test-program',
        'story' => 'Test',
        'target_amount' => 10000000,
        'category_id' => $this->category->id,
        'created_by' => $this->campaigner->id,
        'campaigner_type' => 'individu',
        'campaigner_profile_id' => $this->profile->id,
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    Donation::create([
        'donation_code' => 'DON-1',
        'program_id' => $this->program->id,
        'amount' => 100000,
        'status' => 'paid',
        'donor_name' => 'Donor',
        'donor_email' => 'a@b.com',
        'donor_phone' => '081',
        'channel' => 'online',
    ]);
});

test('campaigner can view disbursements page', function () {
    $response = $this->actingAs($this->campaigner)
        ->get(route('akun.programs.disbursements.index', $this->program->id));

    $response->assertStatus(200);
});

test('campaigner can view program saya page', function () {
    $response = $this->actingAs($this->campaigner)
        ->get(route('akun.programs.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Akun/Program/Index')
        ->has('programs.data')
    );
});

test('campaigner can view program detail page', function () {
    $response = $this->actingAs($this->campaigner)
        ->get(route('akun.programs.show', $this->program->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Akun/Program/Show')
        ->has('program')
    );
});

test('cannot withdraw more than available balance', function () {
    $response = $this->actingAs($this->campaigner)
        ->post(route('akun.programs.disbursements.store', $this->program->id), [
            'requested_amount' => 150000, // Available is 100000
        ]);

    $response->assertSessionHasErrors('requested_amount');
});

test('cannot withdraw less than 10000', function () {
    $response = $this->actingAs($this->campaigner)
        ->post(route('akun.programs.disbursements.store', $this->program->id), [
            'requested_amount' => 5000,
        ]);

    $response->assertSessionHasErrors('requested_amount');
});

test('can withdraw valid amount and fee is calculated', function () {
    $response = $this->actingAs($this->campaigner)
        ->post(route('akun.programs.disbursements.store', $this->program->id), [
            'requested_amount' => 50000,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('disbursements', [
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'platform_fee_percent' => 5.0,
        'platform_fee_amount' => 2500, // 5% of 50000
        'nett_amount' => 47500,
        'status' => 'pending',
    ]);
});

test('admin keuangan can approve and transfer disbursement', function () {
    $admin = User::factory()->create();

    Permission::firstOrCreate(['name' => 'dashboard.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'disbursement.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'disbursement.approve', 'guard_name' => 'web']);

    $role = Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    $role->givePermissionTo(['dashboard.view', 'disbursement.view', 'disbursement.approve']);
    $admin->assignRole('Keuangan');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 50000,
        'status' => 'pending',
    ]);

    // Test Approve
    $response = $this->actingAs($admin)
        ->put(route('admin.disbursements.update-status', $disbursement->id), [
            'status' => 'approved',
        ]);

    $response->assertRedirect();
    $this->assertEquals('approved', $disbursement->fresh()->status);
    $this->assertEquals($admin->id, $disbursement->fresh()->approved_by);

    // Test Transfer
    Storage::fake('public');
    $file = UploadedFile::fake()->image('proof.jpg');

    $response2 = $this->actingAs($admin)
        ->put(route('admin.disbursements.update-status', $disbursement->id), [
            'status' => 'transferred',
            'transfer_proof' => $file,
        ]);

    $response2->assertRedirect();
    $this->assertEquals('transferred', $disbursement->fresh()->status);
    $this->assertNotNull($disbursement->fresh()->transfer_proof);
});

test('admin with permission can list disbursements and filter by status', function () {
    $admin = User::factory()->create();
    Permission::firstOrCreate(['name' => 'disbursement.view', 'guard_name' => 'web']);
    $role = Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    $role->givePermissionTo(['disbursement.view']);
    $admin->assignRole('Keuangan');

    Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 20000,
        'bank_name' => 'BCA',
        'bank_account_number' => '123',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 20000,
        'status' => 'pending',
    ]);

    Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 30000,
        'bank_name' => 'BCA',
        'bank_account_number' => '456',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 30000,
        'status' => 'approved',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.disbursements.index', ['status' => 'pending']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Disbursements/Index')
        ->has('disbursements.data', 1)
        ->where('filters.status', 'pending')
    );
});

test('admin with permission can view disbursement show page', function () {
    $admin = User::factory()->create();
    Permission::firstOrCreate(['name' => 'disbursement.view', 'guard_name' => 'web']);
    $role = Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    $role->givePermissionTo(['disbursement.view']);
    $admin->assignRole('Keuangan');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 50000,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.disbursements.show', $disbursement->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Disbursements/Show')
        ->has('disbursement')
    );
});

test('admin keuangan can reject disbursement with reason', function () {
    $admin = User::factory()->create();
    Permission::firstOrCreate(['name' => 'disbursement.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'disbursement.approve', 'guard_name' => 'web']);
    $role = Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    $role->givePermissionTo(['disbursement.view', 'disbursement.approve']);
    $admin->assignRole('Keuangan');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 50000,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.disbursements.update-status', $disbursement->id), [
            'status' => 'rejected',
            'rejection_reason' => 'Rekening bank tidak sesuai dengan identitas penggalang dana.',
        ]);

    $response->assertRedirect();
    $disbursement->refresh();
    expect($disbursement->status)->toBe('rejected')
        ->and($disbursement->approved_by)->toBe($admin->id)
        ->and($disbursement->rejection_reason)->toBe('Rekening bank tidak sesuai dengan identitas penggalang dana.');
});

test('rejecting disbursement requires rejection_reason', function () {
    $admin = User::factory()->create();
    Permission::firstOrCreate(['name' => 'disbursement.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'disbursement.approve', 'guard_name' => 'web']);
    $role = Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    $role->givePermissionTo(['disbursement.view', 'disbursement.approve']);
    $admin->assignRole('Keuangan');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 50000,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.disbursements.update-status', $disbursement->id), [
            'status' => 'rejected',
        ]);

    $response->assertSessionHasErrors(['rejection_reason']);
});

test('cannot approve disbursement if its status is not pending', function () {
    $admin = User::factory()->create();
    Permission::firstOrCreate(['name' => 'disbursement.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'disbursement.approve', 'guard_name' => 'web']);
    $role = Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    $role->givePermissionTo(['disbursement.view', 'disbursement.approve']);
    $admin->assignRole('Keuangan');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 50000,
        'status' => 'approved',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.disbursements.update-status', $disbursement->id), [
            'status' => 'approved',
        ]);

    $response->assertSessionHas('error', 'Hanya pengajuan pending yang bisa disetujui.');
});

test('cannot transfer disbursement if its status is not approved', function () {
    $admin = User::factory()->create();
    Permission::firstOrCreate(['name' => 'disbursement.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'disbursement.approve', 'guard_name' => 'web']);
    $role = Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    $role->givePermissionTo(['disbursement.view', 'disbursement.approve']);
    $admin->assignRole('Keuangan');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234',
        'bank_account_name' => 'Test',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 50000,
        'status' => 'pending',
    ]);

    Storage::fake('public');
    $file = UploadedFile::fake()->image('proof.jpg');

    $response = $this->actingAs($admin)
        ->put(route('admin.disbursements.update-status', $disbursement->id), [
            'status' => 'transferred',
            'transfer_proof' => $file,
        ]);

    $response->assertSessionHas('error', 'Pencairan harus disetujui terlebih dahulu sebelum ditransfer.');
});

test('user without disbursement permissions cannot access admin disbursements', function () {
    $regularUser = User::factory()->create();

    $response = $this->actingAs($regularUser)
        ->get(route('admin.disbursements.index'));

    $response->assertForbidden();
});
