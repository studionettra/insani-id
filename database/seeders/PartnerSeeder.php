<?php

namespace Database\Seeders;

use App\Models\Partner;
use Illuminate\Database\Seeder;

class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partners = [
            [
                'name' => 'Hayat Yolu',
                'logo_url' => 'partners/XNm64CVECE4V3ImlVXn5nFmXnmq2ADq3RNY7u8ud.webp',
                'website_url' => 'https://hayat-yolu.org/',
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Pure Hands',
                'logo_url' => 'partners/6Xv5OA6C9Hosr0eTSOB1W9aTrfLVBpDZ8QdcbR0x.webp',
                'website_url' => 'https://purehands.id/',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Yida',
                'logo_url' => 'partners/wlsG97p5Ir9ROHjCmU7G3DnoIYsJ2txKc9irAPVc.webp',
                'website_url' => 'https://yiad.org/en/',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Rumah Kami Peduli',
                'logo_url' => 'partners/LJb8Kg3ziu0BXkktfShtKiDia16zmj8CumsLiJ6m.webp',
                'website_url' => 'https://www.instagram.com/rumahkamipeduli/?hl=en',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Care ID',
                'logo_url' => 'partners/p86dADIsp9EKSufmgpVvp5DIbgAy6Lt3bHK7JWh2.webp',
                'website_url' => 'https://pedulibareng.com/',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($partners as $partner) {
            Partner::updateOrCreate(
                ['name' => $partner['name']],
                $partner
            );
        }
    }
}
