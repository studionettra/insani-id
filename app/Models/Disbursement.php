<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Disbursement extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'receipt_number',
        'program_id',
        'requested_amount',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'platform_fee_percent',
        'platform_fee_amount',
        'gateway_fee',
        'bank_fee',
        'nett_amount',
        'status',
        'notes',
        'distribution_plan',
        'beneficiary_target',
        'location',
        'estimated_distribution_date',
        'supporting_document',
        'rejection_reason',
        'transfer_proof',
        'approved_by',
        'transferred_at',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:2',
        'platform_fee_percent' => 'decimal:2',
        'platform_fee_amount' => 'decimal:2',
        'gateway_fee' => 'decimal:2',
        'bank_fee' => 'decimal:2',
        'nett_amount' => 'decimal:2',
        'estimated_distribution_date' => 'date',
        'transferred_at' => 'datetime',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function programUpdate()
    {
        return $this->hasOne(ProgramUpdate::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getMaskedAccountNumberAttribute(): string
    {
        $acc = preg_replace('/\s+/', '', (string) $this->bank_account_number);
        $len = strlen($acc);
        if ($len <= 4) {
            return str_repeat('*', max(1, $len));
        }
        $lastFour = substr($acc, -4);
        $hiddenLength = $len - 4;

        if ($hiddenLength <= 4) {
            $maskedPrefix = '****';
        } elseif ($hiddenLength <= 8) {
            $maskedPrefix = '*** ****';
        } elseif ($hiddenLength <= 12) {
            $maskedPrefix = '*** **** ****';
        } else {
            $maskedPrefix = '*** **** **** ****';
        }

        return "{$maskedPrefix} {$lastFour}";
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }
}
