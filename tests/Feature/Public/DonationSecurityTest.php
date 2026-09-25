<?php

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
