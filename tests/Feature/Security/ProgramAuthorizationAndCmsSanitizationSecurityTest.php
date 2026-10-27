<?php

use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Page;
use App\Models\Program;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Storage::fake('local');

    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->viewer = User::factory()->create();
    $this->viewer->assignRole('Eksekutif');
    $this->viewer->givePermissionTo('program.view');

    $this->creator = User::factory()->create();
    $this->creator->assignRole('Program Officer');
    $this->creator->givePermissionTo(['program.view', 'program.create']);

    $this->verifier = User::factory()->create();
    $this->verifier->assignRole('Verifikator');
    $this->verifier->givePermissionTo(['program.view', 'program.publish', 'program.reject', 'program.close']);

    $this->editor = User::factory()->create();
    $this->editor->assignRole('Content Editor');
    $this->editor->givePermissionTo(['manage_blog', 'manage_pages']);

    $this->category = Category::factory()->create([
        'is_active' => true,
    ]);

    $this->sampleProgram = Program::factory()->create([
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'status' => 'pending_verification',
        'is_featured' => false,
    ]);
});

test('user with program.view only cannot access create program form', function () {
    $this->actingAs($this->viewer)
        ->get('/admin/programs/create')
        ->assertForbidden();
});

test('user with program.view only cannot store program', function () {
    $this->actingAs($this->viewer)
        ->post('/admin/programs', [
            'title' => 'Program Ilegal Viewer',
            'category_id' => $this->category->id,
            'story' => '<p>Deskripsi program</p>',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ])
        ->assertForbidden();

    expect(Program::where('title->id', 'Program Ilegal Viewer')->exists())->toBeFalse();
});

test('user with program.view only cannot access edit program form', function () {
    $this->actingAs($this->viewer)
        ->get("/admin/programs/{$this->sampleProgram->id}/edit")
        ->assertForbidden();
});

test('user with program.view only cannot update program', function () {
    $this->actingAs($this->viewer)
        ->put("/admin/programs/{$this->sampleProgram->id}", [
            'title' => 'Judul Dimanipulasi Viewer',
            'category_id' => $this->category->id,
            'story' => '<p>Deskripsi diubah</p>',
        ])
        ->assertForbidden();

    expect($this->sampleProgram->fresh()->getTranslation('title', 'id'))->not->toBe('Judul Dimanipulasi Viewer');
});

test('user with program.view only cannot delete program', function () {
    $this->actingAs($this->viewer)
        ->delete("/admin/programs/{$this->sampleProgram->id}")
        ->assertForbidden();

    expect(Program::find($this->sampleProgram->id))->not->toBeNull();
});

test('user with program.view only cannot moderate program status', function () {
    $this->actingAs($this->viewer)
        ->put("/admin/programs/{$this->sampleProgram->id}/status", [
            'status' => 'published',
        ])
        ->assertForbidden();

    expect($this->sampleProgram->fresh()->status)->toBe('pending_verification');
});

test('user with program.view only cannot toggle featured status', function () {
    $this->actingAs($this->viewer)
        ->patch("/admin/programs/{$this->sampleProgram->id}/toggle-featured")
        ->assertForbidden();

    expect($this->sampleProgram->fresh()->is_featured)->toBeFalse();
});

test('user with program.create can create program', function () {
    $response = $this->actingAs($this->creator)
        ->post('/admin/programs', [
            'title' => 'Bantuan Pendidikan Dhuafa',
            'category_id' => $this->category->id,
            'target_amount' => 50000000,
            'is_continuous' => false,
            'deadline' => now()->addMonths(3)->format('Y-m-d'),
            'story' => '<p>Cerita program resmi</p>',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ]);

    $response->assertRedirect('/admin/programs');
    $response->assertSessionHas('success');

    expect(Program::where('title->id', 'Bantuan Pendidikan Dhuafa')->exists())->toBeTrue();
});

test('user with program.publish can publish pending program', function () {
    $response = $this->actingAs($this->verifier)
        ->from("/admin/programs/{$this->sampleProgram->id}")
        ->put("/admin/programs/{$this->sampleProgram->id}/status", [
            'status' => 'published',
        ]);

    $response->assertRedirect("/admin/programs/{$this->sampleProgram->id}");
    $response->assertSessionHas('success');

    expect($this->sampleProgram->fresh()->status)->toBe('published');
});

test('blog post purifies dangerous markup in multilingual content array', function () {
    $maliciousHtml = '<p>Kabar Aman</p><script>alert("XSS")</script><img src="x" onerror="alert(1)">';

    $response = $this->actingAs($this->editor)
        ->post('/admin/blogs', [
            'title' => 'Kabar Penyaluran Manfaat',
            'wp_category' => 'Penyaluran',
            'status' => 'published',
            'content_html' => [
                'id' => $maliciousHtml,
                'en' => '<p>Safe News</p><script>alert("XSS-EN")</script>',
            ],
        ]);

    $response->assertRedirect('/admin/blogs');
    $response->assertSessionHas('success');

    $blog = BlogPostCache::where('title->id', 'Kabar Penyaluran Manfaat')->firstOrFail();
    $contentId = $blog->getTranslation('content_html', 'id');
    $contentEn = $blog->getTranslation('content_html', 'en');

    expect($contentId)->not->toContain('<script>')
        ->and($contentId)->not->toContain('onerror')
        ->and($contentId)->toContain('<p>Kabar Aman</p>')
        ->and($contentEn)->not->toContain('<script>');
});

test('page purifies dangerous markup in multilingual content array', function () {
    $maliciousHtml = '<p>Tentang Kami</p><script>alert("Injected")</script><iframe src="javascript:alert(1)"></iframe>';

    $response = $this->actingAs($this->editor)
        ->post('/admin/pages', [
            'slug' => 'tentang-insani-test',
            'title' => [
                'id' => 'Tentang Insani Test',
                'en' => 'About Insani Test',
            ],
            'content_html' => [
                'id' => $maliciousHtml,
                'en' => '<p>About Us</p><script>alert("Eng-XSS")</script>',
            ],
        ]);

    $response->assertRedirect('/admin/pages');
    $response->assertSessionHas('success');

    $page = Page::where('slug', 'tentang-insani-test')->firstOrFail();
    $contentId = $page->getTranslation('content_html', 'id');
    $contentEn = $page->getTranslation('content_html', 'en');

    expect($contentId)->not->toContain('<script>')
        ->and($contentId)->not->toContain('<iframe>')
        ->and($contentId)->toContain('<p>Tentang Kami</p>')
        ->and($contentEn)->not->toContain('<script>');
});
