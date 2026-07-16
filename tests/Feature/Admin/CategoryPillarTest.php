<?php

use App\Models\Category;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\patch;
use function Pest\Laravel\put;

beforeEach(function () {
    // Ensure roles and permissions exist
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $this->editorRole = Role::firstOrCreate(['name' => 'Content Editor']);
    
    $viewCategoryPerm = Permission::firstOrCreate(['name' => 'category.view']);
    $this->editorRole->givePermissionTo($viewCategoryPerm);

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
