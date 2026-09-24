import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, 
    CheckCircle, 
    AlertCircle, 
    Eye, 
    Clock, 
    XCircle, 
    Filter, 
    RotateCcw, 
    Wallet, 
    User, 
    MessageSquare, 
    Heart, 
    CreditCard, 
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as donationsIndex, confirm as donationsConfirm } from '@/routes/admin/donations';

interface PaymentInfo {
    id: number;
    payment_method: string;
    payment_channel?: string | null;
    payment_destination?: string | null;
    gateway: string;
    gateway_status: string;
    paid_amount?: string | number | null;
    paid_at?: string | null;
    confirmed_by?: number | null;
    confirmed_by_user?: {
        name: string;
    } | null;
}

interface DonationRecord {
    id: number;
    donation_code: string;
    program_id: number;
    donor_user_id?: number | null;
    donor_name: string;
    donor_email: string;
    donor_phone?: string | null;
    is_anonymous: boolean;
    message?: string | null;
    amount: string | number;
    unique_code?: number | null;
    channel: string;
    status: 'pending' | 'paid' | 'failed';
    paid_at?: string | null;
    created_at: string;
    utm_source?: string | null;
    utm_campaign?: string | null;
    program?: {
        id: number;
        title: any;
    } | null;
    donor?: {
        id: number;
        name: string;
        email: string;
    } | null;
    payments?: PaymentInfo[];
}

interface Props {
    donations: {
        data: DonationRecord[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        channel?: string;
        utm_source?: string;
        utm_campaign?: string;
    };
    counts?: {
        all: number;
        pending: number;
        pending_manual: number;
        paid: number;
        failed: number;
    };
}

const getProgramTitle = (title: any): string => {
    if (!title) {
        return 'Program Tanpa Judul';
    }
    if (typeof title === 'string') {
        return title;
    }
    if (typeof title === 'object' && title !== null) {
        if (typeof title.id === 'string' && title.id.trim() !== '') {
            return title.id;
        }
        const values = Object.values(title).filter(v => typeof v === 'string' && v.trim() !== '');
        if (values.length > 0) {
            return values[0] as string;
        }
    }
    return String(title || 'Program Tanpa Judul');
};

const formatCurrency = (val: number | string | null | undefined): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

export default function Index({ donations, filters = {}, counts }: Props) {
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmingDonation, setConfirmingDonation] = useState<DonationRecord | null>(null);
    const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);
    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedChannel, setSelectedChannel] = useState(filters.channel || 'all');

    const currentStatus = filters.status || 'all';

    const handleApplyFilters = (newParams: { status?: string; channel?: string; search?: string }) => {
        const query: Record<string, any> = {};

        const statusVal = newParams.status !== undefined ? newParams.status : currentStatus;
        if (statusVal && statusVal !== 'all') {
            query.status = statusVal;
        }

        const channelVal = newParams.channel !== undefined ? newParams.channel : selectedChannel;
        if (channelVal && channelVal !== 'all') {
            query.channel = channelVal;
        }

        const searchVal = newParams.search !== undefined ? newParams.search : searchTerm;
        if (searchVal && searchVal.trim() !== '') {
            query.search = searchVal.trim();
        }

        router.get(donationsIndex.url({ query }), undefined, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleTabChange = (status: string) => {
        handleApplyFilters({ status });
    };

    const handleChannelChange = (channel: string) => {
        setSelectedChannel(channel);
        handleApplyFilters({ channel });
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleApplyFilters({ search: searchTerm });
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedChannel('all');
        router.get(donationsIndex.url(), undefined, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const confirmManualDonation = (donation: DonationRecord) => {
        setConfirmingDonation(donation);
        setIsConfirmDialogOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (!confirmingDonation) {
            return;
        }

        setLoadingConfirm(true);

        try {
            await router.post(
                donationsConfirm.url({ donation: confirmingDonation.id }),
                {},
                {
                    onSuccess: () => {
                        setIsConfirmDialogOpen(false);
                        setConfirmingDonation(null);
                        if (selectedDonation && selectedDonation.id === confirmingDonation.id) {
                            setSelectedDonation(prev => prev ? { ...prev, status: 'paid', paid_at: new Date().toISOString() } : null);
                        }
                        toast.success('Donasi manual berhasil dikonfirmasi dan status terupdate menjadi Berhasil!');
                    },
                    onError: () => {
                        toast.error('Gagal mengonfirmasi donasi. Silakan periksa kembali.');
                    },
                }
            );
        } finally {
            setLoadingConfirm(false);
        }
    };

    const handleCancelConfirm = () => {
        setIsConfirmDialogOpen(false);
        setConfirmingDonation(null);
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge variant="outline" className="font-semibold bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                        BERHASIL
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="font-semibold bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <Clock className="w-3 h-3 mr-1 inline" />
                        MENUNGGU
                    </Badge>
                );
            case 'failed':
            default:
                return (
                    <Badge variant="outline" className="font-semibold bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                        <XCircle className="w-3 h-3 mr-1 inline" />
                        GAGAL
                    </Badge>
                );
        }
    };

    const hasActiveFilters = Boolean(
        (currentStatus && currentStatus !== 'all') || 
        (selectedChannel && selectedChannel !== 'all') || 
        searchTerm.trim() !== ''
    );

    return (
        <>
            <Head title="Manajemen Donasi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Manajemen Donasi
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pantau riwayat mutasi donasi, cari transaksi, dan verifikasi transfer manual donatur.
                        </p>
                    </div>
                </div>

                {/* Status Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-px">
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                            currentStatus === 'all'
                                ? 'border-[#1A56DB] text-[#1A56DB] dark:border-blue-500 dark:text-blue-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                        }`}
                    >
                        <span>Semua Donasi</span>
                        {counts && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                currentStatus === 'all' 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300' 
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                                {counts.all}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange('pending')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                            currentStatus === 'pending'
                                ? 'border-amber-600 text-amber-700 dark:border-amber-500 dark:text-amber-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                        }`}
                    >
                        <span>Menunggu Verifikasi</span>
                        {counts && counts.pending > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                currentStatus === 'pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            }`}>
                                {counts.pending_manual > 0 ? `${counts.pending_manual} Manual` : counts.pending}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange('paid')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                            currentStatus === 'paid'
                                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                        }`}
                    >
                        <span>Berhasil (Paid)</span>
                        {counts && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                currentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                                {counts.paid}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange('failed')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                            currentStatus === 'failed'
                                ? 'border-rose-600 text-rose-700 dark:border-rose-500 dark:text-rose-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                        }`}
                    >
                        <span>Gagal / Kadaluarsa</span>
                        {counts && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                currentStatus === 'failed'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                                {counts.failed}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-gray-900">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                            {/* Search Input */}
                            <div className="relative flex-1 sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Cari ID transaksi, nama, email, hp, atau program..." 
                                    className="pl-9 h-9 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] text-xs sm:text-sm rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>

                            <Button 
                                onClick={() => handleApplyFilters({ search: searchTerm })}
                                size="sm" 
                                className="bg-[#1A56DB] hover:bg-[#1A4DB5] text-white h-9 px-4 rounded-lg font-medium text-xs sm:text-sm shrink-0 shadow-xs"
                            >
                                Cari
                            </Button>

                            {/* Channel Select Filter */}
                            <div className="w-full sm:w-48">
                                <Select value={selectedChannel} onValueChange={handleChannelChange}>
                                    <SelectTrigger className="h-9 border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-xs sm:text-sm rounded-lg">
                                        <Filter className="w-3.5 h-3.5 mr-2 text-gray-400 shrink-0" />
                                        <SelectValue placeholder="Semua Kanal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kanal</SelectItem>
                                        <SelectItem value="offline">Transfer Manual (Offline)</SelectItem>
                                        <SelectItem value="online">Payment Gateway (Online)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Reset Filters */}
                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleResetFilters}
                                className="h-9 px-3 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 shrink-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                Reset Filter
                            </Button>
                        )}
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/75 dark:bg-gray-800/60">
                                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">ID Transaksi</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">Tanggal</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">Donatur</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">Program Kebaikan</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">Kanal & Metode</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">Nominal Transfer</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">Sumber</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-xs text-right pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.data.map((donation) => {
                                    const programTitle = getProgramTitle(donation.program?.title);
                                    const paymentMethod = donation.payments?.[0]?.payment_method || (donation.channel === 'offline' ? 'Manual Transfer' : 'Online Gateway');
                                    const isManualPending = donation.channel === 'offline' && donation.status === 'pending';

                                    return (
                                        <TableRow 
                                            key={donation.id} 
                                            className={`border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/50 ${
                                                isManualPending ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                                            }`}
                                        >
                                            {/* ID Transaksi */}
                                            <TableCell className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {donation.donation_code}
                                            </TableCell>

                                            {/* Tanggal */}
                                            <TableCell className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                <div>{new Date(donation.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                                                    {new Date(donation.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </div>
                                            </TableCell>

                                            {/* Donatur */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white text-xs">
                                                    <span>{donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}</span>
                                                    {donation.is_anonymous && (
                                                        <span className="px-1.5 py-0.2 text-[9px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-sm font-normal">
                                                            Anonim
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                                                    {donation.donor_email || donation.donor_phone || '-'}
                                                </div>
                                            </TableCell>

                                            {/* Program */}
                                            <TableCell>
                                                <div className="truncate max-w-[170px] text-xs font-medium text-gray-700 dark:text-gray-300" title={programTitle}>
                                                    {programTitle}
                                                </div>
                                            </TableCell>

                                            {/* Kanal & Metode */}
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        donation.channel === 'offline'
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                    }`}>
                                                        {donation.channel === 'offline' ? 'Manual Transfer' : 'Otomatis Online'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                                                    {paymentMethod.replace(/_/g, ' ')}
                                                </div>
                                            </TableCell>

                                            {/* Nominal */}
                                            <TableCell className="whitespace-nowrap">
                                                <div className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                                    {formatCurrency(donation.amount)}
                                                </div>
                                                {Boolean(donation.unique_code && donation.unique_code > 0) && (
                                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                        kode unik: +{donation.unique_code}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Sumber / UTM */}
                                            <TableCell>
                                                {donation.utm_source ? (
                                                    <div>
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                                            {donation.utm_source}
                                                        </span>
                                                        {donation.utm_campaign && (
                                                            <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[100px]" title={donation.utm_campaign}>
                                                                {donation.utm_campaign}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">Direct / Organik</span>
                                                )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="whitespace-nowrap">
                                                {renderStatusBadge(donation.status)}
                                            </TableCell>

                                            {/* Aksi */}
                                            <TableCell className="text-right whitespace-nowrap pr-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Tombol Konfirmasi Cepat untuk Donasi Manual Pending */}
                                                    {isManualPending && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => confirmManualDonation(donation)} 
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs h-7 sm:h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-lg" 
                                                            title="Konfirmasi Donasi Masuk"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                            Konfirmasi
                                                        </Button>
                                                    )}

                                                    {/* Tombol Detail untuk Semua Transaksi */}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => setSelectedDonation(donation)} 
                                                        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 h-7 sm:h-8 px-2.5 sm:px-3 text-xs font-medium rounded-lg shadow-none"
                                                        title="Lihat Detail Transaksi"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1 text-gray-500" />
                                                        Detail
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {donations.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Wallet className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                                <p className="font-medium text-gray-600 dark:text-gray-300">Tidak ada data donasi ditemukan.</p>
                                                <p className="text-xs text-gray-400">Silakan sesuaikan filter status atau kata kunci pencarian Anda.</p>
                                                {hasActiveFilters && (
                                                    <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 text-xs">
                                                        Reset Filter
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination & Summary Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/40 dark:bg-gray-800/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {donations.total > 0 ? (
                                <>
                                    Menampilkan <span className="font-semibold text-gray-700 dark:text-gray-300">{donations.from || 1}</span> - <span className="font-semibold text-gray-700 dark:text-gray-300">{donations.to || donations.data.length}</span> dari <span className="font-semibold text-gray-700 dark:text-gray-300">{donations.total}</span> data donasi
                                </>
                            ) : (
                                'Tidak ada data'
                            )}
                        </div>

                        {/* Interactive Pagination Buttons */}
                        {donations.last_page > 1 && (
                            <div className="flex flex-wrap items-center gap-1">
                                {donations.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveScroll
                                        preserveState
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                            link.active 
                                                ? 'bg-[#1A56DB] text-white border-[#1A56DB] shadow-xs' 
                                                : link.url
                                                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                                    : 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-600'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Donation Detail Modal Dialog */}
            <Dialog 
                open={Boolean(selectedDonation)} 
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDonation(null);
                    }
                }}
            >
                <DialogContent className="max-w-2xl p-6 sm:p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
                    {selectedDonation && (
                        <>
                            <DialogHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <div>
                                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span>Rincian Donasi</span>
                                            <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                                                {selectedDonation.donation_code}
                                            </span>
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Dibuat pada {new Date(selectedDonation.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} pukul {new Date(selectedDonation.created_at).toLocaleTimeString('id-ID')} WIB
                                        </DialogDescription>
                                    </div>
                                    <div className="shrink-0">
                                        {renderStatusBadge(selectedDonation.status)}
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid gap-4 py-3 text-xs sm:text-sm">
                                {/* Grid: Donatur & Program */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* Donatur Box */}
                                    <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                            Informasi Donatur
                                        </div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {selectedDonation.is_anonymous ? 'Hamba Allah (Anonim)' : selectedDonation.donor_name}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-300 mt-0.5 text-xs">
                                            Email: {selectedDonation.donor_email || '-'}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-300 mt-0.5 text-xs">
                                            No. HP / WA: {selectedDonation.donor_phone || '-'}
                                        </div>
                                    </div>

                                    {/* Program Box */}
                                    <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                                            Program Donasi
                                        </div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                                            {getProgramTitle(selectedDonation.program?.title)}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                                            ID Program: #{selectedDonation.program_id}
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Details Box */}
                                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        <CreditCard className="w-3.5 h-3.5 text-[#1A56DB]" />
                                        Rincian Pembayaran
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Total Nominal</span>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                                                {formatCurrency(selectedDonation.amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Kode Unik</span>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                                                {selectedDonation.unique_code ? `+${selectedDonation.unique_code}` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Kanal Transaksi</span>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 capitalize">
                                                {selectedDonation.channel === 'offline' ? 'Manual Transfer' : 'Online Gateway'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Metode</span>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 capitalize truncate">
                                                {(selectedDonation.payments?.[0]?.payment_method || selectedDonation.channel).replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Paid status info */}
                                    {selectedDonation.paid_at && (
                                        <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                            <ShieldCheck className="w-4 h-4 mr-1.5 shrink-0" />
                                            Telah lunas terverifikasi pada: {new Date(selectedDonation.paid_at).toLocaleString('id-ID')}
                                        </div>
                                    )}
                                </div>

                                {/* Doa / Pesan Kebaikan Donatur */}
                                {selectedDonation.message && (
                                    <div className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1.5">
                                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                                            Doa / Harapan Donatur:
                                        </div>
                                        <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 italic leading-relaxed">
                                            &ldquo;{selectedDonation.message}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedDonation(null)}
                                    className="border-gray-200 dark:border-gray-700 text-xs sm:text-sm"
                                >
                                    Tutup
                                </Button>

                                {selectedDonation.channel === 'offline' && selectedDonation.status === 'pending' && (
                                    <Button 
                                        onClick={() => {
                                            const itemToConfirm = selectedDonation;
                                            confirmManualDonation(itemToConfirm);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        Konfirmasi Donasi Ini
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                open={isConfirmDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCancelConfirm();
                    }
                }}
            >
                <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 mx-auto">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
                                <AlertCircle className="h-8 w-8" />
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                                Konfirmasi Donasi Manual
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                                Anda akan mengonfirmasi pembayaran donasi <span className="font-semibold text-zinc-900 dark:text-white font-mono">{confirmingDonation?.donation_code}</span> sebesar <span className="font-bold text-emerald-600">{formatCurrency(confirmingDonation?.amount)}</span>.<br />
                                Pastikan dana telah benar-benar masuk ke rekening giro yayasan sebelum melanjutkan.
                            </p>

                            {/* Buttons */}
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={handleCancelConfirm}
                                    disabled={loadingConfirm}
                                    className="flex-1 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmSubmit}
                                    disabled={loadingConfirm}
                                    className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingConfirm ? 'Mengonfirmasi...' : 'Ya, Setujui Donasi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Donasi',
            href: '/admin/donations',
        },
    ],
};
