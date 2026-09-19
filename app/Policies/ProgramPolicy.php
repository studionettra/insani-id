<?php

namespace App\Policies;

use App\Models\Program;
use App\Models\User;

class ProgramPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('program.view') || $user->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Program $program): bool
    {
        if ($program->status === 'published') {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->can('program.view')) {
            return true;
        }

        return $program->campaigner_type !== 'internal'
            && $user->campaignerProfile?->id === $program->campaigner_profile_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('program.create') || $user->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Program $program): bool
    {
        if ($user->can('program.update')) {
            return true;
        }

        if ($user->can('program.update-own') && $program->campaigner_type !== 'internal') {
            return $user->campaignerProfile?->id === $program->campaigner_profile_id;
        }

        return false;
    }

    /**
     * Determine whether the user can publish the model.
     */
    public function publish(User $user, Program $program): bool
    {
        return $user->can('program.publish');
    }

    /**
     * Determine whether the user can reject the model.
     */
    public function reject(User $user, Program $program): bool
    {
        return $user->can('program.reject');
    }

    /**
     * Determine whether the user can close the program.
     */
    public function close(User $user, Program $program): bool
    {
        return $user->can('program.close');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Program $program): bool
    {
        return $user->hasRole('Administrator');
    }
}
