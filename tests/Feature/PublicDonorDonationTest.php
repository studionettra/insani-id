<?php

namespace Tests\Feature;

use App\Jobs\SendDonationPaidNotification;
use App\Models\Category;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
        'slug' => 'kemanusiaan',
        'platform_fee_percent' => 5.0,
    ]);

    $this->program = Program::factory()->published()->create([
        'category_id' => $this->category->id,
        'title' => 'Bantu Korban Bencana',
        'target_amount' => 50000000,
    ]);
});

test('donor can view their donation history page', function () {
    $donor = User::factory()->create();

    $response = $this->actingAs($donor)->get(route('akun.donations.index'));
    $response->assertOk();
});

test('guest cannot view donor donation history', function () {
    $response = $this->get(route('akun.donations.index'));
    $response->assertRedirect(route('login'));
});

test('donor can create offline donation with unique code and minimum validation', function () {
    $donor = User::factory()->create();

    // Min donation amount validation
    $failedResponse = $this->actingAs($donor)
        ->post(route('donation.store', $this->program->slug), [
            'amount' => 5000, // less than 10,000
            'donor_name' => 'Budi Santoso',
            'donor_email' => 'budi@example.com',
            'donor_phone' => '081234567890',
            'channel' => 'offline',
        ]);

    $failedResponse->assertSessionHasErrors('amount');

    // Valid offline donation
    $response = $this->actingAs($donor)
        ->post(route('donation.store', $this->program->slug), [
            'amount' => 50000,
            'donor_name' => 'Budi Santoso',
            'donor_email' => 'budi@example.com',
            'donor_phone' => '081234567890',
            'channel' => 'offline',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('donations', [
        'program_id' => $this->program->id,
        'donor_user_id' => $donor->id,
        'donor_name' => 'Budi Santoso',
        'donor_email' => 'budi@example.com',
        'channel' => 'offline',
        'status' => 'pending',
    ]);

    $createdDonation = Donation::where('donor_user_id', $donor->id)->first();
    expect($createdDonation->unique_code)->toBeGreaterThanOrEqual(101)
        ->and($createdDonation->unique_code)->toBeLessThanOrEqual(999)
        ->and((float) $createdDonation->amount)->toEqual(50000 + $createdDonation->unique_code);
});

test('payment completion triggers SendDonationPaidNotification job', function () {
    Queue::fake();

    $donation = Donation::factory()->create([
        'program_id' => $this->program->id,
        'amount' => 100000,
        'status' => 'pending',
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'gateway' => 'manual',
        'gateway_reference_id' => 'REF123',
        'gateway_status' => 'PENDING',
    ]);

    // Marking payment as successful triggers PaymentObserver
    $payment->update([
        'gateway_status' => 'PAID',
    ]);

    expect($donation->fresh()->status)->toBe('paid');
    Queue::assertPushed(SendDonationPaidNotification::class);
});

test('scheduled update reminder command runs successfully', function () {
    $this->artisan('disbursements:send-update-reminders')
        ->assertSuccessful();
});

test('online donation returns friendly error when Midtrans server key is not configured', function () {
    config([
        'services.midtrans.server_key' => null,
    ]);

    $donor = User::factory()->create();

    $response = $this->actingAs($donor)
        ->from(route('program.show', $this->program->slug))
        ->post(route('donation.store', $this->program->slug), [
            'amount' => 50000,
            'donor_name' => 'Budi Santoso',
            'donor_email' => 'budi@example.com',
            'donor_phone' => '081234567890',
            'channel' => 'online',
        ]);

    $response->assertRedirect(route('program.show', $this->program->slug));
    $response->assertSessionHas('error');

    $this->assertDatabaseHas('donations', [
        'program_id' => $this->program->id,
        'channel' => 'online',
        'status' => 'failed',
    ]);
});

test('donor can voluntarily cancel their pending donation', function () {
    $donor = User::factory()->create();
    $donation = Donation::factory()->create([
        'program_id' => $this->program->id,
        'donor_user_id' => $donor->id,
        'donor_email' => $donor->email,
        'status' => 'pending',
    ]);
    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'gateway' => 'manual',
        'gateway_status' => 'PENDING',
    ]);

    $response = $this->actingAs($donor)
        ->post(route('donation.cancel', $donation->donation_code));

    $response->assertRedirect(route('donation.status', $donation->donation_code));
    $response->assertSessionHas('success');

    expect($donation->fresh()->status)->toBe('cancelled')
        ->and($donation->payments()->first()->gateway_status)->toBe('CANCELLED');
});

test('donor cannot cancel an already paid donation', function () {
    $donor = User::factory()->create();
    $donation = Donation::factory()->paid()->create([
        'program_id' => $this->program->id,
        'donor_user_id' => $donor->id,
        'donor_email' => $donor->email,
    ]);

    $response = $this->actingAs($donor)
        ->post(route('donation.cancel', $donation->donation_code));

    $response->assertSessionHas('error');
    expect($donation->fresh()->status)->toBe('paid');
});

test('replacing a previous pending donation automatically cancels the old donation', function () {
    $donor = User::factory()->create();
    $oldDonation = Donation::factory()->create([
        'program_id' => $this->program->id,
        'donor_user_id' => $donor->id,
        'donor_email' => $donor->email,
        'status' => 'pending',
    ]);
    Payment::create([
        'donation_id' => $oldDonation->id,
        'payment_method' => 'virtual_account',
        'gateway' => 'midtrans',
        'gateway_status' => 'PENDING',
    ]);

    $response = $this->actingAs($donor)
        ->post(route('donation.store', $this->program->slug), [
            'amount' => 50000,
            'donor_name' => $donor->name,
            'donor_email' => $donor->email,
            'donor_phone' => '081234567890',
            'channel' => 'offline',
            'payment_channel' => 'MANUAL_BSI',
            'replace_donation_code' => $oldDonation->donation_code,
        ]);

    $response->assertRedirect();
    expect($oldDonation->fresh()->status)->toBe('cancelled')
        ->and($oldDonation->payments()->first()->gateway_status)->toBe('CANCELLED');
});
