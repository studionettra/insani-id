<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $viewPerm = Permission::firstOrCreate(['name' => 'program.view']);
    $this->adminRole->givePermissionTo($viewPerm);

    $this->admin = User::factory()->create(['name' => 'Admin Insani']);
    $this->admin->assignRole('Administrator');

    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
        'slug' => 'kemanusiaan',
        'is_active' => true,
    ]);
});

it('allows admin to toggle program featured status via 1-click action', function () {
    $program = Program::factory()->published()->create([
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'is_featured' => false,
        'featured_order' => null,
    ]);

    actingAs($this->admin)
        ->patch(route('admin.programs.toggle-featured', $program))
        ->assertRedirect()
        ->assertSessionHas('success', 'Program berhasil dijadikan program unggulan di beranda.');

    $program->refresh();
    expect($program->is_featured)->toBeTrue()
        ->and($program->featured_order)->toBe(1);

    // Toggle off
    actingAs($this->admin)
        ->patch(route('admin.programs.toggle-featured', $program))
        ->assertRedirect()
        ->assertSessionHas('success', 'Program telah dihapus dari program unggulan beranda.');

    $program->refresh();
    expect($program->is_featured)->toBeFalse()
        ->and($program->featured_order)->toBeNull();
});

it('allows admin to create an internal program with featured status and priority order', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('cover.jpg', 600, 400);

    actingAs($this->admin)
        ->post(route('admin.programs.store'), [
            'title' => 'Program Bantuan Pangan Nasional',
            'category_id' => $this->category->id,
            'story' => '<p>Cerita program bantuan pangan.</p>',
            'cover_image' => $file,
            'is_featured' => '1',
            'featured_order' => '2',
        ])
        ->assertRedirect(route('admin.programs.index'))
        ->assertSessionHas('success');

    $created = Program::where('title->id', 'Program Bantuan Pangan Nasional')->first();
    expect($created)->not->toBeNull()
        ->and($created->is_featured)->toBeTrue()
        ->and($created->featured_order)->toBe(2);
});

it('allows admin to update a program with featured status and priority order', function () {
    $program = Program::factory()->published()->create([
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'title' => ['id' => 'Program Awal'],
        'story' => ['id' => '<p>Cerita awal.</p>'],
        'is_featured' => false,
        'featured_order' => null,
    ]);

    actingAs($this->admin)
        ->put(route('admin.programs.update', $program), [
            'title' => 'Program Awal Terupdate',
            'category_id' => $this->category->id,
            'story' => '<p>Cerita terupdate.</p>',
            'is_featured' => '1',
            'featured_order' => '3',
        ])
        ->assertRedirect(route('admin.programs.index'))
        ->assertSessionHas('success');

    $program->refresh();
    expect($program->is_featured)->toBeTrue()
        ->and($program->featured_order)->toBe(3);
});
