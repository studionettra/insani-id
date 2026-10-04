<?php

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
    Storage::fake('local');
    Storage::fake('public');

    Role::firstOrCreate(['name' => 'Administrator']);
    Permission::firstOrCreate(['name' => 'disbursement.view']);

    $this->category = Category::factory()->create([
        'platform_fee_percent' => 5,
    ]);

    $this->campaignerUser = User::factory()->create();
    $this->campaignerProfile = CampaignerProfile::create([
        'user_id' => $this->campaignerUser->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $this->campaignerUser->name,
    ]);

    $this->program = Program::factory()->create([
        'category_id' => $this->category->id,
        'created_by' => $this->campaignerUser->id,
        'campaigner_profile_id' => $this->campaignerProfile->id,
        'campaigner_type' => 'user',
        'status' => 'published',
        'target_amount' => 10000000,
        'collected_amount' => 5000000,
    ]);

    // Provide collected balance for withdrawal
    Donation::create([
        'donation_code' => 'DON-DISB-FUND',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Utama',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'amount' => 5000000,
        'channel' => 'online',
        'status' => 'paid',
    ]);
});

test('disbursement supporting document is stored on local private disk', function () {
    $file = UploadedFile::fake()->create('rab_proposal.pdf', 500, 'application/pdf');

    $response = $this->actingAs($this->campaignerUser)->post(
        route('akun.programs.disbursements.store', $this->program->id),
        [
            'requested_amount' => 1000000,
            'distribution_plan' => 'Bantuan sembako dan logistik lansia dhuafa.',
            'beneficiary_target' => '50 Lansia',
            'location' => 'Kelurahan Sukamaju',
            'estimated_distribution_date' => now()->addDays(7)->format('Y-m-d'),
            'supporting_document' => $file,
        ]
    );

    $response->assertRedirect();

    $disbursement = Disbursement::where('program_id', $this->program->id)->first();
    expect($disbursement)->not->toBeNull();
    expect($disbursement->supporting_document)->not->toBeNull();

    // Verify it is on local disk and NOT on public disk
    Storage::disk('local')->assertExists($disbursement->supporting_document);
    Storage::disk('public')->assertMissing($disbursement->supporting_document);
});

test('campaigner can view their own disbursement supporting document and transfer proof', function () {
    $docPath = UploadedFile::fake()->create('rab.pdf', 300, 'application/pdf')->store('disbursements/documents', 'local');
    $proofPath = UploadedFile::fake()->image('transfer.jpg')->store('disbursements/proofs', 'local');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 1000000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $this->campaignerUser->name,
        'platform_fee_percent' => 5,
        'platform_fee_amount' => 50000,
        'bank_fee' => 2500,
        'nett_amount' => 947500,
        'supporting_document' => $docPath,
        'transfer_proof' => $proofPath,
        'status' => 'transferred',
    ]);

    // Campaigner views supporting document
    $docResponse = $this->actingAs($this->campaignerUser)->get(
        route('akun.programs.disbursements.supporting-document', [$this->program->id, $disbursement->id])
    );
    $docResponse->assertOk();

    // Campaigner views transfer proof
    $proofResponse = $this->actingAs($this->campaignerUser)->get(
        route('akun.programs.disbursements.proof', [$this->program->id, $disbursement->id])
    );
    $proofResponse->assertOk();
});

test('unauthorized campaigner cannot access another campaigners disbursement files', function () {
    $otherUser = User::factory()->create();
    CampaignerProfile::create([
        'user_id' => $otherUser->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BCA',
        'bank_account_number' => '9876543210',
        'bank_account_name' => $otherUser->name,
    ]);

    $docPath = UploadedFile::fake()->create('rab.pdf', 300, 'application/pdf')->store('disbursements/documents', 'local');
    $proofPath = UploadedFile::fake()->image('transfer.jpg')->store('disbursements/proofs', 'local');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 1000000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $this->campaignerUser->name,
        'platform_fee_percent' => 5,
        'platform_fee_amount' => 50000,
        'bank_fee' => 2500,
        'nett_amount' => 947500,
        'supporting_document' => $docPath,
        'transfer_proof' => $proofPath,
        'status' => 'transferred',
    ]);

    // Unauthorized campaigner tries to access supporting document -> 403
    $docResponse = $this->actingAs($otherUser)->get(
        route('akun.programs.disbursements.supporting-document', [$this->program->id, $disbursement->id])
    );
    $docResponse->assertForbidden();

    // Unauthorized campaigner tries to access transfer proof -> 403
    $proofResponse = $this->actingAs($otherUser)->get(
        route('akun.programs.disbursements.proof', [$this->program->id, $disbursement->id])
    );
    $proofResponse->assertForbidden();
});

test('admin with disbursement.view permission can view disbursement files', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');
    $admin->givePermissionTo('disbursement.view');

    $docPath = UploadedFile::fake()->create('rab.pdf', 300, 'application/pdf')->store('disbursements/documents', 'local');
    $proofPath = UploadedFile::fake()->image('transfer.jpg')->store('disbursements/proofs', 'local');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 1000000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $this->campaignerUser->name,
        'platform_fee_percent' => 5,
        'platform_fee_amount' => 50000,
        'bank_fee' => 2500,
        'nett_amount' => 947500,
        'supporting_document' => $docPath,
        'transfer_proof' => $proofPath,
        'status' => 'transferred',
    ]);

    // Admin views supporting document
    $docResponse = $this->actingAs($admin)->get(
        route('admin.disbursements.supporting-document', $disbursement->id)
    );
    $docResponse->assertOk();

    // Admin views transfer proof
    $proofResponse = $this->actingAs($admin)->get(
        route('admin.disbursements.proof', $disbursement->id)
    );
    $proofResponse->assertOk();
});

test('stranger without disbursement permission cannot access admin disbursement file routes', function () {
    $stranger = User::factory()->create();

    $docPath = UploadedFile::fake()->create('rab.pdf', 300, 'application/pdf')->store('disbursements/documents', 'local');

    $disbursement = Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 1000000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $this->campaignerUser->name,
        'platform_fee_percent' => 5,
        'platform_fee_amount' => 50000,
        'bank_fee' => 2500,
        'nett_amount' => 947500,
        'supporting_document' => $docPath,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($stranger)->get(
        route('admin.disbursements.supporting-document', $disbursement->id)
    );
    $response->assertForbidden();
});
