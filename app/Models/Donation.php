<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'donation_code',
        'program_id',
        'donor_user_id',
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
        return $this->belongsTo(User::class, 'donor_user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
