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
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:100',
            'contact_finance_email' => 'nullable|email|max:100',
            'contact_donor_support_wa' => 'nullable|string|max:50',
            'contact_donation_confirm_wa' => 'nullable|string|max:50',
            'contact_partnership_wa' => 'nullable|string|max:50',
            'contact_operating_hours' => 'nullable|string|max:100',
            'contact_holiday_note' => 'nullable|string|max:255',
            'contact_address' => 'nullable|string|max:500',
            'contact_maps_url' => 'nullable|string|max:500',
            'about_vision' => 'nullable|string|max:2000',
            'about_mission' => 'nullable|string|max:3000',
            'about_values' => 'nullable|string|max:3000',
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
            'adsense_enabled' => 'nullable|string|in:0,1',
            'google_adsense_client_id' => 'nullable|string|max:100',
            'adsense_slot_blog_index' => 'nullable|string|max:50',
            'adsense_slot_article_top' => 'nullable|string|max:50',
            'adsense_slot_article_middle' => 'nullable|string|max:50',
            'adsense_slot_article_bottom' => 'nullable|string|max:50',
            'ads_txt_content' => 'nullable|string|max:5000',
            'legal_foundation_name' => 'nullable|string|max:255',
            'legal_sk_kemenkumham' => 'nullable|string|max:100',
            'legal_sk_label' => 'nullable|string|max:100',
            'legal_operational_permit' => 'nullable|string|max:100',
            'legal_npwp' => 'nullable|string|max:50',
            'show_sk_in_footer' => 'nullable|string|in:0,1',
            'receipt_signatory_name' => 'nullable|string|max:255',
            'receipt_signatory_title' => 'nullable|string|max:255',
            'receipt_signature_image' => 'nullable|image|max:2048',
            'receipt_stamp_image' => 'nullable|image|max:2048',
            'announcement_enabled' => 'nullable|string|in:0,1',
            'announcement_text' => 'nullable|string|max:500',
            'announcement_link' => 'nullable|string|max:500',
            'announcement_bg_color' => 'nullable|string|max:50',
            'site_logo' => 'nullable|image|max:2048',
            'site_logo_white' => 'nullable|image|max:2048',
            'site_favicon' => 'nullable|mimes:ico,png,svg,jpg,webp|max:1024',
        ]);

        $imageFields = [
            'qris_image',
            'receipt_signature_image',
            'receipt_stamp_image',
            'site_logo',
            'site_logo_white',
            'site_favicon',
        ];

        foreach ($imageFields as $imageField) {
            if ($request->hasFile($imageField)) {
                $oldFile = AppSetting::where('key', $imageField)->value('value');
                if ($oldFile && Storage::disk('public')->exists($oldFile)) {
                    Storage::disk('public')->delete($oldFile);
                }

                $path = $request->file($imageField)->store('settings', 'public');
                AppSetting::updateOrCreate(
                    ['key' => $imageField],
                    ['value' => $path]
                );
            }
        }

        $textFields = [
            'contact_whatsapp',
            'contact_phone',
            'contact_email',
            'contact_finance_email',
            'contact_donor_support_wa',
            'contact_donation_confirm_wa',
            'contact_partnership_wa',
            'contact_operating_hours',
            'contact_holiday_note',
            'contact_address',
            'contact_maps_url',
            'about_vision',
            'about_mission',
            'about_values',
            'social_facebook',
            'social_instagram',
            'social_youtube',
            'social_x',
            'social_threads',
            'footer_description',
            'legal_foundation_name',
            'legal_sk_kemenkumham',
            'legal_sk_label',
            'legal_operational_permit',
            'legal_npwp',
            'show_sk_in_footer',
            'receipt_signatory_name',
            'receipt_signatory_title',
            'announcement_enabled',
            'announcement_text',
            'announcement_link',
            'announcement_bg_color',
            'google_tag_manager_id',
            'google_analytics_id',
            'meta_pixel_id',
            'tiktok_pixel_id',
            'adsense_enabled',
            'google_adsense_client_id',
            'adsense_slot_blog_index',
            'adsense_slot_article_top',
            'adsense_slot_article_middle',
            'adsense_slot_article_bottom',
            'ads_txt_content',
        ];

        foreach ($textFields as $field) {
            if ($request->has($field)) {
                AppSetting::updateOrCreate(
                    ['key' => $field],
                    ['value' => $request->input($field)]
                );
            }
        }

        // Sync ads.txt file if configured
        if ($request->has('ads_txt_content') || $request->has('google_adsense_client_id')) {
            $adsTxtContent = trim((string) $request->input('ads_txt_content'));
            if (! empty($adsTxtContent)) {
                @file_put_contents(public_path('ads.txt'), $adsTxtContent.PHP_EOL);
            } elseif ($pubId = $request->input('google_adsense_client_id')) {
                $cleanPub = preg_replace('/[^0-9]/', '', (string) $pubId);
                if (! empty($cleanPub)) {
                    @file_put_contents(public_path('ads.txt'), "google.com, pub-{$cleanPub}, DIRECT, f08c47fec0942fa0".PHP_EOL);
                }
            }
        }

        // Clear public site settings cache
        Cache::forget('site_settings_public');

        return redirect()->back()->with('success', 'Pengaturan website berhasil disimpan.');
    }
}
