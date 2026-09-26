<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class PopupMessage extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'title',
        'display_type',
        'image_path',
        'content',
        'cta_text',
        'cta_url',
        'open_in_new_tab',
        'delay_seconds',
        'auto_close_seconds',
        'frequency',
        'target_page',
        'start_at',
        'end_at',
        'is_active',
    ];

    public $translatable = [
        'title',
        'content',
        'cta_text',
    ];

    protected $casts = [
        'open_in_new_tab' => 'boolean',
        'delay_seconds' => 'integer',
        'auto_close_seconds' => 'integer',
        'is_active' => 'boolean',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    protected $appends = [
        'image_url',
        'is_live',
        'title_translations',
        'content_translations',
        'cta_text_translations',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        return asset('storage/'.$this->image_path);
    }

    public function getIsLiveAttribute(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();
        if ($this->start_at && $now->lt($this->start_at)) {
            return false;
        }

        if ($this->end_at && $now->gt($this->end_at)) {
            return false;
        }

        return true;
    }

    public function getTitleTranslationsAttribute(): array
    {
        return $this->getTranslations('title');
    }

    public function getContentTranslationsAttribute(): array
    {
        return $this->getTranslations('content');
    }

    public function getCtaTextTranslationsAttribute(): array
    {
        return $this->getTranslations('cta_text');
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

    /**
     * Scope a query to only include currently active and unexpired pop-up messages.
     *
     * @param  Builder<PopupMessage>  $query
     * @return Builder<PopupMessage>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(function (Builder $q) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', now());
            })
            ->where(function (Builder $q) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', now());
            });
    }
}
