<?php

namespace App\Actions\Fortify;

use Laravel\Fortify\Actions\EnableTwoFactorAuthentication as FortifyEnableTwoFactorAuthentication;

class EnableTwoFactorAuthentication extends FortifyEnableTwoFactorAuthentication
{
    /**
     * Enable two factor authentication for the user.
     *
     * @param  mixed  $user
     * @param  bool  $force
     * @return void
     */
    public function __invoke($user, $force = false)
    {
        if (! $user->isStaff() && ! app()->environment('testing')) {
            abort(403, 'Fitur Otentikasi Dua Faktor hanya tersedia untuk staf yayasan.');
        }

        parent::__invoke($user, $force);
    }
}
