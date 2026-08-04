<?php

namespace App\Observers;

use App\Mail\DonationSuccessNotification;
use App\Models\Comment;
use App\Models\Donation;
use App\Models\NotificationLog;
use App\Models\Payment;
use App\Services\NotificationGatewayService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentObserver
{
    /**
     * Handle the Payment "created" event.
     */
    public function created(Payment $payment): void
    {
        //
    }

    public function updated(Payment $payment): void
    {
        if (! $payment->isDirty('gateway_status')) {
            return;
        }

        $gatewayStatus = strtoupper($payment->gateway_status);
        $donation = $payment->donation;

        if (! $donation) {
            return;
        }

        if ($gatewayStatus === 'PAID' && $donation->status !== 'paid') {
            $donation->update([
                'status' => 'paid',
                'paid_at' => $payment->paid_at ?? now(),
            ]);

            // Copy donation message to comments table if it exists
            if (! empty($donation->message)) {
                Comment::create([
                    'program_id' => $donation->program_id,
                    'donation_id' => $donation->id,
                    'user_id' => $donation->donor_user_id,
                    'name' => $donation->is_anonymous ? 'Hamba Allah' : $donation->donor_name,
                    'body' => $donation->message,
                    'is_hidden' => false,
                ]);
            }

            // Recalculate program's collected amount
            $program = $donation->program;
            if ($program) {
                $totalCollected = Donation::where('program_id', $program->id)
                    ->where('status', 'paid')
                    ->sum('amount');

                $program->update(['collected_amount' => $totalCollected]);
            }

            // Send Email Notification
            try {
                Mail::to($donation->donor_email)->send(new DonationSuccessNotification($donation));

                NotificationLog::create([
                    'notifiable_type' => Donation::class,
                    'notifiable_id' => $donation->id,
                    'channel' => 'email',
                    'recipient' => $donation->donor_email,
                    'message' => 'Donation Success Email Sent',
                    'status' => 'sent',
                    'provider' => 'smtp',
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send donation success email: '.$e->getMessage());
            }

            // Send WhatsApp Notification
            try {
                $waService = app(NotificationGatewayService::class);
                $waService->sendDonationConfirmation($donation);

                if ($donation->donor_phone) {
                    NotificationLog::create([
                        'notifiable_type' => Donation::class,
                        'notifiable_id' => $donation->id,
                        'channel' => 'whatsapp',
                        'recipient' => $donation->donor_phone,
                        'message' => 'Donation Success WhatsApp Sent',
                        'status' => 'sent',
                        'provider' => 'mock_wablas',
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send donation success whatsapp: '.$e->getMessage());
            }
        }

        if (in_array($gatewayStatus, ['EXPIRED', 'FAILED'])) {
            $statusMap = [
                'EXPIRED' => 'expired',
                'FAILED' => 'failed',
            ];

            if ($donation->status === 'pending') {
                $donation->update([
                    'status' => $statusMap[$gatewayStatus],
                ]);

                Log::info("Donation {$donation->donation_code} marked as {$statusMap[$gatewayStatus]} via webhook.");
            }
        }
    }

    /**
     * Handle the Payment "deleted" event.
     */
    public function deleted(Payment $payment): void
    {
        //
    }

    /**
     * Handle the Payment "restored" event.
     */
    public function restored(Payment $payment): void
    {
        //
    }

    /**
     * Handle the Payment "force deleted" event.
     */
    public function forceDeleted(Payment $payment): void
    {
        //
    }
}
