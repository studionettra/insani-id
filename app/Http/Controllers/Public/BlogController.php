<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = BlogPostCache::orderBy('published_at', 'desc')
            ->paginate(12);

        return inertia('Public/Blog/Index', [
            'blogs' => $blogs,
        ]);
    }

    public function show($slug)
    {
        $blog = BlogPostCache::where('slug', $slug)
            ->firstOrFail();

        // Get related blogs (by category or just latest)
        $relatedBlogs = BlogPostCache::where('id', '!=', $blog->id)
            ->latest('published_at')
            ->take(3)
            ->get();

        return inertia('Public/Blog/Show', [
            'blog' => $blog,
            'relatedBlogs' => $relatedBlogs,
        ]);
    }
}
