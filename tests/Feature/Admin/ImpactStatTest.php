<?php

use App\Models\ImpactStat;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $manageImpactStatsPerm = Permission::firstOrCreate(['name' => 'manage_impact_stats']);

    $this->adminRole->givePermissionTo($manageImpactStatsPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('can create and update impact stat with translations', function () {
    actingAs($this->admin)
        ->post('/admin/impact-stats', [
            'category' => 'Dalam Negeri',
            'value' => '150M+',
            'title' => [
                'id' => 'Penerima Manfaat',
                'en' => 'Beneficiaries',
            ],
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $stat = ImpactStat::first();
    expect($stat)->not->toBeNull();
    expect($stat->value)->toBe('150M+');
    expect($stat->getTranslation('label', 'id'))->toBe('Penerima Manfaat');
    expect($stat->getTranslation('label', 'en'))->toBe('Beneficiaries');
    expect($stat->category)->toBe('Dalam Negeri');

    actingAs($this->admin)
        ->put("/admin/impact-stats/{$stat->id}", [
            'category' => 'Luar Negeri',
            'value' => '200M+',
            'title' => [
                'id' => 'Penerima Manfaat Global',
                'en' => 'Global Beneficiaries',
            ],
            'is_active' => true,
            'sort_order' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $stat->refresh();
    expect($stat->value)->toBe('200M+');
    expect($stat->getTranslation('label', 'id'))->toBe('Penerima Manfaat Global');
    expect($stat->getTranslation('label', 'en'))->toBe('Global Beneficiaries');
    expect($stat->category)->toBe('Luar Negeri');
});
