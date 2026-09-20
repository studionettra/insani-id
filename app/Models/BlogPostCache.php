<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class BlogPostCache extends Model
{
    use HasFactory;
    use HasTranslations {
        HasTranslations::getTranslations as traitGetTranslations;
    }

    public $translatable = ['title', 'excerpt', 'content_html'];

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content_html',
        'featured_image_url',
        'wp_category',
        'status',
        'views_count',
        'published_at',
    ];

    protected $casts = [
        'views_count' => 'integer',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'thumbnail_url',
        'content',
        'author_name',
    ];

    /**
     * Author relation.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope for articles published to the public.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }

    /**
     * Accessor for author_name.
     */
    public function getAuthorNameAttribute(): string
    {
        return $this->author?->name ?? 'Admin Insani';
    }

    /**
     * Accessor for thumbnail_url to match frontend expectations.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (! $this->featured_image_url) {
            return null;
        }

        if (str_starts_with($this->featured_image_url, 'http://') || str_starts_with($this->featured_image_url, 'https://')) {
            return $this->featured_image_url;
        }

        return asset('storage/'.ltrim($this->featured_image_url, '/'));
    }

    /**
     * Accessor for content to match frontend expectations.
     */
    public function getContentAttribute(): ?string
    {
        return $this->content_html;
    }

    public function getTranslations(?string $key = null): array
    {
        if ($key) {
            $value = $this->attributes[$key] ?? '';
            if (! empty($value) && ! is_array($value)) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    return $decoded;
                }

                return ['id' => $value];
            }
        }

        return $this->traitGetTranslations($key);
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
