<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProgramReportCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProgramReportCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = ProgramReportCategory::query()
            ->withCount('reports')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name->id', 'like', "%{$search}%")
                        ->orWhere('name->en', 'like', "%{$search}%")
                        ->orWhere('name->ar', 'like', "%{$search}%")
                        ->orWhere('description->id', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($request->has('is_active') && $request->is_active !== null && $request->is_active !== '', function ($query) use ($request) {
                $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
            })
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/ProgramReports/Categories', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.id' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'description' => 'nullable|array',
            'description.id' => 'nullable|string',
            'description.en' => 'nullable|string',
            'description.ar' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $baseSlug = Str::slug($validated['name']['id']);
        $slug = $baseSlug;
        $counter = 1;
        while (ProgramReportCategory::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $validated['slug'] = $slug;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        ProgramReportCategory::create($validated);

        return redirect()->back()->with('success', 'Kategori laporan berhasil ditambahkan.');
    }

    public function update(Request $request, ProgramReportCategory $program_report_category)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.id' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'description' => 'nullable|array',
            'description.id' => 'nullable|string',
            'description.en' => 'nullable|string',
            'description.ar' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $program_report_category->update($validated);

        return redirect()->back()->with('success', 'Kategori laporan berhasil diperbarui.');
    }

    public function toggleActive(ProgramReportCategory $program_report_category)
    {
        $program_report_category->update([
            'is_active' => ! $program_report_category->is_active,
        ]);

        $status = $program_report_category->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Kategori laporan berhasil {$status}.");
    }

    public function destroy(ProgramReportCategory $program_report_category)
    {
        if ($program_report_category->reports()->exists()) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena sudah memiliki riwayat laporan terkait. Silakan nonaktifkan kategori ini.');
        }

        $program_report_category->delete();

        return redirect()->back()->with('success', 'Kategori laporan berhasil dihapus.');
    }
}
