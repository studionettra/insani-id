<?php

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsPageView;
use App\Models\AnalyticsSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
});

test('public visitor pageview is recorded via collect endpoint', function () {
    $sessionId = 'sid_test_1234567890';

    $response = $this->postJson(route('analytics.collect'), [
        'type' => 'page_view',
        'session_id' => $sessionId,
        'url' => 'http://localhost/program/bantu-anak-yatim',
        'title' => 'Bantu Anak Yatim',
        'utm_source' => 'facebook',
        'utm_medium' => 'cpc',
        'utm_campaign' => 'ramadhan_berkah',
    ], [
        'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    ]);

    $response->assertOk();

    expect(AnalyticsSession::count())->toBe(1);
    $session = AnalyticsSession::find($sessionId);
    expect($session)->not->toBeNull()
        ->and($session->device_type)->toBe('mobile')
        ->and($session->os)->toBe('iOS')
        ->and($session->browser)->toBe('Safari')
        ->and($session->utm_source)->toBe('facebook')
        ->and($session->utm_campaign)->toBe('ramadhan_berkah');

    expect(AnalyticsPageView::count())->toBe(1);
    $pageView = AnalyticsPageView::first();
    expect($pageView->path)->toBe('/program/bantu-anak-yatim')
        ->and($pageView->title)->toBe('Bantu Anak Yatim')
        ->and($pageView->session_id)->toBe($sessionId);
});

test('conversion and checkout events are recorded with json payload', function () {
    $sessionId = 'sid_event_test_999';

    $response = $this->postJson(route('analytics.collect'), [
        'type' => 'event',
        'session_id' => $sessionId,
        'event_name' => 'InitiateCheckout',
        'url' => 'http://localhost/program/sedekah-subuh/donasi',
        'meta_status' => 'sent',
        'payload' => [
            'amount' => 50000,
            'program_title' => 'Sedekah Subuh',
            'payment_channel' => 'BCA_VA',
        ],
    ]);

    $response->assertOk();

    expect(AnalyticsEvent::count())->toBe(1);
    $event = AnalyticsEvent::first();
    expect($event->event_name)->toBe('InitiateCheckout')
        ->and($event->meta_status)->toBe('sent')
        ->and($event->payload['amount'])->toBe(50000)
        ->and($event->payload['program_title'])->toBe('Sedekah Subuh');
});

test('heartbeat endpoint increments pageview duration', function () {
    $sessionId = 'sid_heartbeat_111';
    $url = 'http://localhost/program/bantu-dhuafa';

    // Record initial pageview
    $this->postJson(route('analytics.collect'), [
        'type' => 'page_view',
        'session_id' => $sessionId,
        'url' => $url,
        'title' => 'Bantu Dhuafa',
    ]);

    $pageView = AnalyticsPageView::first();
    expect($pageView->duration_seconds)->toBe(0);

    // Send heartbeat
    $response = $this->postJson(route('analytics.heartbeat'), [
        'session_id' => $sessionId,
        'url' => $url,
        'increment' => 15,
    ]);

    $response->assertNoContent();

    $pageView->refresh();
    expect($pageView->duration_seconds)->toBe(15);
});

test('admin paths and staff users are excluded from public analytics collection', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    // Case 1: URL is in /admin
    $response1 = $this->postJson(route('analytics.collect'), [
        'type' => 'page_view',
        'session_id' => 'sid_admin_1',
        'url' => 'http://localhost/admin/programs',
    ]);
    $response1->assertNoContent();
    expect(AnalyticsSession::count())->toBe(0);

    // Case 2: User is authenticated as Administrator
    $response2 = $this->actingAs($admin)->postJson(route('analytics.collect'), [
        'type' => 'page_view',
        'session_id' => 'sid_admin_2',
        'url' => 'http://localhost/program/beasiswa',
    ]);
    $response2->assertNoContent();
    expect(AnalyticsSession::count())->toBe(0);
});
