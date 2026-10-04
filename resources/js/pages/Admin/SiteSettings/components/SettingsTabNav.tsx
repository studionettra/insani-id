import React from 'react';
import { 
    Phone, 
    Palette, 
    Compass, 
    ShieldCheck, 
    Megaphone, 
    BarChart3,
    CreditCard
} from 'lucide-react';
import { 
    TabKey, 
    TabDefinition, 
    SETTINGS_TAB_CATEGORIES 
} from '../types';

export const SITE_SETTINGS_TABS: TabDefinition[] = [
    {
        key: 'general',
        category: 'identity',
        label: 'Umum & Kontak',
        shortLabel: 'Kontak',
        description: 'Kontak resmi, jam operasional kantor, alamat, & medsos',
        icon: Phone,
        fields: [
            'contact_whatsapp', 'contact_phone', 'contact_email', 'contact_finance_email',
            'contact_donor_support_wa', 'contact_donation_confirm_wa', 'contact_partnership_wa',
            'contact_operating_hours', 'contact_holiday_note', 'contact_address', 'contact_maps_url',
            'social_facebook', 'social_instagram', 'social_youtube', 'social_x', 'social_threads'
        ]
    },
    {
        key: 'branding',
        category: 'identity',
        label: 'Identitas & Media',
        shortLabel: 'Branding',
        description: 'Logo lembaga resmi, favicon, QRIS, & narasi profil footer',
        icon: Palette,
        fields: ['site_logo', 'site_logo_white', 'site_favicon', 'qris_image', 'footer_description']
    },
    {
        key: 'profile',
        category: 'identity',
        label: 'Profil Lembaga',
        shortLabel: 'Profil',
        description: 'Visi, misi, dan nilai-nilai perjuangan yayasan',
        icon: Compass,
        fields: ['about_vision', 'about_mission', 'about_values']
    },
    {
        key: 'legal',
        category: 'identity',
        label: 'Legalitas & Kwitansi',
        shortLabel: 'Legalitas',
        description: 'SK Kemenkumham, izin PUB, NPWP, & stempel kwitansi resmi',
        icon: ShieldCheck,
        fields: [
            'legal_foundation_name', 'legal_sk_kemenkumham', 'legal_sk_label',
            'legal_operational_permit', 'legal_npwp', 'show_sk_in_footer',
            'receipt_signatory_name', 'receipt_signatory_title', 'receipt_signature_image', 'receipt_stamp_image'
        ]
    },
    {
        key: 'payment',
        category: 'finance',
        label: 'Payment Gateway & Bank',
        shortLabel: 'Pembayaran',
        description: 'Midtrans Core API, QRIS, E-Wallet, VA Bank, & rekening',
        icon: CreditCard,
        fields: [
            'payment_gateway_provider',
            'midtrans_channel_qris', 'midtrans_channel_shopeepay', 'midtrans_channel_gopay',
            'midtrans_channel_bsi_va', 'midtrans_channel_bri_va', 'midtrans_channel_bni_va',
            'midtrans_channel_mandiri_va', 'midtrans_channel_bca_va', 'midtrans_channel_permata_va',
            'midtrans_channel_cimb_va', 'midtrans_channel_danamon_va', 'midtrans_channel_credit_card',
            'manual_transfer_bsi_active', 'manual_transfer_bri_active',
            'midtrans_va_maintenance_notice'
        ]
    },
    {
        key: 'announcement',
        category: 'communications',
        label: 'Pengumuman Global',
        shortLabel: 'Pengumuman',
        description: 'Banner peringatan darurat & pengumuman di puncak web',
        icon: Megaphone,
        fields: ['announcement_enabled', 'announcement_text', 'announcement_link', 'announcement_bg_color']
    },
    {
        key: 'marketing',
        category: 'communications',
        label: 'Integrasi & Iklan',
        shortLabel: 'Integrasi',
        description: 'Google Analytics, Meta CAPI, TikTok Pixel, & AdSense',
        icon: BarChart3,
        fields: [
            'google_tag_manager_id', 'tracking_mode_gtm', 'google_analytics_id', 'google_ads_id',
            'google_site_verification', 'meta_pixel_id', 'meta_domain_verification', 'meta_capi_enabled',
            'meta_capi_access_token', 'meta_capi_test_event_code', 'tiktok_pixel_id',
            'adsense_enabled', 'google_adsense_client_id', 'adsense_slot_blog_index',
            'adsense_slot_article_top', 'adsense_slot_article_middle', 'adsense_slot_article_bottom',
            'ads_txt_content'
        ]
    }
];

interface SettingsTabNavProps {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
    errors: Record<string, string>;
}

export default function SettingsTabNav({ activeTab, onTabChange, errors }: SettingsTabNavProps) {
    // Hitung jumlah error pada setiap tab
    const getTabErrorCount = (tab: TabDefinition) => {
        return tab.fields.reduce((count, field) => {
            const hasDirectError = Boolean(errors[field]);
            const hasNestedError = Object.keys(errors).some(k => k.startsWith(`${field}.`));
            return count + (hasDirectError || hasNestedError ? 1 : 0);
        }, 0);
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800/95 rounded-2xl p-1.5 border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
            <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth" aria-label="Tabs Pengaturan Website">
                {SITE_SETTINGS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    const errorCount = getTabErrorCount(tab);

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onTabChange(tab.key)}
                            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                isActive
                                    ? 'bg-brand-600 text-white shadow-xs'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                            }`} />
                            
                            <span>{tab.label}</span>

                            {errorCount > 0 && (
                                <span className={`inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full ${
                                    isActive 
                                        ? 'bg-red-500 text-white ring-2 ring-white/50' 
                                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                }`}>
                                    {errorCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
