<?php

namespace App\Notifications;

use App\Models\CampaignSlotRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignSlotRequestReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public CampaignSlotRequest $slotRequest
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
        $isApproved = $this->slotRequest->status === 'approved';
        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        $orgName = $this->slotRequest->campaignerProfile?->nama_lembaga
            ?? $this->slotRequest->campaignerProfile?->institution_name
            ?? $notifiable->name
            ?? 'Mitra Lembaga';

        $mail = (new MailMessage)
            ->replyTo($replyToEmail, $replyToName);

        if ($isApproved) {
            $newSlots = $this->slotRequest->campaignerProfile?->max_campaign_slots ?? $this->slotRequest->requested_slots;

            return $mail
                ->subject('[Insani] Alhamdulillah! Pengajuan Tambahan Slot Campaign Anda Disetujui')
                ->greeting("Assalamu’alaikum Warahmatullahi Wabarakatuh, {$orgName}.")
                ->line('Kabar gembira! Permohonan penambahan kuota slot campaign aktif Anda di Insani Indonesia telah **disetujui** oleh Tim Superadmin.')
                ->line("• **Batas Kuota Baru**: **{$newSlots} campaign aktif**")
                ->line('Kini Anda dapat mempublikasikan lebih banyak program galang dana kebaikan untuk menjangkau para donatur dermawan.')
                ->action('Lihat Kuota & Buat Program', route('akun.programs.index'))
                ->line('Terima kasih atas dedikasi dan ikhtiar kebaikan Anda bersama Insani Indonesia.')
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
        }

        $notes = $this->slotRequest->admin_notes ? "Catatan Verifikator: \"{$this->slotRequest->admin_notes}\"" : 'Belum memenuhi syarat penambahan slot saat ini.';

        return $mail
            ->subject('[Insani] Pemberitahuan Terkait Pengajuan Tambahan Slot Campaign')
            ->greeting("Assalamu’alaikum Warahmatullahi Wabarakatuh, {$orgName}.")
            ->line('Terima kasih telah mengajukan permohonan penambahan kuota slot campaign aktif di Insani Indonesia.')
            ->line('Setelah melalui proses peninjauan, mohon maaf saat ini permohonan Anda **belum dapat disetujui**.')
            ->line("• **{$notes}**")
            ->line('Anda tetap dapat mengoptimalkan campaign yang sedang aktif atau mengajukan kembali di kemudian hari.')
            ->action('Masuk ke Dashboard Program', route('akun.programs.index'))
            ->line('Jika Anda memiliki pertanyaan lebih lanjut, silakan balas email ini untuk terhubung dengan tim Layanan Sahabat Insani.')
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $isApproved = $this->slotRequest->status === 'approved';

        if ($isApproved) {
            $title = 'Pengajuan Tambahan Slot Disetujui';
            $message = "Alhamdulillah! Pengajuan penambahan slot campaign Anda telah disetujui. Kuota campaign aktif Anda kini menjadi {$this->slotRequest->campaignerProfile?->max_campaign_slots} slot.";
        } else {
            $title = 'Pengajuan Tambahan Slot Belum Disetujui';
            $notes = $this->slotRequest->admin_notes ? " Catatan: {$this->slotRequest->admin_notes}" : '';
            $message = "Mohon maaf, pengajuan penambahan slot campaign Anda belum dapat disetujui saat ini.{$notes}";
        }

        return [
            'title' => $title,
            'message' => $message,
            'url' => route('akun.programs.index'),
            'category' => 'campaigner',
            'icon' => $isApproved ? 'check-circle' : 'x-circle',
            'id_reference' => $this->slotRequest->id,
            'status' => $this->slotRequest->status,
        ];
    }
}
