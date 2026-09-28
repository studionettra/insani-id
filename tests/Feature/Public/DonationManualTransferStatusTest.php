<?php

use App\Models\BankAccount;
use App\Models\Donation;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->program = Program::factory()->published()->create([
        'title' => 'Bantu Renovasi Masjid Pelosok',
        'slug' => 'bantu-renovasi-masjid-pelosok',
    ]);

    $this->bsi = BankAccount::create([
        'bank_name' => 'Bank Syariah Indonesia (BSI)',
        'bank_code' => 'MANUAL_BSI',
        'account_number' => '7132195026',
        'account_name' => 'Yayasan Peduli Insani Indonesia',
        'bank_type' => 'syariah',
        'instructions' => 'Transfer via BSI Mobile',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $this->bri = BankAccount::create([
        'bank_name' => 'Bank Rakyat Indonesia (BRI)',
        'bank_code' => 'MANUAL_BRI',
        'account_number' => '034501001366304',
        'account_name' => 'Yayasan Peduli Insani Indonesia',
        'bank_type' => 'konvensional',
        'instructions' => 'Transfer via BRImo',
        'is_active' => true,
        'sort_order' => 2,
    ]);
});

it('resolves only the selected BRI bank account on manual transfer status page', function () {
    $response = $this->post(route('donation.store', $this->program->slug), [
        'amount' => 50000,
        'donor_name' => 'Donatur BRI',
        'donor_email' => 'bri@example.com',
        'donor_phone' => '081234567890',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BRI',
    ]);

    $response->assertRedirect();

    $donation = Donation::where('donor_email', 'bri@example.com')->first();
    expect($donation)->not->toBeNull();

    $statusResponse = $this->get(route('donation.status', $donation->donation_code));
    $statusResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Donation/Status')
            ->has('selectedBankAccount')
            ->where('selectedBankAccount.id', $this->bri->id)
            ->where('selectedBankAccount.bank_name', 'Bank Rakyat Indonesia (BRI)')
            ->where('selectedBankAccount.account_number', '034501001366304')
        );
});

it('resolves only the selected BSI bank account on manual transfer status page', function () {
    $response = $this->post(route('donation.store', $this->program->slug), [
        'amount' => 75000,
        'donor_name' => 'Donatur BSI',
        'donor_email' => 'bsi@example.com',
        'donor_phone' => '081234567891',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
    ]);

    $response->assertRedirect();

    $donation = Donation::where('donor_email', 'bsi@example.com')->first();
    expect($donation)->not->toBeNull();

    $statusResponse = $this->get(route('donation.status', $donation->donation_code));
    $statusResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Donation/Status')
            ->has('selectedBankAccount')
            ->where('selectedBankAccount.id', $this->bsi->id)
            ->where('selectedBankAccount.bank_name', 'Bank Syariah Indonesia (BSI)')
            ->where('selectedBankAccount.account_number', '7132195026')
        );
});

it('dynamically resolves a newly added admin bank account when selected by donor', function () {
    // Admin creates new Bank Mandiri
    $mandiri = BankAccount::create([
        'bank_name' => 'Bank Mandiri',
        'bank_code' => 'MANDIRI',
        'account_number' => '1370019283746',
        'account_name' => 'Yayasan Peduli Insani Indonesia',
        'bank_type' => 'konvensional',
        'instructions' => 'Transfer via Livin by Mandiri',
        'is_active' => true,
        'sort_order' => 3,
    ]);

    $response = $this->post(route('donation.store', $this->program->slug), [
        'amount' => 100000,
        'donor_name' => 'Donatur Mandiri',
        'donor_email' => 'mandiri@example.com',
        'donor_phone' => '081234567892',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_MANDIRI',
    ]);

    $response->assertRedirect();

    $donation = Donation::where('donor_email', 'mandiri@example.com')->first();
    expect($donation)->not->toBeNull();

    $statusResponse = $this->get(route('donation.status', $donation->donation_code));
    $statusResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Donation/Status')
            ->has('selectedBankAccount')
            ->where('selectedBankAccount.id', $mandiri->id)
            ->where('selectedBankAccount.bank_name', 'Bank Mandiri')
            ->where('selectedBankAccount.account_number', '1370019283746')
        );
});
