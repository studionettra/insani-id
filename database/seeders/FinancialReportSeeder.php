<?php

namespace Database\Seeders;

use App\Models\FinancialReport;
use Illuminate\Database\Seeder;

class FinancialReportSeeder extends Seeder
{
    public function run(): void
    {
        $reports = [
            [
                'title' => [
                    'id' => 'Laporan Tahunan & Akuntabilitas 2024',
                    'en' => 'Annual & Accountability Report 2024',
                ],
                'slug' => 'laporan-tahunan-2024',
                'report_year' => 2024,
                'category' => 'annual_report',
                'audit_status' => 'WTP (Wajar Tanpa Pengecualian)',
                'auditor_name' => 'KAP Heliantono & Rekan',
                'cover_image' => null,
                'file_path' => null,
                'external_url' => 'https://drive.google.com/file/d/1npzpQZGq1MuGERZ9H8EdxmdV0vzgkIze/view',
                'file_size' => 1024 * 1024 * 14, // 14 MB
                'summary' => [
                    'id' => 'Laporan komprehensif penghimpunan, penyaluran donasi kemanusiaan, serta tata kelola keuangan Yayasan Peduli Insani Indonesia sepanjang tahun 2024 dengan opini audit Wajar Tanpa Pengecualian.',
                    'en' => 'Comprehensive report on fundraising, humanitarian aid distribution, and financial governance of Insani Indonesia throughout 2024 with an Unqualified Opinion (WTP).',
                ],
                'total_revenue' => 4850000000,
                'total_disbursement' => 4320000000,
                'beneficiaries_count' => 38500,
                'download_count' => 142,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => [
                    'id' => 'Laporan Tahunan & Keuangan 2023',
                    'en' => 'Annual & Financial Report 2023',
                ],
                'slug' => 'laporan-tahunan-2023',
                'report_year' => 2023,
                'category' => 'annual_report',
                'audit_status' => 'WTP (Wajar Tanpa Pengecualian)',
                'auditor_name' => 'KAP Heliantono & Rekan',
                'cover_image' => null,
                'file_path' => null,
                'external_url' => 'https://drive.google.com/file/d/1SJP9zp-gMofWmQcCHwMCyfjj8Y_v-k7F/view',
                'file_size' => 1024 * 1024 * 11, // 11 MB
                'summary' => [
                    'id' => 'Laporan pertanggungjawaban program kemanusiaan, pemberdayaan ekonomi, dan transparansi keuangan yayasan pada tahun buku 2023.',
                    'en' => 'Accountability report for humanitarian programs, economic empowerment, and financial transparency of the foundation in fiscal year 2023.',
                ],
                'total_revenue' => 3620000000,
                'total_disbursement' => 3180000000,
                'beneficiaries_count' => 29400,
                'download_count' => 320,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => [
                    'id' => 'Laporan Tahunan & Keuangan 2022',
                    'en' => 'Annual & Financial Report 2022',
                ],
                'slug' => 'laporan-tahunan-2022',
                'report_year' => 2022,
                'category' => 'annual_report',
                'audit_status' => 'WTP (Wajar Tanpa Pengecualian)',
                'auditor_name' => 'KAP Heliantono & Rekan',
                'cover_image' => null,
                'file_path' => null,
                'external_url' => 'https://drive.google.com/file/d/1_7BOWiP9SK-Me0GE178RAqx3g82_-5jh/view',
                'file_size' => 1024 * 1024 * 9, // 9 MB
                'summary' => [
                    'id' => 'Dokumentasi capaian aksi tanggap bencana, program kesehatan, dan laporan keuangan teraudit yayasan tahun 2022.',
                    'en' => 'Documentation of disaster response achievements, health programs, and audited financial statements of the foundation for 2022.',
                ],
                'total_revenue' => 2450000000,
                'total_disbursement' => 2190000000,
                'beneficiaries_count' => 18200,
                'download_count' => 215,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($reports as $data) {
            FinancialReport::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
