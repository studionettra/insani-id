import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AutoTranslateBar from '@/components/admin/AutoTranslateBar';
import RichTextEditor from '@/components/rich-text-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLocalizedValue } from '@/lib/utils';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/programs', {
            ...data,
            title: titles,
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

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Informasi Program Utama
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <Alert className="bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200/60 dark:border-blue-900 mb-6">
                            <AlertDescription>
                                Program yang dibuat oleh Admin/Program Officer akan langsung berstatus <strong>Aktif</strong> tanpa melalui antrian verifikasi.
                            </AlertDescription>
                        </Alert>

                        <AutoTranslateBar
                            activeLocale={contentLocale}
                            onLocaleChange={setContentLocale}
                            onAutoTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            hasTranslations={Boolean(titles.en && titles.ar)}
                        />

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Judul Program */}
                            <div className="md:col-span-2 space-y-1.5" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                    <span>
                                        Judul Program ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span>
                                    </span>
                                    {contentLocale !== 'id' && (
                                        <span className="text-[11px] text-slate-400 font-normal">
                                            Dapat diedit manual atau digenerate otomatis
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder={contentLocale === 'id' ? 'Contoh: Bantuan Sembako untuk Lansia Dhuafa' : `Judul Program (${contentLocale.toUpperCase()})`}
                                    value={titles[contentLocale] || ''}
                                    onChange={(e) => setTitles(prev => ({ ...prev, [contentLocale]: e.target.value }))}
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    required={contentLocale === 'id'}
                                />
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
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={data.deadline}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                    onClick={(e) => 'showPicker' in HTMLInputElement.prototype && (e.target as HTMLInputElement).showPicker()}
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
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
