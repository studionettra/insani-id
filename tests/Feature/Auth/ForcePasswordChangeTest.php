<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response(['success' => true], 200),
    ]);
});

test('user with must_change_password is redirected to force password change page from dashboard', function () {
    $user = User::factory()->create([
        'must_change_password' => true,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('password.force-change'));
});

test('user with must_change_password false is redirected to dashboard when visiting force password change page', function () {
    $user = User::factory()->create([
        'must_change_password' => false,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('password.force-change'));

    $response->assertRedirect(route('dashboard'));
});

test('force password change screen can be rendered for users who must change password', function () {
    $user = User::factory()->create([
        'must_change_password' => true,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('password.force-change'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Public/Auth/ForcePasswordChange'));
});

test('updating password fails if new password is the same as the temporary password', function () {
    $temporaryPassword = 'OldPassword123!@#';
    $user = User::factory()->create([
        'password' => Hash::make($temporaryPassword),
        'must_change_password' => true,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post(route('password.force-change.update'), [
        'password' => $temporaryPassword,
        'password_confirmation' => $temporaryPassword,
        'cf-turnstile-response' => 'fake-token',
    ]);

    $response->assertSessionHasErrors(['password']);
    expect($user->fresh()->must_change_password)->toBeTrue();
});

test('updating password fails if confirmation does not match', function () {
    $user = User::factory()->create([
        'password' => Hash::make('OldPassword123!@#'),
        'must_change_password' => true,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post(route('password.force-change.update'), [
        'password' => 'NewSecurePassword123!@#',
        'password_confirmation' => 'DifferentPassword123!@#',
        'cf-turnstile-response' => 'fake-token',
    ]);

    $response->assertSessionHasErrors(['password']);
    expect($user->fresh()->must_change_password)->toBeTrue();
});

test('user can successfully update password and access dashboard', function () {
    $user = User::factory()->create([
        'password' => Hash::make('OldPassword123!@#'),
        'must_change_password' => true,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post(route('password.force-change.update'), [
        'password' => 'NewSecurePassword123!@#',
        'password_confirmation' => 'NewSecurePassword123!@#',
        'cf-turnstile-response' => 'fake-token',
    ]);

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('success');

    $freshUser = $user->fresh();
    expect($freshUser->must_change_password)->toBeFalse()
        ->and(Hash::check('NewSecurePassword123!@#', $freshUser->password))->toBeTrue();
});

test('storing user via admin sets email_verified_at and must_change_password flag', function () {
    $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Program Officer']);
    $userViewPerm = Permission::firstOrCreate(['name' => 'user.view']);
    $adminRole->givePermissionTo($userViewPerm);

    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Staf Baru Program',
        'email' => 'staf.program@insani.id',
        'phone' => '081234567890',
        'password' => 'TempPassword123!@#',
        'password_confirmation' => 'TempPassword123!@#',
        'role' => 'Program Officer',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $newUser = User::where('email', 'staf.program@insani.id')->first();
    expect($newUser)->not->toBeNull()
        ->and($newUser->email_verified_at)->not->toBeNull()
        ->and($newUser->must_change_password)->toBeTrue()
        ->and($newUser->hasRole('Program Officer'))->toBeTrue();
});

test('user with role Eksekutif can access admin reports route without 403', function () {
    $eksekutifRole = Role::firstOrCreate(['name' => 'Eksekutif']);
    $reportViewPerm = Permission::firstOrCreate(['name' => 'report.view']);
    $eksekutifRole->givePermissionTo($reportViewPerm);

    $eksekutifUser = User::factory()->create([
        'must_change_password' => false,
        'email_verified_at' => now(),
    ]);
    $eksekutifUser->assignRole('Eksekutif');

    $response = $this->actingAs($eksekutifUser)->get(route('admin.reports.index'));

    $response->assertOk();
});
