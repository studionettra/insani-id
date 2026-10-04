<?php

namespace App\Models;

use Database\Factories\AppSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    /** @use HasFactory<AppSettingFactory> */
    use HasFactory;

    protected $fillable = ['key', 'value', 'locale'];

    protected static function booted(): void
    {
        static::saved(function (AppSetting $setting) {
            Cache::forget("app_setting_{$setting->key}");
            Cache::forget('site_settings_public');
        });

        static::deleted(function (AppSetting $setting) {
            Cache::forget("app_setting_{$setting->key}");
            Cache::forget('site_settings_public');
        });
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("app_setting_{$key}", 86400, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, mixed $value, ?string $locale = null): static
    {
        Cache::forget("app_setting_{$key}");
        Cache::forget('site_settings_public');

        return static::updateOrCreate(
            ['key' => $key, 'locale' => $locale],
            ['value' => $value]
        );
    }
}
