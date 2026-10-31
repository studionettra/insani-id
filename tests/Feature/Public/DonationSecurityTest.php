<?php

use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->program = Program::factory()->create(['status' => 'published']);
});

test('it rejects donation message containing url or link', function () {
    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'message' => 'Kunjungi web kami di https://spam-link.xyz untuk bonus',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
    ]);

    $response->assertSessionHasErrors(['message']);
});

test('it rejects donor name containing url or link', function () {
    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'judi-online.com',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'message' => 'Semoga berkah',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
    ]);

    $response->assertSessionHasErrors(['donor_name']);
});

test('it rejects donation message containing profanity or gambling words', function () {
    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Donatur Baik',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'message' => 'Main slot gacor hari ini pasti maxwin',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
    ]);

    $response->assertSessionHasErrors(['message']);
});

test('it rejects donor name containing profanity or offensive words', function () {
    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Si Bangsat',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'message' => 'Semoga berkah',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
    ]);

    $response->assertSessionHasErrors(['donor_name']);
});

test('it rejects donation when honeypot field is filled by bot', function () {
    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Bot Spammer',
        'donor_email' => 'bot@example.com',
        'donor_phone' => '08123456789',
        'message' => 'Semoga bermanfaat',
        'website_url' => 'https://automated-bot.com',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
    ]);

    $response->assertSessionHasErrors(['website_url']);
});

test('it sanitizes html tags from donor name and message', function () {
    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => '<b>Donatur Beriman</b><script>alert(1)</script>',
        'donor_email' => 'donatur@example.com',
        'donor_phone' => '08123456789',
        'message' => 'Semoga berkah <script>alert("xss")</script> dan sehat selalu',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('donations', [
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Beriman',
        'message' => 'Semoga berkah  dan sehat selalu',
    ]);
});

test('it accepts clean valid donation with prayer message', function () {
    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Ahmad Fauzi',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '08123456789',
        'message' => 'Semoga program ini lancar dan membawa kebaikan bagi semua yang membutuhkan',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('donations', [
        'program_id' => $this->program->id,
        'donor_name' => 'Ahmad Fauzi',
        'message' => 'Semoga program ini lancar dan membawa kebaikan bagi semua yang membutuhkan',
        'status' => 'pending',
    ]);
});

test('it validates turnstile captcha when secret key is configured', function () {
    config(['services.turnstile.secret_key' => 'test-secret-key']);
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => false]),
    ]);

    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Ahmad Fauzi',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'cf-turnstile-response' => 'invalid-token',
    ]);

    $response->assertSessionHasErrors(['cf-turnstile-response']);
});

test('it passes turnstile captcha when token is verified successfully', function () {
    config(['services.turnstile.secret_key' => 'test-secret-key']);
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response(['success' => true]),
    ]);

    $response = $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Ahmad Fauzi',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '08123456789',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'cf-turnstile-response' => 'valid-token',
    ]);

    $response->assertSessionHasNoErrors();
});

test('it prevents unauthorized users from cancelling other donors pending transactions via replace_donation_code', function () {
    $victimDonation = Donation::create([
        'donation_code' => 'DON-VICTIM-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Korban Donasi',
        'donor_email' => 'korban@example.com',
        'donor_phone' => '081234567888',
        'amount' => 100000,
        'channel' => 'offline',
        'status' => 'pending',
    ]);

    Payment::create([
        'donation_id' => $victimDonation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PENDING',
    ]);

    // Attacker submits a new donation with victim's donation code as replace_donation_code but attacker's email and no session
    $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 50000,
        'donor_name' => 'Penyerang',
        'donor_email' => 'attacker@example.com',
        'donor_phone' => '081299998888',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'replace_donation_code' => $victimDonation->donation_code,
    ]);

    // Victim donation MUST remain pending and NOT cancelled
    $victimDonation->refresh();
    expect($victimDonation->status)->toBe('pending');
});

test('it allows legitimate donor with session ownership to replace their own pending donation', function () {
    $legitDonation = Donation::create([
        'donation_code' => 'DON-LEGIT-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Donatur Sah',
        'donor_email' => 'sah@example.com',
        'donor_phone' => '081234567777',
        'amount' => 100000,
        'channel' => 'offline',
        'status' => 'pending',
    ]);

    Payment::create([
        'donation_id' => $legitDonation->id,
        'payment_method' => 'bank_transfer_manual',
        'payment_channel' => 'MANUAL_BSI',
        'gateway' => 'manual',
        'gateway_status' => 'PENDING',
    ]);

    // Session owner replaces their own pending donation
    session(["donation_owner_{$legitDonation->donation_code}" => true]);

    $this->post(route('donation.store', ['program' => $this->program->slug]), [
        'amount' => 200000,
        'donor_name' => 'Donatur Sah',
        'donor_email' => 'sah@example.com',
        'donor_phone' => '081234567777',
        'channel' => 'offline',
        'payment_method' => 'bank_transfer_manual',
        'replace_donation_code' => $legitDonation->donation_code,
    ]);

    $legitDonation->refresh();
    expect($legitDonation->status)->toBe('cancelled');
});
