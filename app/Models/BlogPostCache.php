<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogPostCache extends Model
{
    use HasFactory;

    protected $fillable = [
        'wp_post_id',
        'title',
        'slug',
        'excerpt',
        'content_html',
        'featured_image_url',
        'wp_category',
        'published_at',
        'synced_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'synced_at' => 'datetime',
    ];

    protected $appends = [
        'thumbnail_url',
    ];

    /**
     * Accessor for thumbnail_url to match frontend expectations.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->featured_image_url;
    }
}
