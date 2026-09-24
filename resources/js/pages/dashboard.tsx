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
    ChevronRight,
    Coins,
    Activity,
    MessageSquare,
    ExternalLink,
    CreditCard,
    FileSpreadsheet,
    Building2,
    Landmark,
    WalletCards,
    ShieldCheck,
    FileCheck
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
        disbursedThisMonth?: number;
        pendingDisbursements: number;
        pendingDisbursementsCount?: number;
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
    const permissions: string[] = auth?.user?.permissions || [];
    const isDonor = userRoleInfo?.isDonor;
    const isCampaigner = userRoleInfo?.isCampaigner && !userRoleInfo?.isAdministrator;
    const isKeuangan = userRoleInfo?.isKeuangan;
    const isAdministrator = userRoleInfo?.isAdministrator;
    const isProgramOfficer = userRoleInfo?.isProgramOfficer;
    const isVerifikator = userRoleInfo?.isVerifikator;
    const isStaff = userRoleInfo?.isStaff ?? (isAdministrator || isProgramOfficer || isVerifikator || isKeuangan);
    const hasFinanceAccess = isKeuangan || isAdministrator || permissions.includes('donation.view') || permissions.includes('disbursement.view');
    const canViewAdminPrograms = isAdministrator || isProgramOfficer || permissions.includes('program.view');

    let createProgramUrl = '/buat-program';

    if (isAdministrator || isProgramOfficer) {
        createProgramUrl = '/admin/programs/create';
    } else if (isCampaigner) {
        createProgramUrl = '/akun/programs/create';
    }

    const hasQueueItems = isStaff && (
        ((isAdministrator || (!isKeuangan && permissions.includes('donation.confirm-manual'))) && stats.pendingOfflineDonations > 0) ||
        ((isAdministrator || isKeuangan || permissions.includes('disbursement.approve')) && (stats.pendingDisbursementsCount ?? 0) > 0) ||
        ((isAdministrator || isVerifikator || permissions.includes('campaigner.verify')) && stats.pendingCampaigners > 0) ||
        ((isAdministrator || isProgramOfficer || permissions.includes('program.view')) && stats.pendingPrograms > 0) ||
        ((isAdministrator || permissions.includes('manage_contact_messages')) && (stats.pendingContactMessages ?? 0) > 0)
    );

    return (
        <>
            <Head title={isDonor ? "Dashboard Donatur" : (isCampaigner ? "Dashboard Penggalang Dana" : (isKeuangan && !isAdministrator ? "Dashboard Keuangan" : "Dashboard"))} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 lg:p-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {isDonor 
                                ? 'Dashboard Donatur' 
                                : isCampaigner 
                                    ? 'Dashboard Penggalang Dana' 
                                    : isKeuangan && !isAdministrator
                                        ? 'Dashboard Divisi Keuangan'
                                        : 'Ringkasan Platform Insani'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isDonor ? (
                                <>Selamat datang kembali, <span className="font-semibold text-gray-700 dark:text-gray-200">{auth?.user?.name}</span>. Terima kasih atas kepedulian dan jejak kebaikan yang Anda tebarkan.</>
                            ) : isKeuangan && !isAdministrator ? (
                                <>Selamat datang kembali, <span className="font-semibold text-gray-700 dark:text-gray-200">{auth?.user?.name}</span>. Pantau arus mutasi donasi, verifikasi transfer, dan persetujuan penyaluran dana.</>
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
                        ) : isKeuangan && !isAdministrator ? (
                            <>
                                <Button asChild variant="outline" className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <Link href="/admin/reports">
                                        <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                        Rekap Transaksi
                                    </Link>
                                </Button>
                                <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm h-10 px-5 rounded-xl hover:-translate-y-[1px] transition-all text-xs sm:text-sm">
                                    <Link href="/admin/donations?status=pending">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Konfirmasi Donasi
                                        {stats.pendingOfflineDonations > 0 && (
                                            <span className="ml-2 px-1.5 py-0.5 text-[11px] bg-white text-brand-700 font-bold rounded-full shadow-xs">
                                                {stats.pendingOfflineDonations}
                                            </span>
                                        )}
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
                {Boolean(hasQueueItems) && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Donasi Manual: For CS & Admin (Role Keuangan already has prominent header action) */}
                        {(isAdministrator || (!isKeuangan && permissions.includes('donation.confirm-manual'))) && stats.pendingOfflineDonations > 0 && (
                            <Link href="/admin/donations?status=pending" className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="text-xs font-semibold">{stats.pendingOfflineDonations} Donasi Manual Butuh Verifikasi</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </Link>
                        )}
                        {/* Penyaluran Dana: For Keuangan & Admin */}
                        {(isAdministrator || isKeuangan || permissions.includes('disbursement.approve')) && (stats.pendingDisbursementsCount ?? 0) > 0 && (
                            <Link href="/admin/disbursements" className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <WalletCards className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="text-xs font-semibold">{stats.pendingDisbursementsCount} Pencairan Dana Menunggu Persetujuan</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </Link>
                        )}
                        {/* Campaigner: For Verifikator & Admin */}
                        {(isAdministrator || isVerifikator || permissions.includes('campaigner.verify')) && stats.pendingCampaigners > 0 && (
                            <Link href="/admin/campaigners" className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="text-xs font-semibold">{stats.pendingCampaigners} Campaigner Butuh Verifikasi</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </Link>
                        )}
                        {/* Program: For Program Officer & Admin */}
                        {(isAdministrator || isProgramOfficer || permissions.includes('program.view')) && stats.pendingPrograms > 0 && (
                            <Link href="/admin/programs" className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-300 dark:hover:bg-blue-950/60 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span className="text-xs font-semibold">{stats.pendingPrograms} Program Menunggu Review</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </Link>
                        )}
                        {/* Pesan Kontak: For Customer Service & Admin */}
                        {(isAdministrator || permissions.includes('manage_contact_messages')) && (stats.pendingContactMessages ?? 0) > 0 && (
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
                                    {formatCurrency(stats.pendingDisbursements)} {stats.pendingDisbursementsCount ? `(${stats.pendingDisbursementsCount} pending)` : 'pending'}
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

                {/* Dedicated Financial Shortcuts for Keuangan / Staff with Finance Access */}
                {Boolean(hasFinanceAccess) && (
                    <div className="flex flex-col rounded-2xl border border-gray-200/90 bg-gradient-to-br from-white via-gray-50/50 to-emerald-50/20 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/10 p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800/80">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                                    <WalletCards className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                            Pintasan Operasional Keuangan
                                        </h2>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                                            Akses Cepat
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Alur kerja prioritas: konfirmasi donasi transfer manual, persetujuan penyaluran dana, dan pembukuan laporan.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold rounded-lg border-gray-200 dark:border-gray-700">
                                    <Link href="/admin/reports">
                                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                                        Ekspor Excel
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                            {/* 1. Konfirmasi Donasi Manual */}
                            <Link 
                                href="/admin/donations?status=pending" 
                                className="group relative flex flex-col justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-amber-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900/90 dark:hover:border-amber-700/60 transition-all hover:-translate-y-0.5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:scale-105 transition-transform">
                                            <CreditCard className="h-4.5 w-4.5" />
                                        </div>
                                        {stats.pendingOfflineDonations > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                                                {stats.pendingOfflineDonations} Verifikasi
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                Semua Lunas
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        Konfirmasi Donasi Masuk
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        Validasi struk transfer manual, cek mutasi bank rekening giro, dan setujui donasi.
                                    </p>
                                </div>
                                <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                                    <span>Buka Manajemen Donasi</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            {/* 2. Persetujuan Penyaluran Dana */}
                            <Link 
                                href="/admin/disbursements" 
                                className="group relative flex flex-col justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-emerald-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900/90 dark:hover:border-emerald-700/60 transition-all hover:-translate-y-0.5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                                            <WalletCards className="h-4.5 w-4.5" />
                                        </div>
                                        {(stats.pendingDisbursementsCount ?? 0) > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                                                {stats.pendingDisbursementsCount} Menunggu ACC
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                Tidak Ada Antrean
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        Penyaluran & Pencairan Dana
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        Persetujuan permohonan pencairan program donasi dan upload bukti transfer penyaluran.
                                    </p>
                                </div>
                                <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <span>Review Pengajuan Dana</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            {/* 3. Laporan & Ekspor Transaksi */}
                            <Link 
                                href="/admin/reports" 
                                className="group relative flex flex-col justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-indigo-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900/90 dark:hover:border-indigo-700/60 transition-all hover:-translate-y-0.5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                                            <FileSpreadsheet className="h-4.5 w-4.5" />
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                                            Ekspor CSV/XLS
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        Rekapitulasi & Ekspor Laporan
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        Unduh rekapitulasi transaksi donasi, pencairan dana, dan pembukuan mutasi per rentang tanggal.
                                    </p>
                                </div>
                                <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    <span>Buka Pusat Laporan</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            {/* 4. Publikasi Laporan Keuangan WTP */}
                            <Link 
                                href="/admin/financial-reports" 
                                className="group relative flex flex-col justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-blue-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900/90 dark:hover:border-blue-700/60 transition-all hover:-translate-y-0.5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-105 transition-transform">
                                            <Building2 className="h-4.5 w-4.5" />
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
                                            Transparansi WTP
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        Publikasi Laporan Audit
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        Kelola publikasi Annual Report dan dokumen audit keuangan akuntan publik untuk donatur.
                                    </p>
                                </div>
                                <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    <span>Kelola Laporan Publik</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            {/* 5. Rekening Bank Yayasan */}
                            <Link 
                                href="/admin/bank-accounts" 
                                className="group relative flex flex-col justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-teal-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900/90 dark:hover:border-teal-700/60 transition-all hover:-translate-y-0.5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 group-hover:scale-105 transition-transform">
                                            <Landmark className="h-4.5 w-4.5" />
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50">
                                            Giro Resmi
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                        Rekening Bank Yayasan
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        Kelola daftar rekening bank penerima donasi transfer manual, QRIS statis, dan rekening operasional.
                                    </p>
                                </div>
                                <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                                    <span>Kelola Rekening Bank</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            {/* 6. Analitik Arus Kas & Saluran */}
                            <Link 
                                href="/admin/analytics" 
                                className="group relative flex flex-col justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-purple-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900/90 dark:hover:border-purple-700/60 transition-all hover:-translate-y-0.5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-105 transition-transform">
                                            <Activity className="h-4.5 w-4.5" />
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/50">
                                            Real-time
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        Analitik Saluran & Transaksi
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        Statistik metode pembayaran (QRIS, VA, Transfer Manual), tingkat kesuksesan, dan tren konversi.
                                    </p>
                                </div>
                                <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    <span>Lihat Analitik Keuangan</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

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
                            <>
                                {/* Donor: Recent Personal Donations Table */}
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

                                {/* Dua Skema Tawaran Keterlibatan: Fundraiser & Campaigner */}
                                <div className="flex flex-col gap-3.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                Tingkatkan Peran Kebaikan Anda
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                Selain berdonasi, Anda dapat melipatgandakan dampak manfaat melalui dua pilihan peran di bawah ini.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Card 1: Fundraiser (Instan & Mudah) atau Widget Fundraiser Aktif */}
                                        {fundraiserStats && fundraiserStats.count > 0 ? (
                                            <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white dark:border-emerald-800/60 dark:from-emerald-950/30 dark:via-gray-900 dark:to-gray-900 p-5 shadow-xs flex flex-col justify-between group">
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                            <Sparkles className="w-5 h-5" />
                                                        </div>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                                            Relawan Aktif
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Fundraiser Saya</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Aktivitas referral kebaikan Anda yang sedang berjalan.
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-emerald-100 dark:border-emerald-900/40">
                                                        <div className="bg-white/80 dark:bg-gray-800/60 p-2.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30">
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider block">Terkumpul</span>
                                                            <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block truncate">{formatCurrency(fundraiserStats.totalCollected)}</span>
                                                        </div>
                                                        <div className="bg-white/80 dark:bg-gray-800/60 p-2.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30">
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider block">Donatur Diajak</span>
                                                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">{fundraiserStats.totalDonors} orang</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-1">
                                                    <Button asChild size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs">
                                                        <Link href="/akun/fundraiser" className="inline-flex items-center justify-center gap-1.5">
                                                            Kelola Tautan & Donatur
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white dark:border-emerald-800/60 dark:from-emerald-950/30 dark:via-gray-900 dark:to-gray-900 p-5 shadow-xs flex flex-col justify-between group">
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                            <Sparkles className="w-5 h-5" />
                                                        </div>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                                            Instan & Mudah
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Bantu Sebarkan Kebaikan</h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                                                        Pilih program aktif, dapatkan tautan referral khusus Anda, dan ajak keluarga serta kerabat berdonasi tanpa syarat rumit.
                                                    </p>
                                                </div>
                                                <div className="mt-5">
                                                    <Button asChild size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs">
                                                        <Link href="/program" className="inline-flex items-center justify-center gap-1.5">
                                                            Mulai Jadi Fundraiser
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Card 2: Campaigner (Penggalang Dana Resmi) */}
                                        <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-white dark:border-blue-800/60 dark:from-blue-950/30 dark:via-gray-900 dark:to-gray-900 p-5 shadow-xs flex flex-col justify-between group">
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                                                        <Target className="w-5 h-5" />
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/90 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                                        Verifikasi KYC
                                                    </span>
                                                </div>
                                                <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Punya Inisiatif Sendiri?</h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                                                    Memiliki yayasan sosial atau program kemanusiaan? Ajukan verifikasi identitas resmi untuk membuat penggalangan dana di platform Insani.
                                                </p>
                                            </div>
                                            <div className="mt-5">
                                                <Button asChild size="sm" className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs">
                                                    <Link href="/campaigner/register" className="inline-flex items-center justify-center gap-1.5">
                                                        Daftar Jadi Campaigner
                                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
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
                                                campaignerStats?.myPrograms?.map((program: any) => {
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
                                        <Button asChild variant="outline" className="group justify-between h-11 px-3.5 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:bg-gray-800 transition-all">
                                            <Link href="/program" className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mr-2.5">
                                                        <Compass className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span>Jelajah Program Kebaikan</span>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="group justify-between h-11 px-3.5 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:bg-gray-800 transition-all">
                                            <Link href="/akun/donasi-saya" className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-2.5">
                                                        <Receipt className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span>Riwayat Donasi & Kuitansi</span>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="group justify-between h-11 px-3.5 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:bg-gray-800 transition-all">
                                            <Link href="/settings/profile" className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2.5">
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span>Pengaturan Profil Saya</span>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 group-hover:translate-x-0.5 transition-all" />
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
                                    {isKeuangan && !isAdministrator && (
                                        <>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/donations" className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <CreditCard className="w-4 h-4 mr-2.5 text-amber-600 dark:text-amber-400" />
                                                        <span>Konfirmasi Donasi Masuk</span>
                                                    </div>
                                                    {stats.pendingOfflineDonations > 0 && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                                            {stats.pendingOfflineDonations}
                                                        </span>
                                                    )}
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/disbursements" className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <WalletCards className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                                                        <span>Penyaluran & Pencairan</span>
                                                    </div>
                                                    {(stats.pendingDisbursementsCount ?? 0) > 0 && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                                            {stats.pendingDisbursementsCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/reports">
                                                    <FileSpreadsheet className="w-4 h-4 mr-2.5 text-indigo-600 dark:text-indigo-400" />
                                                    Laporan & Ekspor Transaksi
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/financial-reports">
                                                    <Building2 className="w-4 h-4 mr-2.5 text-blue-600 dark:text-blue-400" />
                                                    Publikasi Laporan Audit WTP
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/bank-accounts">
                                                    <Landmark className="w-4 h-4 mr-2.5 text-teal-600 dark:text-teal-400" />
                                                    Rekening Bank Yayasan
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/analytics">
                                                    <Activity className="w-4 h-4 mr-2.5 text-purple-600 dark:text-purple-400" />
                                                    Analitik Saluran & Transaksi
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                    {userRoleInfo?.isAdministrator && (
                                        <>
                                            <Button asChild variant="outline" className="justify-start h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                                                <Link href="/admin/donations" className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <CreditCard className="w-4 h-4 mr-2.5 text-brand-600 dark:text-brand-400" />
                                                        <span>Manajemen Donasi & Konfirmasi</span>
                                                    </div>
                                                    {stats.pendingOfflineDonations > 0 && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                                            {stats.pendingOfflineDonations}
                                                        </span>
                                                    )}
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
                                                <Link href="/admin/disbursements" className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <Heart className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                                                        <span>Penyaluran & Pencairan Dana</span>
                                                    </div>
                                                    {(stats.pendingDisbursementsCount ?? 0) > 0 && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                                            {stats.pendingDisbursementsCount}
                                                        </span>
                                                    )}
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
                                <Link href={canViewAdminPrograms ? "/admin/programs" : "/program"}>
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
                                                            <Link href={canViewAdminPrograms ? `/admin/programs/${program.id}` : `/program/${program.slug}`} className="shrink-0 group">
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
                                                                    href={canViewAdminPrograms ? `/admin/programs/${program.id}` : `/program/${program.slug}`}
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
                                                            {canViewAdminPrograms ? (
                                                                <Button asChild size="sm" className="rounded-lg h-8 px-3 text-xs font-semibold bg-[#1A56DB] hover:bg-[#1e40af] text-white shadow-2xs">
                                                                    <Link href={`/admin/programs/${program.id}`}>
                                                                        Kelola
                                                                    </Link>
                                                                </Button>
                                                            ) : (
                                                                <Button asChild size="sm" className="rounded-lg h-8 px-3 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-2xs">
                                                                    <Link href={`/program/${program.slug}`}>
                                                                        Detail
                                                                    </Link>
                                                                </Button>
                                                            )}
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
