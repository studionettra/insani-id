<?php

namespace App\Observers;

use App\Jobs\SendDonationPaidNotification;
use App\Jobs\SendMetaCapiPurchaseEvent;
use App\Models\Comment;
use App\Models\Donation;
use App\Models\Fundraiser;
use App\Models\Payment;
use App\Models\Program;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        if (in_array($gatewayStatus, ['PAID', 'SETTLED', 'SETTLEMENT', 'CAPTURE'])) {
            $isNewlyPaid = ($donation->status !== 'paid');

            DB::transaction(function () use ($donation, $payment, $isNewlyPaid) {
                if ($isNewlyPaid) {
                    $donation->update([
                        'status' => 'paid',
                        'paid_at' => $payment->paid_at ?? now(),
                    ]);

                    // Record donor in comments table so they appear in Tab Donatur
                    Comment::firstOrCreate(
                        ['donation_id' => $donation->id],
                        [
                            'program_id' => $donation->program_id,
                            'user_id' => $donation->donor_user_id,
                            'name' => $donation->is_anonymous ? 'Inisiator Kebaikan' : $donation->donor_name,
                            'body' => ! empty($donation->message) ? $donation->message : '',
                            'is_hidden' => false,
                        ]
                    );

                    // Recalculate program's collected amount using indexed lookup without pessimistic row locks
                    $totalCollected = Donation::where('program_id', $donation->program_id)
                        ->where('status', 'paid')
                        ->sum('amount');

                    $program = Program::whereKey($donation->program_id)->first();
                    if ($program) {
                        $updates = ['collected_amount' => $totalCollected];

                        // Check if program reached its target amount (only if not continuous)
                        if (! $program->is_continuous && $program->target_amount && $totalCollected >= $program->target_amount && $program->status === 'published') {
                            $updates['status'] = 'completed';
                        }

                        $program->update($updates);
                    }

                    // Recalculate fundraiser's collected amount and donors count if referred
                    if ($donation->fundraiser_id) {
                        $fundraiser = Fundraiser::whereKey($donation->fundraiser_id)->first();
                        if ($fundraiser) {
                            $fundraiserCollected = Donation::where('fundraiser_id', $fundraiser->id)
                                ->where('status', 'paid')
                                ->sum('amount');
                            $fundraiserDonors = Donation::where('fundraiser_id', $fundraiser->id)
                                ->where('status', 'paid')
                                ->count();

                            $fundraiser->update([
                                'collected_amount' => $fundraiserCollected,
                                'donors_count' => $fundraiserDonors,
                            ]);
                        }
                    }
                }
            });

            if ($isNewlyPaid) {
                // Dispatch notification job to queue after the transaction commits
                SendDonationPaidNotification::dispatch($donation)->afterCommit();

                // Dispatch Meta Conversions API (CAPI) server event if configured
                SendMetaCapiPurchaseEvent::dispatch($donation)->afterCommit();
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
