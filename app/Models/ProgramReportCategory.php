<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class ProgramReportCategory extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'sort_order',
    ];

    public array $translatable = [
        'name',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'name_translations',
        'description_translations',
    ];

    public function getNameTranslationsAttribute(): array
    {
        return $this->getTranslations('name');
    }

    public function getDescriptionTranslationsAttribute(): array
    {
        return $this->getTranslations('description');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ProgramReport::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
