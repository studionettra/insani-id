import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Users, 
    Wallet, 
    Target, 
    TrendingUp, 
    Heart, 
    Clock, 
    AlertCircle, 
    ArrowUpRight, 
    PlusCircle, 
    CheckCircle2,
    Compass,
    Sparkles,
    Receipt,
    UserCheck,
    ArrowRight,
    Coins,
    Activity,
    MessageSquare,
    ExternalLink
} from 'lucide-react';
import React from 'react';
import CategoryDonationChart from '@/components/analytics/CategoryDonationChart';
import ConversionFunnelCard from '@/components/analytics/ConversionFunnelCard';
import DonationTrendChart from '@/components/analytics/DonationTrendChart';
import PaymentMethodPieChart from '@/components/analytics/PaymentMethodPieChart';
import RecentTransactionsTable from '@/components/analytics/RecentTransactionsTable';
import UrgentProgramsCard from '@/components/analytics/UrgentProgramsCard';
import UtmSourcePieChart from '@/components/analytics/UtmSourcePieChart';
import DonationProgressBar from '@/components/donation/DonationProgressBar';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
    stats: {
        totalDonations: number;
        donationsThisMonth: number;
        activePrograms: number;
        pendingPrograms: number;
        pendingCampaigners: number;
        totalDonors: number;
        totalDisbursed: number;
        pendingDisbursements: number;
        pendingOfflineDonations: number;
        averageDonation?: number;
        paymentSuccessRate?: number;
        pendingContactMessages?: number;
    };
    analyticsData?: {
        donationTrends: {
            categories: string[];
            amounts: number[];
            counts: number[];
        };
        utmSources: {
            labels: string[];
            series: number[];
            details: Array<{
                name: string;
                raw_source: string;
                count: number;
                amount: number;
            }>;
        };
        paymentMethods?: {
            labels: string[];
            series: number[];
            details: Array<{
                name: string;
                raw_method: string;
                count: number;
                amount: number;
            }>;
        };
        categoryDonations?: {
            labels: string[];
            series: number[];
            details: Array<{
                name: string;
                count: number;
                amount: number;
            }>;
        };
        funnel: {
            totalViews: number;
            totalAttempts: number;
            totalPaid: number;
            conversionRate: number;
        };
        topPrograms: Array<{
            id: number;
            title: string;
            slug: string;
            category?: string;
            collected_amount: number;
            target_amount: number;
            views_count: number;
            donation_count: number;
            conversion_rate: number;
        }>;
        recentTransactions?: Array<{
            id: number;
            donation_code: string;
            donor_name: string;
            amount: number;
            unique_code: number;
            program_title: string;
            program_slug?: string;
            category: string;
            payment_method: string;
            paid_at: string;
            paid_at_formatted?: string;
        }>;
        urgentPrograms?: Array<{
            id: number;
            title: string;
            slug: string;
            category: string;
            collected_amount: number;
            target_amount: number;
            deadline: string;
            days_remaining: number;
            percentage: number;
        }>;
    } | null;
    donorStats?: {
        totalDonated: number;
        paidDonationsCount: number;
        helpedProgramsCount: number;
        pendingCount: number;
        pendingDonations: any[];
        recentDonations: any[];
    } | null;
    campaignerStats?: {
        programsCount: number;
        activeProgramsCount: number;
        totalCollected: number;
        totalDonors: number;
        totalDisbursed: number;
        myPrograms: any[];
    } | null;
    fundraiserStats?: {
        count: number;
        totalCollected: number;
        totalDonors: number;
        fundraisers: any[];
    } | null;
    recentCampaigns: any[];
    recommendedPrograms?: any[];
    userRoleInfo: {
        isAdministrator: boolean;
        isProgramOfficer: boolean;
        isVerifikator: boolean;
        isKeuangan: boolean;
        isCampaigner: boolean;
        isFundraiser?: boolean;
        isDonor?: boolean;
        isStaff?: boolean;
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

const getCategoryName = (category: any): string => {
    if (!category) {
return 'Kategori';
}

    const name = category.name;

    if (!name) {
return 'Kategori';
}

    if (typeof name === 'string') {
return name;
}

    if (typeof name === 'object' && name !== null) {
        if (typeof name.id === 'string' && name.id.trim() !== '') {
            return name.id;
        }

        const values = Object.values(name).filter(v => typeof v === 'string' && v.trim() !== '');

        if (values.length > 0) {
            return values[0] as string;
        }
    }

    return String(name || 'Kategori');
};

const renderStatusBadge = (status: string) => {
    switch (status) {
        case 'published':
        case 'paid':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                    {status === 'paid' ? 'Berhasil' : 'Aktif'}
                </span>
            );
        case 'pending_verification':
        case 'pending':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
                    <Clock className="w-3 h-3 mr-1 inline" />
                    {status === 'pending' ? 'Menunggu Pembayaran' : 'Menunggu Review'}
                </span>
            );
        case 'draft':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    Draft
                </span>
            );
        case 'completed':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60">
                    Selesai
                </span>
            );
        case 'rejected':
        case 'failed':
        case 'expired':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60">
                    {status === 'expired' ? 'Kedaluwarsa' : (status === 'failed' ? 'Gagal' : 'Ditolak')}
                </span>
            );
        default:
            return null;
    }
};

export default function Dashboard({ 
    stats = {} as any, 
    analyticsData,
    donorStats, 
    campaignerStats, 
    fundraiserStats,
    recentCampaigns = [], 
    recommendedPrograms = [], 
    userRoleInfo 
}: Props) {
    const { auth } = usePage().props as any;
    const isDonor = userRoleInfo?.isDonor;
    const isCampaigner = userRoleInfo?.isCampaigner && !userRoleInfo?.isAdministrator;
    const isStaff = userRoleInfo?.isStaff ?? (userRoleInfo?.isAdministrator || userRoleInfo?.isProgramOfficer || userRoleInfo?.isVerifikator || userRoleInfo?.isKeuangan);

    let createProgramUrl = '/buat-program';

    if (userRoleInfo?.isAdministrator || userRoleInfo?.isProgramOfficer) {
        createProgramUrl = '/admin/programs/create';
    } else if (isCampaigner) {
        createProgramUrl = '/akun/programs/create';
    }

    return (
        <>
            <Head title={isDonor ? "Dashboard Donatur" : (isCampaigner ? "Dashboard Penggalang Dana" : "Dashboard")} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 lg:p-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {isDonor 
                                ? 'Dashboard Donatur' 
                                : (isCampaigner ? 'Dashboard Penggalang Dana' : 'Ringkasan Platform Insani')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isDonor ? (
                                <>Selamat datang kembali, <span className="font-semibold text-gray-700 dark:text-gray-200">{auth?.user?.name}</span>. Terima kasih atas kepedulian dan jejak kebaikan yang Anda tebarkan.</>
                            ) : (
                                <>Selamat datang kembali, <span className="font-semibold text-gray-700 dark:text-gray-200">{auth?.user?.name}</span>. Pantau aktivitas kebaikan hari ini.</>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        {isDonor ? (
                            <>
                                <Button asChild variant="outline" className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <Link href="/akun/donasi-saya">
                                        <Wallet className="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" />
                                        Riwayat Donasi
                                    </Link>
                                </Button>
                                <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm h-10 px-5 rounded-xl hover:-translate-y-[1px] transition-all text-xs sm:text-sm">
                                    <Link href="/program">
                                        <Heart className="w-4 h-4 mr-2" />
                                        Jelajah Program
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm h-10 px-5 rounded-xl hover:-translate-y-[1px] transition-all">
                                <Link href={createProgramUrl}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Buat Program Baru
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Queue Notifications / Action Cards for Staff Only */}
                {isStaff && (stats.pendingCampaigners > 0 || stats.pendingPrograms > 0 || stats.pendingDisbursements > 0 || (stats.pendingContactMessages ?? 0) > 0) && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.pendingCampaigners > 0 && (
                            <Link href="/admin/campaigners" className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="text-xs font-semibold">{stats.pendingCampaigners} Campaigner Butuh Verifikasi</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </Link>
                        )}
                        {stats.pendingPrograms > 0 && (
                            <Link href="/admin/programs" className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-300 dark:hover:bg-blue-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span className="text-xs font-semibold">{stats.pendingPrograms} Program Menunggu Review</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </Link>
                        )}
                        {stats.pendingDisbursements > 0 && (
                            <Link href="/admin/disbursements" className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="text-xs font-semibold">Pencairan Dana Menunggu Persetujuan</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </Link>
                        )}
                        {(stats.pendingContactMessages ?? 0) > 0 && (
                            <Link href="/admin/contact-messages" className="flex items-center justify-between p-3.5 bg-purple-50 border border-purple-200/80 rounded-xl text-purple-900 hover:bg-purple-100/70 dark:bg-purple-950/40 dark:border-purple-900/60 dark:text-purple-300 dark:hover:bg-purple-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                    <span className="text-xs font-semibold">{stats.pendingContactMessages} Pesan Kontak Belum Dibaca</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </Link>
                        )}
                    </div>
                )}

                {/* Pending Donation Reminder Banner for Donor */}
                {Boolean(isDonor && (donorStats?.pendingCount ?? 0) > 0) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl dark:bg-amber-950/30 dark:border-amber-900/50 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                                    Anda memiliki {donorStats?.pendingCount} donasi yang belum diselesaikan
                                </h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5">
                                    Segera selesaikan pembayaran untuk menyalurkan kebaikan Anda kepada penerima manfaat.
                                </p>
                            </div>
                        </div>
                        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs">
                            <Link href={donorStats?.pendingDonations?.[0] ? `/donasi/status/${donorStats.pendingDonations[0].donation_code}` : '/akun/donasi-saya'}>
                                Selesaikan Pembayaran
                                <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className={`grid gap-4 ${isStaff ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                    {isDonor ? (
                        <>
                            {/* Donor Metric 1: Total Donasi Saya */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Total Donasi Saya
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {formatCurrency(donorStats?.totalDonated || 0)}
                                </div>
                                <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Donasi terverifikasi
                                </div>
                            </div>

                            {/* Donor Metric 2: Frekuensi Donasi */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Donasi Berhasil
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {(donorStats?.paidDonationsCount || 0).toLocaleString('id-ID')} Kali
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    Transaksi kebaikan sukses
                                </div>
                            </div>

                            {/* Donor Metric 3: Program Terbantu */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Program Terbantu
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {(donorStats?.helpedProgramsCount || 0).toLocaleString('id-ID')} Program
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    Inisiatif yang Anda dukung
                                </div>
                            </div>

                            {/* Donor Metric 4: Menunggu Pembayaran */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        (donorStats?.pendingCount || 0) > 0 
                                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' 
                                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                    }`}>
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Status Tagihan
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {(donorStats?.pendingCount || 0) > 0 ? `${donorStats?.pendingCount} Menunggu` : 'Semua Lunas'}
                                </div>
                                <div className={`flex items-center text-xs font-medium ${
                                    (donorStats?.pendingCount || 0) > 0 
                                        ? 'text-amber-600 dark:text-amber-400' 
                                        : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    {(donorStats?.pendingCount || 0) > 0 
                                        ? 'Perlu diselesaikan' 
                                        : 'Tidak ada pembayaran pending'}
                                </div>
                            </div>
                        </>
                    ) : isCampaigner ? (
                        // Campaigner Metrics (4 cards)
                        <>
                            {/* Metric 1 */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Terkumpul (Program Saya)
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {formatCurrency(campaignerStats?.totalCollected || 0)}
                                </div>
                                <div className="flex items-center text-xs font-medium text-brand-600 dark:text-brand-400">
                                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                    dari donatur terdaftar
                                </div>
                            </div>
                            
                            {/* Metric 2 */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Program Aktif Saya
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {campaignerStats?.activeProgramsCount || 0}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    dari total {campaignerStats?.programsCount || 0} program
                                </div>
                            </div>

                            {/* Metric 3 */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Total Donatur
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {(campaignerStats?.totalDonors || 0).toLocaleString('id-ID')}
                                </div>
                                <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Transaksi terverifikasi
                                </div>
                            </div>

                            {/* Metric 4 */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Penyaluran Dana
                                    </span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {formatCurrency(campaignerStats?.totalDisbursed || 0)}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    Telah ditransfer ke rekening
                                </div>
                            </div>
                        </>
                    ) : (
                        // Staff / Admin Metrics (6 cards)
                        <>
                            {/* Card 1: Total Donasi */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
                                        Total Donasi
                                    </span>
                                </div>
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1 truncate" title={formatCurrency(stats.totalDonations)}>
                                    {formatCurrency(stats.totalDonations)}
                                </div>
                                <div className="flex items-center text-xs font-medium text-brand-600 dark:text-brand-400 truncate">
                                    <TrendingUp className="h-3.5 w-3.5 mr-1 shrink-0" />
                                    <span className="truncate">{formatCurrency(stats.donationsThisMonth)} bln ini</span>
                                </div>
                            </div>

                            {/* Card 2: Program Aktif */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
                                        Program Aktif
                                    </span>
                                </div>
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {stats.activePrograms}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {stats.pendingPrograms} verifikasi
                                </div>
                            </div>

                            {/* Card 3: Total Donatur */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
                                        Total Donatur
                                    </span>
                                </div>
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {(stats.totalDonors || 0).toLocaleString('id-ID')}
                                </div>
                                <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate">
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 shrink-0" />
                                    Donatur aktif
                                </div>
                            </div>

                            {/* Card 4: Penyaluran Dana */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
                                        Penyaluran
                                    </span>
                                </div>
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1 truncate" title={formatCurrency(stats.totalDisbursed)}>
                                    {formatCurrency(stats.totalDisbursed)}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {formatCurrency(stats.pendingDisbursements)} pending
                                </div>
                            </div>

                            {/* Card 5: Rerata Donasi */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Coins className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
                                        Rerata Donasi
                                    </span>
                                </div>
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1 truncate" title={formatCurrency(stats.averageDonation || 0)}>
                                    {formatCurrency(stats.averageDonation || 0)}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Per transaksi sukses
                                </div>
                            </div>

                            {/* Card 6: Rasio Sukses Pembayaran */}
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
                                        Conversion Pay
                                    </span>
                                </div>
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                                    {stats.paymentSuccessRate || 0}%
                                </div>
                                <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 truncate">
                                    Checkout terbayar
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Staff & Admin Interactive Analytics Section */}
                {Boolean(isStaff && analyticsData) && (
                    <div className="space-y-6">
                        {/* 30-Day Trend Chart */}
                        <DonationTrendChart
                            categories={analyticsData!.donationTrends.categories}
                            amounts={analyticsData!.donationTrends.amounts}
                            counts={analyticsData!.donationTrends.counts}
                        />

                        {/* 3-Column Distribution Breakdown: Payment Method, Category Focus, Traffic Attribution */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <PaymentMethodPieChart
                                labels={analyticsData!.paymentMethods?.labels || []}
                                series={analyticsData!.paymentMethods?.series || []}
                                details={analyticsData!.paymentMethods?.details || []}
                            />
                            <CategoryDonationChart
                                labels={analyticsData!.categoryDonations?.labels || []}
                                series={analyticsData!.categoryDonations?.series || []}
                                details={analyticsData!.categoryDonations?.details || []}
                            />
                            <UtmSourcePieChart
                                labels={analyticsData!.utmSources.labels}
                                series={analyticsData!.utmSources.series}
                                details={analyticsData!.utmSources.details}
                            />
                        </div>

                        {/* Conversion Funnel & Top Program Analytics */}
                        <ConversionFunnelCard
                            funnel={analyticsData!.funnel}
                            topPrograms={analyticsData!.topPrograms}
                        />
                    </div>
                )}
                
                {/* Main Content Split */}
                <div className="grid gap-6 lg:grid-cols-3 flex-1 mt-2">
                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {isDonor ? (
                            // Donor: Recent Personal Donations Table
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs">
                                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                            Riwayat Donasi Terbaru
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Daftar donasi dan kontribusi kebaikan yang pernah Anda salurkan.
                                        </p>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-xs">
                                        <Link href="/akun/donasi-saya">
                                            Lihat Semua Donasi
                                        </Link>
                                    </Button>
                                </div>
                                <div className="p-0 overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50/80 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                            <tr>
                                                <th className="px-5 py-3.5 whitespace-nowrap">Program</th>
                                                <th className="px-5 py-3.5 whitespace-nowrap">Tanggal</th>
                                                <th className="px-5 py-3.5 whitespace-nowrap">Nominal</th>
                                                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                                                <th className="px-5 py-3.5 text-right whitespace-nowrap">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {(donorStats?.recentDonations || []).length > 0 ? (
                                                donorStats?.recentDonations.map((donation: any) => {
                                                    const programTitle = getProgramTitle(donation.program?.title);
                                                    const totalAmount = Number(donation.amount) + Number(donation.unique_code || 0);

                                                    return (
                                                        <tr key={donation.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {donation.program?.cover_image ? (
                                                                        <img 
                                                                            src={donation.program.cover_image.startsWith('http') ? donation.program.cover_image : `/storage/${donation.program.cover_image}`} 
                                                                            alt={programTitle} 
                                                                            className="w-14 h-10 rounded-lg aspect-video object-cover border border-gray-200/80 dark:border-gray-700/80 shrink-0 shadow-2xs"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-14 h-10 rounded-lg aspect-video bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                                                                            <Heart className="w-4 h-4" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <Link 
                                                                            href={`/program/${donation.program?.slug || ''}`}
                                                                            className="font-semibold text-gray-900 dark:text-white text-sm hover:text-brand-600 transition-colors line-clamp-1" 
                                                                            title={programTitle}
                                                                        >
                                                                            {programTitle}
                                                                        </Link>
                                                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                                            <span className="font-medium text-gray-600 dark:text-gray-300">{getCategoryName(donation.program?.category)}</span>
                                                                            <span className="text-gray-300 dark:text-gray-700">•</span>
                                                                            <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">{donation.donation_code}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                                                                {formatDate(donation.paid_at || donation.created_at)}
                                                            </td>
                                                            <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white text-sm">
                                                                {formatCurrency(totalAmount)}
                                                            </td>
                                                            <td className="px-5 py-4 whitespace-nowrap">
                                                                {renderStatusBadge(donation.status)}
                                                            </td>
                                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                                <Button 
                                                                    asChild 
                                                                    size="sm" 
                                                                    variant={donation.status === 'pending' ? 'default' : 'outline'}
                                                                    className={`rounded-lg h-8 px-3 text-xs font-semibold ${
                                                                        donation.status === 'pending' 
                                                                            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                                                                            : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                                                                    }`}
                                                                >
                                                                    <Link href={`/donasi/status/${donation.donation_code}`}>
                                                                        {donation.status === 'pending' ? 'Bayar' : 'Detail'}
                                                                    </Link>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-12 text-center">
                                                        <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                                                            <Heart className="w-6 h-6" />
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Belum Ada Riwayat Donasi</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                                            Kebaikan kecil Anda membawa harapan besar. Mari mulai langkah kebaikan pertama hari ini.
                                                        </p>
                                                        <Button asChild className="mt-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-9 px-4 text-xs font-semibold">
                                                            <Link href="/program">
                                                                Mulai Donasi Sekarang
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : isStaff ? (
                            // Staff / Administrator: Recent Verified Transactions in Left Column
                            Boolean(analyticsData?.recentTransactions) && (
                                <RecentTransactionsTable transactions={analyticsData!.recentTransactions!} />
                            )
                        ) : (
                            // Campaigner: Program Saya in Left Column
                            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs">
                                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                            Program Saya
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Daftar program kebaikan yang sedang Anda kelola.
                                        </p>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-xs">
                                        <Link href="/akun/programs">
                                            Lihat Semua Program
                                        </Link>
                                    </Button>
                                </div>
                                <div className="p-0 overflow-x-auto custom-scrollbar">
                                    <table className="w-full min-w-[640px] text-sm text-left">
                                        <thead className="bg-gray-50/80 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                            <tr>
                                                <th className="px-4 sm:px-5 py-3.5">Program</th>
                                                <th className="px-3 sm:px-4 py-3.5 whitespace-nowrap">Target</th>
                                                <th className="px-3 sm:px-4 py-3.5 whitespace-nowrap">Terkumpul</th>
                                                <th className="px-4 sm:px-5 py-3.5 text-right whitespace-nowrap">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {(campaignerStats?.myPrograms || []).length > 0 ? (
                                                campaignerStats.myPrograms.map((program: any) => {
                                                    const hasTarget = Boolean(program?.target_amount && parseFloat(program.target_amount) > 0);
                                                    const progTitle = getProgramTitle(program?.title);

                                                    return (
                                                        <tr key={program.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                                                            <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                                                                <div className="flex items-center gap-3">
                                                                    <Link href={`/akun/programs/${program.id}`} className="shrink-0">
                                                                        {program.cover_image ? (
                                                                            <img 
                                                                                src={program.cover_image.startsWith('http') ? program.cover_image : `/storage/${program.cover_image}`} 
                                                                                alt={progTitle} 
                                                                                className="w-12 h-9 sm:w-14 sm:h-10 rounded-lg aspect-video object-cover border border-gray-200/80 dark:border-gray-700/80 shrink-0 shadow-2xs"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-12 h-9 sm:w-14 sm:h-10 rounded-lg aspect-video bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                                                                                <Target className="w-4 h-4" />
                                                                            </div>
                                                                        )}
                                                                    </Link>
                                                                    <div className="min-w-0 flex-1">
                                                                        <Link 
                                                                            href={`/akun/programs/${program.id}`}
                                                                            className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                                                            title={progTitle}
                                                                        >
                                                                            {progTitle}
                                                                        </Link>
                                                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                                            <span className="font-medium text-gray-600 dark:text-gray-300">{getCategoryName(program?.category)}</span>
                                                                            {program.program_code && (
                                                                                <>
                                                                                    <span className="text-gray-300 dark:text-gray-700">•</span>
                                                                                    <span className="font-mono text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">{program.program_code}</span>
                                                                                </>
                                                                            )}
                                                                            {program.status && program.status !== 'published' && (
                                                                                <>
                                                                                    <span className="text-gray-300 dark:text-gray-700">•</span>
                                                                                    {renderStatusBadge(program.status)}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 sm:px-4 py-3 sm:py-3.5 whitespace-nowrap">
                                                                {hasTarget ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                                                            {formatCurrency(parseFloat(program.target_amount))}
                                                                        </span>
                                                                        <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            {program.deadline ? `Batas: ${formatDate(program.deadline)}` : 'Target Terbuka'}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col">
                                                                        <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                            Tanpa Target
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                                            Fleksibel
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 sm:px-4 py-3 sm:py-3.5 min-w-[130px] sm:min-w-[150px]">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-baseline justify-between gap-2 text-xs">
                                                                        <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                                                            {formatCurrency(program.collected_amount || 0)}
                                                                        </span>
                                                                    </div>
                                                                    <DonationProgressBar
                                                                        collectedAmount={program.collected_amount || 0}
                                                                        targetAmount={program.target_amount}
                                                                        size="xs"
                                                                        percentagePlacement="top-right"
                                                                        percentageFormat="badge"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-right whitespace-nowrap">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <Button asChild variant="outline" size="sm" className="rounded-lg h-7 px-2.5 text-xs font-medium border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                        <Link href={`/program/${program.slug}`} target="_blank">
                                                                            <ExternalLink className="w-3 h-3 mr-1" />
                                                                            Lihat
                                                                        </Link>
                                                                    </Button>
                                                                    <Button asChild size="sm" className="rounded-lg h-7 px-2.5 text-xs font-semibold bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                                                        <Link href={`/akun/programs/${program.id}`}>
                                                                            Detail
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                        Belum ada program yang aktif saat ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                </div>
                    
                    {/* Right Column (1/3) */}
                    <div className="flex flex-col gap-6">
                        {isDonor ? (
                            <>
                                {/* Donor Quick Access */}
                                <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs">
                                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Akses Cepat Donatur</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Navigasi dan aktivitas akun Anda.</p>
                                    </div>
                                    <div className="p-5 flex flex-col gap-2.5">
                                        <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                            <Link href="/program">
                                                <Compass className="w-4 h-4 mr-2.5 text-brand-600 dark:text-brand-400" />
                                                Jelajah Program Kebaikan
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                            <Link href="/akun/donasi-saya">
                                                <Receipt className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                                                Riwayat Donasi & Kuitansi
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                            <Link href="/settings/profile">
                                                <UserCheck className="w-4 h-4 mr-2.5 text-blue-600 dark:text-blue-400" />
                                                Pengaturan Profil Saya
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Urgent / Recommended Programs */}
                                {(recommendedPrograms || []).length > 0 && (
                                    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs">
                                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Program Pilihan</h2>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mari bantu saudara kita yang membutuhkan.</p>
                                            </div>
                                            <Link href="/program" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                                                Lainnya
                                            </Link>
                                        </div>
                                        <div className="p-4 flex flex-col gap-3.5">
                                            {recommendedPrograms.map((rec: any) => {
                                                const recTitle = getProgramTitle(rec.title);

                                                return (
                                                    <div key={rec.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        {rec.cover_image ? (
                                                            <img 
                                                                src={rec.cover_image.startsWith('http') ? rec.cover_image : `/storage/${rec.cover_image}`} 
                                                                alt={recTitle} 
                                                                className="w-16 h-12 rounded-lg aspect-video object-cover border border-gray-200/80 dark:border-gray-700/80 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-12 rounded-lg aspect-video bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                                                                <Heart className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                                                            <Link 
                                                                href={`/program/${rec.slug}`} 
                                                                className="text-xs font-semibold text-gray-900 dark:text-white hover:text-brand-600 line-clamp-1"
                                                                title={recTitle}
                                                            >
                                                                {recTitle}
                                                            </Link>
                                                            <div className="mt-1">
                                                                <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">{formatCurrency(rec.collected_amount || 0)}</span>
                                                                </div>
                                                                <DonationProgressBar
                                                                    collectedAmount={rec.collected_amount || 0}
                                                                    targetAmount={rec.target_amount}
                                                                    size="xs"
                                                                    percentagePlacement="top-right"
                                                                    percentageFormat="badge"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Aktivitas Fundraiser Saya jika ada */}
                                {fundraiserStats && fundraiserStats.count > 0 && (
                                    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-gray-900 p-5 shadow-xs">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                                                Relawan Aktif
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Fundraiser Saya</h3>
                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Terkumpul</span>
                                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(fundraiserStats.totalCollected)}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Donatur Diajak</span>
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{fundraiserStats.totalDonors} orang</span>
                                            </div>
                                        </div>
                                        <div className="mt-3.5 pt-2">
                                            <Link 
                                                href="/akun/fundraiser" 
                                                className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 gap-1"
                                            >
                                                Kelola Tautan & Donatur
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Dua Skema Tawaran Keterlibatan */}
                                <div className="space-y-3">
                                    {/* Skema A: Fundraiser (Instan & Mudah) */}
                                    {(!fundraiserStats || fundraiserStats.count === 0) && (
                                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-gray-900 p-5 shadow-xs">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-xs">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Bantu Sebarkan Kebaikan</h3>
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Instan</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                                Pilih program aktif, dapatkan tautan referral khusus Anda, dan ajak keluarga serta kerabat berdonasi tanpa syarat rumit.
                                            </p>
                                            <div className="mt-3.5">
                                                <Link 
                                                    href="/program" 
                                                    className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 gap-1"
                                                >
                                                    Mulai Jadi Fundraiser
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {/* Skema B: Campaigner (Penggalang Dana Resmi) */}
                                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-gray-900 p-5 shadow-xs">
                                        <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3 shadow-xs">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Punya Inisiatif Sendiri?</h3>
                                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">Verifikasi KYC</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                            Memiliki yayasan sosial atau program kemanusiaan? Ajukan verifikasi identitas untuk membuat penggalangan dana resmi di Insani.
                                        </p>
                                        <div className="mt-3.5">
                                            <Link 
                                                href="/campaigner/register" 
                                                className="inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 gap-1"
                                            >
                                                Daftar Jadi Campaigner
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Campaigner / Admin Quick Access
                            <>
                                {Boolean(isStaff && analyticsData?.urgentPrograms) && (
                                    <UrgentProgramsCard programs={analyticsData!.urgentPrograms!} />
                                )}

                                <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs">
                                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Akses Cepat</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Menu pintas navigasi manajemen.</p>
                                    </div>
                                <div className="p-5 flex flex-col gap-3">
                                    {userRoleInfo?.isAdministrator && (
                                        <>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/donations">
                                                    <Wallet className="w-4 h-4 mr-2.5 text-brand-600 dark:text-brand-400" />
                                                    Manajemen Donasi & Konfirmasi
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/campaigners">
                                                    <Users className="w-4 h-4 mr-2.5 text-blue-600 dark:text-blue-400" />
                                                    Verifikasi Dokumen Campaigner
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/fundraisers">
                                                    <Sparkles className="w-4 h-4 mr-2.5 text-purple-600 dark:text-purple-400" />
                                                    Manajemen Relawan Fundraiser
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/disbursements">
                                                    <Heart className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                                                    Penyaluran & Pencairan Dana
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/reports">
                                                    <TrendingUp className="w-4 h-4 mr-2.5 text-indigo-600 dark:text-indigo-400" />
                                                    Laporan & Ekspor Transaksi
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                    {isCampaigner && (
                                        <>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/akun/programs">
                                                    <Target className="w-4 h-4 mr-2.5 text-brand-600 dark:text-brand-400" />
                                                    Daftar Program Saya
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/akun/programs/create">
                                                    <PlusCircle className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                                                    Buat Program Donasi Baru
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    </div>
                </div>

                {/* Full-Width Section for Staff: Kampanye Sedang Berjalan */}
                {Boolean(isStaff) && (
                    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 shrink-0">
                                    <Target className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                            Kampanye Sedang Berjalan
                                        </h2>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                                            {(recentCampaigns || []).length} Program Aktif
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Program galang dana aktif yang sedang menerima donasi platform.
                                    </p>
                                </div>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-xs gap-1.5 self-start sm:self-auto">
                                <Link href="/admin/programs">
                                    Lihat Semua Program
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </Button>
                        </div>
                        <div className="p-0 overflow-x-auto custom-scrollbar">
                            <table className="w-full min-w-[760px] text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-5 py-3.5 w-[38%]">Program & Kategori</th>
                                        <th className="px-4 py-3.5 whitespace-nowrap w-[20%]">Target Donasi</th>
                                        <th className="px-4 py-3.5 w-[22%]">Capaian Donasi</th>
                                        <th className="px-3 py-3.5 text-center whitespace-nowrap w-[8%]">Status</th>
                                        <th className="px-5 py-3.5 text-right whitespace-nowrap w-[12%]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {(recentCampaigns || []).length > 0 ? (
                                        recentCampaigns.map((program: any) => {
                                            const hasTarget = Boolean(program?.target_amount && parseFloat(program.target_amount) > 0);
                                            const title = getProgramTitle(program?.title);

                                            return (
                                                <tr key={program.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3.5">
                                                            <Link href={`/admin/programs/${program.id}`} className="shrink-0 group">
                                                                {program.cover_image ? (
                                                                    <img 
                                                                        src={program.cover_image.startsWith('http') ? program.cover_image : `/storage/${program.cover_image}`} 
                                                                        alt={title} 
                                                                        className="w-16 h-11 sm:w-20 sm:h-12 rounded-lg aspect-video object-cover border border-gray-200/80 dark:border-gray-700/80 shadow-2xs group-hover:opacity-90 transition-opacity"
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 h-11 sm:w-20 sm:h-12 rounded-lg aspect-video bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                                                        <Target className="w-5 h-5" />
                                                                    </div>
                                                                )}
                                                            </Link>
                                                            <div className="min-w-0 flex-1">
                                                                <Link 
                                                                    href={`/admin/programs/${program.id}`}
                                                                    className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                                                    title={title}
                                                                >
                                                                    {title}
                                                                </Link>
                                                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                                        {getCategoryName(program?.category)}
                                                                    </span>
                                                                    {program.program_code && (
                                                                        <>
                                                                            <span className="text-gray-300 dark:text-gray-700">•</span>
                                                                            <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 tracking-tight">{program.program_code}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {hasTarget ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                                                    {formatCurrency(parseFloat(program.target_amount))}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                                    {program.deadline ? `Batas: ${formatDate(program.deadline)}` : 'Target Terbuka'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                    Tanpa Target
                                                                </span>
                                                                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                                    Fleksibel
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 min-w-[160px]">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-baseline justify-between gap-2 text-xs">
                                                                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                                                                    {formatCurrency(program.collected_amount || 0)}
                                                                </span>
                                                            </div>
                                                            <DonationProgressBar
                                                                collectedAmount={program.collected_amount || 0}
                                                                targetAmount={program.target_amount}
                                                                size="xs"
                                                                percentagePlacement="top-right"
                                                                percentageFormat="badge"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-center whitespace-nowrap">
                                                        {renderStatusBadge(program.status)}
                                                    </td>
                                                    <td className="px-5 py-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button asChild variant="outline" size="sm" className="rounded-lg h-8 px-2.5 text-xs font-medium border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" title="Buka Halaman Publik">
                                                                <Link href={`/program/${program.slug}`} target="_blank">
                                                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                                                    Lihat
                                                                </Link>
                                                            </Button>
                                                            <Button asChild size="sm" className="rounded-lg h-8 px-3 text-xs font-semibold bg-[#1A56DB] hover:bg-[#1e40af] text-white shadow-2xs">
                                                                <Link href={`/admin/programs/${program.id}`}>
                                                                    Kelola
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                                                    <Target className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Belum Ada Program Aktif</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                                    Belum ada program galang dana yang berstatus aktif saat ini.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
