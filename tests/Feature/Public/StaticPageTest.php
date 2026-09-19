<?php

use App\Models\Page;
use Database\Seeders\PageSeeder;

beforeEach(function () {
    $this->seed(PageSeeder::class);
});

it('can render static page via /halaman/{slug}', function () {
    $response = $this->get('/halaman/syarat-ketentuan');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Page/Show')
        ->has('page.title')
        ->where('page.title', 'Syarat & Ketentuan')
    );
});

it('can access policy pages via clean URL aliases', function (string $url, string $expectedTitle) {
    $response = $this->get($url);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Page/Show')
        ->where('page.title', $expectedTitle)
    );
})->with([
    ['/syarat-ketentuan', 'Syarat & Ketentuan'],
    ['/kebijakan-privasi', 'Kebijakan Privasi'],
    ['/cara-donasi', 'Cara Berdonasi'],
    ['/pusat-bantuan', 'Pusat Bantuan & FAQ'],
]);

it('redirects /faq to /pusat-bantuan', function () {
    $response = $this->get('/faq');

    $response->assertRedirect('/pusat-bantuan');
});

it('returns 404 for inactive page', function () {
    $inactivePage = Page::create([
        'slug' => 'halaman-rahasia',
        'title' => ['id' => 'Halaman Rahasia'],
        'content_html' => ['id' => '<p>Rahasia</p>'],
        'is_active' => false,
    ]);

    $response = $this->get('/halaman/'.$inactivePage->slug);
    $response->assertNotFound();
});

it('returns 404 for non-existent page', function () {
    $response = $this->get('/halaman/halaman-tidak-ada-xyz');
    $response->assertNotFound();
});
