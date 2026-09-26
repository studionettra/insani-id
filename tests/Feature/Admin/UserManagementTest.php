<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    Role::firstOrCreate(['name' => 'Donatur']);

    $userViewPerm = Permission::firstOrCreate(['name' => 'user.view']);
    $this->adminRole->givePermissionTo($userViewPerm);

    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

test('it returns clear indonesian validation error when password lacks mixed case', function () {
    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.store'), [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'lowercaseonly123!',
            'password_confirmation' => 'lowercaseonly123!',
            'role' => 'Donatur',
        ]);

    $response->assertSessionHasErrors(['password']);

    $errors = session('errors')->get('password');
    expect($errors)->toContain('Password harus mengandung kombinasi huruf besar dan huruf kecil.');
});

test('it returns clear indonesian validation error when password lacks symbols', function () {
    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.store'), [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'Password1234',
            'password_confirmation' => 'Password1234',
            'role' => 'Donatur',
        ]);

    $response->assertSessionHasErrors(['password']);

    $errors = session('errors')->get('password');
    expect($errors)->toContain('Password harus mengandung setidaknya satu simbol atau karakter khusus (contoh: !@#$%^&*).');
});

test('it returns clear indonesian validation error when password confirmation does not match', function () {
    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.store'), [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'Password123!@#',
            'password_confirmation' => 'DifferentPassword123!@#',
            'role' => 'Donatur',
        ]);

    $response->assertSessionHasErrors(['password']);

    $errors = session('errors')->get('password');
    expect($errors)->toContain('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
});

test('it successfully creates user when password satisfies all criteria', function () {
    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.store'), [
            'name' => 'Valid User',
            'email' => 'validuser@example.com',
            'password' => 'SecurePass123!@#',
            'password_confirmation' => 'SecurePass123!@#',
            'role' => 'Donatur',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    expect(User::where('email', 'validuser@example.com')->exists())->toBeTrue();
});

test('it displays user listing and supports search query', function () {
    $user1 = User::factory()->create(['name' => 'Ahmad Dahlan', 'email' => 'ahmad@example.com']);
    $user2 = User::factory()->create(['name' => 'Siti Walidah', 'email' => 'siti@example.com']);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.users.index', ['search' => 'Ahmad']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Users/Index')
        ->has('users.data')
        ->where('filters.search', 'Ahmad')
    );
});

test('it updates user basic info and role without modifying password', function () {
    $targetUser = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'original@example.com',
        'password' => bcrypt('OldSecret123!@#'),
    ]);
    $targetUser->assignRole('Donatur');

    $originalPasswordHash = $targetUser->password;

    $response = $this->actingAs($this->admin)
        ->put(route('admin.users.update', $targetUser->id), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'Administrator',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $targetUser->refresh();
    expect($targetUser->name)->toBe('Updated Name')
        ->and($targetUser->email)->toBe('updated@example.com')
        ->and($targetUser->password)->toBe($originalPasswordHash)
        ->and($targetUser->hasRole('Administrator'))->toBeTrue();
});

test('it updates password when valid new password is provided', function () {
    $targetUser = User::factory()->create([
        'name' => 'Test User',
        'email' => 'target@example.com',
        'password' => bcrypt('OldSecret123!@#'),
    ]);
    $targetUser->assignRole('Donatur');

    $response = $this->actingAs($this->admin)
        ->put(route('admin.users.update', $targetUser->id), [
            'name' => 'Test User',
            'email' => 'target@example.com',
            'role' => 'Donatur',
            'password' => 'NewSecurePassword123!@#',
            'password_confirmation' => 'NewSecurePassword123!@#',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $targetUser->refresh();
    expect(Hash::check('NewSecurePassword123!@#', $targetUser->password))->toBeTrue();
});

test('it prevents admin from deleting their own account', function () {
    $response = $this->actingAs($this->admin)
        ->delete(route('admin.users.destroy', $this->admin->id));

    $response->assertRedirect();
    $response->assertSessionHas('error', 'You cannot delete yourself.');

    expect(User::where('id', $this->admin->id)->exists())->toBeTrue();
});

test('it allows admin to delete other accounts', function () {
    $targetUser = User::factory()->create();

    $response = $this->actingAs($this->admin)
        ->delete(route('admin.users.destroy', $targetUser->id));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'User deleted successfully.');

    expect(User::where('id', $targetUser->id)->exists())->toBeFalse();
});

test('unauthorized users without permission cannot access user management', function () {
    $regularUser = User::factory()->create();

    $response = $this->actingAs($regularUser)
        ->get(route('admin.users.index'));

    $response->assertForbidden();
});

test('it passes counts and filters users by segment type', function () {
    Role::firstOrCreate(['name' => 'Program Officer']);
    Role::firstOrCreate(['name' => 'Campaigner Lembaga']);

    $staff = User::factory()->create(['name' => 'Staff Program']);
    $staff->assignRole('Program Officer');

    $lembaga = User::factory()->create(['name' => 'Lembaga Amal']);
    $lembaga->assignRole('Campaigner Lembaga');

    $response = $this->actingAs($this->admin)
        ->get(route('admin.users.index', ['type' => 'internal']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Users/Index')
        ->has('counts.internal')
        ->has('counts.all')
        ->where('filters.type', 'internal')
    );
});

test('it allows admin to toggle active status of another user', function () {
    $targetUser = User::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->admin)
        ->patch(route('admin.users.toggle-status', $targetUser->id));

    $response->assertRedirect();
    expect($targetUser->fresh()->is_active)->toBeFalse();

    $this->actingAs($this->admin)
        ->patch(route('admin.users.toggle-status', $targetUser->id));
    expect($targetUser->fresh()->is_active)->toBeTrue();
});

test('it prevents admin from toggling their own active status', function () {
    $response = $this->actingAs($this->admin)
        ->patch(route('admin.users.toggle-status', $this->admin->id));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect($this->admin->fresh()->is_active)->toBeTrue();
});
