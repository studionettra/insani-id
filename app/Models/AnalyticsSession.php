<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalyticsSession extends Model
{
    use HasFactory, Prunable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'ip_address',
        'country',
        'region',
        'city',
        'device_type',
        'browser',
        'browser_version',
        'os',
        'referrer_domain',
        'referrer_url',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'landing_page',
        'last_activity_at',
    ];

    protected $casts = [
        'last_activity_at' => 'datetime',
    ];

    public function pageViews(): HasMany
    {
        return $this->hasMany(AnalyticsPageView::class, 'session_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class, 'session_id');
    }

    /**
     * Get the prunable model query (retains records for 90 days).
     */
    public function prunable()
    {
        return static::where('created_at', '<=', now()->subDays(90));
    }
}
