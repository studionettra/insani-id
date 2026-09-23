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

const getLocalizedText = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.id || value.en || value.ar || Object.values(value).find((v) => typeof v === 'string') || '';
    }
    return String(value);
};

const formatPaginationLabel = (label: string): string => {
    if (!label) return '';
    if (label === 'pagination.previous' || label.toLowerCase().includes('previous')) {
        return '&laquo; Sebelumnya';
    }
    if (label === 'pagination.next' || label.toLowerCase().includes('next')) {
        return 'Berikutnya &raquo;';
    }
    return label;
};

export default function FaqsIndex({ faqs = { data: [] }, filters = {} }: any) {
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
            sort_order: (faqs?.data?.length || 0) + 1,
        });
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (faq: any) => {
        setEditingFaq(faq);
        const questionTranslations = faq.question_translations || (typeof faq.question === 'object' ? faq.question : null);
        const answerTranslations = faq.answer_html_translations || faq.answer_translations || (typeof faq.answer_html === 'object' ? faq.answer_html : null);

        setData({
            question: { 
                id: questionTranslations?.id || (typeof faq.question === 'string' ? faq.question : '') || '', 
                en: questionTranslations?.en || '', 
                ar: questionTranslations?.ar || '' 
            },
            answer_html: { 
                id: answerTranslations?.id || (typeof faq.answer_html === 'string' ? faq.answer_html : '') || '', 
                en: answerTranslations?.en || '', 
                ar: answerTranslations?.ar || '' 
            },
            category: faq.category || 'umum',
            keywords: faq.keywords || '',
            is_active: faq.is_active ?? true,
            sort_order: faq.sort_order ?? 0,
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
            <Head title="Manajemen Tanya Jawab" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tanya Jawab</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola pertanyaan yang sering diajukan di website.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={categoryFilter}
                            onChange={(e) => handleCategoryFilter(e.target.value)}
                            className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-insani-blue"
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
                            <Search className="text-gray-400 dark:text-gray-500 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari pertanyaan / kata kunci..."
                                className="w-full pl-8 sm:w-[220px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah FAQ
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/70 dark:bg-gray-800/50">
                            <TableRow className="border-gray-200 dark:border-gray-800">
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Pertanyaan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Kategori</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400 text-center">Urutan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Status</TableCell>
                                <TableCell className="text-right font-semibold text-xs text-gray-500 dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!faqs.data || faqs.data.length === 0 ? (
                                <TableRow className="border-gray-200 dark:border-gray-800">
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data FAQ.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                faqs.data.map((faq: any) => (
                                    <TableRow key={faq.id} className="border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {getLocalizedText(faq.question_translations || faq.question)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md mt-0.5">
                                                {getLocalizedText(faq.answer_html_translations || faq.answer_translations || faq.answer_html)
                                                    .replace(/<[^>]+>/g, '')
                                                    .substring(0, 100)}...
                                            </div>
                                            {faq.keywords && (
                                                <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                                    Keywords: {faq.keywords}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                switch (faq.category) {
                                                    case 'lembaga':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">Lembaga</span>;
                                                    case 'kontak':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Kontak</span>;
                                                    case 'donatur':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Donatur</span>;
                                                    case 'campaigner':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">Campaigner</span>;
                                                    case 'fundraiser':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Fundraiser</span>;
                                                    case 'keamanan':
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Keamanan</span>;
                                                    default:
                                                        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Umum</span>;
                                                }
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-sm text-gray-700 dark:text-gray-300">{faq.sort_order}</TableCell>
                                        <TableCell>
                                            {faq.is_active ? (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    onClick={() => openEditModal(faq)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700"
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

                {/* Pagination */}
                {faqs.links && faqs.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{faqs.from || 0}</span> sampai <span className="font-semibold text-gray-900 dark:text-white">{faqs.to || 0}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{faqs.total || 0}</span> FAQ
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {faqs.links.map((link: any, i: number) => (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: formatPaginationLabel(link.label) }}
                                    className={link.active ? "bg-[#1A56DB] text-white" : "border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitCreate}>
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Tambah FAQ</DialogTitle>
                            <DialogDescription className="text-gray-500 dark:text-gray-400">
                                Tambahkan pertanyaan dan jawaban baru.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="question_id" className="text-gray-700 dark:text-gray-300">Pertanyaan (ID) *</Label>
                                <Input
                                    id="question_id"
                                    value={data.question.id}
                                    onChange={(e) => setData('question', { ...data.question, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors['question.id'] && <p className="text-sm text-red-500">{errors['question.id']}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="question_en" className="text-gray-700 dark:text-gray-300">Pertanyaan (EN)</Label>
                                    <Input
                                        id="question_en"
                                        value={data.question.en}
                                        onChange={(e) => setData('question', { ...data.question, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="question_ar" className="text-gray-700 dark:text-gray-300">Pertanyaan (AR)</Label>
                                    <Input
                                        id="question_ar"
                                        value={data.question.ar}
                                        onChange={(e) => setData('question', { ...data.question, ar: e.target.value })}
                                        dir="rtl"
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="answer_id" className="text-gray-700 dark:text-gray-300">Jawaban (ID) *</Label>
                                <Textarea
                                    id="answer_id"
                                    rows={4}
                                    value={data.answer_html.id}
                                    onChange={(e) => setData('answer_html', { ...data.answer_html, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors['answer_html.id'] && <p className="text-sm text-red-500">{errors['answer_html.id']}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="answer_en" className="text-gray-700 dark:text-gray-300">Jawaban (EN)</Label>
                                    <Textarea
                                        id="answer_en"
                                        rows={3}
                                        value={data.answer_html.en}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="answer_ar" className="text-gray-700 dark:text-gray-300">Jawaban (AR)</Label>
                                    <Textarea
                                        id="answer_ar"
                                        rows={3}
                                        value={data.answer_html.ar}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, ar: e.target.value })}
                                        dir="rtl"
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Kategori FAQ *</Label>
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                        required
                                    >
                                        <option value="lembaga">Profil Lembaga (Ditampilkan di /tentang-kami)</option>
                                        <option value="kontak">Layanan & Kontak (Ditampilkan di /kontak)</option>
                                        <option value="donatur">Donatur (Tamu & Akun)</option>
                                        <option value="campaigner">Penggalang Dana</option>
                                        <option value="fundraiser">Relawan Kampanye</option>
                                        <option value="keamanan">Legalitas & Keamanan</option>
                                        <option value="umum">Umum</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sort_order" className="text-gray-700 dark:text-gray-300">Urutan Tampil</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="keywords" className="text-gray-700 dark:text-gray-300">Kata Kunci Pencarian</Label>
                                <Input
                                    id="keywords"
                                    value={data.keywords}
                                    onChange={(e) => setData('keywords', e.target.value)}
                                    placeholder="Contoh: cara donasi, transfer bank, qris, refund"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pisahkan dengan koma untuk mempermudah pencarian donatur.</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 cursor-pointer">
                                        FAQ Aktif
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setIsCreateModalOpen(false)}>
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
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitEdit}>
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Edit FAQ</DialogTitle>
                            <DialogDescription className="text-gray-500 dark:text-gray-400">
                                Perbarui informasi FAQ.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_question_id" className="text-gray-700 dark:text-gray-300">Pertanyaan (ID) *</Label>
                                <Input
                                    id="edit_question_id"
                                    value={data.question.id}
                                    onChange={(e) => setData('question', { ...data.question, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors['question.id'] && <p className="text-sm text-red-500">{errors['question.id']}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_question_en" className="text-gray-700 dark:text-gray-300">Pertanyaan (EN)</Label>
                                    <Input
                                        id="edit_question_en"
                                        value={data.question.en}
                                        onChange={(e) => setData('question', { ...data.question, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_question_ar" className="text-gray-700 dark:text-gray-300">Pertanyaan (AR)</Label>
                                    <Input
                                        id="edit_question_ar"
                                        value={data.question.ar}
                                        onChange={(e) => setData('question', { ...data.question, ar: e.target.value })}
                                        dir="rtl"
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="edit_answer_id" className="text-gray-700 dark:text-gray-300">Jawaban (ID) *</Label>
                                <Textarea
                                    id="edit_answer_id"
                                    rows={4}
                                    value={data.answer_html.id}
                                    onChange={(e) => setData('answer_html', { ...data.answer_html, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors['answer_html.id'] && <p className="text-sm text-red-500">{errors['answer_html.id']}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_answer_en" className="text-gray-700 dark:text-gray-300">Jawaban (EN)</Label>
                                    <Textarea
                                        id="edit_answer_en"
                                        rows={3}
                                        value={data.answer_html.en}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_answer_ar" className="text-gray-700 dark:text-gray-300">Jawaban (AR)</Label>
                                    <Textarea
                                        id="edit_answer_ar"
                                        rows={3}
                                        value={data.answer_html.ar}
                                        onChange={(e) => setData('answer_html', { ...data.answer_html, ar: e.target.value })}
                                        dir="rtl"
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_category" className="text-gray-700 dark:text-gray-300">Kategori FAQ *</Label>
                                    <select
                                        id="edit_category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                        required
                                    >
                                        <option value="lembaga">Profil Lembaga (Ditampilkan di /tentang-kami)</option>
                                        <option value="kontak">Layanan & Kontak (Ditampilkan di /kontak)</option>
                                        <option value="donatur">Donatur (Tamu & Akun)</option>
                                        <option value="campaigner">Penggalang Dana</option>
                                        <option value="fundraiser">Relawan Kampanye</option>
                                        <option value="keamanan">Legalitas & Keamanan</option>
                                        <option value="umum">Umum</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_sort_order" className="text-gray-700 dark:text-gray-300">Urutan Tampil</Label>
                                    <Input
                                        id="edit_sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_keywords" className="text-gray-700 dark:text-gray-300">Kata Kunci Pencarian</Label>
                                <Input
                                    id="edit_keywords"
                                    value={data.keywords}
                                    onChange={(e) => setData('keywords', e.target.value)}
                                    placeholder="Contoh: cara donasi, transfer bank, qris, refund"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pisahkan dengan koma untuk mempermudah pencarian donatur.</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="edit_is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('edit_is_active', checked === true)}
                                    />
                                    <label htmlFor="edit_is_active" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 cursor-pointer">
                                        FAQ Aktif
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setIsEditModalOpen(false)}>
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
                description={`Apakah Anda yakin ingin menghapus pertanyaan FAQ "${getLocalizedText(faqToDelete?.question_translations || faqToDelete?.question)}"? Tindakan ini tidak dapat dibatalkan.`}
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
