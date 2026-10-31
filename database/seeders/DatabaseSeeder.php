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
            ContentEditorRoleSeeder::class,
            AppSettingSeeder::class,
            CategorySeeder::class,
            BankAccountSeeder::class,
            LegalDocumentSeeder::class,
            PageSeeder::class,
            FaqSeeder::class,
            FinancialReportSeeder::class,
            TestimonialSeeder::class,
            ProgramReportCategorySeeder::class,
            ImpactStatSeeder::class,
            KabarArchiveSeeder::class,
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@insani.id'],
            [
                'name' => 'Super Administrator',
                'phone' => '081122334455',
                'password' => bcrypt('password'),
                'must_change_password' => true,
            ]
        );

        if (! $admin->hasRole('Administrator')) {
            $admin->assignRole('Administrator');
        }

        $this->call([
            LegacyCampaignAndDonationSeeder::class,
        ]);
    }
}
