import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconPicker, renderStatIcon } from '@/components/ui/icon-picker';

export default function ImpactStatsIndex({ impactStats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStat, setEditingStat] = useState<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors, put } = useForm({
        title: { id: '', en: '', ar: '' },
        value: '',
        icon: '',
        category: 'Dalam Negeri',
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/impact-stats',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setData({
            title: { id: '', en: '', ar: '' },
            value: '',
            icon: '',
            category: 'Dalam Negeri',
            is_active: true,
            sort_order: 0,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (stat: any) => {
        setEditingStat(stat);
        setData({
            title: { 
                id: stat.title_translations?.id || '', 
                en: stat.title_translations?.en || '', 
                ar: stat.title_translations?.ar || '' 
            },
            value: stat.value || '',
            icon: stat.icon || '',
            category: stat.category || 'Dalam Negeri',
            is_active: stat.is_active,
            sort_order: stat.sort_order,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/impact-stats', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingStat) {
return;
}
        
        put(`/admin/impact-stats/${editingStat.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const [statToDelete, setStatToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteStat = () => {
        if (!statToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/impact-stats/${statToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setStatToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Statistik Dampak" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Statistik Dampak</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola angka statistik capaian program (penerima manfaat, jumlah program, dll).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-gray-400 dark:text-gray-500 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari judul..."
                                className="w-full pl-8 sm:w-[250px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Stat
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/70 dark:bg-gray-800/50">
                            <TableRow className="border-gray-200 dark:border-gray-800">
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Kategori</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Judul (Label)</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Nilai</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400 text-center">Urutan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Status</TableCell>
                                <TableCell className="text-right font-semibold text-xs text-gray-500 dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {impactStats.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data statistik.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                impactStats.data.map((stat: any) => (
                                    <TableRow key={stat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-800">
                                        <TableCell className="text-gray-600 dark:text-gray-300">{stat.category}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                {renderStatIcon(stat.icon, "w-4 h-4 text-[#1A56DB] shrink-0")}
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {stat.title_translations?.id || stat.title}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-lg text-gray-900 dark:text-white">{stat.value}</TableCell>
                                        <TableCell className="text-center text-gray-600 dark:text-gray-300">{stat.sort_order}</TableCell>
                                        <TableCell>
                                            {stat.is_active ? (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                    onClick={() => openEditModal(stat)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setStatToDelete(stat)}
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
                <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitCreate} className="flex flex-col h-full max-h-[90vh] overflow-hidden">
                        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                            <DialogTitle className="text-gray-900 dark:text-white">Tambah Statistik Dampak</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Kategori (Cakupan Wilayah) *</Label>
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                        required
                                    >
                                        <option value="Dalam Negeri">Dalam Negeri</option>
                                        <option value="Luar Negeri">Luar Negeri</option>
                                        <option value="Umum">Umum</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value" className="text-gray-700 dark:text-gray-300">Nilai Angka *</Label>
                                    <Input
                                        id="value"
                                        placeholder="cth: 124M+"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        required
                                    />
                                    {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title_id" className="text-gray-700 dark:text-gray-300">Label Judul (ID) *</Label>
                                <Input
                                    id="title_id"
                                    placeholder="cth: Penerima Manfaat"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title_en" className="text-gray-700 dark:text-gray-300">Label Judul (EN)</Label>
                                <Input
                                    id="title_en"
                                    placeholder="cth: Beneficiaries"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="icon" className="text-gray-700 dark:text-gray-300">Ikon Visual (Opsional)</Label>
                                <IconPicker
                                    id="icon"
                                    value={data.icon}
                                    onChange={(iconName) => setData('icon', iconName)}
                                />
                                {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sort_order" className="text-gray-700 dark:text-gray-300">Urutan (Sort Order)</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
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
                                    <label htmlFor="is_active" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Aktif (Tampilkan di website)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
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
                <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitEdit} className="flex flex-col h-full max-h-[90vh] overflow-hidden">
                        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                            <DialogTitle className="text-gray-900 dark:text-white">Edit Statistik Dampak</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_category" className="text-gray-700 dark:text-gray-300">Kategori (Cakupan Wilayah) *</Label>
                                    <select
                                        id="edit_category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                        required
                                    >
                                        <option value="Dalam Negeri">Dalam Negeri</option>
                                        <option value="Luar Negeri">Luar Negeri</option>
                                        <option value="Umum">Umum</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_value" className="text-gray-700 dark:text-gray-300">Nilai Angka *</Label>
                                    <Input
                                        id="edit_value"
                                        placeholder="cth: 124M+"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        required
                                    />
                                    {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_title_id" className="text-gray-700 dark:text-gray-300">Label Judul (ID) *</Label>
                                <Input
                                    id="edit_title_id"
                                    placeholder="cth: Penerima Manfaat"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_title_en" className="text-gray-700 dark:text-gray-300">Label Judul (EN)</Label>
                                <Input
                                    id="edit_title_en"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_icon" className="text-gray-700 dark:text-gray-300">Ikon Visual (Opsional)</Label>
                                <IconPicker
                                    id="edit_icon"
                                    value={data.icon}
                                    onChange={(iconName) => setData('icon', iconName)}
                                />
                                {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_sort_order" className="text-gray-700 dark:text-gray-300">Urutan (Sort Order)</Label>
                                    <Input
                                        id="edit_sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
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
                                    <label htmlFor="edit_is_active" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Aktif (Tampilkan di website)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
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
                open={!!statToDelete}
                onOpenChange={(open) => !open && setStatToDelete(null)}
                title="Hapus Statistik Dampak"
                description={`Apakah Anda yakin ingin menghapus statistik "${typeof statToDelete?.title === 'string' ? statToDelete.title : (statToDelete?.title?.id || '')}"? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDeleteStat}
            />
        </>
    );
}

ImpactStatsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Statistik Dampak',
            href: '/admin/impact-stats',
        },
    ],
};
