<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
        $xenditXCallbackToken = config('services.xendit.webhook_token');
        $reqToken = $request->header('x-callback-token');

        if ($reqToken !== $xenditXCallbackToken) {
            \Illuminate\Support\Facades\Log::warning('Unauthorized Xendit Webhook Token', [
                'ip' => $request->ip(),
                'token_received' => $reqToken
            ]);
            return response()->json(['message' => 'Unauthorized token'], 403);
        }

        return $next($request);
    }
}
