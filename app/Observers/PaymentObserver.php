<?php

namespace App\Observers;

use App\Models\Payment;

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
        if ($payment->isDirty('gateway_status') && strtoupper($payment->gateway_status) === 'PAID') {
            $donation = $payment->donation;

            if ($donation && $donation->status !== 'paid') {
                $donation->update([
                    'status' => 'paid',
                    'paid_at' => $payment->paid_at ?? now()
                ]);

                // Copy donation message to comments table if it exists
                if (!empty($donation->message)) {
                    \App\Models\Comment::create([
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
                    $totalCollected = \App\Models\Donation::where('program_id', $program->id)
                        ->where('status', 'paid')
                        ->sum('amount');
                        
                    $program->update(['collected_amount' => $totalCollected]);
                }

                // Send Email Notification
                try {
                    \Illuminate\Support\Facades\Mail::to($donation->donor_email)->send(new \App\Mail\DonationSuccessNotification($donation));
                    
                    \App\Models\NotificationLog::create([
                        'notifiable_type' => \App\Models\Donation::class,
                        'notifiable_id' => $donation->id,
                        'channel' => 'email',
                        'recipient' => $donation->donor_email,
                        'message' => 'Donation Success Email Sent',
                        'status' => 'sent',
                        'provider' => 'smtp'
                    ]);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send donation success email: ' . $e->getMessage());
                }

                // Send WhatsApp Notification
                try {
                    $waService = app(\App\Services\NotificationGatewayService::class);
                    $waService->sendDonationConfirmation($donation);

                    if ($donation->donor_phone) {
                        \App\Models\NotificationLog::create([
                            'notifiable_type' => \App\Models\Donation::class,
                            'notifiable_id' => $donation->id,
                            'channel' => 'whatsapp',
                            'recipient' => $donation->donor_phone,
                            'message' => 'Donation Success WhatsApp Sent',
                            'status' => 'sent',
                            'provider' => 'mock_wablas'
                        ]);
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send donation success whatsapp: ' . $e->getMessage());
                }
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
