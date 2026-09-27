<?php

use App\Models\ImpactStat;
use App\Models\User;
use Database\Seeders\ImpactStatSeeder;
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

it('seeds impact statistics correctly from seeder', function () {
    $this->seed(ImpactStatSeeder::class);

    expect(ImpactStat::count())->toBe(9);

    $totalProgram = ImpactStat::where('label->id', 'Total Program Terlaksana')->first();
    expect($totalProgram)->not->toBeNull();
    expect($totalProgram->value)->toBe('554');
    expect($totalProgram->category)->toBe('Umum');
    expect($totalProgram->group)->toBe('umum');
    expect($totalProgram->icon)->toBe('CheckCircle2');

    $totalBeneficiary = ImpactStat::where('label->id', 'Total Penerima Manfaat')->first();
    expect($totalBeneficiary)->not->toBeNull();
    expect($totalBeneficiary->value)->toBe('75.121');
    expect($totalBeneficiary->category)->toBe('Umum');

    $domesticProv = ImpactStat::where('label->id', 'Persebaran Provinsi')->first();
    expect($domesticProv)->not->toBeNull();
    expect($domesticProv->value)->toBe('22');
    expect($domesticProv->category)->toBe('Dalam Negeri');

    $foreignCountry = ImpactStat::where('label->id', 'Persebaran Negara')->first();
    expect($foreignCountry)->not->toBeNull();
    expect($foreignCountry->value)->toBe('7');
    expect($foreignCountry->category)->toBe('Luar Negeri');
});
