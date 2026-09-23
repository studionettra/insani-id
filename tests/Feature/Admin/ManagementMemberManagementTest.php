<?php

use App\Models\ManagementMember;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $managePerm = Permission::firstOrCreate(['name' => 'manage_management']);

    $this->adminRole->givePermissionTo($managePerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('can display management members index page and appends translations', function () {
    $member = ManagementMember::create([
        'name' => 'Budi Santoso',
        'position' => [
            'id' => 'Direktur Utama',
            'en' => 'Chief Executive Officer',
            'ar' => null,
        ],
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get('/admin/management-members')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Management/Index')
            ->has('members.data')
            ->where('members.data', function ($members) {
                expect(count($members))->toBeGreaterThan(0);
                $first = $members[0];
                expect($first)->toHaveKey('position_translations')
                    ->and($first['position_translations'])->toBeArray()
                    ->and($first['position_translations'])->toHaveKey('id')
                    ->and($first['position_translations']['id'])->toBe('Direktur Utama');

                return true;
            })
        );
});

it('can create a new management member', function () {
    actingAs($this->admin)
        ->post('/admin/management-members', [
            'name' => 'Siti Rahma',
            'position' => [
                'id' => 'Manajer Operasional',
                'en' => 'Operations Manager',
                'ar' => null,
            ],
            'is_active' => true,
            'sort_order' => 2,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('management_members', [
        'name' => 'Siti Rahma',
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $created = ManagementMember::where('name', 'Siti Rahma')->first();
    expect($created->getTranslation('position', 'id'))->toBe('Manajer Operasional')
        ->and($created->position_translations)->toBeArray()
        ->and($created->position_translations['id'])->toBe('Manajer Operasional');
});

it('can update an existing management member', function () {
    $member = ManagementMember::create([
        'name' => 'Ahmad Dahlan',
        'position' => [
            'id' => 'Sekretaris',
            'en' => 'Secretary',
            'ar' => null,
        ],
        'is_active' => true,
        'sort_order' => 3,
    ]);

    actingAs($this->admin)
        ->put("/admin/management-members/{$member->id}", [
            'name' => 'Ahmad Dahlan Updated',
            'position' => [
                'id' => 'Sekretaris Jenderal',
                'en' => 'Secretary General',
                'ar' => null,
            ],
            'is_active' => false,
            'sort_order' => 5,
        ])
        ->assertRedirect();

    $member->refresh();
    expect($member->name)->toBe('Ahmad Dahlan Updated')
        ->and($member->getTranslation('position', 'id'))->toBe('Sekretaris Jenderal')
        ->and($member->is_active)->toBeFalse()
        ->and($member->sort_order)->toBe(5);
});

it('can search management members by name or position in json', function () {
    ManagementMember::create([
        'name' => 'Dewi Sartika',
        'position' => [
            'id' => 'Bendahara Yayasan',
            'en' => 'Treasurer',
            'ar' => null,
        ],
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get('/admin/management-members?search=Bendahara')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('members.data', 1)
        );

    actingAs($this->admin)
        ->get('/admin/management-members?search=Sartika')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('members.data', 1)
        );
});

it('can delete a management member', function () {
    $member = ManagementMember::create([
        'name' => 'Member to delete',
        'position' => [
            'id' => 'Staff',
            'en' => 'Staff',
            'ar' => null,
        ],
        'is_active' => true,
        'sort_order' => 10,
    ]);

    actingAs($this->admin)
        ->delete("/admin/management-members/{$member->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('management_members', [
        'id' => $member->id,
    ]);
});
