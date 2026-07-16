<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\BlogSyncService;
use App\Jobs\FullSyncBlogPostsJob;

class WordPressWebhookController extends Controller
{
    /**
     * Handle incoming webhook from WordPress.
     * We use a middleware to verify the token.
     */
    public function handle(Request $request, BlogSyncService $syncService)
    {
        $wpPostId = $request->input('post_id');
        
        // If post_id is provided, sync that specific post
        if ($wpPostId) {
            // We can dispatch a job or run it synchronously
            // For now, we will run it synchronously as requested by the plan
            $syncService->syncPost($wpPostId);
            return response()->json(['message' => 'Post synced successfully']);
        }
        
        // If no post_id, maybe it's a full sync trigger
        dispatch(new FullSyncBlogPostsJob());
        return response()->json(['message' => 'Full sync dispatched']);
    }
}
