import { Head, Link, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import admin from '@/routes/admin';

export default function UsersIndex({ users, roles, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            admin.users.index().url,
            { search },
            { preserveState: true, replace: true },
        );
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

        if (!editingUser) {
            return;
        }

        put(admin.users.update(editingUser.id).url, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        destroy(admin.users.destroy(userToDelete.id).url, {
            onFinish: () => {
                setIsDeleting(false);
                setUserToDelete(null);
            },
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
            <Head title="Manajemen Pengguna" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Pengguna Sistem
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Kelola data pengguna, peran, dan akses sistem.
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-[#1A56DB] text-white hover:bg-[#1e40af]"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
                </Button>
            </div>

            <div className="flex items-center">
                <form
                    onSubmit={handleSearch}
                    className="relative w-full sm:w-[320px]"
                >
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Cari nama atau email..."
                        className="w-full border-gray-200 bg-white pl-9 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <Table>
                    <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="font-medium text-gray-500 dark:text-gray-400"
                            >
                                Nama
                            </TableCell>
                            <TableCell
                                isHeader
                                className="font-medium text-gray-500 dark:text-gray-400"
                            >
                                Email
                            </TableCell>
                            <TableCell
                                isHeader
                                className="font-medium text-gray-500 dark:text-gray-400"
                            >
                                Peran
                            </TableCell>
                            <TableCell
                                isHeader
                                className="text-right font-medium text-gray-500 dark:text-gray-400"
                            >
                                Aksi
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-32 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Tidak ada data pengguna.
                                </TableCell>
                            </TableRow>
                        )}
                        {users.data.map((user: any) => (
                            <TableRow
                                key={user.id}
                                className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                            >
                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                </TableCell>
                                <TableCell className="text-gray-600 dark:text-gray-300">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800">
                                        {user.roles[0]?.name || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(user)}
                                            className="h-8 w-8 text-gray-400 hover:text-[#1A56DB] dark:hover:text-blue-400"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setUserToDelete(user)
                                            }
                                            className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                        >
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
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            >
                <DialogContent className="overflow-hidden border-0 bg-white p-0 shadow-lg sm:max-w-[425px] dark:border dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            Tambah Pengguna
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Tambahkan pengguna baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-4 px-6 py-4">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="role"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Peran (Role)
                                </Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(val) =>
                                        setData('role', val)
                                    }
                                >
                                    <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role: string) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-xs text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    placeholder="Minimal 8 karakter"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Kombinasi wajib: minimal 8 karakter,
                                    mengandung huruf besar, huruf kecil, angka,
                                    dan simbol (contoh: !@#$%^&*).
                                </p>
                                {errors.password && (
                                    <p className="text-xs font-medium text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Konfirmasi Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="Ulangi password"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-xs font-medium text-red-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#1A56DB] text-white hover:bg-[#1e40af]"
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="overflow-hidden border-0 bg-white p-0 shadow-lg sm:max-w-[425px] dark:border dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            Edit Pengguna
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Ubah data pengguna terpilih.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}>
                        <div className="space-y-4 px-6 py-4">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="edit-name"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="edit-email"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="edit-role"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Peran (Role)
                                </Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(val) =>
                                        setData('role', val)
                                    }
                                >
                                    <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role: string) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-xs text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="edit-password"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Password (Opsional)
                                </Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="Kosongkan jika tidak ingin mengubah"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Jika diubah: minimal 8 karakter dengan
                                    kombinasi huruf besar, huruf kecil, angka,
                                    dan simbol (contoh: !@#$%^&*).
                                </p>
                                {errors.password && (
                                    <p className="text-xs font-medium text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="edit-password_confirmation"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Konfirmasi Password (Opsional)
                                </Label>
                                <Input
                                    id="edit-password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Ulangi password baru"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-xs font-medium text-red-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#1A56DB] text-white hover:bg-[#1e40af]"
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!userToDelete}
                onOpenChange={(open) => !open && setUserToDelete(null)}
                title="Hapus Pengguna"
                description={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}" (${userToDelete?.email})? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleConfirmDelete}
            />
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
