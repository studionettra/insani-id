<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $category = $request->input('category');

        $blogs = BlogPostCache::published()
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('content_html', 'like', "%{$search}%");
                });
            })
            ->when($category, function ($q, $category) {
                $q->where('wp_category', $category);
            })
            ->orderBy('published_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        $categories = BlogPostCache::published()
            ->whereNotNull('wp_category')
            ->where('wp_category', '!=', '')
            ->distinct()
            ->orderBy('wp_category')
            ->pluck('wp_category');

        return inertia('Public/Blog/Index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? '',
            ],
        ]);
    }

    public function show($slug)
    {
        $blog = BlogPostCache::published()
            ->where('slug', $slug)
            ->firstOrFail();

        $sessionKey = 'viewed_blog_'.$blog->id;
        if (! session()->has($sessionKey)) {
            $blog->increment('views_count');
            session()->put($sessionKey, now()->timestamp);
        }

        // Get related blogs (prefer same category first, fallback to latest)
        $relatedBlogs = BlogPostCache::published()
            ->where('id', '!=', $blog->id)
            ->when($blog->wp_category, function ($q, $cat) {
                $q->orderByRaw('CASE WHEN wp_category = ? THEN 0 ELSE 1 END', [$cat]);
            })
            ->latest('published_at')
            ->take(3)
            ->get();

        return inertia('Public/Blog/Show', [
            'blog' => $blog,
            'relatedBlogs' => $relatedBlogs,
        ]);
    }
}
