<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ImpactStatController extends Controller
{
    public function index()
    {
        $impactStats = \App\Models\ImpactStat::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/ImpactStats/Index', [
            'impactStats' => $impactStats,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'value' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'category' => 'required|string|max:255', // e.g. "Dalam Negeri", "Luar Negeri", "Total"
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        \App\Models\ImpactStat::create($validated);

        return redirect()->back()->with('success', 'Statistik Dampak berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\ImpactStat $impact_stat)
    {
        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'value' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $impact_stat->update($validated);

        return redirect()->back()->with('success', 'Statistik Dampak berhasil diperbarui.');
    }

    public function destroy(\App\Models\ImpactStat $impact_stat)
    {
        $impact_stat->delete();

        return redirect()->back()->with('success', 'Statistik Dampak berhasil dihapus.');
    }
}
