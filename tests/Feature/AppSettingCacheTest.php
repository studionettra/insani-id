<?php

use App\Models\AppSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('AppSetting::get caches value and avoids repeated database queries', function () {
    AppSetting::set('test_key', 'initial_value');

    // First call caches the value
    $value1 = AppSetting::get('test_key');
    expect($value1)->toBe('initial_value');

    // Verify cache has the key
    expect(Cache::has('app_setting_test_key'))->toBeTrue();

    // Directly alter database without model events to verify it reads from cache
    DB::table('app_settings')->where('key', 'test_key')->update(['value' => 'raw_db_value']);

    $cachedValue = AppSetting::get('test_key');
    expect($cachedValue)->toBe('initial_value');

    // Updating via set() should invalidate cache
    AppSetting::set('test_key', 'updated_value');
    expect(AppSetting::get('test_key'))->toBe('updated_value');
});

test('AppSetting model deletion invalidates cache', function () {
    $setting = AppSetting::set('delete_me', 'temp_value');
    expect(AppSetting::get('delete_me'))->toBe('temp_value');

    $setting->delete();
    expect(Cache::has('app_setting_delete_me'))->toBeFalse();
    expect(AppSetting::get('delete_me'))->toBeNull();
});
