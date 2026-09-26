<?php

namespace App\Jobs;

use App\Models\Program;
use App\Services\TranslationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Mews\Purifier\Facades\Purifier;

class TranslateProgramJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Program $program,
        public bool $force = false
    ) {}

    /**
     * Execute the job.
     */
    public function handle(TranslationService $translator): void
    {
        $program = $this->program->fresh();
        if (! $program) {
            return;
        }

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

        if (empty($sourceTitle)) {
            return;
        }

        $needsTitle = $this->force || empty($titleTranslations['en']) || empty($titleTranslations['ar']);
        $needsStory = $this->force || empty($storyTranslations['en']) || empty($storyTranslations['ar']);

        if (! $needsTitle && ! $needsStory) {
            return;
        }

        $fieldsToTranslate = [];
        if ($needsTitle && ! empty($sourceTitle)) {
            $fieldsToTranslate['title'] = $sourceTitle;
        }
        if ($needsStory && ! empty($sourceStory)) {
            $fieldsToTranslate['story'] = $sourceStory;
        }

        if (! empty($fieldsToTranslate)) {
            try {
                $translated = $translator->translateFields($fieldsToTranslate, ['en', 'ar'], 'id', ['story']);

                if (isset($translated['title'])) {
                    $titleTranslations['id'] = $sourceTitle;
                    $titleTranslations['en'] = $translated['title']['en'] ?? ($titleTranslations['en'] ?? '');
                    $titleTranslations['ar'] = $translated['title']['ar'] ?? ($titleTranslations['ar'] ?? '');
                    $program->setTranslations('title', $titleTranslations);
                }

                if (isset($translated['story'])) {
                    $storyTranslations['id'] = $sourceStory;
                    $enStory = $translated['story']['en'] ?? ($storyTranslations['en'] ?? '');
                    $arStory = $translated['story']['ar'] ?? ($storyTranslations['ar'] ?? '');

                    $storyTranslations['en'] = Purifier::clean($enStory);
                    $storyTranslations['ar'] = Purifier::clean($arStory);
                    $program->setTranslations('story', $storyTranslations);
                }

                $program->save();

                Log::info("TranslateProgramJob: Successfully auto-translated program #{$program->id} to EN and AR.");
            } catch (\Throwable $e) {
                Log::error("TranslateProgramJob failed for program #{$program->id}: ".$e->getMessage());
                throw $e;
            }
        }
    }
}
