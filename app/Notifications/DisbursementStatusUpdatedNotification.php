<?php

namespace App\Notifications;

use App\Models\Disbursement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DisbursementStatusUpdatedNotification extends Notification implements ShouldQueue
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
        $programTitle = $this->disbursement->program?->getTranslation('title', 'id')
            ?: (is_string($this->disbursement->program?->title) ? $this->disbursement->program?->title : 'Program');
        $amount = $this->disbursement->requested_amount ?? $this->disbursement->amount ?? 0;
        $formattedAmount = 'Rp '.number_format((float) $amount, 0, ',', '.');
        $status = $this->disbursement->status;

        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        $mail = (new MailMessage)->replyTo($replyToEmail, $replyToName);
        $url = route('akun.programs.disbursements.index', $this->disbursement->program_id);

        if ($status === 'transferred') {
            $requested = 'Rp '.number_format((float) $this->disbursement->requested_amount, 0, ',', '.');
            $platformFee = 'Rp '.number_format((float) $this->disbursement->platform_fee_amount, 0, ',', '.');
            $bankFee = 'Rp '.number_format((float) ($this->disbursement->bank_fee ?? 2500), 0, ',', '.');
            $nett = 'Rp '.number_format((float) $this->disbursement->nett_amount, 0, ',', '.');
            $receiptNo = $this->disbursement->receipt_number ?? "KW-DISB-{$this->disbursement->id}";

            $mail
                ->subject("[Insani] Alhamdulillah! Dana Pencairan Telah Ditransfer ({$receiptNo}) - {$programTitle}")
                ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
                ->line("Alhamdulillah, permohonan pencairan dana untuk program **\"{$programTitle}\"** telah berhasil ditransfer oleh tim Keuangan Insani Indonesia.")
                ->line("• **Nomor Kuitansi**: **{$receiptNo}**")
                ->line("• **Nominal Pengajuan**: {$requested}")
                ->line("• **Biaya Operasional Platform (5%)**: -{$platformFee}")
                ->line("• **Biaya Admin Bank (BI-Fast)**: -{$bankFee}")
                ->line("• **Total Bersih yang Ditransfer**: **{$nett}**")
                ->line("• **Bank Penerima**: {$this->disbursement->bank_name} ({$this->disbursement->bank_account_number} a.n. {$this->disbursement->bank_account_name})")
                ->line('Bukti transfer asli perbankan telah kami lampirkan bersama email ini.')
                ->action('Lihat Kuitansi & Rincian di Dashboard', $url)
                ->line('Sebagai bentuk amanah kepada para donatur, kami mohon untuk memposting Kabar Terbaru / Laporan Penyaluran secara berkala setelah dana disalurkan kepada penerima manfaat.')
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");

            if (! empty($this->disbursement->transfer_proof)) {
                $ext = pathinfo($this->disbursement->transfer_proof, PATHINFO_EXTENSION) ?: 'jpg';
                $mail->attachFromStorageDisk('public', $this->disbursement->transfer_proof, "Bukti_Transfer_{$receiptNo}.{$ext}");
            }

            return $mail;
        }

        if ($status === 'approved') {
            return $mail
                ->subject("[Insani] Pengajuan Pencairan Dana Disetujui - {$programTitle}")
                ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
                ->line("Pengajuan pencairan dana sebesar **{$formattedAmount}** untuk program **\"{$programTitle}\"** telah **disetujui** oleh tim Keuangan Insani.")
                ->line('Saat ini dana sedang dalam proses antrean transfer ke rekening bank terdaftar Anda. Anda akan menerima notifikasi kembali segera setelah bukti transfer diunggah.')
                ->action('Pantau Status Pencairan', $url)
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
        }

        if ($status === 'rejected') {
            $reason = $this->disbursement->rejection_reason ?: 'Terdapat berkas atau data permohonan yang belum memenuhi ketentuan penyaluran.';

            return $mail
                ->subject("[Insani] Pemberitahuan Pengajuan Pencairan Dana - {$programTitle}")
                ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
                ->line("Mohon maaf, pengajuan pencairan dana sebesar **{$formattedAmount}** untuk program **\"{$programTitle}\"** saat ini **belum dapat disetujui**.")
                ->line("• **Alasan Verifikator**: \"{$reason}\"")
                ->line('Silakan periksa kembali data pengajuan Anda melalui dashboard dan lakukan perbaikan permohonan bila diperlukan.')
                ->action('Periksa Detail Pengajuan', $url)
                ->line('Jika memerlukan klarifikasi lebih lanjut, silakan balas email ini untuk menghubungi tim Keuangan Insani.')
                ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
        }

        return $mail
            ->subject("[Insani] Status Pencairan Dana Diperbarui - {$programTitle}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Sahabat Insani.')
            ->line("Status permohonan pencairan dana untuk program **\"{$programTitle}\"** telah diperbarui menjadi **{$status}**.")
            ->action('Lihat Riwayat Pencairan', $url)
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
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
