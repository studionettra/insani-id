<?php

namespace App\Policies;

use App\Models\Donation;
use App\Models\User;

class DonationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('donation.view') || $user->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Donation $donation): bool
    {
        if ($user->can('donation.view')) {
            return true;
        }

        if ($donation->donor_user_id === $user->id) {
            return true;
        }

        if ($donation->program && $donation->program->campaigner_type !== 'internal') {
            return $user->campaignerProfile?->id === $donation->program->campaigner_profile_id;
        }

        return false;
    }

    /**
     * Determine whether the user can confirm a manual donation.
     */
    public function confirm(User $user, Donation $donation): bool
    {
        return $user->can('donation.confirm-manual');
    }

    /**
     * Determine whether the user can refund the donation.
     */
    public function refund(User $user, Donation $donation): bool
    {
        return $user->can('donation.refund');
    }
}
