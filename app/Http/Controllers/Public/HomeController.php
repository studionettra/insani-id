<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\HomepageBanner;
use App\Models\ImpactStat;
use App\Models\Partner;
use App\Models\Program;

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
            ->orderBy('name')
            ->get();

        $latestPrograms = Program::with('category')
            ->where('status', 'published')
            ->latest()
            ->take(3)
            ->get();

        $latestBlogs = BlogPostCache::latest('published_at')
            ->take(3)
            ->get();

        return inertia('Public/Home/Index', [
            'banners' => $banners,
            'stats' => $stats,
            'partners' => $partners,
            'focusPrograms' => $focusPrograms,
            'programs' => $latestPrograms,
            'blogs' => $latestBlogs,
        ]);
    }
}
