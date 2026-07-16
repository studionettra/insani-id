<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCampaignerVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $profile = $request->user()->campaignerProfile;

        if (! $profile || $profile->verification_status !== 'verified') {
            return redirect()->route('campaigner.status')
                ->with('error', 'Akun Anda belum terverifikasi sebagai Campaigner.');
        }

        return $next($request);
    }
}
