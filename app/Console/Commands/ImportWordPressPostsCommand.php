<?php

namespace App\Console\Commands;

use App\Models\BlogPostCache;
use Carbon\Carbon;
use DOMDocument;
use DOMXPath;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportWordPressPostsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:import-wp
                            {--source=https://insani.id/wp-json/wp/v2/posts : URL WP REST API posts endpoint}
                            {--no-images : Lewati pengunduhan gambar cover ke storage lokal}
                            {--limit= : Batasi jumlah artikel yang dimigrasi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrasi dan sinkronisasi seluruh arsip kabar dari WordPress REST API ke database blog_post_caches beserta download cover image lokal.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $sourceUrl = (string) $this->option('source');
        $downloadImages = ! $this->option('no-images');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        $this->info('=================================================');
        $this->info('  MIGRASI ARSIP KABAR WORDPRESS KE LARAVEL       ');
        $this->info('=================================================');
        $this->line("Sumber API: <comment>{$sourceUrl}</comment>");
        $this->line('Unduh Gambar: '.($downloadImages ? '<info>Ya (storage/app/public/blogs)</info>' : '<comment>Tidak (gunakan URL remote)</comment>'));
        if ($limit) {
            $this->line("Batas artikel: <comment>{$limit}</comment>");
        }
        $this->newLine();

        if ($downloadImages) {
            Storage::disk('public')->makeDirectory('blogs');
        }

        // 1. Dapatkan jumlah total post dari header HTTP
        $this->info('Memeriksa jumlah total artikel di server WordPress...');
        try {
            $headResponse = Http::timeout(15)->head($sourceUrl, ['per_page' => 1]);
            $totalWpPosts = (int) $headResponse->header('x-wp-total', 0);
            $totalPages = (int) $headResponse->header('x-wp-totalpages', 0);
        } catch (\Throwable $e) {
            $this->error("Gagal terhubung ke endpoint WordPress: {$e->getMessage()}");

            return Command::FAILURE;
        }

        if ($totalWpPosts === 0) {
            $this->warn('Tidak ada artikel yang ditemukan di endpoint sumber.');

            return Command::SUCCESS;
        }

        $totalToFetch = $limit ? min($limit, $totalWpPosts) : $totalWpPosts;
        $this->info("Ditemukan {$totalWpPosts} artikel total. Memulai migrasi untuk {$totalToFetch} artikel...");
        $this->newLine();

        $progressBar = $this->output->createProgressBar($totalToFetch);
        $progressBar->start();

        $page = 1;
        $perPage = 50;
        $processedCount = 0;
        $createdCount = 0;
        $updatedCount = 0;
        $imagesDownloaded = 0;
        $errorsCount = 0;

        while ($processedCount < $totalToFetch) {
            $fetchCount = min($perPage, $totalToFetch - $processedCount);

            try {
                $response = Http::timeout(30)->get($sourceUrl, [
                    '_embed' => 1,
                    'per_page' => $fetchCount,
                    'page' => $page,
                ]);
            } catch (\Throwable $e) {
                $this->newLine();
                $this->error("Koneksi gagal pada halaman {$page}: {$e->getMessage()}");
                $errorsCount++;
                break;
            }

            if (! $response->successful()) {
                $this->newLine();
                $this->error("Respon HTTP error {$response->status()} pada halaman {$page}");
                $errorsCount++;
                break;
            }

            $posts = $response->json();
            if (empty($posts) || ! is_array($posts)) {
                break;
            }

            foreach ($posts as $wpPost) {
                if ($processedCount >= $totalToFetch) {
                    break;
                }

                try {
                    $result = $this->processPost($wpPost, $downloadImages);

                    if ($result['action'] === 'created') {
                        $createdCount++;
                    } elseif ($result['action'] === 'updated') {
                        $updatedCount++;
                    }

                    if ($result['image_downloaded']) {
                        $imagesDownloaded++;
                    }
                } catch (\Throwable $e) {
                    $errorsCount++;
                    Log::error("Gagal memigrasi WP Post ID {$wpPost['id']}: ".$e->getMessage());
                }

                $processedCount++;
                $progressBar->advance();
            }

            $page++;
        }

        $progressBar->finish();
        $this->newLine(2);

        // 3. Ringkasan Migrasi
        $this->info('=================================================');
        $this->info('           HASIL MIGRASI ARSIP KABAR            ');
        $this->info('=================================================');
        $this->table(
            ['Metrik', 'Jumlah'],
            [
                ['Total Artikel Diproses', $processedCount],
                ['Artikel Baru Ditambahkan', $createdCount],
                ['Artikel Diperbarui', $updatedCount],
                ['Cover Image Diunduh ke Lokal', $imagesDownloaded],
                ['Error / Gagal', $errorsCount],
                ['Total di Database Saat Ini', BlogPostCache::count()],
            ]
        );

        $this->info('Migrasi arsip kabar selesai dengan sukses! 🚀');

        return Command::SUCCESS;
    }

    /**
     * Process and import a single WordPress post.
     *
     * @param  array<string, mixed>  $wpPost
     * @return array{action: string, image_downloaded: bool}
     */
    protected function processPost(array $wpPost, bool $downloadImages): array
    {
        $wpPostId = (int) $wpPost['id'];
        $rawTitle = $wpPost['title']['rendered'] ?? '';
        $title = trim(html_entity_decode($rawTitle, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $slug = Str::slug($wpPost['slug'] ?? Str::slug($title));

        // Format tanggal terbit
        $publishedAt = ! empty($wpPost['date'])
            ? Carbon::parse($wpPost['date'])
            : now();

        // Kategori
        $category = 'Kabar Insani';
        if (! empty($wpPost['_embedded']['wp:term'][0][0]['name'])) {
            $category = trim(html_entity_decode($wpPost['_embedded']['wp:term'][0][0]['name'], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        }

        // Excerpt
        $rawExcerpt = $wpPost['excerpt']['rendered'] ?? '';
        $excerpt = trim(strip_tags(html_entity_decode($rawExcerpt, ENT_QUOTES | ENT_HTML5, 'UTF-8')));
        $excerpt = preg_replace('/\s+/', ' ', $excerpt);

        // Konten HTML yang sudah dibersihkan
        $rawContent = $wpPost['content']['rendered'] ?? '';
        $cleanContent = $this->cleanContentHtml($rawContent);

        // Featured Image
        $remoteImageUrl = $wpPost['_embedded']['wp:featuredmedia'][0]['source_url'] ?? null;
        $featuredImagePath = $remoteImageUrl;
        $imageDownloaded = false;

        if ($downloadImages && ! empty($remoteImageUrl)) {
            $localPath = $this->downloadCoverImage($wpPostId, $slug, $remoteImageUrl);
            if ($localPath) {
                $featuredImagePath = $localPath;
                $imageDownloaded = true;
            }
        }

        // Cari record yang sudah ada berdasarkan wp_post_id atau slug
        $blog = BlogPostCache::where('wp_post_id', $wpPostId)->first()
            ?? BlogPostCache::where('slug', $slug)->first();

        $action = 'updated';
        if (! $blog) {
            $blog = new BlogPostCache;
            $action = 'created';

            // Pastikan slug unik jika dibuat baru
            $baseSlug = $slug;
            $counter = 1;
            while (BlogPostCache::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
        }

        $blog->wp_post_id = $wpPostId;
        $blog->slug = $slug;
        $blog->wp_category = $category;
        $blog->status = 'published';
        $blog->published_at = $publishedAt;
        $blog->synced_at = now();

        if ($featuredImagePath) {
            $blog->featured_image_url = $featuredImagePath;
        }

        // Simpan translatable fields dalam struktur json {'id': '...'}
        $blog->title = ['id' => $title];
        $blog->excerpt = ['id' => $excerpt];
        $blog->content_html = ['id' => $cleanContent];

        $blog->save();

        return [
            'action' => $action,
            'image_downloaded' => $imageDownloaded,
        ];
    }

    /**
     * Download and save cover image to local public disk.
     */
    protected function downloadCoverImage(int $wpPostId, string $slug, string $imageUrl): ?string
    {
        $path = parse_url($imageUrl, PHP_URL_PATH);
        $ext = strtolower(pathinfo((string) $path, PATHINFO_EXTENSION)) ?: 'jpg';
        if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
            $ext = 'jpg';
        }

        $cleanSlug = Str::limit($slug, 40, '');
        $filename = "wp_{$wpPostId}_{$cleanSlug}.{$ext}";
        $relativeStoragePath = "blogs/{$filename}";

        // Jika sudah pernah didownload sebelumnya, gunakan file yang ada
        if (Storage::disk('public')->exists($relativeStoragePath)) {
            return $relativeStoragePath;
        }

        try {
            $response = Http::timeout(25)->get($imageUrl);
            if ($response->successful()) {
                Storage::disk('public')->put($relativeStoragePath, $response->body());

                return $relativeStoragePath;
            }
        } catch (\Throwable $e) {
            Log::warning("Gagal mengunduh cover image WP ID {$wpPostId} ({$imageUrl}): {$e->getMessage()}");
        }

        return null;
    }

    /**
     * Clean Elementor artifacts and duplicate widgets from HTML content.
     */
    protected function cleanContentHtml(string $html): string
    {
        if (empty(trim($html))) {
            return '';
        }

        if (! str_contains($html, 'elementor')) {
            return trim($html);
        }

        $libxmlState = libxml_use_internal_errors(true);
        $dom = new DOMDocument;
        $dom->loadHTML('<?xml encoding="utf-8" ?><div>'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($libxmlState);

        $xpath = new DOMXPath($dom);

        $nodesToRemove = [];

        // 1. Hapus widget share buttons bawaan Elementor
        foreach ($xpath->query('//*[contains(@class, "elementor-widget-share-buttons")]') as $node) {
            $nodesToRemove[] = $node;
        }
        foreach ($xpath->query('//*[contains(@class, "elementor-share-btn")]') as $node) {
            $nodesToRemove[] = $node;
        }

        // 2. Hapus judul "Bagikan Artikel Ini :"
        foreach ($xpath->query('//h6[contains(text(), "Bagikan")]/ancestor::*[contains(@class, "elementor-element")][1]') as $node) {
            $nodesToRemove[] = $node;
        }
        foreach ($xpath->query('//h6[contains(text(), "Bagikan")]') as $node) {
            $nodesToRemove[] = $node;
        }

        // 3. Hapus gambar pertama jika itu adalah cover image yang sama dengan featured image
        $firstImage = $xpath->query('(//*[contains(@class, "elementor-widget-image")])[1]')->item(0);
        $firstParagraph = $xpath->query('(//p)[1]')->item(0);
        if ($firstImage && $firstParagraph && $firstImage->getLineNo() <= $firstParagraph->getLineNo()) {
            $nodesToRemove[] = $firstImage;
        }

        foreach ($nodesToRemove as $node) {
            if ($node && $node->parentNode) {
                $node->parentNode->removeChild($node);
            }
        }

        // 4. Pulihkan gambar inline yang terpengaruh lazyload (convert data-src ke src)
        foreach ($xpath->query('//img') as $img) {
            if ($img->hasAttribute('data-src') && ! empty($img->getAttribute('data-src'))) {
                $img->setAttribute('src', $img->getAttribute('data-src'));
                $img->removeAttribute('data-src');
            }
            if ($img->hasAttribute('data-srcset') && ! empty($img->getAttribute('data-srcset'))) {
                $img->setAttribute('srcset', $img->getAttribute('data-srcset'));
                $img->removeAttribute('data-srcset');
            }
            $img->removeAttribute('data-sizes');
            if ($img->hasAttribute('class')) {
                $class = str_replace('lazyload', '', $img->getAttribute('class'));
                $img->setAttribute('class', trim($class));
            }
        }

        $wrapper = $dom->getElementsByTagName('div')->item(0);
        $output = '';
        if ($wrapper) {
            foreach ($wrapper->childNodes as $child) {
                $output .= $dom->saveHTML($child);
            }
        }

        return trim($output);
    }
}
