<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\FinancialReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FinancialReportController extends Controller
{
    public function index(Request $request): Response
    {
        $reports = FinancialReport::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title->id', 'like', "%{$search}%")
                        ->orWhere('title->en', 'like', "%{$search}%")
                        ->orWhere('title->ar', 'like', "%{$search}%")
                        ->orWhere('auditor_name', 'like', "%{$search}%")
                        ->orWhere('audit_status', 'like', "%{$search}%")
                        ->orWhere('report_year', 'like', "%{$search}%");
                });
            })
            ->when($request->year, function ($query, $year) {
                $query->where('report_year', $year);
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->orderByDesc('report_year')
            ->orderBy('sort_order')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $availableYears = FinancialReport::distinct()
            ->pluck('report_year')
            ->filter()
            ->sortDesc()
            ->values();

        $parseMultilingual = function ($raw, array $default): array {
            if (is_array($raw)) {
                return array_merge($default, $raw);
            }
            if (is_string($raw) && str_starts_with(trim($raw), '{')) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    return array_merge($default, $decoded);
                }
            }
            if (is_string($raw) && $raw !== '') {
                return array_merge($default, ['id' => $raw]);
            }

            return $default;
        };

        $settings = [
            'financial_report_notice_enabled' => AppSetting::get('financial_report_notice_enabled', '1'),
            'financial_report_notice_year' => AppSetting::get('financial_report_notice_year', (string) (date('Y') - 1)),
            'financial_report_section_title' => $parseMultilingual(AppSetting::get('financial_report_section_title'), [
                'id' => 'Laporan Keuangan & Annual Report',
                'en' => 'Financial Reports & Annual Report',
                'ar' => 'التقارير المالية والتقرير السنوي',
            ]),
            'financial_report_notice_headline' => $parseMultilingual(AppSetting::get('financial_report_notice_headline'), [
                'id' => 'Laporan Keuangan Tahun Buku {year} Sedang Dalam Proses Finalisasi & Audit',
                'en' => 'Financial Report for Fiscal Year {year} is Under Finalization & Independent Audit',
                'ar' => 'التقرير المالي للسنة المالية {year} قيد التدقيق النهائي والمستقل',
            ]),
            'financial_report_notice_description' => $parseMultilingual(AppSetting::get('financial_report_notice_description'), [
                'id' => 'Sebagai wujud pertanggungjawaban amanah donatur dan kepatuhan terhadap standar akuntansi entitas nirlaba, laporan keuangan tahunan Insani Indonesia saat ini sedang dalam proses rekapitulasi akhir dan audit independen oleh Kantor Akuntan Publik (KAP). Seluruh berkas akan dipublikasikan secara terbuka setelah proses audit selesai.',
                'en' => "As an embodiment of donor accountability and compliance with non-profit accounting standards, Insani Indonesia's annual financial report is currently undergoing final reconciliation and an independent audit by a Certified Public Accountant (KAP). All official documents will be published openly upon completion of the audit process.",
                'ar' => 'تجسيداً للمساءلة أمام المانحين والامتثال لمعايير المحاسبة للمنظمات غير الربحية، يخضع التقرير المالي السنوي لإنساني إندونيسيا حالياً للتسوية النهائية والتدقيق المستقل من قبل مكتب محاسب قانوني معتمد (KAP). سيتم نشر جميع الوثائق الرسمية بشفافية تامة فور انتهاء عملية التدقيق.',
            ]),
            'financial_report_wa_custom_text' => $parseMultilingual(AppSetting::get('financial_report_wa_custom_text'), [
                'id' => 'Hubungi Layanan Donatur via WhatsApp',
                'en' => 'Contact Donor Support via WhatsApp',
                'ar' => 'تواصل مع خدمة المانحين عبر واتساب',
            ]),
            'financial_report_notice_stage' => AppSetting::get('financial_report_notice_stage', '2'),
            'financial_report_wa_number' => AppSetting::get('financial_report_wa_number', ''),
        ];

        return Inertia::render('Admin/FinancialReports/Index', [
            'reports' => $reports,
            'availableYears' => $availableYears,
            'filters' => $request->only(['search', 'year', 'category']),
            'settings' => $settings,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (is_string($request->input('title'))) {
            $request->merge(['title' => ['id' => $request->input('title')]]);
        }
        if (is_string($request->input('summary'))) {
            $request->merge(['summary' => ['id' => $request->input('summary')]]);
        }
        if ($request->has('total_revenue') && is_string($request->input('total_revenue'))) {
            $request->merge(['total_revenue' => str_replace('.', '', $request->input('total_revenue'))]);
        }
        if ($request->has('total_disbursement') && is_string($request->input('total_disbursement'))) {
            $request->merge(['total_disbursement' => str_replace('.', '', $request->input('total_disbursement'))]);
        }

        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'report_year' => 'required|integer|min:2000|max:2100',
            'category' => 'required|string|in:annual_report,audited_financial,impact_report,interim',
            'audit_status' => 'nullable|string|max:255',
            'auditor_name' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf|max:25600',
            'cover_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            'external_url' => 'nullable|url|max:500',
            'summary' => 'nullable|array',
            'summary.id' => 'nullable|string|max:2000',
            'summary.en' => 'nullable|string|max:2000',
            'summary.ar' => 'nullable|string|max:2000',
            'total_revenue' => 'nullable|numeric|min:0',
            'total_disbursement' => 'nullable|numeric|min:0',
            'beneficiaries_count' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ], [
            'title.id.required' => 'Judul laporan dalam Bahasa Indonesia wajib diisi.',
        ]);

        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('financial-reports/files', 'public');
            $validated['file_size'] = $request->file('file')->getSize();
        }

        if ($request->hasFile('cover_file')) {
            $validated['cover_image'] = $request->file('cover_file')->store('financial-reports/covers', 'public');
        }

        unset($validated['file'], $validated['cover_file']);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        FinancialReport::create($validated);

        return redirect()->back()->with('success', 'Laporan keuangan berhasil ditambahkan.');
    }

    public function update(Request $request, FinancialReport $financial_report): RedirectResponse
    {
        if (is_string($request->input('title'))) {
            $request->merge(['title' => ['id' => $request->input('title')]]);
        }
        if (is_string($request->input('summary'))) {
            $request->merge(['summary' => ['id' => $request->input('summary')]]);
        }
        if ($request->has('total_revenue') && is_string($request->input('total_revenue'))) {
            $request->merge(['total_revenue' => str_replace('.', '', $request->input('total_revenue'))]);
        }
        if ($request->has('total_disbursement') && is_string($request->input('total_disbursement'))) {
            $request->merge(['total_disbursement' => str_replace('.', '', $request->input('total_disbursement'))]);
        }

        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'report_year' => 'required|integer|min:2000|max:2100',
            'category' => 'required|string|in:annual_report,audited_financial,impact_report,interim',
            'audit_status' => 'nullable|string|max:255',
            'auditor_name' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf|max:25600',
            'cover_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            'external_url' => 'nullable|url|max:500',
            'summary' => 'nullable|array',
            'summary.id' => 'nullable|string|max:2000',
            'summary.en' => 'nullable|string|max:2000',
            'summary.ar' => 'nullable|string|max:2000',
            'total_revenue' => 'nullable|numeric|min:0',
            'total_disbursement' => 'nullable|numeric|min:0',
            'beneficiaries_count' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ], [
            'title.id.required' => 'Judul laporan dalam Bahasa Indonesia wajib diisi.',
        ]);

        if ($request->hasFile('file')) {
            if ($financial_report->file_path && Storage::disk('public')->exists($financial_report->file_path)) {
                Storage::disk('public')->delete($financial_report->file_path);
            }
            $validated['file_path'] = $request->file('file')->store('financial-reports/files', 'public');
            $validated['file_size'] = $request->file('file')->getSize();
        }

        if ($request->hasFile('cover_file')) {
            if ($financial_report->cover_image && ! str_starts_with($financial_report->cover_image, '/images/') && Storage::disk('public')->exists($financial_report->cover_image)) {
                Storage::disk('public')->delete($financial_report->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_file')->store('financial-reports/covers', 'public');
        }

        unset($validated['file'], $validated['cover_file']);

        $financial_report->update($validated);

        return redirect()->back()->with('success', 'Laporan keuangan berhasil diperbarui.');
    }

    public function destroy(FinancialReport $financial_report): RedirectResponse
    {
        if ($financial_report->file_path && Storage::disk('public')->exists($financial_report->file_path)) {
            Storage::disk('public')->delete($financial_report->file_path);
        }

        if ($financial_report->cover_image && ! str_starts_with($financial_report->cover_image, '/images/') && Storage::disk('public')->exists($financial_report->cover_image)) {
            Storage::disk('public')->delete($financial_report->cover_image);
        }

        $financial_report->delete();

        return redirect()->back()->with('success', 'Laporan keuangan berhasil dihapus.');
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'financial_report_notice_enabled' => 'nullable|string|in:0,1',
            'financial_report_notice_year' => 'nullable|string|max:10',
            'financial_report_section_title' => 'nullable|array',
            'financial_report_section_title.id' => 'nullable|string|max:255',
            'financial_report_section_title.en' => 'nullable|string|max:255',
            'financial_report_section_title.ar' => 'nullable|string|max:255',
            'financial_report_notice_headline' => 'nullable|array',
            'financial_report_notice_headline.id' => 'nullable|string|max:255',
            'financial_report_notice_headline.en' => 'nullable|string|max:255',
            'financial_report_notice_headline.ar' => 'nullable|string|max:255',
            'financial_report_notice_description' => 'nullable|array',
            'financial_report_notice_description.id' => 'nullable|string|max:1000',
            'financial_report_notice_description.en' => 'nullable|string|max:1000',
            'financial_report_notice_description.ar' => 'nullable|string|max:1000',
            'financial_report_wa_custom_text' => 'nullable|array',
            'financial_report_wa_custom_text.id' => 'nullable|string|max:150',
            'financial_report_wa_custom_text.en' => 'nullable|string|max:150',
            'financial_report_wa_custom_text.ar' => 'nullable|string|max:150',
            'financial_report_notice_stage' => 'nullable|string|in:1,2,3',
            'financial_report_wa_number' => 'nullable|string|max:30',
        ]);

        AppSetting::set('financial_report_notice_enabled', $validated['financial_report_notice_enabled'] ?? '1');
        AppSetting::set('financial_report_notice_year', $validated['financial_report_notice_year'] ?? (string) (date('Y') - 1));
        AppSetting::set('financial_report_notice_stage', $validated['financial_report_notice_stage'] ?? '2');
        AppSetting::set('financial_report_wa_number', $validated['financial_report_wa_number'] ?? '');

        $multilingualKeys = [
            'financial_report_section_title',
            'financial_report_notice_headline',
            'financial_report_notice_description',
            'financial_report_wa_custom_text',
        ];

        foreach ($multilingualKeys as $key) {
            if (isset($validated[$key]) && is_array($validated[$key])) {
                AppSetting::set($key, json_encode($validated[$key], JSON_UNESCAPED_UNICODE));
            }
        }

        return redirect()->back()->with('success', 'Pengaturan tampilan laporan keuangan berhasil diperbarui.');
    }
}
