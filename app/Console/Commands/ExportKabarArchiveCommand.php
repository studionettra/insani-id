<?php

namespace App\Console\Commands;

use App\Models\BlogPostCache;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ExportKabarArchiveCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'kabar:export-archive
                            {--output= : Path file output JSON (default: database/data/kabar_archive.json)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export seluruh arsip kabar dari database blog_post_caches ke file JSON untuk Database Seeder produksi.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $outputPath = $this->option('output')
            ? (string) $this->option('output')
            : database_path('data/kabar_archive.json');

        $this->info('=================================================');
        $this->info('     EXPORT ARSIP KABAR KE SEEDER DATA JSON      ');
        $this->info('=================================================');
        $this->line("Target File: <comment>{$outputPath}</comment>");

        $posts = BlogPostCache::orderBy('id', 'asc')->get();
        $totalCount = $posts->count();

        if ($totalCount === 0) {
            $this->error('Tidak ada data kabar di tabel blog_post_caches.');

            return self::FAILURE;
        }

        $this->info("Menyiapkan ekspor untuk {$totalCount} artikel kabar...");

        $exportData = [];
        $progressBar = $this->output->createProgressBar($totalCount);
        $progressBar->start();

        foreach ($posts as $post) {
            $exportData[] = [
                'wp_post_id' => $post->wp_post_id,
                'slug' => $post->slug,
                'wp_category' => $post->wp_category,
                'status' => $post->status,
                'views_count' => (int) $post->views_count,
                'published_at' => $post->published_at?->toIso8601String(),
                'featured_image_url' => $post->featured_image_url,
                'title' => $post->getTranslations('title'),
                'excerpt' => $post->getTranslations('excerpt'),
                'content_html' => $post->getTranslations('content_html'),
            ];

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Pastikan direktori tujuan tersedia
        File::ensureDirectoryExists(dirname($outputPath));

        $jsonContent = json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($jsonContent === false) {
            $this->error('Gagal meng-encode data kabar ke JSON: '.json_last_error_msg());

            return self::FAILURE;
        }

        File::put($outputPath, $jsonContent);

        $fileSizeBytes = File::size($outputPath);
        $fileSizeMb = round($fileSizeBytes / (1024 * 1024), 2);

        $this->info('=================================================');
        $this->info('        EXPORT ARSIP KABAR BERHASIL!            ');
        $this->info('=================================================');
        $this->table(
            ['Metrik', 'Nilai'],
            [
                ['Total Artikel Diekspor', $totalCount],
                ['Lokasi File', $outputPath],
                ['Ukuran File', "{$fileSizeMb} MB ({$fileSizeBytes} bytes)"],
            ]
        );

        return self::SUCCESS;
    }
}
