<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SecurityHeaders
{
    /**
     * Handle an incoming request and apply essential HTTP security headers.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof BinaryFileResponse || $response instanceof StreamedResponse) {
            return $response;
        }

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '0');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if ($request->isSecure() || app()->isProduction()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Build Content-Security-Policy compatible with Cloudflare Turnstile, Midtrans, and local Vite dev
        $isLocal = app()->environment('local');
        $localConnect = $isLocal ? ' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*' : '';
        $localScript = $isLocal ? ' http://localhost:* http://127.0.0.1:*' : '';

        $csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://app.midtrans.com https://api.midtrans.com https://www.googletagmanager.com https://connect.facebook.net{$localScript}",
            "frame-src 'self' https://challenges.cloudflare.com https://app.midtrans.com https://api.midtrans.com https://www.youtube.com https://www.youtube-nocookie.com",
            "connect-src 'self' https://challenges.cloudflare.com https://api.midtrans.com https://app.midtrans.com https://translate.googleapis.com https://api.fonnte.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net{$localConnect}",
            "img-src 'self' data: https: blob:",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "object-src 'none'",
            "base-uri 'self'",
        ];

        $response->headers->set('Content-Security-Policy', implode('; ', $csp));

        return $response;
    }
}
