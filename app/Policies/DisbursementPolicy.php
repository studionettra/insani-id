<?php

namespace App\Policies;

use App\Models\Disbursement;
use App\Models\Program;
use App\Models\User;

class DisbursementPolicy
{
    /**
     * Determine whether the user can view any disbursements.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('disbursement.view') || $user->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga']);
    }

    /**
     * Determine whether the user can view the disbursement.
     */
    public function view(User $user, Disbursement $disbursement): bool
    {
        if ($user->can('disbursement.view')) {
            return true;
        }

        return $disbursement->program
            && $disbursement->program->campaigner_type !== 'internal'
            && $disbursement->program->campaigner_profile_id === $user->campaignerProfile?->id;
    }

    /**
     * Determine whether the user can create a disbursement for a program.
     */
    public function create(User $user, ?Program $program = null): bool
    {
        if ($user->can('disbursement.create')) {
            return true;
        }

        if (! $program) {
            return $user->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga']);
        }

        return $program->campaigner_type !== 'internal'
            && $program->campaigner_profile_id === $user->campaignerProfile?->id;
    }

    /**
     * Determine whether the user can approve or reject the disbursement.
     */
    public function approve(User $user, Disbursement $disbursement): bool
    {
        return $user->can('disbursement.approve');
    }

    /**
     * Determine whether the user can transfer funds for the disbursement.
     */
    public function transfer(User $user, Disbursement $disbursement): bool
    {
        return $user->hasAnyRole(['Administrator', 'Keuangan']);
    }
}
