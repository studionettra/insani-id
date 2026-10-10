<?php

namespace Tests\Feature\Admin;

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
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    Permission::firstOrCreate(['name' => 'disbursement.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'program.view', 'guard_name' => 'web']);

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
    $this->adminRole->givePermissionTo(['disbursement.create', 'program.view']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->category = Category::create([
        'name' => 'Pendidikan',
        'slug' => 'pendidikan',
        'platform_fee_percent' => 5.0,
    ]);

    // Program Internal Yayasan (campaigner_type = 'internal', campaigner_profile_id = null)
    $this->internalProgram = Program::factory()->create([
        'program_code' => 'PRG-INT-001',
        'title' => 'Program Internal Yayasan Insani',
        'slug' => 'program-internal-yayasan-insani',
        'story' => 'Program sosial inisiatif internal.',
        'target_amount' => 10000000,
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'internal',
        'campaigner_profile_id' => null,
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    // Donasi terkumpul Rp 2.000.000
    Donation::create([
        'donation_code' => 'DON-INT-001',
        'program_id' => $this->internalProgram->id,
        'amount' => 2000000,
        'status' => 'paid',
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'online',
    ]);
});

test('unauthorized user cannot access internal disbursement form', function () {
    $regularUser = User::factory()->create();

    $response = $this->actingAs($regularUser)
        ->get(route('admin.programs.disbursements.create', $this->internalProgram->id));

    $response->assertStatus(403);
});

test('admin can view internal disbursement form for internal program', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('admin.programs.disbursements.create', $this->internalProgram->id));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Programs/Disbursements/Create')
        ->has('program')
        ->where('metrics.total_collected', 2000000)
        ->where('metrics.available_balance', 2000000)
    );
});

test('cannot access internal disbursement form for non-internal program', function () {
    $partnerProgram = Program::factory()->create([
        'program_code' => 'PRG-PARTNER-001',
        'title' => 'Program Mitra',
        'slug' => 'program-mitra',
        'story' => 'Story mitra',
        'target_amount' => 5000000,
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'individu',
        'status' => 'published',
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.programs.disbursements.create', $partnerProgram->id));

    $response->assertStatus(403);
});

test('fails validation when requested amount exceeds available balance', function () {
    $response = $this->actingAs($this->admin)
        ->post(route('admin.programs.disbursements.store', $this->internalProgram->id), [
            'requested_amount' => 3000000, // Available only 2.000.000
            'disbursement_type' => 'vendor',
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '1400012345678',
            'bank_account_name' => 'CV Logistik Peduli',
            'distribution_plan' => 'Pengadaan logistik sembako',
            'beneficiary_target' => 'Warga terdampak',
            'location' => 'Bekasi',
            'estimated_distribution_date' => now()->format('Y-m-d'),
        ]);

    $response->assertSessionHasErrors(['requested_amount']);
});

test('admin can record internal disbursement with direct transfer proof successfully', function () {
    Storage::fake('local');

    $docFile = UploadedFile::fake()->create('rab_operasional.pdf', 300, 'application/pdf');
    $proofFile = UploadedFile::fake()->image('bukti_transfer.jpg');

    $response = $this->actingAs($this->admin)
        ->post(route('admin.programs.disbursements.store', $this->internalProgram->id), [
            'requested_amount' => 1500000,
            'disbursement_type' => 'field_team',
            'bank_name' => 'Bank Syariah Indonesia (BSI)',
            'bank_account_number' => '7112233445',
            'bank_account_name' => 'Yayasan Insani Distribusi Lapangan',
            'distribution_plan' => 'Penyaluran tahap 1 paket sembako untuk 50 dhuafa.',
            'beneficiary_target' => '50 Keluarga Pra-sejahtera',
            'location' => 'Kecamatan Cilincing, Jakarta Utara',
            'estimated_distribution_date' => now()->addDays(2)->format('Y-m-d'),
            'notes' => 'Penyaluran tahap 1 sembako.',
            'supporting_document' => $docFile,
            'is_direct_transferred' => true,
            'transfer_proof' => $proofFile,
        ]);

    $response->assertRedirect(route('admin.programs.show', [
        'program' => $this->internalProgram->id,
        'tab' => 'finances',
    ]));

    $disbursement = Disbursement::where('program_id', $this->internalProgram->id)->first();

    expect($disbursement)->not->toBeNull();
    expect((float) $disbursement->requested_amount)->toBe(1500000.0);
    // Platform fee MUST be 0.0 for internal program
    expect((float) $disbursement->platform_fee_percent)->toBe(0.0);
    expect((float) $disbursement->platform_fee_amount)->toBe(0.0);
    expect((float) $disbursement->bank_fee)->toBe(0.0);
    expect((float) $disbursement->nett_amount)->toBe(1500000.0);
    // Status should be transferred because is_direct_transferred is true
    expect($disbursement->status)->toBe('transferred');
    expect($disbursement->approved_by)->toBe($this->admin->id);
    expect($disbursement->receipt_number)->toStartWith('KW-DISB-');
    expect($disbursement->transfer_proof)->not->toBeNull();
    expect($disbursement->supporting_document)->not->toBeNull();

    // Pastikan berkas tersimpan di disk local
    Storage::disk('local')->assertExists($disbursement->supporting_document);
    Storage::disk('local')->assertExists($disbursement->transfer_proof);
});

test('admin can record internal disbursement without direct transfer (approved status)', function () {
    Storage::fake('local');

    $docFile = UploadedFile::fake()->create('rab_kegiatan.pdf', 200, 'application/pdf');

    $response = $this->actingAs($this->admin)
        ->post(route('admin.programs.disbursements.store', $this->internalProgram->id), [
            'requested_amount' => 500000,
            'disbursement_type' => 'vendor',
            'bank_name' => 'BCA',
            'bank_account_number' => '8899001122',
            'bank_account_name' => 'Mitra Logistik',
            'distribution_plan' => 'Uang muka sewa armada logistik.',
            'beneficiary_target' => 'Armada Distribusi Bencana',
            'location' => 'Gudang Logistik',
            'estimated_distribution_date' => now()->addDay()->format('Y-m-d'),
            'notes' => 'Uang muka sewa armada.',
            'supporting_document' => $docFile,
            'is_direct_transferred' => false,
        ]);

    $response->assertRedirect(route('admin.programs.show', [
        'program' => $this->internalProgram->id,
        'tab' => 'finances',
    ]));

    $disbursement = Disbursement::where('program_id', $this->internalProgram->id)->first();

    expect($disbursement)->not->toBeNull();
    expect($disbursement->status)->toBe('approved');
    expect($disbursement->approved_by)->toBe($this->admin->id);
    expect($disbursement->transferred_at)->toBeNull();
});
