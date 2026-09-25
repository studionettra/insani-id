<?php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProgramSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Program $program) {}

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
        $creatorName = $this->program->creator?->name
            ?? $this->program->campaignerProfile?->nama_lembaga
            ?? 'Campaigner';
        $title = $this->program->getTranslation('title', 'id')
            ?: (is_string($this->program->title) ? $this->program->title : 'Program Kebaikan');
        $target = $this->program->target_amount ? 'Rp '.number_format((float) $this->program->target_amount, 0, ',', '.') : 'Open Target';

        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        return (new MailMessage)
            ->replyTo($replyToEmail, $replyToName)
            ->subject("[Insani] Pengajuan Program Galang Dana Baru - {$title}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Tim Kurasi.')
            ->line("Terdapat draf program galang dana kebaikan baru yang diajukan oleh mitra **{$creatorName}** dan menunggu kurasi.")
            ->line("• **Judul Program**: \"{$title}\"")
            ->line("• **Target Donasi**: {$target}")
            ->line('• **Kategori**: '.($this->program->category?->name ?? 'Umum'))
            ->action('Kurasi & Tinjau Program', route('admin.programs.index', ['search' => $title]))
            ->line('Silakan periksa kelayakan narasi, foto dokumentasi, dan target penerima manfaat sebelum mempublikasikan program ini.')
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $creatorName = $this->program->creator?->name ?? 'Campaigner';
        $title = $this->program->getTranslation('title', 'id') ?: (is_string($this->program->title) ? $this->program->title : 'Program');

        return [
            'title' => 'Pengajuan Program Baru',
            'message' => "Campaigner {$creatorName} mengajukan program \"{$title}\" untuk diverifikasi.",
            'url' => route('admin.programs.index', ['search' => $title]),
            'category' => 'program',
            'icon' => 'sparkles',
            'id_reference' => $this->program->id,
        ];
    }
}
