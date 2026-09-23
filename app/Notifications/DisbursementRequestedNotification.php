<?php

namespace App\Notifications;

use App\Models\Disbursement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DisbursementRequestedNotification extends Notification
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
        return ['database'];
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
