<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsPageView;
use App\Models\AnalyticsSession;
use App\Models\AppSetting;
use App\Models\Donation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AnalyticsService
{
    /**
     * Record a pageview and ensure the visitor session exists.
     */
    public function recordPageView(Request $request, array $data): ?AnalyticsPageView
    {
        $userAgent = $request->userAgent() ?? '';
        $uaInfo = UserAgentParser::parse($userAgent);

        if ($uaInfo['is_bot']) {
            return null;
        }

        $sessionId = $data['session_id'] ?? null;
        if (empty($sessionId)) {
            $sessionId = (string) Str::uuid();
        }

        $ip = $request->ip();
        $country = $request->header('CF-IPCountry', 'Indonesia');
        $city = $request->header('CF-IPCity', $data['city'] ?? null);
        $region = $request->header('CF-Region', null);

        $referrerUrl = $data['referrer'] ?? $request->header('referer');
        $referrerDomain = null;
        if (! empty($referrerUrl)) {
            $parsedHost = parse_url($referrerUrl, PHP_URL_HOST);
            if ($parsedHost && ! str_contains($parsedHost, $request->getHost())) {
                $referrerDomain = str_replace('www.', '', strtolower($parsedHost));
            }
        }

        $session = AnalyticsSession::find($sessionId);

        if (! $session) {
            $session = AnalyticsSession::create([
                'id' => $sessionId,
                'ip_address' => $ip,
                'country' => $country ?: 'Indonesia',
                'region' => $region,
                'city' => $city,
                'device_type' => $uaInfo['device_type'],
                'browser' => $uaInfo['browser'],
                'os' => $uaInfo['os'],
                'referrer_domain' => $referrerDomain,
                'referrer_url' => $referrerUrl,
                'utm_source' => $data['utm_source'] ?? $request->cookie('utm_source'),
                'utm_medium' => $data['utm_medium'] ?? $request->cookie('utm_medium'),
                'utm_campaign' => $data['utm_campaign'] ?? $request->cookie('utm_campaign'),
                'utm_term' => $data['utm_term'] ?? $request->cookie('utm_term'),
                'utm_content' => $data['utm_content'] ?? $request->cookie('utm_content'),
                'landing_page' => $data['url'] ?? $request->fullUrl(),
                'last_activity_at' => now(),
            ]);
        } else {
            $session->update([
                'last_activity_at' => now(),
            ]);
        }

        $rawUrl = $data['url'] ?? $request->fullUrl();
        $path = parse_url($rawUrl, PHP_URL_PATH) ?: '/';

        return AnalyticsPageView::create([
            'session_id' => $session->id,
            'url' => Str::limit($rawUrl, 255, ''),
            'path' => Str::limit($path, 255, ''),
            'title' => Str::limit($data['title'] ?? 'Insani', 255, ''),
            'duration_seconds' => 0,
            'created_at' => now(),
        ]);
    }

    /**
     * Record a heartbeat from an active client to accumulate time-on-page.
     */
    public function recordHeartbeat(string $sessionId, string $url, int $durationIncrement = 15): void
    {
        $session = AnalyticsSession::find($sessionId);
        if (! $session) {
            return;
        }

        $session->update(['last_activity_at' => now()]);

        $latestPageView = AnalyticsPageView::where('session_id', $sessionId)
            ->where('url', Str::limit($url, 255, ''))
            ->orderByDesc('created_at')
            ->first();

        if ($latestPageView) {
            $latestPageView->increment('duration_seconds', min($durationIncrement, 60));
        }
    }

    /**
     * Record an analytics / Meta Pixel / GA4 event.
     */
    public function recordEvent(Request $request, array $data): ?AnalyticsEvent
    {
        $sessionId = $data['session_id'] ?? null;
        if (empty($sessionId)) {
            $sessionId = (string) Str::uuid();
        }

        $session = AnalyticsSession::find($sessionId);
        if (! $session) {
            $userAgent = $request->userAgent() ?? '';
            $uaInfo = UserAgentParser::parse($userAgent);

            $session = AnalyticsSession::create([
                'id' => $sessionId,
                'ip_address' => $request->ip(),
                'device_type' => $uaInfo['device_type'],
                'browser' => $uaInfo['browser'],
                'os' => $uaInfo['os'],
                'last_activity_at' => now(),
            ]);
        } else {
            $session->update(['last_activity_at' => now()]);
        }

        return AnalyticsEvent::create([
            'session_id' => $session->id,
            'event_name' => $data['event_name'] ?? 'Custom',
            'url' => Str::limit($data['url'] ?? $request->fullUrl(), 255, ''),
            'meta_status' => $data['meta_status'] ?? 'dispatched',
            'ga4_status' => $data['ga4_status'] ?? 'dispatched',
            'payload' => $data['payload'] ?? null,
            'created_at' => now(),
        ]);
    }

    /**
     * Get Realtime Analytics Data (Last 5 to 30 minutes).
     */
    public function getRealtimeData(): array
    {
        $fiveMinutesAgo = Carbon::now()->subMinutes(5);
        $thirtyMinutesAgo = Carbon::now()->subMinutes(30);

        $activeVisitorsCount = AnalyticsSession::where('last_activity_at', '>=', $fiveMinutesAgo)->count();

        $activePages = AnalyticsPageView::select('url', 'path', 'title', DB::raw('count(distinct session_id) as active_readers'))
            ->where('created_at', '>=', $thirtyMinutesAgo)
            ->groupBy('url', 'path', 'title')
            ->orderByDesc('active_readers')
            ->limit(8)
            ->get();

        $recentMinutes = collect(range(0, 29))->reverse()->map(function ($minuteAgo) {
            $time = Carbon::now()->subMinutes($minuteAgo);

            return [
                'time' => $time->format('H:i'),
                'timestamp' => $time->timestamp,
                'views' => 0,
            ];
        })->keyBy('time');

        $driver = DB::connection()->getDriverName();
        $timeExpression = match ($driver) {
            'mysql', 'mariadb' => "DATE_FORMAT(created_at, '%H:%i')",
            'pgsql' => "to_char(created_at, 'HH24:MI')",
            default => "strftime('%H:%M', created_at)",
        };

        $viewsByMinute = AnalyticsPageView::select(DB::raw("{$timeExpression} as time_label, count(*) as count"))
            ->where('created_at', '>=', $thirtyMinutesAgo)
            ->groupBy('time_label')
            ->get();

        foreach ($viewsByMinute as $record) {
            if ($recentMinutes->has($record->time_label)) {
                $item = $recentMinutes->get($record->time_label);
                $item['views'] = (int) $record->count;
                $recentMinutes->put($record->time_label, $item);
            }
        }

        $recentEvents = AnalyticsEvent::with('session:id,city,device_type')
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'event_name' => $event->event_name,
                'url' => $event->url,
                'meta_status' => $event->meta_status,
                'payload' => $event->payload,
                'time_ago' => $event->created_at ? $event->created_at->diffForHumans() : '-',
                'device' => $event->session?->device_type ?? 'desktop',
                'created_at' => $event->created_at ? $event->created_at->toIso8601String() : '',
            ]);

        return [
            'active_visitors_count' => $activeVisitorsCount,
            'active_pages' => $activePages,
            'views_per_minute' => $recentMinutes->values()->all(),
            'recent_events' => $recentEvents,
            'last_updated' => now()->toIso8601String(),
        ];
    }

    /**
     * Get Traffic Acquisition Data.
     */
    public function getAcquisitionData(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);

        $sessions = AnalyticsSession::where('created_at', '>=', $startDate)->get();

        $channels = [
            'Organic Search' => 0,
            'Social Media' => 0,
            'Direct' => 0,
            'Referral' => 0,
        ];

        foreach ($sessions as $s) {
            $ref = strtolower($s->referrer_domain ?? '');
            $utmSource = strtolower($s->utm_source ?? '');

            if (
                str_contains($ref, 'google') || str_contains($ref, 'bing') ||
                str_contains($ref, 'yahoo') || str_contains($ref, 'duckduckgo') ||
                str_contains($utmSource, 'google') || str_contains($utmSource, 'search')
            ) {
                $channels['Organic Search']++;
            } elseif (
                str_contains($ref, 'facebook') || str_contains($ref, 'instagram') ||
                str_contains($ref, 'whatsapp') || str_contains($ref, 'tiktok') ||
                str_contains($ref, 'twitter') || str_contains($ref, 't.co') ||
                str_contains($ref, 'telegram') || str_contains($utmSource, 'whatsapp') ||
                str_contains($utmSource, 'facebook') || str_contains($utmSource, 'instagram') ||
                str_contains($utmSource, 'tiktok') || str_contains($utmSource, 'fb') ||
                str_contains($utmSource, 'ig')
            ) {
                $channels['Social Media']++;
            } elseif (empty($ref) && empty($utmSource)) {
                $channels['Direct']++;
            } else {
                $channels['Referral']++;
            }
        }

        $utmCampaigns = AnalyticsSession::select(
            'utm_source',
            'utm_medium',
            'utm_campaign',
            DB::raw('count(*) as visitors_count')
        )
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('utm_source')
            ->where('utm_source', '!=', '')
            ->groupBy('utm_source', 'utm_medium', 'utm_campaign')
            ->orderByDesc('visitors_count')
            ->limit(10)
            ->get()
            ->map(function ($campaign) use ($startDate) {
                $donations = Donation::where('utm_source', $campaign->utm_source)
                    ->when($campaign->utm_medium, fn ($q) => $q->where('utm_medium', $campaign->utm_medium))
                    ->when($campaign->utm_campaign, fn ($q) => $q->where('utm_campaign', $campaign->utm_campaign))
                    ->where('status', 'paid')
                    ->where('created_at', '>=', $startDate)
                    ->selectRaw('count(*) as count, sum(amount) as total_amount')
                    ->first();

                $paidCount = $donations->count ?? 0;
                $convRate = $campaign->visitors_count > 0 ? round(($paidCount / $campaign->visitors_count) * 100, 1) : 0;

                return [
                    'source' => $campaign->utm_source,
                    'medium' => $campaign->utm_medium ?: '-',
                    'campaign' => $campaign->utm_campaign ?: '-',
                    'visitors' => (int) $campaign->visitors_count,
                    'donations_count' => (int) $paidCount,
                    'total_amount' => (float) ($donations->total_amount ?? 0),
                    'conversion_rate' => $convRate,
                ];
            });

        $topReferrers = AnalyticsSession::select('referrer_domain', DB::raw('count(*) as visits'))
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('referrer_domain')
            ->where('referrer_domain', '!=', '')
            ->groupBy('referrer_domain')
            ->orderByDesc('visits')
            ->limit(8)
            ->get();

        return [
            'channels' => $channels,
            'campaigns' => $utmCampaigns,
            'referrers' => $topReferrers,
        ];
    }

    /**
     * Get Engagement & Behavior Data.
     */
    public function getEngagementData(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);

        $totalPageViews = AnalyticsPageView::where('created_at', '>=', $startDate)->count();
        $uniqueVisitors = AnalyticsSession::where('created_at', '>=', $startDate)->count();
        $avgDuration = AnalyticsPageView::where('created_at', '>=', $startDate)->avg('duration_seconds') ?: 0;

        $topPages = AnalyticsPageView::select('url', 'path', 'title', DB::raw('count(*) as views, avg(duration_seconds) as avg_duration'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('url', 'path', 'title')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'title' => $p->title ?: $p->path,
                'path' => $p->path,
                'url' => $p->url,
                'views' => (int) $p->views,
                'avg_duration_seconds' => round($p->avg_duration),
            ]);

        // Conversion Funnel
        $programViews = AnalyticsPageView::where('created_at', '>=', $startDate)
            ->where(function ($q) {
                $q->where('path', 'like', '%/program/%')
                    ->orWhere('path', 'like', '%/berita/%');
            })
            ->count();

        $initiatedCheckouts = AnalyticsEvent::where('event_name', 'InitiateCheckout')
            ->where('created_at', '>=', $startDate)
            ->count();

        $completedDonations = Donation::where('status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->count();

        return [
            'total_page_views' => $totalPageViews,
            'unique_visitors' => $uniqueVisitors,
            'avg_duration_seconds' => round($avgDuration),
            'top_pages' => $topPages,
            'funnel' => [
                ['stage' => 'Kunjungan Konten / Program', 'count' => max($programViews, $totalPageViews)],
                ['stage' => 'Formulir Donasi Dimulai', 'count' => $initiatedCheckouts],
                ['stage' => 'Donasi Berhasil (Lunas)', 'count' => $completedDonations],
            ],
        ];
    }

    /**
     * Get Technology and Demographics Data.
     */
    public function getTechnologyAndDemographicsData(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);

        $devices = AnalyticsSession::select('device_type', DB::raw('count(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('device_type')
            ->pluck('count', 'device_type')
            ->toArray();

        $browsers = AnalyticsSession::select('browser', DB::raw('count(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('browser')
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn ($b) => ['name' => $b->browser, 'count' => (int) $b->count]);

        $os = AnalyticsSession::select('os', DB::raw('count(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('os')
            ->groupBy('os')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn ($o) => ['name' => $o->os, 'count' => (int) $o->count]);

        $locations = AnalyticsSession::select('city', 'country', DB::raw('count(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->groupBy('city', 'country')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($l) => ['city' => $l->city, 'country' => $l->country, 'count' => (int) $l->count]);

        return [
            'devices' => [
                'mobile' => $devices['mobile'] ?? 0,
                'desktop' => $devices['desktop'] ?? 0,
                'tablet' => $devices['tablet'] ?? 0,
            ],
            'browsers' => $browsers,
            'operating_systems' => $os,
            'locations' => $locations,
        ];
    }

    /**
     * Get Meta Pixel & GA4 Events Diagnostics Data.
     */
    public function getMetaEventsData(int $days = 7): array
    {
        $startDate = Carbon::now()->subDays($days);

        $eventCounts = AnalyticsEvent::select('event_name', DB::raw('count(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('event_name')
            ->pluck('count', 'event_name')
            ->toArray();

        $recentEvents = AnalyticsEvent::where('created_at', '>=', $startDate)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'session_id' => $e->session_id,
                'event_name' => $e->event_name,
                'url' => $e->url,
                'meta_status' => $e->meta_status,
                'ga4_status' => $e->ga4_status,
                'payload' => $e->payload,
                'created_at' => $e->created_at ? $e->created_at->toIso8601String() : '',
                'time_ago' => $e->created_at ? $e->created_at->diffForHumans() : '-',
            ]);

        $metaPixelId = AppSetting::get('meta_pixel_id');
        $ga4Id = AppSetting::get('google_analytics_id');
        $gtmId = AppSetting::get('google_tag_manager_id');
        $tiktokId = AppSetting::get('tiktok_pixel_id');

        return [
            'config' => [
                'meta_pixel_id' => $metaPixelId,
                'google_analytics_id' => $ga4Id,
                'google_tag_manager_id' => $gtmId,
                'tiktok_pixel_id' => $tiktokId,
                'has_pixel_configured' => ! empty($metaPixelId) || ! empty($ga4Id),
            ],
            'summary_counts' => [
                'PageView' => $eventCounts['PageView'] ?? 0,
                'ViewContent' => $eventCounts['ViewContent'] ?? 0,
                'InitiateCheckout' => $eventCounts['InitiateCheckout'] ?? 0,
                'Purchase' => $eventCounts['Purchase'] ?? 0,
                'Share' => $eventCounts['Share'] ?? 0,
                'total' => array_sum($eventCounts),
            ],
            'recent_events' => $recentEvents,
        ];
    }
}
