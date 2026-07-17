<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class NotificationGatewayService
{
    /**
     * Send a WhatsApp message.
     * Currently implemented as a mock that logs the message.
     *
     * @param string $phoneNumber
     * @param string $message
     * @return bool
     */
    public function sendWhatsApp(string $phoneNumber, string $message): bool
    {
        // TODO: Implement actual Fonnte/Wablas API integration here
        // using config('services.whatsapp.endpoint') and config('services.whatsapp.token')

        Log::info("WhatsApp Message Mock", [
            'to' => $phoneNumber,
            'message' => $message,
            'status' => 'success'
        ]);

        return true;
    }

    /**
     * Send Donation Confirmation Notification.
     * 
     * @param mixed $donation
     * @return void
     */
    public function sendDonationConfirmation($donation)
    {
        if (!$donation->donor_phone) {
            return;
        }

        $amount = number_format($donation->amount, 0, ',', '.');
        $message = "Terima kasih!\nDonasi Anda sebesar Rp {$amount} telah berhasil kami terima.\n\nSemoga berkah.";
        
        $this->sendWhatsApp($donation->donor_phone, $message);
    }
}
