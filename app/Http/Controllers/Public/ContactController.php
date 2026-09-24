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
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'cf-turnstile-response' => 'required|string',
        ]);

        // Verify Turnstile
        $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => config('services.turnstile.secret_key'),
            'response' => $request->input('cf-turnstile-response'),
            'remoteip' => $request->ip(),
        ]);

        if (! $response->json('success')) {
            return back()->withErrors(['cf-turnstile-response' => __('Verifikasi keamanan gagal.')]);
        }

        $message = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
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
