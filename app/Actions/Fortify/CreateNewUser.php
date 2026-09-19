<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Donation;
use App\Models\User;
use App\Rules\TurnstileRule;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Spatie\Permission\Models\Role;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'cf-turnstile-response' => ['required', 'string', new TurnstileRule],
        ], [
            'cf-turnstile-response.required' => 'Mohon selesaikan verifikasi keamanan (Captcha).',
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'] ?? null,
            'password' => $input['password'],
        ]);

        if (class_exists(Role::class) && Role::where('name', 'Donatur')->exists()) {
            $user->assignRole('Donatur');
        }

        // Link previous guest donations with matching email
        Donation::where('donor_email', $user->email)
            ->whereNull('donor_user_id')
            ->update(['donor_user_id' => $user->id]);

        return $user;
    }
}
