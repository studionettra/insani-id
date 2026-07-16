<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
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

        // Validate Turnstile
        $turnstileSecret = config('services.turnstile.secret');
        if ($turnstileSecret) {
            $response = \Illuminate\Support\Facades\Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $turnstileSecret,
                'response' => $validated['cf-turnstile-response'],
                'remoteip' => $request->ip(),
            ]);

            if (!$response->json('success')) {
                return response()->json([
                    'message' => 'Validasi keamanan gagal. Silakan coba lagi.',
                ], 422);
            }
        }

        $contactMessage = \App\Models\ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        // Send email notification to sapa@insani.id
        // We will create the Mailable later, or just use raw mail for now
        \Illuminate\Support\Facades\Mail::raw("Ada pesan masuk baru dari {$contactMessage->name} ({$contactMessage->email}).\n\nSubjek: {$contactMessage->subject}\n\nPesan:\n{$contactMessage->message}", function ($mail) {
            $mail->to('sapa@insani.id')
                 ->subject('Pesan Kontak Baru dari Website');
        });
            
        return response()->json([
            'status' => 'success',
            'message' => 'Pesan berhasil dikirim.',
            'data' => $contactMessage
        ]);
    }
}
