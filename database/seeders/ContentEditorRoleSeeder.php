<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContentEditorRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Content Editor']);

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
            $permission = \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $perm]);
            $role->givePermissionTo($permission);
        }

        // Create a dummy content editor user
        \App\Models\User::firstOrCreate(
            ['email' => 'editor@insani.id'],
            [
                'name' => 'Content Editor',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'email_verified_at' => now(),
            ]
        )->assignRole('Content Editor');
    }
}
