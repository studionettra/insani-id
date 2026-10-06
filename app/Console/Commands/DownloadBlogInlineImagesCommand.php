<?php

namespace App\Console\Commands;

use App\Models\BlogPostCache;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DownloadBlogInlineImagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:download-inline-images
                            {--concurrency=12 : Jumlah unduhan paralel per batch}
                            {--limit= : Batasi jumlah gambar yang diunduh}
                            {--dry-run : Jalankan simulasi tanpa menyimpan file ke disk atau database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Unduh seluruh gambar inline (wp-content/uploads) di dalam artikel kabar ke storage lokal dan perbarui tautan di database.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $concurrency = max(1, (int) $this->option('concurrency'));
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $isDryRun = (bool) $this->option('dry-run');

        $this->info('===========================================================');
        $this->info('  UNDUH GAMBAR INLINE ARSIP KABAR KE STORAGE LOKAL         ');
        $this->info('===========================================================');
        if ($isDryRun) {
            $this->warn('MODE SIMULASI (DRY-RUN): Tidak ada file atau data yang akan diubah.');
        }
        $this->line("Paralel Konkurensi: <comment>{$concurrency} request per batch</comment>");
        $this->newLine();

        // 1. Pindai seluruh artikel dan kumpulkan URL gambar unik
        $this->info('Memindai seluruh artikel kabar untuk mencari gambar inline...');
        $posts = BlogPostCache::all();
        $uniqueImages = []; // [rawUrl => relativeUploadPath]

        foreach ($posts as $post) {
            $translations = $post->getTranslations('content_html');
            $html = $translations['id'] ?? $post->content_html ?? '';

            if (empty($html)) {
                continue;
            }

            // 1a. Cocokkan URL wp-content/uploads lama
            preg_match_all('/https?:\/\/insani\.id\/wp-content\/uploads\/[^\s"\'><)]+/i', $html, $matchesWp);
            if (! empty($matchesWp[0])) {
                foreach ($matchesWp[0] as $rawUrl) {
                    $cleanUrl = preg_replace('/[.,;)]+$/', '', $rawUrl);
                    $parsedPath = parse_url($cleanUrl, PHP_URL_PATH);
                    if ($parsedPath && str_contains($parsedPath, '/wp-content/uploads/')) {
                        $subPath = ltrim(explode('/wp-content/uploads/', $parsedPath)[1] ?? '', '/');
                        if (! empty($subPath)) {
                            $canonicalUrl = "https://insani.id/wp-content/uploads/{$subPath}";
                            $uniqueImages[$canonicalUrl] = $subPath;
                        }
                    }
                }
            }

            // 1b. Cocokkan juga path /storage/blogs/content/ jika tautan sudah sempat diubah ke storage lokal
            preg_match_all('/\/storage\/blogs\/content\/[^\s"\'><)]+/i', $html, $matchesStorage);
            if (! empty($matchesStorage[0])) {
                foreach ($matchesStorage[0] as $rawUrl) {
                    $cleanUrl = preg_replace('/[.,;)]+$/', '', $rawUrl);
                    $subPath = ltrim(str_replace('/storage/blogs/content/', '', $cleanUrl), '/');
                    if (! empty($subPath)) {
                        $canonicalUrl = "https://insani.id/wp-content/uploads/{$subPath}";
                        $uniqueImages[$canonicalUrl] = $subPath;
                    }
                }
            }
        }

        $totalImagesFound = count($uniqueImages);
        $this->info("Ditemukan {$totalImagesFound} gambar unik di dalam {$posts->count()} artikel.");

        if ($totalImagesFound === 0) {
            $this->info('Tidak ada gambar inline wp-content/uploads yang ditemukan.');

            return Command::SUCCESS;
        }

        if ($limit && $limit < $totalImagesFound) {
            $uniqueImages = array_slice($uniqueImages, 0, $limit, true);
            $this->line("Dibatasi hingga <comment>{$limit}</comment> gambar sesuai opsi --limit.");
        }

        // 2. Tentukan gambar yang sudah ada vs yang perlu diunduh
        $alreadyOnDisk = 0;
        $toDownload = [];

        foreach ($uniqueImages as $url => $subPath) {
            $storagePath = "blogs/content/{$subPath}";
            if (Storage::disk('public')->exists($storagePath)) {
                $alreadyOnDisk++;
            } else {
                $toDownload[$url] = $subPath;
            }
        }

        $this->line("Gambar yang sudah ada di lokal disk: <info>{$alreadyOnDisk}</info>");
        $this->line('Gambar yang perlu diunduh: <comment>'.count($toDownload).'</comment>');
        $this->newLine();

        $downloadedCount = 0;
        $failedCount = 0;

        // 3. Unduh gambar menggunakan HTTP Pool (konkuren dengan key md5)
        if (! empty($toDownload) && ! $isDryRun) {
            $this->info('Mengunduh gambar ke storage/app/public/blogs/content/...');
            $chunks = array_chunk($toDownload, $concurrency, true);
            $progressBar = $this->output->createProgressBar(count($toDownload));
            $progressBar->start();

            foreach ($chunks as $chunk) {
                try {
                    $responses = Http::pool(function (Pool $pool) use ($chunk) {
                        $requests = [];
                        foreach ($chunk as $url => $subPath) {
                            $key = md5($url);
                            $requests[$key] = $pool->as($key)->timeout(30)->get($url);
                        }

                        return $requests;
                    });

                    foreach ($chunk as $url => $subPath) {
                        $key = md5($url);
                        $res = $responses[$key] ?? null;
                        if ($res && $res->successful()) {
                            $storagePath = "blogs/content/{$subPath}";
                            Storage::disk('public')->put($storagePath, $res->body());
                            $downloadedCount++;
                        } else {
                            $failedCount++;
                            Log::warning("Gagal mengunduh inline image: {$url}");
                        }
                        $progressBar->advance();
                    }
                } catch (\Throwable $e) {
                    $failedCount += count($chunk);
                    Log::error('Error pada batch download inline image: '.$e->getMessage());
                    $progressBar->advance(count($chunk));
                }
            }

            $progressBar->finish();
            $this->newLine(2);
        }

        // 4. Perbarui link di database artikel
        $updatedPostsCount = 0;

        if (! $isDryRun) {
            $this->info('Memperbarui tautan gambar di dalam database artikel...');

            foreach ($posts as $post) {
                $translations = $post->getTranslations('content_html');
                $isUpdated = false;

                foreach ($translations as $locale => $html) {
                    if (empty($html)) {
                        continue;
                    }

                    // Pola penggantian:
                    // https://insani.id/wp-content/uploads/ -> /storage/blogs/content/
                    // http://insani.id/wp-content/uploads/  -> /storage/blogs/content/
                    if (str_contains($html, '/wp-content/uploads/')) {
                        $newHtml = preg_replace(
                            '/https?:\/\/insani\.id\/wp-content\/uploads\//i',
                            '/storage/blogs/content/',
                            $html
                        );

                        if ($newHtml !== $html) {
                            $translations[$locale] = $newHtml;
                            $isUpdated = true;
                        }
                    }
                }

                if ($isUpdated) {
                    $post->content_html = $translations;
                    $post->save();
                    $updatedPostsCount++;
                }
            }
        }

        // 5. Tampilkan ringkasan hasil eksekusi
        $this->info('===========================================================');
        $this->info('              HASIL UNDUH GAMBAR INLINE                    ');
        $this->info('===========================================================');
        $this->table(
            ['Metrik', 'Jumlah'],
            [
                ['Total Gambar Unik Terdeteksi', $totalImagesFound],
                ['Gambar Sudah Ada di Disk Sebelumnya', $alreadyOnDisk],
                ['Gambar Baru Berhasil Diunduh', $downloadedCount],
                ['Gambar Gagal Diunduh (404/Timeout)', $failedCount],
                ['Artikel Diperbarui Tautannya', $updatedPostsCount],
            ]
        );

        $this->info('Seluruh gambar inline telah tersimpan di storage lokal dan tautan database berhasil diperbarui! 🚀');

        return Command::SUCCESS;
    }
}
