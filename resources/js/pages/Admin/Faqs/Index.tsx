import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';


export default function FaqsIndex({ faqs, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        question: { id: '', en: '', ar: '' },
        answer_html: { id: '', en: '', ar: '' },
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/faqs',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (faq: any) => {
        setEditingFaq(faq);
        setData({
            question: { 
                id: faq.question_translations?.id || '', 
                en: faq.question_translations?.en || '', 
                ar: faq.question_translations?.ar || '' 
            },
            answer_html: { 
                id: faq.answer_html_translations?.id || '', 
                en: faq.answer_html_translations?.en || '', 
                ar: faq.answer_html_translations?.ar || '' 
            },
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
        if (!editingFaq) return;
        
        put(`/admin/faqs/${editingFaq.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const deleteFaq = (faq: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) {
            destroy(`/admin/faqs/${faq.id}`);
        }
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

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari pertanyaan..."
                                className="w-full pl-8 sm:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-insani-turquoise hover:bg-insani-turquoise/90 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah FAQ
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-medium">Pertanyaan (ID)</TableCell>
                                <TableCell className="font-medium text-center">Urutan</TableCell>
                                <TableCell className="font-medium">Status</TableCell>
                                <TableCell className="text-right font-medium">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {faqs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data FAQ.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                faqs.data.map((faq: any) => (
                                    <TableRow key={faq.id}>
                                        <TableCell>
                                            <div className="font-medium">{faq.question_translations?.id || faq.question}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-md">
                                                {faq.answer_html_translations?.id?.replace(/<[^>]+>/g, '').substring(0, 100)}...
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{faq.sort_order}</TableCell>
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
                                                    onClick={() => deleteFaq(faq)}
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
                            
                            <div className="grid grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-2 gap-4">
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
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
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
                            
                            <div className="grid grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-2 gap-4">
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
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
