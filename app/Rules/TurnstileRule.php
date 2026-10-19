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
     * Get the standardized validation rule array for Turnstile.
     *
     * In local/testing environments without a configured secret key,
     * it evaluates to 'nullable' to avoid blocking development/testing.
     * In production (or when explicitly configured), it strictly requires the captcha.
     *
     * @return array<int, mixed>
     */
    public static function rule(bool $nullableInTesting = false): array
    {
        if ($nullableInTesting && app()->environment('testing')) {
            return ['nullable', 'string', new self];
        }

        if (app()->environment('local') && empty(config('services.turnstile.secret_key'))) {
            return ['nullable', 'string', new self];
        }

        return ['required', 'string', new self];
    }

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

                Log::critical('Cloudflare Turnstile verification failed: TURNSTILE_SECRET_KEY is empty in production environment.');
                $fail('Layanan verifikasi keamanan belum dikonfigurasi di server. Silakan hubungi pengelola yayasan.');

                return;
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
