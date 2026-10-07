<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => true]),
        'api.pwnedpasswords.com/*' => Http::response(''),
    ]);
});

test('successful login updates last_login_at and records auth activity log', function () {
    $user = User::factory()->create([
        'last_login_at' => null,
    ]);

    expect($user->last_login_at)->toBeNull();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'cf-turnstile-response' => 'test-token',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user->refresh();
    expect($user->last_login_at)->not->toBeNull();

    $log = Activity::where('log_name', 'auth')
        ->where('event', 'login')
        ->where('causer_id', $user->id)
        ->first();

    expect($log)->not->toBeNull();
    expect($log->description)->toContain($user->email);
    expect($log->properties->has('ip'))->toBeTrue();
});

test('failed login attempts are audited without storing plaintext passwords', function () {
    $user = User::factory()->create();

    $secretAttemptPassword = 'SuperSecretWrongAttemptedPassword!#99';

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => $secretAttemptPassword,
        'cf-turnstile-response' => 'test-token',
    ]);

    $this->assertGuest();

    $log = Activity::where('log_name', 'auth')
        ->where('event', 'login_failed')
        ->latest('id')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->properties['email'])->toBe($user->email);
    expect($log->properties->has('ip'))->toBeTrue();

    // Verify plaintext password is NEVER stored
    $allLogContent = json_encode($log->toArray());
    expect($allLogContent)->not->toContain($secretAttemptPassword);
});

test('security settings page receives lastLoginAt prop', function () {
    $now = now();
    $user = User::factory()->create([
        'last_login_at' => $now,
    ]);

    $response = $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('settings/security')
        ->where('lastLoginAt', $now->toIso8601String())
    );
});
