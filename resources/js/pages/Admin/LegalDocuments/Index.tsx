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
    XCircle,
    Languages
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import { autoTranslateFields } from '@/lib/translate';
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
    const [isTranslating, setIsTranslating] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        title: { id: '', en: '', ar: '' },
        document_number: '',
        issuer_name: '',
        icon_type: 'file-text',
        publisher_logo: '',
        publisher_logo_file: null as File | null,
        file: null as File | null,
        external_url: '',
        description: { id: '', en: '', ar: '' },
        is_active: true,
        sort_order: 0,
    });

    const handleAutoTranslate = async () => {
        const sourceTitle = data.title.id;
        const sourceDesc = data.description.id;

        if (!sourceTitle.trim() && !sourceDesc.trim()) {
            toast.error('Silakan isi Nama Dokumen (ID) terlebih dahulu sebelum menerjemahkan.');
            return;
        }

        setIsTranslating(true);
        try {
            const fieldsToTranslate: Record<string, string> = {};
            if (sourceTitle.trim()) {
                fieldsToTranslate.title = sourceTitle.trim();
            }
            if (sourceDesc.trim()) {
                fieldsToTranslate.description = sourceDesc.trim();
            }

            const res = await autoTranslateFields(fieldsToTranslate);

            if (res) {
                setData(prev => ({
                    ...prev,
                    title: {
                        id: prev.title.id,
                        en: res.title?.en || prev.title.en,
                        ar: res.title?.ar || prev.title.ar,
                    },
                    description: {
                        id: prev.description.id,
                        en: res.description?.en || prev.description.en,
                        ar: res.description?.ar || prev.description.ar,
                    },
                }));
                toast.success('Dokumen legalitas berhasil diterjemahkan ke bahasa Inggris dan Arab.');
            }
        } catch (err) {
            toast.error('Gagal menerjemahkan secara otomatis. Silakan coba lagi.');
        } finally {
            setIsTranslating(false);
        }
    };

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
            title: { id: '', en: '', ar: '' },
            document_number: '',
            issuer_name: '',
            icon_type: 'file-text',
            publisher_logo: '',
            publisher_logo_file: null,
            file: null,
            external_url: '',
            description: { id: '', en: '', ar: '' },
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
                id: doc.title_translations?.id || doc.title?.id || (typeof doc.title === 'string' ? doc.title : ''), 
                en: doc.title_translations?.en || doc.title?.en || '',
                ar: doc.title_translations?.ar || doc.title?.ar || '',
            },
            document_number: doc.document_number || '',
            issuer_name: doc.issuer_name || '',
            icon_type: doc.icon_type || 'file-text',
            publisher_logo: doc.publisher_logo || '',
            publisher_logo_file: null,
            file: null,
            external_url: doc.external_url || '',
            description: { 
                id: doc.description_translations?.id || doc.description?.id || (typeof doc.description === 'string' ? doc.description : ''), 
                en: doc.description_translations?.en || doc.description?.en || '',
                ar: doc.description_translations?.ar || doc.description?.ar || '',
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
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dokumen Legalitas Yayasan</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola SK Kemenkumham, Akta Notaris, Izin PUB Kemensos, serta dokumen perizinan resmi yayasan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-gray-400 dark:text-gray-500 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari dokumen, SK, instansi..."
                                className="w-full pl-8 sm:w-[260px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Dokumen
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                    <Table>
                        <TableHeader className="bg-gray-50/70 dark:bg-gray-800/50">
                            <TableRow className="border-gray-200 dark:border-gray-800">
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Nama Dokumen</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Nomor SK / Instansi</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Berkas / Akses</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400 text-center">Urutan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400 text-center">Status</TableCell>
                                <TableCell className="text-right font-semibold text-xs text-gray-500 dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FileCheck className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            <span>Belum ada dokumen legalitas yang terdaftar.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.data.map((doc: any) => (
                                    <TableRow key={doc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-800">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                                                    {renderIcon(doc.icon_type)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {doc.title_translations?.id || doc.title?.id || doc.title}
                                                    </div>
                                                    {doc.title_translations?.en && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                            {doc.title_translations.en}
                                                        </div>
                                                    )}
                                                    {/* Language badges */}
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            ID ✓
                                                        </span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                                            doc.title_translations?.en || doc.title?.en
                                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                        }`}>
                                                            EN {doc.title_translations?.en || doc.title?.en ? '✓' : '—'}
                                                        </span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                                            doc.title_translations?.ar || doc.title?.ar
                                                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                        }`}>
                                                            AR {doc.title_translations?.ar || doc.title?.ar ? '✓' : '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {doc.document_number ? (
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                                        {doc.document_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">Tidak ada nomor SK</span>
                                                )}
                                                {doc.issuer_name && (
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
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
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-900/50 transition-colors"
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
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 dark:hover:bg-amber-900/50 transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Tautan Eksternal
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada berkas</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300">
                                            {doc.sort_order}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {doc.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
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
                                                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                    title="Edit Dokumen"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDocToDelete(doc)}
                                                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
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
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{documents.from || 0}</span> sampai <span className="font-semibold text-gray-900 dark:text-white">{documents.to || 0}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{documents.total}</span> dokumen
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
                                    className={link.active ? "bg-[#1A56DB] text-white" : "border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Tambah Dokumen Legalitas Baru</DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-gray-400">
                            Tambahkan berkas legalitas resmi yayasan seperti SK Kemenkumham, Akta, Izin PUB Kemensos, dll.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4 pt-2">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.title.id)}
                            hasEn={Boolean(data.title.en)}
                            hasAr={Boolean(data.title.ar)}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            compact
                            description="Terjemahkan nama dan keterangan dokumen legalitas ke bahasa Inggris dan Arab secara otomatis."
                        />

                        {/* Nama Dokumen Multi-Bahasa */}
                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Nama Dokumen Resmi
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">ID (Indonesia) *</span>
                                    <Input
                                        id="title_id"
                                        placeholder="Contoh: Izin PUB Kemensos"
                                        value={data.title.id}
                                        onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                        required
                                    />
                                    {errors['title.id'] && <p className="text-xs text-red-500 mt-1">{errors['title.id']}</p>}
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">EN (English)</span>
                                    <Input
                                        id="title_en"
                                        placeholder="e.g. Public Fundraising Permit"
                                        value={data.title.en}
                                        onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">AR (العربية)</span>
                                    <Input
                                        id="title_ar"
                                        dir="rtl"
                                        placeholder="مثال: تصريح جمع التبرعات العامة"
                                        value={data.title.ar}
                                        onChange={(e) => setData('title', { ...data.title, ar: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="document_number" className="text-gray-700 dark:text-gray-300">Nomor SK / Sertifikat</Label>
                                <Input
                                    id="document_number"
                                    placeholder="Contoh: No. 123/HUK-PS/2024"
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="issuer_name" className="text-gray-700 dark:text-gray-300">Instansi Penerbit</Label>
                                <Input
                                    id="issuer_name"
                                    placeholder="Contoh: Kementerian Sosial RI"
                                    value={data.issuer_name}
                                    onChange={(e) => setData('issuer_name', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="icon_type" className="text-gray-700 dark:text-gray-300">Ikon Visual</Label>
                                <select
                                    id="icon_type"
                                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={data.icon_type}
                                    onChange={(e) => setData('icon_type', e.target.value)}
                                >
                                    {ICON_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort_order" className="text-gray-700 dark:text-gray-300">Urutan Tampil</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">Pilihan Logo Instansi</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {PRESET_LOGOS.map((preset) => (
                                    <Button
                                        key={preset.path}
                                        type="button"
                                        variant={data.publisher_logo === preset.path ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setData('publisher_logo', preset.path)}
                                        className={data.publisher_logo === preset.path ? "text-xs" : "text-xs border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}
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
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                    >
                                        Reset Logo
                                    </Button>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Atau upload logo instansi baru (PNG/WebP maks 2MB):
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('publisher_logo_file', e.target.files ? e.target.files[0] : null)}
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white"
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                            <div>
                                <Label htmlFor="file" className="font-semibold text-gray-900 dark:text-white">
                                    Unggah Berkas Resmi (PDF / Gambar) - Direkomendasikan
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Berkas disimpan di Local Storage server (`storage/app/public/legal-documents`). Pengunjung dapat langsung melihat PDF di browser.
                                </p>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white"
                                />
                                {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
                            </div>

                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <Label htmlFor="external_url" className="text-gray-700 dark:text-gray-300">
                                    Tautan Eksternal Cadangan (Opsional)
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Digunakan jika berkas belum diunggah atau ingin menautkan langsung ke portal verifikasi resmi pemerintah.
                                </p>
                                <Input
                                    id="external_url"
                                    type="url"
                                    placeholder="https://..."
                                    value={data.external_url}
                                    onChange={(e) => setData('external_url', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                                {errors.external_url && <p className="text-sm text-red-500">{errors.external_url}</p>}
                            </div>
                        </div>

                        {/* Keterangan Multi-Bahasa */}
                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Keterangan Singkat / Catatan (Opsional)
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">ID (Indonesia)</span>
                                    <Textarea
                                        id="description_id"
                                        placeholder="Berlaku hingga 31 Desember 2026..."
                                        rows={2}
                                        value={data.description.id}
                                        onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">EN (English)</span>
                                    <Textarea
                                        id="description_en"
                                        placeholder="Valid until December 31, 2026..."
                                        rows={2}
                                        value={data.description.en}
                                        onChange={(e) => setData('description', { ...data.description, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">AR (العربية)</span>
                                    <Textarea
                                        id="description_ar"
                                        dir="rtl"
                                        placeholder="صالح حتى 31 ديسمبر 2026..."
                                        rows={2}
                                        value={data.description.ar}
                                        onChange={(e) => setData('description', { ...data.description, ar: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium leading-none cursor-pointer text-gray-700 dark:text-gray-300">
                                Aktif (Tampilkan di halaman Tentang Kami). <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">Hilangkan centang jika izin masih dalam proses pengajuan.</span>
                            </Label>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setIsCreateModalOpen(false)}>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Edit Dokumen Legalitas</DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-gray-400">
                            Perbarui rincian, nomor SK, atau ganti berkas dokumen legalitas.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4 pt-2">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.title.id)}
                            hasEn={Boolean(data.title.en)}
                            hasAr={Boolean(data.title.ar)}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            compact
                            description="Terjemahkan nama dan keterangan dokumen legalitas ke bahasa Inggris dan Arab secara otomatis."
                        />

                        {/* Nama Dokumen Multi-Bahasa */}
                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Nama Dokumen Resmi
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">ID (Indonesia) *</span>
                                    <Input
                                        id="edit_title_id"
                                        value={data.title.id}
                                        onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                        required
                                    />
                                    {errors['title.id'] && <p className="text-xs text-red-500 mt-1">{errors['title.id']}</p>}
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">EN (English)</span>
                                    <Input
                                        id="edit_title_en"
                                        value={data.title.en}
                                        onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">AR (العربية)</span>
                                    <Input
                                        id="edit_title_ar"
                                        dir="rtl"
                                        value={data.title.ar}
                                        onChange={(e) => setData('title', { ...data.title, ar: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_document_number" className="text-gray-700 dark:text-gray-300">Nomor SK / Sertifikat</Label>
                                <Input
                                    id="edit_document_number"
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_issuer_name" className="text-gray-700 dark:text-gray-300">Instansi Penerbit</Label>
                                <Input
                                    id="edit_issuer_name"
                                    value={data.issuer_name}
                                    onChange={(e) => setData('issuer_name', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_icon_type" className="text-gray-700 dark:text-gray-300">Ikon Visual</Label>
                                <select
                                    id="edit_icon_type"
                                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={data.icon_type}
                                    onChange={(e) => setData('icon_type', e.target.value)}
                                >
                                    {ICON_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_sort_order" className="text-gray-700 dark:text-gray-300">Urutan Tampil</Label>
                                <Input
                                    id="edit_sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">Pilihan Logo Instansi</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {PRESET_LOGOS.map((preset) => (
                                    <Button
                                        key={preset.path}
                                        type="button"
                                        variant={data.publisher_logo === preset.path ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setData('publisher_logo', preset.path)}
                                        className={data.publisher_logo === preset.path ? "text-xs" : "text-xs border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}
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
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                    >
                                        Reset Logo
                                    </Button>
                                )}
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('publisher_logo_file', e.target.files ? e.target.files[0] : null)}
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white"
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                            <div>
                                <Label htmlFor="edit_file" className="font-semibold text-gray-900 dark:text-white">
                                    Ganti Berkas Resmi (PDF / Gambar)
                                </Label>
                                {editingDoc?.file_url && (
                                    <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded p-2 my-2 flex items-center justify-between">
                                        <span>Berkas tersimpan saat ini: <strong>Tersedia di Local Storage</strong></span>
                                        <a href={editingDoc.file_url} target="_blank" rel="noopener noreferrer" className="underline font-semibold flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                            Lihat File <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                                <Input
                                    id="edit_file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white"
                                />
                                {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
                            </div>

                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <Label htmlFor="edit_external_url" className="text-gray-700 dark:text-gray-300">
                                    Tautan Eksternal Cadangan
                                </Label>
                                <Input
                                    id="edit_external_url"
                                    type="url"
                                    placeholder="https://..."
                                    value={data.external_url}
                                    onChange={(e) => setData('external_url', e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                                {errors.external_url && <p className="text-sm text-red-500">{errors.external_url}</p>}
                            </div>
                        </div>

                        {/* Keterangan Multi-Bahasa */}
                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <Label className="text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5 text-insani-blue" />
                                Keterangan Singkat / Catatan (Opsional)
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">ID (Indonesia)</span>
                                    <Textarea
                                        id="edit_description_id"
                                        rows={2}
                                        value={data.description.id}
                                        onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">EN (English)</span>
                                    <Textarea
                                        id="edit_description_en"
                                        rows={2}
                                        value={data.description.en}
                                        onChange={(e) => setData('description', { ...data.description, en: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">AR (العربية)</span>
                                    <Textarea
                                        id="edit_description_ar"
                                        dir="rtl"
                                        rows={2}
                                        value={data.description.ar}
                                        onChange={(e) => setData('description', { ...data.description, ar: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit_is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="edit_is_active" className="text-sm font-medium leading-none cursor-pointer text-gray-700 dark:text-gray-300">
                                Aktif (Tampilkan di halaman Tentang Kami)
                            </Label>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setIsEditModalOpen(false)}>
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
