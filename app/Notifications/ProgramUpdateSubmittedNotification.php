<?php

namespace App\Notifications;

use App\Models\Program;
use App\Models\ProgramUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class ProgramUpdateSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Program $program,
        public ProgramUpdate $update
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
        $programTitle = $this->program->getTranslation('title', 'id')
            ?: (is_string($this->program->title) ? $this->program->title : 'Program Kebaikan');

        $updateTitle = $this->update->getTranslation('title', 'id')
            ?: (is_string($this->update->title) ? $this->update->title : 'Kabar Terbaru');

        $creatorName = $this->program->creator?->name
            ?? $this->program->campaignerProfile?->nama_lembaga
            ?? 'Campaigner';

        $rawContent = $this->update->getTranslation('content', 'id')
            ?: (is_string($this->update->content) ? $this->update->content : '');
        $snippet = Str::limit(strip_tags($rawContent), 160);

        $replyToEmail = config('mail.reply_to.address', 'sapa@insani.id');
        $replyToName = config('mail.reply_to.name', 'Layanan Sahabat Insani');

        return (new MailMessage)
            ->replyTo($replyToEmail, $replyToName)
            ->subject("[Insani] Peninjauan Kabar Program Baru - {$programTitle}")
            ->greeting('Assalamu’alaikum Warahmatullahi Wabarakatuh, Tim Insani.')
            ->line("Mitra **{$creatorName}** telah mengajukan laporan kabar program baru yang memerlukan peninjauan dan moderasi sebelum dipublikasikan kepada donatur.")
            ->line("• **Program**: \"{$programTitle}\"")
            ->line("• **Judul Kabar**: \"{$updateTitle}\"")
            ->when($snippet, fn (MailMessage $m) => $m->line("• **Cuplikan**: \"{$snippet}\""))
            ->action('Tinjau & Moderasi Kabar', route('admin.programs.updates.index', $this->program->id))
            ->line('Silakan periksa kelayakan narasi, dokumentasi foto, dan transparansi penyaluran sebelum memberikan persetujuan.')
            ->salutation("Wassalamu’alaikum Warahmatullahi Wabarakatuh,\n**Tim Insani Indonesia**");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $programTitle = $this->program->getTranslation('title', 'id')
            ?: (is_string($this->program->title) ? $this->program->title : 'Program');

        $updateTitle = $this->update->getTranslation('title', 'id')
            ?: (is_string($this->update->title) ? $this->update->title : 'Kabar Terbaru');

        $creatorName = $this->program->creator?->name
            ?? $this->program->campaignerProfile?->nama_lembaga
            ?? 'Campaigner';

        return [
            'title' => 'Laporan Kabar Program Baru',
            'message' => "Campaigner {$creatorName} mengajukan kabar terbaru \"{$updateTitle}\" untuk program \"{$programTitle}\" dan menunggu peninjauan.",
            'url' => route('admin.programs.updates.index', $this->program->id),
            'category' => 'program',
            'icon' => 'sparkles',
            'id_reference' => $this->update->id,
            'program_id' => $this->program->id,
        ];
    }
}
