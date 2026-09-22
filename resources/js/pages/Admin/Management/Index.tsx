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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ManagementIndex({ members, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        name: '',
        position: { id: '', en: '', ar: '' },
        image_url: null as File | null,
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/management-members',
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

    const openEditModal = (member: any) => {
        setEditingMember(member);
        setData({
            _method: 'put',
            name: member.name,
            position: { 
                id: member.position_translations?.id || '', 
                en: member.position_translations?.en || '', 
                ar: member.position_translations?.ar || '' 
            },
            image_url: null,
            is_active: member.is_active,
            sort_order: member.sort_order,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/management-members', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingMember) {
return;
}
        
        post(`/admin/management-members/${editingMember.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const [memberToDelete, setMemberToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteMember = () => {
        if (!memberToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/management-members/${memberToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setMemberToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Tim Manajemen" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tim Manajemen</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola profil tim manajemen yang ditampilkan di website.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-gray-400 dark:text-gray-500 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari nama/jabatan..."
                                className="w-full pl-8 sm:w-[250px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/70 dark:bg-gray-800/50">
                            <TableRow className="border-gray-200 dark:border-gray-800">
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Profil</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Jabatan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400 text-center">Urutan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Status</TableCell>
                                <TableCell className="text-right font-semibold text-xs text-gray-500 dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data manajemen.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                members.data.map((member: any) => (
                                    <TableRow key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-800">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                                                    {member.image_url ? (
                                                        <img src={`/storage/${member.image_url}`} alt={member.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="flex h-full w-full items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">{member.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-300">
                                            {member.position_translations?.id || member.position}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600 dark:text-gray-300">{member.sort_order}</TableCell>
                                        <TableCell>
                                            {member.is_active ? (
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
                                                    onClick={() => openEditModal(member)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setMemberToDelete(member)}
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
                <DialogContent className="sm:max-w-[500px] border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitCreate}>
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Tambah Anggota Manajemen</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Nama Lengkap *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="position_id" className="text-gray-700 dark:text-gray-300">Jabatan (ID) *</Label>
                                <Input
                                    id="position_id"
                                    value={data.position.id}
                                    onChange={(e) => setData('position', { ...data.position, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors['position.id'] && <p className="text-sm text-red-500">{errors['position.id']}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="position_en" className="text-gray-700 dark:text-gray-300">Jabatan (EN)</Label>
                                <Input
                                    id="position_en"
                                    value={data.position.en}
                                    onChange={(e) => setData('position', { ...data.position, en: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Foto Profil</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    onChange={(e) => setData('image_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white"
                                />
                                {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
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
                <DialogContent className="sm:max-w-[500px] border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitEdit}>
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Edit Anggota Manajemen</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_name" className="text-gray-700 dark:text-gray-300">Nama Lengkap *</Label>
                                <Input
                                    id="edit_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="edit_position_id" className="text-gray-700 dark:text-gray-300">Jabatan (ID) *</Label>
                                <Input
                                    id="edit_position_id"
                                    value={data.position.id}
                                    onChange={(e) => setData('position', { ...data.position, id: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {errors['position.id'] && <p className="text-sm text-red-500">{errors['position.id']}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="edit_position_en" className="text-gray-700 dark:text-gray-300">Jabatan (EN)</Label>
                                <Input
                                    id="edit_position_en"
                                    value={data.position.en}
                                    onChange={(e) => setData('position', { ...data.position, en: e.target.value })}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_image" className="text-gray-700 dark:text-gray-300">Ganti Foto Profil</Label>
                                {editingMember?.image_url && (
                                    <div className="mb-2">
                                        <img src={`/storage/${editingMember.image_url}`} alt="Current" className="h-16 w-16 object-cover rounded-full border border-gray-200 dark:border-gray-700" />
                                    </div>
                                )}
                                <Input
                                    id="edit_image"
                                    type="file"
                                    onChange={(e) => setData('image_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white"
                                />
                                {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
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
                open={!!memberToDelete}
                onOpenChange={(open) => !open && setMemberToDelete(null)}
                title="Hapus Anggota Manajemen"
                description={`Apakah Anda yakin ingin menghapus anggota manajemen "${memberToDelete?.name}" (${memberToDelete?.role_title})? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDeleteMember}
            />
        </>
    );
}

ManagementIndex.layout = {
    breadcrumbs: [
        {
            title: 'Tim Manajemen',
            href: '/admin/management-members',
        },
    ],
};
