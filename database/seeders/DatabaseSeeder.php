<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            CategorySeeder::class,
        ]);

        $admin = User::factory()->create([
            'name' => 'Super Administrator',
            'email' => 'admin@insani.id',
            'phone' => '081122334455',
            'password' => bcrypt('password'),
        ]);

        $admin->assignRole('Administrator');
    }
}
