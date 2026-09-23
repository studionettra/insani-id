<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Translatable\HasTranslations;

class FinancialReport extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'title',
        'slug',
        'report_year',
        'category',
        'audit_status',
        'auditor_name',
        'cover_image',
        'file_path',
        'external_url',
        'file_size',
        'summary',
        'total_revenue',
        'total_disbursement',
        'beneficiaries_count',
        'download_count',
        'is_active',
        'sort_order',
    ];

    public $translatable = [
        'title',
        'summary',
    ];

    protected $casts = [
        'report_year' => 'integer',
        'file_size' => 'integer',
        'total_revenue' => 'float',
        'total_disbursement' => 'float',
        'beneficiaries_count' => 'integer',
        'download_count' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'cover_url',
        'file_url',
        'view_url',
        'formatted_file_size',
        'formatted_revenue',
        'formatted_disbursement',
        'title_translations',
        'summary_translations',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($report) {
            if (empty($report->slug)) {
                $base = is_array($report->title) ? ($report->title['id'] ?? reset($report->title)) : $report->title;
                $slug = Str::slug($base ?: 'laporan-keuangan-'.$report->report_year);
                $originalSlug = $slug;
                $count = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$originalSlug}-{$count}";
                    $count++;
                }
                $report->slug = $slug;
            }
        });
    }

    public function getCoverUrlAttribute(): ?string
    {
        if (! $this->cover_image) {
            return null;
        }

        if (Str::startsWith($this->cover_image, ['http://', 'https://', '/images/'])) {
            return $this->cover_image;
        }

        return Storage::disk('public')->url($this->cover_image);
    }

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

    public function getFormattedFileSizeAttribute(): string
    {
        if (! $this->file_size) {
            return '';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($this->file_size, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, 1).' '.$units[$pow];
    }

    public function getFormattedRevenueAttribute(): ?string
    {
        if ($this->total_revenue === null) {
            return null;
        }

        return 'Rp '.number_format($this->total_revenue, 0, ',', '.');
    }

    public function getFormattedDisbursementAttribute(): ?string
    {
        if ($this->total_disbursement === null) {
            return null;
        }

        return 'Rp '.number_format($this->total_disbursement, 0, ',', '.');
    }

    public function getTitleTranslationsAttribute(): array
    {
        return $this->getTranslations('title');
    }

    public function getSummaryTranslationsAttribute(): array
    {
        return $this->getTranslations('summary');
    }
}
