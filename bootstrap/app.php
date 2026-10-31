<?php

use App\Http\Middleware\CaptureUtmParameters;
use App\Http\Middleware\EnsureCampaignerVerified;
use App\Http\Middleware\EnsurePasswordIsChanged;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\NoCache;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Mcamara\LaravelLocalization\Middleware\LaravelLocalizationRedirectFilter;
use Mcamara\LaravelLocalization\Middleware\LaravelLocalizationRoutes;
use Mcamara\LaravelLocalization\Middleware\LaravelLocalizationViewPath;
use Mcamara\LaravelLocalization\Middleware\LocaleCookieRedirect;
use Mcamara\LaravelLocalization\Middleware\LocaleSessionRedirect;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $appEnv = env('APP_ENV', 'production');
        $trustedProxies = env('TRUSTED_PROXIES');
        if ($trustedProxies !== null && $trustedProxies !== '') {
            $proxies = str_contains($trustedProxies, ',')
                ? array_map('trim', explode(',', $trustedProxies))
                : trim($trustedProxies);
            $middleware->trustProxies(at: $proxies);
        } elseif (in_array($appEnv, ['local', 'testing'], true)) {
            $middleware->trustProxies(at: '*');
        } else {
            // Official Cloudflare IPv4 and IPv6 CIDR ranges
            $middleware->trustProxies(at: [
                '173.245.48.0/20',
                '103.21.244.0/22',
                '103.22.200.0/22',
                '103.31.4.0/22',
                '141.101.64.0/18',
                '108.162.192.0/18',
                '190.93.240.0/20',
                '188.114.96.0/20',
                '197.234.240.0/22',
                '198.41.128.0/17',
                '162.158.0.0/15',
                '104.16.0.0/13',
                '104.24.0.0/14',
                '172.64.0.0/13',
                '131.0.72.0/22',
                '2400:cb00::/32',
                '2606:4700::/32',
                '2803:f800::/32',
                '2405:b500::/32',
                '2405:8100::/32',
                '2a06:98c0::/29',
                '2c0f:f248::/32',
            ]);
        }

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']);

        $middleware->authenticateSessions();

        $middleware->web(append: [
            SecurityHeaders::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            CaptureUtmParameters::class,
        ]);

        $middleware->alias([
            'localize' => LaravelLocalizationRoutes::class,
            'localizationRedirect' => LaravelLocalizationRedirectFilter::class,
            'localeSessionRedirect' => LocaleSessionRedirect::class,
            'localeCookieRedirect' => LocaleCookieRedirect::class,
            'localeViewPath' => LaravelLocalizationViewPath::class,
            'campaigner.verified' => EnsureCampaignerVerified::class,
            'force.password.change' => EnsurePasswordIsChanged::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'no-cache' => NoCache::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'webhooks/midtrans',
            'analytics/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (HttpException $exception, Request $request) {
            $status = $exception->getStatusCode();

            if ($status === 419) {
                if ($request->is('api/*') || $request->expectsJson()) {
                    return response()->json([
                        'message' => 'Sesi Anda telah berakhir. Silakan masuk kembali.',
                    ], 419);
                }

                return redirect()->route('login')->with('status', 'Sesi Anda telah berakhir. Silakan masuk kembali.');
            }

            if (! app()->hasDebugModeEnabled() || $request->header('X-Inertia')) {
                if (in_array($status, [403, 404, 500, 503])) {
                    return inertia('Error', [
                        'status' => $status,
                    ])->toResponse($request)->setStatusCode($status);
                }
            }
        });
    })->create();
