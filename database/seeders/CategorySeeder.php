<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => [
                    'id' => 'Bencana Alam',
                    'en' => 'Natural Disasters',
                    'ar' => 'الكوارث الطبيعية',
                ],
                'description' => [
                    'id' => 'Bantuan untuk korban bencana alam seperti gempa bumi, banjir, dan tanah longsor.',
                    'en' => 'Assistance for victims of natural disasters such as earthquakes, floods, and landslides.',
                    'ar' => 'مساعدة لضحايا الكوارث الطبيعية مثل الزلازل والفيضانات والانهيارات الأرضية.',
                ],
                'platform_fee_percent' => 0.00,
                'is_disaster_category' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => [
                    'id' => 'Kesehatan',
                    'en' => 'Healthcare',
                    'ar' => 'الرعاية الصحية',
                ],
                'description' => [
                    'id' => 'Bantuan biaya pengobatan bagi yang tidak mampu.',
                    'en' => 'Medical expense assistance for those in need.',
                    'ar' => 'مساعدة في نفقات العلاج الطبي للمحتاجين.',
                ],
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => [
                    'id' => 'Pendidikan',
                    'en' => 'Education',
                    'ar' => 'التعليم',
                ],
                'description' => [
                    'id' => 'Beasiswa dan bantuan fasilitas pendidikan.',
                    'en' => 'Scholarships and educational facility assistance.',
                    'ar' => 'منح دراسية ومساعدة في مرافق التعليم.',
                ],
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => [
                    'id' => 'Pemberdayaan',
                    'en' => 'Empowerment',
                    'ar' => 'التمكين',
                ],
                'description' => [
                    'id' => 'Bantuan modal usaha dan pelatihan untuk masyarakat.',
                    'en' => 'Business capital assistance and training for the community.',
                    'ar' => 'مساعدة في رأس مال الأعمال وتدريب المجتمع.',
                ],
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => [
                    'id' => 'Yatim',
                    'en' => 'Orphans',
                    'ar' => 'الأيتام',
                ],
                'description' => [
                    'id' => 'Bantuan biaya hidup dan pendidikan untuk anak yatim.',
                    'en' => 'Living and educational expenses assistance for orphans.',
                    'ar' => 'مساعدة في نفقات المعيشة والتعليم للأيتام.',
                ],
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => [
                    'id' => 'Kemanusiaan',
                    'en' => 'Humanitarian',
                    'ar' => 'الإنسانية',
                ],
                'description' => [
                    'id' => 'Bantuan sosial kemanusiaan secara umum.',
                    'en' => 'General humanitarian social assistance.',
                    'ar' => 'مساعدة اجتماعية إنسانية عامة.',
                ],
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $cat) {
            $slug = Str::slug($cat['name']['id']);

            Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'platform_fee_percent' => $cat['platform_fee_percent'],
                    'is_disaster_category' => $cat['is_disaster_category'],
                    'is_active' => $cat['is_active'],
                    'sort_order' => $cat['sort_order'],
                ]
            );
        }
    }
}
