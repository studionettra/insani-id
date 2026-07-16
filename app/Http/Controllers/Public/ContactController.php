<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function create()
    {
        return inertia('Public/Contact/Create');
    }

    public function store(\Illuminate\Http\Request $request)
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
        $response = \Illuminate\Support\Facades\Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => env('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA'), // default dummy secret for testing
            'response' => $request->input('cf-turnstile-response'),
            'remoteip' => $request->ip(),
        ]);

        if (!$response->json('success')) {
            return back()->withErrors(['cf-turnstile-response' => 'Verifikasi keamanan gagal.']);
        }

        $message = \App\Models\ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        // Send Email Notification
        try {
            \Illuminate\Support\Facades\Mail::to('sapa@insani.id')->send(new \App\Mail\ContactMessageNotification($message));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal mengirim email notifikasi kontak: ' . $e->getMessage());
        }

        return back()->with('success', 'Terima kasih, pesan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda.');
    }
}
