import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Upload, X, Calendar, Sparkles, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BlogEditProps {
    blog: any;
    categories: string[];
}

export default function BlogEdit({ blog, categories = [] }: BlogEditProps) {
    const publishedDate = blog.published_at 
        ? new Date(blog.published_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    const { data, setData, processing, errors } = useForm({
        _method: 'put',
        title: blog.title || '',
        slug: blog.slug || '',
        wp_category: blog.wp_category || '',
        excerpt: blog.excerpt || '',
        content_html: blog.content_html || '',
        featured_image: null as File | null,
        status: blog.status || 'published',
        published_at: publishedDate,
    });

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
                    
                    {/* Main Column (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Title & Slug Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
                            <div>
                                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Judul Berita <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul artikel berita..."
                                    className="mt-1.5 text-lg font-semibold h-12"
                                    required
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
                                        onClick={() => setData('slug', slugify(data.title))}
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

                            <div>
                                <Label htmlFor="excerpt" className="text-xs font-semibold text-slate-500">
                                    Ringkasan / Excerpt (Opsional)
                                </Label>
                                <Textarea
                                    id="excerpt"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
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
                                Isi Konten Berita <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-slate-400 mb-2">
                                Anda dapat mengedit teks, memperbarui subjudul, list, maupun gambar di dalam teks.
                            </p>

                            <div className="min-h-[400px]">
                                <RichTextEditor
                                    value={data.content_html}
                                    onChange={(val) => setData('content_html', val)}
                                    placeholder="Tuliskan cerita lengkap berita di sini..."
                                />
                            </div>
                            {errors.content_html && <p className="text-xs text-red-500 mt-1">{errors.content_html}</p>}
                        </div>

                    </div>

                    {/* Sidebar Column (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
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
