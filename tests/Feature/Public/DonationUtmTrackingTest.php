<?php

use App\Models\Category;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
        'slug' => 'kemanusiaan',
        'platform_fee_percent' => 5.0,
    ]);

    $this->program = Program::factory()->published()->create([
        'category_id' => $this->category->id,
        'title' => 'Bantu Korban Bencana Alam',
        'slug' => 'bantu-korban-bencana-alam',
        'target_amount' => 50000000,
    ]);
});

it('captures UTM parameters in session when visiting with query string', function () {
    $response = $this->get('/program/'.$this->program->slug.'?utm_source=instagram&utm_medium=social_bio&utm_campaign=ramadhan2026');
    $response->assertOk();

    expect(session('utm_source'))->toBe('instagram');
    expect(session('utm_medium'))->toBe('social_bio');
    expect(session('utm_campaign'))->toBe('ramadhan2026');
});

it('persists captured session UTM parameters into donation record upon store', function () {
    // 1. Visit with UTM params to set session
    $this->get('/program/'.$this->program->slug.'?utm_source=facebook&utm_medium=cpc&utm_campaign=sedekah_subuh');

    // 2. Submit donation without explicit form UTM inputs
    $response = $this->post(route('donation.store', $this->program->slug), [
        'amount' => 50000,
        'donor_name' => 'Ahmad Donatur',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '081234567890',
        'channel' => 'offline',
        'payment_channel' => 'MANUAL_BSI',
    ]);

    $response->assertRedirect();

    $donation = Donation::where('donor_email', 'ahmad@example.com')->first();
    expect($donation)->not->toBeNull();
    expect($donation->utm_source)->toBe('facebook');
    expect($donation->utm_medium)->toBe('cpc');
    expect($donation->utm_campaign)->toBe('sedekah_subuh');
});

it('allows explicit UTM parameters passed in the donation form request', function () {
    $response = $this->post(route('donation.store', $this->program->slug), [
        'amount' => 75000,
        'donor_name' => 'Fatimah',
        'donor_email' => 'fatimah@example.com',
        'donor_phone' => '081987654321',
        'channel' => 'offline',
        'payment_channel' => 'MANUAL_BSI',
        'utm_source' => 'whatsapp_broadcast',
        'utm_medium' => 'share_button',
        'utm_campaign' => 'yatim_dhuafa',
    ]);

    $response->assertRedirect();

    $donation = Donation::where('donor_email', 'fatimah@example.com')->first();
    expect($donation)->not->toBeNull();
    expect($donation->utm_source)->toBe('whatsapp_broadcast');
    expect($donation->utm_medium)->toBe('share_button');
    expect($donation->utm_campaign)->toBe('yatim_dhuafa');
});

it('includes UTM attribution columns in admin donation report CSV export', function () {
    $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $reportPerm = Permission::firstOrCreate(['name' => 'report.view']);
    $adminRole->givePermissionTo($reportPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    Donation::create([
        'donation_code' => 'DON-TESTUTM1',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Beriklan',
        'donor_email' => 'ads@example.com',
        'donor_phone' => '081234567890',
        'amount' => 100000,
        'channel' => 'online',
        'status' => 'paid',
        'paid_at' => now(),
        'utm_source' => 'tiktok_ads',
        'utm_medium' => 'video',
        'utm_campaign' => 'peduli_sesama',
    ]);

    $response = $this->actingAs($admin)->get('/admin/reports/donations/export');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    // Streamed CSV content check
    ob_start();
    $response->sendContent();
    $csvContent = ob_get_clean();

    expect($csvContent)->toContain('Sumber (UTM Source)');
    expect($csvContent)->toContain('Kampanye (UTM Campaign)');
    expect($csvContent)->toContain('tiktok_ads');
    expect($csvContent)->toContain('peduli_sesama');
});
