<?php

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsPageView;
use App\Models\AnalyticsSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $role = Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
    $permission = Permission::firstOrCreate(['name' => 'report.view', 'guard_name' => 'web']);
    $role->givePermissionTo($permission);
});

test('guest cannot access admin analytics hub', function () {
    $response = $this->get(route('admin.analytics.index'));
    $response->assertRedirect(route('login'));
});

test('authorized administrator can view analytics hub page with all tabs data', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    // Seed a sample session, pageview, and event
    $session = AnalyticsSession::create([
        'id' => 'sid_hub_test',
        'ip_address' => '127.0.0.1',
        'device_type' => 'desktop',
        'browser' => 'Chrome',
        'os' => 'Windows',
        'utm_source' => 'whatsapp',
        'last_activity_at' => now(),
    ]);

    AnalyticsPageView::create([
        'session_id' => $session->id,
        'url' => 'http://localhost/program/wakaf-quran',
        'path' => '/program/wakaf-quran',
        'title' => 'Wakaf Al-Quran',
        'duration_seconds' => 45,
        'created_at' => now(),
    ]);

    AnalyticsEvent::create([
        'session_id' => $session->id,
        'event_name' => 'Purchase',
        'url' => 'http://localhost/donasi/status/INV123',
        'meta_status' => 'sent',
        'payload' => ['amount' => 100000],
        'created_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('admin.analytics.index', ['days' => 30]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Analytics/Index')
            ->has('periodDays')
            ->has('realtime')
            ->has('acquisition')
            ->has('engagement')
            ->has('technology')
            ->has('metaEvents')
            ->where('periodDays', 30)
            ->where('realtime.active_visitors_count', 1)
        );
});

test('realtime endpoint returns json metrics for polling', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    $response = $this->actingAs($admin)->getJson(route('admin.analytics.realtime'));

    $response->assertOk()
        ->assertJsonStructure([
            'active_visitors_count',
            'active_pages',
            'views_per_minute',
            'recent_events',
            'last_updated',
        ]);
});

test('events endpoint returns meta pixel diagnostics json', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    $response = $this->actingAs($admin)->getJson(route('admin.analytics.events'));

    $response->assertOk()
        ->assertJsonStructure([
            'config' => [
                'meta_pixel_id',
                'google_analytics_id',
                'google_tag_manager_id',
                'tiktok_pixel_id',
                'has_pixel_configured',
            ],
            'summary_counts',
            'recent_events',
        ]);
});
