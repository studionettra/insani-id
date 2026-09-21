<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Fundraiser extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id',
        'program_id',
        'referral_code',
        'target_amount',
        'personal_message',
        'collected_amount',
        'donors_count',
        'is_active',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'collected_amount' => 'decimal:2',
        'donors_count' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'progress_percentage',
        'referral_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function getProgressPercentageAttribute(): int
    {
        if (! $this->target_amount || $this->target_amount <= 0) {
            return 0;
        }

        return (int) min(100, round(($this->collected_amount / $this->target_amount) * 100));
    }

    public function getReferralUrlAttribute(): string
    {
        $slug = $this->program?->slug ?? '';

        return url("/program/{$slug}?ref={$this->referral_code}");
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }
}
