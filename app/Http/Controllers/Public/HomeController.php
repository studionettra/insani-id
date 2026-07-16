<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $banners = \App\Models\HomepageBanner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $stats = \App\Models\ImpactStat::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $partners = \App\Models\Partner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $focusPrograms = \App\Models\Category::where('is_focus_program', true)
            ->orderBy('name')
            ->get();

        $latestPrograms = \App\Models\Program::with('category')
            ->where('status', 'published')
            ->latest()
            ->take(3)
            ->get();

        $latestBlogs = \App\Models\BlogPostCache::latest('published_at')
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
