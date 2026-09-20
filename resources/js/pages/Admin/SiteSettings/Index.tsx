import { Head, useForm } from '@inertiajs/react';
import { 
    Phone, 
    Mail, 
    MapPin, 
    Globe, 
    Share2, 
    QrCode, 
    FileText, 
    Save, 
    UploadCloud,
    CheckCircle2
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
