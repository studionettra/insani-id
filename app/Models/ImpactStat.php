<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class ImpactStat extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'group',
        'icon',
        'value',
        'label',
        'is_active',
        'sort_order',
        'title',
        'category',
    ];

    public $translatable = [
        'label',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'title',
        'title_translations',
        'category',
    ];

    public function setTitleAttribute($value): void
    {
        if (is_array($value)) {
            $this->setTranslations('label', $value);
        } else {
            $this->setTranslation('label', app()->getLocale(), (string) $value);
        }
    }

    public function getTitleAttribute(): ?string
    {
        return $this->getTranslation('label', app()->getLocale(), false)
            ?: $this->getTranslation('label', 'id', false);
    }

    public function getTitleTranslationsAttribute(): array
    {
        return $this->getTranslations('label');
    }

    public function setCategoryAttribute($value): void
    {
        $this->attributes['group'] = match (strtolower(str_replace(' ', '_', (string) $value))) {
            'dalam_negeri' => 'dalam_negeri',
            'luar_negeri' => 'luar_negeri',
            default => 'umum',
        };
    }

    public function getCategoryAttribute(): string
    {
        return match ($this->group) {
            'dalam_negeri' => 'Dalam Negeri',
            'luar_negeri' => 'Luar Negeri',
            default => 'Umum',
        };
    }
}
