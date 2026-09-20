import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AutoTranslateBar from '@/components/admin/AutoTranslateBar';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLocalizedValue } from '@/lib/utils';

interface Category {
    id: number;
    name: any;
}

interface Program {
    id: number;
    title: any;
    category_id: number;
    target_amount: string | null;
    deadline: string | null;
    story: any;
    cover_image: string;
    video_url: string | null;
    title_translations?: { id?: string; en?: string; ar?: string };
    story_translations?: { id?: string; en?: string; ar?: string };
}

interface Props {
    categories: Category[];
    program: Program;
}

export default function ProgramEdit({ categories, program }: Props) {
    const [contentLocale, setContentLocale] = useState<'id' | 'en' | 'ar'>('id');
    const [titles, setTitles] = useState<Record<string, string>>({
        id: program.title_translations?.id || (typeof program.title === 'string' ? program.title : getLocalizedValue(program.title, 'id')),
        en: program.title_translations?.en || (typeof program.title === 'object' && program.title ? program.title.en : '') || '',
        ar: program.title_translations?.ar || (typeof program.title === 'object' && program.title ? program.title.ar : '') || '',
    });
    const [stories, setStories] = useState<Record<string, string>>({
        id: program.story_translations?.id || (typeof program.story === 'string' ? program.story : getLocalizedValue(program.story, 'id')),
        en: program.story_translations?.en || (typeof program.story === 'object' && program.story ? program.story.en : '') || '',
        ar: program.story_translations?.ar || (typeof program.story === 'object' && program.story ? program.story.ar : '') || '',
    });
    const [isTranslating, setIsTranslating] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        category_id: program.category_id,
        target_amount: program.target_amount || '',
        deadline: program.deadline ? program.deadline.split('T')[0] : '', // format YYYY-MM-DD
        cover_image: null as File | null,
        video_url: program.video_url || '',
    });

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

    const [coverPreview, setCoverPreview] = useState<string | null>(
        program.cover_image ? `/storage/${program.cover_image}` : null
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/programs/${program.id}`, {
            _method: 'put',
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
            <Head title="Edit Program" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Link href="/admin/programs"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Program</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Perbarui informasi program donasi.
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
                                    value={titles[contentLocale] || ''}
                                    onChange={(e) => setTitles(prev => ({ ...prev, [contentLocale]: e.target.value }))}
                                    placeholder={contentLocale === 'id' ? 'Judul Program Utama' : `Judul Program (${contentLocale.toUpperCase()})`}
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
                                    onChange={(e) => setData('category_id', parseInt(e.target.value))}
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
                                    value={data.target_amount}
                                    onChange={(e) => setData('target_amount', e.target.value)}
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    min="0"
                                />
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
                                    value={data.video_url}
                                    onChange={(e) => setData('video_url', e.target.value)}
                                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                                {errors.video_url && <p className="mt-1 text-xs text-red-500">{errors.video_url}</p>}
                            </div>

                            {/* Cover Image */}
                            <div className="md:col-span-2 space-y-1.5">
                                <Label htmlFor="cover_image" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Gambar Utama (Cover)
                                </Label>
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 dark:file:bg-blue-950 file:py-1 file:px-3 file:text-xs file:font-medium file:text-[#1A56DB] dark:file:text-blue-400 hover:file:bg-blue-100 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]"
                                />
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Biarkan kosong jika tidak ingin mengubah gambar sampul.</p>
                                {errors.cover_image && <p className="mt-1 text-xs text-red-500">{errors.cover_image}</p>}
                                
                                {coverPreview && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                                        <img src={coverPreview} alt="Preview" className="h-48 rounded-lg object-cover border border-gray-100 dark:border-gray-800" />
                                    </div>
                                )}
                            </div>

                            {/* Story */}
                            <div className="md:col-span-2 space-y-1.5" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="story" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                    <span>
                                        Cerita / Penjelasan Program ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span>
                                    </span>
                                </Label>
                                <RichTextEditor
                                    key={`story-editor-${contentLocale}`}
                                    value={stories[contentLocale] || ''}
                                    onChange={(value) => setStories(prev => ({ ...prev, [contentLocale]: value }))}
                                />
                                {errors.story && <p className="mt-1 text-xs text-red-500">{errors.story}</p>}
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
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        
        </>
        
    );
}

ProgramEdit.layout = {
    breadcrumbs: [
        {
            title: 'Edit Program',
            href: '/admin/programs',
        },
    ],
};
