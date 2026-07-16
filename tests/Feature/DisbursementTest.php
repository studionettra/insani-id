<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Program;
use App\Models\Donation;
use App\Models\Category;
use App\Models\CampaignerProfile;
use App\Models\Disbursement;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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
        'status' => 'active',
        'cover_image' => 'cover.jpg'
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
