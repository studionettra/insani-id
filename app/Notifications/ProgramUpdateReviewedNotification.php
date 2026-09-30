<?php

namespace App\Notifications;

use App\Models\Program;
use App\Models\ProgramUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProgramUpdateReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Program $program,
        public ProgramUpdate $update
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
        $programTitle = $this->program->getTranslation('title', 'id')
            ?: (is_string($this->program->title) ? $this->program->title : 'Program Kebaikan');

        $updateTitle = $this->update->getTranslation('title', 'id')
            ?: (is_string($this->update->title) ? $this->update->title : 'Kabar Terbaru');

        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        $mail = (new MailMessage)->replyTo($replyToEmail, $replyToName);

        if ($this->update->moderation_status === 'approved') {
            return $mail
                ->subject("[Insani] Alhamdulillah! Kabar Program Anda Telah Diterbitkan - {$programTitle}")
                ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
                ->line("Kabar gembira! Laporan kabar terbaru Anda berjudul **\"{$updateTitle}\"** untuk program **\"{$programTitle}\"** telah disetujui oleh tim kurator dan resmi dipublikasikan ke donatur.")
                ->line('Sesuai kebijakan integritas platform, kabar yang telah terpublikasi kini bersifat permanen (terkunci) sebagai bentuk transparansi dan akuntabilitas publik.')
                ->action('Lihat Kabar Program', route('akun.programs.updates.index', $this->program->id))
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
        }

        if ($this->update->moderation_status === 'rejected') {
            $reason = $this->update->rejection_reason ?: 'Laporan kabar belum memenuhi pedoman kelengkapan dokumentasi penyaluran Insani.';

            return $mail
                ->subject("[Insani] Pemberitahuan Moderasi Kabar Program - {$programTitle}")
                ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
                ->line("Terima kasih atas laporan kabar program yang Anda ajukan untuk **\"{$programTitle}\"**.")
                ->line("Setelah ditinjau, mohon maaf kabar berjudul **\"{$updateTitle}\"** saat ini **belum dapat disetujui** untuk dipublikasikan.")
                ->line("• **Catatan Verifikator**: \"{$reason}\"")
                ->line('Silakan periksa kembali dokumentasi bukti penyaluran melalui dashboard dan buat kabar terbaru klarifikasi susulan yang telah disesuaikan.')
                ->action('Buka Manajemen Kabar', route('akun.programs.updates.index', $this->program->id))
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
        }

        return $mail
            ->subject("[Insani] Status Kabar Program Diperbarui - {$programTitle}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
            ->line("Status moderasi untuk kabar **\"{$updateTitle}\"** pada program **\"{$programTitle}\"** telah diperbarui menjadi **{$this->update->moderation_status}**.")
            ->action('Buka Manajemen Kabar', route('akun.programs.updates.index', $this->program->id))
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $programTitle = $this->program->getTranslation('title', 'id')
            ?: (is_string($this->program->title) ? $this->program->title : 'Program');

        $updateTitle = $this->update->getTranslation('title', 'id')
            ?: (is_string($this->update->title) ? $this->update->title : 'Kabar Terbaru');

        if ($this->update->moderation_status === 'approved') {
            $title = 'Kabar Program Telah Diterbitkan';
            $message = "Kabar terbaru \"{$updateTitle}\" pada program \"{$programTitle}\" telah disetujui dan kini tampil ke publik.";
        } elseif ($this->update->moderation_status === 'rejected') {
            $title = 'Kabar Program Ditolak';
            $reasonText = $this->update->rejection_reason ? " Catatan: {$this->update->rejection_reason}" : '';
            $message = "Kabar terbaru \"{$updateTitle}\" pada program \"{$programTitle}\" belum dapat disetujui.{$reasonText}";
        } else {
            $title = 'Status Kabar Program Diperbarui';
            $message = "Status kabar \"{$updateTitle}\" pada program \"{$programTitle}\" telah diperbarui menjadi {$this->update->moderation_status}.";
        }

        return [
            'title' => $title,
            'message' => $message,
            'url' => route('akun.programs.updates.index', $this->program->id),
            'category' => 'program',
            'icon' => 'sparkles',
            'id_reference' => $this->update->id,
            'program_id' => $this->program->id,
            'moderation_status' => $this->update->moderation_status,
        ];
    }
}
