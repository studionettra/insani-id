<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyXenditCallbackToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $xenditXCallbackToken = (string) config('services.xendit.webhook_token');
        $reqToken = (string) $request->header('x-callback-token');

        if (empty($xenditXCallbackToken) || empty($reqToken) || ! hash_equals($xenditXCallbackToken, $reqToken)) {
            Log::warning('Unauthorized Xendit Webhook attempt', [
                'ip' => $request->ip(),
                'has_token_header' => $request->hasHeader('x-callback-token'),
            ]);

            return response()->json(['message' => 'Unauthorized token'], 403);
        }

        return $next($request);
    }
}
