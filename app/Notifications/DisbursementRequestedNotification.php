<?php

namespace App\Notifications;

use App\Models\Disbursement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DisbursementRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Disbursement $disbursement) {}

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
        $programTitle = $this->disbursement->program?->title ?? 'Program';
        $formattedAmount = 'Rp '.number_format((float) $this->disbursement->requested_amount, 0, ',', '.');
        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        return (new MailMessage)
            ->replyTo($replyToEmail, $replyToName)
            ->subject("[Insani] Permohonan Pencairan Dana - {$programTitle}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Tim Keuangan.')
            ->line("Terdapat permohonan pencairan dana baru yang diajukan untuk program galang dana **{$programTitle}**.")
            ->line("• **Nominal Pengajuan**: **{$formattedAmount}**")
            ->line("• **Bank Tujuan**: {$this->disbursement->bank_name}")
            ->line("• **Nomor Rekening**: {$this->disbursement->bank_account_number}")
            ->line("• **Atas Nama**: {$this->disbursement->bank_account_name}")
            ->line('• **Catatan/Kebutuhan**: '.($this->disbursement->notes ?: '-'))
            ->action('Verifikasi Pencairan Dana', route('admin.disbursements.show', $this->disbursement->id))
            ->line('Silakan lakukan peninjauan saldo program dan keabsahan rekening sebelum menyetujui atau mentransfer dana.')
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $programTitle = $this->disbursement->program?->title ?? 'Program';
        $formattedAmount = 'Rp '.number_format((float) $this->disbursement->requested_amount, 0, ',', '.');

        return [
            'title' => 'Pengajuan Pencairan Dana',
            'message' => "Pengajuan {$formattedAmount} untuk program \"{$programTitle}\" menunggu persetujuan.",
            'url' => route('admin.disbursements.show', $this->disbursement->id),
            'category' => 'disbursement',
            'icon' => 'credit-card',
            'id_reference' => $this->disbursement->id,
        ];
    }
}
