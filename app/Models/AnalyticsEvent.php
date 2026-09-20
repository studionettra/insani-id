<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    use HasFactory, Prunable;

    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'event_name',
        'url',
        'meta_status',
        'ga4_status',
        'payload',
        'created_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSession::class, 'session_id');
    }

    /**
     * Get the prunable model query (retains records for 90 days).
     */
    public function prunable()
    {
        return static::where('created_at', '<=', now()->subDays(90));
    }
}
