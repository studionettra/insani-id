<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    /**
     * Display the Analytics Hub.
     */
    public function index(Request $request): Response
    {
        $days = (int) $request->input('days', 30);
        if (! in_array($days, [1, 7, 30, 90], true)) {
            $days = 30;
        }

        $realtime = $this->analyticsService->getRealtimeData();
        $acquisition = $this->analyticsService->getAcquisitionData($days);
        $engagement = $this->analyticsService->getEngagementData($days);
        $technology = $this->analyticsService->getTechnologyAndDemographicsData($days);
        $metaEvents = $this->analyticsService->getMetaEventsData(min($days, 7));

        return Inertia::render('Admin/Analytics/Index', [
            'periodDays' => $days,
            'realtime' => $realtime,
            'acquisition' => $acquisition,
            'engagement' => $engagement,
            'technology' => $technology,
            'metaEvents' => $metaEvents,
        ]);
    }

    /**
     * Return live realtime data as JSON for auto-refresh / polling.
     */
    public function realtime(): JsonResponse
    {
        return response()->json($this->analyticsService->getRealtimeData());
    }

    /**
     * Return paginated Meta / GA4 events with full payload for debugging.
     */
    public function events(Request $request): JsonResponse
    {
        $days = (int) $request->input('days', 7);

        return response()->json($this->analyticsService->getMetaEventsData($days));
    }
}
