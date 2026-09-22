import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';


export default function FaqsIndex({ faqs, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        question: { id: '', en: '', ar: '' },
        answer_html: { id: '', en: '', ar: '' },
        category: 'umum',
        keywords: '',
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/faqs',
            { search, category: categoryFilter || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryFilter = (cat: string) => {
        setCategoryFilter(cat);
        router.get(
            '/admin/faqs',
            { search, category: cat || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData({
            question: { id: '', en: '', ar: '' },
            answer_html: { id: '', en: '', ar: '' },
            category: 'umum',
            keywords: '',
            is_active: true,
            sort_order: (faqs.data?.length || 0) + 1,
        });
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (faq: any) => {
        setEditingFaq(faq);
        setData({
            question: { 
                id: faq.question_translations?.id || (typeof faq.question === 'object' ? faq.question?.id : faq.question) || '', 
                en: faq.question_translations?.en || (typeof faq.question === 'object' ? faq.question?.en : '') || '', 
                ar: faq.question_translations?.ar || (typeof faq.question === 'object' ? faq.question?.ar : '') || '' 
            },
            answer_html: { 
                id: faq.answer_html_translations?.id || (typeof faq.answer_html === 'object' ? faq.answer_html?.id : faq.answer_html) || '', 
                en: faq.answer_html_translations?.en || (typeof faq.answer_html === 'object' ? faq.answer_html?.en : '') || '', 
                ar: faq.answer_html_translations?.ar || (typeof faq.answer_html === 'object' ? faq.answer_html?.ar : '') || '' 
            },
            category: faq.category || 'umum',
            keywords: faq.keywords || '',
            is_active: faq.is_active,
            sort_order: faq.sort_order,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/faqs', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingFaq) {
return;
}
        
        put(`/admin/faqs/${editingFaq.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const [faqToDelete, setFaqToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteFaq = () => {
        if (!faqToDelete) return;
        setIsDeleting(true);
        destroy(`/admin/faqs/${faqToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setFaqToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen FAQ" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">FAQ (Tanya Jawab)</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola pertanyaan yang sering diajukan di website.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={categoryFilter}
                            onChange={(e) => handleCategoryFilter(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-insani-blue"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="lembaga">Lembaga (/tentang-kami)</option>
                            <option value="kontak">Kontak (/kontak)</option>
                            <option value="donatur">Donatur</option>
                            <option value="campaigner">Campaigner</option>
                            <option value="fundraiser">Fundraiser</option>
                            <option value="keamanan">Legalitas & Keamanan</option>
                            <option value="umum">Umum</option>
                        </select>

                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari pertanyaan / kata kunci..."
                                className="w-full pl-8 sm:w-[220px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah FAQ
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-white overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-medium">Pertanyaan</TableCell>
                                <TableCell className="font-medium">Kategori</TableCell>
                                <TableCell className="font-medium text-center">Urutan</TableCell>
                                <TableCell className="font-medium">Status</TableCell>
                                <TableCell className="text-right font-medium">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {faqs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data FAQ.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                faqs.data.map((faq: any) => (
                                    <TableRow key={faq.id}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{faq.question_translations?.id || faq.question}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-md">
                                                {faq.answer_html_translations?.id?.replace(/<[^>]+>/g, '').substring(0, 100)}...
                                            </div>
                                            {faq.keywords && (
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    Keywords: {faq.keywords}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                switch (faq.category) {
                                                    case 'lembaga':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">Lembaga</span>;
                                                    case 'kontak':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Kontak</span>;
                                                    case 'donatur':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Donatur</span>;
                                                    case 'campaigner':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Campaigner</span>;
                                                    case 'fundraiser':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Fundraiser</span>;
                                                    case 'keamanan':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Keamanan</span>;
                                                    default:
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Umum</span>;
                                                }
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-sm">{faq.sort_order}</TableCell>
                                        <TableCell>
                                            {faq.is_active ? (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditModal(faq)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setFaqToDelete(faq)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal Tambah */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={submitCreate}>
                        <DialogHeader>
                            <DialogTitle>Tambah FAQ</DialogTitle>
                            <DialogDescription>
                                Tambahkan pertanyaan dan jawaban baru.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="question_id">Pertanyaan (ID) *</Label>
                                <Input
                                    id="question_id"
                                    value={data.question.id}
                                    onChange={(e) => setData('question', { ...data.question, id: e.target.value })}
                                />
                                {errors['question.id'] && <p className="text-sm text-red-500">{errors['question.id']}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="question_en">Pertanyaan (EN)</Label>
                                    <Input
                                        id="question_en"
                                        value={data.question.en}
                                        onChange={(e) => setData('question', { ...data.question, en: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="question_ar">Pertanyaan (AR)</Label>
                                    <Input
                                        id="question_ar"
                                        value={data.question.ar}
                                        onChange={(e) => setData('question', { ...data.question, ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="answer_id">Jawaban (ID) *</Label>
                                <Textarea
                                    id="answer_id"
                                    rows={4}
                                    value={data.answer_html.id}
                                    onChange={(e) => setData('answer_html', { ...data.answer_html, id: e.target.value })}
                                />
                                {errors['answer_html.id'] && <p className="text-sm text-red-500">{errors['answer_html.id']}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="answer_en">Jawaban (EN)</Label>
                                    <Textarea
                                        id="answer_en"
                                        rows={3}
                                        value={data.answer_html.en}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, en: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="answer_ar">Jawaban (AR)</Label>
                                    <Textarea
                                        id="answer_ar"
                                        rows={3}
                                        value={data.answer_html.ar}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Kategori FAQ *</Label>
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                        required
                                    >
                                        <option value="lembaga">Profil Lembaga (Ditampilkan di /tentang-kami)</option>
                                        <option value="kontak">Layanan & Kontak (Ditampilkan di /kontak)</option>
                                        <option value="donatur">Donatur (Tamu & Akun)</option>
                                        <option value="campaigner">Campaigner (Penggalang Dana)</option>
                                        <option value="fundraiser">Fundraiser (Relawan Kampanye)</option>
                                        <option value="keamanan">Legalitas & Keamanan</option>
                                        <option value="umum">Umum</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sort_order">Urutan (Sort Order)</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="keywords">Kata Kunci Pencarian (Keywords)</Label>
                                <Input
                                    id="keywords"
                                    value={data.keywords}
                                    onChange={(e) => setData('keywords', e.target.value)}
                                    placeholder="Contoh: cara donasi, transfer bank, qris, refund"
                                />
                                <p className="text-xs text-slate-400">Pisahkan dengan koma untuk mempermudah pencarian donatur.</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        FAQ Aktif
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={submitEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit FAQ</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi FAQ.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_question_id">Pertanyaan (ID) *</Label>
                                <Input
                                    id="edit_question_id"
                                    value={data.question.id}
                                    onChange={(e) => setData('question', { ...data.question, id: e.target.value })}
                                />
                                {errors['question.id'] && <p className="text-sm text-red-500">{errors['question.id']}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_question_en">Pertanyaan (EN)</Label>
                                    <Input
                                        id="edit_question_en"
                                        value={data.question.en}
                                        onChange={(e) => setData('question', { ...data.question, en: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_question_ar">Pertanyaan (AR)</Label>
                                    <Input
                                        id="edit_question_ar"
                                        value={data.question.ar}
                                        onChange={(e) => setData('question', { ...data.question, ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="edit_answer_id">Jawaban (ID) *</Label>
                                <Textarea
                                    id="edit_answer_id"
                                    rows={4}
                                    value={data.answer_html.id}
                                    onChange={(e) => setData('answer_html', { ...data.answer_html, id: e.target.value })}
                                />
                                {errors['answer_html.id'] && <p className="text-sm text-red-500">{errors['answer_html.id']}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_answer_en">Jawaban (EN)</Label>
                                    <Textarea
                                        id="edit_answer_en"
                                        rows={3}
                                        value={data.answer_html.en}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, en: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_answer_ar">Jawaban (AR)</Label>
                                    <Textarea
                                        id="edit_answer_ar"
                                        rows={3}
                                        value={data.answer_html.ar}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_category">Kategori FAQ *</Label>
                                    <select
                                        id="edit_category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                        required
                                    >
                                        <option value="lembaga">Profil Lembaga (Ditampilkan di /tentang-kami)</option>
                                        <option value="kontak">Layanan & Kontak (Ditampilkan di /kontak)</option>
                                        <option value="donatur">Donatur (Tamu & Akun)</option>
                                        <option value="campaigner">Campaigner (Penggalang Dana)</option>
                                        <option value="fundraiser">Fundraiser (Relawan Kampanye)</option>
                                        <option value="keamanan">Legalitas & Keamanan</option>
                                        <option value="umum">Umum</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_sort_order">Urutan (Sort Order)</Label>
                                    <Input
                                        id="edit_sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_keywords">Kata Kunci Pencarian (Keywords)</Label>
                                <Input
                                    id="edit_keywords"
                                    value={data.keywords}
                                    onChange={(e) => setData('keywords', e.target.value)}
                                    placeholder="Contoh: cara donasi, transfer bank, qris, refund"
                                />
                                <p className="text-xs text-slate-400">Pisahkan dengan koma untuk mempermudah pencarian donatur.</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="edit_is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <label htmlFor="edit_is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        FAQ Aktif
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!faqToDelete}
                onOpenChange={(open) => !open && setFaqToDelete(null)}
                title="Hapus FAQ"
                description={`Apakah Anda yakin ingin menghapus pertanyaan FAQ "${typeof faqToDelete?.question === 'string' ? faqToDelete.question : (faqToDelete?.question?.id || '')}"? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDeleteFaq}
            />
        </>
    );
}

FaqsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen FAQ',
            href: '/admin/faqs',
        },
    ],
};
