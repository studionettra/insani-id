<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCategoryPillarRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class FocusProgramController extends Controller
{
    /**
     * Display a listing of the focus programs.
     */
    public function index(Request $request)
    {
        if (! Gate::allows('viewAny', Category::class)) {
            abort(403);
        }

        $search = $request->input('search');

        $focusProgramsQuery = Category::where('is_focus_program', true)
            ->withCount(['programs' => function ($q) {
                $q->where('status', 'published');
            }])
            ->orderBy('sort_order')
            ->orderBy('id', 'desc');

        if ($search) {
            $focusProgramsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('public_name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $focusPrograms = $focusProgramsQuery->get()->map(function ($c) {
            $c->name_translations = $c->getTranslations('name');
            $c->public_name_translations = $c->getTranslations('public_name');
            $c->description_translations = $c->getTranslations('description');
            $c->display_name = $c->display_name;

            // Hitung status kelengkapan konten
            $c->has_cover = ! empty($c->pillar_image);
            $c->has_reality = ! empty($c->getTranslation('reality_title', 'id', false))
                && ! empty($c->getTranslation('reality_description', 'id', false));
            $c->has_video = ! empty($c->video_url);
            $c->gallery_count = is_array($c->distribution_gallery) ? count($c->distribution_gallery) : 0;
            $c->metrics_count = is_array($c->stats_metrics) ? count($c->stats_metrics) : 0;

            return $c;
        });

        // Ambil kategori yang belum dijadikan Fokus Program untuk opsi Tambah/Aktifkan
        $availableCategories = Category::where('is_focus_program', false)
            ->orderBy('name')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->getTranslation('name', 'id') ?: $c->name,
                    'slug' => $c->slug,
                    'icon' => $c->icon,
                ];
            });

        return inertia('Admin/FocusProgram/Index', [
            'focusPrograms' => $focusPrograms,
            'availableCategories' => $availableCategories,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Activate a regular category as a focus program.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
        ]);

        $category = Category::findOrFail($validated['category_id']);

        if (! Gate::allows('updatePillar', $category)) {
            abort(403);
        }

        $category->update([
            'is_focus_program' => true,
        ]);

        return redirect()->route('admin.focus-programs.edit', $category)
            ->with('success', "Kategori \"{$category->name}\" berhasil diaktifkan sebagai Fokus Program. Silakan lengkapi informasinya.");
    }

    /**
     * Show the form for editing the specified focus program.
     */
    public function edit(Category $category)
    {
        if (! Gate::allows('updatePillar', $category)) {
            abort(403);
        }

        $category->name_translations = $category->getTranslations('name');
        $category->public_name_translations = $category->getTranslations('public_name');
        $category->description_translations = $category->getTranslations('description');
        $category->reality_title_translations = $category->getTranslations('reality_title');
        $category->reality_description_translations = $category->getTranslations('reality_description');
        $category->display_name = $category->display_name;

        // Ambil contoh program terkait yang aktif
        $relatedPrograms = $category->programs()
            ->where('status', 'published')
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'slug', 'target_amount', 'collected_amount', 'status']);

        return inertia('Admin/FocusProgram/Edit', [
            'category' => $category,
            'relatedPrograms' => $relatedPrograms,
        ]);
    }

    /**
     * Update the specified focus program in storage.
     */
    public function update(UpdateCategoryPillarRequest $request, Category $category)
    {
        $validated = $request->validated();

        if ($request->hasFile('pillar_image')) {
            if ($category->pillar_image) {
                Storage::disk('public')->delete($category->pillar_image);
            }
            $validated['pillar_image'] = $request->file('pillar_image')->store('categories/pillars', 'public');
        } else {
            unset($validated['pillar_image']);
        }

        // Process stats_metrics if string
        if (isset($validated['stats_metrics']) && is_string($validated['stats_metrics'])) {
            $validated['stats_metrics'] = json_decode($validated['stats_metrics'], true) ?: [];
        }

        // Process gallery
        $currentGallery = $category->distribution_gallery ?? [];
        $existingKept = $validated['existing_gallery'] ?? [];

        $removedImages = array_diff($currentGallery, $existingKept);
        foreach ($removedImages as $removed) {
            Storage::disk('public')->delete($removed);
        }

        $gallery = array_values($existingKept);
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $gallery[] = $file->store('categories/gallery', 'public');
            }
        }
        $validated['distribution_gallery'] = $gallery;
        unset($validated['gallery_images'], $validated['existing_gallery']);

        $category->update($validated);

        return redirect()->route('admin.focus-programs.index')
            ->with('success', 'Fokus Program berhasil diperbarui.');
    }

    /**
     * Toggle the status of a focus program.
     */
    public function toggleStatus(Category $category)
    {
        if (! Gate::allows('updatePillar', $category)) {
            abort(403);
        }

        $category->is_focus_program = ! $category->is_focus_program;
        $category->save();

        $statusText = $category->is_focus_program ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Status Fokus Program untuk {$category->name} berhasil {$statusText}.");
    }
}
