<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'phone', 'password', 'is_active', 'last_login_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, LogsActivity, Notifiable, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function campaignerProfile()
    {
        return $this->hasOne(CampaignerProfile::class);
    }

    public function createdPrograms()
    {
        return $this->hasMany(Program::class, 'created_by');
    }

    public function verifiedPrograms()
    {
        return $this->hasMany(Program::class, 'verified_by');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class, 'donor_user_id');
    }

    public function fundraisers()
    {
        return $this->hasMany(Fundraiser::class);
    }

    public function referredDonations()
    {
        return $this->hasMany(Donation::class, 'fundraiser_user_id');
    }

    public function sendPasswordResetNotification($token): void
    {
        // Do not send reset email if user is deactivated
        if (isset($this->is_active) && ! $this->is_active) {
            return;
        }

        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Send the email verification notification.
     */
    public function sendEmailVerificationNotification(): void
    {
        // Do not send if user is deactivated
        if (isset($this->is_active) && ! $this->is_active) {
            return;
        }

        $this->notify(new \App\Notifications\VerifyEmailNotification);
    }
}
