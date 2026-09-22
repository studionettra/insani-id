import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search, Star, MessageSquareQuote, User } from 'lucide-react';
import React, { useState } from 'react';
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
    role: string | null;
    avatar_path: string | null;
    avatar_url: string | null;
    content: string;
    rating: number;
    is_active: boolean;
    sort_order: number;
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

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        name: '',
        role: '',
        content: '',
        rating: 5,
        avatar: null as File | null,
        is_active: true,
        sort_order: 0,
    });

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
            role: 'Donatur Rutin Program Insani',
            content: '',
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
        setData({
            _method: 'put',
            name: item.name,
            role: item.role || '',
            content: item.content,
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
            },
        });
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/testimonials/${itemToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setItemToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Testimoni Donatur" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Testimoni Donatur & Mitra</h2>
                        <p className="text-sm text-slate-500">
                            Kelola cerita, ulasan, dan apresiasi donatur yang ditampilkan di halaman beranda.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2 bg-insani-blue hover:bg-insani-blue/90 text-white">
                        <Plus className="h-4 w-4" />
                        Tambah Testimoni
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama / peran / ulasan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                        <Button type="submit" variant="secondary">Cari</Button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/70">
                                <TableHead className="w-16 text-center">Urutan</TableHead>
                                <TableHead>Profil Donatur</TableHead>
                                <TableHead>Ulasan & Cerita</TableHead>
                                <TableHead className="text-center">Rating</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testimonials.data && testimonials.data.length > 0 ? (
                                testimonials.data.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                                        <TableCell className="text-center font-mono text-sm text-slate-500">
                                            {item.sort_order}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.avatar_url ? (
                                                    <img
                                                        src={item.avatar_url}
                                                        alt={item.name}
                                                        className="h-10 w-10 object-cover rounded-full border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-slate-900 block">{item.name}</span>
                                                    {item.role && (
                                                        <span className="text-xs text-slate-500">{item.role}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-slate-600 line-clamp-2 max-w-md italic">
                                                "{item.content}"
                                            </p>
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
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-100 text-slate-600'
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
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-insani-blue"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setItemToDelete(item)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
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
                <DialogContent className="max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle>Tambah Testimoni</DialogTitle>
                        <DialogDescription>
                            Tambahkan testimoni kepuasan atau pengalaman donatur/mitra.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Donatur / Mitra *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Dr. H. Ahmad Fauzi"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="role">Profesi / Status Donatur</Label>
                            <Input
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                placeholder="Contoh: Donatur Rutin / Relawan Fundraiser"
                            />
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>

                        <div>
                            <Label htmlFor="content">Isi Testimoni / Ulasan *</Label>
                            <Textarea
                                id="content"
                                rows={4}
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                placeholder="Tuliskan pengalaman atau pesan kebaikan donatur..."
                                required
                            />
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="rating">Bintang Rating (1 - 5)</Label>
                                <select
                                    id="rating"
                                    value={data.rating}
                                    onChange={(e) => setData('rating', parseInt(e.target.value) || 5)}
                                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                                    <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                                    <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="sort_order">Nomor Urut Tampil</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="avatar">Foto Avatar (Opsional)</Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('avatar', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
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
                <DialogContent className="max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Testimoni</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi ulasan donatur.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit_name">Nama Donatur / Mitra *</Label>
                            <Input
                                id="edit_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="edit_role">Profesi / Status Donatur</Label>
                            <Input
                                id="edit_role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                            />
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>

                        <div>
                            <Label htmlFor="edit_content">Isi Testimoni / Ulasan *</Label>
                            <Textarea
                                id="edit_content"
                                rows={4}
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                required
                            />
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit_rating">Bintang Rating (1 - 5)</Label>
                                <select
                                    id="edit_rating"
                                    value={data.rating}
                                    onChange={(e) => setData('rating', parseInt(e.target.value) || 5)}
                                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                                    <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                                    <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="edit_sort_order">Nomor Urut Tampil</Label>
                                <Input
                                    id="edit_sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit_avatar">Foto Avatar (Ganti bila perlu)</Label>
                            <Input
                                id="edit_avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('avatar', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit_is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="edit_is_active" className="text-sm font-medium cursor-pointer">
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
