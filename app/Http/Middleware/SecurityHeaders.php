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

        // Enforce Content-Security-Policy in production, staging, and testing environments.
        // In local development, strict CSP is disabled by default to avoid blocking Vite dev server,
        // HMR WebSockets, and dynamic fonts (Chromium CSP specification does not support IPv6 [::1] loopbacks).
        if (! app()->environment('local') || config('app.force_csp_in_local', false)) {
            $csp = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://app.midtrans.com https://api.midtrans.com https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com https://*.doubleclick.net https://*.googleadservices.com https://googleads.g.doubleclick.net https://www.googleadservices.com",
                "frame-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://app.midtrans.com https://api.midtrans.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",
                "connect-src 'self' data: https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://*.cloudflarecaptcha.com https://api.midtrans.com https://app.midtrans.com https://translate.googleapis.com https://api.fonnte.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.doubleclick.net https://ad.doubleclick.net https://stats.g.doubleclick.net https://connect.facebook.net https://analytics.tiktok.com https://www.google.com https://*.google.com https://*.googleadservices.com https://googleads.g.doubleclick.net",
                "img-src 'self' data: https: blob:",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
                "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net",
                "object-src 'none'",
                "base-uri 'self'",
            ];

            $response->headers->set('Content-Security-Policy', implode('; ', $csp));
        }

        return $response;
    }
}
