<?php

use App\Models\Page;
use Database\Seeders\FaqSeeder;
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
    ['/pusat-bantuan', 'Pusat Bantuan & Tanya Jawab'],
    ['/logo', 'Panduan Logo & Identitas Visual'],
]);

it('redirects /faq to /pusat-bantuan', function () {
    $response = $this->get('/faq');

    $response->assertRedirect('/pusat-bantuan');
});

it('redirects /panduan-logo to /logo', function () {
    $response = $this->get('/panduan-logo');

    $response->assertRedirect('/logo');
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

it('can render about page with management team', function () {
    $response = $this->get('/tentang-kami');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/About/Index')
        ->has('management')
    );
});

it('renders pusat bantuan with logo guideline faq in active locale', function () {
    $this->seed(FaqSeeder::class);

    $response = $this->get('/pusat-bantuan');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Page/Show')
        ->has('faqs')
        ->where('faqs', function ($faqs) {
            $logoFaq = collect($faqs)->first(fn ($item) => str_contains($item['question'], 'logo resmi Insani Indonesia'));

            return $logoFaq !== null && str_contains($logoFaq['answer'], '/logo');
        })
    );
});

it('translates pusat bantuan logo faq correctly across en and ar locales', function (string $locale, string $keywordInQuestion, string $keywordInAnswer) {
    $this->seed(FaqSeeder::class);

    app()->setLocale($locale);

    $response = $this->get('/pusat-bantuan');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Page/Show')
        ->where('faqs', function ($faqs) use ($keywordInQuestion, $keywordInAnswer) {
            $logoFaq = collect($faqs)->first(fn ($item) => str_contains($item['question'], $keywordInQuestion));

            return $logoFaq !== null && str_contains($logoFaq['answer'], $keywordInAnswer);
        })
    );
})->with([
    ['en', 'official Insani Indonesia logo', '/logo'],
    ['ar', 'الشعار الرسمي', '/logo'],
]);
