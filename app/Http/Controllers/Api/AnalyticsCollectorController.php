<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AnalyticsCollectorController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    /**
     * Collect pageview or custom event from client-side beacon/fetch.
     */
    public function collect(Request $request): JsonResponse|Response
    {
        $rawUrl = (string) $request->input('url', '');
        $path = parse_url($rawUrl, PHP_URL_PATH) ?: '';

        // Discard internal admin and dashboard navigation from visitor analytics
        if (
            str_starts_with($path, '/admin') ||
            str_starts_with($path, '/dashboard') ||
            str_starts_with($path, '/settings')
        ) {
            return response()->noContent();
        }

        // If authenticated user is an admin or staff, do not pollute public donor tracking
        if ($request->user() && $request->user()->hasAnyRole(['Administrator', 'Program Officer', 'Verifikator', 'Keuangan'])) {
            return response()->noContent();
        }

        $type = (string) $request->input('type', 'page_view');
        $sessionId = (string) $request->input('session_id', '');

        if ($type === 'event') {
            $this->analyticsService->recordEvent($request, [
                'session_id' => $sessionId,
                'event_name' => (string) $request->input('event_name', 'Custom'),
                'url' => $rawUrl,
                'meta_status' => (string) $request->input('meta_status', 'dispatched'),
                'ga4_status' => (string) $request->input('ga4_status', 'dispatched'),
                'payload' => $request->input('payload'),
            ]);
        } else {
            $this->analyticsService->recordPageView($request, [
                'session_id' => $sessionId,
                'url' => $rawUrl,
                'title' => (string) $request->input('title', ''),
                'referrer' => (string) $request->input('referrer', ''),
                'utm_source' => (string) $request->input('utm_source', ''),
                'utm_medium' => (string) $request->input('utm_medium', ''),
                'utm_campaign' => (string) $request->input('utm_campaign', ''),
                'utm_term' => (string) $request->input('utm_term', ''),
                'utm_content' => (string) $request->input('utm_content', ''),
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Update active session heartbeat and time-on-page.
     */
    public function heartbeat(Request $request): Response
    {
        $sessionId = (string) $request->input('session_id', '');
        $url = (string) $request->input('url', '');
        $increment = (int) $request->input('increment', 15);

        if (! empty($sessionId) && ! empty($url)) {
            $this->analyticsService->recordHeartbeat($sessionId, $url, $increment);
        }

        return response()->noContent();
    }
}
