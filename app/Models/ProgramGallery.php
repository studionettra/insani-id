<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramGallery extends Model
{
    protected $fillable = [
        'program_id',
        'file_path',
        'type',
        'sort_order',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
