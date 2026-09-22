<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseResetPassword
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        $resetUrl = $this->resetUrl($notifiable);
        $expireMinutes = config('auth.passwords.'.config('auth.defaults.passwords', 'users').'.expire', 60);

        return (new MailMessage)
            ->subject('Permintaan Atur Ulang Kata Sandi - Insani Indonesia')
            ->greeting('Halo, '.($notifiable->name ?? 'Sahabat Kebaikan').'!')
            ->line('Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di Insani Indonesia.')
            ->action('Atur Ulang Kata Sandi', $resetUrl)
            ->line("Tautan atur ulang kata sandi ini hanya berlaku selama {$expireMinutes} menit demi keamanan akun Anda.")
            ->line('Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Kata sandi akun Anda tetap aman dan tidak ada perubahan apa pun yang dilakukan.')
            ->salutation("Salam hangat,\nTim Insani Indonesia");
    }
}
