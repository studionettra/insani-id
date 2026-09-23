<?php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProgramSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(public Program $program) {}

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
        $creatorName = $this->program->creator?->name ?? 'Campaigner';
        $title = $this->program->getTranslation('title', 'id') ?: (is_string($this->program->title) ? $this->program->title : 'Program');

        return [
            'title' => 'Pengajuan Program Baru',
            'message' => "Campaigner {$creatorName} mengajukan program \"{$title}\" untuk diverifikasi.",
            'url' => route('admin.programs.index', ['search' => $title]),
            'category' => 'program',
            'icon' => 'sparkles',
            'id_reference' => $this->program->id,
        ];
    }
}
