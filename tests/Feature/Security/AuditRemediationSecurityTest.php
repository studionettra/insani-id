<?php

use App\Models\BankAccount;
use App\Models\Category;
use App\Models\Donation;
use App\Models\FinancialReport;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');

    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);

    $category = Category::factory()->create();
    $this->program = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
    ]);
});

test('staf with only user.view cannot create or update users or escalate privileges', function () {
    $viewer = User::factory()->create();
    $viewer->assignRole('Program Officer'); // has dashboard.view, not user.create/update
    $viewer->givePermissionTo('user.view');

    $targetUser = User::factory()->create();

    // 1. Attempt to create user with user.view only -> 403
    $this->actingAs($viewer)
        ->post('/admin/users', [
            'name' => 'Attacker Created',
            'email' => 'created@example.com',
            'password' => 'SecurePass123!@#',
            'password_confirmation' => 'SecurePass123!@#',
            'role' => 'Administrator',
        ])
        ->assertForbidden();

    // 2. Attempt to update user with user.view only -> 403
    $this->actingAs($viewer)
        ->put("/admin/users/{$targetUser->id}", [
            'name' => 'Hacked Name',
            'email' => 'hacked@example.com',
            'role' => 'Administrator',
        ])
        ->assertForbidden();
});

test('non-administrator user with user.create or user.update cannot assign Administrator role', function () {
    $manager = User::factory()->create();
    $manager->assignRole('Program Officer');
    $manager->givePermissionTo(['user.create', 'user.update', 'user.view']);

    $targetUser = User::factory()->create();

    // Cannot create user with Administrator role
    $this->actingAs($manager)
        ->post('/admin/users', [
            'name' => 'Escalated User',
            'email' => 'escalated@example.com',
            'password' => 'SecurePass123!@#',
            'password_confirmation' => 'SecurePass123!@#',
            'role' => 'Administrator',
        ])
        ->assertForbidden();

    // Cannot promote user to Administrator
    $this->actingAs($manager)
        ->put("/admin/users/{$targetUser->id}", [
            'name' => $targetUser->name,
            'email' => $targetUser->email,
            'role' => 'Administrator',
        ])
        ->assertForbidden();
});

test('user with only donation.view or settings.view cannot mutate bank accounts', function () {
    $viewer = User::factory()->create();
    $viewer->assignRole('Eksekutif'); // has donation.view, report.view, etc.
    $viewer->givePermissionTo('settings.view');

    $bank = BankAccount::create([
        'bank_name' => 'Bank Syariah Indonesia',
        'bank_code' => 'BSI',
        'account_number' => '7132195026',
        'account_name' => 'Yayasan Peduli Insani',
        'bank_type' => 'syariah',
        'is_active' => true,
    ]);

    // Index is accessible
    $this->actingAs($viewer)
        ->get('/admin/bank-accounts')
        ->assertOk();

    // Store is blocked
    $this->actingAs($viewer)
        ->post('/admin/bank-accounts', [
            'bank_name' => 'Bank Penipu',
            'account_number' => '1234567890',
            'account_name' => 'Penyerang',
            'bank_type' => 'konvensional',
        ])
        ->assertForbidden();

    // Update is blocked
    $this->actingAs($viewer)
        ->put("/admin/bank-accounts/{$bank->id}", [
            'bank_name' => 'Bank Dirubah',
            'account_number' => '9999999999',
            'account_name' => 'Penyerang',
            'bank_type' => 'syariah',
        ])
        ->assertForbidden();

    // Toggle is blocked
    $this->actingAs($viewer)
        ->patch("/admin/bank-accounts/{$bank->id}/toggle")
        ->assertForbidden();

    // Delete is blocked
    $this->actingAs($viewer)
        ->delete("/admin/bank-accounts/{$bank->id}")
        ->assertForbidden();
});

test('user with only report.view cannot delete or alter financial reports', function () {
    $viewer = User::factory()->create();
    $viewer->assignRole('Eksekutif'); // has report.view

    $report = FinancialReport::create([
        'title' => ['id' => 'Laporan Tahunan 2025'],
        'report_year' => 2025,
        'category' => 'audited_financial',
        'is_active' => true,
    ]);

    // View index is OK
    $this->actingAs($viewer)
        ->get('/admin/financial-reports')
        ->assertOk();

    // Delete is blocked
    $this->actingAs($viewer)
        ->delete("/admin/financial-reports/{$report->id}")
        ->assertForbidden();

    // Update settings is blocked
    $this->actingAs($viewer)
        ->post('/admin/financial-reports/settings', [
            'financial_report_notice_enabled' => '1',
        ])
        ->assertForbidden();
});

test('unauthenticated guest without session or signature cannot cancel pending donation', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-TESTGUEST1',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Tamu',
        'donor_email' => 'tamu@example.com',
        'donor_phone' => '081234567890',
        'amount' => 100000,
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

    // Blind POST to cancel by unauthorized guest -> 403
    $this->post("/donasi/{$donation->donation_code}/batal")
        ->assertForbidden();

    expect($donation->fresh()->status)->toBe('pending');

    // With session ownership -> 302 redirect with success
    $this->withSession(["donation_owner_{$donation->donation_code}" => true])
        ->post("/donasi/{$donation->donation_code}/batal")
        ->assertRedirect("/donasi/status/{$donation->donation_code}");

    expect($donation->fresh()->status)->toBe('cancelled');
});

test('public donation lookup masks anonymous donor name and strips donor phone number', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-SECRETANON',
        'program_id' => $this->program->id,
        'donor_name' => 'Budi Rahasia',
        'donor_email' => 'budirahardjo@example.com',
        'donor_phone' => '081299998888',
        'is_anonymous' => true,
        'amount' => 250000,
        'channel' => 'offline',
        'status' => 'paid',
    ]);

    // 1. Search with plain email returns donations with masked data and NO donor_phone
    $response = $this->get('/cek-donasi?q=budirahardjo@example.com');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Donation/Lookup')
        ->has('donations.data', 1)
        ->where('donations.data.0.donor_name', 'Inisiator Kebaikan')
        ->missing('donations.data.0.donor_phone')
        ->where('donations.data.0.donor_email', 'bu**********@example.com')
    );

    // 2. Querying by exact donation code returns direct status redirection
    $responseCode = $this->get('/cek-donasi?q=DON-SECRETANON');
    $responseCode->assertRedirect('/donasi/status/DON-SECRETANON');
});

test('receipt renders local QR code data URI and does not leak to api.qrserver.com', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-RECEIPT-OK',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Kuitansi',
        'donor_email' => 'kuitansi@example.com',
        'donor_phone' => '081234567890',
        'amount' => 1000000,
        'channel' => 'offline',
        'status' => 'paid',
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PAID',
    ]);

    $response = $this->get("/donasi/kuitansi/{$donation->donation_code}");
    $response->assertOk();
    $response->assertDontSee('api.qrserver.com');
    $response->assertSee('data:image/svg+xml;base64,');
});
