<?php

namespace Database\Seeders;

use App\Models\BlogPostCache;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class KabarArchiveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/kabar_archive.json');

        if (! File::exists($jsonPath)) {
            $this->command?->warn("File arsip kabar tidak ditemukan: {$jsonPath}");

            return;
        }

        $jsonContent = File::get($jsonPath);
        $articles = json_decode($jsonContent, true);

        if (! is_array($articles)) {
            $this->command?->error('Format data JSON arsip kabar tidak valid.');

            return;
        }

        $totalCount = count($articles);
        $this->command?->info("Memulai seeding {$totalCount} arsip kabar...");

        $seededCount = 0;
        foreach ($articles as $item) {
            if (empty($item['slug'])) {
                continue;
            }

            BlogPostCache::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'wp_post_id' => $item['wp_post_id'] ?? null,
                    'wp_category' => $item['wp_category'] ?? 'Kabar Insani',
                    'status' => $item['status'] ?? 'published',
                    'views_count' => (int) ($item['views_count'] ?? 0),
                    'published_at' => ! empty($item['published_at'])
                        ? Carbon::parse($item['published_at'])
                        : now(),
                    'synced_at' => now(),
                    'featured_image_url' => $item['featured_image_url'] ?? null,
                    'title' => $item['title'] ?? [],
                    'excerpt' => $item['excerpt'] ?? [],
                    'content_html' => $item['content_html'] ?? [],
                ]
            );

            $seededCount++;
        }

        $this->command?->info("Berhasil melakukan seeding {$seededCount} arsip kabar.");
    }
}
