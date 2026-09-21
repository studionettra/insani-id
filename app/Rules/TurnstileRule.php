<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Translation\PotentiallyTranslatedString;

class TurnstileRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        try {
            $secretKey = config('services.turnstile.secret_key');
            if (empty($secretKey)) {
                // In local/testing environment if not configured, pass validation
                if (app()->environment('local', 'testing')) {
                    return;
                }
            }

            $response = Http::asForm()
                ->timeout(5)
                ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => $secretKey,
                    'response' => $value,
                    'remoteip' => request()->ip(),
                ]);

            if (! $response->json('success')) {
                $fail('Verifikasi keamanan gagal. Silakan coba lagi.');
            }
        } catch (\Throwable $e) {
            Log::warning('Turnstile verification error: '.$e->getMessage());
            // Fail safely if in production, or bypass in local
            if (! app()->environment('local', 'testing')) {
                $fail('Gagal menghubungkan ke layanan verifikasi keamanan. Silakan coba sesaat lagi.');
            }
        }
    }
}
