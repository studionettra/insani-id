<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Payment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'donation_id',
        'payment_method',
        'payment_channel',
        'payment_destination',
        'checkout_url',
        'gateway',
        'gateway_reference_id',
        'gateway_status',
        'paid_amount',
        'paid_at',
        'confirmed_by',
        'raw_payload',
    ];

    protected $casts = [
        'paid_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'raw_payload' => 'array',
    ];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }
}
