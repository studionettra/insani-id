<?php

use App\Models\BlogPostCache;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    BlogPostCache::query()->delete();

    BlogPostCache::create([
        'title' => 'Bantuan Yatim Piatu di Desa Sukamaju',
        'slug' => 'bantuan-yatim-piatu-desa-sukamaju',
        'excerpt' => 'Penyaluran santunan bagi anak yatim.',
        'content_html' => '<p>Penyaluran santunan bagi 50 anak yatim berlangsung lancar.</p>',
        'featured_image_url' => 'https://example.com/yatim.jpg',
        'wp_category' => 'Kabar Yatim',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    BlogPostCache::create([
        'title' => 'Penyediaan Air Bersih di Gunungkidul',
        'slug' => 'penyediaan-air-bersih-gunungkidul',
        'excerpt' => 'Distribusi air bersih darurat kekeringan.',
        'content_html' => '<p>Distribusi 100 tangki air bersih telah selesai.</p>',
        'featured_image_url' => 'https://example.com/air.jpg',
        'wp_category' => 'Kemanusiaan',
        'status' => 'published',
        'published_at' => now()->subDays(2),
    ]);
});

it('renders blog index page with articles and categories', function () {
    $response = $this->get('/berita');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Blog/Index')
        ->has('blogs.data', 2)
        ->has('categories', 2)
        ->where('categories.0', 'Kabar Yatim')
        ->where('categories.1', 'Kemanusiaan')
    );
});

it('filters blog posts by category', function () {
    $response = $this->get('/berita?category=Kabar+Yatim');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Blog/Index')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.title', 'Bantuan Yatim Piatu di Desa Sukamaju')
        ->where('filters.category', 'Kabar Yatim')
    );
});

it('filters blog posts by search query', function () {
    $response = $this->get('/berita?search=Air+Bersih');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Blog/Index')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.title', 'Penyediaan Air Bersih di Gunungkidul')
        ->where('filters.search', 'Air Bersih')
    );
});

it('renders blog detail page with content', function () {
    $response = $this->get('/berita/bantuan-yatim-piatu-desa-sukamaju');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Blog/Show')
        ->where('blog.title', 'Bantuan Yatim Piatu di Desa Sukamaju')
        ->where('blog.content_html', '<p>Penyaluran santunan bagi 50 anak yatim berlangsung lancar.</p>')
        ->where('blog.content', '<p>Penyaluran santunan bagi 50 anak yatim berlangsung lancar.</p>')
        ->has('relatedBlogs')
    );
});
