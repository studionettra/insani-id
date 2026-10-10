<?php

use App\Models\Disbursement;
use App\Models\Program;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    $this->assertSoftDeleted($user);
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});

test('user can delete their account and credentials are anonymized freeing original email', function () {
    $originalEmail = 'donatur.insani@example.com';
    $user = User::factory()->create([
        'email' => $originalEmail,
        'phone' => '081234567890',
        'name' => 'Donatur Dermawan',
    ]);

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    $this->assertSoftDeleted($user);

    $user->refresh();
    expect($user->email)->toContain('@anonymized.insani.id');
    expect($user->phone)->toBeNull();
    expect($user->name)->toBe('Sahabat Insani (Akun Dihapus)');
    expect($user->is_active)->toBeFalse();

    // Original email can be registered again without unique constraint collision
    $newUser = User::factory()->create(['email' => $originalEmail]);
    expect($newUser->email)->toBe($originalEmail);
});

test('staff member cannot delete their account via settings', function () {
    Role::firstOrCreate(['name' => 'Administrator']);
    $staff = User::factory()->create();
    $staff->assignRole('Administrator');

    $response = $this
        ->actingAs($staff)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    $errors = session('errors')->get('password');
    expect($errors)->toContain('Akun pengelola internal tidak dapat dihapus secara mandiri. Silakan hubungi Administrator utama untuk pengalihan wewenang.');

    expect($staff->fresh()->trashed())->toBeFalse();
});

test('campaigner with active program cannot delete their account', function () {
    $campaigner = User::factory()->create();
    Program::factory()->create([
        'created_by' => $campaigner->id,
        'status' => 'published',
    ]);

    $response = $this
        ->actingAs($campaigner)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    $errors = session('errors')->get('password');
    expect($errors)->toContain('Anda masih memiliki program donasi aktif atau dalam proses verifikasi. Program harus diselesaikan atau ditutup terlebih dahulu sebelum akun dapat dihapus.');

    expect($campaigner->fresh()->trashed())->toBeFalse();
});

test('campaigner with pending disbursement cannot delete their account', function () {
    $campaigner = User::factory()->create();
    $program = Program::factory()->create([
        'created_by' => $campaigner->id,
        'status' => 'completed',
    ]);

    Disbursement::factory()->create([
        'program_id' => $program->id,
        'status' => 'pending',
    ]);

    $response = $this
        ->actingAs($campaigner)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    $errors = session('errors')->get('password');
    expect($errors)->toContain('Anda masih memiliki pengajuan pencairan dana yang sedang berjalan. Selesaikan proses pencairan sebelum menghapus akun.');

    expect($campaigner->fresh()->trashed())->toBeFalse();
});

test('profile alias redirects to settings profile', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/profile');

    $response->assertRedirect('/settings/profile');
});
