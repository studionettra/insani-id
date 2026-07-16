<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disbursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'requested_amount',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'platform_fee_percent',
        'platform_fee_amount',
        'nett_amount',
        'status',
        'notes',
        'rejection_reason',
        'transfer_proof',
        'approved_by',
        'transferred_at',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:2',
        'platform_fee_percent' => 'decimal:2',
        'platform_fee_amount' => 'decimal:2',
        'nett_amount' => 'decimal:2',
        'transferred_at' => 'datetime',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
