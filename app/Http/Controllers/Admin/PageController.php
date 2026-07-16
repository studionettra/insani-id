<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index()
    {
        $pages = \App\Models\Page::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Pages/Index', [
            'pages' => $pages,
            'filters' => request()->only(['search']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Pages/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'content_html' => 'required|array',
            'content_html.id' => 'required|string',
            'content_html.en' => 'nullable|string',
            'content_html.ar' => 'nullable|string',
            'meta_title' => 'nullable|array',
            'meta_description' => 'nullable|array',
            'is_active' => 'boolean',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['title']['id']);
        
        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while (\App\Models\Page::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $validated['slug'] = $slug;
        $validated['is_active'] = $validated['is_active'] ?? true;

        if ($request->hasFile('attachment')) {
            $validated['attachment_url'] = $request->file('attachment')->store('pages/attachments', 'public');
        }

        \App\Models\Page::create($validated);

        return redirect()->route('admin.pages.index')->with('success', 'Halaman berhasil dibuat.');
    }

    public function edit(\App\Models\Page $page)
    {
        return inertia('Admin/Pages/Edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request, \App\Models\Page $page)
    {
        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'content_html' => 'required|array',
            'content_html.id' => 'required|string',
            'content_html.en' => 'nullable|string',
            'content_html.ar' => 'nullable|string',
            'meta_title' => 'nullable|array',
            'meta_description' => 'nullable|array',
            'is_active' => 'boolean',
            'attachment' => 'nullable|file|max:10240',
        ]);

        if ($page->getTranslation('title', 'id') !== $validated['title']['id']) {
            $slug = \Illuminate\Support\Str::slug($validated['title']['id']);
            $originalSlug = $slug;
            $counter = 1;
            while (\App\Models\Page::where('slug', $slug)->where('id', '!=', $page->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        if ($request->hasFile('attachment')) {
            if ($page->attachment_url) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($page->attachment_url);
            }
            $validated['attachment_url'] = $request->file('attachment')->store('pages/attachments', 'public');
        }

        $page->update($validated);

        return redirect()->route('admin.pages.index')->with('success', 'Halaman berhasil diperbarui.');
    }

    public function destroy(\App\Models\Page $page)
    {
        if ($page->attachment_url) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($page->attachment_url);
        }
        
        $page->delete();

        return redirect()->back()->with('success', 'Halaman berhasil dihapus.');
    }
}
