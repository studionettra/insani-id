<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Response;
use Mews\Purifier\Facades\Purifier;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $blogs = BlogPostCache::query()
            ->with('author:id,name')
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('wp_category', 'like', "%{$search}%");
                });
            })
            ->when($request->input('status'), function ($q, $status) {
                $q->where('status', $status);
            })
            ->orderBy('published_at', 'desc')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = BlogPostCache::query()
            ->whereNotNull('wp_category')
            ->where('wp_category', '!=', '')
            ->distinct()
            ->orderBy('wp_category')
            ->pluck('wp_category');

        return inertia('Admin/Blogs/Index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $categories = BlogPostCache::query()
            ->whereNotNull('wp_category')
            ->where('wp_category', '!=', '')
            ->distinct()
            ->orderBy('wp_category')
            ->pluck('wp_category');

        return inertia('Admin/Blogs/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_post_caches,slug',
            'excerpt' => 'nullable|string',
            'content_html' => 'required|string',
            'wp_category' => 'required|string|max:100',
            'featured_image' => 'nullable|image|max:3072',
            'status' => 'required|in:published,draft',
            'published_at' => 'nullable|date',
        ]);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $originalSlug = $slug;
        $count = 1;
        while (BlogPostCache::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }
        $validated['slug'] = $slug;

        $featuredImageUrl = null;
        if ($request->hasFile('featured_image')) {
            $featuredImageUrl = $request->file('featured_image')->store('blogs', 'public');
        }
        $validated['featured_image_url'] = $featuredImageUrl;
        unset($validated['featured_image']);

        $validated['content_html'] = Purifier::clean($validated['content_html']);
        $validated['author_id'] = auth()->id();
        $validated['published_at'] = ! empty($validated['published_at']) ? Carbon::parse($validated['published_at']) : now();

        BlogPostCache::create($validated);

        return redirect()->route('admin.blogs.index')->with('success', 'Berita berhasil diterbitkan.');
    }

    public function edit(BlogPostCache $blog): Response
    {
        $categories = BlogPostCache::query()
            ->whereNotNull('wp_category')
            ->where('wp_category', '!=', '')
            ->distinct()
            ->orderBy('wp_category')
            ->pluck('wp_category');

        return inertia('Admin/Blogs/Edit', [
            'blog' => $blog,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, BlogPostCache $blog): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('blog_post_caches', 'slug')->ignore($blog->id)],
            'excerpt' => 'nullable|string',
            'content_html' => 'required|string',
            'wp_category' => 'required|string|max:100',
            'featured_image' => 'nullable|image|max:3072',
            'status' => 'required|in:published,draft',
            'published_at' => 'nullable|date',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        if ($request->hasFile('featured_image')) {
            if ($blog->featured_image_url && ! str_starts_with($blog->featured_image_url, 'http')) {
                Storage::disk('public')->delete($blog->featured_image_url);
            }
            $validated['featured_image_url'] = $request->file('featured_image')->store('blogs', 'public');
        }
        unset($validated['featured_image']);

        $validated['content_html'] = Purifier::clean($validated['content_html']);
        $validated['published_at'] = ! empty($validated['published_at']) ? Carbon::parse($validated['published_at']) : $blog->published_at;

        $blog->update($validated);

        return redirect()->route('admin.blogs.index')->with('success', 'Berita berhasil diperbarui.');
    }

    public function destroy(BlogPostCache $blog): RedirectResponse
    {
        if ($blog->featured_image_url && ! str_starts_with($blog->featured_image_url, 'http')) {
            Storage::disk('public')->delete($blog->featured_image_url);
        }

        $blog->delete();

        return redirect()->back()->with('success', 'Berita berhasil dihapus.');
    }
}
