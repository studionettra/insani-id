<?php

use App\Models\BlogPostCache;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $manageBlogPerm = Permission::firstOrCreate(['name' => 'manage_blog']);

    $this->adminRole->givePermissionTo($manageBlogPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create(['name' => 'Admin Redaksi']);
    $this->admin->assignRole('Administrator');

    BlogPostCache::query()->delete();
});

it('allows admin to view blog management index', function () {
    BlogPostCache::create([
        'title' => 'Kabar Gembira Dari Pelosok',
        'slug' => 'kabar-gembira-dari-pelosok',
        'excerpt' => 'Kabar terbaru.',
        'content_html' => '<p>Isi kabar.</p>',
        'wp_category' => 'Kemanusiaan',
        'status' => 'published',
        'published_at' => now(),
    ]);

    actingAs($this->admin)
        ->get('/admin/blogs')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Blogs/Index')
            ->has('blogs.data', 1)
            ->where('blogs.data.0.title', 'Kabar Gembira Dari Pelosok')
        );
});

it('allows admin to view create blog page', function () {
    actingAs($this->admin)
        ->get('/admin/blogs/create')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Blogs/Create')
            ->has('categories')
        );
});

it('allows admin to store a new published blog with sanitized HTML and uploaded thumbnail', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('berita-sampul.jpg');

    actingAs($this->admin)
        ->post('/admin/blogs', [
            'title' => 'Pemberdayaan Masyarakat Mandiri',
            'slug' => 'pemberdayaan-masyarakat-mandiri',
            'excerpt' => 'Program pelatihan keterampilan warga.',
            'content_html' => '<p>Pelatihan berjalan sukses.</p><script>alert("xss")</script>',
            'wp_category' => 'Pemberdayaan',
            'featured_image' => $file,
            'status' => 'published',
            'published_at' => now()->toDateString(),
        ])
        ->assertRedirect(route('admin.blogs.index'))
        ->assertSessionHas('success');

    $blog = BlogPostCache::where('slug', 'pemberdayaan-masyarakat-mandiri')->first();
    expect($blog)->not->toBeNull();
    expect($blog->title)->toBe('Pemberdayaan Masyarakat Mandiri');
    expect($blog->author_id)->toBe($this->admin->id);
    expect($blog->status)->toBe('published');
    expect($blog->content_html)->not->toContain('<script>');
    expect($blog->content_html)->toContain('Pelatihan berjalan sukses.');
    expect($blog->featured_image_url)->not->toBeNull();

    Storage::disk('public')->assertExists($blog->featured_image_url);
});

it('allows admin to edit and update an existing blog', function () {
    $blog = BlogPostCache::create([
        'title' => 'Judul Lama',
        'slug' => 'judul-lama',
        'excerpt' => 'Excerpt lama.',
        'content_html' => '<p>Konten lama.</p>',
        'wp_category' => 'Umum',
        'status' => 'draft',
        'published_at' => now(),
    ]);

    actingAs($this->admin)
        ->get("/admin/blogs/{$blog->id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Blogs/Edit')
            ->where('blog.title', 'Judul Lama')
        );

    actingAs($this->admin)
        ->put("/admin/blogs/{$blog->id}", [
            'title' => 'Judul Diperbarui',
            'slug' => 'judul-diperbarui',
            'excerpt' => 'Excerpt baru.',
            'content_html' => '<p>Konten baru diperbarui.</p>',
            'wp_category' => 'Pendidikan',
            'status' => 'published',
            'published_at' => now()->toDateString(),
        ])
        ->assertRedirect(route('admin.blogs.index'))
        ->assertSessionHas('success');

    $blog->refresh();
    expect($blog->title)->toBe('Judul Diperbarui');
    expect($blog->wp_category)->toBe('Pendidikan');
    expect($blog->status)->toBe('published');
});

it('allows admin to delete a blog post', function () {
    Storage::fake('public');
    $file = UploadedFile::fake()->image('test.jpg');
    $path = $file->store('blogs', 'public');

    $blog = BlogPostCache::create([
        'title' => 'Artikel yang Akan Dihapus',
        'slug' => 'artikel-dihapus',
        'content_html' => '<p>Konten.</p>',
        'featured_image_url' => $path,
        'wp_category' => 'Umum',
        'status' => 'published',
        'published_at' => now(),
    ]);

    actingAs($this->admin)
        ->delete("/admin/blogs/{$blog->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(BlogPostCache::find($blog->id))->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

it('excludes draft blogs from public index and detail pages', function () {
    BlogPostCache::create([
        'title' => 'Artikel Publik Tayang',
        'slug' => 'artikel-publik-tayang',
        'content_html' => '<p>Tayang.</p>',
        'status' => 'published',
        'published_at' => now()->subHour(),
    ]);

    $draft = BlogPostCache::create([
        'title' => 'Artikel Rahasia Draf',
        'slug' => 'artikel-rahasia-draf',
        'content_html' => '<p>Belum siap.</p>',
        'status' => 'draft',
        'published_at' => now(),
    ]);

    // Public index only shows published
    $this->get('/berita')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Blog/Index')
            ->has('blogs.data', 1)
            ->where('blogs.data.0.slug', 'artikel-publik-tayang')
        );

    // Public detail returns 404 for draft
    $this->get("/berita/{$draft->slug}")
        ->assertNotFound();
});
