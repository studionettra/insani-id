<?php

use Illuminate\Support\Facades\Queue;
use App\Jobs\FullSyncBlogPostsJob;
use Illuminate\Support\Facades\Config;

beforeEach(function () {
    Config::set('services.wordpress.webhook_secret', 'test-secret-123');
});

it('rejects webhook requests without a token', function () {
    $response = $this->postJson(route('webhooks.wordpress'));

    $response->assertStatus(403);
});

it('rejects webhook requests with an invalid token', function () {
    $response = $this->postJson(route('webhooks.wordpress'), [], [
        'X-WP-Webhook-Token' => 'wrong-token'
    ]);

    $response->assertStatus(403);
});

it('accepts webhook requests with a valid token and dispatches full sync if no post_id is provided', function () {
    Queue::fake();

    $response = $this->postJson(route('webhooks.wordpress'), [], [
        'X-WP-Webhook-Token' => 'test-secret-123'
    ]);

    $response->assertStatus(200)
             ->assertJson(['message' => 'Full sync dispatched']);

    Queue::assertPushed(FullSyncBlogPostsJob::class);
});
