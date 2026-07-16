<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function index()
    {
        $partners = \App\Models\Partner::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Partners/Index', [
            'partners' => $partners,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo_url' => 'required|image|max:2048',
            'website_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('logo_url')) {
            $validated['logo_url'] = $request->file('logo_url')->store('partners', 'public');
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        \App\Models\Partner::create($validated);

        return redirect()->back()->with('success', 'Mitra Kerja Sama berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\Partner $partner)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo_url' => 'nullable|image|max:2048',
            'website_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('logo_url')) {
            if ($partner->logo_url) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($partner->logo_url);
            }
            $validated['logo_url'] = $request->file('logo_url')->store('partners', 'public');
        }

        $partner->update($validated);

        return redirect()->back()->with('success', 'Mitra Kerja Sama berhasil diperbarui.');
    }

    public function destroy(\App\Models\Partner $partner)
    {
        if ($partner->logo_url) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($partner->logo_url);
        }
        $partner->delete();

        return redirect()->back()->with('success', 'Mitra Kerja Sama berhasil dihapus.');
    }
}
