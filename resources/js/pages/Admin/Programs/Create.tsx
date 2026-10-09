import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, CaseSensitive, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import RichTextEditor from '@/components/rich-text-editor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLocalizedValue, toTitleCase } from '@/lib/utils';

interface Category {
    id: number;
    name: any;
}

interface Props {
    categories: Category[];
}

export default function ProgramCreate({ categories }: Props) {
    const [contentLocale, setContentLocale] = useState<'id' | 'en' | 'ar'>('id');
    const [titles, setTitles] = useState<Record<string, string>>({
        id: '',
        en: '',
        ar: '',
    });
    const [stories, setStories] = useState<Record<string, string>>({
        id: '',
        en: '',
        ar: '',
    });
    const [isTranslating, setIsTranslating] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        target_amount: '',
        deadline: '',
        cover_image: null as File | null,
        video_url: '',
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const handleAutoTranslate = async () => {
        const sourceTitle = titles.id;
        const sourceStory = stories.id;

        if (!sourceTitle.trim()) {
            toast.error('Silakan isi judul program dalam Bahasa Indonesia terlebih dahulu.');
            return;
        }

        setIsTranslating(true);
        try {
            const res = await fetch('/admin/auto-translate', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    fields: {
                        title: sourceTitle,
                        story: sourceStory,
                    },
                }),
            });

            const json = await res.json();
            if (json.success && json.translations) {
                const trTitle = json.translations.title || {};
                const trStory = json.translations.story || {};

                setTitles(prev => ({
                    ...prev,
                    en: trTitle.en || prev.en,
                    ar: trTitle.ar || prev.ar,
                }));

                setStories(prev => ({
                    ...prev,
                    en: trStory.en || prev.en,
                    ar: trStory.ar || prev.ar,
                }));

                toast.success('✨ Terjemahan EN & AR berhasil dibuat! Silakan cek tab bahasa.');
            } else {
                toast.error('Gagal menerjemahkan konten.');
            }
        } catch (e) {
            toast.error('Terjadi kesalahan saat memproses terjemahan.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleFormatTitleCase = () => {
        const current = titles[contentLocale] || '';
        if (!current.trim() || contentLocale === 'ar') return;
        const formatted = toTitleCase(current, contentLocale);
        setTitles(prev => ({ ...prev, [contentLocale]: formatted }));
    };

    const handleTitleBlur = () => {
        const current = titles[contentLocale] || '';
        if (!current.trim() || contentLocale === 'ar') return;
        const formatted = toTitleCase(current, contentLocale);
        if (formatted !== current) {
            setTitles(prev => ({ ...prev, [contentLocale]: formatted }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedTitles = {
            id: toTitleCase(titles.id || '', 'id'),
            en: toTitleCase(titles.en || '', 'en'),
            ar: titles.ar || '',
        };

        router.post('/admin/programs', {
            ...data,
            title: formattedTitles,
            story: stories,
        }, {
            forceFormData: true,
        });
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('cover_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Head title="Buat Program Baru" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Link href="/admin/programs"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Buat Program</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Buat program donasi baru langsung aktif.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-3.5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Informasi Program Utama
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Pilih bahasa untuk menyunting judul dan cerita program.
                                </p>
                            </div>
                            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs shrink-0 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setContentLocale('id')}
                                    className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                                        contentLocale === 'id'
                                            ? 'bg-[#1A56DB] text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    🇮🇩 Indonesia
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContentLocale('en')}
                                    className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                                        contentLocale === 'en'
                                            ? 'bg-[#1A56DB] text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    🇬🇧 English
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContentLocale('ar')}
                                    className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                                        contentLocale === 'ar'
                                            ? 'bg-[#1A56DB] text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    🇸🇦 العربية
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <Alert
                            className={`border-blue-200/80 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/25 text-blue-900 dark:text-blue-200 mb-6 rounded-xl transition-all duration-200 shadow-2xs ${
                                contentLocale === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}
                        >
                            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <AlertTitle className="text-xs font-semibold text-blue-950 dark:text-blue-100 tracking-wide uppercase">
                                {contentLocale === 'id' && 'Publikasi Langsung'}
                                {contentLocale === 'en' && 'Instant Publication'}
                                {contentLocale === 'ar' && 'نشر فوري'}
                            </AlertTitle>
                            <AlertDescription className="text-xs text-blue-800/90 dark:text-blue-300/90">
                                <p className="leading-relaxed">
                                    {contentLocale === 'id' && (
                                        <>
                                            Program yang dibuat oleh Admin/Program Officer akan langsung berstatus{' '}
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 mx-1 align-baseline shadow-2xs">
                                                Aktif
                                            </span>{' '}
                                            tanpa melalui antrean verifikasi.
                                        </>
                                    )}
                                    {contentLocale === 'en' && (
                                        <>
                                            Programs created by Admin/Program Officer will be directly published with status{' '}
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 mx-1 align-baseline shadow-2xs">
                                                Active
                                            </span>{' '}
                                            without passing through the verification queue.
                                        </>
                                    )}
                                    {contentLocale === 'ar' && (
                                        <>
                                            البرامج المنشأة بواسطة المشرف أو مسؤول البرامج ستحصل مباشرة على حالة{' '}
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 mx-1 align-baseline shadow-2xs">
                                                نشط
                                            </span>{' '}
                                            دون الحاجة للانتظار في طابور المراجعة والتحقق.
                                        </>
                                    )}
                                </p>
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Judul Program */}
                            <div className="md:col-span-2 space-y-1.5" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <span>
                                            Judul Program ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span>
                                        </span>
                                        {contentLocale !== 'id' && (
                                            <span className="text-[11px] text-slate-400 font-normal">
                                                (opsional / terjemahan)
                                            </span>
                                        )}
                                    </Label>
                                    {contentLocale !== 'ar' && (
                                        <button
                                            type="button"
                                            onClick={handleFormatTitleCase}
                                            className="text-[11px] text-[#1A56DB] hover:underline flex items-center gap-1 font-medium transition-colors"
                                            title="Kapitalkan setiap kata sesuai kaidah EYD/Title Case"
                                        >
                                            <CaseSensitive className="w-3.5 h-3.5" /> Format Title Case
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder={contentLocale === 'id' ? 'Contoh: Bantuan Sembako untuk Lansia Dhuafa' : `Judul Program (${contentLocale.toUpperCase()})`}
                                    value={titles[contentLocale] || ''}
                                    onChange={(e) => setTitles(prev => ({ ...prev, [contentLocale]: e.target.value }))}
                                    onBlur={handleTitleBlur}
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    required={contentLocale === 'id'}
                                />
                                {titles[contentLocale]?.trim() && contentLocale !== 'ar' && (
                                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1A56DB]/10 text-[#1A56DB] tracking-wider shrink-0 uppercase">
                                            <CaseSensitive className="w-3 h-3" />
                                            Pratinjau EYD
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                            {toTitleCase(titles[contentLocale], contentLocale)}
                                        </span>
                                    </div>
                                )}
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            {/* Kategori */}
                            <div className="space-y-1.5">
                                <Label htmlFor="category_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Kategori <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm outline-none transition focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{getLocalizedValue(cat.name)}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                            </div>

                            {/* Target Donasi */}
                            <div className="space-y-1.5">
                                <Label htmlFor="target_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Target Donasi (Opsional)
                                </Label>
                                <Input
                                    id="target_amount"
                                    type="number"
                                    placeholder="Contoh: 100000000"
                                    value={data.target_amount}
                                    onChange={(e) => setData('target_amount', e.target.value)}
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    min="0"
                                />
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Kosongkan jika program tidak memiliki target donasi spesifik.</p>
                                {errors.target_amount && <p className="mt-1 text-xs text-red-500">{errors.target_amount}</p>}
                            </div>

                            {/* Deadline */}
                            <div className="space-y-1.5">
                                <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Batas Waktu (Opsional)
                                </Label>
                                <DatePicker
                                    id="deadline"
                                    value={data.deadline}
                                    minDate="today"
                                    onChange={(dateStr) => setData('deadline', dateStr)}
                                    placeholder="Pilih batas waktu program..."
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Kosongkan jika program tidak memiliki batas waktu.</p>
                                {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
                            </div>

                            {/* Video URL */}
                            <div className="space-y-1.5">
                                <Label htmlFor="video_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tautan Video Youtube (Opsional)
                                </Label>
                                <Input
                                    id="video_url"
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={data.video_url}
                                    onChange={(e) => setData('video_url', e.target.value)}
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                                {errors.video_url && <p className="mt-1 text-xs text-red-500">{errors.video_url}</p>}
                            </div>

                            {/* Cover Image */}
                            <div className="md:col-span-2 space-y-1.5">
                                <Label htmlFor="cover_image" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Gambar Utama (Cover) <span className="text-red-500">*</span>
                                </Label>
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 dark:file:bg-blue-950 file:py-1 file:px-3 file:text-xs file:font-medium file:text-[#1A56DB] dark:file:text-blue-400 hover:file:bg-blue-100 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]"
                                    required
                                />
                                {errors.cover_image && <p className="mt-1 text-xs text-red-500">{errors.cover_image}</p>}
                                
                                {coverPreview && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                                        <img src={coverPreview} alt="Preview" className="h-48 rounded-lg object-cover border border-gray-100 dark:border-gray-800" />
                                    </div>
                                )}
                            </div>

                            {/* Story */}
                            <div className="md:col-span-2" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="story" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cerita & Latar Belakang ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span>
                                </Label>
                                <RichTextEditor
                                    key={`story-editor-${contentLocale}`}
                                    value={stories[contentLocale] || ''}
                                    onChange={value => setStories(prev => ({ ...prev, [contentLocale]: value }))}
                                    placeholder="Ceritakan mengapa program ini dibuat secara detail..."
                                />
                                {errors.story && <p className="text-red-500 text-sm mt-1">{errors.story}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                disabled={processing}
                                className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                <Save className="mr-2 h-4 w-4" />
                                Simpan & Publikasikan
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <TranslationStatusCard
                        hasId={Boolean(titles.id)}
                        hasEn={Boolean(titles.en && stories.en)}
                        hasAr={Boolean(titles.ar && stories.ar)}
                        onTranslate={handleAutoTranslate}
                        isTranslating={isTranslating}
                        description="Status kelengkapan judul dan cerita program galang dana dalam 3 bahasa."
                    />
                </div>
            </div>
        </div>
        
        </>
        
    );
}

ProgramCreate.layout = {
    breadcrumbs: [
        {
            title: 'Buat Program Baru',
            href: '/admin/programs',
        },
    ],
};
