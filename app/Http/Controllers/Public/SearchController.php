<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Public instant search for programs, focus pillars, and articles.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim($request->query('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([
                'programs' => [],
                'focusPrograms' => [],
                'blogs' => [],
            ]);
        }

        // 1. Search Published Programs
        $programs = Program::with('category')
            ->where('status', 'published')
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('story', 'like', "%{$q}%");
            })
            ->latest('published_at')
            ->take(5)
            ->get()
            ->map(function ($p) {
                $target = (float) ($p->target_amount ?? 0);
                $collected = (float) ($p->collected_amount ?? 0);
                $percentage = $target > 0 ? min(100, round(($collected / $target) * 100)) : 0;

                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'cover_image' => $p->cover_image,
                    'collected_amount' => $collected,
                    'target_amount' => $target,
                    'percentage' => $percentage,
                    'category_name' => $p->category?->name,
                    'url' => route('program.show', $p->slug),
                ];
            });

        // 2. Search Active Focus Programs / Pillars
        $focusPrograms = Category::where('is_focus_program', true)
            ->where('is_active', true)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            })
            ->take(3)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'pillar_image' => $c->pillar_image,
                    'url' => route('focus.show', $c->slug),
                ];
            });

        // 3. Search Published Blog Posts
        $blogs = BlogPostCache::published()
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('excerpt', 'like', "%{$q}%");
            })
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'featured_image_url' => $b->featured_image_url,
                    'published_at' => $b->published_at ? $b->published_at->format('d M Y') : null,
                    'url' => route('blog.show', $b->slug),
                ];
            });

        return response()->json([
            'programs' => $programs,
            'focusPrograms' => $focusPrograms,
            'blogs' => $blogs,
        ]);
    }
}
