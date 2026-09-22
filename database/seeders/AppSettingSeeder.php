<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

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
            ['key' => 'legal_foundation_name', 'value' => 'Yayasan Peduli Insani Indonesia', 'locale' => null],
            ['key' => 'legal_sk_kemenkumham', 'value' => 'AHU-0002557.AH.01.04.Tahun 2019', 'locale' => null],
            ['key' => 'legal_sk_label', 'value' => 'SK Kemenkumham RI', 'locale' => null],
            ['key' => 'show_sk_in_footer', 'value' => '1', 'locale' => null],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(
                ['key' => $setting['key'], 'locale' => $setting['locale']],
                ['value' => $setting['value']]
            );
        }
    }
}
