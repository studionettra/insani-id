<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProgramCompletedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $program;

    /**
     * Create a new message instance.
     */
    public function __construct($program)
    {
        $this->program = $program;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $title = is_array($this->program->title) ? $this->program->title['id'] : $this->program->title;

        return new Envelope(
            subject: "Selamat! Program Donasi '{$title}' Telah Selesai",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.programs.completed',
            with: [
                'program' => $this->program,
                'url' => url('/program/'.$this->program->slug),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
