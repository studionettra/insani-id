<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CampaignSlotRequest extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'campaigner_profile_id',
        'requested_by',
        'current_slots',
        'requested_slots',
        'reason',
        'planned_programs',
        'status',
        'reviewed_by',
        'reviewed_at',
        'admin_notes',
    ];

    protected $casts = [
        'current_slots' => 'integer',
        'requested_slots' => 'integer',
        'reviewed_at' => 'datetime',
    ];

    public function campaignerProfile(): BelongsTo
    {
        return $this->belongsTo(CampaignerProfile::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }
}
