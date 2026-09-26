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
            ->get()
            ->map(function ($cat) {
                $cat->name_translations = $cat->getTranslations('name');
                $cat->public_name_translations = $cat->getTranslations('public_name');
                $cat->description_translations = $cat->getTranslations('description');

                return $cat;
            });

        $latestPrograms = Program::with('category')
            ->where('status', 'published')
            ->latest()
            ->take(3)
            ->get();

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
            'programs' => $latestPrograms,
            'blogs' => $latestBlogs,
            'testimonials' => $testimonials,
        ]);
    }
}
