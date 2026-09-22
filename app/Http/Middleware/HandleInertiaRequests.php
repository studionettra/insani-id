<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                    'roles' => $request->user()->getRoleNames(),
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'locale' => app()->getLocale(),
            'supportedLocales' => (function () {
                if (class_exists(LaravelLocalization::class)) {
                    $locales = LaravelLocalization::getSupportedLocales();
                    $urls = [];
                    foreach ($locales as $code => $properties) {
                        $urls[$code] = [
                            'name' => $properties['native'],
                            'url' => LaravelLocalization::getLocalizedURL($code, null, [], true),
                        ];
                    }

                    return $urls;
                }

                return [];
            })(),
            'translations' => (function () {
                $locale = app()->getLocale();
                $path = lang_path("{$locale}.json");
                if (file_exists($path)) {
                    $content = file_get_contents($path);

                    return json_decode($content, true) ?: [];
                }

                return [];
            })(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'siteSettings' => Cache::remember('site_settings_public', 3600, function () {
                return AppSetting::pluck('value', 'key')->toArray();
            }),
            'bankAccounts' => Cache::remember('bank_accounts_public', 3600, function () {
                return BankAccount::where('is_active', true)->orderBy('sort_order')->get();
            }),
        ];
    }
}
