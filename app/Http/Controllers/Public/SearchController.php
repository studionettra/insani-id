<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Page;
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
                'pages' => [],
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

        // 4. Search Database Static Pages
        $dbPages = Page::where('is_active', true)
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('meta_description', 'like', "%{$q}%");
            })
            ->take(3)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'meta_description' => $p->meta_description,
                    'url' => route('page.show', $p->slug),
                ];
            });

        // 5. Search System Routes (Hardcoded Navbar pages)
        $systemPages = collect([
            ['title' => 'Tentang Kami', 'slug' => 'tentang-kami', 'meta_description' => 'Profil dan Latar Belakang Yayasan', 'url' => route('about.index')],
            ['title' => 'Kontak & Alamat', 'slug' => 'kontak', 'meta_description' => 'Hubungi Customer Service atau kunjungi kantor kami', 'url' => route('contact.create')],
            ['title' => 'Semua Program Donasi', 'slug' => 'program', 'meta_description' => 'Daftar semua program penggalangan dana yang sedang berjalan', 'url' => route('program.index')],
            ['title' => 'Fokus Program Utama', 'slug' => 'fokus-program', 'meta_description' => 'Kategori dan pilar kebaikan Insani Indonesia', 'url' => route('focus.index')],
            ['title' => 'Berita & Artikel', 'slug' => 'berita', 'meta_description' => 'Kabar terbaru dan cerita inspiratif', 'url' => route('blog.index')],
            ['title' => 'Laporan Keuangan', 'slug' => 'laporan-keuangan', 'meta_description' => 'Transparansi laporan keuangan dan audit', 'url' => route('financial-reports.index')],
            ['title' => 'Cek Status Donasi', 'slug' => 'cek-donasi', 'meta_description' => 'Lacak donasi dan unduh kuitansi resmi', 'url' => route('donation.lookup')],
            ['title' => 'Pusat Bantuan (FAQ)', 'slug' => 'pusat-bantuan', 'meta_description' => 'Pertanyaan yang sering diajukan dan panduan pengguna', 'url' => route('page.pusat-bantuan')],
            ['title' => 'Daftar Campaigner', 'slug' => 'buat-program', 'meta_description' => 'Buat penggalangan dana dan verifikasi akun', 'url' => route('buat-program')],
        ])->filter(function ($page) use ($q) {
            $qLower = mb_strtolower($q);

            return str_contains(mb_strtolower($page['title']), $qLower)
                || str_contains(mb_strtolower($page['meta_description']), $qLower)
                || str_contains(mb_strtolower('alamat'), $qLower) && $page['slug'] === 'kontak';
        })->map(function ($page, $index) {
            return [
                'id' => 9000 + $index, // Fake ID
                'title' => $page['title'],
                'slug' => $page['slug'],
                'meta_description' => $page['meta_description'],
                'url' => $page['url'],
            ];
        })->values();

        $allPages = $dbPages->concat($systemPages)->take(5);

        return response()->json([
            'programs' => $programs,
            'focusPrograms' => $focusPrograms,
            'blogs' => $blogs,
            'pages' => $allPages,
        ]);
    }
}
