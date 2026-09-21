<?php

use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Program;

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
});
