<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LogoutResponse implements LogoutResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  Request  $request
     * @return Response
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        $user = $request->attributes->get('logged_out_user');

        $staffRoles = [
            'Administrator',
            'Program Officer',
            'Verifikator',
            'Keuangan',
            'Content Editor',
            'Customer Service',
            'Eksekutif',
            'Relawan Lapangan',
            'admin',
            'superadmin',
        ];

        $isStaff = $user && (
            (method_exists($user, 'hasAnyRole') && $user->hasAnyRole($staffRoles))
            || (! empty($user->is_admin))
        );

        $targetUrl = $isStaff ? route('login') : route('home');

        Inertia::clearHistory();

        return Inertia::location($targetUrl);
    }
}
