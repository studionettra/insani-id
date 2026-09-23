<?php

namespace App\Notifications;

use App\Models\CampaignerProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CampaignerRegisteredNotification extends Notification
{
    use Queueable;

    public function __construct(public CampaignerProfile $profile) {}

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
        $name = $this->profile->nama_lembaga ?: ($this->profile->user?->name ?? 'Campaigner');
        $type = ucfirst($this->profile->type ?? 'Individu');

        return [
            'title' => 'Pendaftaran Campaigner Baru',
            'message' => "Campaigner {$name} ({$type}) telah mengunggah berkas verifikasi.",
            'url' => route('admin.campaigners.show', $this->profile->id),
            'category' => 'campaigner',
            'icon' => 'user-check',
            'id_reference' => $this->profile->id,
        ];
    }
}
