<?php

use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $managePartnersPerm = Permission::firstOrCreate(['name' => 'manage_partners']);

    $this->adminRole->givePermissionTo($managePartnersPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('can update partner without uploading new logo', function () {
    Storage::fake('public');

    $partner = Partner::create([
        'name' => 'Mitra Lama',
        'logo_url' => 'partners/existing_logo.png',
        'website_url' => 'https://example.com',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->put("/admin/partners/{$partner->id}", [
            'name' => 'Mitra Baru',
            'website_url' => 'https://new-example.com',
            'logo_url' => null,
            'is_active' => true,
            'sort_order' => 4,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $partner->refresh();

    expect($partner->name)->toBe('Mitra Baru');
    expect($partner->sort_order)->toBe(4);
    expect($partner->logo_url)->toBe('partners/existing_logo.png');
});

it('can update partner with new logo', function () {
    Storage::fake('public');

    $partner = Partner::create([
        'name' => 'Mitra A',
        'logo_url' => 'partners/old_logo.png',
        'website_url' => 'https://example.com',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $newLogo = UploadedFile::fake()->image('new_logo.png');

    actingAs($this->admin)
        ->put("/admin/partners/{$partner->id}", [
            'name' => 'Mitra A Updated',
            'website_url' => 'https://example.com',
            'logo_url' => $newLogo,
            'is_active' => true,
            'sort_order' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $partner->refresh();

    expect($partner->name)->toBe('Mitra A Updated');
    expect($partner->sort_order)->toBe(2);
    expect($partner->logo_url)->not->toBe('partners/old_logo.png');
    Storage::disk('public')->assertExists($partner->logo_url);
});
