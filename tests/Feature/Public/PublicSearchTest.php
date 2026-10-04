<?php

use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Program;
use Database\Seeders\FaqSeeder;

it('returns search results matching query', function () {
    $pillar = Category::create([
        'name' => ['id' => 'Pendidikan Insani'],
        'slug' => 'pendidikan-insani',
        'is_focus_program' => true,
        'is_active' => true,
    ]);

    $program = Program::factory()->create([
        'title' => ['id' => 'Bantuan Beasiswa Pelajar'],
        'category_id' => $pillar->id,
        'status' => 'published',
    ]);

    $draftProgram = Program::factory()->create([
        'title' => ['id' => 'Draft Beasiswa Rahasia'],
        'category_id' => $pillar->id,
        'status' => 'draft',
    ]);

    $blog = BlogPostCache::create([
        'wp_id' => 9999,
        'slug' => 'berita-beasiswa-pendidikan',
        'title' => ['id' => 'Penyaluran Beasiswa Anak Yatim'],
        'excerpt' => ['id' => 'Kisah haru penerima beasiswa...'],
        'content_html' => ['id' => '<p>Konten</p>'],
        'status' => 'published',
        'published_at' => now(),
    ]);

    // Search query matching "Beasiswa"
    $response = $this->getJson('/api/public/search?q=Beasiswa');

    $response->assertOk();
    $response->assertJsonStructure([
        'programs',
        'focusPrograms',
        'blogs',
    ]);

    $data = $response->json();

    // Published program is found
    expect($data['programs'])->toHaveCount(1);
    expect($data['programs'][0]['id'])->toBe($program->id);

    // Blog is found
    expect($data['blogs'])->toHaveCount(1);
    expect($data['blogs'][0]['id'])->toBe($blog->id);
});

it('returns empty results for queries under 2 characters', function () {
    $response = $this->getJson('/api/public/search?q=a');

    $response->assertOk();
    expect($response->json('programs'))->toBeEmpty();
    expect($response->json('focusPrograms'))->toBeEmpty();
    expect($response->json('blogs'))->toBeEmpty();
    expect($response->json('pages'))->toBeEmpty();
    expect($response->json('faqs'))->toBeEmpty();
});

it('finds logo guidelines and logo faqs when searching "logo"', function () {
    $this->seed(FaqSeeder::class);

    $response = $this->getJson('/api/public/search?q=logo');

    $response->assertOk();
    $data = $response->json();

    // Pages should contain Logo Guideline
    $pageSlugs = collect($data['pages'])->pluck('slug')->toArray();
    expect($pageSlugs)->toContain('logo');

    // FAQs should contain logo questions
    $faqQuestions = collect($data['faqs'])->pluck('question')->implode(' ');
    expect($faqQuestions)->toContain('logo resmi Insani Indonesia');
});

it('accommodates short keywords and acronyms to find matching content', function (string $keyword, string $expectedPageSlug) {
    $response = $this->getJson('/api/public/search?q='.$keyword);

    $response->assertOk();
    $pageSlugs = collect($response->json('pages'))->pluck('slug')->toArray();

    expect($pageSlugs)->toContain($expectedPageSlug);
})->with([
    ['cs', 'kontak'],
    ['wa', 'kontak'],
    ['sk', 'syarat-ketentuan'],
    ['rek', 'cara-donasi'],
    ['bca', 'cara-donasi'],
    ['faq', 'pusat-bantuan'],
    ['kap', 'laporan-keuangan'],
    ['visi', 'tentang-kami'],
    ['slot', 'buat-program'],
    ['csr', 'kontak'],
]);
