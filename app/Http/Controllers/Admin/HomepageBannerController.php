<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomepageBannerController extends Controller
{
    public function index()
    {
        $banners = \App\Models\HomepageBanner::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/HomepageBanners/Index', [
            'banners' => $banners,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'desktop_image_url' => 'required|image|max:3072',
            'mobile_image_url' => 'nullable|image|max:2048',
            'cta_link' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('desktop_image_url')) {
            $validated['desktop_image_url'] = $request->file('desktop_image_url')->store('banners', 'public');
        }
        
        if ($request->hasFile('mobile_image_url')) {
            $validated['mobile_image_url'] = $request->file('mobile_image_url')->store('banners/mobile', 'public');
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        \App\Models\HomepageBanner::create($validated);

        return redirect()->back()->with('success', 'Banner berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\HomepageBanner $homepage_banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'desktop_image_url' => 'nullable|image|max:3072',
            'mobile_image_url' => 'nullable|image|max:2048',
            'cta_link' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('desktop_image_url')) {
            if ($homepage_banner->desktop_image_url) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($homepage_banner->desktop_image_url);
            }
            $validated['desktop_image_url'] = $request->file('desktop_image_url')->store('banners', 'public');
        }
        
        if ($request->hasFile('mobile_image_url')) {
            if ($homepage_banner->mobile_image_url) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($homepage_banner->mobile_image_url);
            }
            $validated['mobile_image_url'] = $request->file('mobile_image_url')->store('banners/mobile', 'public');
        }

        $homepage_banner->update($validated);

        return redirect()->back()->with('success', 'Banner berhasil diperbarui.');
    }

    public function destroy(\App\Models\HomepageBanner $homepage_banner)
    {
        if ($homepage_banner->desktop_image_url) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($homepage_banner->desktop_image_url);
        }
        if ($homepage_banner->mobile_image_url) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($homepage_banner->mobile_image_url);
        }
        $homepage_banner->delete();

        return redirect()->back()->with('success', 'Banner berhasil dihapus.');
    }
}
