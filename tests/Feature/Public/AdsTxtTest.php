<?php

use App\Models\AppSetting;

beforeEach(function () {
    AppSetting::whereIn('key', ['ads_txt_content', 'google_adsense_client_id'])->delete();
});

it('returns custom ads.txt content when configured in settings', function () {
    AppSetting::set('ads_txt_content', "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\nexample.com, pub-999, RESELLER");

    $response = $this->get('/ads.txt');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/plain; charset=utf-8');
    expect($response->getContent())->toContain('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0');
    expect($response->getContent())->toContain('example.com, pub-999, RESELLER');
});

it('returns auto-generated ads.txt when client id is set but ads_txt_content is empty', function () {
    AppSetting::set('google_adsense_client_id', 'ca-pub-9876543210987654');

    $response = $this->get('/ads.txt');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/plain; charset=utf-8');
    expect($response->getContent())->toBe('google.com, pub-9876543210987654, DIRECT, f08c47fec0942fa0');
});

it('returns 404 when neither ads.txt content nor client id is configured', function () {
    $response = $this->get('/ads.txt');

    $response->assertNotFound();
});
