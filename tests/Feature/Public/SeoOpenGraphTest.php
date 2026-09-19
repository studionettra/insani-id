<?php

use App\Models\BlogPostCache;
use App\Models\Page;
use App\Models\Program;
use App\Models\User;

it('renders OpenGraph meta tags on program detail page for crawlers', function () {
    $program = Program::factory()->published()->create([
        'title' => ['id' => 'Bantu Renovasi Musholla Insani'],
        'story' => ['id' => '<p>Program kebaikan untuk merenovasi musholla yang membutuhkan bantuan mendesak.</p>'],
        'cover_image' => 'programs/covers/test-cover.jpg',
    ]);

    $response = $this->get("/program/{$program->slug}");

    $response->assertOk();
    $response->assertSee('<meta property="og:title" content="Bantu Renovasi Musholla Insani - Insani Indonesia"', false);
    $response->assertSee('<meta property="og:type" content="website"', false);
    $response->assertSee('<meta property="og:image" content="'.asset('storage/programs/covers/test-cover.jpg').'"', false);
    $response->assertSee('<meta property="og:site_name" content="Insani Indonesia"', false);
    $response->assertSee('<meta name="twitter:card" content="summary_large_image"', false);
    $response->assertSee('Program kebaikan untuk merenovasi musholla', false);
});

it('renders OpenGraph meta tags on blog detail page for crawlers', function () {
    $blog = BlogPostCache::create([
        'wp_post_id' => 99991,
        'title' => 'Penyaluran Paket Pangan Ramadhan Insani',
        'slug' => 'penyaluran-paket-pangan-ramadhan',
        'excerpt' => 'Alhamdulillah telah tersalurkan 500 paket pangan ke masyarakat.',
        'content_html' => '<p>Alhamdulillah telah tersalurkan 500 paket pangan ke masyarakat.</p>',
        'featured_image_url' => 'https://example.com/blog-hero.jpg',
        'published_at' => now(),
        'synced_at' => now(),
    ]);

    $response = $this->get("/berita/{$blog->slug}");

    $response->assertOk();
    $response->assertSee('<meta property="og:title" content="Penyaluran Paket Pangan Ramadhan Insani - Insani Indonesia"', false);
    $response->assertSee('<meta property="og:type" content="article"', false);
    $response->assertSee('<meta property="og:image" content="https://example.com/blog-hero.jpg"', false);
    $response->assertSee('<meta property="og:site_name" content="Insani Indonesia"', false);
    $response->assertSee('Alhamdulillah telah tersalurkan 500 paket pangan', false);
});

it('renders fallback OpenGraph meta tags on homepage and public pages', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertSee('<meta property="og:title"', false);
    $response->assertSee('<meta property="og:site_name" content="Insani Indonesia"', false);
    $response->assertSee('<meta property="og:image"', false);
    $response->assertSee(asset('images/logo/logo-landscape-color.png'), false);
});

it('renders static CMS page OpenGraph tags with custom meta if available', function () {
    $page = Page::create([
        'slug' => 'kebijakan-privasi-test',
        'title' => ['id' => 'Kebijakan Privasi Pengguna'],
        'meta_title' => 'Kebijakan Privasi Khusus',
        'meta_description' => 'Informasi perlindungan data dan privasi pengguna Insani Indonesia.',
        'content_html' => ['id' => '<p>Ketentuan privasi.</p>'],
        'is_active' => true,
    ]);

    $response = $this->get("/halaman/{$page->slug}");

    $response->assertOk();
    $response->assertSee('<meta property="og:title" content="Kebijakan Privasi Khusus - Insani Indonesia"', false);
    $response->assertSee('<meta property="og:description" content="Informasi perlindungan data dan privasi pengguna Insani Indonesia."', false);
});

it('does not render public OpenGraph tags on dashboard/admin pages', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSee('<meta name="robots" content="noindex, nofollow"', false);
    $response->assertDontSee('<meta property="og:site_name"', false);
});
