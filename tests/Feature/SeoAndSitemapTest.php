<?php

use App\Services\SeoService;

test('sitemap xml endpoint returns 200 and valid xml content', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/xml; charset=utf-8');

    $content = $response->getContent();
    expect($content)
        ->toContain('<?xml version="1.0" encoding="UTF-8"?>')
        ->toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
        ->toContain('<loc>')
        ->toContain('<changefreq>')
        ->toContain('<priority>')
        ->toContain('/program')
        ->toContain('/berita')
        ->toContain('/tentang-kami');
});

test('seo service resolves home metadata and json-ld schema correctly', function () {
    $seo = SeoService::resolve([
        'component' => 'Public/Home/Index',
        'props' => [],
    ]);

    expect($seo['is_private'])->toBeFalse();
    expect($seo['title'])->toContain('Insani Indonesia');
    expect($seo['schema'])->not()->toBeNull();
    expect($seo['schema']['@graph'][0]['@type'])->toBe('NGO');
    expect($seo['schema']['@graph'][1]['@type'])->toBe('WebSite');
});

test('seo service resolves program listing metadata correctly', function () {
    $seo = SeoService::resolve([
        'component' => 'Public/Program/Listing',
        'props' => [],
    ]);

    expect($seo['title'])->toBe('Daftar Program Donasi - Insani Indonesia');
    expect($seo['is_private'])->toBeFalse();
});

test('seo service resolves program show metadata and donateaction schema', function () {
    $seo = SeoService::resolve([
        'component' => 'Public/Program/Show',
        'props' => [
            'program' => [
                'id' => 1,
                'title' => ['id' => 'Bantu Korban Bencana'],
                'story' => ['id' => 'Mari bantu sesama yang terdampak bencana.'],
                'cover_image' => 'programs/cover1.jpg',
            ],
        ],
    ]);

    expect($seo['title'])->toBe('Bantu Korban Bencana - Insani Indonesia');
    expect($seo['description'])->toBe('Mari bantu sesama yang terdampak bencana.');
    expect($seo['schema'])->not()->toBeNull();
    expect($seo['schema']['@graph'][1]['@type'])->toBe('BreadcrumbList');
    expect($seo['schema']['@graph'][2]['mainEntity']['@type'])->toBe('DonateAction');
});

test('seo service marks dashboard or admin components as private', function () {
    // Simulate admin path
    $this->get('/admin');

    $seo = SeoService::resolve([
        'component' => 'Admin/Dashboard/Index',
        'props' => [],
    ]);

    expect($seo['is_private'])->toBeTrue();
});

test('public home page renders meta tags and json ld schema in html', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertSee('<meta property="og:title"', false);
    $response->assertSee('<meta name="description"', false);
    $response->assertSee('<script type="application/ld+json">', false);
    $response->assertSee('"@type": "NGO"', false);
});
