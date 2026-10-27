<?php

use App\Models\Faq;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

test('storing faq purifies script tags and inline malicious payloads', function () {
    $response = $this->actingAs($this->admin)
        ->from('/admin/faqs')
        ->post('/admin/faqs', [
            'question' => [
                'id' => 'Bagaimana cara berdonasi?',
                'en' => 'How to donate?',
            ],
            'answer_html' => [
                'id' => '<p>Silakan pilih program.</p><script>alert("xss-payload")</script>',
                'en' => '<p>Please choose a program.</p><script>alert("xss-payload")</script>',
            ],
            'category' => 'umum',
            'is_active' => true,
            'sort_order' => 1,
        ]);

    $response->assertRedirect('/admin/faqs');
    $response->assertSessionHas('success');

    $faq = Faq::where('category', 'umum')->first();
    expect($faq)->not->toBeNull();

    $answers = $faq->getTranslations('answer_html');
    expect($answers['id'])->not->toContain('<script>');
    expect($answers['id'])->not->toContain('alert(');
    expect($answers['id'])->toContain('<p>Silakan pilih program.</p>');

    expect($answers['en'])->not->toContain('<script>');
    expect($answers['en'])->not->toContain('alert(');
    expect($answers['en'])->toContain('<p>Please choose a program.</p>');
});

test('storing faq strips onerror and event handlers from html elements', function () {
    $response = $this->actingAs($this->admin)
        ->from('/admin/faqs')
        ->post('/admin/faqs', [
            'question' => [
                'id' => 'Apakah aman?',
            ],
            'answer_html' => [
                'id' => '<p>Sangat aman.</p><img src=x onerror=alert(document.cookie)>',
            ],
            'category' => 'umum',
            'is_active' => true,
        ]);

    $response->assertRedirect('/admin/faqs');

    $faq = Faq::latest('id')->first();
    $answers = $faq->getTranslations('answer_html');

    expect($answers['id'])->not->toContain('onerror');
    expect($answers['id'])->not->toContain('alert(document.cookie)');
    expect($answers['id'])->toContain('Sangat aman.');
});

test('updating faq purifies multilingual html answers across all locales', function () {
    $faq = Faq::create([
        'question' => ['id' => 'Awal'],
        'answer_html' => ['id' => '<p>Awal</p>'],
        'category' => 'umum',
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $response = $this->actingAs($this->admin)
        ->from('/admin/faqs')
        ->put("/admin/faqs/{$faq->id}", [
            'question' => [
                'id' => 'Pertanyaan Baru',
                'en' => 'New Question',
                'ar' => 'سؤال جديد',
            ],
            'answer_html' => [
                'id' => '<p>Konten ID</p><svg onload=alert("svg-xss")>',
                'en' => '<p>Content EN</p><iframe src="javascript:alert(1)"></iframe>',
                'ar' => '<p>محتوى</p><a href="javascript:alert(2)">Tautan</a>',
            ],
            'category' => 'umum',
            'is_active' => true,
            'sort_order' => 2,
        ]);

    $response->assertRedirect('/admin/faqs');

    $faq->refresh();
    $answers = $faq->getTranslations('answer_html');

    // ID assertion: onload SVG stripped
    expect($answers['id'])->not->toContain('onload');
    expect($answers['id'])->not->toContain('alert("svg-xss")');
    expect($answers['id'])->toContain('<p>Konten ID</p>');

    // EN assertion: iframe stripped
    expect($answers['en'])->not->toContain('<iframe');
    expect($answers['en'])->toContain('<p>Content EN</p>');

    // AR assertion: javascript: pseudo-protocol stripped
    expect($answers['ar'])->not->toContain('javascript:');
    expect($answers['ar'])->toContain('<p>محتوى</p>');
});

test('faq sanitization preserves legitimate formatting and semantic html tags', function () {
    $legitimateHtml = '<p>Berikut langkah <strong>resmi</strong> dan <em>terpercaya</em>:</p>'.
        '<ul><li>Donasi via transfer</li><li>Konfirmasi otomatis</li></ul>'.
        '<p><a href="https://insani.id/tentang-kami">Pelajari selengkapnya</a>.</p>';

    $response = $this->actingAs($this->admin)
        ->from('/admin/faqs')
        ->post('/admin/faqs', [
            'question' => [
                'id' => 'Bagaimana alur donasi?',
            ],
            'answer_html' => [
                'id' => $legitimateHtml,
            ],
            'category' => 'umum',
            'is_active' => true,
        ]);

    $response->assertRedirect('/admin/faqs');

    $faq = Faq::latest('id')->first();
    $answers = $faq->getTranslations('answer_html');

    expect($answers['id'])->toContain('<strong>resmi</strong>');
    expect($answers['id'])->toContain('<em>terpercaya</em>');
    expect($answers['id'])->toContain('<ul><li>Donasi via transfer</li><li>Konfirmasi otomatis</li></ul>');
    expect($answers['id'])->toContain('href="https://insani.id/tentang-kami"');
});
