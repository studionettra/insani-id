<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Testimonial extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'role',
        'avatar_path',
        'content',
        'rating',
        'is_active',
        'sort_order',
    ];

    public $translatable = [
        'role',
        'content',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'avatar_url',
        'role_translations',
        'content_translations',
    ];

    public function getRoleTranslationsAttribute(): array
    {
        return $this->getTranslations('role');
    }

    public function getContentTranslationsAttribute(): array
    {
        return $this->getTranslations('content');
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }

        if (str_starts_with($this->avatar_path, 'http://') || str_starts_with($this->avatar_path, 'https://')) {
            return $this->avatar_path;
        }

        return asset('storage/'.$this->avatar_path);
    }
}
