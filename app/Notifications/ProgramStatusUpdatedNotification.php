<?php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProgramStatusUpdatedNotification extends Notification implements ShouldQueue
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
        return ! empty($notifiable->email) ? ['database', 'mail'] : ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $title = $this->program->getTranslation('title', 'id')
            ?: (is_string($this->program->title) ? $this->program->title : 'Program Kebaikan');

        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        $mail = (new MailMessage)->replyTo($replyToEmail, $replyToName);

        if ($this->status === 'published') {
            $programUrl = $this->program->slug
                ? route('program.show', $this->program->slug)
                : route('akun.programs.index');

            return $mail
                ->subject("[Insani] Alhamdulillah! Program Anda Telah Diterbitkan - {$title}")
                ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
                ->line("Kabar gembira! Program galang dana kebaikan Anda yang berjudul **\"{$title}\"** telah berhasil lolos kurasi dan resmi **dipublikasikan** di platform Insani Indonesia.")
                ->line('Kini masyarakat dan donatur dermawan sudah dapat membaca kisah program Anda dan menyalurkan donasi secara langsung.')
                ->action('Lihat Program & Mulai Berbagi', $programUrl)
                ->line('Anda dapat membagikan tautan program ke berbagai media sosial dan jejaring donatur untuk memperluas jangkauan manfaat.')
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
        }

        if ($this->status === 'rejected') {
            $notes = $this->rejectionNotes ?: 'Dokumen atau rincian program belum memenuhi ketentuan panduan penggalangan dana Insani.';

            return $mail
                ->subject("[Insani] Pemberitahuan Kurasi Program - {$title}")
                ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
                ->line("Terima kasih atas ikhtiar kebaikan Anda dalam mengajukan program **\"{$title}\"**.")
                ->line('Setelah ditinjau secara saksama oleh tim Kurator Insani, mohon maaf saat ini program Anda **belum dapat dipublikasikan**.')
                ->line("• **Catatan Kurator**: \"{$notes}\"")
                ->line('Silakan periksa kembali narasi atau kelengkapan berkas program melalui dashboard Anda untuk melakukan penyesuaian.')
                ->action('Buka Manajemen Program', route('akun.programs.index'))
                ->line('Jika memerlukan bimbingan penulisan kampanye, jangan ragu untuk membalas email ini.')
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
        }

        return $mail
            ->subject("[Insani] Status Program Diperbarui - {$title}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
            ->line("Status program kebaikan Anda **\"{$title}\"** telah diperbarui menjadi **{$this->status}**.")
            ->action('Lihat Dashboard Program', route('akun.programs.index'))
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
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
