<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CampaignerProfile extends Model
{
    use LogsActivity;

    protected $fillable = [
        'user_id',
        'type',
        'verification_status',
        'max_campaign_slots',
        'nama_lembaga',
        'nomor_sk',
        'npwp',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'address',
        'phone',
    ];

    protected $casts = [
        'max_campaign_slots' => 'integer',
    ];

    protected $appends = [
        'institution_name',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $profile): void {
            if (empty($profile->max_campaign_slots)) {
                $profile->max_campaign_slots = $profile->type === 'lembaga' ? 3 : 1;
            }
        });
    }

    public function getInstitutionNameAttribute(): ?string
    {
        return $this->nama_lembaga;
    }

    public function getActiveProgramsCountAttribute(): int
    {
        return Program::query()
            ->where(function ($query): void {
                $query->where('campaigner_profile_id', $this->id)
                    ->orWhere('created_by', $this->user_id);
            })
            ->whereIn('status', ['published', 'pending_verification'])
            ->count();
    }

    public function getRemainingSlotsAttribute(): int
    {
        return max(0, ($this->max_campaign_slots ?? 1) - $this->active_programs_count);
    }

    public function hasAvailableSlot(): bool
    {
        return $this->active_programs_count < ($this->max_campaign_slots ?? 1);
    }

    public function slotRequests()
    {
        return $this->hasMany(CampaignSlotRequest::class);
    }

    public function latestPendingSlotRequest()
    {
        return $this->hasOne(CampaignSlotRequest::class)->where('status', 'pending')->latestOfMany();
    }

    public function hasPendingSlotRequest(): bool
    {
        return $this->slotRequests()->where('status', 'pending')->exists();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function documents()
    {
        return $this->hasMany(VerificationDocument::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }
}
