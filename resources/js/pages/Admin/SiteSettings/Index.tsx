import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { autoTranslateFields } from '@/lib/translate';
import { TabKey, parseMultilingual } from './types';
import SettingsTabNav from './components/SettingsTabNav';
import GeneralContactTab from './tabs/GeneralContactTab';
import BrandingMediaTab from './tabs/BrandingMediaTab';
import AboutProfileTab from './tabs/AboutProfileTab';
import LegalReceiptTab from './tabs/LegalReceiptTab';
import AnnouncementTab from './tabs/AnnouncementTab';
import MarketingIntegrationTab from './tabs/MarketingIntegrationTab';

interface Props {
    settings: Record<string, string>;
}

export default function SiteSettingsIndex({ settings }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('general');

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        contact_whatsapp: settings.contact_whatsapp || '081319456675',
        contact_phone: settings.contact_phone || '(021) 27871199',
        contact_email: settings.contact_email || 'sapa@insani.id',
        contact_finance_email: settings.contact_finance_email || 'financial@insani.id',
        contact_donor_support_wa: settings.contact_donor_support_wa || '081319456675',
        contact_donation_confirm_wa: settings.contact_donation_confirm_wa || '0895373388880',
        contact_partnership_wa: settings.contact_partnership_wa || '082124837496',
        contact_operating_hours: settings.contact_operating_hours || "Senin - Jum'at | 10:00 - 18.00 WIB",
        contact_holiday_note: settings.contact_holiday_note || 'Tutup Pada Tanggal Merah & Cuti Bersama',
        contact_address: settings.contact_address || 'Jl. Kebaikan No. 1, Jakarta',
        contact_maps_url: settings.contact_maps_url || 'https://maps.google.com',
        about_vision: parseMultilingual(settings.about_vision, ''),
        about_mission: parseMultilingual(settings.about_mission, ''),
        about_values: parseMultilingual(settings.about_values, ''),
        social_facebook: settings.social_facebook || 'https://www.facebook.com/insaniindonesia',
        social_instagram: settings.social_instagram || 'https://www.instagram.com/insaniindonesia',
        social_youtube: settings.social_youtube || 'https://www.youtube.com/@insaniindonesia',
        social_x: settings.social_x || 'https://x.com/officialinsani',
        social_threads: settings.social_threads || 'https://www.threads.com/@insaniindonesia',
        footer_description: parseMultilingual(settings.footer_description, 'Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan universal.'),
        legal_foundation_name: settings.legal_foundation_name || 'Yayasan Peduli Insani Indonesia',
        legal_sk_kemenkumham: settings.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.Tahun 2019',
        legal_sk_label: settings.legal_sk_label || 'SK Kemenkumham RI',
        legal_operational_permit: settings.legal_operational_permit || '',
        legal_npwp: settings.legal_npwp || '',
        show_sk_in_footer: settings.show_sk_in_footer ?? '1',
        receipt_signatory_name: settings.receipt_signatory_name || 'Pengurus Yayasan',
        receipt_signatory_title: settings.receipt_signatory_title || 'Divisi Keuangan & Donasi',
        receipt_signature_image: null as File | null,
        receipt_stamp_image: null as File | null,
        announcement_enabled: settings.announcement_enabled || '0',
        announcement_text: parseMultilingual(settings.announcement_text, ''),
        announcement_link: settings.announcement_link || '',
        announcement_bg_color: settings.announcement_bg_color || '#1A56DB',
        site_logo: null as File | null,
        site_logo_white: null as File | null,
        site_favicon: null as File | null,
        qris_image: null as File | null,
        google_tag_manager_id: settings.google_tag_manager_id || '',
        tracking_mode_gtm: settings.tracking_mode_gtm || 'hybrid',
        google_analytics_id: settings.google_analytics_id || '',
        google_ads_id: settings.google_ads_id || '',
        google_site_verification: settings.google_site_verification || '',
        meta_pixel_id: settings.meta_pixel_id || '',
        meta_domain_verification: settings.meta_domain_verification || '',
        meta_capi_enabled: settings.meta_capi_enabled || '0',
        meta_capi_access_token: settings.meta_capi_access_token || '',
        meta_capi_test_event_code: settings.meta_capi_test_event_code || '',
        tiktok_pixel_id: settings.tiktok_pixel_id || '',
        adsense_enabled: settings.adsense_enabled || '0',
        google_adsense_client_id: settings.google_adsense_client_id || '',
        adsense_slot_blog_index: settings.adsense_slot_blog_index || '',
        adsense_slot_article_top: settings.adsense_slot_article_top || '',
        adsense_slot_article_middle: settings.adsense_slot_article_middle || '',
        adsense_slot_article_bottom: settings.adsense_slot_article_bottom || '',
        ads_txt_content: settings.ads_txt_content || '',
    });

    // File Preview States
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoWhitePreview, setLogoWhitePreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [qrisPreview, setQrisPreview] = useState<string | null>(null);
    const [stampPreview, setStampPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    // Translation Loading States
    const [isTranslatingAbout, setIsTranslatingAbout] = useState(false);
    const [isTranslatingFooter, setIsTranslatingFooter] = useState(false);
    const [isTranslatingAnnouncement, setIsTranslatingAnnouncement] = useState(false);

    // File change handler
    const handleFileChange = (field: string, file: File | null) => {
        setData(field as any, file);
        const objectUrl = file ? URL.createObjectURL(file) : null;

        switch (field) {
            case 'site_logo':
                setLogoPreview(objectUrl);
                break;
            case 'site_logo_white':
                setLogoWhitePreview(objectUrl);
                break;
            case 'site_favicon':
                setFaviconPreview(objectUrl);
                break;
            case 'qris_image':
                setQrisPreview(objectUrl);
                break;
            case 'receipt_stamp_image':
                setStampPreview(objectUrl);
                break;
            case 'receipt_signature_image':
                setSignaturePreview(objectUrl);
                break;
        }
    };

    // Auto translate handlers
    const handleTranslateAbout = async () => {
        if (!data.about_vision.id && !data.about_mission.id && !data.about_values.id) {
            toast.error('Isi konten Visi, Misi, atau Nilai dalam Bahasa Indonesia terlebih dahulu.');
            return;
        }

        setIsTranslatingAbout(true);
        try {
            const fieldsToTranslate: Record<string, string> = {};
            if (data.about_vision.id) fieldsToTranslate.about_vision = data.about_vision.id;
            if (data.about_mission.id) fieldsToTranslate.about_mission = data.about_mission.id;
            if (data.about_values.id) fieldsToTranslate.about_values = data.about_values.id;

            const results = await autoTranslateFields(fieldsToTranslate);
            if (!results) return;

            setData(prev => ({
                ...prev,
                about_vision: {
                    ...prev.about_vision,
                    en: results.en?.about_vision || prev.about_vision.en,
                    ar: results.ar?.about_vision || prev.about_vision.ar,
                },
                about_mission: {
                    ...prev.about_mission,
                    en: results.en?.about_mission || prev.about_mission.en,
                    ar: results.ar?.about_mission || prev.about_mission.ar,
                },
                about_values: {
                    ...prev.about_values,
                    en: results.en?.about_values || prev.about_values.en,
                    ar: results.ar?.about_values || prev.about_values.ar,
                },
            }));

            toast.success('Profil Lembaga (Visi, Misi, Nilai) berhasil diterjemahkan ke EN & AR!');
        } catch (err: any) {
            toast.error(err?.message || 'Gagal menerjemahkan Profil Lembaga');
        } finally {
            setIsTranslatingAbout(false);
        }
    };

    const handleTranslateFooter = async () => {
        if (!data.footer_description.id) {
            toast.error('Isi deskripsi footer dalam Bahasa Indonesia terlebih dahulu.');
            return;
        }

        setIsTranslatingFooter(true);
        try {
            const results = await autoTranslateFields({
                footer_description: data.footer_description.id,
            });
            if (!results) return;

            setData(prev => ({
                ...prev,
                footer_description: {
                    ...prev.footer_description,
                    en: results.en?.footer_description || prev.footer_description.en,
                    ar: results.ar?.footer_description || prev.footer_description.ar,
                },
            }));

            toast.success('Deskripsi footer berhasil diterjemahkan ke EN & AR!');
        } catch (err: any) {
            toast.error(err?.message || 'Gagal menerjemahkan Deskripsi Footer');
        } finally {
            setIsTranslatingFooter(false);
        }
    };

    const handleTranslateAnnouncement = async () => {
        if (!data.announcement_text.id) {
            toast.error('Isi teks pengumuman dalam Bahasa Indonesia terlebih dahulu.');
            return;
        }

        setIsTranslatingAnnouncement(true);
        try {
            const results = await autoTranslateFields({
                announcement_text: data.announcement_text.id,
            });
            if (!results) return;

            setData(prev => ({
                ...prev,
                announcement_text: {
                    ...prev.announcement_text,
                    en: results.en?.announcement_text || prev.announcement_text.en,
                    ar: results.ar?.announcement_text || prev.announcement_text.ar,
                },
            }));

            toast.success('Teks pengumuman berhasil diterjemahkan ke EN & AR!');
        } catch (err: any) {
            toast.error(err?.message || 'Gagal menerjemahkan Pengumuman');
        } finally {
            setIsTranslatingAnnouncement(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/site-settings', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan website berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan. Silakan periksa tab yang memiliki pesan error.');
            },
        });
    };

    return (
        <>
            <Head title="Pengaturan Website" />

            <div className="space-y-6 pb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 pb-5 dark:border-gray-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Pengaturan Website
                        </h1>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Kelola identitas resmi, informasi kontak, profil yayasan, pengesahan dokumen, dan konfigurasi integrasi situs.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {recentlySuccessful && (
                            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Tersimpan
                            </span>
                        )}
                        <Button 
                            onClick={handleSubmit} 
                            disabled={processing}
                            className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs rounded-xl text-xs font-semibold h-9 px-4"
                        >
                            <Save className="w-3.5 h-3.5 mr-1.5" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </div>

                {/* Segmented Tab Navigation */}
                <SettingsTabNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    errors={errors}
                />

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tab 1: Umum & Kontak */}
                    {activeTab === 'general' && (
                        <GeneralContactTab
                            data={data}
                            setData={(key, val) => setData(key as any, val)}
                            errors={errors}
                        />
                    )}

                    {/* Tab 2: Identitas & Media */}
                    {activeTab === 'branding' && (
                        <BrandingMediaTab
                            data={data}
                            setData={(key, val) => setData(key as any, val)}
                            settings={settings}
                            errors={errors}
                            previews={{
                                logo: logoPreview,
                                logoWhite: logoWhitePreview,
                                favicon: faviconPreview,
                                qris: qrisPreview,
                            }}
                            onFileChange={handleFileChange}
                            onTranslateFooter={handleTranslateFooter}
                            isTranslatingFooter={isTranslatingFooter}
                        />
                    )}

                    {/* Tab 3: Profil Lembaga */}
                    {activeTab === 'profile' && (
                        <AboutProfileTab
                            data={data}
                            setData={(key, val) => setData(key as any, val)}
                            errors={errors}
                            onTranslateAbout={handleTranslateAbout}
                            isTranslatingAbout={isTranslatingAbout}
                        />
                    )}

                    {/* Tab 4: Legalitas & Kwitansi */}
                    {activeTab === 'legal' && (
                        <LegalReceiptTab
                            data={data}
                            setData={(key, val) => setData(key as any, val)}
                            settings={settings}
                            errors={errors}
                            previews={{
                                stamp: stampPreview,
                                signature: signaturePreview,
                            }}
                            onFileChange={handleFileChange}
                        />
                    )}

                    {/* Tab 5: Pengumuman Global */}
                    {activeTab === 'announcement' && (
                        <AnnouncementTab
                            data={data}
                            setData={(key, val) => setData(key as any, val)}
                            errors={errors}
                            onTranslateAnnouncement={handleTranslateAnnouncement}
                            isTranslatingAnnouncement={isTranslatingAnnouncement}
                        />
                    )}

                    {/* Tab 6: Integrasi & Iklan */}
                    {activeTab === 'marketing' && (
                        <MarketingIntegrationTab
                            data={data}
                            setData={(key, val) => setData(key as any, val)}
                            errors={errors}
                        />
                    )}
                </form>
            </div>
        </>
    );
}

SiteSettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Website',
            href: '/admin/site-settings',
        },
    ],
};
