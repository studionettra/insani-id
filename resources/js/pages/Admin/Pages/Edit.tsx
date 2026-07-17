import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, FileText, Trash2 } from 'lucide-react';
import RichTextEditor from '@/components/rich-text-editor';


export default function PagesEdit({ page }: any) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        title: { 
            id: page.title_translations?.id || '', 
            en: page.title_translations?.en || '', 
            ar: page.title_translations?.ar || '' 
        },
        content_html: { 
            id: page.content_html_translations?.id || '', 
            en: page.content_html_translations?.en || '', 
            ar: page.content_html_translations?.ar || '' 
        },
        meta_title: { 
            id: page.meta_title_translations?.id || '', 
            en: page.meta_title_translations?.en || '', 
            ar: page.meta_title_translations?.ar || '' 
        },
        meta_description: { 
            id: page.meta_description_translations?.id || '', 
            en: page.meta_description_translations?.en || '', 
            ar: page.meta_description_translations?.ar || '' 
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
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Edit Halaman: {page.title_translations?.id || page.title}</h2>
                        <p className="text-muted-foreground text-sm">
                            /{page.slug}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Kolom Kiri: Informasi Dasar & Bahasa Indonesia */}
                        <div className="flex flex-col gap-4 rounded-md border bg-white p-6 shadow-sm">
                            <h3 className="font-semibold text-lg border-b pb-2">Konten Bahasa Indonesia (Utama)</h3>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="title_id">Judul Halaman (ID) *</Label>
                                <Input
                                    id="title_id"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content_id">Konten HTML (ID) *</Label>
                                <RichTextEditor
                                    value={data.content_html.id}
                                    onChange={(value) => setData('content_html', { ...data.content_html, id: value })}
                                    placeholder="Tulis konten halaman di sini..."
                                />
                                {errors['content_html.id'] && <p className="text-sm text-red-500">{errors['content_html.id']}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="meta_title_id">Meta Title (ID)</Label>
                                <Input
                                    id="meta_title_id"
                                    value={data.meta_title.id}
                                    onChange={(e) => setData('meta_title', { ...data.meta_title, id: e.target.value })}
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="meta_desc_id">Meta Description (ID)</Label>
                                <Textarea
                                    id="meta_desc_id"
                                    rows={3}
                                    value={data.meta_description.id}
                                    onChange={(e) => setData('meta_description', { ...data.meta_description, id: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Kolom Kanan: Bahasa Inggris & Pengaturan */}
                        <div className="flex flex-col gap-4 rounded-md border bg-white p-6 shadow-sm">
                            <h3 className="font-semibold text-lg border-b pb-2">Konten Bahasa Inggris (Opsional)</h3>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="title_en">Judul Halaman (EN)</Label>
                                <Input
                                    id="title_en"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content_en">Konten HTML (EN)</Label>
                                <RichTextEditor
                                    value={data.content_html.en}
                                    onChange={(value) => setData('content_html', { ...data.content_html, en: value })}
                                    placeholder="Write page content here..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-md border bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-lg border-b pb-2">Pengaturan Tambahan</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="attachment">Ganti Lampiran File (PDF/Docs)</Label>
                                {page.attachment_url && (
                                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
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
                                />
                                {errors.attachment && <p className="text-sm text-red-500">{errors.attachment}</p>}
                            </div>

                            <div className="flex items-center space-x-2 pt-6 md:pt-8">
                                <Checkbox 
                                    id="is_active" 
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                                />
                                <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Halaman Aktif (Tampilkan di website)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={() => {
                                if (confirm('Yakin ingin menghapus halaman ini?')) {
                                    // Use standard Inertia delete
                                    import('@inertiajs/react').then(({ router }) => {
                                        router.delete(`/admin/pages/${page.id}`);
                                    });
                                }
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </Button>
                        <div className="flex gap-2">
                            <Link href="/admin/pages">
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                </form>
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
