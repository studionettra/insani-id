import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Plus, 
    Eye, 
    Edit, 
    Trash2, 
    Megaphone, 
    Search, 
    X, 
    RotateCcw, 
    Building2, 
    Users, 
    User, 
    Layers, 
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    FileText,
    Ban
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import DonationProgressBar from '@/components/donation/DonationProgressBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, getLocalizedValue } from '@/lib/utils';

interface Program {
    id: number;
    title: { id: string };
    program_code: string;
    cover_image: string;
    category: { title?: { id: string }; name?: { id: string } };
    campaigner_type: 'internal' | 'lembaga' | 'individu' | string;
    campaigner_profile?: {
        id: number;
        nama_lembaga?: string;
        institution_name?: string;
        type: string;
    };
    creator: { name: string; email?: string };
    created_by?: number;
    target_amount?: string | null;
    collected_amount: number;
    views_count?: number;
    status: string;
    published_at: string | null;
}

interface CategoryOption {
    id: number;
    name: { id: string; en?: string } | string;
}

interface Props {
    programs: {
        data: Program[];
        current_page: number;
        last_page: number;
        links: any[];
        total: number;
    };
    filters: {
        type: string;
        status: string;
        search?: string | null;
        category_id?: string | null;
    };
    counts: {
        all: number;
        internal: number;
        lembaga: number;
        individu: number;
        pending_verification: number;
        pending_in_tab: number;
    };
    categories: CategoryOption[];
}

export default function ProgramsIndex({ programs, filters, counts, categories }: Props) {
    const { auth } = usePage().props as any;

    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [programToDelete, setProgramToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const isFirstRender = useRef(true);

    // Apply filters helper
    const applyFilters = (newFilters: {
        type?: string;
        status?: string;
        search?: string | null;
        category_id?: string | null;
    }) => {
        const updated = {
            type: newFilters.type !== undefined ? newFilters.type : (filters.type || 'semua'),
            status: newFilters.status !== undefined ? newFilters.status : (filters.status || 'semua'),
            search: newFilters.search !== undefined ? newFilters.search : (filters.search || ''),
            category_id: newFilters.category_id !== undefined ? newFilters.category_id : (filters.category_id || ''),
        };

        const query: Record<string, string> = {};
        if (updated.type && updated.type !== 'semua') query.type = updated.type;
        if (updated.status && updated.status !== 'semua') query.status = updated.status;
        if (updated.search && updated.search.trim()) query.search = updated.search.trim();
        if (updated.category_id) query.category_id = String(updated.category_id);

        router.get('/admin/programs', query, { preserveState: true, replace: true });
    };

    // Debounce search input
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || '')) {
                applyFilters({ search: searchInput });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleTypeChange = (type: string) => {
        applyFilters({ type, status: 'semua' });
    };

    const handleStatusChange = (status: string) => {
        applyFilters({ status });
    };

    const handleCategoryChange = (categoryId: string) => {
        applyFilters({ category_id: categoryId || null });
    };

    const handleResetFilters = () => {
        setSearchInput('');
        router.get('/admin/programs', {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = 
        (filters.type && filters.type !== 'semua') ||
        (filters.status && filters.status !== 'semua') ||
        Boolean(filters.search) ||
        Boolean(filters.category_id);

    const handleConfirmDelete = () => {
        if (!programToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/programs/${programToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setProgramToDelete(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 border-0 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Aktif
                    </Badge>
                );
            case 'pending_verification':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 border-0 font-medium inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" /> Menunggu Verifikasi
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 border-0 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Selesai
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-inset ring-red-600/10 border-0 font-medium inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" /> Ditolak
                    </Badge>
                );
            case 'draft':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ring-1 ring-inset ring-gray-600/20 border-0 font-medium inline-flex items-center gap-1">
                        <FileText className="w-3 h-3 text-gray-500" /> Draft
                    </Badge>
                );
            case 'closed_manual':
                return (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20 border-0 font-medium inline-flex items-center gap-1">
                        <Ban className="w-3 h-3 text-orange-600 dark:text-orange-400" /> Ditutup Manual
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="font-medium">{status}</Badge>;
        }
    };

    const getCampaignerBadge = (program: Program) => {
        if (program.campaigner_type === 'internal') {
            return (
                <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        Internal Yayasan
                    </span>
                    <div className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[170px]" title={program.creator?.name || 'Staf Internal'}>
                        {program.creator?.name || 'Staf Internal'}
                    </div>
                </div>
            );
        }

        if (program.campaigner_type === 'lembaga') {
            const orgName = program.campaigner_profile?.nama_lembaga || program.campaigner_profile?.institution_name || program.creator?.name;
            return (
                <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        Mitra Lembaga
                    </span>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[170px]" title={orgName}>
                        {orgName}
                    </div>
                    {program.creator?.name && program.creator.name !== orgName && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[170px]">
                            PIC: {program.creator.name}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    Individu
                </span>
                <div className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[170px]" title={program.creator?.name}>
                    {program.creator?.name || 'Campaigner'}
                </div>
            </div>
        );
    };

    const typeTabs = [
        { id: 'semua', label: 'Semua Program', count: counts.all, icon: Layers },
        { id: 'internal', label: 'Internal Yayasan', count: counts.internal, icon: Building2, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'lembaga', label: 'Mitra Lembaga', count: counts.lembaga, icon: Users, color: 'text-purple-600 dark:text-purple-400' },
        { id: 'individu', label: 'Campaigner Individu', count: counts.individu, icon: User, color: 'text-amber-600 dark:text-amber-400' },
    ];

    const statusOptions = [
        { id: 'semua', label: 'Semua Status' },
        { id: 'pending_verification', label: 'Menunggu Verifikasi', highlight: (counts.pending_in_tab || 0) > 0, count: counts.pending_in_tab },
        { id: 'published', label: 'Aktif' },
        { id: 'completed', label: 'Selesai' },
        { id: 'rejected', label: 'Ditolak' },
        { id: 'draft', label: 'Draft' },
        { id: 'closed_manual', label: 'Ditutup Manual' },
    ];

    return (
        <>
            <Head title="Manajemen Program" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Manajemen Program</h1>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {programs.total} Total
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola program resmi yayasan dan kampanye galang dana dari mitra lembaga maupun individu.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild className="bg-[#1A56DB] hover:bg-[#1e40af] text-white shadow-sm">
                            <Link href="/admin/programs/create">
                                <Plus className="mr-2 h-4 w-4" /> Buat Program Internal
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Level 1: Tabs Segmentasi Tipe Campaigner */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                    <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-px">
                        {typeTabs.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = (filters.type || 'semua') === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTypeChange(tab.id)}
                                    className={`group flex items-center gap-2.5 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                                        isActive
                                            ? 'border-[#1A56DB] text-[#1A56DB] dark:border-blue-500 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20 rounded-t-lg'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#1A56DB] dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    <span>{tab.label}</span>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                            isActive
                                                ? 'bg-[#1A56DB] text-white'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Level 2: Filter Toolbar (Search, Category, Status, Reset) */}
                <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari judul, kode PRG, nama pembuat / lembaga..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9 pr-8 h-9.5 text-sm bg-gray-50/50 dark:bg-gray-800/50"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    title="Hapus pencarian"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown & Reset */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative min-w-[180px]">
                                <select
                                    value={filters.category_id || ''}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full h-9.5 pl-3 pr-8 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#1A56DB]/20 focus:border-[#1A56DB]"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {typeof cat.name === 'object' ? getLocalizedValue(cat.name) : cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="h-9.5 text-xs text-gray-600 hover:text-gray-900 border-dashed"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Filter
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Status Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pt-1 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                            <Filter className="w-3 h-3" /> Status:
                        </span>
                        {statusOptions.map((opt) => {
                            const isSelected = (filters.status || 'semua') === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleStatusChange(opt.id)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold shadow-xs'
                                            : opt.highlight
                                                ? 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/80 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {opt.highlight && opt.count !== undefined && opt.count > 0 && (
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-500 text-white'}`}>
                                            {opt.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table Data */}
                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto shadow-xs">
                    <Table>
                        <TableHeader className="bg-gray-50/75 dark:bg-gray-800/60">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 min-w-[220px]">Kode / Judul</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 w-28">Cover</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kategori</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 min-w-[170px]">Pembuat / Mitra</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 min-w-[190px]">Donasi Terkumpul</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">Dilihat</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {programs.data.length > 0 ? (
                                programs.data.map((program) => (
                                    <TableRow key={program.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                                        <TableCell>
                                            <div className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                                                {getLocalizedValue(program.title)}
                                            </div>
                                            <div className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {program.program_code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <img
                                                src={`/storage/${program.cover_image}`}
                                                alt={getLocalizedValue(program.title)}
                                                className="h-16 w-24 rounded-md object-cover border border-gray-200 dark:border-gray-700 shadow-2xs"
                                                onError={(e) => {
                                                    // Fallback image
                                                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                {getLocalizedValue(program.category?.name, 'N/A')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {getCampaignerBadge(program)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-baseline justify-between gap-1">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                        {formatCurrency(program.collected_amount)}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    Target: {program.target_amount && parseFloat(program.target_amount) > 0 ? formatCurrency(parseFloat(program.target_amount)) : 'Tanpa Target'}
                                                </div>
                                                <DonationProgressBar
                                                    collectedAmount={program.collected_amount}
                                                    targetAmount={program.target_amount}
                                                    size="xs"
                                                    percentagePlacement="top-right"
                                                    percentageFormat="badge"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                {(program.views_count || 0).toLocaleString('id-ID')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(program.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                {auth?.user?.id && Number(program.created_by) === Number(auth.user.id) && (
                                                    <Button variant="ghost" size="icon" asChild title="Kelola Kabar Program" className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/50">
                                                        <Link href={`/admin/programs/${program.id}/updates`}>
                                                            <Megaphone className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" asChild title="Lihat Detail Program" className="h-8 w-8 text-[#1A56DB] hover:bg-blue-50 hover:text-[#1e40af] dark:text-blue-400 dark:hover:bg-blue-950/50">
                                                    <Link href={`/admin/programs/${program.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild title="Edit Program" className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                                                    <Link href={`/admin/programs/${program.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Hapus Program" onClick={() => setProgramToDelete(program)} className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/50 dark:hover:text-red-400">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-gray-500 dark:text-gray-400">
                                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 text-gray-400">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">Tidak ada program yang sesuai</p>
                                            <p className="text-xs mt-1 text-gray-500">
                                                {hasActiveFilters 
                                                    ? 'Coba ubah kata kunci pencarian atau sesuaikan opsi filter status dan kategori.'
                                                    : 'Belum ada data program yang terdaftar untuk kategori ini.'}
                                            </p>
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleResetFilters}
                                                    className="mt-4 text-xs"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Semua Filter
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {programs.last_page > 1 && (
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Menampilkan halaman <span className="font-semibold">{programs.current_page}</span> dari <span className="font-semibold">{programs.last_page}</span>
                        </div>
                        <div className="flex space-x-1">
                            {programs.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-[#1A56DB] text-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800'
                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!programToDelete}
                onOpenChange={(open) => !open && setProgramToDelete(null)}
                title="Hapus Program Donasi"
                description={`Apakah Anda yakin ingin menghapus program "${programToDelete ? getLocalizedValue(programToDelete.title) : ''}"? Seluruh data terkait program ini akan dihapus.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

ProgramsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Program',
            href: '/admin/programs',
        },
    ],
};
