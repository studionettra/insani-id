<?php

use App\Models\AppSetting;
use App\Models\HomepageBanner;
use App\Models\PopupMessage;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Storage::fake('local');

    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->viewer = User::factory()->create();
    $this->viewer->assignRole('Eksekutif'); // Has settings.view if assigned
    $this->viewer->givePermissionTo('settings.view');
});

test('user with settings.view only cannot update site settings', function () {
    $this->actingAs($this->viewer)
        ->from('/admin/site-settings')
        ->post('/admin/site-settings', [
            'contact_whatsapp' => '081299998888',
            'contact_email' => 'hacked@example.com',
        ])
        ->assertForbidden();

    expect(AppSetting::where('key', 'contact_whatsapp')->value('value'))->not->toBe('081299998888');
});

test('user with settings.view only cannot test midtrans connection', function () {
    $this->actingAs($this->viewer)
        ->postJson('/admin/site-settings/test-midtrans')
        ->assertForbidden();
});

test('administrator or user with settings.update can update site settings', function () {
    $response = $this->actingAs($this->admin)
        ->from('/admin/site-settings')
        ->post('/admin/site-settings', [
            'contact_whatsapp' => '081319456675',
            'contact_email' => 'kontak@insani.id',
            'announcement_link' => '/program/sedekah-pangan',
        ]);

    $response->assertRedirect('/admin/site-settings');
    $response->assertSessionHas('success');

    expect(AppSetting::where('key', 'contact_whatsapp')->value('value'))->toBe('081319456675');
    expect(AppSetting::where('key', 'announcement_link')->value('value'))->toBe('/program/sedekah-pangan');
});

test('site settings rejects javascript scheme in announcement_link', function () {
    $response = $this->actingAs($this->admin)
        ->from('/admin/site-settings')
        ->post('/admin/site-settings', [
            'announcement_link' => 'javascript:alert(document.cookie)',
        ]);

    $response->assertSessionHasErrors('announcement_link');
});

test('homepage banner rejects javascript scheme in cta_link but accepts safe web links', function () {
    $desktopImage = UploadedFile::fake()->image('desktop.jpg', 1200, 600);

    // 1. Rejects javascript: scheme
    $badResponse = $this->actingAs($this->admin)
        ->from('/admin/homepage-banners')
        ->post('/admin/homepage-banners', [
            'desktop_image_url' => $desktopImage,
            'title' => ['id' => 'Banner Promo'],
            'cta_link' => 'javascript:alert("banner-xss")',
            'is_active' => true,
        ]);

    $badResponse->assertSessionHasErrors('cta_link');
    expect(HomepageBanner::count())->toBe(0);

    // 2. Accepts safe relative path starting with /
    $safeRelativeResponse = $this->actingAs($this->admin)
        ->from('/admin/homepage-banners')
        ->post('/admin/homepage-banners', [
            'desktop_image_url' => $desktopImage,
            'title' => ['id' => 'Banner Aman Relatif'],
            'cta_link' => '/program/bantu-yatim',
            'is_active' => true,
        ]);

    $safeRelativeResponse->assertRedirect('/admin/homepage-banners');
    expect(HomepageBanner::latest('id')->first()->cta_link)->toBe('/program/bantu-yatim');

    // 3. Accepts safe absolute URL with https://
    $safeAbsoluteResponse = $this->actingAs($this->admin)
        ->from('/admin/homepage-banners')
        ->post('/admin/homepage-banners', [
            'desktop_image_url' => $desktopImage,
            'title' => ['id' => 'Banner Aman Absolut'],
            'cta_link' => 'https://insani.id/tentang-kami',
            'is_active' => true,
        ]);

    $safeAbsoluteResponse->assertRedirect('/admin/homepage-banners');
    expect(HomepageBanner::latest('id')->first()->cta_link)->toBe('https://insani.id/tentang-kami');
});

test('popup message rejects javascript scheme in cta_url but accepts safe links', function () {
    // 1. Rejects javascript: pseudo-protocol
    $badResponse = $this->actingAs($this->admin)
        ->from('/admin/popup-messages')
        ->post('/admin/popup-messages', [
            'display_type' => 'hybrid',
            'title' => ['id' => 'Pop-up XSS'],
            'cta_url' => 'javascript:alert(1)',
            'frequency' => 'always',
            'target_page' => 'all',
            'is_active' => true,
        ]);

    $badResponse->assertSessionHasErrors('cta_url');
    expect(PopupMessage::count())->toBe(0);

    // 2. Accepts safe relative link
    $safeResponse = $this->actingAs($this->admin)
        ->from('/admin/popup-messages')
        ->post('/admin/popup-messages', [
            'display_type' => 'hybrid',
            'title' => ['id' => 'Pop-up Resmi'],
            'cta_url' => '/donasi',
            'frequency' => 'always',
            'target_page' => 'all',
            'is_active' => true,
        ]);

    $safeResponse->assertRedirect('/admin/popup-messages');
    expect(PopupMessage::latest('id')->first()->cta_url)->toBe('/donasi');
});
