<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ContentEditorRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'Content Editor']);

        $permissions = [
            'manage_pages',
            'manage_faqs',
            'manage_management',
            'manage_partners',
            'manage_impact_stats',
            'manage_banners',
            'manage_contact_messages',
            'category.view',
            'dashboard.view',
        ];

        foreach ($permissions as $perm) {
            $permission = Permission::firstOrCreate(['name' => $perm]);
            $role->givePermissionTo($permission);
        }

        // Create a dummy content editor user
        User::firstOrCreate(
            ['email' => 'editor@insani.id'],
            [
                'name' => 'Content Editor',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        )->assignRole('Content Editor');
    }
}
