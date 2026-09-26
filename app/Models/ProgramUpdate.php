<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class ProgramUpdate extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'program_id',
        'disbursement_id',
        'title',
        'content',
        'created_by',
        'is_published',
        'moderation_status',
        'rejection_reason',
    ];

    public $translatable = [
        'title',
        'content',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected $appends = [
        'title_translations',
        'content_translations',
    ];

    public function getTitleTranslationsAttribute(): array
    {
        return $this->getTranslations('title');
    }

    public function getContentTranslationsAttribute(): array
    {
        return $this->getTranslations('content');
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function disbursement()
    {
        return $this->belongsTo(Disbursement::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
