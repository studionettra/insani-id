<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'dashboard.view',
            'user.view', 'user.create', 'user.update', 'user.delete',
            'role.view', 'role.create', 'role.update', 'role.delete',
            'category.view', 'category.create', 'category.update', 'category.delete',
            'campaigner.view', 'campaigner.verify', 'campaigner.reject', 'campaigner.suspend',
            'program.view', 'program.create', 'program.update', 'program.publish', 'program.reject', 'program.close',
            'program.update-own',
            'donation.view', 'donation.create', 'donation.refund', 'donation.confirm-manual',
            'disbursement.view', 'disbursement.create', 'disbursement.approve',
            'update-post.view', 'update-post.create', 'update-post.update', 'update-post.delete',
            'comment.view', 'comment.moderate',
            'report.view',
            'settings.view', 'settings.update',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }
    }
}
