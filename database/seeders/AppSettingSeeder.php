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
            ['key' => 'platform.nama_platform', 'value' => 'Insani Indonesia', 'locale' => null],

            // Legalitas Yayasan
            ['key' => 'legal_foundation_name', 'value' => 'Yayasan Peduli Insani Indonesia', 'locale' => null],
            ['key' => 'legal_sk_kemenkumham', 'value' => 'AHU-0002557.AH.01.04.Tahun 2019', 'locale' => null],
            ['key' => 'legal_sk_label', 'value' => 'SK Kemenkumham RI', 'locale' => null],
            ['key' => 'show_sk_in_footer', 'value' => '1', 'locale' => null],

            // Alamat & Kontak Resmi
            ['key' => 'contact_address', 'value' => 'Jln. Moh Kahfi 1 No 90A, Jagakarsa, Jakarta Selatan', 'locale' => null],
            ['key' => 'contact_phone', 'value' => '(021) 27871199', 'locale' => null],
            ['key' => 'contact_email', 'value' => 'sapa@insani.id', 'locale' => null],
            ['key' => 'contact_operating_hours', 'value' => "Senin - Jum'at | 10:00 - 18.00 WIB", 'locale' => null],
            ['key' => 'contact_whatsapp', 'value' => '6281319456675', 'locale' => null],

            // Media Sosial Resmi
            ['key' => 'social_facebook', 'value' => 'https://www.facebook.com/insaniindonesia', 'locale' => null],
            ['key' => 'social_instagram', 'value' => 'https://www.instagram.com/insaniindonesia', 'locale' => null],
            ['key' => 'social_threads', 'value' => 'https://www.threads.com/@insaniindonesia', 'locale' => null],
            ['key' => 'social_x', 'value' => 'https://x.com/officialinsani', 'locale' => null],
            ['key' => 'social_youtube', 'value' => 'https://www.youtube.com/@insaniindonesia', 'locale' => null],

            // Deskripsi Footer Multibahasa
            ['key' => 'footer_description', 'value' => json_encode([
                'id' => 'Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan universal.',
                'en' => 'Digital solidarity platform dedicated to bridging kindness and delivering real impact for communities under universal humanitarian values.',
                'ar' => 'منصة تضامن رقمية مكرسة لمد جسور الخير وإحداث أثر حقيقي للمجتمعات في إطار القيم الإنسانية العالمية.',
            ], JSON_UNESCAPED_UNICODE), 'locale' => null],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(
                ['key' => $setting['key'], 'locale' => $setting['locale']],
                ['value' => $setting['value']]
            );
        }
    }
}
