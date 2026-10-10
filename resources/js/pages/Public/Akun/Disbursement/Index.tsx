import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Plus,
    Download,
    AlertCircle,
    Clock,
    CheckCircle2,
    Wallet,
    FileText,
    ReceiptText,
    MapPin,
    Landmark,
    FileCheck,
    Calendar,
    Users,
    ChevronDown,
    ChevronsUpDown,
    Printer,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { formatRupiah, formatDate, getLocalizedValue } from '@/lib/utils';

export default function Index({ program, disbursements, balanceBreakdown }: any) {
    const programTitle = getLocalizedValue(program?.title, 'Program');

    // State Accordion Open Item IDs: default open item pertama (indeks 0 / pengajuan paling baru)
    const [openItemIds, setOpenItemIds] = React.useState<number[]>(() => {
        const firstId = disbursements?.data?.[0]?.id;
        return firstId ? [firstId] : [];
    });

    // State Filter Status Tab: 'all' | 'transferred' | 'pending' | 'rejected'
    const [statusFilter, setStatusFilter] = React.useState<'all' | 'transferred' | 'pending' | 'rejected'>('all');

    const toggleItem = (id: number) => {
        setOpenItemIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const isAllOpen =
        disbursements?.data?.length > 0 &&
        disbursements.data.every((item: any) => openItemIds.includes(item.id));

    const toggleAll = () => {
        if (isAllOpen) {
            setOpenItemIds([]);
        } else {
            setOpenItemIds(disbursements.data.map((item: any) => item.id));
        }
    };

    // Hitung jumlah per status dari kumpulan data
    const statusCounts = React.useMemo(() => {
        const counts = {
            all: disbursements?.data?.length || 0,
            transferred: 0,
            pending: 0,
            rejected: 0,
        };
        disbursements?.data?.forEach((item: any) => {
            if (item.status === 'transferred') counts.transferred++;
            else if (item.status === 'pending') counts.pending++;
            else if (item.status === 'rejected') counts.rejected++;
        });
        return counts;
    }, [disbursements?.data]);

    const filteredDisbursements = React.useMemo(() => {
        if (!disbursements?.data) return [];
        if (statusFilter === 'all') return disbursements.data;
        return disbursements.data.filter((item: any) => item.status === statusFilter);
    }, [disbursements?.data, statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <Clock className="w-3 h-3 mr-1" /> Menunggu Verifikasi
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Disetujui
                    </Badge>
                );
            case 'transferred':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai Ditransfer
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                        <AlertCircle className="w-3 h-3 mr-1" /> Ditolak
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={`Pencairan Dana - ${programTitle}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Header Navigasi & Judul */}
                <div>
                    <Link
                        href="/akun/programs"
                        className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-2.5 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Daftar Program
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pencairan Dana Program</h1>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{programTitle}</p>
                        </div>
                    </div>
                </div>

                {/* Card Data Donasi & Saldo Program (2-Kolom Terpadu) */}
                <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                    Data Donasi & Saldo Program
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                    Ringkasan akumulasi donasi online, biaya transaksi resmi, dan saldo siap dicairkan.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="w-fit text-xs border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 text-slate-600 dark:text-gray-300">
                                Transparan & Real-time
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            {/* Kolom Kiri: Hero Highlight Saldo Siap Dicairkan */}
                            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-blue-100 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-gray-900 dark:to-slate-900 p-5 sm:p-6 shadow-2xs">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                            <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            Saldo Siap Dicairkan
                                        </span>
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    </div>

                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight my-2">
                                        {formatRupiah(balanceBreakdown?.available_balance || 0)}
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mt-2">
                                        Saldo bersih perolehan donasi yang dapat ditarik langsung ke rekening bank terdaftar Anda.
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-blue-100/80 dark:border-blue-900/40 space-y-2">
                                    <Button
                                        asChild
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs h-10 transition-all"
                                    >
                                        <Link href={`/akun/programs/${program.id}/disbursements/create`}>
                                            <Plus className="w-4 h-4 mr-1.5" /> Ajukan Pencairan Dana
                                        </Link>
                                    </Button>
                                    <p className="text-[11px] text-center text-slate-500 dark:text-gray-400">
                                        Minimal penarikan dana Rp 150.000 via BI-Fast
                                    </p>
                                </div>
                            </div>

                            {/* Kolom Kanan: Rincian Akumulasi Donasi (Ledger Transparan) */}
                            <div className="lg:col-span-7 flex flex-col justify-center rounded-xl border border-slate-200/80 dark:border-gray-800 bg-slate-50/40 dark:bg-gray-800/30 p-5 divide-y divide-slate-100 dark:divide-gray-800">
                                {/* 1. Total Donasi Online */}
                                <div className="pb-3 flex justify-between items-start gap-4">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Total Donasi Online
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-gray-400">
                                            Akumulasi donasi online yang berhasil dibayarkan donatur
                                        </div>
                                    </div>
                                    <span className="text-base font-bold text-slate-900 dark:text-white shrink-0">
                                        {formatRupiah(balanceBreakdown?.total_collected_online || 0)}
                                    </span>
                                </div>

                                {/* 2. Biaya Transaksi Payment Gateway */}
                                <div className="py-3 flex justify-between items-start gap-4">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                            Biaya Transaksi Payment Gateway
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-gray-400">
                                            Pemrosesan otomatis transaksi QRIS & Virtual Account
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                                        - {formatRupiah(balanceBreakdown?.total_bank_fee || balanceBreakdown?.total_gateway_fee || 0)}
                                    </span>
                                </div>

                                {/* 3. Biaya Operasional Platform */}
                                <div className="py-3 flex justify-between items-start gap-4">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                            Biaya Operasional Platform {Number(balanceBreakdown?.platform_fee_percent || 0) > 0 ? `(${balanceBreakdown.platform_fee_percent}%)` : ''}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-gray-400">
                                            Infaq operasional pengembangan sistem & pembinaan yayasan
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                                        - {formatRupiah(balanceBreakdown?.platform_fee_amount || 0)}
                                    </span>
                                </div>

                                {/* 4. Dana yang Sudah Dicairkan */}
                                <div className="pt-3 flex justify-between items-start gap-4">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                            Dana yang Sudah Dicairkan
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-gray-400">
                                            Akumulasi pencairan yang telah ditransfer ke rekening penerima
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300 shrink-0">
                                        - {formatRupiah(balanceBreakdown?.total_disbursed || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card Riwayat Pencairan (Struktur Smart Collapsible - Opsi A) */}
                <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                    Riwayat Pencairan
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                    Daftar pengajuan penarikan dana program beserta rincian penyaluran, status, dan bukti transfer.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {disbursements?.data?.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleAll}
                                        className="h-8 text-xs font-medium border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 shadow-2xs"
                                    >
                                        <ChevronsUpDown className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                        {isAllOpen ? 'Tutup Semua' : 'Buka Semua'}
                                    </Button>
                                )}
                                {disbursements?.data?.length > 0 && (
                                    <Badge variant="secondary" className="w-fit text-xs font-semibold px-2.5 py-1">
                                        {disbursements.total ?? disbursements.data.length} Pengajuan
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs Status Pengajuan */}
                        {disbursements?.data?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-gray-800/80 mt-1">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                        statusFilter === 'all'
                                            ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                                            : 'bg-slate-100 dark:bg-gray-800/60 text-slate-600 dark:text-gray-400 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Semua ({statusCounts.all})
                                </button>
                                {statusCounts.transferred > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('transferred')}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                            statusFilter === 'transferred'
                                                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                                                : 'bg-slate-100 dark:bg-gray-800/60 text-slate-600 dark:text-gray-400 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Ditransfer ({statusCounts.transferred})
                                    </button>
                                )}
                                {statusCounts.pending > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('pending')}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                            statusFilter === 'pending'
                                                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                                                : 'bg-slate-100 dark:bg-gray-800/60 text-slate-600 dark:text-gray-400 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Menunggu ({statusCounts.pending})
                                    </button>
                                )}
                                {statusCounts.rejected > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('rejected')}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                            statusFilter === 'rejected'
                                                ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                                                : 'bg-slate-100 dark:bg-gray-800/60 text-slate-600 dark:text-gray-400 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Ditolak ({statusCounts.rejected})
                                    </button>
                                )}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6">
                        {disbursements.data.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 mb-4">
                                    <Download className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Belum ada riwayat pencairan</h3>
                                <p className="text-slate-500 dark:text-gray-400 mb-6 text-sm">Anda belum pernah mengajukan pencairan dana untuk program ini.</p>
                            </div>
                        ) : filteredDisbursements.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-slate-200 dark:border-gray-800">
                                <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">
                                    Tidak ada riwayat pengajuan dengan status yang dipilih.
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setStatusFilter('all')}
                                    className="text-xs"
                                >
                                    Tampilkan Semua Status
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {filteredDisbursements.map((item: any) => {
                                    const isOpen = openItemIds.includes(item.id);

                                    return (
                                        <Collapsible
                                            key={item.id}
                                            open={isOpen}
                                            onOpenChange={() => toggleItem(item.id)}
                                            className="border border-slate-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-2xs hover:border-slate-300 dark:hover:border-gray-700 transition-colors overflow-hidden"
                                        >
                                            {/* TIER 1: Header Transaksi, Nomor Kuitansi, Status, Nominal & Toggle Trigger */}
                                            <div
                                                onClick={() => toggleItem(item.id)}
                                                className={`px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                                                    isOpen
                                                        ? 'bg-slate-50/90 dark:bg-gray-800/50'
                                                        : 'bg-white dark:bg-gray-900 hover:bg-slate-50/70 dark:hover:bg-gray-800/40'
                                                }`}
                                            >
                                                {/* Kiri: Nomor Kuitansi, Status, Tanggal, & Cuplikan Rencana (saat collapsed) */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {item.receipt_number ? (
                                                        <Badge variant="outline" className="font-mono text-xs bg-white text-slate-700 border-slate-300 dark:bg-gray-900 dark:text-gray-300 flex items-center gap-1 shadow-2xs">
                                                            <ReceiptText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                            {item.receipt_number}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs bg-white text-slate-500 border-slate-200 dark:bg-gray-900 dark:text-gray-400">
                                                            ID #{item.id}
                                                        </Badge>
                                                    )}
                                                    {getStatusBadge(item.status)}
                                                    <span className="text-xs text-slate-500 dark:text-gray-400">
                                                        • Diajukan {formatDate(item.created_at)}
                                                    </span>
                                                    {!isOpen && item.distribution_plan && (
                                                        <span className="hidden xl:inline-block text-xs text-slate-500 dark:text-gray-400 max-w-sm truncate italic">
                                                            • &ldquo;{item.distribution_plan}&rdquo;
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Kanan: Nominal Bersih, Quick Action Kuitansi, & Indikator Chevron */}
                                                <div className="flex items-center gap-3 ml-auto">
                                                    <div className="text-right">
                                                        <span className="text-[11px] text-slate-500 dark:text-gray-400 block sm:inline sm:mr-2">
                                                            {item.status === 'transferred' ? 'Bersih Ditransfer:' : 'Pengajuan:'}
                                                        </span>
                                                        <span
                                                            className={`font-bold text-base sm:text-lg font-mono tabular-nums ${
                                                                item.status === 'transferred'
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : item.status === 'rejected'
                                                                    ? 'text-slate-400 line-through'
                                                                    : 'text-slate-900 dark:text-white'
                                                            }`}
                                                        >
                                                            {formatRupiah(item.status === 'transferred' ? item.nett_amount : item.requested_amount)}
                                                        </span>
                                                    </div>

                                                    {/* Quick Action: Kuitansi (Akses instan tanpa buka accordion) */}
                                                    {item.status === 'transferred' && (
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                asChild
                                                                className="h-8 px-2.5 text-xs border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 shadow-2xs font-medium"
                                                                title="Lihat Kuitansi Resmi"
                                                            >
                                                                <Link href={`/akun/programs/${program.id}/disbursements/${item.id}/receipt`}>
                                                                    <Printer className="w-3.5 h-3.5 sm:mr-1.5 text-blue-600 dark:text-blue-400" />
                                                                    <span className="hidden sm:inline">Kuitansi</span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Chevron Toggle Button */}
                                                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-gray-400 pl-1">
                                                        <span className="hidden lg:inline text-[11px]">{isOpen ? 'Tutup' : 'Rincian'}</span>
                                                        <div className={`p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-gray-700/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                                            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Collapsible Body Content: Rincian Penuh saat Dibuka */}
                                            <CollapsibleContent>
                                                {/* TIER 2: Body Informasi (2 Kolom Seimbang) */}
                                                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-100 dark:border-gray-800">
                                                    {/* Kolom Kiri: Rencana Penyaluran (Tanpa line-clamp!) & Breakdown Perhitungan */}
                                                    <div className="md:col-span-7 space-y-3.5">
                                                        {/* Kotak Rencana Penyaluran & Lokasi */}
                                                        {item.distribution_plan && (
                                                            <div className="bg-slate-50 dark:bg-gray-800/50 rounded-lg p-3.5 border-l-3 border-blue-500 text-xs space-y-2">
                                                                <div className="flex flex-wrap items-center justify-between gap-1.5 font-semibold text-slate-700 dark:text-gray-300">
                                                                    <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                                                                        Rencana Penyaluran:
                                                                    </span>
                                                                    {item.location && (
                                                                        <span className="inline-flex items-center gap-1 text-[11px] font-normal text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700">
                                                                            <MapPin className="w-3 h-3 text-rose-500" />
                                                                            {item.location}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {/* Teks TIDAK DIPOTONG (tidak ada line-clamp) */}
                                                                <p className="text-slate-600 dark:text-gray-300 italic leading-relaxed whitespace-normal">
                                                                    &ldquo;{item.distribution_plan}&rdquo;
                                                                </p>
                                                                {(item.beneficiary_target || item.estimated_distribution_date) && (
                                                                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-gray-400 border-t border-slate-200/60 dark:border-gray-700/60">
                                                                        {item.beneficiary_target && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Users className="w-3 h-3 text-slate-400" />
                                                                                Target: {item.beneficiary_target}
                                                                            </span>
                                                                        )}
                                                                        {item.estimated_distribution_date && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                                                Est. Penyaluran: {formatDate(item.estimated_distribution_date)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Rincian Pemotongan & Estimasi Bersih */}
                                                        {item.status !== 'rejected' && (
                                                            <div className="bg-slate-50/50 dark:bg-gray-800/30 rounded-lg p-3 border border-slate-100 dark:border-gray-800 text-xs space-y-1.5">
                                                                {Number(item.platform_fee_amount) > 0 || Number(item.gateway_fee) > 0 ? (
                                                                    <>
                                                                        <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                                                                            <span>Alokasi Donasi Terkumpul:</span>
                                                                            <span className="font-semibold text-slate-800 dark:text-gray-200 font-mono tabular-nums">
                                                                                {formatRupiah(
                                                                                    Number(item.requested_amount) +
                                                                                    Number(item.platform_fee_amount || 0) +
                                                                                    Number(item.gateway_fee || 0)
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {Number(item.gateway_fee) > 0 && (
                                                                            <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                                                                                <span>Biaya Transaksi Payment Gateway:</span>
                                                                                <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                                                                                    - {formatRupiah(item.gateway_fee)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {Number(item.platform_fee_amount) > 0 && (
                                                                            <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                                                                                <span>Biaya Operasional Platform ({item.platform_fee_percent}%):</span>
                                                                                <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                                                                                    - {formatRupiah(item.platform_fee_amount)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                                                                        <span>Nominal Pengajuan Awal:</span>
                                                                        <span className="font-medium text-slate-800 dark:text-gray-200 font-mono tabular-nums">
                                                                            {formatRupiah(item.requested_amount)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                                                                    <span>Biaya Transfer Bank (BI-Fast):</span>
                                                                    <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                                                                        - {formatRupiah(item.bank_fee || 2500)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60 dark:border-gray-700/60 font-semibold">
                                                                    <span className="text-slate-800 dark:text-gray-200">
                                                                        {item.status === 'transferred' ? 'Bersih Ditransfer ke Rekening:' : 'Estimasi Bersih Diterima:'}
                                                                    </span>
                                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono tabular-nums">
                                                                        {formatRupiah(item.nett_amount)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Alasan Penolakan */}
                                                        {item.status === 'rejected' && item.rejection_reason && (
                                                            <div className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-lg border border-rose-200 dark:border-rose-900/60">
                                                                <span className="font-semibold">Alasan Penolakan:</span> {item.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Kolom Kanan: Kartu Mini Rekening Bank Tujuan */}
                                                    <div className="md:col-span-5 flex flex-col justify-start">
                                                        <div className="bg-slate-50/80 dark:bg-gray-800/50 rounded-lg p-3.5 border border-slate-200/80 dark:border-gray-700/60 space-y-2">
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-gray-300">
                                                                <Landmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                Rekening Tujuan Transfer
                                                            </div>
                                                            <div className="pt-1.5 border-t border-slate-200/60 dark:border-gray-700/60 space-y-1">
                                                                <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                                                                    {item.bank_name}
                                                                </p>
                                                                <p className="font-mono text-sm font-semibold text-slate-800 dark:text-gray-200">
                                                                    {item.bank_account_number}
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                                                    a.n. <span className="font-medium text-slate-700 dark:text-gray-300">{item.bank_account_name}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* TIER 3: Footer Action Bar */}
                                                <div className="bg-slate-50/50 dark:bg-gray-800/30 px-5 py-3 border-t border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="text-xs text-slate-500 dark:text-gray-400">
                                                        {item.transferred_at ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Ditransfer pada {formatDate(item.transferred_at)}
                                                            </span>
                                                        ) : (
                                                            <span>Estimasi proses 1-2 hari kerja sejak persetujuan</span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {item.supporting_document && (
                                                            <Button size="sm" variant="outline" asChild className="h-8 text-xs border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                                                <a href={`/akun/programs/${program.id}/disbursements/${item.id}/supporting-document`} target="_blank" rel="noopener noreferrer">
                                                                    <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" /> Dokumen RAB
                                                                </a>
                                                            </Button>
                                                        )}
                                                        {item.status === 'transferred' && (
                                                            <>
                                                                <Button size="sm" variant="outline" asChild className="h-8 text-xs border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                                                    <Link href={`/akun/programs/${program.id}/disbursements/${item.id}/receipt`}>
                                                                        <ReceiptText className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                                                                        Lihat Kuitansi
                                                                    </Link>
                                                                </Button>
                                                                {item.transfer_proof && (
                                                                    <Button size="sm" variant="outline" asChild className="h-8 text-xs border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                                                        <a href={`/akun/programs/${program.id}/disbursements/${item.id}/proof`} target="_blank" rel="noopener noreferrer">
                                                                            <FileCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                                                                            Bukti Transfer
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                                <Button size="sm" asChild className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-medium">
                                                                    <Link href={`/akun/programs/${program.id}/updates`}>
                                                                        Lapor Penyaluran
                                                                    </Link>
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {disbursements.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex gap-2">
                                    {disbursements.links.map((link: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded border text-sm ${
                                                link.active
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
