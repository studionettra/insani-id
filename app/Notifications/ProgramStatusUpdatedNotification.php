<?php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProgramStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Program $program,
        public string $status,
        public ?string $rejectionNotes = null
    ) {}

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
        $title = $this->program->getTranslation('title', 'id') ?: (is_string($this->program->title) ? $this->program->title : 'Program');

        if ($this->status === 'published') {
            $notificationTitle = 'Program Telah Diterbitkan';
            $message = "Program \"{$title}\" telah disetujui dan kini aktif tayang untuk menerima donasi.";
        } elseif ($this->status === 'rejected') {
            $notificationTitle = 'Pengajuan Program Ditolak';
            $notesText = $this->rejectionNotes ? " Catatan: {$this->rejectionNotes}" : ' Silakan periksa kembali detail program Anda.';
            $message = "Pengajuan program \"{$title}\" belum dapat dipublikasikan.{$notesText}";
        } else {
            $notificationTitle = 'Status Program Diperbarui';
            $message = "Status program \"{$title}\" telah diperbarui menjadi {$this->status}.";
        }

        return [
            'title' => $notificationTitle,
            'message' => $message,
            'url' => route('akun.programs.index'),
            'category' => 'program',
            'icon' => 'sparkles',
            'id_reference' => $this->program->id,
            'status' => $this->status,
        ];
    }
}
