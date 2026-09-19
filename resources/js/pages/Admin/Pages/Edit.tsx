import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function PagesEdit({ page }: any) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        slug: page.slug || '',
        title: { 
            id: page.title?.id || page.title || '', 
            en: page.title?.en || '', 
            ar: page.title?.ar || '' 
        },
        content_html: { 
            id: page.content_html?.id || page.content_html || '', 
            en: page.content_html?.en || '', 
            ar: page.content_html?.ar || '' 
        },
        meta_title: { 
            id: page.meta_title?.id || page.meta_title || '', 
            en: page.meta_title?.en || '', 
            ar: page.meta_title?.ar || '' 
        },
        meta_description: { 
            id: page.meta_description?.id || page.meta_description || '', 
            en: page.meta_description?.en || '', 
            ar: page.meta_description?.ar || '' 
        },
        is_active: page.is_active,
        attachment: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/pages/${page.id}`);
    };

    return (
        <>
            <Head title="Edit Halaman" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages">
                        <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Halaman: {typeof page.title === 'string' ? page.title : (page.title?.id || '')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            /{page.slug}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className="grid gap-6">
                        {/* Kolom Informasi Dasar */}
                        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Konten Halaman</h3>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="title_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Judul Halaman *</Label>
                                <Input
                                    id="title_id"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug" className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug (URL) *</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                                    placeholder="contoh-slug-halaman"
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    required
                                />
                                {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                                <p className="text-xs text-gray-500 dark:text-gray-400">URL yang akan digunakan: /halaman/<span className="font-semibold text-[#1A56DB] dark:text-blue-400">{data.slug || 'contoh-slug'}</span></p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Konten HTML *</Label>
                                <RichTextEditor
                                    value={data.content_html.id}
                                    onChange={(value) => setData('content_html', { ...data.content_html, id: value })}
                                    placeholder="Tulis konten halaman di sini..."
                                />
                                {errors['content_html.id'] && <p className="text-sm text-red-500">{errors['content_html.id']}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="meta_title_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</Label>
                                <Input
                                    id="meta_title_id"
                                    value={data.meta_title.id}
                                    onChange={(e) => setData('meta_title', { ...data.meta_title, id: e.target.value })}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="meta_desc_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</Label>
                                <Textarea
                                    id="meta_desc_id"
                                    rows={3}
                                    value={data.meta_description.id}
                                    onChange={(e) => setData('meta_description', { ...data.meta_description, id: e.target.value })}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Pengaturan Tambahan</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="attachment" className="text-sm font-medium text-gray-700 dark:text-gray-300">Ganti Lampiran File (PDF/Docs)</Label>
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

                            <div className="flex items-center space-x-2 pt-6 md:pt-8">
                                <Checkbox 
                                    id="is_active" 
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    className="border-gray-300 dark:border-gray-600"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Halaman Aktif (Tampilkan di website)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={() => setIsConfirmOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </Button>
                        <div className="flex gap-2">
                            <Link href="/admin/pages">
                                <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
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
