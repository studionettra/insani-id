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
        contact_email: settings.contact_email || 'sapa@insani.id',
        contact_address: settings.contact_address || 'Jl. Kebaikan No. 1, Jakarta',
        contact_maps_url: settings.contact_maps_url || 'https://maps.google.com',
        social_facebook: settings.social_facebook || 'https://www.facebook.com/insaniindonesia',
        social_instagram: settings.social_instagram || 'https://www.instagram.com/insaniindonesia',
        social_youtube: settings.social_youtube || 'https://www.youtube.com/@insaniindonesia',
        social_x: settings.social_x || 'https://x.com/officialinsani',
        social_threads: settings.social_threads || 'https://www.threads.com/@insaniindonesia',
        footer_description: settings.footer_description || 'Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan universal.',
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
                                    <div>
                                        <Label htmlFor="contact_whatsapp">Nomor WhatsApp Resmi</Label>
                                        <div className="relative mt-1">
                                            <Input
                                                id="contact_whatsapp"
                                                value={data.contact_whatsapp}
                                                onChange={(e) => setData('contact_whatsapp', e.target.value)}
                                                placeholder="cth: 081319456675 atau 6281319456675"
                                                className="pl-3"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Nomor ini digunakan untuk link chat tombol WhatsApp di Footer.</p>
                                        {errors.contact_whatsapp && <p className="text-xs text-red-500 mt-1">{errors.contact_whatsapp}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="contact_email">Email Resmi</Label>
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
                                        <Label htmlFor="contact_maps_url">Link Google Maps (Opsional)</Label>
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
