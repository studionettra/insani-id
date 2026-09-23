<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class ManagementMember extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'position',
        'bio',
        'photo_url',
        'is_active',
        'sort_order',
    ];

    public $translatable = [
        'position',
        'bio',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'position_translations',
        'bio_translations',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->photo_url;
    }

    public function getPositionTranslationsAttribute(): array
    {
        return $this->getTranslations('position');
    }

    public function getBioTranslationsAttribute(): array
    {
        return $this->getTranslations('bio');
    }
}
