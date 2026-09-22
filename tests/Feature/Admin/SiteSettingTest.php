<?php

use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $settingsViewPerm = Permission::firstOrCreate(['name' => 'settings.view']);
    $settingsUpdatePerm = Permission::firstOrCreate(['name' => 'settings.update']);

    $this->adminRole->givePermissionTo([$settingsViewPerm, $settingsUpdatePerm]);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->regularUser = User::factory()->create();
});

it('allows administrator to access site settings page', function () {
    actingAs($this->admin)
        ->get(route('admin.site-settings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/SiteSettings/Index'));
});

it('forbids unauthorized users from accessing site settings page', function () {
    actingAs($this->regularUser)
        ->get(route('admin.site-settings.index'))
        ->assertForbidden();
});

it('allows administrator to update contact and social media settings', function () {
    Storage::fake('public');

    $qrisFile = UploadedFile::fake()->image('qris.png');

    actingAs($this->admin)
        ->post(route('admin.site-settings.update'), [
            'contact_whatsapp' => '081299887766',
            'contact_email' => 'info@insani.id',
            'contact_address' => 'Gedung Kebaikan Lantai 2, Jakarta Selatan',
            'social_instagram' => 'https://instagram.com/insani_official',
            'social_facebook' => 'https://facebook.com/insani_official',
            'social_youtube' => 'https://youtube.com/@insani_channel',
            'social_x' => 'https://x.com/insani_id',
            'social_threads' => 'https://threads.net/@insani_id',
            'footer_description' => 'Yayasan resmi penyalur bantuan kemanusiaan.',
            'qris_image' => $qrisFile,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(AppSetting::get('contact_whatsapp'))->toBe('081299887766');
    expect(AppSetting::get('contact_email'))->toBe('info@insani.id');
    expect(AppSetting::get('contact_address'))->toBe('Gedung Kebaikan Lantai 2, Jakarta Selatan');
    expect(AppSetting::get('social_instagram'))->toBe('https://instagram.com/insani_official');
    expect(AppSetting::get('footer_description'))->toBe('Yayasan resmi penyalur bantuan kemanusiaan.');

    $qrisPath = AppSetting::get('qris_image');
    expect($qrisPath)->not->toBeNull();
    Storage::disk('public')->assertExists($qrisPath);
});

it('allows administrator to update tracking and analytics pixel settings', function () {
    actingAs($this->admin)
        ->post(route('admin.site-settings.update'), [
            'google_tag_manager_id' => 'GTM-TEST1234',
            'google_analytics_id' => 'G-ABC123XYZ',
            'meta_pixel_id' => '9876543210',
            'tiktok_pixel_id' => 'TIKTOK12345',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(AppSetting::get('google_tag_manager_id'))->toBe('GTM-TEST1234');
    expect(AppSetting::get('google_analytics_id'))->toBe('G-ABC123XYZ');
    expect(AppSetting::get('meta_pixel_id'))->toBe('9876543210');
    expect(AppSetting::get('tiktok_pixel_id'))->toBe('TIKTOK12345');
});

it('allows administrator to update google adsense and ads.txt settings', function () {
    actingAs($this->admin)
        ->post(route('admin.site-settings.update'), [
            'adsense_enabled' => '1',
            'google_adsense_client_id' => 'ca-pub-9998887776665554',
            'adsense_slot_blog_index' => '111222333',
            'adsense_slot_article_top' => '222333444',
            'adsense_slot_article_middle' => '333444555',
            'adsense_slot_article_bottom' => '444555666',
            'ads_txt_content' => 'google.com, pub-9998887776665554, DIRECT, f08c47fec0942fa0',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(AppSetting::get('adsense_enabled'))->toBe('1');
    expect(AppSetting::get('google_adsense_client_id'))->toBe('ca-pub-9998887776665554');
    expect(AppSetting::get('adsense_slot_blog_index'))->toBe('111222333');
    expect(AppSetting::get('adsense_slot_article_top'))->toBe('222333444');
    expect(AppSetting::get('adsense_slot_article_middle'))->toBe('333444555');
    expect(AppSetting::get('adsense_slot_article_bottom'))->toBe('444555666');
    expect(AppSetting::get('ads_txt_content'))->toBe('google.com, pub-9998887776665554, DIRECT, f08c47fec0942fa0');
});

it('allows administrator to update foundation legal and sk kemenkumham settings', function () {
    actingAs($this->admin)
        ->post(route('admin.site-settings.update'), [
            'legal_foundation_name' => 'Yayasan Insani Sejahtera Abadi',
            'legal_sk_kemenkumham' => 'AHU-0009999.AH.01.04.Tahun 2026',
            'legal_sk_label' => 'SK Kemenkumham RI Baru',
            'legal_operational_permit' => 'KEMENSOS/PUB/2026/01',
            'legal_npwp' => '12.345.678.9-012.000',
            'show_sk_in_footer' => '1',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(AppSetting::get('legal_foundation_name'))->toBe('Yayasan Insani Sejahtera Abadi');
    expect(AppSetting::get('legal_sk_kemenkumham'))->toBe('AHU-0009999.AH.01.04.Tahun 2026');
    expect(AppSetting::get('legal_sk_label'))->toBe('SK Kemenkumham RI Baru');
    expect(AppSetting::get('legal_operational_permit'))->toBe('KEMENSOS/PUB/2026/01');
    expect(AppSetting::get('legal_npwp'))->toBe('12.345.678.9-012.000');
    expect(AppSetting::get('show_sk_in_footer'))->toBe('1');
});
