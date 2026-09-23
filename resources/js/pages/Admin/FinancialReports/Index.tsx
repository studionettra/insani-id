import { Head, useForm, router } from '@inertiajs/react';
import { 
    Trash2, 
    Edit, 
    Plus, 
    Search, 
    FileText, 
    ExternalLink, 
    Download, 
    Eye, 
    CheckCircle2, 
    XCircle, 
    ShieldCheck, 
    Calendar,
    Wallet,
    TrendingUp,
    Users,
    FileSpreadsheet,
    Building2,
    Sparkles
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const CATEGORY_OPTIONS = [
    { value: 'annual_report', label: 'Laporan Tahunan' },
    { value: 'audited_financial', label: 'Laporan Keuangan Audited' },
    { value: 'impact_report', label: 'Laporan Penyaluran & Dampak' },
    { value: 'interim', label: 'Laporan Triwulan / Semester' },
];

export default function FinancialReportsIndex({ reports, availableYears = [], filters = {} }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<any>(null);
    const [reportToDelete, setReportToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState<'id' | 'en'>('id');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        title: { id: '', en: '' },
        report_year: new Date().getFullYear(),
        category: 'annual_report',
        audit_status: 'WTP (Wajar Tanpa Pengecualian)',
        auditor_name: '',
        file: null as File | null,
        cover_file: null as File | null,
        external_url: '',
        summary: { id: '', en: '' },
        total_revenue: '' as string | number,
        total_disbursement: '' as string | number,
        beneficiaries_count: '' as string | number,
        is_active: true,
        sort_order: 0,
    });

    const handleFilter = (params: { search?: string; year?: string; category?: string }) => {
        router.get(
            '/admin/financial-reports',
            {
                search: params.search !== undefined ? params.search : search,
                year: params.year !== undefined ? params.year : selectedYear,
                category: params.category !== undefined ? params.category : selectedCategory,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter({ search });
    };

    const openCreateModal = () => {
        reset();
        setData({
            _method: 'post',
            title: { id: '', en: '' },
            report_year: new Date().getFullYear(),
            category: 'annual_report',
            audit_status: 'WTP (Wajar Tanpa Pengecualian)',
            auditor_name: '',
            file: null,
            cover_file: null,
            external_url: '',
            summary: { id: '', en: '' },
            total_revenue: '',
            total_disbursement: '',
            beneficiaries_count: '',
            is_active: true,
            sort_order: (reports.data?.length || 0) + 1,
        });
        clearErrors();
        setActiveLangTab('id');
        setIsCreateModalOpen(true);
    };

    const openEditModal = (report: any) => {
        setEditingReport(report);
        setData({
            _method: 'put',
            title: { 
                id: report.title_translations?.id || report.title?.id || report.title || '', 
                en: report.title_translations?.en || report.title?.en || '' 
            },
            report_year: report.report_year || new Date().getFullYear(),
            category: report.category || 'annual_report',
            audit_status: report.audit_status || '',
            auditor_name: report.auditor_name || '',
            file: null,
            cover_file: null,
            external_url: report.external_url || '',
            summary: { 
                id: report.summary_translations?.id || report.summary?.id || report.summary || '', 
                en: report.summary_translations?.en || report.summary?.en || '' 
            },
            total_revenue: report.total_revenue ?? '',
            total_disbursement: report.total_disbursement ?? '',
            beneficiaries_count: report.beneficiaries_count ?? '',
            is_active: !!report.is_active,
            sort_order: report.sort_order ?? 0,
        });
        clearErrors();
        setActiveLangTab('id');
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/financial-reports', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReport) return;

        post(`/admin/financial-reports/${editingReport.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!reportToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/financial-reports/${reportToDelete.id}`, {
            onSuccess: () => {
                setReportToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'annual_report':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Annual Report</span>;
            case 'audited_financial':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Audited Financial</span>;
            case 'impact_report':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Impact Report</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{cat}</span>;
        }
    };

    return (
        <>
            <Head title="Manajemen Laporan Keuangan & Annual Report" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-insani-blue/10 text-insani-blue">
                                <FileSpreadsheet className="w-6 h-6" />
                            </span>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    Laporan Keuangan & Annual Report
                                </h1>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Kelola arsip laporan tahunan, laporan keuangan audited, dan transparansi publik yayasan.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={openCreateModal}
                            className="bg-insani-blue hover:bg-insani-blue/90 text-white rounded-xl shadow-sm gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Laporan
                        </Button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96 flex">
                        <Input
                            type="text"
                            placeholder="Cari judul, auditor, status audit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 rounded-xl text-sm w-full bg-slate-50 border-slate-200 focus:bg-white"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Year Filter */}
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                handleFilter({ year: e.target.value });
                            }}
                            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-insani-blue/20"
                        >
                            <option value="">Semua Tahun</option>
                            {availableYears.map((yr: number) => (
                                <option key={yr} value={yr}>{yr}</option>
                            ))}
                        </select>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                handleFilter({ category: e.target.value });
                            }}
                            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-insani-blue/20"
                        >
                            <option value="">Semua Kategori</option>
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80">
                                <TableHead className="w-16 text-center">Sampul</TableHead>
                                <TableHead>Tahun & Kategori</TableHead>
                                <TableHead>Judul Laporan</TableHead>
                                <TableHead>Opini & Auditor</TableHead>
                                <TableHead>Penerimaan / Penyaluran</TableHead>
                                <TableHead>Berkas / Info</TableHead>
                                <TableHead className="text-center">Unduhan</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-48 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                                            <p className="font-medium text-slate-600">Belum ada laporan keuangan.</p>
                                            <p className="text-xs text-slate-400">Klik tombol "Tambah Laporan" untuk mengunggah dokumen baru.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.data.map((report: any) => {
                                    const title = report.title_translations?.id || report.title?.id || report.title;
                                    const titleEn = report.title_translations?.en || report.title?.en;

                                    return (
                                        <TableRow key={report.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Sampul */}
                                            <TableCell className="text-center">
                                                {report.cover_url ? (
                                                    <img 
                                                        src={report.cover_url} 
                                                        alt={title} 
                                                        className="w-10 h-14 object-cover rounded shadow-sm border border-slate-200 mx-auto"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-14 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 rounded flex flex-col items-center justify-center mx-auto text-slate-400">
                                                        <FileText className="w-5 h-5 text-insani-blue/60" />
                                                        <span className="text-[8px] font-bold mt-0.5">{report.report_year}</span>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Tahun & Kategori */}
                                            <TableCell>
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {report.report_year}
                                                </div>
                                                <div className="mt-1">
                                                    {getCategoryBadge(report.category)}
                                                </div>
                                            </TableCell>

                                            {/* Judul Laporan */}
                                            <TableCell className="max-w-xs">
                                                <div className="font-semibold text-slate-900 line-clamp-2" title={title}>
                                                    {title}
                                                </div>
                                                {titleEn && (
                                                    <div className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">
                                                        {titleEn}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Opini & Auditor */}
                                            <TableCell>
                                                {report.audit_status ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                        {report.audit_status}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                                {report.auditor_name && (
                                                    <div className="text-xs text-slate-500 font-medium mt-1">
                                                        {report.auditor_name}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Finansial */}
                                            <TableCell className="text-xs">
                                                {report.formatted_revenue ? (
                                                    <div className="text-slate-700">
                                                        <span className="text-slate-400">Masuk:</span> {report.formatted_revenue}
                                                    </div>
                                                ) : null}
                                                {report.formatted_disbursement ? (
                                                    <div className="text-emerald-700 font-medium mt-0.5">
                                                        <span className="text-slate-400">Salur:</span> {report.formatted_disbursement}
                                                    </div>
                                                ) : null}
                                                {!report.formatted_revenue && !report.formatted_disbursement && (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </TableCell>

                                            {/* Berkas / Info */}
                                            <TableCell>
                                                {report.file_url ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-insani-blue font-medium">
                                                        <FileText className="w-3.5 h-3.5 text-red-500" />
                                                        <span>PDF</span>
                                                        {report.formatted_file_size && (
                                                            <span className="text-slate-400 font-normal">({report.formatted_file_size})</span>
                                                        )}
                                                    </div>
                                                ) : report.external_url ? (
                                                    <a 
                                                        href={report.external_url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:underline"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        Link Cloud
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Tidak ada berkas</span>
                                                )}
                                            </TableCell>

                                            {/* Unduhan */}
                                            <TableCell className="text-center font-mono text-xs text-slate-600">
                                                {report.download_count || 0}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                {report.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                                        <XCircle className="w-3 h-3 text-slate-400" />
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Aksi */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {report.view_url && (
                                                        <a
                                                            href={report.view_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 text-slate-500 hover:text-insani-blue hover:bg-slate-100 rounded-lg transition-colors"
                                                            title="Pratinjau Laporan"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => openEditModal(report)}
                                                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Ubah Laporan"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setReportToDelete(report)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Hapus Laporan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {reports.links && reports.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                        <div className="text-sm text-slate-500">
                            Menampilkan {reports.from || 0} sampai {reports.to || 0} dari {reports.total || 0} laporan
                        </div>
                        <div className="flex items-center gap-1">
                            {reports.links.map((link: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url || link.active}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                        link.active 
                                            ? 'bg-insani-blue text-white font-medium' 
                                            : !link.url 
                                                ? 'text-slate-300 cursor-not-allowed' 
                                                : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah / Edit */}
            <Dialog 
                open={isCreateModalOpen || isEditModalOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateModalOpen(false);
                        setIsEditModalOpen(false);
                    }
                }}
            >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            {isCreateModalOpen ? 'Tambah Laporan Keuangan Baru' : 'Perbarui Laporan Keuangan'}
                        </DialogTitle>
                        <DialogDescription>
                            Isi detail informasi dokumen tahunan dan berkas laporan pertanggungjawaban publik.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={isCreateModalOpen ? submitCreate : submitEdit} className="space-y-5 pt-2">
                        {/* Tab Bahasa */}
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Bahasa:</span>
                            <button
                                type="button"
                                onClick={() => setActiveLangTab('id')}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                    activeLangTab === 'id' 
                                        ? 'bg-insani-blue text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Bahasa Indonesia 🇮🇩
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveLangTab('en')}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                    activeLangTab === 'en' 
                                        ? 'bg-insani-blue text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                English 🇬🇧
                            </button>
                        </div>

                        {/* Judul Laporan */}
                        {activeLangTab === 'id' ? (
                            <div>
                                <Label htmlFor="title_id">Judul Laporan (ID) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title_id"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    placeholder="Contoh: Laporan Tahunan & Akuntabilitas Yayasan 2024"
                                    className="mt-1.5"
                                />
                                {errors['title.id'] && <p className="text-xs text-red-500 mt-1">{errors['title.id']}</p>}
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="title_en">Judul Laporan (EN)</Label>
                                <Input
                                    id="title_en"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                    placeholder="e.g. Annual & Accountability Report 2024"
                                    className="mt-1.5"
                                />
                            </div>
                        )}

                        {/* Grid Baris: Tahun, Kategori, Status Audit */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="report_year">Tahun Buku <span className="text-red-500">*</span></Label>
                                <Input
                                    id="report_year"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={data.report_year}
                                    onChange={(e) => setData('report_year', parseInt(e.target.value) || new Date().getFullYear())}
                                    className="mt-1.5"
                                />
                                {errors.report_year && <p className="text-xs text-red-500 mt-1">{errors.report_year}</p>}
                            </div>

                            <div>
                                <Label htmlFor="category">Kategori Laporan <span className="text-red-500">*</span></Label>
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-insani-blue/20"
                                >
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="audit_status">Status Opini Audit</Label>
                                <Input
                                    id="audit_status"
                                    value={data.audit_status}
                                    onChange={(e) => setData('audit_status', e.target.value)}
                                    placeholder="e.g. WTP / Proses Audit"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        {/* Nama Auditor / KAP */}
                        <div>
                            <Label htmlFor="auditor_name">Nama Kantor Akuntan Publik (KAP / Auditor)</Label>
                            <Input
                                id="auditor_name"
                                value={data.auditor_name}
                                onChange={(e) => setData('auditor_name', e.target.value)}
                                placeholder="e.g. KAP Heliantono & Rekan (BDO / dsb)"
                                className="mt-1.5"
                            />
                        </div>

                        {/* Ringkasan Eksekutif */}
                        {activeLangTab === 'id' ? (
                            <div>
                                <Label htmlFor="summary_id">Ringkasan Laporan / Kata Pengantar (ID)</Label>
                                <Textarea
                                    id="summary_id"
                                    rows={3}
                                    value={data.summary.id}
                                    onChange={(e) => setData('summary', { ...data.summary, id: e.target.value })}
                                    placeholder="Tuliskan ringkasan singkat pencapaian atau kata pengantar pengurus..."
                                    className="mt-1.5"
                                />
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="summary_en">Executive Summary (EN)</Label>
                                <Textarea
                                    id="summary_en"
                                    rows={3}
                                    value={data.summary.en}
                                    onChange={(e) => setData('summary', { ...data.summary, en: e.target.value })}
                                    placeholder="Brief summary of achievements or executive foreword..."
                                    className="mt-1.5"
                                />
                            </div>
                        )}

                        {/* Sorotan Angka Finansial (Opsional) */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-insani-blue" />
                                Sorotan Angka Utama (Opsional untuk Ringkasan Cepat)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="total_revenue" className="text-xs">Total Penghimpunan (Rp)</Label>
                                    <Input
                                        id="total_revenue"
                                        type="number"
                                        min="0"
                                        value={data.total_revenue}
                                        onChange={(e) => setData('total_revenue', e.target.value)}
                                        placeholder="Contoh: 4850000000"
                                        className="mt-1 text-sm bg-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="total_disbursement" className="text-xs">Total Penyaluran (Rp)</Label>
                                    <Input
                                        id="total_disbursement"
                                        type="number"
                                        min="0"
                                        value={data.total_disbursement}
                                        onChange={(e) => setData('total_disbursement', e.target.value)}
                                        placeholder="Contoh: 4320000000"
                                        className="mt-1 text-sm bg-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="beneficiaries_count" className="text-xs">Penerima Manfaat (Jiwa)</Label>
                                    <Input
                                        id="beneficiaries_count"
                                        type="number"
                                        min="0"
                                        value={data.beneficiaries_count}
                                        onChange={(e) => setData('beneficiaries_count', e.target.value)}
                                        placeholder="Contoh: 38500"
                                        className="mt-1 text-sm bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upload Berkas PDF & Sampul */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Berkas PDF */}
                            <div>
                                <Label htmlFor="file">Berkas PDF Dokumen Laporan (Maks. 25MB)</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('file', e.target.files[0]);
                                        }
                                    }}
                                    className="mt-1.5"
                                />
                                {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
                                {isEditModalOpen && editingReport?.file_path && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Berkas saat ini: <a href={editingReport.file_url} target="_blank" rel="noreferrer" className="text-insani-blue underline">Lihat PDF</a>
                                    </p>
                                )}
                            </div>

                            {/* Cover Sampul Gambar */}
                            <div>
                                <Label htmlFor="cover_file">Gambar Sampul Buku (JPG, PNG, WebP)</Label>
                                <Input
                                    id="cover_file"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('cover_file', e.target.files[0]);
                                        }
                                    }}
                                    className="mt-1.5"
                                />
                                {errors.cover_file && <p className="text-xs text-red-500 mt-1">{errors.cover_file}</p>}
                                {isEditModalOpen && editingReport?.cover_url && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Sampul saat ini: <a href={editingReport.cover_url} target="_blank" rel="noreferrer" className="text-insani-blue underline">Lihat Sampul</a>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Link Eksternal Cadangan */}
                        <div>
                            <Label htmlFor="external_url">Tautan Eksternal Cadangan (Opsional: Google Drive / Cloud Link)</Label>
                            <Input
                                id="external_url"
                                value={data.external_url}
                                onChange={(e) => setData('external_url', e.target.value)}
                                placeholder="https://drive.google.com/file/d/..."
                                className="mt-1.5"
                            />
                        </div>

                        {/* Pengaturan Tambahan: Aktif & Urutan */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">
                                    Tampilkan laporan ke publik (Aktif)
                                </Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Label htmlFor="sort_order" className="text-xs text-slate-500">Urutan:</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="w-20 h-8 text-xs"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-100">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                }}
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-insani-blue hover:bg-insani-blue/90 text-white"
                            >
                                {processing ? 'Menyimpan...' : (isCreateModalOpen ? 'Simpan Laporan' : 'Perbarui Laporan')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Konfirmasi Hapus */}
            <ConfirmDialog
                open={!!reportToDelete}
                onOpenChange={(open) => !open && setReportToDelete(null)}
                title="Hapus Laporan Keuangan"
                description={`Apakah Anda yakin ingin menghapus laporan "${reportToDelete?.title_translations?.id || reportToDelete?.title?.id || reportToDelete?.title}"? Berkas fisik di storage juga akan dihapus secara permanen.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}

FinancialReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan Keuangan',
            href: '/admin/financial-reports',
        },
    ],
};
