import { Head, useForm, router } from '@inertiajs/react';
import { 
    Trash2, 
    Edit, 
    Plus, 
    Search, 
    Eye, 
    Megaphone, 
    Calendar, 
    Clock, 
    Sparkles, 
    Layers, 
    ExternalLink, 
    Monitor, 
    Smartphone, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Image as ImageIcon 
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface PopupItem {
    id: number;
    title: string;
    display_type: 'image_only' | 'hybrid';
    image_path: string | null;
    image_url: string | null;
    content: string | null;
    cta_text: string | null;
    cta_url: string | null;
    open_in_new_tab: boolean;
    delay_seconds: number;
    auto_close_seconds: number;
    frequency: 'once_per_day' | 'once_per_session' | 'always';
    target_page: 'all' | 'home_only';
    start_at: string | null;
    end_at: string | null;
    is_active: boolean;
    is_live: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    popups: {
        data: PopupItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function PopupMessagesIndex({ popups, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPopup, setEditingPopup] = useState<PopupItem | null>(null);
    const [previewPopup, setPreviewPopup] = useState<PopupItem | null>(null);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [popupToDelete, setPopupToDelete] = useState<PopupItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        title: '',
        display_type: 'image_only' as 'image_only' | 'hybrid',
        image_path: null as File | null,
        content: '',
        cta_text: 'Lihat Selengkapnya',
        cta_url: '',
        open_in_new_tab: false,
        delay_seconds: 2,
        auto_close_seconds: 0,
        frequency: 'once_per_day' as 'once_per_day' | 'once_per_session' | 'always',
        target_page: 'home_only' as 'all' | 'home_only',
        start_at: '',
        end_at: '',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/popup-messages',
            { 
                search: search || undefined, 
                status: statusFilter === 'all' ? undefined : statusFilter 
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterStatus = (newStatus: string) => {
        setStatusFilter(newStatus);
        router.get(
            '/admin/popup-messages',
            { 
                search: search || undefined, 
                status: newStatus === 'all' ? undefined : newStatus 
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData({
            _method: 'post',
            title: '',
            display_type: 'image_only',
            image_path: null,
            content: '',
            cta_text: 'Lihat Selengkapnya',
            cta_url: '',
            open_in_new_tab: false,
            delay_seconds: 2,
            auto_close_seconds: 0,
            frequency: 'once_per_day',
            target_page: 'home_only',
            start_at: '',
            end_at: '',
            is_active: true,
        });
        setImagePreview(null);
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (popup: PopupItem) => {
        setEditingPopup(popup);
        setData({
            _method: 'put',
            title: popup.title,
            display_type: popup.display_type,
            image_path: null,
            content: popup.content || '',
            cta_text: popup.cta_text || 'Lihat Selengkapnya',
            cta_url: popup.cta_url || '',
            open_in_new_tab: Boolean(popup.open_in_new_tab),
            delay_seconds: popup.delay_seconds ?? 2,
            auto_close_seconds: popup.auto_close_seconds ?? 0,
            frequency: popup.frequency || 'once_per_day',
            target_page: popup.target_page || 'home_only',
            start_at: popup.start_at ? popup.start_at.substring(0, 16) : '',
            end_at: popup.end_at ? popup.end_at.substring(0, 16) : '',
            is_active: Boolean(popup.is_active),
        });
        setImagePreview(popup.image_url || null);
        clearErrors();
        setIsEditModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image_path', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/popup-messages', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setImagePreview(null);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPopup) return;

        post(`/admin/popup-messages/${editingPopup.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingPopup(null);
                reset();
                setImagePreview(null);
            },
        });
    };

    const handleToggleActive = (popup: PopupItem) => {
        router.patch(`/admin/popup-messages/${popup.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!popupToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/popup-messages/${popupToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setPopupToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const formatDateTime = (val: string | null) => {
        if (!val) return '-';
        return new Date(val).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const activeCount = popups.data.filter(p => p.is_active).length;

    return (
        <>
            <Head title="Pesan Pop-up - Admin" />

            <div className="space-y-6 pb-12">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                                <Megaphone className="w-5 h-5" />
                            </span>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Pesan Pop-up & Event Modal
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola pop-up pengumuman dan poster event yang langsung menyapa pengunjung website.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={openCreateModal}
                            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Pop-up
                        </Button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs sm:text-sm font-medium w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => handleFilterStatus('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                statusFilter === 'all'
                                    ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                            }`}
                        >
                            Semua ({popups.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterStatus('active')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                statusFilter === 'active'
                                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
                            }`}
                        >
                            Aktif ({activeCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterStatus('inactive')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                statusFilter === 'inactive'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 shadow-xs font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                            }`}
                        >
                            Nonaktif
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-72">
                        <div className="relative w-full">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari judul pop-up..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white dark:bg-zinc-900 rounded-xl border-gray-200 dark:border-zinc-800 text-sm"
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="rounded-xl shrink-0">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/70 dark:bg-zinc-800/40">
                            <TableRow className="border-b border-gray-100 dark:border-zinc-800">
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase py-3.5 pl-6">Poster</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase py-3.5">Judul & Mode</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase py-3.5">Target & Frekuensi</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase py-3.5">Timer (Delay / Auto)</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase py-3.5">Jadwal Tayang</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase py-3.5 text-center">Status</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase py-3.5 text-right pr-6">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {popups.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
                                                <Megaphone className="w-6 h-6" />
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">Belum ada pesan pop-up</p>
                                            <p className="text-xs text-gray-400 max-w-sm">
                                                Buat pop-up untuk mengumumkan event atau poster promosi penting kepada pengunjung.
                                            </p>
                                            <Button 
                                                onClick={openCreateModal}
                                                size="sm"
                                                className="mt-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl gap-1.5"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Tambah Pop-up Pertama
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                popups.data.map((popup) => (
                                    <TableRow key={popup.id} className="border-b border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        {/* Poster Thumbnail */}
                                        <TableCell className="py-4 pl-6">
                                            {popup.image_url ? (
                                                <div 
                                                    className="w-14 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-xs cursor-pointer hover:opacity-85 transition-opacity relative group"
                                                    onClick={() => setPreviewPopup(popup)}
                                                    title="Klik untuk pratinjau"
                                                >
                                                    <img 
                                                        src={popup.image_url} 
                                                        alt={popup.title} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                        <Eye className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-14 h-16 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-dashed border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Judul & Mode */}
                                        <TableCell className="py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-[220px]">
                                                {popup.title}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                    popup.display_type === 'image_only'
                                                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                                }`}>
                                                    {popup.display_type === 'image_only' ? 'Poster Utuh' : 'Kombinasi Teks'}
                                                </span>
                                                {popup.cta_url && (
                                                    <span className="text-[11px] text-gray-400 truncate max-w-[150px] inline-flex items-center gap-0.5">
                                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                                        {popup.cta_text || 'Link CTA'}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Target & Frekuensi */}
                                        <TableCell className="py-4 text-xs text-gray-600 dark:text-gray-300">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {popup.target_page === 'home_only' ? 'Beranda Saja' : 'Semua Halaman'}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                {popup.frequency === 'once_per_day' && '1x per hari'}
                                                {popup.frequency === 'once_per_session' && '1x per sesi browser'}
                                                {popup.frequency === 'always' && 'Selalu tampil'}
                                            </div>
                                        </TableCell>

                                        {/* Timer */}
                                        <TableCell className="py-4 text-xs">
                                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                <span>Delay: {popup.delay_seconds} detik</span>
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                Auto-close: {popup.auto_close_seconds > 0 ? `${popup.auto_close_seconds} detik` : 'Manual (X)'}
                                            </div>
                                        </TableCell>

                                        {/* Jadwal Tayang */}
                                        <TableCell className="py-4 text-xs text-gray-500 dark:text-gray-400">
                                            {popup.start_at || popup.end_at ? (
                                                <div className="space-y-0.5">
                                                    <div>Mulai: {formatDateTime(popup.start_at)}</div>
                                                    <div>Selesai: {formatDateTime(popup.end_at)}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Tanpa batas waktu</span>
                                            )}
                                        </TableCell>

                                        {/* Status & Quick Toggle */}
                                        <TableCell className="py-4 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Switch
                                                    checked={Boolean(popup.is_active)}
                                                    onCheckedChange={() => handleToggleActive(popup)}
                                                    aria-label="Toggle status pop-up"
                                                />
                                                <span className={`text-[10px] font-semibold ${
                                                    popup.is_live
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : popup.is_active
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-gray-400'
                                                }`}>
                                                    {popup.is_live ? 'Tayang' : popup.is_active ? 'Terjadwal' : 'Nonaktif'}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="py-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Preview Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setPreviewPopup(popup)}
                                                    className="w-8 h-8 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50"
                                                    title="Pratinjau Pop-up"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>

                                                {/* Edit Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(popup)}
                                                    className="w-8 h-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                                    title="Edit Pop-up"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>

                                                {/* Delete Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setPopupToDelete(popup)}
                                                    className="w-8 h-8 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                                    title="Hapus Pop-up"
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
            </div>

            {/* Modal Form Tambah / Edit */}
            <Dialog 
                open={isCreateModalOpen || isEditModalOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateModalOpen(false);
                        setIsEditModalOpen(false);
                        setEditingPopup(null);
                        setImagePreview(null);
                    }
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-brand-600" />
                            {isEditModalOpen ? 'Edit Pesan Pop-up' : 'Tambah Pesan Pop-up Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit} className="space-y-5 py-2">
                        {/* 1. Tipe Tampilan Pop-up */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Format Tampilan Pop-up *
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label 
                                    className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                        data.display_type === 'image_only'
                                            ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/20 shadow-xs'
                                            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="display_type"
                                        value="image_only"
                                        checked={data.display_type === 'image_only'}
                                        onChange={() => setData('display_type', 'image_only')}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <ImageIcon className="w-4 h-4 text-brand-600" />
                                            Poster Utuh (Image-Only)
                                        </span>
                                        {data.display_type === 'image_only' && (
                                            <CheckCircle2 className="w-4 h-4 text-brand-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Cocok untuk flyer event yang sudah dirancang jadi. Seluruh gambar dapat diklik menuju link aksi.
                                    </p>
                                </label>

                                <label 
                                    className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                        data.display_type === 'hybrid'
                                            ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/20 shadow-xs'
                                            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="display_type"
                                        value="hybrid"
                                        checked={data.display_type === 'hybrid'}
                                        onChange={() => setData('display_type', 'hybrid')}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <Layers className="w-4 h-4 text-brand-600" />
                                            Kombinasi (Poster + Teks)
                                        </span>
                                        {data.display_type === 'hybrid' && (
                                            <CheckCircle2 className="w-4 h-4 text-brand-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Banner gambar di bagian atas, disertai teks judul, deskripsi ringkas, dan tombol aksi tersendiri.
                                    </p>
                                </label>
                            </div>
                        </div>

                        {/* 2. Judul Pop-up */}
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Judul Event / Identitas Pop-up *
                            </Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Tanggap Darurat Bencana Banjir Bandang"
                                className="rounded-xl"
                            />
                            {errors.title && <p className="text-xs text-rose-500">{errors.title}</p>}
                        </div>

                        {/* 3. Upload Gambar Poster Flyer */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Unggah Poster / Flyer Event {data.display_type === 'image_only' ? '*' : '(Opsional)'}
                            </Label>
                            <div className="border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 dark:bg-zinc-800/30">
                                {imagePreview ? (
                                    <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-black/5 border border-gray-200 dark:border-zinc-700 shrink-0">
                                        <img 
                                            src={imagePreview} 
                                            alt="Pratinjau poster" 
                                            className="w-full h-full object-cover" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setData('image_path', null);
                                            }}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-28 h-36 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-white dark:bg-zinc-900">
                                        <ImageIcon className="w-8 h-8 opacity-40" />
                                        <span className="text-[10px] mt-1 text-gray-400">Format Poster</span>
                                    </div>
                                )}
                                <div className="space-y-1 flex-1 text-center sm:text-left">
                                    <Input
                                        id="image_path"
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={handleImageChange}
                                        className="cursor-pointer file:cursor-pointer text-xs"
                                    />
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Mendukung format JPG, PNG, atau WebP. Maksimal ukuran file 5 MB. Rasio ideal: portrait 4:5, 3:4, atau square 1:1.
                                    </p>
                                    {errors.image_path && (
                                        <p className="text-xs text-rose-500 font-medium">{errors.image_path}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4. Deskripsi / Konten (Jika Hybrid) */}
                        {data.display_type === 'hybrid' && (
                            <div className="space-y-1.5">
                                <Label htmlFor="content" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Deskripsi Singkat Pengumuman
                                </Label>
                                <Textarea
                                    id="content"
                                    rows={3}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Tuliskan penjelasan singkat mengenai event, kampanye, atau pesan penting yang ingin disampaikan..."
                                    className="rounded-xl text-sm"
                                />
                                {errors.content && <p className="text-xs text-rose-500">{errors.content}</p>}
                            </div>
                        )}

                        {/* 5. Pengaturan Tombol & Link CTA */}
                        <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <ExternalLink className="w-3.5 h-3.5" />
                                Tautan Tindakan (Call to Action)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="cta_text" className="text-xs text-gray-700 dark:text-gray-300">
                                        Teks Tombol Aksi
                                    </Label>
                                    <Input
                                        id="cta_text"
                                        value={data.cta_text}
                                        onChange={(e) => setData('cta_text', e.target.value)}
                                        placeholder="Contoh: Donasi Sekarang"
                                        className="rounded-xl text-sm bg-white dark:bg-zinc-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="cta_url" className="text-xs text-gray-700 dark:text-gray-300">
                                        URL Link Tujuan (Opsional)
                                    </Label>
                                    <Input
                                        id="cta_url"
                                        value={data.cta_url}
                                        onChange={(e) => setData('cta_url', e.target.value)}
                                        placeholder="Contoh: /program/darurat-bencana atau https://..."
                                        className="rounded-xl text-sm bg-white dark:bg-zinc-900"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="open_in_new_tab"
                                    checked={data.open_in_new_tab}
                                    onCheckedChange={(checked) => setData('open_in_new_tab', Boolean(checked))}
                                />
                                <label
                                    htmlFor="open_in_new_tab"
                                    className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    Buka link di tab baru (_blank)
                                </label>
                            </div>
                        </div>

                        {/* 6. Pengaturan Timer & Target Halaman */}
                        <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Pengaturan Waktu & Target Tampil
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="delay_seconds" className="text-xs text-gray-700 dark:text-gray-300">
                                        Jeda Waktu Muncul (Delay Detik)
                                    </Label>
                                    <Input
                                        id="delay_seconds"
                                        type="number"
                                        min="0"
                                        max="60"
                                        value={data.delay_seconds}
                                        onChange={(e) => setData('delay_seconds', parseInt(e.target.value) || 0)}
                                        className="rounded-xl text-sm bg-white dark:bg-zinc-900"
                                    />
                                    <p className="text-[11px] text-gray-400">Pop-up muncul setelah halaman dimuat (disarankan: 2-3 detik).</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="auto_close_seconds" className="text-xs text-gray-700 dark:text-gray-300">
                                        Tutup Otomatis (Auto-Close Detik)
                                    </Label>
                                    <Input
                                        id="auto_close_seconds"
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.auto_close_seconds}
                                        onChange={(e) => setData('auto_close_seconds', parseInt(e.target.value) || 0)}
                                        className="rounded-xl text-sm bg-white dark:bg-zinc-900"
                                    />
                                    <p className="text-[11px] text-gray-400">Isi 0 jika pop-up hanya boleh ditutup manual oleh pengunjung.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <div className="space-y-1.5">
                                    <Label htmlFor="frequency" className="text-xs text-gray-700 dark:text-gray-300">
                                        Frekuensi Tampil per Pengunjung
                                    </Label>
                                    <select
                                        id="frequency"
                                        value={data.frequency}
                                        onChange={(e) => setData('frequency', e.target.value as any)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm px-3 py-2 text-gray-900 dark:text-white"
                                    >
                                        <option value="once_per_day">1x Per 24 Jam (Direkomendasikan)</option>
                                        <option value="once_per_session">1x Per Sesi Browser</option>
                                        <option value="always">Selalu Tampil (Setiap Buka Halaman)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="target_page" className="text-xs text-gray-700 dark:text-gray-300">
                                        Target Halaman Tampil
                                    </Label>
                                    <select
                                        id="target_page"
                                        value={data.target_page}
                                        onChange={(e) => setData('target_page', e.target.value as any)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm px-3 py-2 text-gray-900 dark:text-white"
                                    >
                                        <option value="home_only">Hanya Halaman Beranda (/)</option>
                                        <option value="all">Semua Halaman Publik</option>
                                    </select>
                                </div>
                            </div>

                            {/* Jadwal Tayang Otomatis */}
                            <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-700/60">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                    Jadwal Periode Tayang Otomatis (Opsional)
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[11px] text-gray-500">Mulai Tayang:</span>
                                        <Input
                                            type="datetime-local"
                                            value={data.start_at}
                                            onChange={(e) => setData('start_at', e.target.value)}
                                            className="rounded-xl text-xs bg-white dark:bg-zinc-900"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[11px] text-gray-500">Berakhir Tayang:</span>
                                        <Input
                                            type="datetime-local"
                                            value={data.end_at}
                                            onChange={(e) => setData('end_at', e.target.value)}
                                            className="rounded-xl text-xs bg-white dark:bg-zinc-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Sakelar */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40">
                            <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Aktifkan Pop-up Sekarang
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Jika diaktifkan dan sesuai jadwal, pop-up akan langsung tampil kepada pengunjung website.
                                </div>
                            </div>
                            <Switch
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                    setImagePreview(null);
                                }}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
                            >
                                {processing ? 'Menyimpan...' : isEditModalOpen ? 'Simpan Perubahan' : 'Buat Pop-up'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Live Preview */}
            <Dialog open={Boolean(previewPopup)} onOpenChange={(open) => !open && setPreviewPopup(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-zinc-950 border-zinc-800 text-white">
                    {/* Header Toolbar Pratinjau */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <div>
                                <h3 className="font-semibold text-sm text-white">Pratinjau Pop-up Langsung</h3>
                                <p className="text-xs text-zinc-400">Simulasi pengalaman visual pengunjung saat membuka website</p>
                            </div>
                        </div>

                        {/* Device Toggle */}
                        <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setPreviewDevice('desktop')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                                    previewDevice === 'desktop' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <Monitor className="w-3.5 h-3.5" />
                                Desktop
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewDevice('mobile')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                                    previewDevice === 'mobile' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                Mobile
                            </button>
                        </div>
                    </div>

                    {/* Preview Canvas Area */}
                    <div className="p-6 md:p-12 flex items-center justify-center min-h-[460px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative">
                        {/* Simulated Backdrop */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs pointer-events-none" />

                        {previewPopup && (
                            <div 
                                className={`relative z-10 w-full transition-all duration-300 ${
                                    previewDevice === 'mobile' 
                                        ? 'max-w-[340px] shadow-2xl rounded-3xl overflow-hidden' 
                                        : 'max-w-[480px] shadow-2xl rounded-2xl overflow-hidden'
                                } bg-white text-zinc-900 border border-zinc-200/30 animate-in fade-in-0 zoom-in-95 duration-200`}
                            >
                                {/* Floating Close Button */}
                                <button
                                    type="button"
                                    onClick={() => setPreviewPopup(null)}
                                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-md active:scale-95"
                                    aria-label="Tutup pratinjau"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {previewPopup.display_type === 'image_only' ? (
                                    /* Image Only Mode: The entire modal is the poster flyer */
                                    <div className="relative group cursor-pointer">
                                        {previewPopup.image_url ? (
                                            <img
                                                src={previewPopup.image_url}
                                                alt={previewPopup.title}
                                                className="w-full max-h-[75vh] object-contain bg-zinc-900 block"
                                            />
                                        ) : (
                                            <div className="w-full h-80 bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                                                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                                <span className="font-semibold text-sm">Poster Belum Diunggah</span>
                                                <span className="text-xs text-zinc-500 mt-1">Unggah flyer untuk melihat tampilan visual penuh</span>
                                            </div>
                                        )}

                                        {previewPopup.cta_url && (
                                            <div className="p-3 bg-zinc-900/95 text-white flex items-center justify-between px-4">
                                                <span className="text-xs font-medium truncate">{previewPopup.cta_text || 'Lihat Selengkapnya'}</span>
                                                <span className="text-xs font-bold text-brand-400 flex items-center gap-1">
                                                    Kunjungi &rarr;
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Hybrid Mode: Banner Image + Content + Button */
                                    <div className="flex flex-col">
                                        {previewPopup.image_url && (
                                            <div className="w-full max-h-56 overflow-hidden bg-zinc-100">
                                                <img
                                                    src={previewPopup.image_url}
                                                    alt={previewPopup.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-5 space-y-3">
                                            <h4 className="text-lg font-bold text-zinc-900 leading-tight">
                                                {previewPopup.title}
                                            </h4>
                                            {previewPopup.content && (
                                                <p className="text-xs text-zinc-600 leading-relaxed">
                                                    {previewPopup.content}
                                                </p>
                                            )}
                                            {previewPopup.cta_url && (
                                                <div className="pt-2">
                                                    <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm">
                                                        {previewPopup.cta_text || 'Pelajari Lebih Lanjut'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                        <span>Timer Delay: {previewPopup?.delay_seconds}s | Frekuensi: {previewPopup?.frequency}</span>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setPreviewPopup(null)}
                            className="rounded-lg text-xs"
                        >
                            Tutup Pratinjau
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={Boolean(popupToDelete)}
                onOpenChange={(open) => !open && setPopupToDelete(null)}
                title="Hapus Pesan Pop-up?"
                description={`Apakah Anda yakin ingin menghapus "${popupToDelete?.title}"? Tindakan ini akan menghapus data dan berkas gambar dari server secara permanen.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}

PopupMessagesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pesan Pop-up',
            href: '/admin/popup-messages',
        },
    ],
};
