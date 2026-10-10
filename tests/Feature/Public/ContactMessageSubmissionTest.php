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

test('contact form rejects message containing emojis', function () {
    $payload = [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Pertanyaan Program',
        'message' => 'Halo tim Insani, semoga berkah selalu 🙏❤️',
        'cf-turnstile-response' => 'test-turnstile-token',
    ];

    $response = $this->post('/kontak', $payload);

    $response->assertRedirect();
    $response->assertSessionHasErrors('message');
    expect(ContactMessage::count())->toBe(0);
});

test('contact form rejects message containing html or script tags', function () {
    $payload = [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Pertanyaan Program',
        'message' => 'Halo tim Insani <script>alert("xss")</script> selamat pagi',
        'cf-turnstile-response' => 'test-turnstile-token',
    ];

    $response = $this->post('/kontak', $payload);

    $response->assertRedirect();
    $response->assertSessionHasErrors('message');
    expect(ContactMessage::count())->toBe(0);
});

test('contact form rejects message that is too short or too long', function () {
    // Too short (< 10 chars)
    $payloadShort = [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Pertanyaan Program',
        'message' => 'Halo!',
        'cf-turnstile-response' => 'test-turnstile-token',
    ];

    $responseShort = $this->post('/kontak', $payloadShort);
    $responseShort->assertSessionHasErrors('message');

    // Too long (> 2000 chars)
    $payloadLong = [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Pertanyaan Program',
        'message' => str_repeat('A', 2001),
        'cf-turnstile-response' => 'test-turnstile-token',
    ];

    $responseLong = $this->post('/kontak', $payloadLong);
    $responseLong->assertSessionHasErrors('message');

    expect(ContactMessage::count())->toBe(0);
});

test('contact form rejects name or subject containing emojis or html tags', function () {
    $payloadBadName = [
        'name' => 'Hacker <script> 😎',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Pertanyaan Program',
        'message' => 'Halo tim Insani, mohon informasi lebih lanjut.',
        'cf-turnstile-response' => 'test-turnstile-token',
    ];

    $response = $this->post('/kontak', $payloadBadName);
    $response->assertSessionHasErrors('name');

    $payloadBadSubject = [
        'name' => 'Fulan Pengguna',
        'email' => 'fulan@example.com',
        'phone' => '081234567890',
        'subject' => 'Halo <b>Admin</b> 🎉',
        'message' => 'Halo tim Insani, mohon informasi lebih lanjut.',
        'cf-turnstile-response' => 'test-turnstile-token',
    ];

    $responseSub = $this->post('/kontak', $payloadBadSubject);
    $responseSub->assertSessionHasErrors('subject');

    expect(ContactMessage::count())->toBe(0);
});
