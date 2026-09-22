<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Spatie\Translatable\HasTranslations;

class LegalDocument extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'title',
        'document_number',
        'issuer_name',
        'file_path',
        'external_url',
        'icon_type',
        'publisher_logo',
        'description',
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
        'file_url',
        'view_url',
        'title_translations',
        'description_translations',
    ];

    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        return Storage::disk('public')->url($this->file_path);
    }

    public function getViewUrlAttribute(): ?string
    {
        return $this->file_url ?: $this->external_url;
    }

    public function getTitleTranslationsAttribute(): array
    {
        return $this->getTranslations('title');
    }

    public function getDescriptionTranslationsAttribute(): array
    {
        return $this->getTranslations('description');
    }
}
