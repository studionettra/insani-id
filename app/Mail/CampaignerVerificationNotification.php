<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CampaignerVerificationNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $campaignerProfile;

    public $status;

    public $notes;

    /**
     * Create a new message instance.
     */
    public function __construct($campaignerProfile, string $status, ?string $notes = null)
    {
        $this->campaignerProfile = $campaignerProfile;
        $this->status = $status;
        $this->notes = $notes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $title = $this->status === 'verified' ? 'Pengajuan Verifikasi Disetujui' : 'Pemberitahuan Status Verifikasi Akun';

        return new Envelope(
            subject: "{$title} - ".config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.campaigners.verification',
            with: [
                'campaigner' => $this->campaignerProfile,
                'status' => $this->status,
                'notes' => $this->notes,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
