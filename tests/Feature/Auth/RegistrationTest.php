<?php

use App\Models\Donation;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());

    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => true]),
    ]);
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'cf-turnstile-response' => 'test-token',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('it automatically links previous guest donations to newly registered user with matching email', function () {
    $guestDonation = Donation::factory()->create([
        'donor_email' => 'guest.donor@example.com',
        'donor_user_id' => null,
    ]);

    expect($guestDonation->donor_user_id)->toBeNull();

    $response = $this->post(route('register.store'), [
        'name' => 'Guest Donor User',
        'email' => 'guest.donor@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'cf-turnstile-response' => 'test-token',
    ]);

    $this->assertAuthenticated();

    $user = auth()->user();
    $guestDonation->refresh();

    expect($guestDonation->donor_user_id)->toBe($user->id);
});
