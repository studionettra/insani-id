import { Head, Link, useForm, router } from '@inertiajs/react';
import admin from '@/routes/admin';
import { useState } from 'react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersIndex({ users, roles, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(admin.users.index().url, { search }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user: any) => {
        clearErrors();
        reset();
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.roles[0]?.name || '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.users.store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        put(admin.users.update(editingUser.id).url, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(admin.users.destroy(id).url);
        }
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
            <Head title="Manajemen Pengguna" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pengguna Sistem</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola data pengguna, peran, dan akses sistem.
                    </p>
                </div>
                <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
                </Button>
            </div>

            <div className="flex items-center">
                <form onSubmit={handleSearch} className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        type="search" 
                        placeholder="Cari nama atau email..." 
                        className="pl-9 w-full bg-white border-gray-200 focus-visible:ring-[#1A56DB]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableCell isHeader className="font-medium text-gray-500">Nama</TableCell>
                            <TableCell isHeader className="font-medium text-gray-500">Email</TableCell>
                            <TableCell isHeader className="font-medium text-gray-500">Peran</TableCell>
                            <TableCell isHeader className="text-right font-medium text-gray-500">Aksi</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-32 text-gray-500">Tidak ada data pengguna.</TableCell>
                            </TableRow>
                        )}
                        {users.data.map((user: any) => (
                            <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                                <TableCell className="text-gray-600">{user.email}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                        {user.roles[0]?.name || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} className="h-8 w-8 text-gray-400 hover:text-[#1A56DB]">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="h-8 w-8 text-gray-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Tambah */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[425px] border-0 shadow-lg p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900">Tambah Pengguna</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Tambahkan pengguna baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="px-6 py-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="role" className="text-sm font-medium text-gray-700">Peran (Role)</Label>
                                <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                    <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB]">
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role: string) => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                <Input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} required className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">Konfirmasi Password</Label>
                                <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                            </div>
                        </div>
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-100">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] text-white hover:bg-[#1e40af]">
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px] border-0 shadow-lg p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900">Edit Pengguna</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Ubah data pengguna terpilih.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}>
                        <div className="px-6 py-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                                <Input id="edit-name" value={data.name} onChange={e => setData('name', e.target.value)} required className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email</Label>
                                <Input id="edit-email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">Peran (Role)</Label>
                                <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                    <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB]">
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role: string) => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-password" className="text-sm font-medium text-gray-700">Password (Opsional)</Label>
                                <Input id="edit-password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-password_confirmation" className="text-sm font-medium text-gray-700">Konfirmasi Password (Opsional)</Label>
                                <Input id="edit-password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="border-gray-200 focus-visible:ring-[#1A56DB]" />
                            </div>
                        </div>
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-100">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] text-white hover:bg-[#1e40af]">
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Pengguna',
            href: '/admin/users',
        },
    ],
};
