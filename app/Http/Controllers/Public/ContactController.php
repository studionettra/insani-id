<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageNotification;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\User;
use App\Notifications\ContactMessageReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class ContactController extends Controller
{
    public function create()
    {
        $faqs = Faq::where('is_active', true)
            ->where('category', 'kontak')
            ->orderBy('sort_order')
            ->take(4)
            ->get();

        if ($faqs->isEmpty()) {
            $faqs = Faq::where('is_active', true)
                ->whereIn('category', ['umum', 'donatur'])
                ->orderBy('sort_order')
                ->take(3)
                ->get();
        }

        return inertia('Public/Contact/Create', [
            'faqs' => $faqs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value)) {
                        return;
                    }
                    if (preg_match('#<[a-z!/][\s\S]*>#i', $value) || strip_tags($value) !== $value) {
                        $fail(__('Nama tidak boleh mengandung tag HTML atau skrip.'));

                        return;
                    }
                    if (preg_match('/\p{Extended_Pictographic}/u', $value)) {
                        $fail(__('Nama tidak boleh mengandung emoji atau simbol grafis.'));

                        return;
                    }
                },
            ],
            'email' => 'required|email|max:150',
            'phone' => [
                'nullable',
                'string',
                'max:30',
                'regex:/^[0-9\s\+\-\(\)]*$/',
            ],
            'subject' => [
                'required',
                'string',
                'max:150',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value)) {
                        return;
                    }
                    if (preg_match('#<[a-z!/][\s\S]*>#i', $value) || strip_tags($value) !== $value) {
                        $fail(__('Subjek tidak boleh mengandung tag HTML atau skrip.'));

                        return;
                    }
                    if (preg_match('/\p{Extended_Pictographic}/u', $value)) {
                        $fail(__('Subjek tidak boleh mengandung emoji atau simbol grafis.'));

                        return;
                    }
                },
            ],
            'message' => [
                'required',
                'string',
                'min:10',
                'max:2000',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value)) {
                        return;
                    }
                    if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
                        $fail(__('Pesan mengandung karakter yang tidak diizinkan.'));

                        return;
                    }
                    if (preg_match('#<[a-z!/][\s\S]*>#i', $value) || strip_tags($value) !== $value) {
                        $fail(__('Pesan tidak boleh mengandung tag HTML atau kode skrip.'));

                        return;
                    }
                    if (preg_match('/\p{Extended_Pictographic}/u', $value)) {
                        $fail(__('Pesan tidak boleh mengandung karakter emoji atau simbol grafis. Mohon gunakan teks biasa.'));

                        return;
                    }
                },
            ],
            'cf-turnstile-response' => 'required|string',
        ], [
            'phone.regex' => __('Nomor telepon hanya boleh memuat angka, spasi, dan simbol +, -, ().'),
            'message.min' => __('Pesan terlalu pendek, minimal 10 karakter.'),
            'message.max' => __('Pesan terlalu panjang, maksimal 2.000 karakter.'),
        ]);

        // Verify Turnstile
        $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => config('services.turnstile.secret_key'),
            'response' => $request->input('cf-turnstile-response'),
            'remoteip' => $request->ip(),
        ]);

        if (! $response->json('success')) {
            return back()
                ->withErrors(['cf-turnstile-response' => __('Verifikasi keamanan gagal. Silakan coba kembali.')])
                ->with('error', __('Verifikasi keamanan gagal. Silakan coba kembali.'));
        }

        $cleanMessage = trim(strip_tags(str_replace("\0", '', $validated['message'])));
        $cleanName = trim(strip_tags(str_replace("\0", '', $validated['name'])));
        $cleanSubject = trim(strip_tags(str_replace("\0", '', $validated['subject'])));
        $cleanPhone = ! empty($validated['phone']) ? trim(strip_tags(str_replace("\0", '', $validated['phone']))) : null;

        $message = ContactMessage::create([
            'name' => $cleanName,
            'email' => $validated['email'],
            'phone' => $cleanPhone,
            'subject' => $cleanSubject,
            'message' => $cleanMessage,
        ]);

        // Send Email Notification (Queued)
        try {
            $adminEmail = config('mail.from.address', 'sapa@insani.id');
            Mail::to($adminEmail)->queue(new ContactMessageNotification($message));
        } catch (\Exception $e) {
            Log::error('Gagal mengirim email notifikasi kontak: '.$e->getMessage());
        }

        // Database Notification for CS / Admin
        $recipients = rescue(fn () => User::permission('manage_contact_messages')->get(), collect(), false);
        if ($recipients->isEmpty()) {
            $recipients = rescue(fn () => User::role('Administrator')->get(), collect(), false);
        }
        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new ContactMessageReceivedNotification($message));
        }

        return back()->with('success', __('Terima kasih, pesan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda.'));
    }
}
