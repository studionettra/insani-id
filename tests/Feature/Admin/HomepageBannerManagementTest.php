<?php

use App\Models\HomepageBanner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $bannersPerm = Permission::firstOrCreate(['name' => 'manage_banners']);

    $this->adminRole->givePermissionTo($bannersPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    Storage::fake('public');
});

it('allows admin to list homepage banners', function () {
    HomepageBanner::create([
        'title' => 'Banner Utama Ramadhan',
        'description' => 'Mari berbagi kebaikan di bulan suci Ramadhan bersama Insani.',
        'desktop_image_url' => 'banners/dummy.jpg',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get('/admin/homepage-banners')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/HomepageBanners/Index'));
});

it('allows admin to create a homepage banner with description', function () {
    $file = UploadedFile::fake()->image('banner.jpg', 1920, 800);

    actingAs($this->admin)
        ->post('/admin/homepage-banners', [
            'title' => 'Program Berbagi Berkah',
            'description' => 'Salurkan donasi Anda untuk membantu masyarakat pelosok yang membutuhkan.',
            'desktop_image_url' => $file,
            'cta_link' => 'https://insani.id/program/berbagi-berkah',
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('homepage_banners', [
        'title->id' => 'Program Berbagi Berkah',
        'description->id' => 'Salurkan donasi Anda untuk membantu masyarakat pelosok yang membutuhkan.',
    ]);
});

it('validates description maximum 200 characters', function () {
    $file = UploadedFile::fake()->image('banner.jpg', 1920, 800);
    $tooLongDescription = str_repeat('a', 201);

    actingAs($this->admin)
        ->post('/admin/homepage-banners', [
            'title' => 'Banner Test',
            'description' => $tooLongDescription,
            'desktop_image_url' => $file,
        ])
        ->assertSessionHasErrors(['description']);
});

it('allows admin to update a homepage banner description', function () {
    $banner = HomepageBanner::create([
        'title' => 'Banner Lama',
        'description' => 'Deskripsi lama sebelum diperbarui.',
        'desktop_image_url' => 'banners/old.jpg',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->put("/admin/homepage-banners/{$banner->id}", [
            'title' => 'Banner Baru',
            'description' => 'Deskripsi baru yang telah disesuaikan dan relevan.',
            'is_active' => true,
            'sort_order' => 2,
        ])
        ->assertRedirect();

    expect($banner->fresh()->description)->toBe('Deskripsi baru yang telah disesuaikan dan relevan.');
    expect($banner->fresh()->title)->toBe('Banner Baru');
});

it('passes banner description to public homepage props', function () {
    HomepageBanner::create([
        'title' => 'Inisiatif Kebaikan',
        'description' => 'Menghubungkan kebaikan hati donatur dengan penerima manfaat di seluruh pelosok.',
        'desktop_image_url' => 'banners/sample.jpg',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Home/Index')
            ->where('banners.0.title', 'Inisiatif Kebaikan')
            ->where('banners.0.description', 'Menghubungkan kebaikan hati donatur dengan penerima manfaat di seluruh pelosok.')
        );
});

it('allows admin to create a multilingual homepage banner with ID, EN, and AR', function () {
    $file = UploadedFile::fake()->image('banner-multi.jpg', 1920, 800);

    actingAs($this->admin)
        ->post('/admin/homepage-banners', [
            'title' => [
                'id' => 'Berbagi Kebaikan Bersama',
                'en' => 'Sharing Goodness Together',
                'ar' => 'تقاسم الخير معا',
            ],
            'description' => [
                'id' => 'Salurkan donasi terbaik Anda untuk membantu sesama.',
                'en' => 'Distribute your best donation to help others.',
                'ar' => 'قدم أفضل تبرعاتك لمساعدة الآخرين.',
            ],
            'desktop_image_url' => $file,
            'cta_link' => 'https://insani.id/campaigns',
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect();

    $banner = HomepageBanner::where('sort_order', 1)->latest('id')->first();
    expect($banner)->not->toBeNull();
    expect($banner->getTranslation('title', 'id'))->toBe('Berbagi Kebaikan Bersama');
    expect($banner->getTranslation('title', 'en'))->toBe('Sharing Goodness Together');
    expect($banner->getTranslation('title', 'ar'))->toBe('تقاسم الخير معا');
    expect($banner->getTranslation('description', 'en'))->toBe('Distribute your best donation to help others.');
    expect($banner->getTranslation('description', 'ar'))->toBe('قدم أفضل تبرعاتك لمساعدة الآخرين.');
});
