<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Page;
use App\Models\Program;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic sitemap XML.
     */
    public function index(): Response
    {
        $urls = [];

        // 1. Main Static Public Pages
        $staticRoutes = [
            ['url' => route('home'), 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => route('program.index'), 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => route('focus.index'), 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['url' => route('blog.index'), 'priority' => '0.8', 'changefreq' => 'daily'],
            ['url' => route('about.index'), 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => route('contact.create'), 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['url' => route('donation.lookup'), 'priority' => '0.6', 'changefreq' => 'weekly'],
            ['url' => route('page.pusat-bantuan'), 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => route('page.syarat-ketentuan'), 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => route('page.kebijakan-privasi'), 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => route('page.cara-donasi'), 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        foreach ($staticRoutes as $item) {
            $urls[] = [
                'loc' => $item['url'],
                'lastmod' => now()->startOfDay()->toAtomString(),
                'changefreq' => $item['changefreq'],
                'priority' => $item['priority'],
            ];
        }

        // 2. Active Focus Program Categories
        $categories = Category::where('is_focus_program', true)
            ->where('is_active', true)
            ->get();

        foreach ($categories as $category) {
            $urls[] = [
                'loc' => route('focus.show', $category->slug),
                'lastmod' => ($category->updated_at ?? now())->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        // 3. Published Programs / Campaigns
        $programs = Program::where('status', 'published')
            ->latest('updated_at')
            ->get();

        foreach ($programs as $program) {
            $urls[] = [
                'loc' => route('program.show', $program->slug),
                'lastmod' => ($program->updated_at ?? $program->published_at ?? now())->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.9',
            ];
        }

        // 4. Published Blog / News Posts
        $blogs = BlogPostCache::published()
            ->latest('published_at')
            ->get();

        foreach ($blogs as $blog) {
            $urls[] = [
                'loc' => route('blog.show', $blog->slug),
                'lastmod' => ($blog->synced_at ?? $blog->updated_at ?? $blog->published_at ?? now())->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        // 5. Additional CMS Pages
        $specialSlugs = ['pusat-bantuan', 'syarat-ketentuan', 'kebijakan-privasi', 'cara-donasi'];
        $extraPages = Page::where('is_active', true)
            ->whereNotIn('slug', $specialSlugs)
            ->get();

        foreach ($extraPages as $page) {
            $urls[] = [
                'loc' => route('page.show', $page->slug),
                'lastmod' => ($page->updated_at ?? now())->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.5',
            ];
        }

        $xml = view('sitemap.index', compact('urls'))->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
        ]);
    }
}
