import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    ExternalLink, 
    Sparkles, 
    ImageIcon, 
    Video, 
    BarChart2, 
    Plus, 
    Trash2, 
    X, 
    Info, 
    Layers, 
    CheckCircle2, 
    Globe,
    Compass,
    Loader2,
    Check,
    Languages
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { IconPicker, renderStatIcon } from '@/components/ui/icon-picker';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import { autoTranslateFields } from '@/lib/translate';

interface CategoryData {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    pillar_image: string | null;
    reality_source: string | null;
    video_url: string | null;
    stats_metrics: any[] | null;
    distribution_gallery: string[] | null;
    is_focus_program: boolean;
    is_active: boolean;
    sort_order: number;
    name_translations: { id?: string; en?: string; ar?: string };
    public_name_translations: { id?: string; en?: string; ar?: string };
    description_translations: { id?: string; en?: string; ar?: string };
    reality_title_translations: { id?: string; en?: string; ar?: string };
    reality_description_translations: { id?: string; en?: string; ar?: string };
    display_name: string;
}

interface RelatedProgram {
    id: number;
    title: string;
    slug: string;
    target_amount: number;
    collected_amount: number;
    status: string;
}

interface Props {
    category: CategoryData;
    relatedPrograms: RelatedProgram[];
}

export default function FocusProgramEdit({ category, relatedPrograms }: Props) {
    const [activeTab, setActiveTab] = useState<'branding' | 'reality' | 'media' | 'stats'>('branding');
    const [activeLang, setActiveLang] = useState<'id' | 'en' | 'ar'>('id');
    const [coverPreview, setCoverPreview] = useState<string | null>(
        category.pillar_image ? `/storage/${category.pillar_image}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
        public_name: {
            id: category.public_name_translations?.id || '',
            en: category.public_name_translations?.en || '',
            ar: category.public_name_translations?.ar || '',
        },
        description: {
            id: category.description_translations?.id || '',
            en: category.description_translations?.en || '',
            ar: category.description_translations?.ar || '',
        },
        pillar_image: null as File | null,
        reality_title: {
            id: category.reality_title_translations?.id || '',
            en: category.reality_title_translations?.en || '',
            ar: category.reality_title_translations?.ar || '',
        },
        reality_description: {
            id: category.reality_description_translations?.id || '',
            en: category.reality_description_translations?.en || '',
            ar: category.reality_description_translations?.ar || '',
        },
        reality_source: category.reality_source || '',
        video_url: category.video_url || '',
        stats_metrics: Array.isArray(category.stats_metrics) ? category.stats_metrics : [],
        gallery_images: [] as File[],
        existing_gallery: Array.isArray(category.distribution_gallery) ? category.distribution_gallery : [],
        is_focus_program: category.is_focus_program ?? true,
        sort_order: category.sort_order ?? 0,
        _method: 'put',
    });

    const [isTranslating, setIsTranslating] = useState(false);

    const hasEn = Boolean(
        (data.public_name.en || category.name_translations?.en) &&
        (data.description.en || data.reality_title.en)
    );
    const hasAr = Boolean(
        (data.public_name.ar || category.name_translations?.ar) &&
        (data.description.ar || data.reality_title.ar)
    );

    const handleAutoTranslate = async () => {
        const sourcePublicName = data.public_name.id || category.display_name || category.name;
        const sourceDesc = data.description.id || '';
        const sourceRealityTitle = data.reality_title.id || '';
        const sourceRealityDesc = data.reality_description.id || '';

        if (!sourcePublicName.trim() && !sourceDesc.trim() && !sourceRealityTitle.trim()) {
            toast.error('Silakan isi naskah dalam Bahasa Indonesia terlebih dahulu sebelum menerjemahkan.');
            return;
        }

        setIsTranslating(true);
        try {
            const res = await autoTranslateFields({
                public_name: sourcePublicName,
                description: sourceDesc,
                reality_title: sourceRealityTitle,
                reality_description: sourceRealityDesc,
            });

            if (res) {
                setData(prev => ({
                    ...prev,
                    public_name: {
                        id: prev.public_name.id,
                        en: res.public_name?.en || prev.public_name.en,
                        ar: res.public_name?.ar || prev.public_name.ar,
                    },
                    description: {
                        id: prev.description.id,
                        en: res.description?.en || prev.description.en,
                        ar: res.description?.ar || prev.description.ar,
                    },
                    reality_title: {
                        id: prev.reality_title.id,
                        en: res.reality_title?.en || prev.reality_title.en,
                        ar: res.reality_title?.ar || prev.reality_title.ar,
                    },
                    reality_description: {
                        id: prev.reality_description.id,
                        en: res.reality_description?.en || prev.reality_description.en,
                        ar: res.reality_description?.ar || prev.reality_description.ar,
                    },
                }));
            }
        } finally {
            setIsTranslating(false);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setData('pillar_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/focus-programs/${category.id}`);
    };

    // Helper preview YouTube URL
    const getYouTubeEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const youtubeEmbedUrl = getYouTubeEmbedUrl(data.video_url);

    return (
        <>
            <Head title={`Edit Fokus Program - ${category.display_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/focus-programs"
                            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1A56DB] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                                    <Layers className="w-3 h-3" />
                                    <span>Kategori: {category.name_translations?.id || category.name}</span>
                                </span>
                                <span className="text-xs text-gray-400">/fokus-program/{category.slug}</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
                                {data.public_name.id || category.name_translations?.id || category.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={`/fokus-program/${category.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
                        >
                            <span>Live Preview</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-[#1A56DB] hover:bg-[#1e40af] text-white shadow-xs"
                        >
                            <Save className="w-4 h-4 mr-1.5" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </div>

                {/* Main Content Layout (Form Tabs + Sidebar Summary) */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left & Middle: Tab Navigation & Form Panels */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Tab Headers */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('branding')}
                                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === 'branding'
                                        ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>1. Identitas Publik</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('reality')}
                                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === 'reality'
                                        ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Compass className="w-4 h-4" />
                                <span>2. Narasi Realitas</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('media')}
                                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === 'media'
                                        ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Video className="w-4 h-4" />
                                <span>3. Video & Galeri</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('stats')}
                                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === 'stats'
                                        ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <BarChart2 className="w-4 h-4" />
                                <span>4. Metrik Dampak</span>
                            </button>
                        </div>

                        {/* Language Selector Bar (for translatable sections) with Auto-Translate */}
                        {(activeTab === 'branding' || activeTab === 'reality') && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-700">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#1A56DB] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                Pilihan Bahasa Input
                                            </span>
                                            {hasEn && hasAr && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                                    <Check className="w-3 h-3" /> Tersedia EN & AR
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            Admin dapat mengedit naskah bahasa Indonesia, Inggris, dan Arab secara mandiri.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                                    {/* Language Switcher Tabs */}
                                    <div className="inline-flex rounded-lg p-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 text-xs">
                                        {(['id', 'en', 'ar'] as const).map((lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => setActiveLang(lang)}
                                                className={`px-2.5 py-1 font-semibold rounded-md transition-all uppercase ${
                                                    activeLang === lang
                                                        ? 'bg-[#1A56DB] text-white shadow-xs'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                            >
                                                {lang === 'id' ? '🇮🇩 ID' : lang === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Auto-Translate Button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAutoTranslate}
                                        disabled={isTranslating}
                                        className="h-8 text-xs font-semibold border-blue-200 dark:border-blue-800 text-[#1A56DB] dark:text-blue-400 hover:bg-[#1A56DB] hover:text-white transition-colors gap-1.5 shadow-xs bg-white dark:bg-slate-900"
                                    >
                                        {isTranslating ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Menerjemahkan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                <span>Auto-Translate</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* TAB 1: IDENTITAS & BRANDING PUBLIK */}
                        {activeTab === 'branding' && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6 shadow-xs">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                        Identitas & Branding Publik
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Sesuaikan nama fokus program yang tampil di halaman depan dan landing page tanpa mengubah nama kategori sistem.
                                    </p>
                                </div>

                                {/* Informational Box: Kategori Induk */}
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] font-semibold text-gray-400 uppercase">Kategori Sistem Induk</div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {category.name_translations?.id || category.name}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[11px] font-semibold text-gray-400 uppercase">Slug URL Publik</div>
                                        <code className="text-xs text-[#1A56DB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                                            /fokus-program/{category.slug}
                                        </code>
                                    </div>
                                </div>

                                {/* Field: Nama Publik Kustom */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="public_name" className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Nama Publik Fokus Program ({activeLang.toUpperCase()})
                                        </Label>
                                        <span className="text-xs text-gray-400">Opsional / Kustom</span>
                                    </div>
                                    <Input
                                        id="public_name"
                                        placeholder={`Contoh: Insani Cerdas: Lentera Generasi Emas (Fallback: "${category.name_translations?.[activeLang] || category.name}")`}
                                        value={data.public_name[activeLang]}
                                        onChange={(e) => setData('public_name', { ...data.public_name, [activeLang]: e.target.value })}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus-visible:ring-[#1A56DB]"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        💡 <strong>Tips:</strong> Jika dikosongkan, sistem akan otomatis menggunakan nama kategori bawaan (<em>"{category.name_translations?.[activeLang] || category.name}"</em>).
                                    </p>
                                    {errors[`public_name.${activeLang}`] && (
                                        <p className="text-xs text-red-500">{errors[`public_name.${activeLang}`]}</p>
                                    )}
                                </div>

                                {/* Field: Deskripsi / Tagline Singkat */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Deskripsi / Tagline Singkat ({activeLang.toUpperCase()})
                                    </Label>
                                    <Textarea
                                        id="description"
                                        rows={3}
                                        placeholder="Ringkasan dedikasi program untuk ditampilkan pada header hero dan meta deskripsi pencarian..."
                                        value={data.description[activeLang]}
                                        onChange={(e) => setData('description', { ...data.description, [activeLang]: e.target.value })}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus-visible:ring-[#1A56DB]"
                                    />
                                </div>

                                {/* Field: Gambar Cover Hero */}
                                <div className="space-y-3 pt-2">
                                    <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-[#1A56DB]" />
                                        <span>Gambar Cover Hero Fokus Program (Rasio 16:9 / 21:9)</span>
                                    </Label>

                                    {coverPreview && (
                                        <div className="relative aspect-[16/9] w-full max-w-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 group shadow-xs">
                                            <img src={coverPreview} alt="Preview Cover" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                                                Klik tombol upload di bawah untuk mengganti cover
                                            </div>
                                        </div>
                                    )}

                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm cursor-pointer file:text-[#1A56DB]"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Format gambar disarankan: WebP, JPG, atau PNG dengan resolusi minimal 1920x1080 piksel untuk ketajaman optimal pada layar lebar.
                                    </p>
                                    {errors.pillar_image && <p className="text-xs text-red-500">{errors.pillar_image}</p>}
                                </div>

                                {/* Pengaturan Status & Urutan */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sort_order" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            Urutan Tampil (Sort Order)
                                        </Label>
                                        <Input
                                            id="sort_order"
                                            type="number"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm"
                                        />
                                        <p className="text-[11px] text-gray-400">Angka lebih kecil tampil lebih awal di halaman depan.</p>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-6">
                                        <Checkbox 
                                            id="is_focus_program" 
                                            checked={data.is_focus_program}
                                            onCheckedChange={(checked) => setData('is_focus_program', checked === true)}
                                            className="border-gray-300 dark:border-gray-600 text-[#1A56DB] focus:ring-[#1A56DB]"
                                        />
                                        <label htmlFor="is_focus_program" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                            Aktifkan sebagai Fokus Program di Halaman Publik
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: NARASI REALITAS & URGENSI LAPANGAN */}
                        {activeTab === 'reality' && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6 shadow-xs">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                        Narasi Realitas & Urgensi Lapangan
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Bangun empati calon donatur dengan menjelaskan kondisi darurat dan mengapa fokus program bantuan ini sangat krusial.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reality_title" className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Judul Section Realitas / Krisis ({activeLang.toUpperCase()})
                                    </Label>
                                    <Input
                                        id="reality_title"
                                        placeholder="Contoh: Realitas Krisis Ketahanan Pangan & Gizi Buruk"
                                        value={data.reality_title[activeLang]}
                                        onChange={(e) => setData('reality_title', { ...data.reality_title, [activeLang]: e.target.value })}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus-visible:ring-[#1A56DB]"
                                    />
                                    {errors[`reality_title.${activeLang}`] && (
                                        <p className="text-xs text-red-500">{errors[`reality_title.${activeLang}`]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reality_description" className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Narasi Kondisi Lapangan ({activeLang.toUpperCase()})
                                    </Label>
                                    <Textarea
                                        id="reality_description"
                                        rows={6}
                                        placeholder="Ceritakan dengan jelas dan menyentuh kondisi nyata yang dihadapi para penerima manfaat di pelosok, tantangan geografis, dan konsekuensi jika tidak segera dibantu..."
                                        value={data.reality_description[activeLang]}
                                        onChange={(e) => setData('reality_description', { ...data.reality_description, [activeLang]: e.target.value })}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus-visible:ring-[#1A56DB] leading-relaxed"
                                    />
                                    {errors[`reality_description.${activeLang}`] && (
                                        <p className="text-xs text-red-500">{errors[`reality_description.${activeLang}`]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reality_source" className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Sumber Data Resmi / Sitasi Lembaga
                                    </Label>
                                    <Input
                                        id="reality_source"
                                        placeholder="Contoh: Sumber: Data Terpadu Kesejahteraan Sosial (DTKS) 2026 / Laporan UNICEF"
                                        value={data.reality_source}
                                        onChange={(e) => setData('reality_source', e.target.value)}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus-visible:ring-[#1A56DB]"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Sitasi resmi memperkuat kredibilitas narasi di mata donatur korporat dan individu.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: VIDEO & GALERI DOKUMENTASI */}
                        {activeTab === 'media' && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6 shadow-xs">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                        Media & Dokumentasi Lapangan
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Sertakan video YouTube dokumentasi penyaluran dan foto-foto aksi nyata tim relawan.
                                    </p>
                                </div>

                                {/* YouTube Video URL */}
                                <div className="space-y-3">
                                    <Label htmlFor="video_url" className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <Video className="w-4 h-4 text-red-500" />
                                        <span>Link Video YouTube Dokumentasi</span>
                                    </Label>
                                    <Input
                                        id="video_url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={data.video_url}
                                        onChange={(e) => setData('video_url', e.target.value)}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus-visible:ring-[#1A56DB]"
                                    />

                                    {youtubeEmbedUrl && (
                                        <div className="relative aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black mt-2">
                                            <iframe
                                                src={youtubeEmbedUrl}
                                                title="Preview Video Dokumentasi"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Galeri Distribusi */}
                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <ImageIcon className="w-4 h-4 text-[#1A56DB]" />
                                            <span>Foto Galeri Distribusi Bantuan</span>
                                        </Label>
                                        <span className="text-xs text-gray-400">
                                            Total: {data.existing_gallery.length} foto tersimpan
                                        </span>
                                    </div>

                                    {data.existing_gallery.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {data.existing_gallery.map((img: string, idx: number) => (
                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 group shadow-xs">
                                                    <img src={`/storage/${img}`} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = data.existing_gallery.filter((item: string) => item !== img);
                                                            setData('existing_gallery', updated);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                                                        title="Hapus foto ini"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = e.target.files ? Array.from(e.target.files) : [];
                                                setData('gallery_images', files);
                                            }}
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm cursor-pointer file:text-[#1A56DB]"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Anda dapat memilih lebih dari satu foto sekaligus untuk diunggah ke galeri dokumentasi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: METRIK STATISTIK DAMPAK */}
                        {activeTab === 'stats' && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                            Metrik Capaian & Dampak
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Tampilkan angka pencapaian nyata (cth: "15.000+", "45 Kota", "100% Tersalurkan").
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const updated = [...(data.stats_metrics || []), { value: '', label: { id: '' }, icon: 'Users' }];
                                            setData('stats_metrics', updated);
                                        }}
                                        className="h-8 text-xs border-blue-200 text-[#1A56DB] hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/40"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Tambah Metrik
                                    </Button>
                                </div>

                                {data.stats_metrics && data.stats_metrics.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.stats_metrics.map((metric: any, mIdx: number) => (
                                            <div 
                                                key={mIdx}
                                                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-[11px] font-semibold text-gray-500 uppercase">
                                                                Nilai / Angka
                                                            </Label>
                                                            <Input
                                                                placeholder="Contoh: 15.000+"
                                                                value={metric.value || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...data.stats_metrics];
                                                                    updated[mIdx] = { ...updated[mIdx], value: e.target.value };
                                                                    setData('stats_metrics', updated);
                                                                }}
                                                                className="h-9 text-sm mt-1 bg-white dark:bg-gray-900"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label className="text-[11px] font-semibold text-gray-500 uppercase">
                                                                Label Penjelasan
                                                            </Label>
                                                            <Input
                                                                placeholder="Contoh: Siswa Terbantu Beasiswa"
                                                                value={typeof metric.label === 'object' ? metric.label?.id || '' : metric.label || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...data.stats_metrics];
                                                                    updated[mIdx] = { ...updated[mIdx], label: { id: e.target.value } };
                                                                    setData('stats_metrics', updated);
                                                                }}
                                                                className="h-9 text-sm mt-1 bg-white dark:bg-gray-900"
                                                            />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updated = data.stats_metrics.filter((_: any, i: number) => i !== mIdx);
                                                            setData('stats_metrics', updated);
                                                        }}
                                                        className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 self-end"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div>
                                                    <Label className="text-[11px] font-semibold text-gray-500 uppercase mb-1 block">
                                                        Ikon Indikator
                                                    </Label>
                                                    <IconPicker
                                                        value={metric.icon || 'Users'}
                                                        onChange={(iconName) => {
                                                            const updated = [...data.stats_metrics];
                                                            updated[mIdx] = { ...updated[mIdx], icon: iconName || 'Users' };
                                                            setData('stats_metrics', updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-xs">
                                        Belum ada metrik angka statistik. Klik "Tambah Metrik" untuk menambahkan counter capaian dampak.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Summary Card & Related Campaigns */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.public_name.id || category.name)}
                            hasEn={hasEn}
                            hasAr={hasAr}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            description="Status kesiapan naskah judul dan narasi realitas fokus program dalam 3 bahasa."
                        />

                        {/* Summary & Save Trigger */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4 shadow-xs">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#1A56DB]" />
                                <span>Ringkasan Fokus Program</span>
                            </h4>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500">Kategori Sistem</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{category.name_translations?.id || category.name}</span>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500">Nama Publik</span>
                                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                                        {data.public_name.id || <span className="text-gray-400 italic">Default</span>}
                                    </span>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500">Status Publik</span>
                                    <span className={`font-semibold ${data.is_focus_program ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {data.is_focus_program ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>

                                <div className="flex justify-between py-1.5">
                                    <span className="text-gray-500">Program Terkait</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{relatedPrograms.length} Kampanye</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white font-semibold py-2.5 shadow-xs"
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>

                        {/* List Kampanye Donasi Terkait */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                    Kampanye Donasi Terkait
                                </h4>
                                <Link
                                    href={`/admin/programs?category_id=${category.id}`}
                                    className="text-[11px] font-semibold text-[#1A56DB] hover:underline"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            {relatedPrograms.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Belum ada kampanye donasi aktif di bawah kategori ini.</p>
                            ) : (
                                <div className="space-y-2">
                                    {relatedPrograms.map((prog) => (
                                        <div key={prog.id} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
                                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                                {prog.title}
                                            </div>
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                                Terkumpul: Rp {new Intl.NumberFormat('id-ID').format(prog.collected_amount || 0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

FocusProgramEdit.layout = {
    breadcrumbs: [
        {
            title: 'Fokus Program',
            href: '/admin/focus-programs',
        },
        {
            title: 'Edit Fokus Program',
            href: '#',
        },
    ],
};
