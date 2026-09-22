import { Head, useForm } from '@inertiajs/react';
import { 
    Phone, 
    Share2, 
    QrCode, 
    FileText, 
    Save, 
    UploadCloud,
    CheckCircle2,
    BarChart3,
    Sparkles,
    Info,
    Megaphone,
    ShieldCheck,
    Globe,
    ExternalLink
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    settings: Record<string, string>;
}

export default function SiteSettingsIndex({ settings }: Props) {
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
        about_vision: settings.about_vision || '',
        about_mission: settings.about_mission || '',
        about_values: settings.about_values || '',
        social_facebook: settings.social_facebook || 'https://www.facebook.com/insaniindonesia',
        social_instagram: settings.social_instagram || 'https://www.instagram.com/insaniindonesia',
        social_youtube: settings.social_youtube || 'https://www.youtube.com/@insaniindonesia',
        social_x: settings.social_x || 'https://x.com/officialinsani',
        social_threads: settings.social_threads || 'https://www.threads.com/@insaniindonesia',
        footer_description: settings.footer_description || 'Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan universal.',
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
        announcement_text: settings.announcement_text || '',
        announcement_link: settings.announcement_link || '',
        announcement_bg_color: settings.announcement_bg_color || '#1A56DB',
        site_logo: null as File | null,
        site_logo_white: null as File | null,
        site_favicon: null as File | null,
        qris_image: null as File | null,
        google_tag_manager_id: settings.google_tag_manager_id || '',
        google_analytics_id: settings.google_analytics_id || '',
        meta_pixel_id: settings.meta_pixel_id || '',
        tiktok_pixel_id: settings.tiktok_pixel_id || '',
        adsense_enabled: settings.adsense_enabled || '0',
        google_adsense_client_id: settings.google_adsense_client_id || '',
        adsense_slot_blog_index: settings.adsense_slot_blog_index || '',
        adsense_slot_article_top: settings.adsense_slot_article_top || '',
        adsense_slot_article_middle: settings.adsense_slot_article_middle || '',
        adsense_slot_article_bottom: settings.adsense_slot_article_bottom || '',
        ads_txt_content: settings.ads_txt_content || '',
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [stampPreview, setStampPreview] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoWhitePreview, setLogoWhitePreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('qris_image', file);

        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/site-settings', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const currentQrisUrl = previewUrl || (settings.qris_image ? `/storage/${settings.qris_image}` : '/images/qris/logo-qris-insani.webp');

    return (
        <>
            <Head title="Pengaturan Website" />

            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Pengaturan Website
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola kontak resmi, tautan media sosial, teks profil footer, dan barcode QRIS donasi cepat.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {recentlySuccessful && (
                            <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400 animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Tersimpan
                            </span>
                        )}
                        <Button 
                            onClick={handleSubmit} 
                            disabled={processing}
                            className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Kolom Kiri: Kontak & Medsos */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Card 1: Kontak & Lokasi */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Kontak & Lokasi Yayasan</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Informasi kontak yang ditampilkan kepada publik dan donatur.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contact_whatsapp">Nomor WhatsApp Resmi (Footer)</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="contact_whatsapp"
                                                    value={data.contact_whatsapp}
                                                    onChange={(e) => setData('contact_whatsapp', e.target.value)}
                                                    placeholder="cth: 081319456675"
                                                    className="pl-3"
                                                />
                                            </div>
                                            {errors.contact_whatsapp && <p className="text-xs text-red-500 mt-1">{errors.contact_whatsapp}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="contact_phone">Telepon Kantor Resmi</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="contact_phone"
                                                    value={data.contact_phone}
                                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                                    placeholder="cth: (021) 27871199"
                                                    className="pl-3"
                                                />
                                            </div>
                                            {errors.contact_phone && <p className="text-xs text-red-500 mt-1">{errors.contact_phone}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="contact_email">Email Resmi Yayasan</Label>
                                        <div className="relative mt-1">
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                placeholder="sapa@insani.id"
                                                className="pl-3"
                                            />
                                        </div>
                                        {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contact_operating_hours">Jam Operasional Kantor</Label>
                                            <Input
                                                id="contact_operating_hours"
                                                value={data.contact_operating_hours}
                                                onChange={(e) => setData('contact_operating_hours', e.target.value)}
                                                placeholder="Senin - Jum'at | 10:00 - 18.00 WIB"
                                                className="mt-1"
                                            />
                                            {errors.contact_operating_hours && <p className="text-xs text-red-500 mt-1">{errors.contact_operating_hours}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="contact_holiday_note">Catatan Hari Libur</Label>
                                            <Input
                                                id="contact_holiday_note"
                                                value={data.contact_holiday_note}
                                                onChange={(e) => setData('contact_holiday_note', e.target.value)}
                                                placeholder="Tutup Pada Tanggal Merah & Cuti Bersama"
                                                className="mt-1"
                                            />
                                            {errors.contact_holiday_note && <p className="text-xs text-red-500 mt-1">{errors.contact_holiday_note}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="contact_address">Alamat Kantor Yayasan</Label>
                                        <textarea
                                            id="contact_address"
                                            rows={2}
                                            value={data.contact_address}
                                            onChange={(e) => setData('contact_address', e.target.value)}
                                            placeholder="Alamat kantor lengkap yayasan..."
                                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                                        />
                                        {errors.contact_address && <p className="text-xs text-red-500 mt-1">{errors.contact_address}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="contact_maps_url">Link Google Maps (Opsional / Embed)</Label>
                                        <Input
                                            id="contact_maps_url"
                                            value={data.contact_maps_url}
                                            onChange={(e) => setData('contact_maps_url', e.target.value)}
                                            placeholder="https://maps.google.com/..."
                                            className="mt-1"
                                        />
                                        {errors.contact_maps_url && <p className="text-xs text-red-500 mt-1">{errors.contact_maps_url}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Media Sosial */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                        <Share2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tautan Media Sosial</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ikon dan link akun resmi yayasan di footer website.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="social_instagram">Instagram</Label>
                                        <Input
                                            id="social_instagram"
                                            value={data.social_instagram}
                                            onChange={(e) => setData('social_instagram', e.target.value)}
                                            placeholder="https://www.instagram.com/insaniindonesia"
                                            className="mt-1 text-xs"
                                        />
                                        {errors.social_instagram && <p className="text-xs text-red-500 mt-1">{errors.social_instagram}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="social_facebook">Facebook</Label>
                                        <Input
                                            id="social_facebook"
                                            value={data.social_facebook}
                                            onChange={(e) => setData('social_facebook', e.target.value)}
                                            placeholder="https://www.facebook.com/insaniindonesia"
                                            className="mt-1 text-xs"
                                        />
                                        {errors.social_facebook && <p className="text-xs text-red-500 mt-1">{errors.social_facebook}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="social_youtube">YouTube</Label>
                                        <Input
                                            id="social_youtube"
                                            value={data.social_youtube}
                                            onChange={(e) => setData('social_youtube', e.target.value)}
                                            placeholder="https://www.youtube.com/@insaniindonesia"
                                            className="mt-1 text-xs"
                                        />
                                        {errors.social_youtube && <p className="text-xs text-red-500 mt-1">{errors.social_youtube}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="social_x">X (Twitter)</Label>
                                        <Input
                                            id="social_x"
                                            value={data.social_x}
                                            onChange={(e) => setData('social_x', e.target.value)}
                                            placeholder="https://x.com/officialinsani"
                                            className="mt-1 text-xs"
                                        />
                                        {errors.social_x && <p className="text-xs text-red-500 mt-1">{errors.social_x}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="social_threads">Threads</Label>
                                        <Input
                                            id="social_threads"
                                            value={data.social_threads}
                                            onChange={(e) => setData('social_threads', e.target.value)}
                                            placeholder="https://www.threads.com/@insaniindonesia"
                                            className="mt-1 text-xs"
                                        />
                                        {errors.social_threads && <p className="text-xs text-red-500 mt-1">{errors.social_threads}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Card: Layanan Kontak Divisi (Halaman Kontak) */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Kontak Divisi Layanan (Halaman Kontak)</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Nomor WhatsApp dan email spesifik untuk dukungan donatur, konfirmasi transfer, dan kemitraan.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contact_donor_support_wa">WhatsApp Dukungan Donatur</Label>
                                            <Input
                                                id="contact_donor_support_wa"
                                                value={data.contact_donor_support_wa}
                                                onChange={(e) => setData('contact_donor_support_wa', e.target.value)}
                                                placeholder="081319456675"
                                                className="mt-1"
                                            />
                                            {errors.contact_donor_support_wa && <p className="text-xs text-red-500 mt-1">{errors.contact_donor_support_wa}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="contact_donation_confirm_wa">WhatsApp Konfirmasi Donasi</Label>
                                            <Input
                                                id="contact_donation_confirm_wa"
                                                value={data.contact_donation_confirm_wa}
                                                onChange={(e) => setData('contact_donation_confirm_wa', e.target.value)}
                                                placeholder="0895373388880"
                                                className="mt-1"
                                            />
                                            {errors.contact_donation_confirm_wa && <p className="text-xs text-red-500 mt-1">{errors.contact_donation_confirm_wa}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contact_partnership_wa">WhatsApp Kemitraan Lembaga</Label>
                                            <Input
                                                id="contact_partnership_wa"
                                                value={data.contact_partnership_wa}
                                                onChange={(e) => setData('contact_partnership_wa', e.target.value)}
                                                placeholder="082124837496"
                                                className="mt-1"
                                            />
                                            {errors.contact_partnership_wa && <p className="text-xs text-red-500 mt-1">{errors.contact_partnership_wa}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="contact_finance_email">Email Khusus Keuangan</Label>
                                            <Input
                                                id="contact_finance_email"
                                                type="email"
                                                value={data.contact_finance_email}
                                                onChange={(e) => setData('contact_finance_email', e.target.value)}
                                                placeholder="financial@insani.id"
                                                className="mt-1"
                                            />
                                            {errors.contact_finance_email && <p className="text-xs text-red-500 mt-1">{errors.contact_finance_email}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Profil Lembaga - Visi, Misi & Nilai Perjuangan */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profil Lembaga: Visi, Misi & Nilai</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Konten landasan gerak yang ditampilkan di halaman Tentang Kami (/tentang-kami).</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="about_vision">Visi Yayasan</Label>
                                        <textarea
                                            id="about_vision"
                                            rows={3}
                                            value={data.about_vision}
                                            onChange={(e) => setData('about_vision', e.target.value)}
                                            placeholder="Menjadi pelopor kolaborasi kebaikan lintas batas demi mewujudkan masyarakat yang berdaya..."
                                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Kosongkan jika ingin menggunakan rumusan visi baku bawaan sistem.</p>
                                        {errors.about_vision && <p className="text-xs text-red-500 mt-1">{errors.about_vision}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="about_mission">Misi Yayasan (Gunakan baris baru untuk setiap butir misi)</Label>
                                        <textarea
                                            id="about_mission"
                                            rows={4}
                                            value={data.about_mission}
                                            onChange={(e) => setData('about_mission', e.target.value)}
                                            placeholder="Menggalang kepedulian masyarakat...&#10;Memberikan bantuan tepat sasaran...&#10;Mengedukasi masyarakat..."
                                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Setiap baris baru akan dirender sebagai butir poin misi terpisah.</p>
                                        {errors.about_mission && <p className="text-xs text-red-500 mt-1">{errors.about_mission}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="about_values">Nilai-Nilai Perjuangan (Format: Judul: Keterangan per baris)</Label>
                                        <textarea
                                            id="about_values"
                                            rows={4}
                                            value={data.about_values}
                                            onChange={(e) => setData('about_values', e.target.value)}
                                            placeholder="Integritas: Transparan dan akuntabel dalam pengelolaan amanah donatur.&#10;Kolaborasi: Bersinergi dengan semua pihak untuk dampak yang lebih luas.&#10;Empati: Bergerak dari panggilan hati nurani untuk meringankan beban sesama."
                                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Contoh format: <code>Integritas: Transparan dan akuntabel...</code> (1 nilai per baris).</p>
                                        {errors.about_values && <p className="text-xs text-red-500 mt-1">{errors.about_values}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Card: Legalitas Yayasan & SK Kemenkumham */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Legalitas Yayasan & SK Kemenkumham</h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Informasi badan hukum resmi yang ditampilkan pada fat footer dan kwitansi donasi.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="show_sk_in_footer" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Tampilkan di Footer
                                        </Label>
                                        <Switch
                                            id="show_sk_in_footer"
                                            checked={data.show_sk_in_footer === '1'}
                                            onCheckedChange={(checked) => setData('show_sk_in_footer', checked ? '1' : '0')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="legal_foundation_name">Nama Resmi Badan Hukum Yayasan</Label>
                                        <Input
                                            id="legal_foundation_name"
                                            value={data.legal_foundation_name}
                                            onChange={(e) => setData('legal_foundation_name', e.target.value)}
                                            placeholder="cth: Yayasan Peduli Insani Indonesia"
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Nama badan hukum resmi yang tercantum pada hak cipta footer dan dokumen tanda terima donasi.</p>
                                        {errors.legal_foundation_name && <p className="text-xs text-red-500 mt-1">{errors.legal_foundation_name}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="legal_sk_label">Label SK Footer</Label>
                                            <Input
                                                id="legal_sk_label"
                                                value={data.legal_sk_label}
                                                onChange={(e) => setData('legal_sk_label', e.target.value)}
                                                placeholder="cth: SK Kemenkumham RI"
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Label pengenal di samping nomor SK (default: <em>SK Kemenkumham RI</em>).</p>
                                            {errors.legal_sk_label && <p className="text-xs text-red-500 mt-1">{errors.legal_sk_label}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="legal_sk_kemenkumham">Nomor SK Kemenkumham RI</Label>
                                            <Input
                                                id="legal_sk_kemenkumham"
                                                value={data.legal_sk_kemenkumham}
                                                onChange={(e) => setData('legal_sk_kemenkumham', e.target.value)}
                                                placeholder="cth: AHU-0002557.AH.01.04.Tahun 2019"
                                                className="mt-1 font-mono text-xs"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Nomor surat keputusan pengesahan pendirian atau perubahan aktif dari Kemenkumham.</p>
                                            {errors.legal_sk_kemenkumham && <p className="text-xs text-red-500 mt-1">{errors.legal_sk_kemenkumham}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="legal_operational_permit">Izin Operasional / PUB Kemensos (Opsional)</Label>
                                            <Input
                                                id="legal_operational_permit"
                                                value={data.legal_operational_permit}
                                                onChange={(e) => setData('legal_operational_permit', e.target.value)}
                                                placeholder="cth: SK Kemensos No. xxx/HUK-PS/2024"
                                                className="mt-1"
                                            />
                                            {errors.legal_operational_permit && <p className="text-xs text-red-500 mt-1">{errors.legal_operational_permit}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="legal_npwp">NPWP Lembaga (Opsional)</Label>
                                            <Input
                                                id="legal_npwp"
                                                value={data.legal_npwp}
                                                onChange={(e) => setData('legal_npwp', e.target.value)}
                                                placeholder="cth: 00.000.000.0-000.000"
                                                className="mt-1"
                                            />
                                            {errors.legal_npwp && <p className="text-xs text-red-500 mt-1">{errors.legal_npwp}</p>}
                                        </div>
                                    </div>

                                    {/* Live Preview Box */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                                            Pratinjau Tampilan Footer Bawah (Live Preview)
                                        </span>
                                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-center gap-3">
                                            <p className="text-center sm:text-left text-slate-400">
                                                &copy; {new Date().getFullYear()} {data.legal_foundation_name || 'Yayasan Peduli Insani Indonesia'}. Hak cipta dilindungi.
                                            </p>
                                            {data.show_sk_in_footer === '1' ? (
                                                <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                    <span>
                                                        {data.legal_sk_label || 'SK Kemenkumham RI'}: <strong className="text-white font-medium">{data.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.Tahun 2019'}</strong>
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-amber-400/80 italic">(Badge SK disembunyikan dari footer)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Footer & QRIS */}
                        <div className="lg:col-span-5 space-y-8">
                            {/* Card 3: Profil Footer */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profil Footer Website</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Deskripsi singkat di bawah logo pada bagian footer.</p>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="footer_description">Teks Ringkasan Profil</Label>
                                    <textarea
                                        id="footer_description"
                                        rows={4}
                                        value={data.footer_description}
                                        onChange={(e) => setData('footer_description', e.target.value)}
                                        placeholder="Deskripsi singkat yayasan..."
                                        className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                                    />
                                    {errors.footer_description && <p className="text-xs text-red-500 mt-1">{errors.footer_description}</p>}
                                </div>
                            </div>

                            {/* Card 4: QRIS Donasi Cepat */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">QRIS Donasi Cepat</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Gambar barcode QRIS resmi yayasan di footer.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <div className="bg-white p-2.5 rounded-xl shadow-xs mb-4">
                                        <img 
                                            src={currentQrisUrl} 
                                            alt="QRIS Donasi Preview" 
                                            className="w-44 h-auto rounded-lg object-contain" 
                                        />
                                    </div>

                                    <label className="cursor-pointer">
                                        <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs transition-colors">
                                            <UploadCloud className="w-4 h-4 mr-2 text-brand-600" />
                                            {data.qris_image ? 'Ganti File Gambar' : 'Unggah Barcode QRIS Baru'}
                                        </div>
                                        <input 
                                            type="file" 
                                            accept="image/png,image/jpeg,image/webp" 
                                            className="hidden" 
                                            onChange={handleFileChange} 
                                        />
                                    </label>
                                    <p className="text-[11px] text-gray-400 mt-2 text-center">
                                        Format: PNG, JPG, atau WebP (Maks 3 MB)
                                    </p>
                                    {errors.qris_image && <p className="text-xs text-red-500 mt-1">{errors.qris_image}</p>}
                                </div>
                            </div>

                            {/* Card: Identitas Visual & Branding */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Identitas Visual & Branding</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Logo lembaga dan favicon browser.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="site_logo" className="text-xs font-semibold">Logo Utama Website (Header & Kwitansi)</Label>
                                        <div className="mt-1.5 flex items-center gap-3">
                                            {(logoPreview || settings.site_logo) && (
                                                <div className="h-12 w-28 bg-slate-100 dark:bg-slate-900 rounded-lg p-1.5 flex items-center justify-center border border-slate-200">
                                                    <img 
                                                        src={logoPreview || `/storage/${settings.site_logo}`} 
                                                        alt="Logo Preview" 
                                                        className="h-full w-auto object-contain" 
                                                    />
                                                </div>
                                            )}
                                            <label className="flex-1 cursor-pointer">
                                                <div className="px-3 py-2 text-xs border border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-insani-blue text-center">
                                                    Pilih file logo PNG/SVG...
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept="image/png,image/svg+xml,image/webp,image/jpeg" 
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0] || null;
                                                        setData('site_logo', f);
                                                        setLogoPreview(f ? URL.createObjectURL(f) : null);
                                                    }} 
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="site_favicon" className="text-xs font-semibold">Favicon Browser (.ico / .png / .svg)</Label>
                                        <div className="mt-1.5 flex items-center gap-3">
                                            {(faviconPreview || settings.site_favicon) && (
                                                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-900 rounded-lg p-1.5 flex items-center justify-center border border-slate-200">
                                                    <img 
                                                        src={faviconPreview || `/storage/${settings.site_favicon}`} 
                                                        alt="Favicon" 
                                                        className="h-full w-auto object-contain" 
                                                    />
                                                </div>
                                            )}
                                            <label className="flex-1 cursor-pointer">
                                                <div className="px-3 py-2 text-xs border border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-insani-blue text-center">
                                                    Pilih file favicon...
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept=".ico,image/png,image/svg+xml" 
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0] || null;
                                                        setData('site_favicon', f);
                                                        setFaviconPreview(f ? URL.createObjectURL(f) : null);
                                                    }} 
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Pengesahan Kwitansi Resmi Donasi */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pengesahan Kwitansi Donasi</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pejabat penandatangan dan stempel resmi pada e-receipt donatur.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="receipt_signatory_name" className="text-xs">Nama Lengkap Penandatangan</Label>
                                        <Input
                                            id="receipt_signatory_name"
                                            value={data.receipt_signatory_name}
                                            onChange={(e) => setData('receipt_signatory_name', e.target.value)}
                                            placeholder="cth: H. Muhammad Ihsan, S.Sos"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="receipt_signatory_title" className="text-xs">Jabatan Lembaga</Label>
                                        <Input
                                            id="receipt_signatory_title"
                                            value={data.receipt_signatory_title}
                                            onChange={(e) => setData('receipt_signatory_title', e.target.value)}
                                            placeholder="cth: Direktur Eksekutif Yayasan"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <div>
                                            <Label className="text-xs">Stempel Resmi (PNG Transparan)</Label>
                                            <div className="mt-1">
                                                {(stampPreview || settings.receipt_stamp_image) && (
                                                    <div className="h-16 w-full bg-slate-100 rounded-lg p-2 flex items-center justify-center border mb-1">
                                                        <img 
                                                            src={stampPreview || `/storage/${settings.receipt_stamp_image}`} 
                                                            alt="Stempel" 
                                                            className="h-full object-contain" 
                                                        />
                                                    </div>
                                                )}
                                                <label className="cursor-pointer block">
                                                    <div className="px-2 py-1.5 text-[11px] border border-dashed rounded-lg text-slate-600 hover:border-insani-blue text-center">
                                                        Upload Stempel...
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/png,image/webp" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0] || null;
                                                            setData('receipt_stamp_image', f);
                                                            setStampPreview(f ? URL.createObjectURL(f) : null);
                                                        }} 
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-xs">Tanda Tangan Digital (PNG)</Label>
                                            <div className="mt-1">
                                                {(signaturePreview || settings.receipt_signature_image) && (
                                                    <div className="h-16 w-full bg-slate-100 rounded-lg p-2 flex items-center justify-center border mb-1">
                                                        <img 
                                                            src={signaturePreview || `/storage/${settings.receipt_signature_image}`} 
                                                            alt="Tanda Tangan" 
                                                            className="h-full object-contain" 
                                                        />
                                                    </div>
                                                )}
                                                <label className="cursor-pointer block">
                                                    <div className="px-2 py-1.5 text-[11px] border border-dashed rounded-lg text-slate-600 hover:border-insani-blue text-center">
                                                        Upload TTD...
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/png,image/webp" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0] || null;
                                                            setData('receipt_signature_image', f);
                                                            setSignaturePreview(f ? URL.createObjectURL(f) : null);
                                                        }} 
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Bilah Pengumuman Global (Announcement Bar) */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                            <Megaphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Bilah Pengumuman Global</h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Tampilkan banner darurat / pengumuman penting di bagian paling atas website.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={data.announcement_enabled === '1'}
                                            onCheckedChange={(checked) => setData('announcement_enabled', checked ? '1' : '0')}
                                        />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {data.announcement_enabled === '1' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="announcement_text" className="text-xs">Teks Pengumuman / Peringatan</Label>
                                        <Input
                                            id="announcement_text"
                                            value={data.announcement_text}
                                            onChange={(e) => setData('announcement_text', e.target.value)}
                                            placeholder="cth: Tanggap Darurat Bencana Banjir Bandang: Salurkan bantuan Anda sekarang!"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="announcement_link" className="text-xs">Tautan Link Tujuan (Opsional)</Label>
                                            <Input
                                                id="announcement_link"
                                                value={data.announcement_link}
                                                onChange={(e) => setData('announcement_link', e.target.value)}
                                                placeholder="cth: /program/darurat-banjir"
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="announcement_bg_color" className="text-xs">Warna Latar Banner</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input 
                                                    type="color" 
                                                    id="announcement_bg_color"
                                                    value={data.announcement_bg_color}
                                                    onChange={(e) => setData('announcement_bg_color', e.target.value)}
                                                    className="w-10 h-9 p-0.5 rounded border border-slate-200 cursor-pointer"
                                                />
                                                <Input
                                                    value={data.announcement_bg_color}
                                                    onChange={(e) => setData('announcement_bg_color', e.target.value)}
                                                    className="flex-1 font-mono text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Pelacakan & Analitik */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pelacakan & Analitik (GTM & Pixels)</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Konfigurasi container tag dan piksel iklan untuk mengukur trafik dan konversi donasi.</p>
                                </div>
                            </div>
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-full">
                                <Sparkles className="w-3 h-3" /> Hanya aktif di halaman publik
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Google Tag Manager */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="google_tag_manager_id" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        Google Tag Manager (GTM) Container ID
                                    </Label>
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                        Direkomendasikan
                                    </span>
                                </div>
                                <Input
                                    id="google_tag_manager_id"
                                    value={data.google_tag_manager_id}
                                    onChange={(e) => setData('google_tag_manager_id', e.target.value)}
                                    placeholder="cth: GTM-XXXXXXX"
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-gray-400">
                                    Jika GTM diisi, tag GA4 dan Meta Pixel cukup dikelola terpusat di dashboard GTM Anda.
                                </p>
                                {errors.google_tag_manager_id && (
                                    <p className="text-xs text-red-500">{errors.google_tag_manager_id}</p>
                                )}
                            </div>

                            {/* Google Analytics 4 */}
                            <div className="space-y-1.5">
                                <Label htmlFor="google_analytics_id" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Google Analytics 4 (GA4) Measurement ID
                                </Label>
                                <Input
                                    id="google_analytics_id"
                                    value={data.google_analytics_id}
                                    onChange={(e) => setData('google_analytics_id', e.target.value)}
                                    placeholder="cth: G-XXXXXXXXXX"
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-gray-400">
                                    Digunakan langsung jika Anda tidak memasang container GTM di atas.
                                </p>
                                {errors.google_analytics_id && (
                                    <p className="text-xs text-red-500">{errors.google_analytics_id}</p>
                                )}
                            </div>

                            {/* Meta Pixel */}
                            <div className="space-y-1.5">
                                <Label htmlFor="meta_pixel_id" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Meta Pixel ID (Facebook / Instagram Ads)
                                </Label>
                                <Input
                                    id="meta_pixel_id"
                                    value={data.meta_pixel_id}
                                    onChange={(e) => setData('meta_pixel_id', e.target.value)}
                                    placeholder="cth: 123456789012345"
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-gray-400">
                                    ID Piksel Meta untuk melacak konversi iklan dan retargeting donatur.
                                </p>
                                {errors.meta_pixel_id && (
                                    <p className="text-xs text-red-500">{errors.meta_pixel_id}</p>
                                )}
                            </div>

                            {/* TikTok Pixel */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tiktok_pixel_id" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    TikTok Pixel ID (Opsional)
                                </Label>
                                <Input
                                    id="tiktok_pixel_id"
                                    value={data.tiktok_pixel_id}
                                    onChange={(e) => setData('tiktok_pixel_id', e.target.value)}
                                    placeholder="cth: CXXXXXXXXXXXXXXX"
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-gray-400">
                                    ID Piksel TikTok Ads untuk pelacakan iklan video TikTok.
                                </p>
                                {errors.tiktok_pixel_id && (
                                    <p className="text-xs text-red-500">{errors.tiktok_pixel_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-lg flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                            <span>
                                <strong>Catatan Teknis SPA:</strong> Sistem Insani ID secara otomatis mengirimkan <em>Virtual Pageview</em> dan event e-commerce standar (<code>InitiateCheckout</code> dan <code>Purchase</code> / donasi sukses) setiap kali pengunjung berinteraksi dengan website.
                            </span>
                        </div>
                    </div>

                    {/* Card 6: Monetisasi & Google AdSense (Khusus Berita) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                    <Megaphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                            Google AdSense (Monetisasi Khusus Berita)
                                        </h2>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                                            Khusus /berita
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Atur penayangan unit iklan Google AdSense dan file otorisasi publisher ads.txt.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {data.adsense_enabled === '1' ? 'Iklan Aktif' : 'Iklan Nonaktif'}
                                </span>
                                <Switch
                                    checked={data.adsense_enabled === '1'}
                                    onCheckedChange={(checked) => setData('adsense_enabled', checked ? '1' : '0')}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Publisher Client ID */}
                            <div className="space-y-1.5 max-w-xl">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="google_adsense_client_id" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        Google AdSense Publisher ID (Client ID)
                                    </Label>
                                    <span className="text-[10px] font-mono text-gray-500">format: ca-pub-XXXXXXXXXXXXXXXX</span>
                                </div>
                                <Input
                                    id="google_adsense_client_id"
                                    value={data.google_adsense_client_id}
                                    onChange={(e) => setData('google_adsense_client_id', e.target.value)}
                                    placeholder="ca-pub-1234567890123456"
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-gray-400">
                                    Ditemukan di dashboard AdSense Anda (Akun &gt; Pengaturan &gt; Informasi akun).
                                </p>
                                {errors.google_adsense_client_id && (
                                    <p className="text-xs text-red-500">{errors.google_adsense_client_id}</p>
                                )}
                            </div>

                            {/* Slot IDs Grid */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                                    Unit Slot Iklan Berita (Ad Slots)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Slot 1: Blog Index */}
                                    <div className="space-y-1.5 p-3.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                        <Label htmlFor="adsense_slot_blog_index" className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                                            1. Halaman Daftar Berita
                                        </Label>
                                        <p className="text-[11px] text-gray-400">Banner di atas daftar artikel (/berita)</p>
                                        <Input
                                            id="adsense_slot_blog_index"
                                            value={data.adsense_slot_blog_index}
                                            onChange={(e) => setData('adsense_slot_blog_index', e.target.value)}
                                            placeholder="cth: 1234567890"
                                            className="font-mono text-xs mt-1"
                                        />
                                        {errors.adsense_slot_blog_index && (
                                            <p className="text-xs text-red-500">{errors.adsense_slot_blog_index}</p>
                                        )}
                                    </div>

                                    {/* Slot 2: Article Top */}
                                    <div className="space-y-1.5 p-3.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                        <Label htmlFor="adsense_slot_article_top" className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                                            2. Atas Konten Artikel
                                        </Label>
                                        <p className="text-[11px] text-gray-400">Sebelum paragraf awal artikel</p>
                                        <Input
                                            id="adsense_slot_article_top"
                                            value={data.adsense_slot_article_top}
                                            onChange={(e) => setData('adsense_slot_article_top', e.target.value)}
                                            placeholder="cth: 2345678901"
                                            className="font-mono text-xs mt-1"
                                        />
                                        {errors.adsense_slot_article_top && (
                                            <p className="text-xs text-red-500">{errors.adsense_slot_article_top}</p>
                                        )}
                                    </div>

                                    {/* Slot 3: Article Middle (In-Article) */}
                                    <div className="space-y-1.5 p-3.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                        <Label htmlFor="adsense_slot_article_middle" className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                                            3. Tengah Paragraf (In-Article)
                                        </Label>
                                        <p className="text-[11px] text-gray-400">Disisipkan setelah paragraf ke-3</p>
                                        <Input
                                            id="adsense_slot_article_middle"
                                            value={data.adsense_slot_article_middle}
                                            onChange={(e) => setData('adsense_slot_article_middle', e.target.value)}
                                            placeholder="cth: 3456789012"
                                            className="font-mono text-xs mt-1"
                                        />
                                        {errors.adsense_slot_article_middle && (
                                            <p className="text-xs text-red-500">{errors.adsense_slot_article_middle}</p>
                                        )}
                                    </div>

                                    {/* Slot 4: Article Bottom */}
                                    <div className="space-y-1.5 p-3.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                        <Label htmlFor="adsense_slot_article_bottom" className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                                            4. Bawah Konten Artikel
                                        </Label>
                                        <p className="text-[11px] text-gray-400">Sebelum kotak Bagikan Berita</p>
                                        <Input
                                            id="adsense_slot_article_bottom"
                                            value={data.adsense_slot_article_bottom}
                                            onChange={(e) => setData('adsense_slot_article_bottom', e.target.value)}
                                            placeholder="cth: 4567890123"
                                            className="font-mono text-xs mt-1"
                                        />
                                        {errors.adsense_slot_article_bottom && (
                                            <p className="text-xs text-red-500">{errors.adsense_slot_article_bottom}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ads.txt Editor */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <Label htmlFor="ads_txt_content" className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-emerald-600" />
                                        Isi File ads.txt (Otorisasi Publisher)
                                    </Label>
                                    <a 
                                        href="/ads.txt" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-medium"
                                    >
                                        Buka domain.com/ads.txt <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                                <Textarea
                                    id="ads_txt_content"
                                    rows={3}
                                    value={data.ads_txt_content}
                                    onChange={(e) => setData('ads_txt_content', e.target.value)}
                                    placeholder="google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
                                    className="font-mono text-xs leading-relaxed"
                                />
                                <p className="text-xs text-gray-400">
                                    Jika dikosongkan namun <em>Publisher ID</em> di atas diisi, sistem akan otomatis menghasilkan baris standar Google AdSense saat file diakses.
                                </p>
                                {errors.ads_txt_content && (
                                    <p className="text-xs text-red-500">{errors.ads_txt_content}</p>
                                )}
                            </div>

                            {/* Isolation Protection Guarantee Notice */}
                            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-lg flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
                                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                <span>
                                    <strong>Jaminan Isolasi Kebaikan:</strong> Iklan Google AdSense hanya akan dimuat dan ditampilkan pada rute <code>/berita</code> dan <code>/berita/&#123;slug&#125;</code>. Seluruh halaman program, donasi, checkout pembayaran, formulir campaigner, dan dashboard admin dijamin 100% bebas dari script dan tayangan iklan.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Button 
                            type="submit" 
                            disabled={processing}
                            size="lg"
                            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-8 shadow-xs"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}
                        </Button>
                    </div>
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
