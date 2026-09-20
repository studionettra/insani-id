<?php

namespace App\Console\Commands;

use App\Models\BlogPostCache;
use App\Models\Program;
use App\Services\TranslationService;
use Illuminate\Console\Command;

class TranslateExistingContentCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'insani:translate-content {--force : Force re-translating records even if translations already exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-translate existing Programs and Blog Posts into English and Arabic';

    /**
     * Execute the console command.
     */
    public function handle(TranslationService $translator): int
    {
        $force = (bool) $this->option('force');

        $this->info('🚀 Memulai proses auto-translate konten database (Program & Blog)...');

        // 1. Programs
        $programs = Program::all();
        $this->info("Ditemukan {$programs->count()} program.");

        foreach ($programs as $program) {
            $this->line("Memproses Program #{$program->id}: {$program->getTranslation('title', 'id', false)}");

            $titleTranslations = $program->getTranslations('title');
            $storyTranslations = $program->getTranslations('story');

            $sourceTitle = $titleTranslations['id'] ?? (is_string($program->getRawOriginal('title')) ? $program->getRawOriginal('title') : '');
            $sourceStory = $storyTranslations['id'] ?? (is_string($program->getRawOriginal('story')) ? $program->getRawOriginal('story') : '');

            if (empty($sourceTitle)) {
                $sourceTitle = (string) $program->title;
            }
            if (empty($sourceStory)) {
                $sourceStory = (string) $program->story;
            }

            $needsTitle = $force || empty($titleTranslations['en']) || empty($titleTranslations['ar']);
            $needsStory = $force || empty($storyTranslations['en']) || empty($storyTranslations['ar']);

            $fieldsToTranslate = [];
            if ($needsTitle && ! empty($sourceTitle)) {
                $fieldsToTranslate['title'] = $sourceTitle;
            }
            if ($needsStory && ! empty($sourceStory)) {
                $fieldsToTranslate['story'] = $sourceStory;
            }

            if (! empty($fieldsToTranslate)) {
                $this->comment('  Menerjemahkan ke EN & AR...');
                $translated = $translator->translateFields($fieldsToTranslate, ['en', 'ar'], 'id', ['story']);

                if (isset($translated['title'])) {
                    $titleTranslations['id'] = $sourceTitle;
                    $titleTranslations['en'] = $translated['title']['en'] ?? ($titleTranslations['en'] ?? '');
                    $titleTranslations['ar'] = $translated['title']['ar'] ?? ($titleTranslations['ar'] ?? '');
                    $program->setTranslations('title', $titleTranslations);
                }

                if (isset($translated['story'])) {
                    $storyTranslations['id'] = $sourceStory;
                    $storyTranslations['en'] = $translated['story']['en'] ?? ($storyTranslations['en'] ?? '');
                    $storyTranslations['ar'] = $translated['story']['ar'] ?? ($storyTranslations['ar'] ?? '');
                    $program->setTranslations('story', $storyTranslations);
                }

                $program->save();
                $this->info("  ✓ Program #{$program->id} selesai diperbarui.");
            } else {
                $this->info("  - Program #{$program->id} sudah memiliki terjemahan lengkap (gunakan --force untuk menimpa).");
            }
        }

        // 2. Blog Posts
        $blogs = BlogPostCache::all();
        $this->info("Ditemukan {$blogs->count()} berita/artikel.");

        foreach ($blogs as $blog) {
            $this->line("Memproses Berita #{$blog->id}: {$blog->getTranslation('title', 'id', false)}");

            $titleTranslations = $blog->getTranslations('title');
            $excerptTranslations = $blog->getTranslations('excerpt');
            $contentTranslations = $blog->getTranslations('content_html');

            $sourceTitle = $titleTranslations['id'] ?? (is_string($blog->getRawOriginal('title')) ? $blog->getRawOriginal('title') : '');
            $sourceExcerpt = $excerptTranslations['id'] ?? (is_string($blog->getRawOriginal('excerpt')) ? $blog->getRawOriginal('excerpt') : '');
            $sourceContent = $contentTranslations['id'] ?? (is_string($blog->getRawOriginal('content_html')) ? $blog->getRawOriginal('content_html') : '');

            if (empty($sourceTitle)) {
                $sourceTitle = (string) $blog->title;
            }
            if (empty($sourceExcerpt)) {
                $sourceExcerpt = (string) $blog->excerpt;
            }
            if (empty($sourceContent)) {
                $sourceContent = (string) $blog->content_html;
            }

            $needsTitle = $force || empty($titleTranslations['en']) || empty($titleTranslations['ar']);
            $needsExcerpt = $force || (empty($excerptTranslations['en']) && ! empty($sourceExcerpt)) || (empty($excerptTranslations['ar']) && ! empty($sourceExcerpt));
            $needsContent = $force || empty($contentTranslations['en']) || empty($contentTranslations['ar']);

            $fieldsToTranslate = [];
            if ($needsTitle && ! empty($sourceTitle)) {
                $fieldsToTranslate['title'] = $sourceTitle;
            }
            if ($needsExcerpt && ! empty($sourceExcerpt)) {
                $fieldsToTranslate['excerpt'] = $sourceExcerpt;
            }
            if ($needsContent && ! empty($sourceContent)) {
                $fieldsToTranslate['content_html'] = $sourceContent;
            }

            if (! empty($fieldsToTranslate)) {
                $this->comment('  Menerjemahkan ke EN & AR...');
                $translated = $translator->translateFields($fieldsToTranslate, ['en', 'ar'], 'id', ['content_html']);

                if (isset($translated['title'])) {
                    $titleTranslations['id'] = $sourceTitle;
                    $titleTranslations['en'] = $translated['title']['en'] ?? ($titleTranslations['en'] ?? '');
                    $titleTranslations['ar'] = $translated['title']['ar'] ?? ($titleTranslations['ar'] ?? '');
                    $blog->setTranslations('title', $titleTranslations);
                }

                if (isset($translated['excerpt'])) {
                    $excerptTranslations['id'] = $sourceExcerpt;
                    $excerptTranslations['en'] = $translated['excerpt']['en'] ?? ($excerptTranslations['en'] ?? '');
                    $excerptTranslations['ar'] = $translated['excerpt']['ar'] ?? ($excerptTranslations['ar'] ?? '');
                    $blog->setTranslations('excerpt', $excerptTranslations);
                }

                if (isset($translated['content_html'])) {
                    $contentTranslations['id'] = $sourceContent;
                    $contentTranslations['en'] = $translated['content_html']['en'] ?? ($contentTranslations['en'] ?? '');
                    $contentTranslations['ar'] = $translated['content_html']['ar'] ?? ($contentTranslations['ar'] ?? '');
                    $blog->setTranslations('content_html', $contentTranslations);
                }

                $blog->save();
                $this->info("  ✓ Berita #{$blog->id} selesai diperbarui.");
            } else {
                $this->info("  - Berita #{$blog->id} sudah memiliki terjemahan lengkap (gunakan --force untuk menimpa).");
            }
        }

        $this->info('🎉 Semua konten database berhasil diterjemahkan!');

        return Command::SUCCESS;
    }
}
