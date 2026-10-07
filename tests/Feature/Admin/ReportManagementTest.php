<?php

use App\Models\Category;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Fundraiser;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $this->reportPerm = Permission::firstOrCreate(['name' => 'report.view']);
    $this->adminRole->givePermissionTo($this->reportPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
        'slug' => 'kemanusiaan',
        'platform_fee_percent' => 5.0,
    ]);

    $this->program = Program::factory()->published()->create([
        'category_id' => $this->category->id,
        'title' => 'Program Bantuan Air Bersih',
        'slug' => 'program-bantuan-air-bersih',
        'target_amount' => 50000000,
    ]);
});

it('allows authorized admin to view financial report dashboard with accurate metrics', function () {
    // 1. Create a paid donation with Midtrans QRIS fee
    $donation = Donation::create([
        'donation_code' => 'DON-FIN001',
        'program_id' => $this->program->id,
        'donor_name' => 'Budi Donatur',
        'donor_email' => 'budi@example.com',
        'donor_phone' => '081234567890',
        'amount' => 100000,
        'channel' => 'online',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'gateway' => 'midtrans',
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'paid_amount' => 100000,
        'gateway_fee' => 700, // 0.7%
        'gateway_status' => 'PAID',
        'paid_at' => now(),
    ]);

    // 2. Create a transferred disbursement
    Disbursement::create([
        'receipt_number' => 'KUI-202610-001',
        'program_id' => $this->program->id,
        'requested_amount' => 50000,
        'platform_fee_percent' => 5.0,
        'platform_fee_amount' => 2500, // 5%
        'bank_fee' => 2500, // BI-Fast
        'nett_amount' => 45000,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '123456789',
        'bank_account_name' => 'Mitra Penggalang',
        'status' => 'transferred',
        'transferred_at' => now(),
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.reports.index'));

    $response->assertOk();
    $response->assertInertia(function ($page) {
        $page->component('Admin/Reports/Index')
            ->has('financialSummary')
            ->where('financialSummary.total_gross_donations', 100000)
            ->where('financialSummary.total_donations_count', 1)
            ->where('financialSummary.total_gateway_fees', 700)
            ->where('financialSummary.net_collected_donations', 99300)
            ->where('financialSummary.total_disbursed_gross', 50000)
            ->where('financialSummary.total_platform_fees', 2500)
            ->where('financialSummary.total_bank_fees', 2500)
            ->where('financialSummary.total_disbursed_nett', 45000)
            ->has('paymentChannelStats')
            ->has('attributionStats');
    });
});

it('filters financial summary and channels by date range', function () {
    // Donation last month
    $oldDonation = Donation::create([
        'donation_code' => 'DON-OLD',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Lama',
        'donor_email' => 'lama@example.com',
        'donor_phone' => '081234567891',
        'amount' => 200000,
        'channel' => 'online',
        'status' => 'paid',
        'paid_at' => now()->subDays(40),
    ]);
    Payment::create([
        'donation_id' => $oldDonation->id,
        'gateway' => 'midtrans',
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'paid_amount' => 200000,
        'gateway_fee' => 1400,
        'gateway_status' => 'PAID',
        'paid_at' => now()->subDays(40),
    ]);

    // Donation today
    $todayDonation = Donation::create([
        'donation_code' => 'DON-TODAY',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Baru',
        'donor_email' => 'baru@example.com',
        'donor_phone' => '081234567892',
        'amount' => 50000,
        'channel' => 'online',
        'status' => 'paid',
        'paid_at' => now(),
    ]);
    Payment::create([
        'donation_id' => $todayDonation->id,
        'gateway' => 'midtrans',
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS',
        'paid_amount' => 50000,
        'gateway_fee' => 350,
        'gateway_status' => 'PAID',
        'paid_at' => now(),
    ]);

    // Query for 7 days
    $response = $this->actingAs($this->admin)->get(route('admin.reports.index', ['range' => '7d']));

    $response->assertOk();
    $response->assertInertia(function ($page) {
        $page->where('filters.range', '7d')
            ->where('financialSummary.total_gross_donations', 50000)
            ->where('financialSummary.total_gateway_fees', 350)
            ->where('financialSummary.net_collected_donations', 49650);
    });
});

it('includes volunteer fundraiser attribution metrics', function () {
    $volunteer = User::factory()->create(['name' => 'Relawan Hebat']);
    $fundraiser = Fundraiser::create([
        'user_id' => $volunteer->id,
        'program_id' => $this->program->id,
        'referral_code' => 'relawan-hebat-123',
        'target_amount' => 10000000,
        'collected_amount' => 75000,
        'donors_count' => 1,
        'is_active' => true,
    ]);

    Donation::create([
        'donation_code' => 'DON-FUND001',
        'program_id' => $this->program->id,
        'fundraiser_id' => $fundraiser->id,
        'fundraiser_user_id' => $volunteer->id,
        'donor_name' => 'Sahabat Relawan',
        'donor_email' => 'sahabat@example.com',
        'donor_phone' => '081234567893',
        'amount' => 75000,
        'channel' => 'offline',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.reports.index'));

    $response->assertOk();
    $response->assertInertia(function ($page) {
        $page->where('attributionStats.fundraiser.amount', 75000)
            ->where('attributionStats.fundraiser.count', 1)
            ->has('attributionStats.top_fundraisers', 1)
            ->where('attributionStats.top_fundraisers.0.name', 'Relawan Hebat')
            ->where('attributionStats.top_fundraisers.0.referral_code', 'relawan-hebat-123')
            ->where('attributionStats.top_fundraisers.0.total_raised', 75000);
    });
});

it('exports donations CSV with comprehensive financial, gateway fee, and attribution columns', function () {
    $volunteer = User::factory()->create(['name' => 'Siti Relawan']);
    $fundraiser = Fundraiser::create([
        'user_id' => $volunteer->id,
        'program_id' => $this->program->id,
        'referral_code' => 'siti-berbagi',
        'target_amount' => 5000000,
        'collected_amount' => 100000,
        'donors_count' => 1,
        'is_active' => true,
    ]);

    $donation = Donation::create([
        'donation_code' => 'DON-EXPORT-01',
        'program_id' => $this->program->id,
        'fundraiser_id' => $fundraiser->id,
        'donor_name' => 'Ahmad Dermawan',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '081234567894',
        'amount' => 100000,
        'channel' => 'online',
        'status' => 'paid',
        'paid_at' => now(),
        'utm_source' => 'facebook_ads',
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'gateway' => 'midtrans',
        'payment_method' => 'virtual_account',
        'payment_channel' => 'BCA',
        'paid_amount' => 100000,
        'gateway_fee' => 4440, // VA BCA
        'gateway_status' => 'PAID',
        'paid_at' => now(),
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.reports.donations.export'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    ob_start();
    $response->sendContent();
    $csvContent = ob_get_clean();

    expect($csvContent)->toContain('Biaya Payment Gateway');
    expect($csvContent)->toContain('Nominal Bersih Diterima');
    expect($csvContent)->toContain('Atribusi Sumber');
    expect($csvContent)->toContain('Nama Relawan Fundraiser');
    expect($csvContent)->toContain('Kode Referral');
    expect($csvContent)->toContain('DON-EXPORT-01');
    expect($csvContent)->toContain('BCA Virtual Account');
    expect($csvContent)->toContain('4440');
    expect($csvContent)->toContain('95560'); // 100000 - 4440
    expect($csvContent)->toContain('Siti Relawan');
    expect($csvContent)->toContain('siti-berbagi');
});

it('exports disbursements CSV with receipt number, platform fee, and bank fee', function () {
    Disbursement::create([
        'receipt_number' => 'KUI-DISB-999',
        'program_id' => $this->program->id,
        'requested_amount' => 1000000,
        'platform_fee_percent' => 5.0,
        'platform_fee_amount' => 50000,
        'bank_fee' => 2500,
        'nett_amount' => 947500,
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '987654321',
        'bank_account_name' => 'Pengurus Masjid',
        'status' => 'transferred',
        'transferred_at' => now(),
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.reports.disbursements.export'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    ob_start();
    $response->sendContent();
    $csvContent = ob_get_clean();

    expect($csvContent)->toContain('No Kuitansi');
    expect($csvContent)->toContain('Potongan Platform 5%');
    expect($csvContent)->toContain('Biaya Bank BI-Fast');
    expect($csvContent)->toContain('Nominal Bersih Ditransfer');
    expect($csvContent)->toContain('KUI-DISB-999');
    expect($csvContent)->toContain('1000000');
    expect($csvContent)->toContain('50000');
    expect($csvContent)->toContain('947500');
});
