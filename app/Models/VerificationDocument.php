<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationDocument extends Model
{
    protected $fillable = [
        'campaigner_profile_id',
        'document_type',
        'file_path',
        'status',
        'notes',
    ];

    public function profile()
    {
        return $this->belongsTo(CampaignerProfile::class, 'campaigner_profile_id');
    }
}
