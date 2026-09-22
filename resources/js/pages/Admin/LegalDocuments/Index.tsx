import { Head, useForm, router } from '@inertiajs/react';
import { 
    Trash2, 
    Edit, 
    Plus, 
    Search, 
    FileText, 
    ExternalLink, 
    FileCheck, 
    Scale, 
    ShieldCheck, 
    Building2, 
    MapPin, 
    Award,
    CheckCircle2,
    XCircle
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const ICON_OPTIONS = [
    { value: 'file-text', label: 'Dokumen Umum', icon: FileText },
    { value: 'shield', label: 'Perisai / Legalitas', icon: ShieldCheck },
    { value: 'scale', label: 'Timbangan / Notaris', icon: Scale },
    { value: 'building', label: 'Gedung / Instansi', icon: Building2 },
    { value: 'map-pin', label: 'Domisili / Lokasi', icon: MapPin },
    { value: 'award', label: 'Akreditasi / Sertifikasi', icon: Award },
];

const PRESET_LOGOS = [
    { label: 'Kemenkumham', path: '/images/about/Logo-Kumham.webp' },
    { label: 'Notaris', path: '/images/about/Logo-Notaris-HD.webp' },
    { label: 'Pemprov DKI', path: '/images/about/logo-Pmeprov-DKI.webp' },
];

export default function LegalDocumentsIndex({ documents, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<any>(null);
    const [docToDelete, setDocToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        title: { id: '', en: '' },
        document_number: '',
        issuer_name: '',
        icon_type: 'file-text',
        publisher_logo: '',
        publisher_logo_file: null as File | null,
        file: null as File | null,
        external_url: '',
        description: { id: '', en: '' },
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/legal-documents',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData({
            _method: 'post',
            title: { id: '', en: '' },
            document_number: '',
            issuer_name: '',
            icon_type: 'file-text',
            publisher_logo: '',
            publisher_logo_file: null,
            file: null,
            external_url: '',
            description: { id: '', en: '' },
            is_active: true,
            sort_order: (documents.data?.length || 0) + 1,
        });
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (doc: any) => {
        setEditingDoc(doc);
        setData({
            _method: 'put',
            title: { 
                id: doc.title_translations?.id || doc.title?.id || doc.title || '', 
                en: doc.title_translations?.en || doc.title?.en || '' 
            },
            document_number: doc.document_number || '',
            issuer_name: doc.issuer_name || '',
            icon_type: doc.icon_type || 'file-text',
            publisher_logo: doc.publisher_logo || '',
            publisher_logo_file: null,
            file: null,
            external_url: doc.external_url || '',
            description: { 
                id: doc.description_translations?.id || doc.description?.id || '', 
                en: doc.description_translations?.en || doc.description?.en || '' 
            },
            is_active: !!doc.is_active,
            sort_order: doc.sort_order ?? 0,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/legal-documents', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDoc) return;

        post(`/admin/legal-documents/${editingDoc.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!docToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/legal-documents/${docToDelete.id}`, {
            onSuccess: () => {
                setDocToDelete(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false),
        });
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'shield': return <ShieldCheck className="w-5 h-5 text-blue-600" />;
            case 'scale': return <Scale className="w-5 h-5 text-indigo-600" />;
            case 'building': return <Building2 className="w-5 h-5 text-emerald-600" />;
            case 'map-pin': return <MapPin className="w-5 h-5 text-amber-600" />;
            case 'award': return <Award className="w-5 h-5 text-purple-600" />;
            default: return <FileText className="w-5 h-5 text-slate-600" />;
        }
    };

    return (
        <>
            <Head title="Dokumen Legalitas Yayasan" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dokumen Legalitas Yayasan</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola SK Kemenkumham, Akta Notaris, Izin PUB Kemensos, serta dokumen perizinan resmi yayasan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari dokumen, SK, instansi..."
                                className="w-full pl-8 sm:w-[260px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Dokumen
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-semibold text-slate-700">Nama Dokumen</TableCell>
                                <TableCell className="font-semibold text-slate-700">Nomor SK / Instansi</TableCell>
                                <TableCell className="font-semibold text-slate-700">Berkas / Akses</TableCell>
                                <TableCell className="font-semibold text-slate-700 text-center">Urutan</TableCell>
                                <TableCell className="font-semibold text-slate-700 text-center">Status</TableCell>
                                <TableCell className="text-right font-semibold text-slate-700">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FileCheck className="w-8 h-8 text-slate-300" />
                                            <span>Belum ada dokumen legalitas yang terdaftar.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.data.map((doc: any) => (
                                    <TableRow key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                    {renderIcon(doc.icon_type)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">
                                                        {doc.title_translations?.id || doc.title?.id || doc.title}
                                                    </div>
                                                    {doc.title_translations?.en && (
                                                        <div className="text-xs text-slate-500 italic">
                                                            {doc.title_translations.en}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {doc.document_number ? (
                                                    <span className="font-medium text-slate-800 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                        {doc.document_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Tidak ada nomor SK</span>
                                                )}
                                                {doc.issuer_name && (
                                                    <div className="text-xs text-slate-600 mt-1 font-medium">
                                                        {doc.issuer_name}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {doc.file_url ? (
                                                <a 
                                                    href={doc.file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                >
                                                    <FileCheck className="w-3.5 h-3.5" />
                                                    Storage Lokal (PDF)
                                                    <ExternalLink className="w-3 h-3 opacity-70" />
                                                </a>
                                            ) : doc.external_url ? (
                                                <a 
                                                    href={doc.external_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Tautan Eksternal
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Belum ada berkas</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center font-medium text-slate-700">
                                            {doc.sort_order}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {doc.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    <XCircle className="w-3 h-3" />
                                                    Draf / Nonaktif
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(doc)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                    title="Edit Dokumen"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDocToDelete(doc)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-red-600 hover:bg-red-50"
                                                    title="Hapus Dokumen"
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

                {/* Pagination if multiple pages */}
                {documents.links && documents.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                        <div className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold">{documents.from || 0}</span> sampai <span className="font-semibold">{documents.to || 0}</span> dari <span className="font-semibold">{documents.total}</span> dokumen
                        </div>
                        <div className="flex gap-1">
                            {documents.links.map((link: any, i: number) => (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={link.active ? "bg-[#1A56DB] text-white" : ""}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tambah Dokumen Legalitas Baru</DialogTitle>
                        <DialogDescription>
                            Tambahkan berkas legalitas resmi yayasan seperti SK Kemenkumham, Akta, Izin PUB Kemensos, dll.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title_id">Nama Dokumen (ID) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title_id"
                                    placeholder="Contoh: Izin PUB (Pengumpulan Uang & Barang)"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title_en">Nama Dokumen (EN)</Label>
                                <Input
                                    id="title_en"
                                    placeholder="Contoh: Public Fundraising Permit"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="document_number">Nomor SK / Sertifikat</Label>
                                <Input
                                    id="document_number"
                                    placeholder="Contoh: No. 123/HUK-PS/2024"
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="issuer_name">Instansi Penerbit</Label>
                                <Input
                                    id="issuer_name"
                                    placeholder="Contoh: Kementerian Sosial RI"
                                    value={data.issuer_name}
                                    onChange={(e) => setData('issuer_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="icon_type">Ikon Visual</Label>
                                <select
                                    id="icon_type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={data.icon_type}
                                    onChange={(e) => setData('icon_type', e.target.value)}
                                >
                                    {ICON_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Urutan Tampil</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Pilihan Logo Instansi</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {PRESET_LOGOS.map((preset) => (
                                    <Button
                                        key={preset.path}
                                        type="button"
                                        variant={data.publisher_logo === preset.path ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setData('publisher_logo', preset.path)}
                                        className="text-xs"
                                    >
                                        <img src={preset.path} alt={preset.label} className="w-4 h-4 mr-1.5 object-contain" />
                                        {preset.label}
                                    </Button>
                                ))}
                                {data.publisher_logo && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setData('publisher_logo', '')}
                                        className="text-xs text-slate-500 hover:text-red-600"
                                    >
                                        Reset Logo
                                    </Button>
                                )}
                            </div>
                            <div className="text-xs text-slate-500">
                                Atau upload logo instansi baru (PNG/WebP maks 2MB):
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('publisher_logo_file', e.target.files ? e.target.files[0] : null)}
                            />
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                            <div>
                                <Label htmlFor="file" className="font-semibold text-slate-900">
                                    Unggah Berkas Resmi (PDF / Gambar) - Direkomendasikan
                                </Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Berkas disimpan di Local Storage server (`storage/app/public/legal-documents`). Pengunjung dapat langsung melihat PDF di browser.
                                </p>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                />
                                {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                                <Label htmlFor="external_url" className="text-slate-700">
                                    Tautan Eksternal Cadangan (Opsional)
                                </Label>
                                <p className="text-xs text-muted-foreground mb-1">
                                    Digunakan jika berkas belum diunggah atau ingin menautkan langsung ke portal verifikasi resmi pemerintah.
                                </p>
                                <Input
                                    id="external_url"
                                    type="url"
                                    placeholder="https://..."
                                    value={data.external_url}
                                    onChange={(e) => setData('external_url', e.target.value)}
                                />
                                {errors.external_url && <p className="text-sm text-red-500">{errors.external_url}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description_id">Keterangan Singkat / Catatan (Opsional)</Label>
                            <Textarea
                                id="description_id"
                                placeholder="Contoh: Berlaku hingga 31 Desember 2026 atau catatan pengesahan."
                                rows={2}
                                value={data.description.id}
                                onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium leading-none cursor-pointer">
                                Aktif (Tampilkan di halaman Tentang Kami). <span className="text-xs text-slate-500 font-normal">Hilangkan centang jika izin masih dalam proses pengajuan.</span>
                            </Label>
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                {processing ? 'Menyimpan...' : 'Simpan Dokumen'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Dokumen Legalitas</DialogTitle>
                        <DialogDescription>
                            Perbarui rincian, nomor SK, atau ganti berkas dokumen legalitas.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_title_id">Nama Dokumen (ID) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit_title_id"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    required
                                />
                                {errors['title.id'] && <p className="text-sm text-red-500">{errors['title.id']}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_title_en">Nama Dokumen (EN)</Label>
                                <Input
                                    id="edit_title_en"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_document_number">Nomor SK / Sertifikat</Label>
                                <Input
                                    id="edit_document_number"
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_issuer_name">Instansi Penerbit</Label>
                                <Input
                                    id="edit_issuer_name"
                                    value={data.issuer_name}
                                    onChange={(e) => setData('issuer_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_icon_type">Ikon Visual</Label>
                                <select
                                    id="edit_icon_type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={data.icon_type}
                                    onChange={(e) => setData('icon_type', e.target.value)}
                                >
                                    {ICON_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_sort_order">Urutan Tampil</Label>
                                <Input
                                    id="edit_sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Pilihan Logo Instansi</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {PRESET_LOGOS.map((preset) => (
                                    <Button
                                        key={preset.path}
                                        type="button"
                                        variant={data.publisher_logo === preset.path ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setData('publisher_logo', preset.path)}
                                        className="text-xs"
                                    >
                                        <img src={preset.path} alt={preset.label} className="w-4 h-4 mr-1.5 object-contain" />
                                        {preset.label}
                                    </Button>
                                ))}
                                {data.publisher_logo && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setData('publisher_logo', '')}
                                        className="text-xs text-slate-500 hover:text-red-600"
                                    >
                                        Reset Logo
                                    </Button>
                                )}
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('publisher_logo_file', e.target.files ? e.target.files[0] : null)}
                            />
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                            <div>
                                <Label htmlFor="edit_file" className="font-semibold text-slate-900">
                                    Ganti Berkas Resmi (PDF / Gambar)
                                </Label>
                                {editingDoc?.file_url && (
                                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 my-2 flex items-center justify-between">
                                        <span>Berkas tersimpan saat ini: <strong>Tersedia di Local Storage</strong></span>
                                        <a href={editingDoc.file_url} target="_blank" rel="noopener noreferrer" className="underline font-semibold flex items-center gap-1">
                                            Lihat File <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                                <Input
                                    id="edit_file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                />
                                {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                                <Label htmlFor="edit_external_url" className="text-slate-700">
                                    Tautan Eksternal Cadangan
                                </Label>
                                <Input
                                    id="edit_external_url"
                                    type="url"
                                    placeholder="https://..."
                                    value={data.external_url}
                                    onChange={(e) => setData('external_url', e.target.value)}
                                />
                                {errors.external_url && <p className="text-sm text-red-500">{errors.external_url}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_description_id">Keterangan Singkat / Catatan</Label>
                            <Textarea
                                id="edit_description_id"
                                rows={2}
                                value={data.description.id}
                                onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit_is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="edit_is_active" className="text-sm font-medium leading-none cursor-pointer">
                                Aktif (Tampilkan di halaman Tentang Kami)
                            </Label>
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                {processing ? 'Menyimpan...' : 'Perbarui Dokumen'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION */}
            <ConfirmDialog
                open={!!docToDelete}
                onOpenChange={(open) => !open && setDocToDelete(null)}
                title="Hapus Dokumen Legalitas"
                description={`Apakah Anda yakin ingin menghapus dokumen "${docToDelete?.title_translations?.id || docToDelete?.title?.id || docToDelete?.title}"? Berkas fisik yang tersimpan di storage juga akan dihapus.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}

LegalDocumentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dokumen Legalitas',
            href: '/admin/legal-documents',
        },
    ],
};
