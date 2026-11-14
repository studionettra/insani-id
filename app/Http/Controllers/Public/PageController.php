<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Page;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug)
    {
        // Prevent duplicate content & canonical mismatch for core pages with dedicated clean routes
        $cleanAliases = [
            'logo' => 'page.logo',
            'pusat-bantuan' => 'page.pusat-bantuan',
            'syarat-ketentuan' => 'page.syarat-ketentuan',
            'kebijakan-privasi' => 'page.kebijakan-privasi',
            'cara-donasi' => 'page.cara-donasi',
        ];

        if (isset($cleanAliases[$slug])) {
            return redirect()->route($cleanAliases[$slug], [], 301);
        }

        return $this->renderPage($slug);
    }

    /**
     * Render the CMS page view.
     */
    protected function renderPage(string $slug): Response
    {
        $page = Page::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return inertia('Public/Page/Show', [
            'page' => [
                'slug' => $page->slug,
                'title' => $page->title,
                'content_html' => $page->content_html,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'attachment_url' => $page->attachment_url ? asset('storage/'.$page->attachment_url) : null,
            ],
        ]);
    }

    public function syaratKetentuan(): Response
    {
        return $this->renderPage('syarat-ketentuan');
    }

    public function kebijakanPrivasi(): Response
    {
        return $this->renderPage('kebijakan-privasi');
    }

    public function caraDonasi(): Response
    {
        return $this->renderPage('cara-donasi');
    }

    public function logoGuideline(): Response
    {
        return $this->renderPage('logo');
    }

    public function pusatBantuan(): Response
    {
        $page = Page::where('slug', 'pusat-bantuan')->first();
        $locale = app()->getLocale();

        $faqs = Faq::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($faq) => [
                'id' => (string) $faq->id,
                'category' => $faq->category ?: 'umum',
                'question' => $faq->getTranslation('question', $locale),
                'answer' => $faq->getTranslation('answer_html', $locale),
                'keywords' => array_values(array_filter(array_map('trim', explode(',', (string) $faq->keywords)))),
            ]);

        return inertia('Public/Page/Show', [
            'page' => [
                'slug' => 'pusat-bantuan',
                'title' => $page?->title ?? 'Pusat Bantuan & Panduan Donatur',
                'content_html' => $page?->content_html ?? '',
                'meta_title' => $page?->meta_title ?? 'Pusat Bantuan & FAQ - Insani Indonesia',
                'meta_description' => $page?->meta_description ?? 'Pusat bantuan resmi dan tanya jawab seputar donasi, kampanye, dan legalitas di Insani Indonesia.',
                'attachment_url' => null,
            ],
            'faqs' => $faqs,
        ]);
    }
}
