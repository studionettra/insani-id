import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

export default function ImpactStatsIndex({ impactStats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStat, setEditingStat] = useState<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors, put } = useForm({
        title: { id: '', en: '', ar: '' },
        value: '',
        icon: '',
        category: '',
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
            category: stat.category || '',
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
        if (!editingStat) return;
        
        put(`/admin/impact-stats/${editingStat.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const deleteStat = (stat: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus data statistik ini?')) {
            router.delete(`/admin/impact-stats/${stat.id}`);
        }
    };

    return (
        <>
            <Head title="Statistik Dampak" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Statistik Dampak</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola angka statistik capaian program (penerima manfaat, jumlah program, dll).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari judul..."
                                className="w-full pl-8 sm:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-insani-turquoise hover:bg-insani-turquoise/90 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Stat
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-medium">Kategori</TableCell>
                                <TableCell className="font-medium">Judul (Label)</TableCell>
                                <TableCell className="font-medium">Nilai</TableCell>
                                <TableCell className="font-medium text-center">Urutan</TableCell>
                                <TableCell className="font-medium">Status</TableCell>
                                <TableCell className="text-right font-medium">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {impactStats.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data statistik.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                impactStats.data.map((stat: any) => (
                                    <TableRow key={stat.id}>
                                        <TableCell>{stat.category}</TableCell>
                                        <TableCell>{stat.title_translations?.id || stat.title}</TableCell>
                                        <TableCell className="font-semibold text-lg">{stat.value}</TableCell>
                                        <TableCell className="text-center">{stat.sort_order}</TableCell>
                                        <TableCell>
                                            {stat.is_active ? (
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
                                                    onClick={() => openEditModal(stat)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deleteStat(stat)}
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
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={submitCreate}>
                        <DialogHeader>
                            <DialogTitle>Tambah Statistik Dampak</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Kategori *</Label>
                                    <Input
                                        id="category"
                                        placeholder="cth: Dalam Negeri"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        required
                                    />
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Nilai Angka *</Label>
                                    <Input
                                        id="value"
                                        placeholder="cth: 124M+"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        required
                                    />
                                    {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title_id">Label Judul (ID) *</Label>
                                <Input
                                    id="title_id"
                                    placeholder="cth: Penerima Manfaat"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title_en">Label Judul (EN)</Label>
                                <Input
                                    id="title_en"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="icon">Icon Class (Opsional)</Label>
                                <Input
                                    id="icon"
                                    placeholder="cth: fa-solid fa-users"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                />
                                {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
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
                                    <label htmlFor="is_active" className="text-sm font-medium leading-none">
                                        Aktif (Tampilkan di website)
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
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={submitEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Statistik Dampak</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_category">Kategori *</Label>
                                    <Input
                                        id="edit_category"
                                        placeholder="cth: Dalam Negeri"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        required
                                    />
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_value">Nilai Angka *</Label>
                                    <Input
                                        id="edit_value"
                                        placeholder="cth: 124M+"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        required
                                    />
                                    {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_title_id">Label Judul (ID) *</Label>
                                <Input
                                    id="edit_title_id"
                                    placeholder="cth: Penerima Manfaat"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_title_en">Label Judul (EN)</Label>
                                <Input
                                    id="edit_title_en"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_icon">Icon Class (Opsional)</Label>
                                <Input
                                    id="edit_icon"
                                    placeholder="cth: fa-solid fa-users"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                />
                                {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
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
                                    <label htmlFor="edit_is_active" className="text-sm font-medium leading-none">
                                        Aktif (Tampilkan di website)
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

ImpactStatsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Statistik Dampak',
            href: '/admin/impact-stats',
        },
    ],
};
