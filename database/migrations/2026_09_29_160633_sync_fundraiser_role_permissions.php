<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $fundraiserViewPerm = Permission::firstOrCreate(['name' => 'fundraiser.view', 'guard_name' => 'web']);

        $fundraiserRole = Role::where('name', 'Fundraiser')->where('guard_name', 'web')->first();
        if ($fundraiserRole && $fundraiserRole->hasPermissionTo($fundraiserViewPerm)) {
            $fundraiserRole->revokePermissionTo($fundraiserViewPerm);
        }

        $programOfficerRole = Role::where('name', 'Program Officer')->where('guard_name', 'web')->first();
        if ($programOfficerRole && ! $programOfficerRole->hasPermissionTo($fundraiserViewPerm)) {
            $programOfficerRole->givePermissionTo($fundraiserViewPerm);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $fundraiserViewPerm = Permission::where('name', 'fundraiser.view')->where('guard_name', 'web')->first();

        if ($fundraiserViewPerm) {
            $fundraiserRole = Role::where('name', 'Fundraiser')->where('guard_name', 'web')->first();
            if ($fundraiserRole && ! $fundraiserRole->hasPermissionTo($fundraiserViewPerm)) {
                $fundraiserRole->givePermissionTo($fundraiserViewPerm);
            }

            $programOfficerRole = Role::where('name', 'Program Officer')->where('guard_name', 'web')->first();
            if ($programOfficerRole && $programOfficerRole->hasPermissionTo($fundraiserViewPerm)) {
                $programOfficerRole->revokePermissionTo($fundraiserViewPerm);
            }
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
