<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $roles = [
            'Administrator' => Permission::all()->pluck('name')->toArray(),

            'Program Officer' => [
                'dashboard.view',
                'program.view', 'program.create', 'program.update', 'program.publish', 'program.reject', 'program.close',
                'update-post.view', 'update-post.create', 'update-post.update', 'update-post.delete',
                'category.view',
            ],

            'Verifikator' => [
                'dashboard.view',
                'campaigner.view', 'campaigner.verify', 'campaigner.reject', 'campaigner.suspend',
                'program.view', 'program.publish', 'program.reject',
            ],

            'Keuangan' => [
                'dashboard.view',
                'disbursement.view', 'disbursement.create', 'disbursement.approve',
                'donation.view', 'donation.confirm-manual',
                'report.view',
            ],

            'Customer Service' => [
                'dashboard.view',
                'donation.view', 'donation.confirm-manual',
                'comment.view', 'comment.moderate',
            ],

            'Campaigner Individu' => [
                'program.create', 'program.update-own',
                'update-post.create',
            ],

            'Campaigner Lembaga' => [
                'program.create', 'program.update-own',
                'update-post.create',
            ],

            'Donatur' => [
                // Empty for now, handled implicitly via ownership of donations
            ],
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($permissions);
        }
    }
}
