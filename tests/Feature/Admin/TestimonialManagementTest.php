<?php

use App\Models\Testimonial;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $bannersPerm = Permission::firstOrCreate(['name' => 'manage_banners']);

    $this->adminRole->givePermissionTo($bannersPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('allows admin to list testimonials', function () {
    Testimonial::create([
        'name' => 'Ahmad Dahlan',
        'role' => 'Donatur Rutin',
        'content' => 'Alhamdulillah penyaluran amanah dan tepat sasaran.',
        'rating' => 5,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get(route('admin.testimonials.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Testimonials/Index'));
});

it('allows admin to create a testimonial', function () {
    actingAs($this->admin)
        ->post(route('admin.testimonials.store'), [
            'name' => 'Siti Khadijah',
            'role' => 'Mitra Yayasan',
            'content' => 'Kerja sama yang luar biasa dalam program pendidikan.',
            'rating' => 5,
            'is_active' => true,
            'sort_order' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Testimonial::where('name', 'Siti Khadijah')->exists())->toBeTrue();
});

it('allows admin to update a testimonial', function () {
    $item = Testimonial::create([
        'name' => 'Budi Santoso',
        'role' => 'Relawan',
        'content' => 'Program tanggap bencana sangat cepat.',
        'rating' => 4,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->put(route('admin.testimonials.update', $item), [
            'name' => 'Budi Santoso Updated',
            'role' => 'Koordinator Relawan',
            'content' => 'Program tanggap bencana sangat cepat dan responsif.',
            'rating' => 5,
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $item->refresh();
    expect($item->name)->toBe('Budi Santoso Updated');
    expect($item->rating)->toBe(5);
});

it('allows admin to delete a testimonial', function () {
    $item = Testimonial::create([
        'name' => 'Hapus Saya',
        'role' => 'Testing',
        'content' => 'Testimoni testing.',
        'rating' => 5,
        'is_active' => true,
        'sort_order' => 99,
    ]);

    actingAs($this->admin)
        ->delete(route('admin.testimonials.destroy', $item))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Testimonial::where('id', $item->id)->exists())->toBeFalse();
});
