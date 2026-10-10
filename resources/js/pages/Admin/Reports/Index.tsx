import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    CheckCircle2,
    Coins,
    CreditCard,
    Download,
    FileSpreadsheet,
    HelpCircle,
    Info,
    Landmark,
    Layers,
    ShieldCheck,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
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
import { formatCurrency } from '@/lib/utils';

interface FinancialSummary {
    total_gross_donations: number;
    total_donations_count: number;
    total_gateway_fees: number;
    net_collected_donations: number;
    total_disbursed_gross: number;
    total_disbursements_count: number;
    total_platform_fees: number;
    total_bank_fees: number;
    total_disbursed_nett: number;
    internal_disbursed_amount: number;
    internal_disbursements_count: number;
    campaigner_disbursed_amount: number;
    campaigner_disbursements_count: number;
    escrow_balance: number;
    period_net_cashflow: number;
}

interface PaymentChannelStat {
    channel_label: string;
    category: string;
    transactions_count: number;
    gross_amount: number;
    gateway_fee: number;
    net_amount: number;
    percentage: number;
    average_amount: number;
}

interface TopFundraiser {
    fundraiser_id: number;
    referral_code: string;
    name: string;
    email: string;
    program_title: string;
    program_slug: string;
    donations_count: number;
    total_raised: number;
}

interface AttributionStats {
    direct: {
        count: number;
        amount: number;
        percentage: number;
    };
    fundraiser: {
        count: number;
        amount: number;
        percentage: number;
    };
    top_fundraisers: TopFundraiser[];
}

interface AttributionRow {
    source: string;
    medium: string;
    campaign: string;
    transactions_count: number;
    total_amount: number;
    average_amount: number;
    max_amount: number;
}

interface Filters {
    range: string;
    start_date: string;
    end_date: string;
}

interface Props {
    filters?: Filters;
    financialSummary?: FinancialSummary;
    paymentChannelStats?: PaymentChannelStat[];
    attributionStats?: AttributionStats;
    stats?: {
        totalDonations: number;
        totalDisbursements: number;
    };
    channelAttributions?: AttributionRow[];
}

export default function ReportIndex({
    filters = { range: 'all', start_date: '', end_date: '' },
    financialSummary = {
        total_gross_donations: 0,
        total_donations_count: 0,
        total_gateway_fees: 0,
        net_collected_donations: 0,
        total_disbursed_gross: 0,
        total_disbursements_count: 0,
        total_platform_fees: 0,
        total_bank_fees: 0,
        total_disbursed_nett: 0,
        internal_disbursed_amount: 0,
        internal_disbursements_count: 0,
        campaigner_disbursed_amount: 0,
        campaigner_disbursements_count: 0,
        escrow_balance: 0,
        period_net_cashflow: 0,
    },
    paymentChannelStats = [],
    attributionStats = {
        direct: { count: 0, amount: 0, percentage: 0 },
        fundraiser: { count: 0, amount: 0, percentage: 0 },
        top_fundraisers: [],
    },
    channelAttributions = [],
}: Props) {
    const [activeTab, setActiveTab] = useState<'cashflow' | 'channels' | 'attribution' | 'marketing' | 'export'>('cashflow');
    const [customDates, setCustomDates] = useState({
        start: filters.start_date || '',
        end: filters.end_date || '',
    });
    const [donationsDates, setDonationsDates] = useState({
        start: filters.start_date || '',
        end: filters.end_date || '',
    });
    const [disbursementsDates, setDisbursementsDates] = useState({
        start: filters.start_date || '',
        end: filters.end_date || '',
    });

    const parseProgramTitle = (title: string | any) => {
        if (!title) return '-';
        if (typeof title === 'object') {
            return title.id || title.en || Object.values(title)[0] || '';
        }
        if (typeof title === 'string' && title.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(title);
                return parsed.id || parsed.en || Object.values(parsed)[0] || title;
            } catch {
                return title;
            }
        }
        return title;
    };

    const handleFilterRange = (range: string) => {
        router.get(
            '/admin/reports',
            { range },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleApplyCustomDates = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customDates.start || !customDates.end) {
            return;
        }

        router.get(
            '/admin/reports',
            {
                start_date: customDates.start,
                end_date: customDates.end,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleExportDonations = () => {
        let url = '/admin/reports/donations/export';
        const params = new URLSearchParams();

        if (donationsDates.start) {
            params.append('start_date', donationsDates.start);
        }

        if (donationsDates.end) {
            params.append('end_date', donationsDates.end);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        window.location.href = url;
    };

    const handleExportDisbursements = () => {
        let url = '/admin/reports/disbursements/export';
        const params = new URLSearchParams();

        if (disbursementsDates.start) {
            params.append('start_date', disbursementsDates.start);
        }

        if (disbursementsDates.end) {
            params.append('end_date', disbursementsDates.end);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        window.location.href = url;
    };

    const getSourceBadge = (source: string) => {
        const lower = source.toLowerCase();

        if (lower.includes('whatsapp')) {
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">WhatsApp</Badge>;
        }
        if (lower.includes('facebook') || lower.includes('fb')) {
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Facebook</Badge>;
        }
        if (lower.includes('instagram') || lower.includes('ig')) {
            return <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">Instagram</Badge>;
        }
        if (lower.includes('telegram')) {
            return <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">Telegram</Badge>;
        }
        if (lower.includes('twitter') || lower.includes('x')) {
            return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300">X (Twitter)</Badge>;
        }
        if (lower.includes('google')) {
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Google</Badge>;
        }

        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{source}</Badge>;
    };

    const rangeButtons = [
        { label: 'Semua Waktu', value: 'all' },
        { label: 'Hari Ini', value: 'today' },
        { label: '7 Hari', value: '7d' },
        { label: '30 Hari', value: '30d' },
        { label: 'Bulan Ini', value: 'this_month' },
        { label: 'Tahun Ini', value: 'this_year' },
    ];

    return (
        <>
            <Head title="Laporan Keuangan & Rekap" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header & Filter Bar */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Laporan Keuangan & Rekap Transaksi
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Rekonsiliasi arus kas donasi, potongan payment gateway, hak operasional lembaga, penyaluran program, dan atribusi relawan.
                            </p>
                        </div>

                        {/* Date Filter Quick Pills */}
                        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold self-start lg:self-auto">
                            {rangeButtons.map((btn) => (
                                <button
                                    key={btn.value}
                                    type="button"
                                    onClick={() => handleFilterRange(btn.value)}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                        filters.range === btn.value
                                            ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Filter Row */}
                    <form
                        onSubmit={handleApplyCustomDates}
                        className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-xs"
                    >
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                            <Calendar className="w-4 h-4 text-[#1A56DB]" />
                            <span>Rentang Tanggal Kustom:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-36">
                                <DatePicker
                                    value={customDates.start}
                                    onChange={(dateStr) => setCustomDates({ ...customDates, start: dateStr })}
                                    placeholder="Dari tanggal"
                                    className="h-8 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                />
                            </div>
                            <span className="text-gray-400">s/d</span>
                            <div className="w-36">
                                <DatePicker
                                    value={customDates.end}
                                    onChange={(dateStr) => setCustomDates({ ...customDates, end: dateStr })}
                                    placeholder="Sampai tanggal"
                                    className="h-8 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-8 px-3 text-xs bg-[#1A56DB] hover:bg-[#1e40af] text-white"
                        >
                            Terapkan Filter
                        </Button>
                        {filters.range === 'custom' && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                Filter Kustom Aktif
                            </span>
                        )}
                    </form>
                </div>

                {/* 5 Financial KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Card 1: Total Donasi Masuk */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Donasi Masuk</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(financialSummary.total_gross_donations)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {financialSummary.total_donations_count.toLocaleString('id-ID')} transaksi lunas
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Potongan Payment Gateway (Midtrans) */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Potongan Midtrans</span>
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                <CreditCard className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(financialSummary.total_gateway_fees)}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Dikelola oleh yayasan</span>
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Pendapatan Hak Lembaga (Fee 5%) */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Hak Lembaga 5%</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Landmark className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(financialSummary.total_platform_fees)}
                            </p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                Operasional platform resmi
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Total Realisasi Penyaluran */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Dana Disalurkan</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1A56DB] dark:text-blue-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(financialSummary.total_disbursed_nett)}
                            </p>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex flex-col gap-0.5">
                                <span>{financialSummary.total_disbursements_count.toLocaleString('id-ID')} penyaluran selesai</span>
                                <span className="text-[10px] text-gray-400">
                                    (Internal: {formatCurrency(financialSummary.internal_disbursed_amount)} • Mitra: {formatCurrency(financialSummary.campaigner_disbursed_amount)})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Saldo Kas Mengendap */}
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-400">Saldo Kas Mengendap</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-amber-900 dark:text-amber-200">
                                {formatCurrency(financialSummary.escrow_balance)}
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                Titipan amanah donatur
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Buttons */}
                <div className="flex items-center flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('cashflow')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'cashflow'
                                ? 'bg-[#1A56DB] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        Arus Kas & Rekonsiliasi
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('channels')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'channels'
                                ? 'bg-[#1A56DB] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        Kanal Pembayaran ({paymentChannelStats.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('attribution')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'attribution'
                                ? 'bg-[#1A56DB] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Atribusi Campaigner vs Relawan Fundraiser
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('marketing')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'marketing'
                                ? 'bg-[#1A56DB] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Pemasaran UTM ({channelAttributions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('export')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'export'
                                ? 'bg-[#1A56DB] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Ekspor Laporan CSV
                    </button>
                </div>

                {/* Tab 1: Arus Kas & Rekonsiliasi */}
                {activeTab === 'cashflow' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Lembar Buku Rekonsiliasi Kas */}
                        <div className="lg:col-span-7 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xs">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Buku Rekonsiliasi Kas Sistem</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Perhitungan terperinci penerimaan donasi, potongan payment gateway, dan realisasi penyaluran.
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    Terekonsiliasi
                                </span>
                            </div>

                            <div className="space-y-4 text-xs">
                                {/* Arus Kas Masuk */}
                                <div>
                                    <p className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px] mb-2">
                                        1. Arus Kas Masuk (Inflow Donasi)
                                    </p>
                                    <div className="space-y-2 bg-gray-50/60 dark:bg-gray-800/40 rounded-lg p-3">
                                        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                            <span>Total Donasi Masuk dari Donatur</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(financialSummary.total_gross_donations)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                                            <span>Potongan Biaya Payment Gateway</span>
                                            <span className="font-semibold">
                                                - {formatCurrency(financialSummary.total_gateway_fees)}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center font-bold text-emerald-700 dark:text-emerald-400">
                                            <span>Kas Bersih Masuk ke Rekening Penampungan</span>
                                            <span>{formatCurrency(financialSummary.net_collected_donations)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Arus Kas Keluar */}
                                <div>
                                    <p className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px] mb-2">
                                        2. Realisasi Penyaluran Program (Outflow)
                                    </p>
                                    <div className="space-y-2 bg-gray-50/60 dark:bg-gray-800/40 rounded-lg p-3">
                                        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                            <span>Total Alokasi Bruto Penyaluran</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(financialSummary.total_disbursed_gross)}
                                            </span>
                                        </div>

                                        {/* Sub-breakdown Internal vs Mitra */}
                                        <div className="pl-3 border-l-2 border-blue-200 dark:border-blue-900 space-y-1.5 my-1.5 text-[11px]">
                                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                                                    <span>Program Mandiri Yayasan (Internal)</span>
                                                    <span className="text-gray-400">({financialSummary.internal_disbursements_count} trx)</span>
                                                </span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(financialSummary.internal_disbursed_amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                                    <span>Program Mitra Penggalang (Campaigner)</span>
                                                    <span className="text-gray-400">({financialSummary.campaigner_disbursements_count} trx)</span>
                                                </span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(financialSummary.campaigner_disbursed_amount)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                                            <span>Alokasi Hak Operasional Lembaga 5% (Khusus Mitra)</span>
                                            <span className="font-semibold">
                                                - {formatCurrency(financialSummary.total_platform_fees)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                                            <span>Biaya Administrasi Transfer Bank BI-Fast</span>
                                            <span className="font-semibold">
                                                - {formatCurrency(financialSummary.total_bank_fees)}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center font-bold text-blue-700 dark:text-blue-400">
                                            <span>Kas Bersih Disalurkan (Netto)</span>
                                            <span>{formatCurrency(financialSummary.total_disbursed_nett)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rekapitulasi Akhir */}
                                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                                        <div className="flex justify-between items-center text-xs text-amber-900 dark:text-amber-300">
                                            <span>Surplus / Defisit Kas Periode Berjalan</span>
                                            <span className="font-bold text-sm">
                                                {formatCurrency(financialSummary.period_net_cashflow)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-amber-900 dark:text-amber-200 pt-1 border-t border-amber-200/60 dark:border-amber-900/40 font-bold">
                                            <span>Saldo Kas Mengendap Saat Ini</span>
                                            <span className="text-base text-amber-700 dark:text-amber-400">
                                                {formatCurrency(financialSummary.escrow_balance)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Catatan Kepatuhan Finansial & Kebijakan Kas */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
                                <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white font-semibold text-sm">
                                    <Info className="w-4 h-4 text-[#1A56DB]" />
                                    <span>Kebijakan Biaya Transaksi & Rekonsiliasi</span>
                                </div>
                                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                                        <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                                            1. Biaya Payment Gateway Dikelola Yayasan
                                        </p>
                                        <p>
                                            Donatur hanya membayar nominal donasi yang dipilih tanpa biaya admin tambahan. Seluruh biaya Midtrans dihitung di backend sesuai metode pembayaran yang dipilih dan dibebankan sebagai biaya transaksi yayasan.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                                        <p className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                                            2. Bagi Hasil Platform (5%)
                                        </p>
                                        <p>
                                            Dipungut secara otomatis saat pencairan program mitra disetujui untuk mendukung operasional lembaga sesuai regulasi izin pengumpulan dana masyarakat (PUB). Program inisiatif mandiri internal yayasan bebas biaya operasional (0%).
                                        </p>
                                    </div>

                                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
                                        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                            3. Biaya Transfer BI-Fast (Rp 2.500)
                                        </p>
                                        <p>
                                            Biaya administrasi transfer antarbank resmi BI-Fast yang dibayarkan ke bank saat mentransfer dana bersih ke rekening penggalang dana.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Kanal Pembayaran */}
                {activeTab === 'channels' && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Performa & Distribusi Kanal Pembayaran</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Rincian volume transaksi, perolehan bruto, potongan payment gateway, dan perolehan bersih per metode.
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1A56DB] dark:bg-blue-950/40 dark:text-blue-400 w-fit">
                                {paymentChannelStats.length} Kanal Aktif
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 text-xs">
                                        <TableHead className="font-semibold">Kanal Pembayaran</TableHead>
                                        <TableHead className="font-semibold">Kategori</TableHead>
                                        <TableHead className="font-semibold text-right">Donasi Berhasil</TableHead>
                                        <TableHead className="font-semibold text-right">Total Donasi Masuk</TableHead>
                                        <TableHead className="font-semibold text-right">Potongan Gateway</TableHead>
                                        <TableHead className="font-semibold text-right">Nominal Bersih</TableHead>
                                        <TableHead className="font-semibold text-right">Rata-rata / Trx</TableHead>
                                        <TableHead className="font-semibold text-right">Pangsa (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentChannelStats.length > 0 ? (
                                        paymentChannelStats.map((item, idx) => (
                                            <TableRow key={`${item.channel_label}-${idx}`} className="text-xs">
                                                <TableCell className="font-semibold text-gray-900 dark:text-white">
                                                    {item.channel_label}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            item.category === 'Transfer Bank Manual'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                                                                : 'bg-blue-50 text-[#1A56DB] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                                                        }
                                                    >
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-gray-700 dark:text-gray-300">
                                                    {item.transactions_count.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(item.gross_amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-rose-600 dark:text-rose-400 font-medium">
                                                    {item.gateway_fee > 0 ? `- ${formatCurrency(item.gateway_fee)}` : 'Rp 0'}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(item.net_amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-600 dark:text-gray-400">
                                                    {formatCurrency(item.average_amount)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-gray-800 dark:text-gray-200">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span>{item.percentage}%</span>
                                                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#1A56DB]"
                                                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-gray-500 text-xs">
                                                Belum ada transaksi pembayaran pada rentang tanggal yang dipilih.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Atribusi Campaigner vs Fundraiser */}
                {activeTab === 'attribution' && (
                    <div className="space-y-6">
                        {/* Perbandingan Langsung vs Relawan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Saluran Langsung (Organik / Campaigner) */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Campaigner Langsung / Organik
                                    </span>
                                    <Badge variant="outline" className="bg-blue-50 text-[#1A56DB] border-blue-200">
                                        Kanal Utama
                                    </Badge>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(attributionStats.direct.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {attributionStats.direct.count.toLocaleString('id-ID')} transaksi donasi
                                        </p>
                                    </div>
                                    <span className="text-xl font-bold text-[#1A56DB]">
                                        {attributionStats.direct.percentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Saluran Relawan (Fundraiser) */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Relawan Fundraiser
                                    </span>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        Kanal Referral
                                    </Badge>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(attributionStats.fundraiser.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {attributionStats.fundraiser.count.toLocaleString('id-ID')} transaksi donasi
                                        </p>
                                    </div>
                                    <span className="text-xl font-bold text-purple-600">
                                        {attributionStats.fundraiser.percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top 10 Fundraisers Leaderboard */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">10 Relawan Penggalang Teratas</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Peringkat relawan dengan kontribusi donasi tertinggi dalam periode ini.
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 w-fit">
                                    {attributionStats.top_fundraisers.length} Relawan Terdaftar
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 text-xs">
                                            <TableHead className="font-semibold w-12 text-center">#</TableHead>
                                            <TableHead className="font-semibold">Nama Relawan</TableHead>
                                            <TableHead className="font-semibold">Kode Referral</TableHead>
                                            <TableHead className="font-semibold">Program Galang Dana</TableHead>
                                            <TableHead className="font-semibold text-right">Donasi Berhasil</TableHead>
                                            <TableHead className="font-semibold text-right">Total Dana Dihimpun</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attributionStats.top_fundraisers.length > 0 ? (
                                            attributionStats.top_fundraisers.map((item, index) => (
                                                <TableRow key={item.fundraiser_id} className="text-xs">
                                                    <TableCell className="text-center font-bold text-gray-500">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                                        <div>
                                                            <p className="font-bold">{item.name}</p>
                                                            <p className="text-[11px] text-gray-400">{item.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[11px] font-mono text-gray-800 dark:text-gray-200">
                                                            {item.referral_code}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                                        <div className="min-w-[200px] max-w-sm">
                                                            <span className="font-medium text-xs leading-relaxed block" title={parseProgramTitle(item.program_title)}>
                                                                {parseProgramTitle(item.program_title)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-gray-700 dark:text-gray-300">
                                                        {item.donations_count.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-[#1A56DB] dark:text-blue-400">
                                                        {formatCurrency(item.total_raised)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                                                    Belum ada transaksi donasi melalui kanal relawan (fundraiser) pada rentang tanggal ini.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: Analitik Pemasaran (UTM) */}
                {activeTab === 'marketing' && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Performa Kanal & Kampanye Pemasaran (UTM)</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Laporan perolehan transaksi donasi berdasarkan parameter UTM iklan dan promosi.
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1A56DB] dark:bg-blue-950/40 dark:text-blue-400 w-fit">
                                {channelAttributions.length} Kombinasi Kampanye
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 text-xs">
                                        <TableHead className="font-semibold">Kanal</TableHead>
                                        <TableHead className="font-semibold">Media</TableHead>
                                        <TableHead className="font-semibold">Nama Kampanye</TableHead>
                                        <TableHead className="font-semibold text-right">Donasi Sukses</TableHead>
                                        <TableHead className="font-semibold text-right">Total Perolehan</TableHead>
                                        <TableHead className="font-semibold text-right">Rata-rata Donasi</TableHead>
                                        <TableHead className="font-semibold text-right">Tertinggi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {channelAttributions.length > 0 ? (
                                        channelAttributions.map((row, index) => (
                                            <TableRow key={`${row.source}-${row.medium}-${row.campaign}-${index}`} className="text-xs">
                                                <TableCell className="font-medium">
                                                    {getSourceBadge(row.source)}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {row.medium}
                                                </TableCell>
                                                <TableCell className="text-gray-800 dark:text-gray-200 font-medium">
                                                    {row.campaign}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {row.transactions_count.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-[#1A56DB] dark:text-blue-400">
                                                    {formatCurrency(row.total_amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-600 dark:text-gray-300">
                                                    {formatCurrency(row.average_amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-600 dark:text-gray-300">
                                                    {formatCurrency(row.max_amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-xs">
                                                Belum ada data atribusi kampanye yang tercatat.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Tab 5: Ekspor Laporan CSV */}
                {activeTab === 'export' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ekspor Donasi */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Ekspor Laporan Donasi & Keuangan</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Unduh data transaksi donasi lengkap dengan kanal pembayaran, potongan Midtrans, nominal bersih, dan info relawan.
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Dari Tanggal</Label>
                                        <DatePicker
                                            value={donationsDates.start}
                                            onChange={(dateStr) => setDonationsDates({ ...donationsDates, start: dateStr })}
                                            placeholder="Dari tanggal..."
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Sampai Tanggal</Label>
                                        <DatePicker
                                            value={donationsDates.end}
                                            onChange={(dateStr) => setDonationsDates({ ...donationsDates, end: dateStr })}
                                            placeholder="Sampai tanggal..."
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-xs h-9"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleExportDonations}
                                    className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white text-xs h-10"
                                >
                                    <Download className="mr-2 h-4 w-4" /> Unduh CSV Donasi Lengkap
                                </Button>
                            </div>
                        </div>

                        {/* Ekspor Pencairan */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Ekspor Laporan Penyaluran Dana</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Unduh data riwayat pencairan dana program lengkap dengan nomor kuitansi, fee 5% lembaga, dan biaya bank BI-Fast.
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Dari Tanggal</Label>
                                        <DatePicker
                                            value={disbursementsDates.start}
                                            onChange={(dateStr) => setDisbursementsDates({ ...disbursementsDates, start: dateStr })}
                                            placeholder="Dari tanggal..."
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Sampai Tanggal</Label>
                                        <DatePicker
                                            value={disbursementsDates.end}
                                            onChange={(dateStr) => setDisbursementsDates({ ...disbursementsDates, end: dateStr })}
                                            placeholder="Sampai tanggal..."
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-xs h-9"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleExportDisbursements}
                                    className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white text-xs h-10"
                                >
                                    <Download className="mr-2 h-4 w-4" /> Unduh CSV Penyaluran
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ReportIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan Keuangan & Rekap',
            href: '/admin/reports',
        },
    ],
};
