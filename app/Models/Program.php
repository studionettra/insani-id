<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

class Program extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;
    use HasTranslations {
        HasTranslations::getTranslations as traitGetTranslations;
    }

    public $translatable = ['title', 'story'];

    protected $fillable = [
        'program_code',
        'title',
        'slug',
        'category_id',
        'campaigner_type',
        'campaigner_profile_id',
        'created_by',
        'verified_by',
        'target_amount',
        'is_continuous',
        'collected_amount',
        'deadline',
        'story',
        'cover_image',
        'video_url',
        'status',
        'views_count',
        'rejection_notes',
        'published_at',
        'closed_at',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'is_continuous' => 'boolean',
        'collected_amount' => 'decimal:2',
        'views_count' => 'integer',
        'deadline' => 'date',
        'published_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function campaignerProfile()
    {
        return $this->belongsTo(CampaignerProfile::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function galleries()
    {
        return $this->hasMany(ProgramGallery::class);
    }

    public function documents()
    {
        return $this->hasMany(ProgramDocument::class);
    }

    public function disbursements()
    {
        return $this->hasMany(Disbursement::class);
    }

    public function updates()
    {
        return $this->hasMany(ProgramUpdate::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function fundraisers()
    {
        return $this->hasMany(Fundraiser::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
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
