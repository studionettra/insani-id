<?php

use App\Models\BlogPostCache;
use App\Services\BlogSyncService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.wordpress.url', 'https://berita.insani.id');
    $this->syncService = new BlogSyncService();
});

it('syncs a single post successfully and sanitizes HTML', function () {
    $wpPostId = 123;
    $mockResponse = [
        'id' => $wpPostId,
        'slug' => 'test-post',
        'title' => ['rendered' => 'Test Post Title'],
        'excerpt' => ['rendered' => '<p>Test Excerpt <strong>bold</strong></p>'],
        'content' => ['rendered' => '<p>Clean content.</p><script>alert("XSS")</script>'],
        'date' => '2026-07-16T10:00:00',
        '_embedded' => [
            'wp:featuredmedia' => [
                ['source_url' => 'https://example.com/image.jpg']
            ],
            'wp:term' => [
                [
                    ['taxonomy' => 'category', 'name' => 'Fokus Program']
                ]
            ]
        ]
    ];

    Http::fake([
        "https://berita.insani.id/wp-json/wp/v2/posts/{$wpPostId}?_embed" => Http::response($mockResponse, 200)
    ]);

    $result = $this->syncService->syncPost($wpPostId);

    expect($result)->toBeTrue();

    $this->assertDatabaseHas('blog_post_caches', [
        'wp_post_id' => $wpPostId,
        'slug' => 'test-post',
        'title' => 'Test Post Title',
        'wp_category' => 'Fokus Program',
        'featured_image_url' => 'https://example.com/image.jpg',
    ]);

    $cachedPost = BlogPostCache::where('wp_post_id', $wpPostId)->first();
    
    // HTML in excerpt should be stripped
    expect($cachedPost->excerpt)->toBe('Test Excerpt bold');
    
    // Script tag should be sanitized from content_html
    expect($cachedPost->content_html)->not->toContain('<script>');
    expect($cachedPost->content_html)->toContain('Clean content.');
});

it('deletes local post if WordPress returns 404', function () {
    $wpPostId = 123;
    
    // Create a local post first
    BlogPostCache::create([
        'wp_post_id' => $wpPostId,
        'slug' => 'old-post',
        'title' => 'Old Post',
        'content_html' => 'Old Content',
        'published_at' => now(),
        'synced_at' => now(),
    ]);

    Http::fake([
        "https://berita.insani.id/wp-json/wp/v2/posts/{$wpPostId}?_embed" => Http::response([], 404)
    ]);

    $result = $this->syncService->syncPost($wpPostId);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('blog_post_caches', [
        'wp_post_id' => $wpPostId
    ]);
});
