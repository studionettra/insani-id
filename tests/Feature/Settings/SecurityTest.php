<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

beforeEach(function () {
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => true]),
        'api.pwnedpasswords.com/*' => Http::response(''),
    ]);
});

test('security page is displayed', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', false),
        );
});

test('security page requires password confirmation when enabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->create();

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('security.edit'));

    $response->assertRedirect(route('password.confirm'));
});

test('security page renders without two factor when feature is disabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    config(['fortify.features' => []]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManageTwoFactor', false)
            ->missing('twoFactorEnabled')
            ->missing('requiresConfirmation'),
        );
});

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect(Hash::check('NewPassword123!', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect(route('security.edit'));
});

test('password update with logout_other_devices terminates other sessions', function () {
    $user = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'other-session-device-abc',
        'user_id' => $user->id,
        'ip_address' => '192.168.1.100',
        'user_agent' => 'Other Browser User Agent',
        'payload' => base64_encode(serialize(['data' => 'sample'])),
        'last_activity' => time(),
    ]);

    expect(DB::table('sessions')->where('id', 'other-session-device-abc')->exists())->toBeTrue();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'BrandNewSecPass123!',
            'password_confirmation' => 'BrandNewSecPass123!',
            'logout_other_devices' => true,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect(Hash::check('BrandNewSecPass123!', $user->refresh()->password))->toBeTrue();
    expect(DB::table('sessions')->where('id', 'other-session-device-abc')->exists())->toBeFalse();
});

test('password update with logout_other_devices false keeps other sessions', function () {
    $user = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'other-session-device-xyz',
        'user_id' => $user->id,
        'ip_address' => '192.168.1.101',
        'user_agent' => 'Other Browser User Agent',
        'payload' => base64_encode(serialize(['data' => 'sample'])),
        'last_activity' => time(),
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'BrandNewSecPass456!',
            'password_confirmation' => 'BrandNewSecPass456!',
            'logout_other_devices' => false,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect(Hash::check('BrandNewSecPass456!', $user->refresh()->password))->toBeTrue();
    expect(DB::table('sessions')->where('id', 'other-session-device-xyz')->exists())->toBeTrue();
});
