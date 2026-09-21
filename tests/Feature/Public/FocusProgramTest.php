<?php

use App\Models\Category;
use App\Models\Program;

it('can render public focus programs list page', function () {
    $pillar = Category::create([
        'name' => ['id' => 'Pendidikan Insani', 'en' => 'Insani Education'],
        'slug' => 'pendidikan-insani',
        'is_focus_program' => true,
        'is_active' => true,
    ]);

    $response = $this->get('/fokus-program');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/FocusProgram/Index')
        ->has('pillars')
    );
});

it('can render dedicated focus program show page', function () {
    $pillar = Category::create([
        'name' => ['id' => 'Ketahanan Pangan', 'en' => 'Food Security'],
        'slug' => 'ketahanan-pangan',
        'description' => ['id' => 'Deskripsi pangan'],
        'is_focus_program' => true,
        'is_active' => true,
        'reality_title' => ['id' => 'Realitas Krisis Pangan'],
        'reality_description' => ['id' => 'Banyak keluarga membutuhkan pangan.'],
        'reality_source' => 'Sumber: BPS 2026',
        'stats_metrics' => [
            ['value' => '2.5 Juta', 'label' => ['id' => 'Warga Terdampak'], 'icon' => 'Users'],
        ],
        'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ]);

    $program = Program::factory()->create([
        'category_id' => $pillar->id,
        'status' => 'published',
    ]);

    $response = $this->get('/fokus-program/'.$pillar->slug);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/FocusProgram/Show')
        ->has('pillar')
        ->has('programs')
        ->has('otherPillars')
        ->where('pillar.slug', 'ketahanan-pangan')
    );
});

it('returns 404 if category is not a focus program or inactive', function () {
    $regularCategory = Category::create([
        'name' => ['id' => 'Kategori Biasa'],
        'slug' => 'kategori-biasa',
        'is_focus_program' => false,
        'is_active' => true,
    ]);

    $response = $this->get('/fokus-program/'.$regularCategory->slug);
    $response->assertNotFound();

    $inactivePillar = Category::create([
        'name' => ['id' => 'Pilar Nonaktif'],
        'slug' => 'pilar-nonaktif',
        'is_focus_program' => true,
        'is_active' => false,
    ]);

    $responseInactive = $this->get('/fokus-program/'.$inactivePillar->slug);
    $responseInactive->assertNotFound();
});
