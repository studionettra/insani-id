<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\BlogSyncService;
use Illuminate\Support\Facades\Log;

class FullSyncBlogPostsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(BlogSyncService $syncService): void
    {
        Log::info('Starting full sync of WordPress blog posts.');
        
        try {
            $syncService->syncAllPosts();
            Log::info('Finished full sync of WordPress blog posts.');
        } catch (\Exception $e) {
            Log::error('Full sync of WordPress blog posts failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
