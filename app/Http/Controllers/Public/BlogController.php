<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = \App\Models\BlogPostCache::orderBy('published_at', 'desc')
            ->paginate(12);

        return inertia('Public/Blog/Index', [
            'blogs' => $blogs,
        ]);
    }

    public function show($slug)
    {
        $blog = \App\Models\BlogPostCache::where('slug', $slug)
            ->firstOrFail();
            
        // Get related blogs (by category or just latest)
        $relatedBlogs = \App\Models\BlogPostCache::where('id', '!=', $blog->id)
            ->latest('published_at')
            ->take(3)
            ->get();

        return inertia('Public/Blog/Show', [
            'blog' => $blog,
            'relatedBlogs' => $relatedBlogs
        ]);
    }
}
