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
        $middleware->trustProxies(at: '*');

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
