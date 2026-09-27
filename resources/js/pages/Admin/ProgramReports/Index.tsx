import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ShieldAlert,
    AlertTriangle,
    Search,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    MessageCircle,
    User,
    FileText,
    Image as ImageIcon,
    Loader2,
    Calendar,
    Phone,
    Mail,
    Ban,
    Settings,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
import { formatCurrency, getLocalizedValue } from '@/lib/utils';

interface ReportItem {
    id: number;
    ticket_number: string;
    program_id: number;
    program?: {
        id: number;
        title: any;
        slug: string;
        status: string;
        cover_image?: string | null;
        target_amount: number;
        collected_amount: number;
    };
    category_id: number;
    category?: {
        id: number;
        name: any;
        slug: string;
    };
    reporter_name: string;
    reporter_phone: string;
    reporter_email: string;
    description: string;
    evidence_files?: Array<{
        path: string;
        original_name: string;
        mime_type: string;
        size: number;
    }> | null;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    admin_notes?: string | null;
    reviewed_by?: number | null;
    reviewer?: {
        id: number;
        name: string;
    } | null;
    reviewed_at?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
}

interface Props {
    reports: {
        data: ReportItem[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters?: {
        search?: string;
        status?: string;
        category_id?: string;
    };
    statusCounts: {
        total: number;
        pending: number;
        investigating: number;
        resolved: number;
        dismissed: number;
    };
    highRiskPrograms?: Array<{
        program_id: number;
        active_reports_count: number;
        program?: {
            id: number;
            title: any;
            slug: string;
            status: string;
        };
    }>;
    categories: Array<{
        id: number;
        name: any;
        slug: string;
    }>;
}

const getLocalizedText = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.id || value.en || value.ar || Object.values(value).find((v) => typeof v === 'string') || '';
    }
    return String(value);
};

export default function ProgramReportsIndex({
    reports,
    filters = {},
    statusCounts,
    highRiskPrograms = [],
    categories = [],
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || 'all');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isTakedownModalOpen, setIsTakedownModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data: statusData, setData: setStatusData, put: putStatus, processing: statusProcessing } = useForm({
        status: 'pending' as 'pending' | 'investigating' | 'resolved' | 'dismissed',
        admin_notes: '',
    });

    const { data: takedownData, setData: setTakedownData, post: postTakedown, processing: takedownProcessing } = useForm({
        reason: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/program-reports',
            {
                search: search || undefined,
                status: activeStatus !== 'all' ? activeStatus : undefined,
                category_id: selectedCategory || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusFilter = (st: string) => {
        setActiveStatus(st);
        router.get(
            '/admin/program-reports',
            {
                search: search || undefined,
                status: st !== 'all' ? st : undefined,
                category_id: selectedCategory || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryFilter = (catId: string) => {
        setSelectedCategory(catId);
        router.get(
            '/admin/program-reports',
            {
                search: search || undefined,
                status: activeStatus !== 'all' ? activeStatus : undefined,
                category_id: catId || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openDetailModal = (report: ReportItem) => {
        setSelectedReport(report);
        setStatusData({
            status: report.status,
            admin_notes: report.admin_notes || '',
        });
        setIsDetailModalOpen(true);
    };

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport) return;

        putStatus(`/admin/program-reports/${selectedReport.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status investigasi laporan berhasil diperbarui.');
                setIsDetailModalOpen(false);
            },
        });
    };

    const handleTakedownSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport) return;

        if (!takedownData.reason.trim()) {
            toast.error('Silakan isi alasan penutupan program.');
            return;
        }

        postTakedown(`/admin/program-reports/${selectedReport.id}/takedown`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Program berhasil ditutup dan laporan diselesaikan.');
                setIsTakedownModalOpen(false);
                setIsDetailModalOpen(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-semibold text-xs">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Menunggu Review
                    </Badge>
                );
            case 'investigating':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-semibold text-xs">
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                        Sedang Diperiksa
                    </Badge>
                );
            case 'resolved':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Terbukti / Selesai
                    </Badge>
                );
            case 'dismissed':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 gap-1 font-semibold text-xs">
                        <XCircle className="w-3 h-3 text-gray-400" />
                        Ditolak / Gugur
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatWaNumber = (phone: string): string => {
        let clean = phone.replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) {
            clean = '62' + clean.slice(1);
        }
        return clean;
    };

    return (
        <div className="space-y-6">
            <Head title="Laporan Pelanggaran Program - Admin Insani" />

            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Laporan Pelanggaran Program
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Pusat penerimaan dan moderasi aduan kecurangan galang dana dari masyarakat.
                    </p>
                </div>
                <Link href="/admin/program-report-categories">
                    <Button variant="outline" className="rounded-xl gap-2 self-start sm:self-auto text-xs font-semibold">
                        <Settings className="w-4 h-4 text-gray-500" />
                        Kelola Kategori Laporan
                    </Button>
                </Link>
            </div>

            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Menunggu Review</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600 mt-2">{statusCounts.pending}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Aduan baru belum ditangani</span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Dalam Investigasi</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{statusCounts.investigating}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Sedang diverifikasi tim</span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Selesai / Tindak Lanjut</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">{statusCounts.resolved}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Pelanggaran telah ditindak</span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Ditolak / Laporan Gugur</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600 mt-2">{statusCounts.dismissed}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Tidak terbukti / Hoax</span>
                </div>
            </div>

            {/* High Risk Alert Banner */}
            {highRiskPrograms.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>Peringatan Risiko Tinggi: Program Menerima Multiple Laporan</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                        Terdapat {highRiskPrograms.length} program yang dilaporkan lebih dari 1 kali oleh donatur/masyarakat berbeda. Mohon prioritaskan peninjauan program berikut:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {highRiskPrograms.map((hr) => (
                            <span
                                key={hr.program_id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-rose-300 text-xs font-semibold text-rose-700"
                            >
                                <span className="font-bold">⚠️ {hr.active_reports_count} Aduan:</span>{' '}
                                <span className="max-w-[200px] truncate">{getLocalizedText(hr.program?.title)}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari tiket, program, pelapor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-gray-50/50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    />
                </form>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                        {(['all', 'pending', 'investigating', 'resolved', 'dismissed'] as const).map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusFilter(st)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    activeStatus === st
                                        ? 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-xs'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {st === 'all'
                                    ? `Semua (${statusCounts.total})`
                                    : st === 'pending'
                                    ? `Baru (${statusCounts.pending})`
                                    : st === 'investigating'
                                    ? 'Diperiksa'
                                    : st === 'resolved'
                                    ? 'Selesai'
                                    : 'Ditolak'}
                            </button>
                        ))}
                    </div>

                    {/* Category Dropdown */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-hidden"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {getLocalizedText(c.name)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reports Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/70 dark:bg-gray-800/60">
                        <TableRow>
                            <TableHead className="font-bold">Tiket & Waktu</TableHead>
                            <TableHead className="font-bold">Program Terlapor</TableHead>
                            <TableHead className="font-bold">Kategori Pelanggaran</TableHead>
                            <TableHead className="font-bold">Pelapor</TableHead>
                            <TableHead className="text-center font-bold">Bukti</TableHead>
                            <TableHead className="text-center font-bold">Status Aduan</TableHead>
                            <TableHead className="text-right font-bold pr-6">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-44 text-center text-gray-500">
                                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Tidak ada laporan aduan.</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Semua laporan telah ditinjau atau tidak ditemukan sesuai filter.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.data.map((report) => (
                                <TableRow key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                    <TableCell>
                                        <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                                            #{report.ticket_number}
                                        </div>
                                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="flex items-center gap-3">
                                            {report.program?.cover_image ? (
                                                <img
                                                    src={`/storage/${report.program.cover_image}`}
                                                    alt="Cover"
                                                    className="w-12 h-9 object-cover rounded-lg shrink-0 border border-gray-100"
                                                />
                                            ) : (
                                                <div className="w-12 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                                                    <ShieldAlert className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <a
                                                    href={`/program/${report.program?.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-xs text-slate-800 dark:text-white hover:text-[#1A56DB] line-clamp-1 flex items-center gap-1"
                                                >
                                                    {getLocalizedText(report.program?.title) || 'Program Terhapus'}
                                                    <ExternalLink className="w-3 h-3 shrink-0 text-gray-400" />
                                                </a>
                                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                                    Status: {report.program?.status}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                            {getLocalizedText(report.category?.name)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                            {report.reporter_name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <a
                                                href={`https://wa.me/${formatWaNumber(report.reporter_phone)}?text=Halo%20${encodeURIComponent(report.reporter_name)},%20kami%20dari%20tim%20Insani%20Indonesia%20terkait%20laporan%20tiket%20${report.ticket_number}...`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                WA
                                            </a>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-[11px] text-gray-500 truncate max-w-[120px]">
                                                {report.reporter_email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {report.evidence_files && report.evidence_files.length > 0 ? (
                                            <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                                                {report.evidence_files.length} File
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-gray-400">Tidak ada</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{getStatusBadge(report.status)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openDetailModal(report)}
                                            className="rounded-xl text-xs gap-1.5 font-semibold text-slate-700 hover:text-[#1A56DB] hover:border-[#1A56DB]"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Periksa Laporan
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Detail Report & Investigation Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between gap-4">
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                                Tiket #{selectedReport?.ticket_number}
                            </DialogTitle>
                            {selectedReport && getStatusBadge(selectedReport.status)}
                        </div>
                        <DialogDescription className="text-xs text-gray-500">
                            Diterima pada {selectedReport && new Date(selectedReport.created_at).toLocaleString('id-ID')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-5 pt-2">
                            {/* Program Terlapor Card */}
                            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                        Program Yang Dilaporkan
                                    </span>
                                    <h4 className="font-bold text-sm text-slate-800 truncate mt-0.5">
                                        {getLocalizedText(selectedReport.program?.title)}
                                    </h4>
                                    <span className="text-xs text-slate-500 block">
                                        Terkumpul: {formatCurrency(selectedReport.program?.collected_amount || 0)} / Target: {formatCurrency(selectedReport.program?.target_amount || 0)}
                                    </span>
                                </div>
                                <a
                                    href={`/program/${selectedReport.program?.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-slate-700 hover:text-[#1A56DB] shrink-0"
                                >
                                    Lihat Program <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            {/* Info Pelapor */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs">
                                <div>
                                    <span className="text-gray-400 block">Nama Pelapor:</span>
                                    <span className="font-bold text-slate-800">{selectedReport.reporter_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Kontak WA:</span>
                                    <a
                                        href={`https://wa.me/${formatWaNumber(selectedReport.reporter_phone)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-emerald-600 hover:underline"
                                    >
                                        {selectedReport.reporter_phone}
                                    </a>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Email:</span>
                                    <span className="font-semibold text-slate-700">{selectedReport.reporter_email}</span>
                                </div>
                            </div>

                            {/* Uraian Aduan */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                    Kategori: {getLocalizedText(selectedReport.category?.name)}
                                </Label>
                                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50/30">
                                    &ldquo;{selectedReport.description}&rdquo;
                                </div>
                            </div>

                            {/* Lampiran Bukti */}
                            {selectedReport.evidence_files && selectedReport.evidence_files.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                        Bukti Dokumen / Foto ({selectedReport.evidence_files.length} File)
                                    </Label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {selectedReport.evidence_files.map((file, idx) => {
                                            const isImage = file.mime_type.startsWith('image/');
                                            const fileUrl = `/storage/${file.path}`;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative group flex items-center justify-center"
                                                >
                                                    {isImage ? (
                                                        <img
                                                            src={fileUrl}
                                                            alt={file.original_name}
                                                            onClick={() => setPreviewImage(fileUrl)}
                                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-center flex flex-col items-center justify-center text-slate-600 hover:text-blue-600"
                                                        >
                                                            <FileText className="w-8 h-8 text-slate-400 mb-1" />
                                                            <span className="text-[10px] truncate max-w-[80px]">
                                                                {file.original_name}
                                                            </span>
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Form Status & Catatan Moderasi */}
                            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-3 border-t border-gray-100">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Ubah Status Investigasi Laporan</Label>
                                    <select
                                        value={statusData.status}
                                        onChange={(e: any) => setStatusData('status', e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-hidden"
                                    >
                                        <option value="pending">Menunggu Review (Pending)</option>
                                        <option value="investigating">Sedang Diperiksa (Investigating)</option>
                                        <option value="resolved">Terbukti Melanggar / Selesai (Resolved)</option>
                                        <option value="dismissed">Ditolak / Laporan Gugur (Dismissed)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Catatan Investigasi Internal Admin</Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Tuliskan catatan tindak lanjut, hasil verifikasi bukti, atau instruksi ke tim keuangan..."
                                        value={statusData.admin_notes}
                                        onChange={(e) => setStatusData('admin_notes', e.target.value)}
                                        className="rounded-xl text-xs"
                                    />
                                    {selectedReport.reviewer && (
                                        <p className="text-[11px] text-gray-400">
                                            Terakhir diperbarui oleh {selectedReport.reviewer.name} pada{' '}
                                            {selectedReport.reviewed_at && new Date(selectedReport.reviewed_at).toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                    {selectedReport.program?.status !== 'closed_manual' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsTakedownModalOpen(true)}
                                            className="w-full sm:w-auto border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs gap-1.5"
                                        >
                                            <Ban className="w-3.5 h-3.5" />
                                            Tutup / Takedown Program
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDetailModalOpen(false)}
                                            className="rounded-xl text-xs"
                                        >
                                            Tutup
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={statusProcessing}
                                            className="bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs"
                                        >
                                            {statusProcessing ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Simpan Status'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Takedown Emergency Action Modal */}
            <Dialog open={isTakedownModalOpen} onOpenChange={setIsTakedownModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
                            <Ban className="w-5 h-5" />
                            Konfirmasi Penutupan Program
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Tindakan ini akan mengubah status program menjadi ditutup (closed_manual) dan menghentikan seluruh transaksi donasi yang sedang berjalan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleTakedownSubmit} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Alasan Penutupan Program</Label>
                            <Textarea
                                rows={3}
                                required
                                placeholder="Contoh: Terbukti melakukan manipulasi data kuitansi medis sesuai tiket aduan..."
                                value={takedownData.reason}
                                onChange={(e) => setTakedownData('reason', e.target.value)}
                                className="rounded-xl text-xs"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsTakedownModalOpen(false)}
                                className="rounded-xl text-xs"
                            >
                                Batalkan
                            </Button>
                            <Button
                                type="submit"
                                disabled={takedownProcessing}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs"
                            >
                                {takedownProcessing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Ya, Tutup Program'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-3xl p-2 bg-transparent border-0 shadow-none">
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Bukti Preview"
                            className="max-h-[85vh] w-auto mx-auto rounded-2xl shadow-2xl object-contain bg-black/80"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

ProgramReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan Pelanggaran Program',
            href: '/admin/program-reports',
        },
    ],
};
