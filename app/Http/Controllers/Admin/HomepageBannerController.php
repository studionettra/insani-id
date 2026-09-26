<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageBanner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HomepageBannerController extends Controller
{
    public function index(Request $request): Response
    {
        $banners = HomepageBanner::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title->id', 'like', "%{$search}%")
                        ->orWhere('title->en', 'like', "%{$search}%")
                        ->orWhere('title->ar', 'like', "%{$search}%")
                        ->orWhere('description->id', 'like', "%{$search}%")
                        ->orWhere('description->en', 'like', "%{$search}%")
                        ->orWhere('description->ar', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/HomepageBanners/Index', [
            'banners' => $banners,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'desktop_image_url' => 'required|image|max:3072',
            'mobile_image_url' => 'nullable|image|max:2048',
            'cta_link' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];

        if (is_array($request->input('title'))) {
            $rules['title'] = 'required|array';
            $rules['title.id'] = 'required|string|max:255';
            $rules['title.en'] = 'nullable|string|max:255';
            $rules['title.ar'] = 'nullable|string|max:255';
        } else {
            $rules['title'] = 'required|string|max:255';
        }

        if (is_array($request->input('description'))) {
            $rules['description'] = 'nullable|array';
            $rules['description.id'] = 'nullable|string|max:200';
            $rules['description.en'] = 'nullable|string|max:200';
            $rules['description.ar'] = 'nullable|string|max:200';
        } else {
            $rules['description'] = 'nullable|string|max:200';
        }

        $validated = $request->validate($rules, [
            'title.id.required' => 'Judul banner dalam Bahasa Indonesia wajib diisi.',
            'description.id.max' => 'Deskripsi banner dalam Bahasa Indonesia maksimal 200 karakter.',
            'description.en.max' => 'Deskripsi banner dalam Bahasa Inggris maksimal 200 karakter.',
            'description.ar.max' => 'Deskripsi banner dalam Bahasa Arab maksimal 200 karakter.',
        ]);

        if (is_string($validated['title'])) {
            $validated['title'] = ['id' => $validated['title']];
        }

        if (isset($validated['description']) && is_string($validated['description'])) {
            $validated['description'] = ['id' => $validated['description']];
        }

        if ($request->hasFile('desktop_image_url')) {
            $validated['desktop_image_url'] = $request->file('desktop_image_url')->store('banners', 'public');
        }

        if ($request->hasFile('mobile_image_url')) {
            $validated['mobile_image_url'] = $request->file('mobile_image_url')->store('banners/mobile', 'public');
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        HomepageBanner::create($validated);

        return redirect()->back()->with('success', 'Banner berhasil ditambahkan.');
    }

    public function update(Request $request, HomepageBanner $homepage_banner): RedirectResponse
    {
        $rules = [
            'desktop_image_url' => 'nullable|image|max:3072',
            'mobile_image_url' => 'nullable|image|max:2048',
            'cta_link' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];

        if (is_array($request->input('title'))) {
            $rules['title'] = 'required|array';
            $rules['title.id'] = 'required|string|max:255';
            $rules['title.en'] = 'nullable|string|max:255';
            $rules['title.ar'] = 'nullable|string|max:255';
        } else {
            $rules['title'] = 'required|string|max:255';
        }

        if (is_array($request->input('description'))) {
            $rules['description'] = 'nullable|array';
            $rules['description.id'] = 'nullable|string|max:200';
            $rules['description.en'] = 'nullable|string|max:200';
            $rules['description.ar'] = 'nullable|string|max:200';
        } else {
            $rules['description'] = 'nullable|string|max:200';
        }

        $validated = $request->validate($rules, [
            'title.id.required' => 'Judul banner dalam Bahasa Indonesia wajib diisi.',
            'description.id.max' => 'Deskripsi banner dalam Bahasa Indonesia maksimal 200 karakter.',
            'description.en.max' => 'Deskripsi banner dalam Bahasa Inggris maksimal 200 karakter.',
            'description.ar.max' => 'Deskripsi banner dalam Bahasa Arab maksimal 200 karakter.',
        ]);

        if (is_string($validated['title'])) {
            $validated['title'] = ['id' => $validated['title']];
        }

        if (isset($validated['description']) && is_string($validated['description'])) {
            $validated['description'] = ['id' => $validated['description']];
        }

        if ($request->hasFile('desktop_image_url')) {
            if ($homepage_banner->desktop_image_url) {
                Storage::disk('public')->delete($homepage_banner->desktop_image_url);
            }
            $validated['desktop_image_url'] = $request->file('desktop_image_url')->store('banners', 'public');
        } else {
            unset($validated['desktop_image_url']);
        }

        if ($request->hasFile('mobile_image_url')) {
            if ($homepage_banner->mobile_image_url) {
                Storage::disk('public')->delete($homepage_banner->mobile_image_url);
            }
            $validated['mobile_image_url'] = $request->file('mobile_image_url')->store('banners/mobile', 'public');
        } else {
            unset($validated['mobile_image_url']);
        }

        $homepage_banner->update($validated);

        return redirect()->back()->with('success', 'Banner berhasil diperbarui.');
    }

    public function destroy(HomepageBanner $homepage_banner): RedirectResponse
    {
        if ($homepage_banner->desktop_image_url) {
            Storage::disk('public')->delete($homepage_banner->desktop_image_url);
        }
        if ($homepage_banner->mobile_image_url) {
            Storage::disk('public')->delete($homepage_banner->mobile_image_url);
        }
        $homepage_banner->delete();

        return redirect()->back()->with('success', 'Banner berhasil dihapus.');
    }
}
