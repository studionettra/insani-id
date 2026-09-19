<?php

use App\Models\CampaignerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login when accessing campaigner program routes', function () {
    $response = $this->get('/akun/programs');
    $response->assertRedirect(route('login'));
});

test('campaigner routes have prevent-back-history no-cache headers', function () {
    $user = User::factory()->create();
    CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'full_name' => 'Campaigner Budi',
        'identity_number' => '1234567890123456',
        'address' => 'Jl. Merdeka',
        'city' => 'Jakarta',
        'province' => 'DKI Jakarta',
        'postal_code' => '10110',
        'phone' => '08123456789',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Budi',
        'verification_status' => 'verified',
    ]);

    $response = $this->actingAs($user)->get('/akun/programs');
    $response->assertOk();

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('no-cache')
        ->toContain('no-store')
        ->toContain('must-revalidate');
    $response->assertHeader('Pragma', 'no-cache');
});

test('logged out campaigner cannot access dashboard or program routes on back navigation', function () {
    $user = User::factory()->create();
    CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'full_name' => 'Campaigner Budi',
        'identity_number' => '1234567890123456',
        'address' => 'Jl. Merdeka',
        'city' => 'Jakarta',
        'province' => 'DKI Jakarta',
        'postal_code' => '10110',
        'phone' => '08123456789',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Budi',
        'verification_status' => 'verified',
    ]);

    // 1. Visit program listing
    $response = $this->actingAs($user)->get('/akun/programs');
    $response->assertOk();

    // 2. Perform logout
    $logoutResponse = $this->post(route('logout'));
    $logoutResponse->assertRedirect(route('login'));
    $this->assertGuest();

    // 3. Attempt to visit campaigner programs or dashboard again (simulating back navigation)
    $backResponse = $this->get('/akun/programs');
    $backResponse->assertRedirect(route('login'));

    $dashboardBackResponse = $this->get(route('dashboard'));
    $dashboardBackResponse->assertRedirect(route('login'));
});
