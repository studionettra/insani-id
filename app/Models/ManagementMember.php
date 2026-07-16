<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Translatable\HasTranslations;

class ManagementMember extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'position',
        'bio',
        'photo_url',
        'is_active',
        'sort_order',
    ];

    public $translatable = [
        'position',
        'bio',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
