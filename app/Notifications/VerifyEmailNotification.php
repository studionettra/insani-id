<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends BaseVerifyEmail
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Konfirmasi Alamat Email - ' . config('app.name'))
            ->greeting('Halo, ' . ($notifiable->name ?? 'Sahabat Kebaikan') . '!')
            ->line('Terima kasih telah bergabung dengan ' . config('app.name') . '. Mohon klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda sepenuhnya.')
            ->action('Verifikasi Email', $verificationUrl)
            ->line('Jika Anda tidak merasa mendaftar di situs kami, Anda dapat mengabaikan email ini dengan aman.')
            ->salutation("Salam hangat,\nTim " . config('app.name'));
    }
}
