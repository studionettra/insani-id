<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Faq extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'question',
        'answer_html',
        'category',
        'keywords',
        'is_active',
        'sort_order',
    ];

    public $translatable = [
        'question',
        'answer_html',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'question_translations',
        'answer_translations',
        'answer_html_translations',
    ];

    public function getQuestionTranslationsAttribute(): array
    {
        return $this->getTranslations('question');
    }

    public function getAnswerTranslationsAttribute(): array
    {
        return $this->getTranslations('answer_html');
    }

    public function getAnswerHtmlTranslationsAttribute(): array
    {
        return $this->getTranslations('answer_html');
    }
}
