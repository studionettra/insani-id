import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';


export default function PagesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: { id: '', en: '', ar: '' },
        content_html: { id: '', en: '', ar: '' },
        meta_title: { id: '', en: '', ar: '' },
        meta_description: { id: '', en: '', ar: '' },
        is_active: true,
        attachment: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use post with forceFormData if we have a file, but useForm handles it automatically if we pass the file object
        post('/admin/pages');
    };

    return (
        <>
            <Head title="Tambah Halaman Baru" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Tambah Halaman Baru</h2>
                        <p className="text-muted-foreground text-sm">
                            Buat halaman statis baru untuk website.
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
                                <Textarea
                                    id="content_id"
                                    rows={10}
                                    value={data.content_html.id}
                                    onChange={(e) => setData('content_html', { ...data.content_html, id: e.target.value })}
                                    className="font-mono text-sm"
                                    required
                                />
                                {errors['content_html.id'] && <p className="text-sm text-red-500">{errors['content_html.id']}</p>}
                                <p className="text-xs text-muted-foreground">Gunakan tag HTML yang valid. Anda dapat mem-paste HTML dari WordPress.</p>
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
                                <Textarea
                                    id="content_en"
                                    rows={10}
                                    value={data.content_html.en}
                                    onChange={(e) => setData('content_html', { ...data.content_html, en: e.target.value })}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-md border bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-lg border-b pb-2">Pengaturan Tambahan</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="attachment">Lampiran File (PDF/Docs)</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                                    accept=".pdf,.doc,.docx"
                                />
                                {errors.attachment && <p className="text-sm text-red-500">{errors.attachment}</p>}
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
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

                    <div className="flex justify-end gap-4">
                        <Link href="/admin/pages">
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Halaman'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PagesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Halaman',
            href: '/admin/pages',
        },
        {
            title: 'Tambah',
            href: '#',
        },
    ],
};
