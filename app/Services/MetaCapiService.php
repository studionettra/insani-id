<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use App\Models\AppSetting;
use App\Models\Donation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MetaCapiService
{
    /**
     * Send a server-side Purchase event to Meta Conversions API.
     */
    public function sendPurchaseEvent(Donation $donation, ?string $clientIp = null, ?string $userAgent = null): bool
    {
        $enabled = AppSetting::get('meta_capi_enabled');
        if ($enabled !== '1') {
            return false;
        }

        $pixelId = trim((string) AppSetting::get('meta_pixel_id'));
        $accessToken = trim((string) AppSetting::get('meta_capi_access_token'));

        if (empty($pixelId) || empty($accessToken)) {
            Log::warning('Meta CAPI is enabled but meta_pixel_id or meta_capi_access_token is missing.');

            return false;
        }

        $testEventCode = trim((string) AppSetting::get('meta_capi_test_event_code'));

        // Prepare User Data (Normalized & SHA-256 Hashed per Meta Specs)
        $userData = [];

        if (! empty($donation->donor_email)) {
            $userData['em'] = [hash('sha256', strtolower(trim($donation->donor_email)))];
        }

        if (! empty($donation->donor_phone)) {
            $cleanPhone = preg_replace('/[^0-9]/', '', (string) $donation->donor_phone);
            if (str_starts_with($cleanPhone, '0')) {
                $cleanPhone = '62'.substr($cleanPhone, 1);
            }
            $userData['ph'] = [hash('sha256', $cleanPhone)];
        }

        if (! empty($donation->donor_name) && ! $donation->is_anonymous) {
            $parts = explode(' ', trim($donation->donor_name));
            $userData['fn'] = [hash('sha256', strtolower($parts[0]))];
            if (count($parts) > 1) {
                $userData['ln'] = [hash('sha256', strtolower(end($parts)))];
            }
        }

        if ($clientIp) {
            $userData['client_ip_address'] = $clientIp;
        }

        if ($userAgent) {
            $userData['client_user_agent'] = $userAgent;
        }

        $programTitle = $donation->program?->title ?? 'Program Donasi Insani';
        $eventTime = $donation->paid_at ? $donation->paid_at->timestamp : now()->timestamp;
        $eventSourceUrl = url("/donasi/status/{$donation->donation_code}");

        $eventData = [
            'event_name' => 'Purchase',
            'event_time' => $eventTime,
            'event_id' => $donation->donation_code, // Match client-side donationCode for deduplication
            'event_source_url' => $eventSourceUrl,
            'action_source' => 'website',
            'user_data' => $userData,
            'custom_data' => [
                'currency' => 'IDR',
                'value' => (float) $donation->amount,
                'content_name' => $programTitle,
                'content_type' => 'product',
            ],
        ];

        $requestBody = [
            'data' => [$eventData],
        ];

        if (! empty($testEventCode)) {
            $requestBody['test_event_code'] = $testEventCode;
        }

        $endpoint = "https://graph.facebook.com/v20.0/{$pixelId}/events";

        try {
            $response = Http::timeout(10)
                ->withToken($accessToken)
                ->post($endpoint, $requestBody);

            $isSuccess = $response->successful();

            if ($isSuccess) {
                Log::info("Meta CAPI Purchase event successfully sent for donation {$donation->donation_code}");
            } else {
                Log::error("Meta CAPI error for donation {$donation->donation_code}: ".$response->body());
            }

            // Record into internal analytics_events table for admin dashboard diagnostics
            $this->logInternalEvent($donation, $isSuccess ? 'capi_sent' : 'capi_failed', [
                'donation_code' => $donation->donation_code,
                'amount' => $donation->amount,
                'program_title' => $programTitle,
                'meta_capi_response' => $response->json() ?? $response->body(),
                'source' => 'server_capi',
            ]);

            return $isSuccess;
        } catch (\Throwable $e) {
            Log::error("Meta CAPI exception for donation {$donation->donation_code}: ".$e->getMessage());

            $this->logInternalEvent($donation, 'capi_error', [
                'donation_code' => $donation->donation_code,
                'amount' => $donation->amount,
                'error' => $e->getMessage(),
                'source' => 'server_capi',
            ]);

            return false;
        }
    }

    /**
     * Log the CAPI event into analytics_events table so it appears in Admin Meta Events Tab.
     */
    protected function logInternalEvent(Donation $donation, string $status, array $payload): void
    {
        try {
            $sessionId = 'capi_'.Str::slug($donation->donation_code, '_');

            $session = AnalyticsSession::firstOrCreate(
                ['id' => $sessionId],
                [
                    'ip_address' => '127.0.0.1',
                    'device_type' => 'server',
                    'browser' => 'Meta CAPI',
                    'os' => 'Backend',
                    'last_activity_at' => now(),
                ]
            );

            AnalyticsEvent::create([
                'session_id' => $session->id,
                'event_name' => 'Purchase',
                'url' => url("/donasi/status/{$donation->donation_code}"),
                'meta_status' => $status,
                'ga4_status' => 'server_dispatched',
                'payload' => $payload,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Silently ignore secondary logging errors
        }
    }
}
