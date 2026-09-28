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
    CheckCircle2,
    UploadCloud,
    FileImage,
    X,
    ExternalLink,
    ZoomIn,
    Copy,
    Check,
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    index as donationsIndex,
    confirm as donationsConfirm,
} from '@/routes/admin/donations';

interface PaymentInfo {
    id: number;
    payment_method: string;
    payment_channel?: string | null;
    payment_destination?: string | null;
    gateway: string;
    gateway_status: string;
    paid_amount?: string | number | null;
    paid_at?: string | null;
    confirmed_by?: {
        id?: number;
        name: string;
        email?: string;
    } | number | null;
    transfer_proof?: string | null;
    transfer_proof_url?: string | null;
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
        const values = Object.values(title).filter(
            (v) => typeof v === 'string' && v.trim() !== '',
        );
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

const formatPaymentMethodName = (
    method?: string | null,
    channel?: string | null,
): string => {
    if (!method) {
        return channel === 'offline' ? 'Transfer Bank' : 'Online Gateway';
    }
    const m = method.toLowerCase();
    if (m === 'bank_transfer_manual' || m === 'bank_transfer') {
        return 'Transfer Bank Manual';
    }
    if (m === 'virtual_account') {
        return 'Virtual Account';
    }
    if (m === 'ewallet') {
        return 'E-Wallet';
    }
    if (m === 'qris') {
        return 'QRIS';
    }
    if (m === 'credit_card') {
        return 'Kartu Kredit';
    }
    return m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatPaymentChannelName = (
    paymentChannel?: string | null,
): string | null => {
    if (!paymentChannel) return null;
    const raw = paymentChannel.trim();
    const code = raw.toUpperCase().replace(/^MANUAL_/, '');
    const bankMap: Record<string, string> = {
        BRI: 'Bank BRI',
        BSI: 'Bank Syariah Indonesia (BSI)',
        BCA: 'Bank BCA',
        BNI: 'Bank BNI',
        MANDIRI: 'Bank Mandiri',
        PERMATA: 'Bank Permata',
        CIMB: 'Bank CIMB Niaga',
        QRIS: 'QRIS',
        OVO: 'OVO',
        DANA: 'DANA',
        SHOPEEPAY: 'ShopeePay',
        ASTRAPAY: 'AstraPay',
    };
    return bankMap[code] || (raw.startsWith('MANUAL_') ? `Bank ${code}` : raw);
};

export default function Index({ donations, filters = {}, counts }: Props) {
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmingDonation, setConfirmingDonation] =
        useState<DonationRecord | null>(null);
    const [selectedDonation, setSelectedDonation] =
        useState<DonationRecord | null>(null);
    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const [transferProofFile, setTransferProofFile] = useState<File | null>(
        null,
    );
    const [transferProofPreview, setTransferProofPreview] = useState<
        string | null
    >(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedChannel, setSelectedChannel] = useState(
        filters.channel || 'all',
    );

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        toast.success(`Kode donasi ${code} berhasil disalin!`);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const currentStatus = filters.status || 'all';

    const handleApplyFilters = (newParams: {
        status?: string;
        channel?: string;
        search?: string;
    }) => {
        const query: Record<string, any> = {};

        const statusVal =
            newParams.status !== undefined ? newParams.status : currentStatus;
        if (statusVal && statusVal !== 'all') {
            query.status = statusVal;
        }

        const channelVal =
            newParams.channel !== undefined
                ? newParams.channel
                : selectedChannel;
        if (channelVal && channelVal !== 'all') {
            query.channel = channelVal;
        }

        const searchVal =
            newParams.search !== undefined ? newParams.search : searchTerm;
        if (searchVal && searchVal.trim() !== '') {
            query.search = searchVal.trim();
        }

        router.get(donationsIndex.url({ query }), undefined, {
            preserveState: true,
            preserveScroll: true,
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
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);
        if (!file) return;

        if (
            !['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(
                file.type,
            )
        ) {
            setFileError(
                'Format file harus berupa gambar (JPG, PNG, atau WEBP).',
            );
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            setFileError('Ukuran file maksimal 3MB.');
            return;
        }

        setTransferProofFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setTransferProofPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
        setTransferProofFile(null);
        setTransferProofPreview(null);
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const confirmManualDonation = (donation: DonationRecord) => {
        setConfirmingDonation(donation);
        setTransferProofFile(null);
        setTransferProofPreview(null);
        setFileError(null);
        setIsConfirmDialogOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (!confirmingDonation) {
            return;
        }

        if (!transferProofFile) {
            setFileError(
                'Bukti transfer wajib diunggah untuk konfirmasi donasi manual.',
            );
            toast.error('Silakan unggah bukti transfer terlebih dahulu.');
            return;
        }

        setLoadingConfirm(true);

        try {
            await router.post(
                donationsConfirm.url({ donation: confirmingDonation.id }),
                {
                    transfer_proof: transferProofFile,
                },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setIsConfirmDialogOpen(false);
                        setConfirmingDonation(null);
                        setTransferProofFile(null);
                        setTransferProofPreview(null);
                        setFileError(null);
                        if (
                            selectedDonation &&
                            selectedDonation.id === confirmingDonation.id
                        ) {
                            setSelectedDonation((prev) =>
                                prev
                                    ? {
                                          ...prev,
                                          status: 'paid',
                                          paid_at: new Date().toISOString(),
                                      }
                                    : null,
                            );
                        }
                        toast.success(
                            'Donasi manual berhasil diverifikasi dan dikonfirmasi!',
                        );
                    },
                    onError: (errors) => {
                        if (errors.transfer_proof) {
                            setFileError(errors.transfer_proof);
                            toast.error(errors.transfer_proof);
                        } else {
                            toast.error(
                                'Gagal mengonfirmasi donasi. Silakan periksa kembali.',
                            );
                        }
                    },
                },
            );
        } finally {
            setLoadingConfirm(false);
        }
    };

    const handleCancelConfirm = () => {
        setIsConfirmDialogOpen(false);
        setConfirmingDonation(null);
        setTransferProofFile(null);
        setTransferProofPreview(null);
        setFileError(null);
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge
                        variant="outline"
                        className="border-emerald-200/80 bg-emerald-50 font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                        <CheckCircle2 className="mr-1 inline h-3 w-3" />
                        BERHASIL
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge
                        variant="outline"
                        className="border-amber-200/80 bg-amber-50 font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                        <Clock className="mr-1 inline h-3 w-3" />
                        MENUNGGU
                    </Badge>
                );
            case 'failed':
            default:
                return (
                    <Badge
                        variant="outline"
                        className="border-rose-200/80 bg-rose-50 font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                        <XCircle className="mr-1 inline h-3 w-3" />
                        GAGAL
                    </Badge>
                );
        }
    };

    const hasActiveFilters = Boolean(
        (currentStatus && currentStatus !== 'all') ||
        (selectedChannel && selectedChannel !== 'all') ||
        searchTerm.trim() !== '',
    );

    return (
        <>
            <Head title="Manajemen Donasi" />

            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Manajemen Donasi
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Pantau riwayat mutasi donasi, cari transaksi, dan
                            verifikasi transfer manual donatur.
                        </p>
                    </div>
                </div>

                {/* Status Navigation Tabs */}
                <div className="flex custom-scrollbar w-full min-w-0 items-center gap-2 overflow-x-auto border-b border-gray-200 pb-px dark:border-gray-800">
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm ${
                            currentStatus === 'all'
                                ? 'border-[#1A56DB] text-[#1A56DB] dark:border-blue-500 dark:text-blue-400'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>Semua Donasi</span>
                        {counts && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    currentStatus === 'all'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                            >
                                {counts.all}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange('pending')}
                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm ${
                            currentStatus === 'pending'
                                ? 'border-amber-600 text-amber-700 dark:border-amber-500 dark:text-amber-400'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>Menunggu Verifikasi</span>
                        {counts && counts.pending > 0 && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    currentStatus === 'pending'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                }`}
                            >
                                {counts.pending_manual > 0
                                    ? `${counts.pending_manual} Manual`
                                    : counts.pending}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange('paid')}
                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm ${
                            currentStatus === 'paid'
                                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>Berhasil (Paid)</span>
                        {counts && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    currentStatus === 'paid'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                            >
                                {counts.paid}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange('failed')}
                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm ${
                            currentStatus === 'failed'
                                ? 'border-rose-600 text-rose-700 dark:border-rose-500 dark:text-rose-400'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <span>Gagal / Kadaluarsa</span>
                        {counts && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    currentStatus === 'failed'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                            >
                                {counts.failed}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-col items-stretch justify-between gap-3 border-b border-gray-100 bg-white p-4 md:flex-row md:items-center dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            {/* Search Input */}
                            <div className="relative flex-1 sm:max-w-md">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Cari ID transaksi, nama, email, hp, atau program..."
                                    className="h-9 rounded-lg border-gray-200 pl-9 text-xs focus-visible:ring-[#1A56DB] sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>

                            <Button
                                onClick={() =>
                                    handleApplyFilters({ search: searchTerm })
                                }
                                size="sm"
                                className="h-9 shrink-0 rounded-lg bg-[#1A56DB] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#1A4DB5] sm:text-sm"
                            >
                                Cari
                            </Button>

                            {/* Channel Select Filter */}
                            <div className="w-full sm:w-48">
                                <Select
                                    value={selectedChannel}
                                    onValueChange={handleChannelChange}
                                >
                                    <SelectTrigger className="h-9 rounded-lg border-gray-200 text-xs sm:text-sm dark:border-gray-700 dark:bg-gray-800">
                                        <Filter className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-400" />
                                        <SelectValue placeholder="Semua Kanal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Kanal
                                        </SelectItem>
                                        <SelectItem value="offline">
                                            Transfer Manual (Offline)
                                        </SelectItem>
                                        <SelectItem value="online">
                                            Payment Gateway (Online)
                                        </SelectItem>
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
                                className="h-9 shrink-0 px-3 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Reset Filter
                            </Button>
                        )}
                    </div>

                    {/* Table Section */}
                    <div className="custom-scrollbar w-full overflow-x-auto">
                        <Table className="min-w-[1020px]">
                            <TableHeader className="bg-gray-50/75 dark:bg-gray-800/60">
                                <TableRow className="border-gray-100 hover:bg-transparent dark:border-gray-800">
                                    <TableHead className="w-[130px] text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        ID Transaksi
                                    </TableHead>
                                    <TableHead className="w-[110px] text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="min-w-[150px] text-xs font-semibold text-gray-600 dark:text-gray-300">
                                        Donatur
                                    </TableHead>
                                    <TableHead className="min-w-[160px] text-xs font-semibold text-gray-600 dark:text-gray-300">
                                        Program Kebaikan
                                    </TableHead>
                                    <TableHead className="w-[140px] text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        Kanal & Metode
                                    </TableHead>
                                    <TableHead className="w-[130px] text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        Nominal Transfer
                                    </TableHead>
                                    <TableHead className="w-[110px] text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        Sumber
                                    </TableHead>
                                    <TableHead className="w-[110px] text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-[140px] pr-4 text-right text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.data.map((donation) => {
                                    const programTitle = getProgramTitle(
                                        donation.program?.title,
                                    );
                                    const paymentMethod =
                                        donation.payments?.[0]
                                            ?.payment_method ||
                                        (donation.channel === 'offline'
                                            ? 'Manual Transfer'
                                            : 'Online Gateway');
                                    const isManualPending =
                                        donation.channel === 'offline' &&
                                        donation.status === 'pending';

                                    return (
                                        <TableRow
                                            key={donation.id}
                                            className={`border-gray-100 transition-colors hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-gray-800/50 ${
                                                isManualPending
                                                    ? 'bg-amber-50/30 dark:bg-amber-950/20'
                                                    : ''
                                            }`}
                                        >
                                            {/* ID Transaksi */}
                                            <TableCell className="font-mono text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                {donation.donation_code}
                                            </TableCell>

                                            {/* Tanggal */}
                                            <TableCell className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                <div>
                                                    {new Date(
                                                        donation.created_at,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                                                    {new Date(
                                                        donation.created_at,
                                                    ).toLocaleTimeString(
                                                        'id-ID',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    )}{' '}
                                                    WIB
                                                </div>
                                            </TableCell>

                                            {/* Donatur */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-white">
                                                    <span>
                                                        {donation.is_anonymous
                                                            ? 'Hamba Allah'
                                                            : donation.donor_name}
                                                    </span>
                                                    {donation.is_anonymous && (
                                                        <span className="py-0.2 rounded-sm bg-gray-100 px-1.5 text-[9px] font-normal text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                            Anonim
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="max-w-[160px] truncate text-[11px] text-gray-500 dark:text-gray-400">
                                                    {donation.donor_email ||
                                                        donation.donor_phone ||
                                                        '-'}
                                                </div>
                                            </TableCell>

                                            {/* Program */}
                                            <TableCell>
                                                <div
                                                    className="max-w-[170px] truncate text-xs font-medium text-gray-700 dark:text-gray-300"
                                                    title={programTitle}
                                                >
                                                    {programTitle}
                                                </div>
                                            </TableCell>

                                            {/* Kanal & Metode */}
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${
                                                            donation.channel ===
                                                            'offline'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                        }`}
                                                    >
                                                        {donation.channel ===
                                                        'offline'
                                                            ? 'Manual Transfer'
                                                            : 'Otomatis Online'}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                                    {(() => {
                                                        const firstPayment =
                                                            donation.payments?.[0];
                                                        const channelLabel =
                                                            formatPaymentChannelName(
                                                                firstPayment?.payment_channel,
                                                            );
                                                        if (
                                                            donation.channel ===
                                                            'offline'
                                                        ) {
                                                            return (
                                                                channelLabel ||
                                                                'Transfer Bank'
                                                            );
                                                        }
                                                        const methodLabel =
                                                            formatPaymentMethodName(
                                                                firstPayment?.payment_method,
                                                                donation.channel,
                                                            );
                                                        if (
                                                            channelLabel &&
                                                            channelLabel !==
                                                                methodLabel
                                                        ) {
                                                            return `${methodLabel} • ${channelLabel}`;
                                                        }
                                                        return methodLabel;
                                                    })()}
                                                </div>
                                            </TableCell>

                                            {/* Nominal */}
                                            <TableCell className="whitespace-nowrap">
                                                <div className="text-xs font-bold text-gray-900 sm:text-sm dark:text-white">
                                                    {formatCurrency(
                                                        donation.amount,
                                                    )}
                                                </div>
                                                {Boolean(
                                                    donation.unique_code &&
                                                    donation.unique_code > 0,
                                                ) && (
                                                    <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                        kode unik: +
                                                        {donation.unique_code}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Sumber / UTM */}
                                            <TableCell>
                                                {donation.utm_source ? (
                                                    <div>
                                                        <span className="inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                                            {
                                                                donation.utm_source
                                                            }
                                                        </span>
                                                        {donation.utm_campaign && (
                                                            <div
                                                                className="mt-0.5 max-w-[100px] truncate text-[9px] text-gray-500 dark:text-gray-400"
                                                                title={
                                                                    donation.utm_campaign
                                                                }
                                                            >
                                                                {
                                                                    donation.utm_campaign
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                                        Direct / Organik
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="whitespace-nowrap">
                                                {renderStatusBadge(
                                                    donation.status,
                                                )}
                                            </TableCell>

                                            {/* Aksi */}
                                            <TableCell className="pr-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Tombol Konfirmasi Cepat untuk Donasi Manual Pending */}
                                                    {isManualPending && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                confirmManualDonation(
                                                                    donation,
                                                                )
                                                            }
                                                            className="h-7.5 shrink-0 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                                                            title="Konfirmasi Donasi Masuk"
                                                        >
                                                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                            Konfirmasi
                                                        </Button>
                                                    )}

                                                    {/* Tombol Detail untuk Semua Transaksi */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedDonation(
                                                                donation,
                                                            )
                                                        }
                                                        className="h-7.5 shrink-0 rounded-lg border-gray-200 px-2.5 text-xs font-medium text-gray-700 shadow-none hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                                        title="Lihat Detail Transaksi"
                                                    >
                                                        <Eye className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                                        Detail
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {donations.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Wallet className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                                <p className="font-medium text-gray-600 dark:text-gray-300">
                                                    Tidak ada data donasi
                                                    ditemukan.
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Silakan sesuaikan filter
                                                    status atau kata kunci
                                                    pencarian Anda.
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={
                                                            handleResetFilters
                                                        }
                                                        className="mt-2 text-xs"
                                                    >
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
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/40 p-4 sm:flex-row dark:border-gray-800 dark:bg-gray-800/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {donations.total > 0 ? (
                                <>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {donations.from || 1}
                                    </span>{' '}
                                    -{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {donations.to || donations.data.length}
                                    </span>{' '}
                                    dari{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {donations.total}
                                    </span>{' '}
                                    data donasi
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
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                            link.active
                                                ? 'border-[#1A56DB] bg-[#1A56DB] text-white shadow-xs'
                                                : link.url
                                                  ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                  : 'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
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
                <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                    {selectedDonation && (
                        <>
                            {/* Sticky Header */}
                            <div className="shrink-0 border-b border-gray-100 p-5 sm:px-6 sm:py-5 dark:border-gray-800">
                                <DialogHeader>
                                    <div className="flex flex-col justify-between gap-3 pr-8 sm:flex-row sm:items-center">
                                        <div>
                                            <DialogTitle className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                                <span>Rincian Donasi</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCopyCode(
                                                            selectedDonation.donation_code,
                                                        )
                                                    }
                                                    className="group inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                    title="Klik untuk menyalin kode donasi"
                                                >
                                                    <span>
                                                        {selectedDonation.donation_code}
                                                    </span>
                                                    {copiedCode ? (
                                                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <Copy className="h-3 w-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                                                    )}
                                                </button>
                                            </DialogTitle>
                                            <DialogDescription className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Dibuat pada{' '}
                                                {new Date(
                                                    selectedDonation.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}{' '}
                                                pukul{' '}
                                                {new Date(
                                                    selectedDonation.created_at,
                                                ).toLocaleTimeString('id-ID')}{' '}
                                                WIB
                                            </DialogDescription>
                                        </div>
                                        <div className="shrink-0">
                                            {renderStatusBadge(
                                                selectedDonation.status,
                                            )}
                                        </div>
                                    </div>
                                </DialogHeader>
                            </div>

                            {/* Scrollable Body Content */}
                            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs sm:p-6 sm:text-sm">
                                {/* Grid: Donatur & Program */}
                                <div className="grid gap-3.5 sm:grid-cols-2">
                                    {/* Donatur Box */}
                                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            <User className="h-3.5 w-3.5 text-gray-400" />
                                            Informasi Donatur
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedDonation.is_anonymous
                                                ? 'Hamba Allah (Anonim)'
                                                : selectedDonation.donor_name}
                                        </div>
                                        <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                                            Email:{' '}
                                            {selectedDonation.donor_email ||
                                                '-'}
                                        </div>
                                        <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                                            No. HP / WA:{' '}
                                            {selectedDonation.donor_phone ||
                                                '-'}
                                        </div>
                                    </div>

                                    {/* Program Box */}
                                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            <Heart className="h-3.5 w-3.5 text-rose-500" />
                                            Program Donasi
                                        </div>
                                        <div className="break-words text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                                            {getProgramTitle(
                                                selectedDonation.program?.title,
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            ID Program: #
                                            {selectedDonation.program_id}
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Details Box */}
                                {(() => {
                                    const payment =
                                        selectedDonation.payments?.[0];
                                    const uniqueCode = Number(
                                        selectedDonation.unique_code || 0,
                                    );
                                    const totalAmount = Number(
                                        selectedDonation.amount || 0,
                                    );
                                    const baseAmount =
                                        uniqueCode > 0
                                            ? Math.max(
                                                  0,
                                                  totalAmount - uniqueCode,
                                              )
                                            : totalAmount;
                                    const paymentMethodLabel =
                                        formatPaymentMethodName(
                                            payment?.payment_method,
                                            selectedDonation.channel,
                                        );
                                    const bankChannelLabel =
                                        formatPaymentChannelName(
                                            payment?.payment_channel,
                                        );
                                    const confirmedByName =
                                        typeof payment?.confirmed_by ===
                                            'object' &&
                                        payment?.confirmed_by?.name
                                            ? payment.confirmed_by.name
                                            : payment?.confirmed_by_user
                                                    ?.name || null;

                                    return (
                                        <div className="rounded-xl border border-gray-200/80 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                                            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                    <CreditCard className="h-4 w-4 text-[#1A56DB]" />
                                                    <span>
                                                        Rincian Pembayaran
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                                                            selectedDonation.channel ===
                                                            'offline'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                                                        }`}
                                                    >
                                                        {selectedDonation.channel ===
                                                        'offline'
                                                            ? 'Manual Transfer (Offline)'
                                                            : `Online Gateway (${payment?.gateway ? payment.gateway.toUpperCase() : 'Xendit'})`}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Total Highlight Card */}
                                            <div className="rounded-lg border border-gray-200/70 bg-white p-3.5 shadow-xs dark:border-gray-700/60 dark:bg-gray-900/60">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <span className="text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                            Total Nominal Transfer
                                                        </span>
                                                        <div className="mt-0.5 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                            {formatCurrency(
                                                                totalAmount,
                                                            )}
                                                        </div>
                                                    </div>
                                                    {uniqueCode > 0 ? (
                                                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-right">
                                                            <div className="rounded-md bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    Nominal Pokok:{' '}
                                                                </span>
                                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                                    {formatCurrency(
                                                                        baseAmount,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="rounded-md bg-amber-100/80 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                                <span>
                                                                    Kode Unik:{' '}
                                                                </span>
                                                                <span className="font-mono font-bold">
                                                                    +{uniqueCode}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Tanpa kode unik tambahan
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment Method & Destination Details */}
                                            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {/* Metode Pembayaran */}
                                                <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/40">
                                                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                                        Metode Pembayaran
                                                    </span>
                                                    <p className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
                                                        {paymentMethodLabel}
                                                    </p>
                                                </div>

                                                {/* Bank / Akun Tujuan */}
                                                <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/40">
                                                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                                        {selectedDonation.channel ===
                                                        'offline'
                                                            ? 'Bank Tujuan Transfer'
                                                            : 'Kanal Pembayaran'}
                                                    </span>
                                                    <div className="mt-1">
                                                        <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                                                            {bankChannelLabel ||
                                                                (selectedDonation.channel ===
                                                                'offline'
                                                                    ? 'Rekening Yayasan'
                                                                    : 'Otomatis Online')}
                                                        </p>
                                                        {payment?.payment_destination && (
                                                            <p className="mt-0.5 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                                No. Rek / ID:{' '}
                                                                <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                                    {
                                                                        payment.payment_destination
                                                                    }
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Status Transaksi Gateway */}
                                                <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/40">
                                                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                                        Status Transaksi
                                                    </span>
                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <span
                                                            className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-semibold ${
                                                                (
                                                                    payment?.gateway_status ||
                                                                    selectedDonation.status
                                                                ).toUpperCase() ===
                                                                    'PAID' ||
                                                                (
                                                                    payment?.gateway_status ||
                                                                    selectedDonation.status
                                                                ).toUpperCase() ===
                                                                    'SETTLED'
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                    : (
                                                                            payment?.gateway_status ||
                                                                            selectedDonation.status
                                                                        ).toUpperCase() ===
                                                                          'PENDING'
                                                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                            }`}
                                                        >
                                                            {payment?.gateway_status ||
                                                                (selectedDonation.status ===
                                                                'paid'
                                                                    ? 'PAID'
                                                                    : selectedDonation.status.toUpperCase())}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Paid status info banner */}
                                            {selectedDonation.paid_at && (
                                                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                        <span>
                                                            Telah lunas
                                                            terverifikasi pada:{' '}
                                                            <strong>
                                                                {new Date(
                                                                    selectedDonation.paid_at,
                                                                ).toLocaleDateString(
                                                                    'id-ID',
                                                                    {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    },
                                                                )}{' '}
                                                                pukul{' '}
                                                                {new Date(
                                                                    selectedDonation.paid_at,
                                                                ).toLocaleTimeString(
                                                                    'id-ID',
                                                                )}{' '}
                                                                WIB
                                                            </strong>
                                                        </span>
                                                    </div>
                                                    {confirmedByName && (
                                                        <div className="text-xs text-emerald-700 dark:text-emerald-400">
                                                            Diverifikasi oleh:{' '}
                                                            <strong>
                                                                {
                                                                    confirmedByName
                                                                }
                                                            </strong>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Doa / Pesan Kebaikan Donatur */}
                                {selectedDonation.message && (
                                    <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                                            <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                                            Doa / Harapan Donatur:
                                        </div>
                                        <p className="text-xs leading-relaxed text-amber-950 italic sm:text-sm dark:text-amber-200">
                                            &ldquo;{selectedDonation.message}
                                            &rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Bukti Transfer Terverifikasi */}
                                {(() => {
                                    const selectedDonationProofUrl =
                                        selectedDonation.payments?.find(
                                            (p) => p.transfer_proof_url,
                                        )?.transfer_proof_url ||
                                        (selectedDonation.payments?.[0]
                                            ?.transfer_proof
                                            ? `/storage/${selectedDonation.payments[0].transfer_proof}`
                                            : null);

                                    if (!selectedDonationProofUrl) return null;

                                    return (
                                        <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300">
                                                    <FileImage className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                    Bukti Transfer
                                                    Terverifikasi:
                                                </div>
                                                <a
                                                    href={
                                                        selectedDonationProofUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                                                >
                                                    <span>
                                                        Buka di Tab Baru
                                                    </span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                            <div
                                                onClick={() =>
                                                    setPreviewImageUrl(
                                                        selectedDonationProofUrl,
                                                    )
                                                }
                                                className="group relative flex max-h-52 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-blue-200/60 bg-white dark:border-blue-800 dark:bg-zinc-900"
                                                title="Klik untuk memperbesar"
                                            >
                                                <img
                                                    src={
                                                        selectedDonationProofUrl
                                                    }
                                                    alt="Bukti Transfer"
                                                    className="max-h-52 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 text-xs font-medium text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                                                    <ZoomIn className="h-4 w-4" />
                                                    Klik untuk memperbesar
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Sticky Footer */}
                            <div className="shrink-0 border-t border-gray-100 bg-gray-50/70 p-4 sm:px-6 dark:border-gray-800 dark:bg-gray-800/40">
                                <DialogFooter className="flex flex-col items-stretch justify-between gap-2.5 sm:flex-row sm:items-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedDonation(null)}
                                        className="border-gray-200 text-xs sm:text-sm dark:border-gray-700"
                                    >
                                        Tutup
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        {selectedDonation.status === 'paid' && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    window.open(
                                                        `/donasi/kwitansi/${selectedDonation.donation_code}`,
                                                        '_blank',
                                                    )
                                                }
                                                className="border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 sm:text-sm dark:border-blue-900/60 dark:text-blue-300 dark:hover:bg-blue-950/40"
                                            >
                                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                                Lihat Kuitansi Resmi
                                            </Button>
                                        )}

                                        {selectedDonation.channel === 'offline' &&
                                            selectedDonation.status === 'pending' && (
                                                <Button
                                                    onClick={() => {
                                                        const itemToConfirm =
                                                            selectedDonation;
                                                        confirmManualDonation(
                                                            itemToConfirm,
                                                        );
                                                    }}
                                                    className="bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 sm:text-sm"
                                                >
                                                    <CheckCircle className="mr-1.5 h-4 w-4" />
                                                    Konfirmasi Donasi Ini
                                                </Button>
                                            )}
                                    </div>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog with Required Proof Upload */}
            <Dialog
                open={isConfirmDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCancelConfirm();
                    }
                }}
            >
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
                    <div className="relative mx-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-7 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex flex-col">
                            {/* Header */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                        Konfirmasi Donasi Manual
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Validasi transaksi transfer bank dengan
                                        melampirkan struk / bukti transfer.
                                    </p>
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="mb-4 space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">
                                        Kode Donasi:
                                    </span>
                                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                                        {confirmingDonation?.donation_code}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">
                                        Nama Donatur:
                                    </span>
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                        {confirmingDonation?.is_anonymous
                                            ? 'Hamba Allah'
                                            : confirmingDonation?.donor_name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">
                                        Total Nominal:
                                    </span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(
                                            confirmingDonation?.amount,
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Upload Area */}
                            <div className="mb-4">
                                <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Unggah Bukti Transfer / Struk{' '}
                                    <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="transfer-proof-input"
                                />

                                {!transferProofFile ? (
                                    <div
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file =
                                                e.dataTransfer.files?.[0];
                                            if (file) {
                                                const fakeEvent = {
                                                    target: { files: [file] },
                                                } as any;
                                                handleFileChange(fakeEvent);
                                            }
                                        }}
                                        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
                                            fileError
                                                ? 'border-rose-400 bg-rose-50/40 dark:border-rose-800 dark:bg-rose-950/20'
                                                : 'border-zinc-300 bg-zinc-50/40 hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-zinc-700 dark:bg-zinc-900/30'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                                <UploadCloud className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                                Klik untuk memilih atau seret
                                                gambar struk ke sini
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                                                Format JPG, PNG, WEBP (Maksimal
                                                3MB)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/20">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                {transferProofPreview && (
                                                    <img
                                                        src={
                                                            transferProofPreview
                                                        }
                                                        alt="Pratinjau Struk"
                                                        className="h-12 w-12 shrink-0 rounded-lg border border-emerald-300 object-cover dark:border-emerald-800"
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                                        {transferProofFile.name}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                        {(
                                                            transferProofFile.size /
                                                            1024
                                                        ).toFixed(1)}{' '}
                                                        KB • Siap diunggah
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveFile}
                                                className="h-8 px-2 text-xs text-zinc-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                                title="Hapus file"
                                            >
                                                <X className="mr-1 h-4 w-4" />
                                                Ganti
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {fileError && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        {fileError}
                                    </p>
                                )}
                            </div>

                            <p className="mb-5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                                Pastikan dana telah benar-benar masuk ke mutasi
                                rekening yayasan sebelum menyetujui donasi ini.
                            </p>

                            {/* Buttons */}
                            <div className="flex w-full gap-3 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                                <button
                                    onClick={handleCancelConfirm}
                                    disabled={loadingConfirm}
                                    className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-xs font-medium text-zinc-700 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmSubmit}
                                    disabled={
                                        loadingConfirm || !transferProofFile
                                    }
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                >
                                    {loadingConfirm ? (
                                        <>
                                            <span className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                            Mengonfirmasi...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Ya, Setujui Donasi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Preview / Lightbox Dialog */}
            <Dialog
                open={Boolean(previewImageUrl)}
                onOpenChange={(open) => !open && setPreviewImageUrl(null)}
            >
                <DialogContent className="max-w-3xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white">
                                <FileImage className="h-4 w-4 text-blue-600" />
                                Pratinjau Bukti Transfer
                            </DialogTitle>
                            {previewImageUrl && (
                                <a
                                    href={previewImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="mr-6 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                                >
                                    <span>Buka di Tab Baru</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                    </DialogHeader>
                    <div className="mt-2 flex max-h-[75vh] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                        {previewImageUrl && (
                            <img
                                src={previewImageUrl}
                                alt="Bukti Transfer"
                                className="h-auto max-h-[75vh] w-full object-contain"
                            />
                        )}
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
