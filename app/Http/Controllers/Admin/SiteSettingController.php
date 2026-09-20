<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    /**
     * Display the site settings page.
     */
    public function index()
    {
        $settings = AppSetting::pluck('value', 'key')->toArray();

        return inertia('Admin/SiteSettings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the site settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'contact_whatsapp' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:100',
            'contact_address' => 'nullable|string|max:500',
            'contact_maps_url' => 'nullable|string|max:500',
            'social_facebook' => 'nullable|string|max:255',
            'social_instagram' => 'nullable|string|max:255',
            'social_youtube' => 'nullable|string|max:255',
            'social_x' => 'nullable|string|max:255',
            'social_threads' => 'nullable|string|max:255',
            'footer_description' => 'nullable|string|max:1000',
            'qris_image' => 'nullable|image|max:3072',
            'google_tag_manager_id' => 'nullable|string|max:50',
            'google_analytics_id' => 'nullable|string|max:50',
            'meta_pixel_id' => 'nullable|string|max:50',
            'tiktok_pixel_id' => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('qris_image')) {
            // Delete old QRIS image if exists in storage
            $oldQris = AppSetting::where('key', 'qris_image')->value('value');
            if ($oldQris && Storage::disk('public')->exists($oldQris)) {
                Storage::disk('public')->delete($oldQris);
            }

            $path = $request->file('qris_image')->store('settings', 'public');
            AppSetting::updateOrCreate(
                ['key' => 'qris_image'],
                ['value' => $path]
            );
        }

        $textFields = [
            'contact_whatsapp',
            'contact_email',
            'contact_address',
            'contact_maps_url',
            'social_facebook',
            'social_instagram',
            'social_youtube',
            'social_x',
            'social_threads',
            'footer_description',
            'google_tag_manager_id',
            'google_analytics_id',
            'meta_pixel_id',
            'tiktok_pixel_id',
        ];

        foreach ($textFields as $field) {
            if ($request->has($field)) {
                AppSetting::updateOrCreate(
                    ['key' => $field],
                    ['value' => $request->input($field)]
                );
            }
        }

        // Clear public site settings cache
        Cache::forget('site_settings_public');

        return redirect()->back()->with('success', 'Pengaturan website berhasil disimpan.');
    }
}
