<?php

namespace App\Models;

use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

use Illuminate\Database\Eloquent\Model;

class CampaignerProfile extends Model
{
    use LogsActivity;

    protected $fillable = [
        'user_id',
        'type',
        'verification_status',
        'nama_lembaga',
        'nomor_sk',
        'npwp',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'address',
        'phone',
    ];

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
