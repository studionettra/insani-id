<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AppSetting;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'min_donation_amount', 'value' => '10000', 'locale' => null],
            ['key' => 'about.nama_legal', 'value' => 'Yayasan Peduli Insani Indonesia', 'locale' => null],
            ['key' => 'about.alamat_kantor', 'value' => 'Jl. Kebaikan No. 1, Jakarta', 'locale' => null],
            ['key' => 'about.google_maps_url', 'value' => 'https://maps.google.com', 'locale' => null],
            ['key' => 'about.contact_email', 'value' => 'sapa@insani.id', 'locale' => null],
            ['key' => 'platform.nama_platform', 'value' => 'Insani Indonesia', 'locale' => null],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(
                ['key' => $setting['key'], 'locale' => $setting['locale']],
                ['value' => $setting['value']]
            );
        }
    }
}
