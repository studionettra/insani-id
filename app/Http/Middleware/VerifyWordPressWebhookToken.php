<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWordPressWebhookToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-WP-Webhook-Token');
        $expectedToken = config('services.wordpress.webhook_secret');

        if (empty($expectedToken)) {
            return response()->json(['error' => 'Webhook secret is not configured.'], 500);
        }

        if ($token !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized. Invalid webhook token.'], 403);
        }

        return $next($request);
    }
}
