<?php

namespace App\Notifications;

use App\Models\CampaignerProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignerRegisteredNotification extends Notification implements ShouldQueue
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
        return ! empty($notifiable->email) ? ['database', 'mail'] : ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $name = $this->profile->nama_lembaga
            ?: $this->profile->institution_name
            ?: ($this->profile->user?->name ?? 'Calon Campaigner');
        $type = ucfirst($this->profile->type ?? 'Individu');
        $email = $this->profile->user?->email ?? '-';
        $phone = $this->profile->pic_phone ?? $this->profile->user?->phone ?? '-';

        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        return (new MailMessage)
            ->replyTo($replyToEmail, $replyToName)
            ->subject("[Insani] Pendaftaran Campaigner Baru - {$name} ({$type})")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Tim Verifikator.')
            ->line('Terdapat calon mitra campaigner baru yang telah melengkapi profil dan mengunggah dokumen legalitas.')
            ->line("• **Nama Mitra / Lembaga**: **{$name}**")
            ->line("• **Kategori Pendaftar**: {$type}")
            ->line("• **Email Pendaftar**: {$email}")
            ->line("• **Kontak / WhatsApp PIC**: {$phone}")
            ->action('Verifikasi Berkas Mitra', route('admin.campaigners.show', $this->profile->id))
            ->line('Silakan periksa KTP, dokumen legalitas lembaga, serta nomor rekening bank mitra sebelum menyetujui akun.')
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $name = $this->profile->nama_lembaga
            ?: $this->profile->institution_name
            ?: ($this->profile->user?->name ?? 'Campaigner');
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
