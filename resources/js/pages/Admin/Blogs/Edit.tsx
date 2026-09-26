import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Upload, X, Calendar, Sparkles, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AutoTranslateBar from '@/components/admin/AutoTranslateBar';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getLocalizedValue } from '@/lib/utils';

interface BlogEditProps {
    blog: any;
    categories: string[];
}

export default function BlogEdit({ blog, categories = [] }: BlogEditProps) {
    const publishedDate = blog.published_at 
        ? new Date(blog.published_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    const [contentLocale, setContentLocale] = useState<'id' | 'en' | 'ar'>('id');
    const [titles, setTitles] = useState<Record<string, string>>({
        id: blog.title_translations?.id || (typeof blog.title === 'string' ? blog.title : getLocalizedValue(blog.title, 'id')),
        en: blog.title_translations?.en || (typeof blog.title === 'object' && blog.title ? blog.title.en : '') || '',
        ar: blog.title_translations?.ar || (typeof blog.title === 'object' && blog.title ? blog.title.ar : '') || '',
    });
    const [excerpts, setExcerpts] = useState<Record<string, string>>({
        id: blog.excerpt_translations?.id || (typeof blog.excerpt === 'string' ? blog.excerpt : getLocalizedValue(blog.excerpt, 'id')),
        en: blog.excerpt_translations?.en || (typeof blog.excerpt === 'object' && blog.excerpt ? blog.excerpt.en : '') || '',
        ar: blog.excerpt_translations?.ar || (typeof blog.excerpt === 'object' && blog.excerpt ? blog.excerpt.ar : '') || '',
    });
    const [contents, setContents] = useState<Record<string, string>>({
        id: blog.content_translations?.id || (typeof blog.content_html === 'string' ? blog.content_html : getLocalizedValue(blog.content_html, 'id')),
        en: blog.content_translations?.en || (typeof blog.content_html === 'object' && blog.content_html ? blog.content_html.en : '') || '',
        ar: blog.content_translations?.ar || (typeof blog.content_html === 'object' && blog.content_html ? blog.content_html.ar : '') || '',
    });
    const [isTranslating, setIsTranslating] = useState(false);

    const { data, setData, processing, errors } = useForm({
        _method: 'put',
        slug: blog.slug || '',
        wp_category: blog.wp_category || '',
        featured_image: null as File | null,
        status: blog.status || 'published',
        published_at: publishedDate,
    });

    const handleAutoTranslate = async () => {
        const sourceTitle = titles.id;
        const sourceExcerpt = excerpts.id;
        const sourceContent = contents.id;

        if (!sourceTitle.trim()) {
            toast.error('Silakan isi judul berita dalam Bahasa Indonesia terlebih dahulu.');
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
                        excerpt: sourceExcerpt,
                        content: sourceContent,
                    },
                }),
            });

            const json = await res.json();
            if (json.success && json.translations) {
                const trTitle = json.translations.title || {};
                const trExcerpt = json.translations.excerpt || {};
                const trContent = json.translations.content || {};

                setTitles(prev => ({
                    ...prev,
                    en: trTitle.en || prev.en,
                    ar: trTitle.ar || prev.ar,
                }));

                setExcerpts(prev => ({
                    ...prev,
                    en: trExcerpt.en || prev.en,
                    ar: trExcerpt.ar || prev.ar,
                }));

                setContents(prev => ({
                    ...prev,
                    en: trContent.en || prev.en,
                    ar: trContent.ar || prev.ar,
                }));

                toast.success('✨ Terjemahan EN & AR berita berhasil dibuat! Silakan cek tab bahasa.');
            } else {
                toast.error('Gagal menerjemahkan berita.');
            }
        } catch (e) {
            toast.error('Terjadi kesalahan saat memproses terjemahan.');
        } finally {
            setIsTranslating(false);
        }
    };

    const [imagePreview, setImagePreview] = useState<string | null>(
        blog.thumbnail_url || blog.featured_image_url || null
    );

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setData('featured_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setData('featured_image', null);
        setImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/blogs/${blog.id}`, {
            ...data,
            _method: 'put',
            title: titles,
            excerpt: excerpts,
            content_html: contents,
        });
    };

    return (
        <>
            <Head title={`Sunting: ${blog.title}`} />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
                
                {/* Top Nav & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
                            <Link href="/admin/blogs">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Sunting Berita
                            </h2>
                            <p className="text-muted-foreground text-xs mt-0.5">
                                Perbarui isi konten, foto sampul, atau status publikasi artikel.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {blog.status === 'published' && (
                            <Button asChild variant="outline" size="sm" className="h-9">
                                <a href={`/berita/${blog.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                    Lihat di Web
                                </a>
                            </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="h-9">
                            <Link href="/admin/blogs">Batal</Link>
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={processing}
                            className="bg-insani-blue hover:bg-insani-darkblue text-white shadow-xs h-9"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    <div className="lg:col-span-12">
                        <AutoTranslateBar
                            activeLocale={contentLocale}
                            onLocaleChange={setContentLocale}
                            onAutoTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            hasTranslations={Boolean(titles.en && titles.ar)}
                        />
                    </div>

                    {/* Main Column (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Title & Slug Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
                            <div dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                                    <span>Judul Berita ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span></span>
                                    {contentLocale !== 'id' && (
                                        <span className="text-[11px] text-slate-400 font-normal lowercase">
                                            bisa diedit manual atau digenerate otomatis
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={titles[contentLocale] || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setTitles(prev => ({ ...prev, [contentLocale]: val }));
                                        if (contentLocale === 'id' && !data.slug) {
                                            setData('slug', slugify(val));
                                        }
                                    }}
                                    placeholder={contentLocale === 'id' ? 'Masukkan judul artikel berita...' : `Judul berita (${contentLocale.toUpperCase()})...`}
                                    className="mt-1.5 text-lg font-semibold h-12"
                                    required={contentLocale === 'id'}
                                />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="slug" className="text-xs font-semibold text-slate-500">
                                        Slug URL
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => setData('slug', slugify(titles.id || ''))}
                                        className="text-[11px] text-insani-blue hover:underline flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" /> Sinkronkan dengan judul
                                    </button>
                                </div>
                                <div className="mt-1 flex rounded-lg shadow-xs">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-mono">
                                        /berita/
                                    </span>
                                    <Input
                                        id="slug"
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', slugify(e.target.value))}
                                        placeholder="judul-artikel-berita"
                                        className="rounded-l-none font-mono text-xs"
                                        required
                                    />
                                </div>
                                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
                            </div>

                            <div dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="excerpt" className="text-xs font-semibold text-slate-500">
                                    Ringkasan / Excerpt ({contentLocale.toUpperCase()}) (Opsional)
                                </Label>
                                <Textarea
                                    id="excerpt"
                                    value={excerpts[contentLocale] || ''}
                                    onChange={(e) => setExcerpts(prev => ({ ...prev, [contentLocale]: e.target.value }))}
                                    placeholder="Ringkasan singkat artikel..."
                                    rows={3}
                                    className="mt-1.5 text-sm"
                                />
                                {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt}</p>}
                            </div>
                        </div>

                        {/* Rich Text Editor Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Isi Konten Berita ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-slate-400 mb-2">
                                Anda dapat mengedit teks, memperbarui subjudul, list, maupun gambar di dalam teks.
                            </p>

                            <div className="min-h-[400px]" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <RichTextEditor
                                    key={`blog-content-${contentLocale}`}
                                    value={contents[contentLocale] || ''}
                                    onChange={(val) => setContents(prev => ({ ...prev, [contentLocale]: val }))}
                                    placeholder="Tuliskan cerita lengkap berita di sini..."
                                />
                            </div>
                            {errors.content_html && <p className="text-xs text-red-500 mt-1">{errors.content_html}</p>}
                        </div>

                    </div>

                    {/* Sidebar Column (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(titles.id)}
                            hasEn={Boolean(titles.en && (excerpts.en || contents.en))}
                            hasAr={Boolean(titles.ar && (excerpts.ar || contents.ar))}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            description="Status kesiapan judul, ringkasan, dan isi naskah artikel berita dalam 3 bahasa."
                        />

                        {/* Publishing Options Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                                Pengaturan Publikasi
                            </h3>

                            <div>
                                <Label htmlFor="status" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Status
                                </Label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full mt-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-insani-blue"
                                >
                                    <option value="published">Diterbitkan (Langsung Tayang)</option>
                                    <option value="draft">Draf (Hanya Admin)</option>
                                </select>
                                {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
                            </div>

                            <div>
                                <Label htmlFor="published_at" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Tanggal Publikasi
                                </Label>
                                <Input
                                    id="published_at"
                                    type="date"
                                    value={data.published_at}
                                    onChange={(e) => setData('published_at', e.target.value)}
                                    className="mt-1.5 text-sm"
                                />
                                {errors.published_at && <p className="text-xs text-red-500 mt-1">{errors.published_at}</p>}
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-insani-blue hover:bg-insani-darkblue text-white shadow-xs"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </div>

                        {/* Category Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3">
                            <Label htmlFor="wp_category" className="font-semibold text-sm text-slate-900 dark:text-white">
                                Kategori Berita <span className="text-red-500">*</span>
                            </Label>

                            <Input
                                id="wp_category"
                                list="categories-list"
                                value={data.wp_category}
                                onChange={(e) => setData('wp_category', e.target.value)}
                                placeholder="Contoh: Kabar Yatim, Kemanusiaan..."
                                className="text-sm"
                                required
                            />
                            <datalist id="categories-list">
                                {categories.map((cat) => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>

                            {/* Quick selection pills */}
                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setData('wp_category', cat)}
                                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                                data.wp_category === cat
                                                    ? 'bg-brand-50 text-brand-700 border-brand-300 font-semibold'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {errors.wp_category && <p className="text-xs text-red-500 mt-1">{errors.wp_category}</p>}
                        </div>

                        {/* Featured Image Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3">
                            <Label className="font-semibold text-sm text-slate-900 dark:text-white">
                                Foto Sampul / Thumbnail
                            </Label>
                            <p className="text-xs text-slate-400">
                                Gambar utama artikel berita. Unggah gambar baru untuk mengganti foto yang ada.
                            </p>

                            {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[16/10] bg-slate-50">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview Thumbnail" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-all"
                                        title="Hapus / Ganti foto"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label 
                                    htmlFor="featured_image"
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-insani-blue mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Foto Baru</span>
                                    <input 
                                        id="featured_image" 
                                        type="file" 
                                        accept="image/png,image/jpeg,image/webp" 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                    />
                                </label>
                            )}
                            {errors.featured_image && <p className="text-xs text-red-500 mt-1">{errors.featured_image}</p>}
                        </div>

                    </div>

                </form>

            </div>
        </>
    );
}
