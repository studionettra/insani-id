<?php

use App\Models\AnalyticsEvent;
use App\Models\AppSetting;
use App\Models\Donation;
use App\Models\Program;
use App\Services\MetaCapiService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    AppSetting::whereIn('key', [
        'meta_pixel_id',
        'meta_capi_enabled',
        'meta_capi_access_token',
        'meta_capi_test_event_code',
    ])->delete();
});

test('meta capi returns false when disabled in settings', function () {
    $service = new MetaCapiService;
    $donation = Donation::factory()->create();

    $result = $service->sendPurchaseEvent($donation);

    expect($result)->toBeFalse();
});

test('meta capi returns false when credentials are missing', function () {
    AppSetting::set('meta_capi_enabled', '1');
    // Token and Pixel ID are missing

    $service = new MetaCapiService;
    $donation = Donation::factory()->create();

    $result = $service->sendPurchaseEvent($donation);

    expect($result)->toBeFalse();
});

test('meta capi sends correct payload with hashed user data and records analytics event', function () {
    AppSetting::set('meta_pixel_id', '1234567890');
    AppSetting::set('meta_capi_enabled', '1');
    AppSetting::set('meta_capi_access_token', 'EAABbCcDdEe');
    AppSetting::set('meta_capi_test_event_code', 'TEST12345');

    Http::fake([
        'https://graph.facebook.com/v20.0/1234567890/events*' => Http::response([
            'events_received' => 1,
            'messages' => [],
            'fbtrace_id' => 'trace_123',
        ], 200),
    ]);

    $program = Program::factory()->create(['title' => 'Bantu Korban Bencana']);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'INSANI-DON-TEST99',
        'donor_name' => 'Ahmad Dahlan',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '081234567890',
        'is_anonymous' => false,
        'amount' => 150000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $service = new MetaCapiService;
    $result = $service->sendPurchaseEvent($donation, '192.168.1.1', 'Mozilla/5.0');

    expect($result)->toBeTrue();

    // Verify HTTP request sent to Meta
    Http::assertSent(function (Request $request) {
        $data = $request['data'][0];

        $expectedEmailHash = hash('sha256', 'ahmad@example.com');
        $expectedPhoneHash = hash('sha256', '6281234567890'); // 0812 converted to 62812
        $expectedFirstNameHash = hash('sha256', 'ahmad');

        return $request->url() === 'https://graph.facebook.com/v20.0/1234567890/events'
            && $data['event_name'] === 'Purchase'
            && $data['event_id'] === 'INSANI-DON-TEST99'
            && $data['user_data']['em'][0] === $expectedEmailHash
            && $data['user_data']['ph'][0] === $expectedPhoneHash
            && $data['user_data']['fn'][0] === $expectedFirstNameHash
            && $data['custom_data']['value'] == 150000
            && $data['custom_data']['currency'] === 'IDR'
            && $request['test_event_code'] === 'TEST12345';
    });

    // Verify it is logged in analytics_events table
    $event = AnalyticsEvent::where('event_name', 'Purchase')
        ->where('meta_status', 'capi_sent')
        ->latest('id')
        ->first();

    expect($event)->not->toBeNull();
    expect($event->payload['donation_code'])->toBe('INSANI-DON-TEST99');
    expect($event->payload['source'])->toBe('server_capi');
});
