<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class CaptureUtmParameters
{
    /**
     * 30 days in minutes
     */
    protected const COOKIE_LIFETIME = 43200;

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if query contains any UTM parameters or referral code
        $hasUtm = $request->has('utm_source')
            || $request->has('ref')
            || $request->has('utm_campaign')
            || $request->has('utm_medium');

        if ($hasUtm) {
            $source = $request->input('utm_source') ?? $request->input('ref');
            $medium = $request->input('utm_medium');
            $campaign = $request->input('utm_campaign');
            $term = $request->input('utm_term');
            $content = $request->input('utm_content');

            if ($source) {
                session(['utm_source' => (string) $source]);
                Cookie::queue('utm_source', (string) $source, self::COOKIE_LIFETIME);
            }

            if ($medium) {
                session(['utm_medium' => (string) $medium]);
                Cookie::queue('utm_medium', (string) $medium, self::COOKIE_LIFETIME);
            }

            if ($campaign) {
                session(['utm_campaign' => (string) $campaign]);
                Cookie::queue('utm_campaign', (string) $campaign, self::COOKIE_LIFETIME);
            }

            if ($term) {
                session(['utm_term' => (string) $term]);
                Cookie::queue('utm_term', (string) $term, self::COOKIE_LIFETIME);
            }

            if ($content) {
                session(['utm_content' => (string) $content]);
                Cookie::queue('utm_content', (string) $content, self::COOKIE_LIFETIME);
            }

            if (! session()->has('landing_page')) {
                session(['landing_page' => $request->fullUrl()]);
            }
        }

        // Capture HTTP Referer if external
        $referer = $request->header('referer');
        if ($referer && ! session()->has('referrer_url')) {
            $currentHost = $request->getHost();
            $refererHost = parse_url($referer, PHP_URL_HOST);

            if ($refererHost && $refererHost !== $currentHost) {
                session(['referrer_url' => $referer]);
                Cookie::queue('referrer_url', $referer, self::COOKIE_LIFETIME);
            }
        }

        return $next($request);
    }
}
