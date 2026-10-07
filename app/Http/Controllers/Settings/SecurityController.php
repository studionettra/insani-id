<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller
{
    /**
     * Show the user's security settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $user = $request->user();

        $props = [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'lastLoginAt' => $user->last_login_at?->toIso8601String(),
        ];

        $canManageTwoFactor = Features::enabled(Features::twoFactorAuthentication())
            && ($user->isStaff() || app()->environment('testing'));

        $props['canManageTwoFactor'] = $canManageTwoFactor;

        if ($canManageTwoFactor) {
            $request->ensureStateIsValid();

            $props['twoFactorEnabled'] = ! is_null($user->two_factor_confirmed_at);
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render('settings/security', $props);
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->update([
            'password' => $request->password,
        ]);

        $logoutOtherDevices = $request->boolean('logout_other_devices', true);

        if ($logoutOtherDevices) {
            Auth::logoutOtherDevices($request->password);

            $sessionTable = config('session.table', 'sessions');
            if (Schema::hasTable($sessionTable)) {
                DB::table($sessionTable)
                    ->where('user_id', $user->id)
                    ->where('id', '!=', (string) $request->session()->getId())
                    ->delete();
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $logoutOtherDevices
                ? 'Kata sandi berhasil diperbarui dan sesi di perangkat lain telah diakhiri.'
                : 'Kata sandi berhasil diperbarui.',
        ]);

        return back();
    }
}
