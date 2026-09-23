<?php

namespace App\Notifications;

use App\Models\CampaignerProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CampaignerStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public CampaignerProfile $campaigner,
        public string $status,
        public ?string $notes = null
    ) {}

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
        if ($this->status === 'verified') {
            $title = 'Profil Campaigner Terverifikasi';
            $message = 'Selamat! Akun Anda telah resmi terverifikasi sebagai Campaigner. Anda sekarang dapat membuat program donasi dan menggalang dana.';
        } elseif ($this->status === 'rejected') {
            $title = 'Verifikasi Campaigner Belum Disetujui';
            $notesText = $this->notes ? " Catatan: {$this->notes}" : ' Silakan periksa kembali kelengkapan dokumen Anda.';
            $message = "Pengajuan verifikasi akun Campaigner Anda belum disetujui.{$notesText}";
        } else {
            $title = 'Status Campaigner Diperbarui';
            $message = "Status akun Campaigner Anda telah diperbarui menjadi {$this->status}.";
        }

        return [
            'title' => $title,
            'message' => $message,
            'url' => route('campaigner.status'),
            'category' => 'campaigner',
            'icon' => 'user-check',
            'id_reference' => $this->campaigner->id,
            'status' => $this->status,
        ];
    }
}
