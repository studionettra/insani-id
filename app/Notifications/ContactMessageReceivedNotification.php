<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class ContactMessageReceivedNotification extends Notification
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
        return ['database'];
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
