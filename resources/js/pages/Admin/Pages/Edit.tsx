import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AutoTranslateBar from '@/components/admin/AutoTranslateBar';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { autoTranslateFields } from '@/lib/translate';

export default function PagesEdit({ page }: any) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [contentLocale, setContentLocale] = useState<'id' | 'en' | 'ar'>('id');
    const [isTranslating, setIsTranslating] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        slug: page.slug || '',
        title: {
            id: page.title?.id || (typeof page.title === 'string' ? page.title : ''),
            en: page.title?.en || '',
            ar: page.title?.ar || '',
        },
        content_html: {
            id: page.content_html?.id || (typeof page.content_html === 'string' ? page.content_html : ''),
            en: page.content_html?.en || '',
            ar: page.content_html?.ar || '',
        },
        meta_title: {
            id: page.meta_title?.id || (typeof page.meta_title === 'string' ? page.meta_title : ''),
            en: page.meta_title?.en || '',
            ar: page.meta_title?.ar || '',
        },
        meta_description: {
            id: page.meta_description?.id || (typeof page.meta_description === 'string' ? page.meta_description : ''),
            en: page.meta_description?.en || '',
            ar: page.meta_description?.ar || '',
        },
        is_active: Boolean(page.is_active),
        attachment: null as File | null,
    });

    const hasEn = Boolean(data.title.en && data.content_html.en);
    const hasAr = Boolean(data.title.ar && data.content_html.ar);

    const handleAutoTranslate = async () => {
        const sourceTitle = data.title.id;
        const sourceContent = data.content_html.id;
        const sourceMetaTitle = data.meta_title.id;
        const sourceMetaDesc = data.meta_description.id;

        if (!sourceTitle.trim() && !sourceContent.trim()) {
            toast.error('Silakan isi Judul atau Konten dalam Bahasa Indonesia terlebih dahulu.');
            return;
        }

        setIsTranslating(true);
        try {
            const res = await autoTranslateFields({
                title: sourceTitle,
                content_html: sourceContent,
                meta_title: sourceMetaTitle,
                meta_description: sourceMetaDesc,
            });

            if (res) {
                setData(prev => ({
                    ...prev,
                    title: {
                        id: prev.title.id,
                        en: res.title?.en || prev.title.en,
                        ar: res.title?.ar || prev.title.ar,
                    },
                    content_html: {
                        id: prev.content_html.id,
                        en: res.content_html?.en || prev.content_html.en,
                        ar: res.content_html?.ar || prev.content_html.ar,
                    },
                    meta_title: {
                        id: prev.meta_title.id,
                        en: res.meta_title?.en || prev.meta_title.en,
                        ar: res.meta_title?.ar || prev.meta_title.ar,
                    },
                    meta_description: {
                        id: prev.meta_description.id,
                        en: res.meta_description?.en || prev.meta_description.en,
                        ar: res.meta_description?.ar || prev.meta_description.ar,
                    },
                }));
            }
        } finally {
            setIsTranslating(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/pages/${page.id}`);
    };

    return (
        <>
            <Head title={`Edit Halaman - ${typeof page.title === 'string' ? page.title : (page.title?.id || '')}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages">
                        <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Edit Halaman: {typeof page.title === 'string' ? page.title : (page.title?.id || '')}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            /{page.slug}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Content (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <AutoTranslateBar
                            activeLocale={contentLocale}
                            onLocaleChange={setContentLocale}
                            onAutoTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            hasTranslations={Boolean(hasEn && hasAr)}
                        />

                        {/* Kolom Informasi Dasar */}
                        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                                Konten Halaman ({contentLocale.toUpperCase()})
                            </h3>

                            <div className="grid gap-2" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Judul Halaman ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title[contentLocale] || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData(prev => ({
                                            ...prev,
                                            title: { ...prev.title, [contentLocale]: val },
                                        }));
                                    }}
                                    placeholder={contentLocale === 'id' ? 'Contoh: Kebijakan Privasi' : `Judul Halaman (${contentLocale.toUpperCase()})`}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    required={contentLocale === 'id'}
                                />
                                {errors[`title.${contentLocale}`] && <p className="text-sm text-red-500">{errors[`title.${contentLocale}`]}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Slug (URL) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                                    placeholder="contoh-slug-halaman"
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    required
                                />
                                {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    URL: /halaman/<span className="font-semibold text-[#1A56DB] dark:text-blue-400">{data.slug || 'contoh-slug'}</span>
                                </p>
                            </div>

                            <div className="grid gap-2" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="content_html" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Konten HTML ({contentLocale.toUpperCase()}) <span className="text-red-500">*</span>
                                </Label>
                                <RichTextEditor
                                    key={`editor-${contentLocale}`}
                                    value={data.content_html[contentLocale] || ''}
                                    onChange={(value) => setData(prev => ({
                                        ...prev,
                                        content_html: { ...prev.content_html, [contentLocale]: value },
                                    }))}
                                    placeholder="Tulis konten halaman di sini..."
                                />
                                {errors[`content_html.${contentLocale}`] && <p className="text-sm text-red-500">{errors[`content_html.${contentLocale}`]}</p>}
                            </div>

                            <div className="grid gap-2" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="meta_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Meta Title ({contentLocale.toUpperCase()})
                                </Label>
                                <Input
                                    id="meta_title"
                                    value={data.meta_title[contentLocale] || ''}
                                    onChange={(e) => setData(prev => ({
                                        ...prev,
                                        meta_title: { ...prev.meta_title, [contentLocale]: e.target.value },
                                    }))}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                            </div>

                            <div className="grid gap-2" dir={contentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <Label htmlFor="meta_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Meta Description ({contentLocale.toUpperCase()})
                                </Label>
                                <Textarea
                                    id="meta_description"
                                    rows={3}
                                    value={data.meta_description[contentLocale] || ''}
                                    onChange={(e) => setData(prev => ({
                                        ...prev,
                                        meta_description: { ...prev.meta_description, [contentLocale]: e.target.value },
                                    }))}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <TranslationStatusCard
                            hasId={Boolean(data.title.id)}
                            hasEn={hasEn}
                            hasAr={hasAr}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            description="Status kesiapan konten halaman statis dalam 3 bahasa."
                        />

                        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                                Pengaturan Tambahan
                            </h3>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="attachment" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ganti Lampiran File (PDF/Docs)
                                    </Label>
                                    {page.attachment_url && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2">
                                            <FileText className="w-4 h-4" />
                                            <a href={`/storage/${page.attachment_url}`} target="_blank" rel="noreferrer" className="hover:underline">
                                                Lihat File Saat Ini
                                            </a>
                                        </div>
                                    )}
                                    <Input
                                        id="attachment"
                                        type="file"
                                        onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.doc,.docx"
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                                    />
                                    {errors.attachment && <p className="text-sm text-red-500">{errors.attachment}</p>}
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                        className="border-gray-300 dark:border-gray-600"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none cursor-pointer">
                                        Halaman Aktif (Tampilkan di website)
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsConfirmOpen(true)}
                                >
                                    <Trash2 className="mr-1.5 h-4 w-4" /> Hapus
                                </Button>
                                <div className="flex gap-2">
                                    <Link href="/admin/pages">
                                        <Button type="button" variant="outline" size="sm" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button type="submit" size="sm" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                        <Save className="mr-1.5 h-4 w-4" />
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <ConfirmDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    title="Hapus Halaman"
                    description={`Apakah Anda yakin ingin menghapus halaman "${typeof page.title === 'string' ? page.title : (page.title?.id || '')}"? Tindakan ini tidak dapat dibatalkan.`}
                    variant="danger"
                    loading={isDeleting}
                    onConfirm={() => {
                        setIsDeleting(true);
                        router.delete(`/admin/pages/${page.id}`, {
                            onFinish: () => {
                                setIsDeleting(false);
                                setIsConfirmOpen(false);
                            },
                        });
                    }}
                />
            </div>
        </>
    );
}

PagesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Halaman',
            href: '/admin/pages',
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
