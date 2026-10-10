<?php

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('contact form submits successfully and returns success flash message', function () {
    Mail::fake();
    Notification::fake();

    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response(['success' => true], 200),
    ]);

    $payload = [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Pesan dari Halaman Kontak Website',
        'message' => 'Halo tim Insani, saya ingin bertanya tentang cara berdonasi.',
        'cf-turnstile-response' => 'test-turnstile-token',
    ];

    $response = $this->post('/kontak', $payload);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('contact_messages', [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'subject' => 'Pesan dari Halaman Kontak Website',
    ]);
});

test('contact form returns error when turnstile verification fails', function () {
    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response(['success' => false], 200),
    ]);

    $payload = [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Pesan dari Halaman Kontak Website',
        'message' => 'Halo tim Insani',
        'cf-turnstile-response' => 'invalid-token',
    ];

    $response = $this->post('/kontak', $payload);

    $response->assertRedirect();
    $response->assertSessionHasErrors('cf-turnstile-response');
    $response->assertSessionHas('error');

    expect(ContactMessage::count())->toBe(0);
});

test('contact form validates required fields', function () {
    $response = $this->post('/kontak', []);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['name', 'email', 'subject', 'message', 'cf-turnstile-response']);
});
