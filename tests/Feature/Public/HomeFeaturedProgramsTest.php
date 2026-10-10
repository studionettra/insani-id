<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // Clear programs if any exist in the database for isolated assertions
    Program::query()->forceDelete();
});

it('returns featured programs ordered by featured_order on homepage', function () {
    $category = Category::factory()->create();
    $user = User::factory()->create();

    // Buat 3 program unggulan dengan order acak
    $p1 = Program::factory()->published()->featured(2)->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Unggulan Kedua'],
    ]);

    $p2 = Program::factory()->published()->featured(1)->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Unggulan Pertama'],
    ]);

    $p3 = Program::factory()->published()->featured(3)->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Unggulan Ketiga'],
    ]);

    // Buat program biasa tambahan yang tidak boleh tampil karena slot unggulan sudah penuh 3
    Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Biasa'],
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Home/Index')
        ->has('programs', 3)
        ->where('programs.0.id', $p2->id) // featured_order 1
        ->where('programs.1.id', $p1->id) // featured_order 2
        ->where('programs.2.id', $p3->id) // featured_order 3
    );
});

it('fills remaining slots with latest published programs when fewer than 3 featured programs exist', function () {
    $category = Category::factory()->create();
    $user = User::factory()->create();

    // 1 Program unggulan
    $featured = Program::factory()->published()->featured(1)->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Unggulan Utama'],
        'published_at' => now()->subDays(5),
    ]);

    // 2 Program biasa terbaru
    $latest1 = Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Biasa Baru 1'],
        'published_at' => now()->subDay(),
    ]);

    $latest2 = Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Biasa Baru 2'],
        'published_at' => now()->subHours(2),
    ]);

    // Program biasa ketiga (tidak boleh masuk karena kuota hanya 3)
    Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'title' => ['id' => 'Program Biasa Lama'],
        'published_at' => now()->subDays(10),
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Home/Index')
        ->has('programs', 3)
        ->where('programs.0.id', $featured->id) // Unggulan selalu di depan
        ->where('programs.1.id', $latest2->id)  // Fallback terbaru 1
        ->where('programs.2.id', $latest1->id)  // Fallback terbaru 2
    );
});

it('falls back to latest published programs when no featured programs exist', function () {
    $category = Category::factory()->create();
    $user = User::factory()->create();

    $p1 = Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'published_at' => now()->subMinutes(10),
    ]);
    $p2 = Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'published_at' => now()->subMinutes(20),
    ]);
    $p3 = Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'published_at' => now()->subMinutes(30),
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Home/Index')
        ->has('programs', 3)
        ->where('programs.0.id', $p1->id)
        ->where('programs.1.id', $p2->id)
        ->where('programs.2.id', $p3->id)
    );
});

it('excludes expired featured programs from homepage', function () {
    $category = Category::factory()->create();
    $user = User::factory()->create();

    // Program unggulan yang deadline-nya sudah lewat kemarin
    Program::factory()->published()->featured(1)->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'deadline' => now()->subDay()->toDateString(),
    ]);

    // Program aktif biasa
    $active = Program::factory()->published()->create([
        'category_id' => $category->id,
        'created_by' => $user->id,
        'deadline' => now()->addMonth()->toDateString(),
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Home/Index')
        ->has('programs', 1)
        ->where('programs.0.id', $active->id)
    );
});
