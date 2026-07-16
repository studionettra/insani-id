<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Routing\Controller as BaseController;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CategoryController extends BaseController
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->authorizeResource(Category::class, 'category');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $categories = Category::orderBy('sort_order')->orderBy('id', 'desc')->get()->map(function ($c) {
            $c->name_translations = $c->getTranslations('name');
            $c->description_translations = $c->getTranslations('description');

            return $c;
        });

        return inertia('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.id' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'description' => 'nullable|array',
            'icon' => 'nullable|image|max:2048',
            'platform_fee_percent' => 'nullable|numeric|min:0|max:100',
            'is_disaster_category' => 'boolean',
            'is_focus_program' => 'boolean',
            'pillar_image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $slug = Str::slug($validated['name']['id']);

        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        $validated['slug'] = $slug;
        $validated['platform_fee_percent'] = $validated['platform_fee_percent'] ?? 0;
        $validated['is_disaster_category'] = $validated['is_disaster_category'] ?? false;
        $validated['is_focus_program'] = $validated['is_focus_program'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        if ($request->hasFile('icon')) {
            $validated['icon'] = $request->file('icon')->store('categories', 'public');
        }

        if ($request->hasFile('pillar_image')) {
            $validated['pillar_image'] = $request->file('pillar_image')->store('categories/pillars', 'public');
        }

        Category::create($validated);

        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.id' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'description' => 'nullable|array',
            'icon' => 'nullable|image|max:2048',
            'platform_fee_percent' => 'nullable|numeric|min:0|max:100',
            'is_disaster_category' => 'boolean',
            'is_focus_program' => 'boolean',
            'pillar_image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($category->getTranslation('name', 'id') !== $validated['name']['id']) {
            $slug = Str::slug($validated['name']['id']);
            $originalSlug = $slug;
            $counter = 1;
            while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $slug = $originalSlug.'-'.$counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        if ($request->hasFile('icon')) {
            if ($category->icon) {
                Storage::disk('public')->delete($category->icon);
            }
            $validated['icon'] = $request->file('icon')->store('categories', 'public');
        }

        if ($request->hasFile('pillar_image')) {
            if ($category->pillar_image) {
                Storage::disk('public')->delete($category->pillar_image);
            }
            $validated['pillar_image'] = $request->file('pillar_image')->store('categories/pillars', 'public');
        }

        $validated['is_disaster_category'] = $validated['is_disaster_category'] ?? false;
        $validated['is_focus_program'] = $validated['is_focus_program'] ?? false;

        $category->update($validated);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // TODO: Ensure no campaigns are attached before deleting, or use soft deletes
        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }

    /**
     * Update the pillar settings of the specified resource.
     */
    public function updatePillar(\App\Http\Requests\UpdateCategoryPillarRequest $request, Category $category)
    {
        $validated = $request->validated();

        if ($request->hasFile('pillar_image')) {
            if ($category->pillar_image) {
                Storage::disk('public')->delete($category->pillar_image);
            }
            $validated['pillar_image'] = $request->file('pillar_image')->store('categories/pillars', 'public');
        }

        $category->update($validated);

        return redirect()->back()->with('success', 'Pengaturan Fokus Program berhasil diperbarui.');
    }
}
