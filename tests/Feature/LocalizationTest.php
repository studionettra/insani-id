<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Request;
use Inertia\Testing\AssertableInertia as Assert;

it('shares default indonesian translations and locale on root visit', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('locale', 'id')
        ->has('translations')
        ->where('translations.Beranda', 'Beranda')
        ->has('supportedLocales.id')
        ->has('supportedLocales.en')
        ->has('supportedLocales.ar')
    );
});

it('loads valid json translation files for all supported locales', function (string $locale) {
    $path = lang_path("{$locale}.json");

    expect(file_exists($path))->toBeTrue();

    $content = file_get_contents($path);
    $translations = json_decode($content, true);

    expect(json_last_error())->toBe(JSON_ERROR_NONE);
    expect($translations)->toBeArray();
    expect($translations)->toHaveKeys([
        'Beranda',
        'Tentang Kami',
        'Donasi',
        'Berita',
        'Masuk',
        'Terkumpul',
    ]);
})->with(['id', 'en', 'ar']);

it('shares correct english translations via HandleInertiaRequests when locale is en', function () {
    app()->setLocale('en');

    $request = Request::create('/', 'GET');
    $request->setLaravelSession(session()->driver());
    $middleware = new HandleInertiaRequests;
    $shared = $middleware->share($request);

    expect($shared['locale'])->toBe('en');
    expect($shared['translations']['Beranda'])->toBe('Home');
    expect($shared['translations']['Donasi'])->toBe('Donate');
    expect($shared['translations']['Tentang Kami'])->toBe('About Us');
});

it('shares correct arabic translations via HandleInertiaRequests when locale is ar', function () {
    app()->setLocale('ar');

    $request = Request::create('/', 'GET');
    $request->setLaravelSession(session()->driver());
    $middleware = new HandleInertiaRequests;
    $shared = $middleware->share($request);

    expect($shared['locale'])->toBe('ar');
    expect($shared['translations']['Beranda'])->toBe('الرئيسية');
    expect($shared['translations']['Donasi'])->toBe('تبرع');
    expect($shared['translations']['Tentang Kami'])->toBe('من نحن');
});
