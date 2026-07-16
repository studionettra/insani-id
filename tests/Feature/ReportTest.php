<?php

use App\Models\User;
use App\Models\Donation;
use App\Models\Program;
use App\Models\Category;
use App\Models\Disbursement;
use App\Models\CampaignerProfile;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    Permission::firstOrCreate(['name' => 'report.view']);

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $this->adminRole->givePermissionTo('report.view');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->category = Category::create([
        'name' => 'Kesehatan',
        'slug' => 'kesehatan',
    ]);

    $this->profile = CampaignerProfile::create([
        'user_id' => $this->admin->id,
        'type' => 'individu',
        'nik' => '1234567890123456',
        'address' => 'Test Address',
        'phone_number' => '081234567890',
        'bank_name' => 'BCA',
        'bank_account_name' => 'Test User',
        'bank_account_number' => '1234567890',
        'verification_status' => 'verified',
    ]);

    $this->program = Program::create([
        'title' => 'Test Program',
        'slug' => 'test-program',
        'program_code' => 'PRG-TEST',
        'story' => 'Test Story',
        'created_by' => $this->admin->id,
        'campaigner_profile_id' => $this->profile->id,
        'campaigner_type' => 'App\\Models\\CampaignerProfile',
        'category_id' => $this->category->id,
        'status' => 'published',
        'cover_image' => 'cover.jpg'
    ]);
});

it('allows admin to view reports dashboard', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('admin.reports.index'));

    $response->assertStatus(200);
});

it('allows admin to export donations', function () {
    Donation::create([
        'program_id' => $this->program->id,
        'donation_code' => 'DON-123',
        'amount' => 50000,
        'donor_name' => 'John Doe',
        'donor_email' => 'john@example.com',
        'donor_phone' => '08123',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.reports.donations.export'));

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

it('allows admin to export disbursements', function () {
    Disbursement::create([
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'platform_fee_percent' => 5,
        'platform_fee_amount' => 2500,
        'nett_amount' => 47500,
        'bank_name' => 'BCA',
        'bank_account_number' => '123',
        'bank_account_name' => 'Test',
        'status' => 'transferred',
        'notes' => 'Test Cair',
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.reports.disbursements.export'));

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});
