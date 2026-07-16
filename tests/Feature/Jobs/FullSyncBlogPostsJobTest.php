<?php

use App\Jobs\FullSyncBlogPostsJob;
use App\Models\BlogPostCache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.wordpress.url', 'https://berita.insani.id');
});

it('fetches latest posts and deletes missing local posts', function () {
    // Create an old local post that should be deleted
    BlogPostCache::create([
        'wp_post_id' => 999,
        'slug' => 'old-missing-post',
        'title' => 'Old Post',
        'content_html' => 'Old Content',
        'published_at' => now(),
        'synced_at' => now(),
    ]);

    // The API response simulates fetching 1 new post
    $mockResponse = [
        [
            'id' => 101,
            'slug' => 'new-post',
            'title' => ['rendered' => 'New Post'],
            'excerpt' => ['rendered' => 'Excerpt'],
            'content' => ['rendered' => '<p>New content</p>'],
            'date' => '2026-07-16T10:00:00',
        ]
    ];

    Http::fake([
        "https://berita.insani.id/wp-json/wp/v2/posts*" => Http::response($mockResponse, 200)
    ]);

    $job = new FullSyncBlogPostsJob();
    $job->handle(new \App\Services\BlogSyncService());

    // New post should be inserted
    $this->assertDatabaseHas('blog_post_caches', [
        'wp_post_id' => 101,
        'slug' => 'new-post',
    ]);

    // Old post should be deleted
    $this->assertDatabaseMissing('blog_post_caches', [
        'wp_post_id' => 999,
    ]);
});
