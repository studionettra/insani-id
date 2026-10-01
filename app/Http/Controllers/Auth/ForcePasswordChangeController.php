<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Rules\TurnstileRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ForcePasswordChangeController extends Controller
{
    /**
     * Display the force password change view.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->must_change_password) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Public/Auth/ForcePasswordChange', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Update the user's password and clear the must_change_password flag.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->must_change_password) {
            return redirect()->route('dashboard');
        }

        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
            'cf-turnstile-response' => ['required', 'string', new TurnstileRule],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok dengan password yang dimasukkan.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.mixed' => 'Password harus mengandung kombinasi huruf besar dan huruf kecil.',
            'password.letters' => 'Password harus mengandung setidaknya satu huruf.',
            'password.symbols' => 'Password harus mengandung setidaknya satu simbol atau karakter khusus (contoh: !@#$%^&*).',
            'password.numbers' => 'Password harus mengandung setidaknya satu angka.',
            'password.uncompromised' => 'Password yang dimasukkan terindikasi pernah bocor dalam data publik. Gunakan password yang lebih aman.',
            'cf-turnstile-response.required' => 'Mohon selesaikan verifikasi keamanan Cloudflare Turnstile.',
        ]);

        // Ensure new password is not the same as temporary password
        if (Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'Kata sandi baru tidak boleh sama dengan kata sandi sementara yang diberikan sebelumnya.',
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        return redirect()->route('dashboard')->with('success', 'Kata sandi Anda berhasil diperbarui. Selamat datang di sistem!');
    }
}
