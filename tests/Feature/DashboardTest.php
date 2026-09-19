<?php

use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated user receives platform metrics and role info', function () {
    $user = User::factory()->create();

    $category = Category::create([
        'name' => 'Pendidikan',
        'slug' => 'pendidikan',
        'platform_fee_percent' => 5,
    ]);

    $program = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
        'target_amount' => 1000000,
    ]);

    Donation::factory()->create([
        'program_id' => $program->id,
        'amount' => 500000,
        'status' => 'paid',
        'paid_at' => now(),
        'donor_email' => 'donor@example.com',
    ]);

    $response = $this->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('stats.totalDonations', 500000)
        ->where('stats.activePrograms', 1)
        ->where('stats.totalDonors', 1)
        ->where('campaignerStats', null)
        ->where('userRoleInfo.isCampaigner', false)
        ->where('userRoleInfo.isAdministrator', false)
    );
});

test('campaigner user receives role-specific campaigner stats', function () {
    Role::firstOrCreate(['name' => 'Campaigner Individu', 'guard_name' => 'web']);

    $campaigner = User::factory()->create();
    $campaigner->assignRole('Campaigner Individu');

    CampaignerProfile::create([
        'user_id' => $campaigner->id,
        'type' => 'individu',
        'full_name' => 'Campaigner Budi',
        'identity_number' => '1234567890123456',
        'address' => 'Jl. Merdeka',
        'city' => 'Jakarta',
        'province' => 'DKI Jakarta',
        'postal_code' => '10110',
        'phone' => '08123456789',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Budi',
        'verification_status' => 'verified',
    ]);

    $category = Category::create([
        'name' => 'Kesehatan',
        'slug' => 'kesehatan',
        'platform_fee_percent' => 5,
    ]);

    $myProgram = Program::factory()->create([
        'created_by' => $campaigner->id,
        'category_id' => $category->id,
        'status' => 'published',
        'target_amount' => 2000000,
    ]);

    $otherProgram = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    // Donation for campaigner program
    Donation::factory()->create([
        'program_id' => $myProgram->id,
        'amount' => 300000,
        'status' => 'paid',
        'paid_at' => now(),
        'donor_email' => 'donor1@example.com',
    ]);

    // Donation for other program
    Donation::factory()->create([
        'program_id' => $otherProgram->id,
        'amount' => 700000,
        'status' => 'paid',
        'paid_at' => now(),
        'donor_email' => 'donor2@example.com',
    ]);

    // Transferred disbursement for my program
    Disbursement::create([
        'program_id' => $myProgram->id,
        'requested_amount' => 100000,
        'bank_name' => 'Mandiri',
        'bank_account_number' => '123',
        'bank_account_name' => 'Budi',
        'platform_fee_percent' => 0,
        'platform_fee_amount' => 0,
        'nett_amount' => 100000,
        'status' => 'transferred',
    ]);

    $response = $this->actingAs($campaigner)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRoleInfo.isCampaigner', true)
        ->where('campaignerStats.programsCount', 1)
        ->where('campaignerStats.activeProgramsCount', 1)
        ->where('campaignerStats.totalCollected', 300000)
        ->where('campaignerStats.totalDonors', 1)
        ->where('campaignerStats.totalDisbursed', 100000)
        ->has('campaignerStats.myPrograms', 1)
        ->where('stats.totalDonations', 1000000) // All platform donations: 300k + 700k
    );
});

test('admin user receives administrator role flag', function () {
    Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    $response = $this->actingAs($admin)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRoleInfo.isAdministrator', true)
        ->where('userRoleInfo.isCampaigner', false)
        ->where('campaignerStats', null)
    );
});
