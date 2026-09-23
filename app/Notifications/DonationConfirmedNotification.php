<?php

namespace App\Notifications;

use App\Models\Donation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DonationConfirmedNotification extends Notification
{
    use Queueable;

    public function __construct(public Donation $donation) {}

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
        $programTitle = $this->donation->program?->getTranslation('title', 'id')
            ?: (is_string($this->donation->program?->title) ? $this->donation->program?->title : 'Program Donasi');
        $formattedAmount = number_format($this->donation->amount, 0, ',', '.');

        return [
            'title' => 'Donasi Berhasil Diterima',
            'message' => "Terima kasih! Donasi Anda sebesar Rp {$formattedAmount} untuk program \"{$programTitle}\" telah berhasil diverifikasi.",
            'url' => route('akun.donations.index'),
            'category' => 'donation',
            'icon' => 'heart',
            'id_reference' => $this->donation->id,
            'amount' => $this->donation->amount,
        ];
    }
}
