import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search, ShieldAlert, Languages, Check, Loader2, ArrowUpDown } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import { autoTranslateFields } from '@/lib/translate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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

interface CategoryItem {
    id: number;
    name: any;
    name_translations?: { id?: string; en?: string; ar?: string };
    slug: string;
    description: any;
    description_translations?: { id?: string; en?: string; ar?: string };
    is_active: boolean;
    sort_order: number;
    reports_count?: number;
    created_at: string;
}

interface Props {
    categories: {
        data: CategoryItem[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters?: {
        search?: string;
        is_active?: string;
    };
}

const getLocalizedText = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.id || value.en || value.ar || Object.values(value).find((v) => typeof v === 'string') || '';
    }
    return String(value);
};

export default function ProgramReportCategoriesIndex({ categories, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.is_active ?? '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState<'id' | 'en' | 'ar'>('id');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: { id: '', en: '', ar: '' },
        description: { id: '', en: '', ar: '' },
        is_active: true,
        sort_order: 0,
    });

    const hasEn = Boolean(data.name.en);
    const hasAr = Boolean(data.name.ar);

    const handleAutoTranslate = async () => {
        const sourceName = data.name.id;
        const sourceDesc = data.description.id || '';

        if (!sourceName?.trim()) {
            toast.error('Silakan isi Nama Kategori (ID) terlebih dahulu.');
            return;
        }

        setIsTranslating(true);
        try {
            const res = await autoTranslateFields({
                name: sourceName,
                description: sourceDesc,
            });

            if (res) {
                setData((prev) => ({
                    ...prev,
                    name: {
                        id: prev.name.id,
                        en: res.name?.en || prev.name.en,
                        ar: res.name?.ar || prev.name.ar,
                    },
                    description: {
                        id: prev.description.id,
                        en: res.description?.en || prev.description.en,
                        ar: res.description?.ar || prev.description.ar,
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
            '/admin/program-report-categories',
            { search: search || undefined, is_active: activeFilter !== '' ? activeFilter : undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterStatus = (status: string) => {
        setActiveFilter(status);
        router.get(
            '/admin/program-report-categories',
            { search: search || undefined, is_active: status !== '' ? status : undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setData({
            name: { id: '', en: '', ar: '' },
            description: { id: '', en: '', ar: '' },
            is_active: true,
            sort_order: (categories.data.length || 0) + 1,
        });
        setActiveLangTab('id');
        setIsCreateModalOpen(true);
    };

    const openEditModal = (cat: CategoryItem) => {
        setEditingCategory(cat);
        clearErrors();
        setData({
            name: {
                id: cat.name_translations?.id || (typeof cat.name === 'object' ? cat.name.id : cat.name) || '',
                en: cat.name_translations?.en || (typeof cat.name === 'object' ? cat.name.en : '') || '',
                ar: cat.name_translations?.ar || (typeof cat.name === 'object' ? cat.name.ar : '') || '',
            },
            description: {
                id: cat.description_translations?.id || (typeof cat.description === 'object' ? cat.description.id : cat.description) || '',
                en: cat.description_translations?.en || (typeof cat.description === 'object' ? cat.description.en : '') || '',
                ar: cat.description_translations?.ar || (typeof cat.description === 'object' ? cat.description.ar : '') || '',
            },
            is_active: Boolean(cat.is_active),
            sort_order: cat.sort_order ?? 0,
        });
        setActiveLangTab('id');
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/program-report-categories', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                toast.success('Kategori laporan berhasil ditambahkan.');
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        put(`/admin/program-report-categories/${editingCategory.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingCategory(null);
                reset();
                toast.success('Kategori laporan berhasil diperbarui.');
            },
        });
    };

    const handleToggleActive = (cat: CategoryItem) => {
        router.patch(
            `/admin/program-report-categories/${cat.id}/toggle-active`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Kategori berhasil ${cat.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
                },
            }
        );
    };

    const handleDelete = () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);

        router.delete(`/admin/program-report-categories/${categoryToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setCategoryToDelete(null);
                toast.success('Kategori laporan berhasil dihapus.');
            },
            onError: (err: any) => {
                setIsDeleting(false);
                toast.error(err?.message || 'Gagal menghapus kategori.');
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Kategori Laporan Program - Admin Insani" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Kategori Laporan Pelanggaran
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Kelola master data opsi pelanggaran yang dapat dipilih donatur saat melaporkan kejanggalan program.
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl shadow-xs self-start sm:self-auto gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Kategori
                </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari nama atau slug kategori..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-gray-50/50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    />
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant={activeFilter === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterStatus('')}
                        className="rounded-lg text-xs"
                    >
                        Semua ({categories.total})
                    </Button>
                    <Button
                        type="button"
                        variant={activeFilter === 'true' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterStatus('true')}
                        className="rounded-lg text-xs"
                    >
                        Aktif
                    </Button>
                    <Button
                        type="button"
                        variant={activeFilter === 'false' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterStatus('false')}
                        className="rounded-lg text-xs"
                    >
                        Nonaktif
                    </Button>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/70 dark:bg-gray-800/60">
                        <TableRow>
                            <TableHead className="w-16 text-center font-bold">Urutan</TableHead>
                            <TableHead className="font-bold">Kategori Pelanggaran</TableHead>
                            <TableHead className="font-bold">Deskripsi / Panduan</TableHead>
                            <TableHead className="text-center font-bold">Bahasa</TableHead>
                            <TableHead className="text-center font-bold">Aduan Masuk</TableHead>
                            <TableHead className="text-center font-bold">Status</TableHead>
                            <TableHead className="text-right font-bold pr-6">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                                    <ShieldAlert className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="font-medium">Belum ada kategori laporan yang ditemukan.</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Silakan tambah kategori baru atau jalankan seeder.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.data.map((cat) => (
                                <TableRow key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                    <TableCell className="text-center font-semibold text-gray-600 dark:text-gray-400">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs">
                                            {cat.sort_order}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                                            {getLocalizedText(cat.name_translations || cat.name)}
                                        </div>
                                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                                            slug: {cat.slug}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                            {getLocalizedText(cat.description_translations || cat.description) || '-'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold bg-blue-50 text-blue-700 border-blue-200">
                                                ID
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-1.5 py-0 font-bold ${
                                                    cat.name_translations?.en || (typeof cat.name === 'object' && cat.name.en)
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
                                                }`}
                                            >
                                                EN
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-1.5 py-0 font-bold ${
                                                    cat.name_translations?.ar || (typeof cat.name === 'object' && cat.name.ar)
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
                                                }`}
                                            >
                                                AR
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="secondary"
                                            className={`font-semibold text-xs ${
                                                (cat.reports_count || 0) > 0
                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {cat.reports_count || 0} laporan
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(cat)}
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                cat.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                            }`}
                                        >
                                            {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(cat)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCategoryToDelete(cat)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Tambah Kategori Laporan Baru
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Masukkan opsi pelanggaran baru. Gunakan fitur auto-translate untuk melengkapi terjemahan EN & AR.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.name.id)}
                            hasEn={hasEn}
                            hasAr={hasAr}
                            isTranslating={isTranslating}
                            onAutoTranslate={handleAutoTranslate}
                            description="Isi Nama Kategori dalam Bahasa Indonesia, lalu klik tombol terjemahkan otomatis untuk melengkapi versi Inggris dan Arab."
                        />

                        {/* Language Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 gap-2">
                            {(['id', 'en', 'ar'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setActiveLangTab(lang)}
                                    className={`pb-2 px-3 text-xs font-bold uppercase transition-colors border-b-2 ${
                                        activeLangTab === lang
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {lang === 'id' ? 'Indonesia (ID)' : lang === 'en' ? 'English (EN)' : 'العربية (AR)'}
                                    {lang === 'id' && <span className="text-rose-500 ml-1">*</span>}
                                </button>
                            ))}
                        </div>

                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Nama Kategori Pelanggaran ({activeLangTab.toUpperCase()})
                                {activeLangTab === 'id' && <span className="text-rose-500 ml-1">*</span>}
                            </Label>
                            <Input
                                value={data.name[activeLangTab] || ''}
                                onChange={(e) =>
                                    setData('name', {
                                        ...data.name,
                                        [activeLangTab]: e.target.value,
                                    })
                                }
                                placeholder={
                                    activeLangTab === 'id'
                                        ? 'Contoh: Penyalahgunaan dana'
                                        : activeLangTab === 'en'
                                        ? 'e.g. Misuse of funds'
                                        : 'مثال: إساءة استخدام الأموال'
                                }
                                dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                                className="rounded-xl text-sm"
                            />
                            {activeLangTab === 'id' && errors['name.id'] && (
                                <p className="text-xs text-rose-500">{errors['name.id']}</p>
                            )}
                        </div>

                        {/* Description Field */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Deskripsi / Penjelasan Kategori ({activeLangTab.toUpperCase()})
                            </Label>
                            <Textarea
                                rows={3}
                                value={data.description[activeLangTab] || ''}
                                onChange={(e) =>
                                    setData('description', {
                                        ...data.description,
                                        [activeLangTab]: e.target.value,
                                    })
                                }
                                placeholder={
                                    activeLangTab === 'id'
                                        ? 'Jelaskan konteks pelanggaran ini sebagai panduan donatur & admin...'
                                        : activeLangTab === 'en'
                                        ? 'Explain the violation context...'
                                        : 'اشرح سياق المخالفة...'
                                }
                                dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                                className="rounded-xl text-sm"
                            />
                        </div>

                        {/* Meta Settings */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Urutan Tampilan</Label>
                                <Input
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="rounded-xl text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Status Kategori</Label>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="create_is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="create_is_active" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Aktifkan Kategori Ini
                                    </label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-xl text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || isTranslating}
                                className="bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Kategori'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <Edit className="w-5 h-5 text-blue-600" />
                            Edit Kategori Pelanggaran
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Perbarui nama atau deskripsi kategori.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.name.id)}
                            hasEn={hasEn}
                            hasAr={hasAr}
                            isTranslating={isTranslating}
                            onAutoTranslate={handleAutoTranslate}
                        />

                        {/* Language Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 gap-2">
                            {(['id', 'en', 'ar'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setActiveLangTab(lang)}
                                    className={`pb-2 px-3 text-xs font-bold uppercase transition-colors border-b-2 ${
                                        activeLangTab === lang
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {lang === 'id' ? 'Indonesia (ID)' : lang === 'en' ? 'English (EN)' : 'العربية (AR)'}
                                    {lang === 'id' && <span className="text-rose-500 ml-1">*</span>}
                                </button>
                            ))}
                        </div>

                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Nama Kategori Pelanggaran ({activeLangTab.toUpperCase()})
                                {activeLangTab === 'id' && <span className="text-rose-500 ml-1">*</span>}
                            </Label>
                            <Input
                                value={data.name[activeLangTab] || ''}
                                onChange={(e) =>
                                    setData('name', {
                                        ...data.name,
                                        [activeLangTab]: e.target.value,
                                    })
                                }
                                dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                                className="rounded-xl text-sm"
                            />
                            {activeLangTab === 'id' && errors['name.id'] && (
                                <p className="text-xs text-rose-500">{errors['name.id']}</p>
                            )}
                        </div>

                        {/* Description Field */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Deskripsi / Penjelasan Kategori ({activeLangTab.toUpperCase()})
                            </Label>
                            <Textarea
                                rows={3}
                                value={data.description[activeLangTab] || ''}
                                onChange={(e) =>
                                    setData('description', {
                                        ...data.description,
                                        [activeLangTab]: e.target.value,
                                    })
                                }
                                dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                                className="rounded-xl text-sm"
                            />
                        </div>

                        {/* Meta Settings */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Urutan Tampilan</Label>
                                <Input
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="rounded-xl text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Status Kategori</Label>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="edit_is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="edit_is_active" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Aktifkan Kategori Ini
                                    </label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-xl text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || isTranslating}
                                className="bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                        Memperbarui...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
                title="Hapus Kategori Laporan"
                description={
                    (categoryToDelete?.reports_count || 0) > 0
                        ? `Kategori "${getLocalizedText(categoryToDelete?.name)}" memiliki ${categoryToDelete?.reports_count} laporan aduan terkait dan tidak dapat dihapus. Silakan nonaktifkan kategori ini jika tidak ingin digunakan lagi.`
                        : `Apakah Anda yakin ingin menghapus kategori "${getLocalizedText(categoryToDelete?.name)}"? Tindakan ini tidak dapat dibatalkan.`
                }
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </div>
    );
}

ProgramReportCategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kategori Laporan Program',
            href: '/admin/program-report-categories',
        },
    ],
};
