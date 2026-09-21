<?php

use App\Models\Category;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    // Ensure roles and permissions exist
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $this->editorRole = Role::firstOrCreate(['name' => 'Content Editor']);

    $viewCategoryPerm = Permission::firstOrCreate(['name' => 'category.view']);
    $this->editorRole->givePermissionTo($viewCategoryPerm);
    $this->adminRole->givePermissionTo($viewCategoryPerm);

    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->editor = User::factory()->create();
    $this->editor->assignRole('Content Editor');

    $this->category = Category::create([
        'name' => ['id' => 'Original Name'],
        'slug' => 'original-name',
        'platform_fee_percent' => 5,
        'is_focus_program' => false,
    ]);
});

it('allows content editor to update pillar settings only', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('pillar.jpg');

    actingAs($this->editor)
        ->patch(route('admin.categories.update-pillar', $this->category), [
            'is_focus_program' => true,
            'pillar_image' => $file,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->category->refresh();

    expect($this->category->is_focus_program)->toBeTrue();
    expect($this->category->pillar_image)->not->toBeNull();
});

it('forbids content editor from updating standard category fields', function () {
    actingAs($this->editor)
        ->put(route('admin.categories.update', $this->category), [
            'name' => ['id' => 'New Name'],
            'platform_fee_percent' => 10,
        ])
        ->assertForbidden();

    $this->category->refresh();

    expect($this->category->name)->toBe('Original Name');
    expect($this->category->platform_fee_percent)->toEqual(5);
});

it('allows administrator to update standard category fields', function () {
    actingAs($this->admin)
        ->put(route('admin.categories.update', $this->category), [
            'name' => ['id' => 'Admin Edited Name'],
            'description' => ['id' => 'Desc'],
            'platform_fee_percent' => 10,
            'is_disaster_category' => true,
            'is_focus_program' => true,
        ])
        ->assertRedirect();

    $this->category->refresh();

    expect($this->category->name)->toBe('Admin Edited Name');
    expect($this->category->platform_fee_percent)->toEqual(10);
});

it('allows updating detailed focus program fields including gallery and metrics', function () {
    Storage::fake('public');

    $galleryImage = UploadedFile::fake()->image('dist1.jpg');

    actingAs($this->editor)
        ->patch(route('admin.categories.update-pillar', $this->category), [
            'is_focus_program' => true,
            'reality_title' => ['id' => 'Krisis Lapangan'],
            'reality_description' => ['id' => 'Deskripsi krisis.'],
            'reality_source' => 'Sumber: Data 2026',
            'video_url' => 'https://www.youtube.com/watch?v=12345678901',
            'stats_metrics' => [
                ['value' => '10.000+', 'label' => ['id' => 'Penerima Manfaat'], 'icon' => 'Users'],
            ],
            'gallery_images' => [$galleryImage],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->category->refresh();

    expect($this->category->is_focus_program)->toBeTrue();
    expect($this->category->getTranslation('reality_title', 'id'))->toBe('Krisis Lapangan');
    expect($this->category->reality_source)->toBe('Sumber: Data 2026');
    expect($this->category->video_url)->toBe('https://www.youtube.com/watch?v=12345678901');
    expect($this->category->stats_metrics)->toHaveCount(1);
    expect($this->category->distribution_gallery)->toHaveCount(1);
    Storage::disk('public')->assertExists($this->category->distribution_gallery[0]);
});
