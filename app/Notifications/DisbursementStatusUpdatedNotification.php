<?php

namespace App\Notifications;

use App\Models\Disbursement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DisbursementStatusUpdatedNotification extends Notification
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
        $programTitle = $this->disbursement->program?->getTranslation('title', 'id')
            ?: (is_string($this->disbursement->program?->title) ? $this->disbursement->program?->title : 'Program');
        $amount = $this->disbursement->requested_amount ?? $this->disbursement->amount ?? 0;
        $formattedAmount = number_format((float) $amount, 0, ',', '.');
        $status = $this->disbursement->status;

        if ($status === 'approved') {
            $title = 'Pencairan Dana Disetujui';
            $message = "Pengajuan pencairan dana Rp {$formattedAmount} untuk program \"{$programTitle}\" telah disetujui dan menunggu transfer.";
        } elseif ($status === 'transferred') {
            $title = 'Dana Pencairan Telah Ditransfer';
            $message = "Dana pencairan Rp {$formattedAmount} untuk program \"{$programTitle}\" telah berhasil ditransfer ke rekening bank.";
        } elseif ($status === 'rejected') {
            $title = 'Pengajuan Pencairan Ditolak';
            $reason = $this->disbursement->rejection_reason ? " Alasan: {$this->disbursement->rejection_reason}" : '';
            $message = "Pengajuan pencairan dana Rp {$formattedAmount} untuk program \"{$programTitle}\" belum disetujui.{$reason}";
        } else {
            $title = 'Status Pencairan Diperbarui';
            $message = "Status pencairan dana untuk program \"{$programTitle}\" telah diperbarui menjadi {$status}.";
        }

        return [
            'title' => $title,
            'message' => $message,
            'url' => route('akun.programs.disbursements.index', $this->disbursement->program_id),
            'category' => 'disbursement',
            'icon' => 'credit-card',
            'id_reference' => $this->disbursement->id,
            'status' => $status,
        ];
    }
}
