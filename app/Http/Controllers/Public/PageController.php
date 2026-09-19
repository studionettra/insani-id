<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug): Response
    {
        $page = Page::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return inertia('Public/Page/Show', [
            'page' => [
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
        return $this->show('syarat-ketentuan');
    }

    public function kebijakanPrivasi(): Response
    {
        return $this->show('kebijakan-privasi');
    }

    public function caraDonasi(): Response
    {
        return $this->show('cara-donasi');
    }

    public function pusatBantuan(): Response
    {
        return $this->show('pusat-bantuan');
    }
}
