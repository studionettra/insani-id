<?php

namespace App\Notifications;

use App\Models\CampaignSlotRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignSlotRequestedNotification extends Notification implements ShouldQueue
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
        $orgName = $this->slotRequest->campaignerProfile?->nama_lembaga
            ?? $this->slotRequest->campaignerProfile?->institution_name
            ?? $this->slotRequest->requester?->name
            ?? 'Mitra Lembaga';

        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        return (new MailMessage)
            ->replyTo($replyToEmail, $replyToName)
            ->subject("[Insani] Pengajuan Tambahan Slot Campaign - {$orgName}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh,')
            ->line("Mitra lembaga **{$orgName}** telah mengajukan permohonan penambahan kuota slot campaign aktif di Insani Indonesia.")
            ->line("• **Slot Saat Ini**: {$this->slotRequest->current_slots} slot")
            ->line("• **Jumlah Slot yang Diajukan**: {$this->slotRequest->requested_slots} slot")
            ->line("• **Alasan Pengajuan**: \"{$this->slotRequest->reason}\"")
            ->action('Review & Beri Keputusan', route('admin.slot-requests.index'))
            ->line('Silakan tinjau berkas dan alasan pengajuan mitra lembaga ini melalui Dashboard Admin Insani.')
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $orgName = $this->slotRequest->campaignerProfile?->nama_lembaga
            ?? $this->slotRequest->campaignerProfile?->institution_name
            ?? $this->slotRequest->requester?->name
            ?? 'Mitra Lembaga';

        return [
            'title' => 'Pengajuan Tambahan Slot Campaign Baru',
            'message' => "{$orgName} mengajukan penambahan slot campaign dari {$this->slotRequest->current_slots} menjadi {$this->slotRequest->requested_slots} slot.",
            'url' => route('admin.slot-requests.index'),
            'category' => 'campaigner',
            'icon' => 'layers',
            'id_reference' => $this->slotRequest->id,
            'status' => 'pending',
        ];
    }
}
