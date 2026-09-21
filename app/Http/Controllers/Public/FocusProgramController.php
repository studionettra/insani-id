<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;

class FocusProgramController extends Controller
{
    public function index()
    {
        $pillars = Category::where('is_focus_program', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($cat) {
                $cat->name_translations = $cat->getTranslations('name');
                $cat->description_translations = $cat->getTranslations('description');

                return $cat;
            });

        return inertia('Public/FocusProgram/Index', [
            'pillars' => $pillars,
        ]);
    }

    public function show(Category $category)
    {
        if (! $category->is_focus_program || ! $category->is_active) {
            abort(404);
        }

        $category->name_translations = $category->getTranslations('name');
        $category->description_translations = $category->getTranslations('description');
        $category->reality_title_translations = $category->getTranslations('reality_title');
        $category->reality_description_translations = $category->getTranslations('reality_description');

        $programs = $category->programs()
            ->with('category')
            ->where('status', 'published')
            ->latest()
            ->take(6)
            ->get();

        $otherPillars = Category::where('is_focus_program', true)
            ->where('is_active', true)
            ->where('id', '!=', $category->id)
            ->orderBy('sort_order')
            ->take(4)
            ->get()
            ->map(function ($cat) {
                $cat->name_translations = $cat->getTranslations('name');
                $cat->description_translations = $cat->getTranslations('description');

                return $cat;
            });

        return inertia('Public/FocusProgram/Show', [
            'pillar' => $category,
            'programs' => $programs,
            'otherPillars' => $otherPillars,
        ]);
    }
}
