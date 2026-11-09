<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Mcamara\LaravelLocalization\LaravelLocalization;
use Mcamara\LaravelLocalization\Middleware\LaravelLocalizationRedirectFilter;
use Mcamara\LaravelLocalization\Middleware\LocaleSessionRedirect;

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
        'Kontak',
        'Hubungi Layanan CS',
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
    expect($shared['translations']['Kontak'])->toBe('Contact');
    expect($shared['translations']['Hubungi Layanan CS'])->toBe('Contact Support');
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
    expect($shared['translations']['Kontak'])->toBe('تواصل معنا');
    expect($shared['translations']['Hubungi Layanan CS'])->toBe('التواصل مع خدمة العملاء');
});

it('resolves localized contact route for english and arabic', function (string $locale) {
    putenv("ROUTING_LOCALE={$locale}");
    $_ENV['ROUTING_LOCALE'] = $locale;
    app()->setLocale($locale);

    app()->forgetInstance(LaravelLocalization::class);

    Route::middleware('web')->group(function () {
        require base_path('routes/web.php');
    });
    app('router')->getRoutes()->refreshNameLookups();
    app('router')->getRoutes()->refreshActionLookups();

    $response = $this->withoutMiddleware([
        LocaleSessionRedirect::class,
        LaravelLocalizationRedirectFilter::class,
    ])->get("/{$locale}/kontak");

    putenv('ROUTING_LOCALE');
    unset($_ENV['ROUTING_LOCALE']);
    app()->forgetInstance(LaravelLocalization::class);
    app()->setLocale('id');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Contact/Create')
        ->where('locale', $locale)
    );
})->with(['en', 'ar']);
