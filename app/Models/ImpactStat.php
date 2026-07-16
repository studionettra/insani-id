<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
    ];

    public $translatable = [
        'label',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
