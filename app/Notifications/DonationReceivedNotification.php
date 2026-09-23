<?php

namespace App\Notifications;

use App\Models\Donation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DonationReceivedNotification extends Notification
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
        $donorName = $this->donation->is_anonymous ? 'Hamba Allah' : ($this->donation->donor_name ?: 'Donatur');
        $formattedAmount = 'Rp '.number_format((float) $this->donation->amount, 0, ',', '.');
        $programTitle = $this->donation->program?->title ?? 'Program';

        return [
            'title' => 'Donasi Berhasil Diterima',
            'message' => "Donasi {$formattedAmount} dari {$donorName} untuk program \"{$programTitle}\".",
            'url' => route('admin.donations.index', ['search' => $this->donation->donation_code]),
            'category' => 'donation',
            'icon' => 'heart',
            'id_reference' => $this->donation->id,
        ];
    }
}
