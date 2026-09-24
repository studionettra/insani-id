<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => true]),
    ]);
});

test('confirm password screen can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('password.confirm'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Auth/ConfirmPassword'),
    );
});

test('password confirmation requires authentication', function () {
    $response = $this->get(route('password.confirm'));

    $response->assertRedirect(route('login'));
});

test('password can be confirmed with valid password and turnstile', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->actingAs($user)->post(route('password.confirm.store'), [
        'password' => 'password123',
        'cf-turnstile-response' => 'valid-turnstile-token',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('auth.password_confirmed_at');
});

test('password confirmation requires turnstile verification', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->actingAs($user)->post(route('password.confirm.store'), [
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('cf-turnstile-response');
});

test('password confirmation fails with incorrect password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->actingAs($user)->post(route('password.confirm.store'), [
        'password' => 'wrong-password',
        'cf-turnstile-response' => 'valid-turnstile-token',
    ]);

    $response->assertSessionHasErrors('password');
});
