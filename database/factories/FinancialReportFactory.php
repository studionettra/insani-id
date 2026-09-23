<?php

namespace Database\Factories;

use App\Models\FinancialReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinancialReport>
 */
class FinancialReportFactory extends Factory
{
    protected $model = FinancialReport::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year = fake()->numberBetween(2021, 2025);

        return [
            'title' => [
                'id' => "Laporan Tahunan {$year}",
                'en' => "Annual Report {$year}",
            ],
            'slug' => "annual-report-{$year}-".fake()->unique()->lexify('????'),
            'report_year' => $year,
            'category' => 'annual_report',
            'audit_status' => 'WTP (Wajar Tanpa Pengecualian)',
            'auditor_name' => 'KAP Heliantono & Rekan',
            'cover_image' => null,
            'file_path' => null,
            'external_url' => 'https://drive.google.com/file/d/example',
            'file_size' => 1024 * 1024 * 5, // 5MB
            'summary' => [
                'id' => "Ringkasan kinerja dan pencapaian yayasan pada tahun buku {$year}.",
                'en' => "Summary of foundation performance and achievements in fiscal year {$year}.",
            ],
            'total_revenue' => 1500000000,
            'total_disbursement' => 1350000000,
            'beneficiaries_count' => 12500,
            'download_count' => 0,
            'is_active' => true,
            'sort_order' => 1,
        ];
    }
}
