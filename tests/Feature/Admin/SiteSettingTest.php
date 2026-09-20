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
