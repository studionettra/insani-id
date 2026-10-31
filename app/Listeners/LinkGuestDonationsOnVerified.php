<?php

namespace App\Listeners;

use App\Models\Donation;
use App\Models\User;
use Illuminate\Auth\Events\Verified;

class LinkGuestDonationsOnVerified
{
    /**
     * Handle the event.
     */
    public function handle(Verified $event): void
    {
        $user = $event->user;

        if ($user instanceof User && ! empty($user->email)) {
            Donation::where('donor_email', $user->email)
                ->whereNull('donor_user_id')
                ->update(['donor_user_id' => $user->id]);
        }
    }
}

