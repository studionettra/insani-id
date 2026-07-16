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

export default function PartnersIndex({ partners, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        name: '',
        website_url: '',
        logo_url: null as File | null,
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/partners',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData('_method', 'post');
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (partner: any) => {
        setEditingPartner(partner);
        setData({
            _method: 'put',
            name: partner.name,
            website_url: partner.website_url || '',
            logo_url: null,
            is_active: partner.is_active,
            sort_order: partner.sort_order,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/partners', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPartner) return;
        
        post(`/admin/partners/${editingPartner.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const deletePartner = (partner: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus mitra ini?')) {
            router.delete(`/admin/partners/${partner.id}`);
        }
    };

    return (
        <>
            <Head title="Mitra Kerja Sama" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Mitra Kerja Sama</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola logo mitra dan kerja sama.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari mitra..."
                                className="w-full pl-8 sm:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-insani-turquoise hover:bg-insani-turquoise/90 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Mitra
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-medium">Logo & Nama</TableCell>
                                <TableCell className="font-medium">URL Website</TableCell>
                                <TableCell className="font-medium text-center">Urutan</TableCell>
                                <TableCell className="font-medium">Status</TableCell>
                                <TableCell className="text-right font-medium">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data mitra.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                partners.data.map((partner: any) => (
                                    <TableRow key={partner.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-24 rounded border bg-gray-50 flex items-center justify-center p-2">
                                                    {partner.logo_url ? (
                                                        <img src={`/storage/${partner.logo_url}`} alt={partner.name} className="max-h-full max-w-full object-contain" />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No Logo</span>
                                                    )}
                                                </div>
                                                <div className="font-medium">{partner.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {partner.website_url ? (
                                                <a href={partner.website_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                    {partner.website_url}
                                                </a>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">{partner.sort_order}</TableCell>
                                        <TableCell>
                                            {partner.is_active ? (
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
                                                    onClick={() => openEditModal(partner)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deletePartner(partner)}
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
                            <DialogTitle>Tambah Mitra</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Mitra *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="logo">Logo Mitra *</Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    onChange={(e) => setData('logo_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Recomended: PNG/SVG dengan background transparan.</p>
                                {errors.logo_url && <p className="text-sm text-red-500">{errors.logo_url}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="website_url">URL Website</Label>
                                <Input
                                    id="website_url"
                                    type="url"
                                    placeholder="https://"
                                    value={data.website_url}
                                    onChange={(e) => setData('website_url', e.target.value)}
                                />
                                {errors.website_url && <p className="text-sm text-red-500">{errors.website_url}</p>}
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
                            <DialogTitle>Edit Mitra</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_name">Nama Mitra *</Label>
                                <Input
                                    id="edit_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_logo">Ganti Logo</Label>
                                {editingPartner?.logo_url && (
                                    <div className="mb-2 h-16 w-32 border p-2 flex items-center justify-center bg-gray-50 rounded">
                                        <img src={`/storage/${editingPartner.logo_url}`} alt="Current" className="max-h-full max-w-full object-contain" />
                                    </div>
                                )}
                                <Input
                                    id="edit_logo"
                                    type="file"
                                    onChange={(e) => setData('logo_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                />
                                {errors.logo_url && <p className="text-sm text-red-500">{errors.logo_url}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_website_url">URL Website</Label>
                                <Input
                                    id="edit_website_url"
                                    type="url"
                                    placeholder="https://"
                                    value={data.website_url}
                                    onChange={(e) => setData('website_url', e.target.value)}
                                />
                                {errors.website_url && <p className="text-sm text-red-500">{errors.website_url}</p>}
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

PartnersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Mitra Kerja Sama',
            href: '/admin/partners',
        },
    ],
};
