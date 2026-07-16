<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramDocument extends Model
{
    protected $fillable = [
        'program_id',
        'file_path',
        'description',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
