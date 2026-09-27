<?php

namespace App\Notifications;

use App\Models\ProgramReport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class ProgramReportReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ProgramReport $report) {}

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
        $programTitle = $this->report->program ? $this->report->program->title : 'Program';
        $categoryName = $this->report->category ? $this->report->category->name : 'Pelanggaran';

        return (new MailMessage)
            ->subject("[Laporan Pelanggaran] Tiket #{$this->report->ticket_number} - {$categoryName}")
            ->greeting('Peringatan Moderasi Insani Indonesia')
            ->line("Terdapat aduan/laporan kecurangan baru yang masuk melalui publik untuk tiket **#{$this->report->ticket_number}**:")
            ->line("• **Program**: {$programTitle}")
            ->line("• **Kategori Pelanggaran**: {$categoryName}")
            ->line("• **Pelapor**: {$this->report->reporter_name} ({$this->report->reporter_phone} / {$this->report->reporter_email})")
            ->line('• **Uraian Aduan**: "'.Str::limit($this->report->description, 300).'"')
            ->action('Periksa & Tangani Laporan', url('/admin/program-reports'))
            ->line('Silakan segera tinjau bukti aduan yang dilampirkan untuk menjaga transparansi dan kredibilitas platform.')
            ->salutation("Salam Kepatuhan,\n**Sistem Keamanan Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $programTitle = $this->report->program ? $this->report->program->title : 'Program';
        $categoryName = $this->report->category ? $this->report->category->name : 'Pelanggaran';

        return [
            'title' => "Laporan Pelanggaran #{$this->report->ticket_number}",
            'message' => "Aduan baru ({$categoryName}) untuk program '{$programTitle}'.",
            'url' => '/admin/program-reports',
            'ticket_number' => $this->report->ticket_number,
            'program_id' => $this->report->program_id,
            'category_id' => $this->report->category_id,
            'status' => $this->report->status,
        ];
    }
}
