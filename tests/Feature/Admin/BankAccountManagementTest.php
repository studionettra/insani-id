<?php

use App\Models\BankAccount;
use App\Models\User;
use App\Services\MidtransCorePaymentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

it('allows admin to toggle bank account active status', function () {
    $account = BankAccount::create([
        'bank_name' => 'Bank Mandiri Syariah',
        'bank_code' => 'BSM',
        'account_number' => '5544332211',
        'account_name' => 'Yayasan Insani',
        'bank_type' => 'syariah',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->patch(route('admin.bank-accounts.toggle', $account))
        ->assertRedirect()
        ->assertSessionHas('success');

    $account->refresh();
    expect($account->is_active)->toBeFalse();

    actingAs($this->admin)
        ->patch(route('admin.bank-accounts.toggle', $account))
        ->assertRedirect()
        ->assertSessionHas('success');

    $account->refresh();
    expect($account->is_active)->toBeTrue();
});

it('dynamically provides active bank accounts in MidtransCorePaymentService channels', function () {
    BankAccount::query()->delete();

    $account = BankAccount::create([
        'bank_name' => 'Bank Syariah Bukopin',
        'bank_code' => 'BSB',
        'account_number' => '9988776655',
        'account_name' => 'Yayasan Insani Bukopin',
        'bank_type' => 'syariah',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $inactiveAccount = BankAccount::create([
        'bank_name' => 'Bank Nonaktif',
        'bank_code' => 'NONAKTIF',
        'account_number' => '0011223344',
        'account_name' => 'Yayasan Nonaktif',
        'bank_type' => 'konvensional',
        'is_active' => false,
        'sort_order' => 2,
    ]);

    $channels = MidtransCorePaymentService::getAvailableChannels();
    $channelCodes = collect($channels)->pluck('code')->all();

    expect($channelCodes)->toContain('MANUAL_BSB');
    expect($channelCodes)->not->toContain('MANUAL_NONAKTIF');
});

it('passes bank accounts list to site settings page', function () {
    Permission::firstOrCreate(['name' => 'settings.view']);
    $this->adminRole->givePermissionTo('settings.view');
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    BankAccount::create([
        'bank_name' => 'Bank Syariah Mandiri',
        'bank_code' => 'BSM',
        'account_number' => '123123123',
        'account_name' => 'Yayasan Insani',
        'bank_type' => 'syariah',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get(route('admin.site-settings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/SiteSettings/Index')
            ->has('bankAccounts')
        );
});

it('allows admin to create a bank account with a preset logo from the library', function () {
    actingAs($this->admin)
        ->post(route('admin.bank-accounts.store'), [
            'bank_name' => 'Bank Mandiri',
            'bank_code' => 'MANDIRI',
            'account_number' => '1400012345678',
            'account_name' => 'Yayasan Peduli Insani Indonesia',
            'bank_type' => 'konvensional',
            'preset_logo' => 'images/banks/mandiri.svg',
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $account = BankAccount::where('account_number', '1400012345678')->first();
    expect($account)->not->toBeNull();
    expect($account->logo_path)->toBe('images/banks/mandiri.svg');
    expect($account->logo_url)->toContain('images/banks/mandiri.svg');
});

it('allows admin to update a bank account with custom uploaded logo', function () {
    Storage::fake('public');

    $account = BankAccount::create([
        'bank_name' => 'Bank Muamalat',
        'bank_code' => 'MUAMALAT',
        'account_number' => '3010009999',
        'account_name' => 'Yayasan Insani',
        'bank_type' => 'syariah',
        'preset_logo' => 'images/banks/bsi.svg',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $file = UploadedFile::fake()->image('custom_muamalat.png');

    actingAs($this->admin)
        ->put(route('admin.bank-accounts.update', $account), [
            'bank_name' => 'Bank Muamalat Indonesia',
            'bank_code' => 'MUAMALAT',
            'account_number' => '3010009999',
            'account_name' => 'Yayasan Insani',
            'bank_type' => 'syariah',
            'logo' => $file,
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $account->refresh();
    expect($account->logo_path)->toStartWith('banks/');
    expect($account->logo_url)->toContain('storage/banks/');
    Storage::disk('public')->assertExists($account->logo_path);
});
