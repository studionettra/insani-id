<?php

namespace App\Jobs;

use App\Mail\DonationSuccessNotification;
use App\Mail\NewDonationNotification;
use App\Models\Donation;
use App\Models\NotificationLog;
use App\Models\User;
use App\Notifications\DonationConfirmedNotification;
use App\Notifications\DonationReceivedNotification;
use App\Services\NotificationGatewayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class SendDonationPaidNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $donation;

    /**
     * Create a new job instance.
     */
    public function __construct(Donation $donation)
    {
        $this->donation = $donation;
    }

    /**
     * Execute the job.
     */
    public function handle(NotificationGatewayService $waService): void
    {
        $donation = $this->donation->loadMissing(['program.creator', 'program.campaignerProfile', 'donor']);

        // 1. Send Email to Donor
        if ($donation->donor_email) {
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
                Log::error("Failed to send donation success email to {$donation->donor_email}: ".$e->getMessage());
            }
        }

        // 2. Send WhatsApp to Donor
        if ($donation->donor_phone) {
            try {
                $waService->sendDonationConfirmation($donation);

                NotificationLog::create([
                    'notifiable_type' => Donation::class,
                    'notifiable_id' => $donation->id,
                    'channel' => 'whatsapp',
                    'recipient' => $donation->donor_phone,
                    'message' => 'Donation Success WhatsApp Sent',
                    'status' => 'sent',
                    'provider' => config('services.whatsapp.provider', 'fonnte'),
                ]);
            } catch (\Exception $e) {
                Log::error("Failed to send donation success whatsapp to {$donation->donor_phone}: ".$e->getMessage());
            }
        }

        // 3. Send Notification to Campaigner (Program Creator)
        $creator = $donation->program?->creator;
        if ($creator && $creator->email && $donation->program->campaigner_type !== 'internal') {
            try {
                Mail::to($creator->email)->send(new NewDonationNotification($donation));
            } catch (\Exception $e) {
                Log::error("Failed to send new donation alert email to campaigner {$creator->email}: ".$e->getMessage());
            }

            try {
                $waService->sendNewDonationAlertToCampaigner($donation);
            } catch (\Exception $e) {
                Log::error('Failed to send new donation alert whatsapp to campaigner: '.$e->getMessage());
            }
        }

        // 4. Send Database Notification to Finance, Admin, & Campaigner
        $staffRecipients = rescue(fn () => User::permission('donation.view')->get(), collect(), false);
        if ($staffRecipients->isEmpty()) {
            $staffRecipients = rescue(fn () => User::role('Administrator')->get(), collect(), false);
        }
        if ($creator && $donation->program && $donation->program->campaigner_type !== 'internal') {
            $staffRecipients->push($creator);
        }
        if ($staffRecipients->isNotEmpty()) {
            Notification::send($staffRecipients->unique('id'), new DonationReceivedNotification($donation));
        }

        // 5. Send Database Notification to Registered Donor (if logged in during donation)
        if ($donation->donor_user_id && $donation->donor) {
            rescue(fn () => $donation->donor->notify(new DonationConfirmedNotification($donation)));
        }
    }
}
