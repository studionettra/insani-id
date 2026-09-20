<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogPostCache extends Model
{
    use HasFactory;

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
}
