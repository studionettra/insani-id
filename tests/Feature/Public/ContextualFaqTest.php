<?php

use App\Models\Faq;
use Database\Seeders\FaqSeeder;
use Database\Seeders\PageSeeder;

beforeEach(function () {
    $this->seed(PageSeeder::class);
    $this->seed(FaqSeeder::class);
});

it('scopes faqs on /tentang-kami to lembaga category', function () {
    $response = $this->get('/tentang-kami');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/About/Index')
        ->has('faqs')
        ->where('faqs', function ($faqs) {
            expect(count($faqs))->toBeLessThanOrEqual(5);
            foreach ($faqs as $faq) {
                expect($faq['category'])->toBe('lembaga')
                    ->and($faq['question_translations'])->toBeArray()
                    ->and($faq['answer_translations'])->toBeArray();
            }

            return true;
        })
    );
});

it('scopes faqs on /kontak to kontak category', function () {
    $response = $this->get('/kontak');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Contact/Create')
        ->has('faqs')
        ->where('faqs', function ($faqs) {
            expect(count($faqs))->toBeLessThanOrEqual(4);
            foreach ($faqs as $faq) {
                expect($faq['category'])->toBe('kontak');
            }

            return true;
        })
    );
});

it('passes comprehensive categorized faqs on /pusat-bantuan', function () {
    $response = $this->get('/pusat-bantuan');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Page/Show')
        ->has('faqs')
        ->where('faqs', function ($faqs) {
            $categories = collect($faqs)->pluck('category')->unique()->values()->all();
            expect($categories)->toContain('donatur');
            expect($categories)->toContain('campaigner');
            expect($categories)->toContain('fundraiser');
            expect($categories)->toContain('keamanan');
            expect($categories)->toContain('lembaga');
            expect($categories)->toContain('kontak');

            return true;
        })
    );
});

it('provides english and arabic translations for kontak faqs', function () {
    $faq = Faq::where('category', 'kontak')->first();

    expect($faq)->not->toBeNull()
        ->and($faq->question_translations)->toHaveKeys(['id', 'en', 'ar'])
        ->and($faq->answer_translations)->toHaveKeys(['id', 'en', 'ar'])
        ->and($faq->question_translations['en'])->not->toBe($faq->question_translations['id'])
        ->and($faq->question_translations['ar'])->not->toBe($faq->question_translations['id']);
});

it('loads contact page with kontak faqs and localized translations', function () {
    app()->setLocale('en');

    $response = $this->get('/kontak');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Contact/Create')
        ->has('faqs')
        ->where('translations.Kontak', 'Contact')
        ->where('translations.Hubungi Layanan CS', 'Contact Support')
        ->where('translations.Hubungi Kami Sesuai Kebutuhanmu', 'Contact Us According to Your Needs')
    );
});
