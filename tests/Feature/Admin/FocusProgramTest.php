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
        'name' => ['id' => 'Pendidikan', 'en' => 'Education'],
        'slug' => 'pendidikan',
        'platform_fee_percent' => 5,
        'is_focus_program' => true,
        'is_active' => true,
    ]);
});

it('allows administrator and content editor to view focus programs list', function () {
    actingAs($this->admin)
        ->get(route('admin.focus-programs.index'))
        ->assertOk();

    actingAs($this->editor)
        ->get(route('admin.focus-programs.index'))
        ->assertOk();
});

it('allows activating a regular category as focus program', function () {
    $regularCategory = Category::create([
        'name' => ['id' => 'Kesehatan Medis'],
        'slug' => 'kesehatan-medis',
        'is_focus_program' => false,
        'is_active' => true,
    ]);

    actingAs($this->editor)
        ->post(route('admin.focus-programs.store'), [
            'category_id' => $regularCategory->id,
        ])
        ->assertRedirect(route('admin.focus-programs.edit', $regularCategory))
        ->assertSessionHas('success');

    $regularCategory->refresh();
    expect($regularCategory->is_focus_program)->toBeTrue();
});

it('allows updating focus program with public_name, reality narrative, and media', function () {
    Storage::fake('public');
    $cover = UploadedFile::fake()->image('cover.jpg');

    actingAs($this->editor)
        ->put(route('admin.focus-programs.update', $this->category), [
            'is_focus_program' => true,
            'public_name' => [
                'id' => 'Insani Cerdas: Lentera Generasi',
                'en' => 'Smart Insani: Future Generation',
            ],
            'description' => [
                'id' => 'Deskripsi pilar pendidikan untuk generasi dhuafa.',
            ],
            'pillar_image' => $cover,
            'reality_title' => [
                'id' => 'Krisis Akses Sekolah di Pelosok',
            ],
            'reality_description' => [
                'id' => 'Banyak anak putus sekolah karena kendala biaya.',
            ],
            'reality_source' => 'Sumber: Kemendikbud 2026',
            'video_url' => 'https://www.youtube.com/watch?v=12345678901',
            'stats_metrics' => [
                ['value' => '1.500+', 'label' => ['id' => 'Beasiswa Disalurkan'], 'icon' => 'GraduationCap'],
            ],
        ])
        ->assertRedirect(route('admin.focus-programs.index'))
        ->assertSessionHas('success');

    $this->category->refresh();

    expect($this->category->getTranslation('public_name', 'id'))->toBe('Insani Cerdas: Lentera Generasi');
    expect($this->category->getTranslation('name', 'id'))->toBe('Pendidikan');
    expect($this->category->display_name)->toBe('Insani Cerdas: Lentera Generasi');
    expect($this->category->reality_source)->toBe('Sumber: Kemendikbud 2026');
    expect($this->category->pillar_image)->not->toBeNull();
    expect($this->category->stats_metrics)->toHaveCount(1);
});

it('allows toggling focus program status', function () {
    actingAs($this->admin)
        ->patch(route('admin.focus-programs.toggle-status', $this->category))
        ->assertRedirect();

    $this->category->refresh();
    expect($this->category->is_focus_program)->toBeFalse();

    actingAs($this->admin)
        ->patch(route('admin.focus-programs.toggle-status', $this->category))
        ->assertRedirect();

    $this->category->refresh();
    expect($this->category->is_focus_program)->toBeTrue();
});
