<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\HomepageBanner;
use App\Models\ImpactStat;
use App\Models\Partner;
use App\Models\Program;
use App\Models\Testimonial;

class HomeController extends Controller
{
    public function index()
    {
        $banners = HomepageBanner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $stats = ImpactStat::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $partners = Partner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $focusPrograms = Category::where('is_focus_program', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->take(6)
            ->get()
            ->map(function ($cat) {
                $cat->name_translations = $cat->getTranslations('name');
                $cat->public_name_translations = $cat->getTranslations('public_name');
                $cat->description_translations = $cat->getTranslations('description');

                return $cat;
            });

        // 1. Ambil program unggulan aktif terurut (maksimal 3)
        $featuredPrograms = Program::with('category')
            ->featured()
            ->take(3)
            ->get();

        $featuredCount = $featuredPrograms->count();
        $homePrograms = $featuredPrograms;

        // 2. Jika kurang dari 3, lengkapi kuota dengan program published aktif terbaru
        if ($featuredCount < 3) {
            $needed = 3 - $featuredCount;
            $fallbackPrograms = Program::with('category')
                ->publishedActive()
                ->whereNotIn('id', $featuredPrograms->pluck('id'))
                ->latest('published_at')
                ->latest('id')
                ->take($needed)
                ->get();

            $homePrograms = $featuredPrograms->concat($fallbackPrograms);
        }

        $latestBlogs = BlogPostCache::published()
            ->latest('published_at')
            ->take(3)
            ->get();

        $testimonials = Testimonial::where('is_active', true)
            ->orderBy('sort_order')
            ->take(6)
            ->get();

        return inertia('Public/Home/Index', [
            'banners' => $banners,
            'stats' => $stats,
            'partners' => $partners,
            'focusPrograms' => $focusPrograms,
            'programs' => $homePrograms,
            'blogs' => $latestBlogs,
            'testimonials' => $testimonials,
        ]);
    }
}
