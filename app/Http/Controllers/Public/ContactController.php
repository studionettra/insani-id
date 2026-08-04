<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageNotification;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function create()
    {
        return inertia('Public/Contact/Create');
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
            return back()->withErrors(['cf-turnstile-response' => 'Verifikasi keamanan gagal.']);
        }

        $message = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        // Send Email Notification
        try {
            Mail::to('sapa@insani.id')->send(new ContactMessageNotification($message));
        } catch (\Exception $e) {
            Log::error('Gagal mengirim email notifikasi kontak: '.$e->getMessage());
        }

        return back()->with('success', 'Terima kasih, pesan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda.');
    }
}
