<?php

use App\Models\User;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => true]),
    ]);
});

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'cf-turnstile-response' => 'test-token',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
        'cf-turnstile-response' => 'test-token',
    ]);

    $this->assertGuest();
});

test('regular users are redirected to home on logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

test('inertia regular users receive 409 location header to home on logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'), [], ['X-Inertia' => 'true']);

    $response->assertStatus(409);
    $response->assertHeader('X-Inertia-Location', route('home'));

    $this->assertGuest();
});

test('staff or admin users are redirected to login on logout', function () {
    Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    $response = $this->actingAs($admin)->post(route('logout'));

    $response->assertRedirect(route('login'));

    $this->assertGuest();
});

test('inertia staff or admin users receive 409 location header to login on logout', function () {
    Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    $response = $this->actingAs($admin)->post(route('logout'), [], ['X-Inertia' => 'true']);

    $response->assertStatus(409);
    $response->assertHeader('X-Inertia-Location', route('login'));

    $this->assertGuest();
});

test('session expired token mismatch exception redirects to login with flash status', function () {
    Route::post('/test-csrf-route', function () {
        throw new TokenMismatchException('CSRF token mismatch.');
    })->middleware('web');

    $response = $this->post('/test-csrf-route');
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('status', 'Sesi Anda telah berakhir. Silakan masuk kembali.');
});

test('prevent back history headers are set on protected dashboard routes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('no-cache')
        ->toContain('no-store')
        ->toContain('must-revalidate');
    $response->assertHeader('Pragma', 'no-cache');
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
        'cf-turnstile-response' => 'test-token',
    ]);

    $response->assertTooManyRequests();
});

test('deactivated users cannot authenticate', function () {
    $user = User::factory()->create([
        'is_active' => false,
    ]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'cf-turnstile-response' => 'test-token',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});
