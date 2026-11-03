<?php

namespace Database\Seeders;

use App\Models\HomepageBanner;
use Illuminate\Database\Seeder;

class HomepageBannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        HomepageBanner::updateOrCreate(
            ['title' => "Bersama Wujudkan Generasi Qura'ni"],
            [
                'title' => "Bersama Wujudkan Generasi Qura'ni",
                'description' => 'Dukungan mu membukan lebih banyak kesempatan bagi mereka untuk belajar, menghafal dan mengamalkan Al-Quran.',
                'desktop_image_url' => 'banners/rLHjtjddHIPcRmLMsmGc3h7UVk3HCgLsgAn8BZJ2.png',
                'mobile_image_url' => 'banners/mobile/KWXxVtb0gzXIuM1V33Fxd4XtJqSRXx6FH3XEbryo.png',
                'cta_link' => '/program',
                'is_active' => true,
                'sort_order' => 1,
                'title_translations' => [
                    'id' => "Bersama Wujudkan Generasi Qura'ni",
                    'en' => 'Together, Create the Qura\'ni Generation',
                    'ar' => 'معًا نصنع الجيل القرآني',
                ],
                'description_translations' => [
                    'id' => 'Dukungan mu membukan lebih banyak kesempatan bagi mereka untuk belajar, menghafal dan mengamalkan Al-Quran.',
                    'en' => 'Your support opens up more opportunities for them to learn, memorize and practice the Al-Quran.',
                    'ar' => 'دعمكم يفتح لهم المزيد من الفرص لتعلم القرآن وحفظه وممارسته.',
                ],
            ]
        );
    }
}
