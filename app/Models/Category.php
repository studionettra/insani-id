<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'platform_fee_percent',
        'is_disaster_category',
        'is_focus_program',
        'pillar_image',
        'is_active',
        'sort_order',
    ];

    public $translatable = ['name', 'description'];

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function scopeFocusProgram($query)
    {
        return $query->where('is_focus_program', true)
                     ->where('is_active', true)
                     ->orderBy('sort_order');
    }

    protected $casts = [
        'is_disaster_category' => 'boolean',
        'is_focus_program' => 'boolean',
        'is_active' => 'boolean',
        'platform_fee_percent' => 'decimal:2',
    ];
}
