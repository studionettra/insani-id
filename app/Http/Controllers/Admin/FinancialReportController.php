<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

        return Inertia::render('Admin/FinancialReports/Index', [
            'reports' => $reports,
            'availableYears' => $availableYears,
            'filters' => $request->only(['search', 'year', 'category']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
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
            'total_revenue' => 'nullable|numeric|min:0',
            'total_disbursement' => 'nullable|numeric|min:0',
            'beneficiaries_count' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
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
        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
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
            'total_revenue' => 'nullable|numeric|min:0',
            'total_disbursement' => 'nullable|numeric|min:0',
            'beneficiaries_count' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
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
}
