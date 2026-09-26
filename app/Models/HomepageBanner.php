<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class HomepageBanner extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'title',
        'description',
        'desktop_image_url',
        'mobile_image_url',
        'cta_link',
        'is_active',
        'sort_order',
    ];

    public $translatable = [
        'title',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'title_translations',
        'description_translations',
    ];

    public function getTitleTranslationsAttribute(): array
    {
        return $this->getTranslations('title');
    }

    public function getDescriptionTranslationsAttribute(): array
    {
        return $this->getTranslations('description');
    }

    /**
     * Convert model to array using active locale for translatable attributes.
     */
    public function toArray(): array
    {
        $attributes = parent::toArray();

        foreach ($this->getTranslatableAttributes() as $field) {
            $translations = $this->getTranslations($field);
            $locale = app()->getLocale();
            $fallback = config('app.fallback_locale', 'id');

            $attributes[$field] = $translations[$locale] ?? $translations[$fallback] ?? $translations['id'] ?? (is_array($translations) && count($translations) > 0 ? reset($translations) : '');
        }

        return $attributes;
    }
}
