<?php

use App\Models\Category;

it('limits focus programs to a maximum of 6 on homepage and respects sort_order', function () {
    // Buat 8 kategori fokus program aktif dengan sort_order berbeda
    for ($i = 1; $i <= 8; $i++) {
        Category::create([
            'name' => ['id' => "Fokus Program {$i}", 'en' => "Focus Program {$i}"],
            'slug' => "fokus-program-{$i}",
            'is_focus_program' => true,
            'is_active' => true,
            'sort_order' => $i,
        ]);
    }

    // Buat kategori non-aktif dan kategori non-fokus program
    Category::create([
        'name' => ['id' => 'Fokus Non-Aktif'],
        'slug' => 'fokus-non-aktif',
        'is_focus_program' => true,
        'is_active' => false,
        'sort_order' => 0,
    ]);

    Category::create([
        'name' => ['id' => 'Kategori Biasa'],
        'slug' => 'kategori-biasa',
        'is_focus_program' => false,
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Home/Index')
        ->has('focusPrograms', 6)
        ->where('focusPrograms.0.slug', 'fokus-program-1')
        ->where('focusPrograms.5.slug', 'fokus-program-6')
    );
});

it('gracefully renders homepage when fewer than 6 focus programs exist', function () {
    for ($i = 1; $i <= 3; $i++) {
        Category::create([
            'name' => ['id' => "Fokus Program {$i}", 'en' => "Focus Program {$i}"],
            'slug' => "fokus-program-{$i}",
            'is_focus_program' => true,
            'is_active' => true,
            'sort_order' => $i,
        ]);
    }

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Home/Index')
        ->has('focusPrograms', 3)
    );
});
