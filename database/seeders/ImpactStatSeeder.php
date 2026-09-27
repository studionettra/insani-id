<?php

namespace Database\Seeders;

use App\Models\ImpactStat;
use Illuminate\Database\Seeder;

class ImpactStatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stats = [
            [
                'category' => 'Umum',
                'title' => [
                    'id' => 'Total Program Terlaksana',
                    'en' => 'Total Completed Programs',
                    'ar' => 'إجمالي البرامج المنفذة',
                ],
                'value' => '554',
                'icon' => 'CheckCircle2',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'category' => 'Umum',
                'title' => [
                    'id' => 'Total Penerima Manfaat',
                    'en' => 'Total Beneficiaries',
                    'ar' => 'إجمالي المستفيدين',
                ],
                'value' => '75.121',
                'icon' => 'Users',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'category' => 'Dalam Negeri',
                'title' => [
                    'id' => 'Program Dalam Negeri',
                    'en' => 'Domestic Programs',
                    'ar' => 'البرامج المحلية',
                ],
                'value' => '473',
                'icon' => 'Building',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'category' => 'Dalam Negeri',
                'title' => [
                    'id' => 'Penerima Manfaat Dalam Negeri',
                    'en' => 'Domestic Beneficiaries',
                    'ar' => 'المستفيدون محلياً',
                ],
                'value' => '39.147',
                'icon' => 'HeartHandshake',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'category' => 'Dalam Negeri',
                'title' => [
                    'id' => 'Persebaran Provinsi',
                    'en' => 'Province Distribution',
                    'ar' => 'توزيع المحافظات',
                ],
                'value' => '22',
                'icon' => 'Flag',
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'category' => 'Dalam Negeri',
                'title' => [
                    'id' => 'Persebaran Kabupaten/Kota',
                    'en' => 'Regency & City Distribution',
                    'ar' => 'توزيع المدن والمديريات',
                ],
                'value' => '83',
                'icon' => 'MapPin',
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'category' => 'Luar Negeri',
                'title' => [
                    'id' => 'Program Luar Negeri',
                    'en' => 'International Programs',
                    'ar' => 'البرامج الدولية',
                ],
                'value' => '81',
                'icon' => 'Globe',
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'category' => 'Luar Negeri',
                'title' => [
                    'id' => 'Penerima Manfaat Luar Negeri',
                    'en' => 'International Beneficiaries',
                    'ar' => 'المستفيدون دولياً',
                ],
                'value' => '35.974',
                'icon' => 'Heart',
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'category' => 'Luar Negeri',
                'title' => [
                    'id' => 'Persebaran Negara',
                    'en' => 'Country Distribution',
                    'ar' => 'توزيع الدول',
                ],
                'value' => '7',
                'icon' => 'Globe',
                'sort_order' => 9,
                'is_active' => true,
            ],
        ];

        foreach ($stats as $statData) {
            $stat = ImpactStat::where('label->id', $statData['title']['id'])->first();

            if ($stat) {
                $stat->update($statData);
            } else {
                ImpactStat::create($statData);
            }
        }
    }
}
