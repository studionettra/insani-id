<?php

use App\Actions\Fortify\EnableTwoFactorAuthentication;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider as TwoFactorAuthenticationProviderContract;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\HttpException;

beforeEach(function () {
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => true]),
        'api.pwnedpasswords.com/*' => Http::response(''),
    ]);
});

test('two factor challenge screen can be rendered for challenged user', function () {
    $user = User::factory()->withTwoFactor()->create();

    $response = $this->withSession(['login.id' => $user->id])
        ->get(route('two-factor.login'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Auth/TwoFactorChallenge'),
    );
});

test('two factor challenge redirects to login if no challenged user in session', function () {
    $response = $this->get(route('two-factor.login'));

    $response->assertRedirect(route('login'));
});

test('user can authenticate using valid two factor totp code', function () {
    $user = User::factory()->withTwoFactor()->create();

    $mock = mock(TwoFactorAuthenticationProviderContract::class);
    $mock->shouldReceive('verify')->once()->andReturn(true);
    $this->app->instance(TwoFactorAuthenticationProviderContract::class, $mock);

    $response = $this->withSession(['login.id' => $user->id])
        ->post(route('two-factor.login.store'), [
            'code' => '123456',
        ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
});

test('user cannot authenticate using invalid two factor totp code', function () {
    $user = User::factory()->withTwoFactor()->create();

    $mock = mock(TwoFactorAuthenticationProviderContract::class);
    $mock->shouldReceive('verify')->once()->andReturn(false);
    $this->app->instance(TwoFactorAuthenticationProviderContract::class, $mock);

    $response = $this->withSession(['login.id' => $user->id])
        ->post(route('two-factor.login.store'), [
            'code' => '999999',
        ]);

    $response->assertSessionHasErrors('code');
    $this->assertGuest();
});

test('user can authenticate using valid recovery code', function () {
    $user = User::factory()->create([
        'two_factor_secret' => encrypt('secret-key'),
        'two_factor_recovery_codes' => encrypt(json_encode(['valid-recovery-code-1', 'valid-recovery-code-2'])),
        'two_factor_confirmed_at' => now(),
    ]);

    $response = $this->withSession(['login.id' => $user->id])
        ->post(route('two-factor.login.store'), [
            'recovery_code' => 'valid-recovery-code-1',
        ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);

    $freshUser = $user->fresh();
    expect($freshUser->recoveryCodes())->not->toContain('valid-recovery-code-1');
});

test('user cannot authenticate using invalid recovery code', function () {
    $user = User::factory()->withTwoFactor()->create();

    $response = $this->withSession(['login.id' => $user->id])
        ->post(route('two-factor.login.store'), [
            'recovery_code' => 'invalid-recovery-code',
        ]);

    $response->assertSessionHasErrors('recovery_code');
    $this->assertGuest();
});

test('staff user can enable two factor authentication', function () {
    Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);

    $staff = User::factory()->create();
    $staff->assignRole('Administrator');

    expect($staff->isStaff())->toBeTrue();

    app(EnableTwoFactorAuthentication::class)($staff);

    $staff->refresh();
    expect($staff->two_factor_secret)->not->toBeNull();
    expect($staff->two_factor_recovery_codes)->not->toBeNull();
});

test('non staff user is forbidden from enabling two factor authentication in production', function () {
    $donor = User::factory()->create();

    expect($donor->isStaff())->toBeFalse();

    // Simulate non-testing environment
    $originalEnv = app()->environment();
    app()->detectEnvironment(fn () => 'production');

    try {
        app(EnableTwoFactorAuthentication::class)($donor);
        $this->fail('Expected HttpException (403) was not thrown.');
    } catch (HttpException $e) {
        expect($e->getStatusCode())->toBe(403);
    } finally {
        app()->detectEnvironment(fn () => $originalEnv);
    }
});
