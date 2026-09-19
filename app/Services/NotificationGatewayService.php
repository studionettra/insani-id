<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationGatewayService
{
    /**
     * Send a WhatsApp message via Fonnte or fallback mock in test/local.
     */
    public function sendWhatsApp(string $phoneNumber, string $message): bool
    {
        $provider = config('services.whatsapp.provider', 'fonnte');
        $token = config('services.whatsapp.token');
        $endpoint = config('services.whatsapp.endpoint', 'https://api.fonnte.com/send');

        // Normalize Indonesian phone number (e.g. 0812... -> 62812...)
        $phone = preg_replace('/[^0-9]/', '', $phoneNumber);
        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        // Fallback to mock logging if in test/local or if token is not configured
        if ($provider === 'mock' || empty($token) || app()->environment(['local', 'testing'])) {
            Log::info('WhatsApp Message (Mock/Local)', [
                'to' => $phone,
                'message' => $message,
                'status' => 'success',
            ]);

            return true;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->asForm()->post($endpoint, [
                'target' => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp Message Sent successfully to {$phone}");

                return true;
            }

            Log::error("Failed to send WhatsApp message via Fonnte to {$phone}: ".$response->body());

            return false;
        } catch (\Exception $e) {
            Log::error("Exception sending WhatsApp message to {$phone}: ".$e->getMessage());

            return false;
        }
    }

    /**
     * Send Donation Confirmation Notification to Donor.
     *
     * @param  mixed  $donation
     */
    public function sendDonationConfirmation($donation): void
    {
        if (! $donation->donor_phone) {
            return;
        }

        $amount = number_format($donation->amount, 0, ',', '.');
        $programTitle = $donation->program?->title ?? 'Program Kebaikan';
        $message = "Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak {$donation->donor_name}.\n\n".
                   "Alhamdulillah, donasi Anda sebesar *Rp {$amount}* untuk program *{$programTitle}* telah berhasil kami terima.\n\n".
                   "Kode Donasi: {$donation->donation_code}\n\n".
                   "Terima kasih atas kebaikan dan kepedulian Anda. Semoga Allah SWT membalas dengan keberkahan yang berlipat ganda. Aamiin.\n\n".
                   '— Insani Indonesia (insani.id)';

        $this->sendWhatsApp($donation->donor_phone, $message);
    }

    /**
     * Send alert to Campaigner when their program receives a new donation.
     *
     * @param  mixed  $donation
     */
    public function sendNewDonationAlertToCampaigner($donation): void
    {
        $creator = $donation->program?->creator;
        $phone = $creator?->phone ?? $donation->program?->campaignerProfile?->pic_phone;

        if (! $phone) {
            return;
        }

        $amount = number_format($donation->amount, 0, ',', '.');
        $donorName = $donation->is_anonymous ? 'Hamba Allah' : $donation->donor_name;
        $programTitle = $donation->program?->title ?? 'Program Anda';

        $message = "Kabar Baik dari Insani Indonesia!\n\n".
                   "Program Anda *{$programTitle}* baru saja menerima donasi baru sebesar *Rp {$amount}* dari *{$donorName}*.\n\n".
                   "Total dana terkumpul dapat Anda pantau melalui dashboard campaigner.\n\n".
                   '— Insani Indonesia (insani.id)';

        $this->sendWhatsApp($phone, $message);
    }

    /**
     * Send verification result to Campaigner (verified or rejected).
     *
     * @param  mixed  $campaignerProfile
     */
    public function sendCampaignerVerificationResult($campaignerProfile, string $status, ?string $notes = null): void
    {
        $phone = $campaignerProfile->pic_phone ?? $campaignerProfile->user?->phone;
        if (! $phone) {
            return;
        }

        $name = $campaignerProfile->type === 'lembaga'
            ? $campaignerProfile->institution_name
            : ($campaignerProfile->user?->name ?? 'Sahabat Insani');

        if ($status === 'verified') {
            $message = "Assalamu'alaikum, {$name}.\n\n".
                       "Selamat! Pengajuan verifikasi akun Campaigner Anda di *Insani Indonesia* telah *DISETUJUI*.\n\n".
                       "Sekarang Anda sudah dapat membuat dan mempublikasikan program galang dana kebaikan di platform kami.\n\n".
                       "Silakan login ke https://insani.id/login untuk memulai.\n\n".
                       '— Tim Verifikasi Insani Indonesia';
        } elseif ($status === 'rejected') {
            $reason = $notes ?: 'Dokumen pendukung belum memenuhi syarat verifikasi.';
            $message = "Assalamu'alaikum, {$name}.\n\n".
                       "Mohon maaf, pengajuan verifikasi akun Campaigner Anda di *Insani Indonesia* saat ini *BELUM DAPAT DISETUJUI*.\n\n".
                       "Catatan Verifikator:\n\"{$reason}\"\n\n".
                       "Anda dapat memperbarui dokumen Anda dan mengajukan kembali melalui dashboard.\n\n".
                       '— Tim Verifikasi Insani Indonesia';
        } else {
            return;
        }

        $this->sendWhatsApp($phone, $message);
    }

    /**
     * Send post-disbursement update reminder to Campaigner.
     *
     * @param  mixed  $program
     * @param  int  $day  (7, 14, 21)
     */
    public function sendDisbursementReminder($program, int $day): void
    {
        $creator = $program->creator;
        $phone = $creator?->phone ?? $program->campaignerProfile?->pic_phone;

        if (! $phone) {
            return;
        }

        $message = "Pemberitahuan Pengingat Laporan Program (Hari ke-{$day})\n\n".
                   "Halo {$creator->name}, dana untuk program *{$program->title}* telah dicairkan {$day} hari yang lalu.\n\n".
                   "Sebagai bentuk amanah dan transparansi kepada para donatur, kami mohon untuk memposting 'Kabar Terbaru / Laporan Penyaluran' melalui menu dashboard program Anda.\n\n".
                   "Terima kasih atas dedikasi Anda dalam menebar kebaikan.\n\n".
                   '— Tim Program Insani Indonesia';

        $this->sendWhatsApp($phone, $message);
    }
}
