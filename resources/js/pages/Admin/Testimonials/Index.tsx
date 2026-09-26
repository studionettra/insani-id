import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search, Star, MessageSquareQuote, User, Languages } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import { autoTranslateFields } from '@/lib/translate';
import { getLocalizedValue } from '@/lib/utils';
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Testimonial {
    id: number;
    name: string;
    role: any;
    avatar_path: string | null;
    avatar_url: string | null;
    content: any;
    rating: number;
    is_active: boolean;
    sort_order: number;
    role_translations?: Record<string, string>;
    content_translations?: Record<string, string>;
}

interface Props {
    testimonials: {
        data: Testimonial[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function TestimonialsIndex({ testimonials, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        name: '',
        role: { id: '', en: '', ar: '' },
        content: { id: '', en: '', ar: '' },
        rating: 5,
        avatar: null as File | null,
        is_active: true,
        sort_order: 0,
    });

    const handleAutoTranslate = async () => {
        const sourceContent = data.content.id;
        const sourceRole = data.role.id;

        if (!sourceContent.trim()) {
            toast.error('Silakan isi Isi Testimoni (ID) terlebih dahulu sebelum menerjemahkan.');
            return;
        }

        setIsTranslating(true);
        try {
            const fieldsToTranslate: Record<string, string> = {
                content: sourceContent,
            };
            if (sourceRole && sourceRole.trim()) {
                fieldsToTranslate.role = sourceRole.trim();
            }

            const res = await autoTranslateFields(fieldsToTranslate);

            if (res) {
                setData(prev => ({
                    ...prev,
                    content: {
                        id: prev.content.id,
                        en: res.content?.en || prev.content.en,
                        ar: res.content?.ar || prev.content.ar,
                    },
                    role: {
                        id: prev.role.id,
                        en: res.role?.en || prev.role.en,
                        ar: res.role?.ar || prev.role.ar,
                    },
                }));
            }
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/testimonials',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData({
            _method: 'post',
            name: '',
            role: { id: 'Donatur Rutin Program Insani', en: '', ar: '' },
            content: { id: '', en: '', ar: '' },
            rating: 5,
            avatar: null,
            is_active: true,
            sort_order: (testimonials.data?.length || 0) + 1,
        });
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (item: Testimonial) => {
        setEditingItem(item);
        const roleObj = item.role_translations || (typeof item.role === 'object' && item.role !== null ? item.role : { id: item.role || '', en: '', ar: '' });
        const contentObj = item.content_translations || (typeof item.content === 'object' && item.content !== null ? item.content : { id: item.content || '', en: '', ar: '' });

        setData({
            _method: 'put',
            name: item.name,
            role: {
                id: roleObj.id || (typeof item.role === 'string' ? item.role : ''),
                en: roleObj.en || '',
                ar: roleObj.ar || '',
            },
            content: {
                id: contentObj.id || (typeof item.content === 'string' ? item.content : ''),
                en: contentObj.en || '',
                ar: contentObj.ar || '',
            },
            rating: item.rating,
            avatar: null,
            is_active: item.is_active,
            sort_order: item.sort_order,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/testimonials', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                toast.success('Testimoni berhasil ditambahkan.');
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        post(`/admin/testimonials/${editingItem.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                toast.success('Testimoni berhasil diperbarui.');
            },
        });
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/testimonials/${itemToDelete.id}`, {
            onSuccess: () => {
                setItemToDelete(null);
                setIsDeleting(false);
                toast.success('Testimoni berhasil dihapus.');
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Gagal menghapus testimoni.');
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Testimoni Donatur" />

            <div className="space-y-6">
                {/* Header Title & Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <MessageSquareQuote className="h-6 w-6 text-insani-blue" />
                            Testimoni Donatur & Mitra
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola kutipan ulasan, cerita donatur, dan rating kepuasan yang tampil di beranda (Mendukung ID, EN, AR).
                        </p>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-insani-blue hover:bg-insani-blue/90 text-white rounded-xl shadow-xs gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Testimoni
                    </Button>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari nama atau isi testimoni..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm"
                        />
                    </form>
                    <div className="text-xs text-gray-500 dark:text-gray-400 self-end sm:self-center">
                        Total Testimoni: <span className="font-semibold text-gray-900 dark:text-white">{testimonials.total || 0}</span>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/70 dark:bg-gray-800/50">
                                <TableHead className="w-16 text-center font-semibold text-xs text-gray-500 dark:text-gray-400">Urutan</TableHead>
                                <TableHead className="font-semibold text-xs text-gray-500 dark:text-gray-400">Profil Donatur</TableHead>
                                <TableHead className="font-semibold text-xs text-gray-500 dark:text-gray-400">Ulasan & Cerita</TableHead>
                                <TableHead className="text-center font-semibold text-xs text-gray-500 dark:text-gray-400">Rating</TableHead>
                                <TableHead className="text-center font-semibold text-xs text-gray-500 dark:text-gray-400">Status</TableHead>
                                <TableHead className="text-right font-semibold text-xs text-gray-500 dark:text-gray-400">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testimonials.data && testimonials.data.length > 0 ? (
                                testimonials.data.map((item) => {
                                    const roleId = getLocalizedValue(item.role, 'id');
                                    const contentId = getLocalizedValue(item.content, 'id');
                                    const hasEn = Boolean(item.content_translations?.en || (typeof item.content === 'object' && item.content?.en));
                                    const hasAr = Boolean(item.content_translations?.ar || (typeof item.content === 'object' && item.content?.ar));

                                    return (
                                        <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <TableCell className="text-center font-mono text-sm text-gray-500 dark:text-gray-400">
                                                {item.sort_order}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {item.avatar_url ? (
                                                        <img
                                                            src={item.avatar_url}
                                                            alt={item.name}
                                                            className="h-10 w-10 object-cover rounded-full border border-gray-200 dark:border-gray-700"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-semibold text-gray-900 dark:text-white block">{item.name}</span>
                                                        {roleId && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{roleId}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-md italic">
                                                    "{contentId}"
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        ID ✓
                                                    </span>
                                                    {hasEn ? (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                                                            EN ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                            EN -
                                                        </span>
                                                    )}
                                                    {hasAr ? (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                                                            AR ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                            AR -
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center gap-1 text-amber-500">
                                                    {[...Array(item.rating)].map((_, i) => (
                                                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        item.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(item)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-insani-blue dark:text-gray-400 dark:hover:text-blue-400"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setItemToDelete(item)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-400 dark:text-gray-500">
                                        Belum ada data testimoni donatur.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal Tambah */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle>Tambah Testimoni</DialogTitle>
                        <DialogDescription>
                            Tambahkan testimoni kepuasan donatur atau mitra (Mendukung ID, EN, AR).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.content.id)}
                            hasEn={Boolean(data.content.en)}
                            hasAr={Boolean(data.content.ar)}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            compact
                            description="Terjemahkan profesi dan isi ulasan testimoni donatur ke bahasa Inggris dan Arab secara otomatis."
                        />

                        <div>
                            <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">Nama Donatur / Mitra *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Dr. H. Ahmad Fauzi"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Profesi / Status Donatur Multi-Bahasa */}
                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Profesi / Status Donatur
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">ID (Indonesia)</span>
                                    <Input
                                        value={data.role.id}
                                        onChange={(e) => setData('role', { ...data.role, id: e.target.value })}
                                        placeholder="Contoh: Donatur Rutin"
                                    />
                                    {errors['role.id'] && <p className="text-red-500 text-xs mt-1">{errors['role.id']}</p>}
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">EN (English)</span>
                                    <Input
                                        value={data.role.en}
                                        onChange={(e) => setData('role', { ...data.role, en: e.target.value })}
                                        placeholder="e.g. Regular Donor"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">AR (العربية)</span>
                                    <Input
                                        value={data.role.ar}
                                        dir="rtl"
                                        onChange={(e) => setData('role', { ...data.role, ar: e.target.value })}
                                        placeholder="مثال: متبرع منتظم"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Isi Testimoni Multi-Bahasa */}
                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Isi Testimoni / Ulasan *
                            </Label>
                            
                            <div>
                                <span className="text-[11px] font-bold text-gray-500 block mb-1">Bahasa Indonesia (Wajib) *</span>
                                <Textarea
                                    rows={3}
                                    value={data.content.id}
                                    onChange={(e) => setData('content', { ...data.content, id: e.target.value })}
                                    placeholder="Tuliskan pengalaman atau pesan kebaikan donatur..."
                                    required
                                />
                                {errors['content.id'] && <p className="text-red-500 text-xs mt-1">{errors['content.id']}</p>}
                                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">English (Terjemahan EN)</span>
                                    <Textarea
                                        rows={3}
                                        value={data.content.en}
                                        onChange={(e) => setData('content', { ...data.content, en: e.target.value })}
                                        placeholder="Write English translation here..."
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">العربية (Terjemahan AR)</span>
                                    <Textarea
                                        rows={3}
                                        dir="rtl"
                                        value={data.content.ar}
                                        onChange={(e) => setData('content', { ...data.content, ar: e.target.value })}
                                        placeholder="اكتب الترجمة العربية هنا..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <Label htmlFor="rating" className="text-gray-700 dark:text-gray-200">Bintang Rating (1 - 5)</Label>
                                <select
                                    id="rating"
                                    value={data.rating}
                                    onChange={(e) => setData('rating', parseInt(e.target.value) || 5)}
                                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                                    <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                                    <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="sort_order" className="text-gray-700 dark:text-gray-200">Nomor Urut Tampil</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="avatar" className="text-gray-700 dark:text-gray-200">Foto Avatar (Opsional)</Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('avatar', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                Tampilkan testimoni ini di halaman utama
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                {processing ? 'Menyimpan...' : 'Simpan Testimoni'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle>Edit Testimoni</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi ulasan donatur dan terjemahannya (ID, EN, AR).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.content.id)}
                            hasEn={Boolean(data.content.en)}
                            hasAr={Boolean(data.content.ar)}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            compact
                            description="Terjemahkan profesi dan isi ulasan testimoni donatur ke bahasa Inggris dan Arab secara otomatis."
                        />

                        <div>
                            <Label htmlFor="edit_name" className="text-gray-700 dark:text-gray-200">Nama Donatur / Mitra *</Label>
                            <Input
                                id="edit_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Profesi / Status Donatur Multi-Bahasa */}
                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Profesi / Status Donatur
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">ID (Indonesia)</span>
                                    <Input
                                        value={data.role.id}
                                        onChange={(e) => setData('role', { ...data.role, id: e.target.value })}
                                        placeholder="Contoh: Donatur Rutin"
                                    />
                                    {errors['role.id'] && <p className="text-red-500 text-xs mt-1">{errors['role.id']}</p>}
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">EN (English)</span>
                                    <Input
                                        value={data.role.en}
                                        onChange={(e) => setData('role', { ...data.role, en: e.target.value })}
                                        placeholder="e.g. Regular Donor"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">AR (العربية)</span>
                                    <Input
                                        value={data.role.ar}
                                        dir="rtl"
                                        onChange={(e) => setData('role', { ...data.role, ar: e.target.value })}
                                        placeholder="مثال: متبرع منتظم"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Isi Testimoni Multi-Bahasa */}
                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Isi Testimoni / Ulasan *
                            </Label>
                            
                            <div>
                                <span className="text-[11px] font-bold text-gray-500 block mb-1">Bahasa Indonesia (Wajib) *</span>
                                <Textarea
                                    rows={3}
                                    value={data.content.id}
                                    onChange={(e) => setData('content', { ...data.content, id: e.target.value })}
                                    placeholder="Tuliskan pengalaman atau pesan kebaikan donatur..."
                                    required
                                />
                                {errors['content.id'] && <p className="text-red-500 text-xs mt-1">{errors['content.id']}</p>}
                                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">English (Terjemahan EN)</span>
                                    <Textarea
                                        rows={3}
                                        value={data.content.en}
                                        onChange={(e) => setData('content', { ...data.content, en: e.target.value })}
                                        placeholder="Write English translation here..."
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">العربية (Terjemahan AR)</span>
                                    <Textarea
                                        rows={3}
                                        dir="rtl"
                                        value={data.content.ar}
                                        onChange={(e) => setData('content', { ...data.content, ar: e.target.value })}
                                        placeholder="اكتب الترجمة العربية هنا..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <Label htmlFor="edit_rating" className="text-gray-700 dark:text-gray-200">Bintang Rating (1 - 5)</Label>
                                <select
                                    id="edit_rating"
                                    value={data.rating}
                                    onChange={(e) => setData('rating', parseInt(e.target.value) || 5)}
                                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                                    <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                                    <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="edit_sort_order" className="text-gray-700 dark:text-gray-200">Nomor Urut Tampil</Label>
                                <Input
                                    id="edit_sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit_avatar" className="text-gray-700 dark:text-gray-200">Foto Avatar (Ganti bila perlu)</Label>
                            <Input
                                id="edit_avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('avatar', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="edit_is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                Tampilkan testimoni ini di halaman utama
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                {processing ? 'Memperbarui...' : 'Perbarui Testimoni'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Hapus */}
            <ConfirmDialog
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
                title="Hapus Testimoni?"
                description={`Apakah Anda yakin ingin menghapus testimoni dari "${itemToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus Testimoni"
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}
