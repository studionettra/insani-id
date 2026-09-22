<?php

use App\Models\BankAccount;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $donationViewPerm = Permission::firstOrCreate(['name' => 'donation.view']);

    $this->adminRole->givePermissionTo($donationViewPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('allows admin to list bank accounts', function () {
    BankAccount::create([
        'bank_name' => 'Bank Syariah Indonesia',
        'bank_code' => 'BSI',
        'account_number' => '1234567890',
        'account_name' => 'Yayasan Insani',
        'bank_type' => 'syariah',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get(route('admin.bank-accounts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/BankAccounts/Index'));
});

it('allows admin to create a bank account', function () {
    actingAs($this->admin)
        ->post(route('admin.bank-accounts.store'), [
            'bank_name' => 'Bank Mandiri',
            'bank_code' => 'MANDIRI',
            'account_number' => '9876543210',
            'account_name' => 'Yayasan Insani Mandiri',
            'bank_type' => 'konvensional',
            'is_active' => true,
            'sort_order' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(BankAccount::where('bank_code', 'MANDIRI')->exists())->toBeTrue();
});

it('allows admin to update a bank account', function () {
    $account = BankAccount::create([
        'bank_name' => 'Bank BCA',
        'bank_code' => 'BCA',
        'account_number' => '1122334455',
        'account_name' => 'Yayasan BCA',
        'bank_type' => 'konvensional',
        'is_active' => true,
        'sort_order' => 3,
    ]);

    actingAs($this->admin)
        ->put(route('admin.bank-accounts.update', $account), [
            'bank_name' => 'Bank BCA Syariah',
            'bank_code' => 'BCA',
            'account_number' => '1122334455',
            'account_name' => 'Yayasan BCA Syariah',
            'bank_type' => 'syariah',
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $account->refresh();
    expect($account->bank_name)->toBe('Bank BCA Syariah');
    expect($account->bank_type)->toBe('syariah');
});

it('allows admin to delete a bank account', function () {
    $account = BankAccount::create([
        'bank_name' => 'Bank Hapus',
        'bank_code' => 'HAPUS',
        'account_number' => '00000000',
        'account_name' => 'Yayasan Hapus',
        'bank_type' => 'konvensional',
        'is_active' => true,
        'sort_order' => 99,
    ]);

    actingAs($this->admin)
        ->delete(route('admin.bank-accounts.destroy', $account))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(BankAccount::where('id', $account->id)->exists())->toBeFalse();
});
