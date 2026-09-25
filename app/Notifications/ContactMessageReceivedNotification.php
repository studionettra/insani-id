<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class ContactMessageReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ContactMessage $contactMessage) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ! empty($notifiable->email) ? ['database', 'mail'] : ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $shortSubject = Str::limit($this->contactMessage->subject, 60);

        return (new MailMessage)
            ->replyTo($this->contactMessage->email, $this->contactMessage->name)
            ->subject("[Insani Hubungi Kami] {$shortSubject}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Tim Insani.')
            ->line('Terdapat pesan baru yang dikirimkan oleh pengunjung melalui formulir Kontak website Insani Indonesia:')
            ->line("• **Pengirim**: {$this->contactMessage->name} ({$this->contactMessage->email})")
            ->line('• **No. Telepon / WhatsApp**: '.($this->contactMessage->phone ?: '-'))
            ->line("• **Subjek**: {$this->contactMessage->subject}")
            ->line("• **Pesan**: \"{$this->contactMessage->message}\"")
            ->action('Lihat & Balas Pesan', route('admin.contact-messages.show', $this->contactMessage->id))
            ->line('Anda juga dapat langsung membalas email ini untuk merespons pengirim secara langsung.')
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Sistem Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $shortSubject = Str::limit($this->contactMessage->subject, 45);

        return [
            'title' => 'Pesan Kontak Masuk',
            'message' => "Pesan baru dari {$this->contactMessage->name}: \"{$shortSubject}\"",
            'url' => route('admin.contact-messages.show', $this->contactMessage->id),
            'category' => 'contact',
            'icon' => 'mail',
            'id_reference' => $this->contactMessage->id,
        ];
    }
}
