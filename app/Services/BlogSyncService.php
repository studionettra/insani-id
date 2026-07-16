<?php

namespace App\Services;

use App\Models\BlogPostCache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Mews\Purifier\Facades\Purifier;
use Carbon\Carbon;

class BlogSyncService
{
    /**
     * Fetch a single post from WordPress and upsert it into the local cache.
     *
     * @param int $wpPostId
     * @return bool
     */
    public function syncPost(int $wpPostId): bool
    {
        $wpApiUrl = rtrim(config('services.wordpress.url'), '/');
        if (!$wpApiUrl) {
            Log::error('WordPress API URL is not configured.');
            return false;
        }

        try {
            // Using standard WP REST API endpoint format
            $response = Http::get("{$wpApiUrl}/wp-json/wp/v2/posts/{$wpPostId}?_embed");

            if (!$response->successful()) {
                if ($response->status() === 404) {
                    // Post might be deleted or unpublished in WP, remove it from cache
                    BlogPostCache::where('wp_post_id', $wpPostId)->delete();
                    return true;
                }
                Log::error("Failed to fetch post {$wpPostId} from WordPress. Status: " . $response->status());
                return false;
            }

            $data = $response->json();
            $this->upsertPost($data);

            return true;

        } catch (\Exception $e) {
            Log::error("Error syncing post {$wpPostId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Upsert a post into the local cache based on WP REST API payload.
     *
     * @param array $data
     * @return void
     */
    protected function upsertPost(array $data): void
    {
        // Extract basic data
        $wpPostId = $data['id'];
        $slug = $data['slug'];
        $title = $data['title']['rendered'] ?? '';
        
        // Sanitize HTML fields using Purifier
        $excerpt = isset($data['excerpt']['rendered']) ? strip_tags($data['excerpt']['rendered']) : null;
        $contentHtml = isset($data['content']['rendered']) ? Purifier::clean($data['content']['rendered']) : '';
        
        $publishedAt = isset($data['date']) ? Carbon::parse($data['date']) : now();

        // Extract featured image from _embedded
        $featuredImageUrl = null;
        if (isset($data['_embedded']['wp:featuredmedia'][0]['source_url'])) {
            $featuredImageUrl = $data['_embedded']['wp:featuredmedia'][0]['source_url'];
        }

        // Extract primary category from _embedded
        $wpCategory = null;
        if (isset($data['_embedded']['wp:term'])) {
            foreach ($data['_embedded']['wp:term'] as $taxonomies) {
                foreach ($taxonomies as $term) {
                    if (isset($term['taxonomy']) && $term['taxonomy'] === 'category') {
                        $wpCategory = $term['name'];
                        break 2; // Use the first category found
                    }
                }
            }
        }

        BlogPostCache::updateOrCreate(
            ['wp_post_id' => $wpPostId],
            [
                'slug' => $slug,
                'title' => $title,
                'excerpt' => $excerpt,
                'content_html' => $contentHtml,
                'featured_image_url' => $featuredImageUrl,
                'wp_category' => $wpCategory,
                'published_at' => $publishedAt,
                'synced_at' => now(),
            ]
        );
    }
    
    /**
     * Fetch all latest posts and sync them. Used by the fallback scheduled job.
     * 
     * @return void
     */
    public function syncAllPosts(): void
    {
        $wpApiUrl = rtrim(config('services.wordpress.url'), '/');
        if (!$wpApiUrl) {
            return;
        }

        try {
            // Fetch up to 100 latest posts
            $response = Http::get("{$wpApiUrl}/wp-json/wp/v2/posts", [
                '_embed' => '1',
                'per_page' => 100,
            ]);

            if (!$response->successful()) {
                Log::error("Failed to fetch WordPress posts for full sync. Status: " . $response->status());
                return;
            }

            $posts = $response->json();
            $fetchedWpIds = [];

            foreach ($posts as $postData) {
                $this->upsertPost($postData);
                $fetchedWpIds[] = $postData['id'];
            }
            
            // Delete local posts that are not in the fetched latest list
            if (count($fetchedWpIds) > 0) {
                $deleted = BlogPostCache::whereNotIn('wp_post_id', $fetchedWpIds)->delete();
                if ($deleted > 0) {
                    Log::info("Full sync deleted {$deleted} local posts that are no longer in WordPress's latest list.");
                }
            }
        } catch (\Exception $e) {
            Log::error("Error during full sync of WordPress posts: " . $e->getMessage());
        }
    }
}
