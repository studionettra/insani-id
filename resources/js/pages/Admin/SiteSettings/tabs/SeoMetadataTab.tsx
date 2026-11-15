import React from 'react';
import { 
    Search, 
    Globe, 
    Info, 
    Heart, 
    Compass, 
    Phone, 
    FileText, 
    CheckCircle2, 
    Layers,
    ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SeoMetadataTabProps {
    data: Record<string, any>;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

interface PageSeoConfig {
    id: string;
    pageName: string;
    urlPath: string;
    icon: React.ComponentType<{ className?: string }>;
    titleKey: string;
    descKey: string;
    defaultTitle: string;
    defaultDesc: string;
    helperHint: string;
}

export default function SeoMetadataTab({
    data,
    setData,
    errors,
}: SeoMetadataTabProps) {
    const siteName = 'Insani Indonesia';
    const baseUrl = 'https://insani.id';

    const pages: PageSeoConfig[] = [
        {
            id: 'home',
            pageName: 'Halaman Beranda',
            urlPath: '/',
            icon: Globe,
            titleKey: 'seo_home_title',
            descKey: 'seo_home_description',
            defaultTitle: siteName,
            defaultDesc: 'Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan.',
            helperHint: 'Ditampilkan di hasil pencarian utama saat pengguna mencari nama brand "Insani Indonesia".'
        },
        {
            id: 'program',
            pageName: 'Katalog Program Donasi',
            urlPath: '/program',
            icon: Heart,
            titleKey: 'seo_program_title',
            descKey: 'seo_program_description',
            defaultTitle: `Daftar Program Donasi - ${siteName}`,
            defaultDesc: 'Pilihan program donasi dan galang dana kemanusiaan, pendidikan, air bersih, serta santunan yatim terpercaya bersama Insani Indonesia.',
            helperHint: 'Kandidat utama Sitelink Google untuk katalog seluruh kampanye galang dana.'
        },
        {
            id: 'about',
            pageName: 'Tentang Kami',
            urlPath: '/tentang-kami',
            icon: Info,
            titleKey: 'seo_about_title',
            descKey: 'seo_about_description',
            defaultTitle: `Tentang Kami - Profil Yayasan ${siteName}`,
            defaultDesc: 'Mengenal Yayasan Peduli Insani Indonesia, visi misi, legalitas resmi Kemenkumham, serta komitmen transparansi kelembagaan.',
            helperHint: 'Kandidat utama Sitelink Google untuk informasi profil lembaga dan legalitas yayasan.'
        },
        {
            id: 'blog',
            pageName: 'Kabar Penyaluran',
            urlPath: '/kabar',
            icon: FileText,
            titleKey: 'seo_blog_title',
            descKey: 'seo_blog_description',
            defaultTitle: `Kabar Penyaluran & Berita Kebaikan - ${siteName}`,
            defaultDesc: 'Dokumentasi realisasi program, laporan penyaluran bantuan kemanusiaan, dan kabar kebaikan terkini dari relawan di lapangan.',
            helperHint: 'Kandidat utama Sitelink Google untuk portal dokumentasi berita dan transparansi aksi nyata.'
        },
        {
            id: 'focus',
            pageName: 'Fokus Program',
            urlPath: '/fokus-program',
            icon: Compass,
            titleKey: 'seo_focus_title',
            descKey: 'seo_focus_description',
            defaultTitle: `Fokus Program Kebaikan - ${siteName}`,
            defaultDesc: 'Pilar program kebaikan Insani Indonesia: Bantuan Kemanusiaan, Ketahanan Pangan, Ketersediaan Air, Pendidikan, Pemberdayaan, dan Kesehatan.',
            helperHint: 'Sitelink yang saat ini sudah aktif di Google; sesuaikan agar cuplikan di bawahnya tidak duplikat dengan beranda.'
        },
        {
            id: 'contact',
            pageName: 'Hubungi Kami',
            urlPath: '/kontak',
            icon: Phone,
            titleKey: 'seo_contact_title',
            descKey: 'seo_contact_description',
            defaultTitle: `Hubungi Kami - Layanan Donatur ${siteName}`,
            defaultDesc: 'Kantor layanan donatur Yayasan Peduli Insani Indonesia. Layanan informasi donasi, konfirmasi transfer, kemitraan, dan konsultasi program.',
            helperHint: 'Sitelink yang saat ini sudah aktif di Google; nomor kontak donatur otomatis diekstrak Google ke cuplikan.'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Kartu Edukasi Sitelinks Google */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-xs">
                        <Search className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                Pengaturan Meta SEO & Cuplikan Sitelink Google
                            </h2>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full">
                                <Layers className="w-3 h-3" /> Schema JSON-LD Aktif
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Google menampilkan tautan sub-halaman (*Sitelinks*) secara otomatis berdasarkan otoritas dan keunikan teks deskripsi. 
                            Pastikan setiap halaman memiliki judul dan deskripsi yang <strong>berbeda, padat, dan informatif</strong> agar Googlebot tidak menganggapnya sebagai konten duplikat.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form & Live SERP Preview untuk Masing-Masing Halaman */}
            <div className="space-y-6">
                {pages.map((page) => {
                    const PageIcon = page.icon;
                    const currentTitle = data[page.titleKey] || '';
                    const currentDesc = data[page.descKey] || '';
                    const displayTitle = currentTitle.trim() || page.defaultTitle;
                    const displayDesc = currentDesc.trim() || page.defaultDesc;
                    const previewUrl = page.urlPath === '/' ? baseUrl : `${baseUrl}${page.urlPath}`;

                    const titleLen = currentTitle.length;
                    const descLen = currentDesc.length;

                    return (
                        <div 
                            key={page.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5 transition-all"
                        >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                        <PageIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                {page.pageName}
                                            </h3>
                                            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                                                {page.urlPath}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {page.helperHint}
                                        </p>
                                    </div>
                                </div>

                                <a 
                                    href={previewUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors self-start sm:self-auto"
                                >
                                    <span>Buka Halaman</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            {/* Live Google Search Card Preview */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                                        i
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[12px] text-gray-800 dark:text-gray-200 font-medium">
                                            {siteName}
                                        </span>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                            {previewUrl}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="text-[17px] text-[#1a0dab] dark:text-[#8ab4f8] font-normal hover:underline cursor-pointer leading-snug line-clamp-1">
                                    {displayTitle}
                                </h4>
                                <p className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                                    {displayDesc}
                                </p>
                            </div>

                            {/* Form Input Fields */}
                            <div className="grid grid-cols-1 gap-4 pt-1">
                                {/* Title Input */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor={page.titleKey} className="text-xs font-semibold">
                                            Meta Title (Judul Pencarian Google)
                                        </Label>
                                        <span className={`text-[11px] font-mono ${titleLen > 65 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-400'}`}>
                                            {titleLen > 0 ? `${titleLen} / 60 karakter` : 'Menggunakan judul baku'}
                                        </span>
                                    </div>
                                    <Input
                                        id={page.titleKey}
                                        value={currentTitle}
                                        onChange={(e) => setData(page.titleKey, e.target.value)}
                                        placeholder={`Default: ${page.defaultTitle}`}
                                        className="h-10 text-sm"
                                        maxLength={150}
                                    />
                                    {errors[page.titleKey] && (
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors[page.titleKey]}</p>
                                    )}
                                </div>

                                {/* Description Textarea */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor={page.descKey} className="text-xs font-semibold">
                                            Meta Description (Cuplikan Teks Sitelink)
                                        </Label>
                                        <span className={`text-[11px] font-mono ${descLen > 160 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-400'}`}>
                                            {descLen > 0 ? `${descLen} / 160 karakter` : 'Menggunakan deskripsi baku'}
                                        </span>
                                    </div>
                                    <Textarea
                                        id={page.descKey}
                                        value={currentDesc}
                                        onChange={(e) => setData(page.descKey, e.target.value)}
                                        placeholder={`Default: ${page.defaultDesc}`}
                                        className="text-sm min-h-[75px] resize-y"
                                        maxLength={300}
                                    />
                                    {errors[page.descKey] && (
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors[page.descKey]}</p>
                                    )}
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Kosongkan jika ingin menggunakan kalimat baku rekomendasi sistem di atas secara otomatis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
