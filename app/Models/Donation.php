<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Donation extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'donation_code',
        'program_id',
        'donor_user_id',
        'fundraiser_id',
        'fundraiser_user_id',
        'donor_name',
        'donor_email',
        'donor_phone',
        'is_anonymous',
        'message',
        'amount',
        'unique_code',
        'channel',
        'status',
        'paid_at',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'referrer_url',
        'landing_page',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function donor()
    {
        return $this->belongsTo(User::class, 'donor_user_id')->withTrashed();
    }

    public function fundraiser()
    {
        return $this->belongsTo(Fundraiser::class);
    }

    public function fundraiserUser()
    {
        return $this->belongsTo(User::class, 'fundraiser_user_id')->withTrashed();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function comment()
    {
        return $this->hasOne(Comment::class);
    }

    public function getPaymentChannelLabelAttribute(): string
    {
        $payments = $this->relationLoaded('payments') ? $this->payments : $this->payments()->get();
        $payment = $payments->whereIn('gateway_status', ['PAID', 'SETTLED'])->sortByDesc('created_at')->first()
            ?? $payments->sortByDesc('created_at')->first();

        if ($payment) {
            return $payment->payment_channel_label;
        }

        return Payment::formatChannelLabel(
            null,
            null,
            null,
            $this->channel
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }
}
