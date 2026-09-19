import { Head, Link, usePage } from '@inertiajs/react';
import { Users, Wallet, Target, TrendingUp, Heart, Clock, AlertCircle, ArrowUpRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import React from 'react';
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
    };
    campaignerStats?: {
        programsCount: number;
        activeProgramsCount: number;
        totalCollected: number;
        totalDonors: number;
        totalDisbursed: number;
        myPrograms: any[];
    } | null;
    recentCampaigns: any[];
    userRoleInfo: {
        isAdministrator: boolean;
        isProgramOfficer: boolean;
        isVerifikator: boolean;
        isKeuangan: boolean;
        isCampaigner: boolean;
    };
}

const getProgramTitle = (title: any): string => {
    if (!title) return 'Program Tanpa Judul';
    if (typeof title === 'string') return title;
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
    if (!category) return 'Kategori';
    const name = category.name;
    if (!name) return 'Kategori';
    if (typeof name === 'string') return name;
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
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
                    Aktif
                </span>
            );
        case 'pending_verification':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
                    Menunggu Review
                </span>
            );
        case 'draft':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    Draft
                </span>
            );
        case 'completed':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60">
                    Selesai
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60">
                    Ditolak
                </span>
            );
        default:
            return null;
    }
};

export default function Dashboard({ stats = {} as any, campaignerStats, recentCampaigns = [], userRoleInfo }: Props) {
    const { auth } = usePage().props as any;
    const isCampaigner = userRoleInfo?.isCampaigner && !userRoleInfo?.isAdministrator;

    let createProgramUrl = '/buat-program';
    if (userRoleInfo?.isAdministrator || userRoleInfo?.isProgramOfficer) {
        createProgramUrl = '/admin/programs/create';
    } else if (isCampaigner) {
        createProgramUrl = '/akun/programs/create';
    }

    return (
        <>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 lg:p-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {isCampaigner ? 'Dashboard Penggalang Dana' : 'Ringkasan Platform Insani'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Selamat datang kembali, <span className="font-semibold text-gray-700 dark:text-gray-200">{auth?.user?.name}</span>. Pantau aktivitas kebaikan hari ini.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm h-10 px-5 rounded-xl hover:-translate-y-[1px] transition-all">
                            <Link href={createProgramUrl}>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Buat Program Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Queue Notifications / Action Cards for Staff */}
                {!isCampaigner && (stats.pendingCampaigners > 0 || stats.pendingPrograms > 0 || stats.pendingDisbursements > 0) && (
                    <div className="grid gap-3 sm:grid-cols-3">
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
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Metric 1 */}
                    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                {isCampaigner ? 'Terkumpul (Program Saya)' : 'Total Donasi Terkumpul'}
                            </span>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                            {formatCurrency(isCampaigner ? (campaignerStats?.totalCollected || 0) : stats.totalDonations)}
                        </div>
                        <div className="flex items-center text-xs font-medium text-brand-600 dark:text-brand-400">
                            <TrendingUp className="h-3.5 w-3.5 mr-1" />
                            {isCampaigner ? 'dari donatur terdaftar' : `${formatCurrency(stats.donationsThisMonth)} bulan ini`}
                        </div>
                    </div>
                    
                    {/* Metric 2 */}
                    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Target className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                {isCampaigner ? 'Program Aktif Saya' : 'Program Aktif'}
                            </span>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                            {isCampaigner ? (campaignerStats?.activeProgramsCount || 0) : stats.activePrograms}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            {isCampaigner ? `dari total ${campaignerStats?.programsCount || 0} program` : `${stats.pendingPrograms} menunggu verifikasi`}
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
                            {(isCampaigner ? (campaignerStats?.totalDonors || 0) : stats.totalDonors).toLocaleString('id-ID')}
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
                            {formatCurrency(isCampaigner ? (campaignerStats?.totalDisbursed || 0) : stats.totalDisbursed)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            {isCampaigner ? 'Telah ditransfer ke rekening' : `${formatCurrency(stats.pendingDisbursements)} menunggu approval`}
                        </div>
                    </div>
                </div>
                
                {/* Main Content Split */}
                <div className="grid gap-6 lg:grid-cols-3 flex-1 mt-2">
                    {/* Active Campaigns Table */}
                    <div className="lg:col-span-2 flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                    {isCampaigner ? 'Program Saya' : 'Kampanye Sedang Berjalan'}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {isCampaigner ? 'Daftar program kebaikan yang sedang Anda kelola.' : 'Program aktif yang sedang menerima donasi platform.'}
                                </p>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-xs">
                                <Link href={isCampaigner ? "/akun/programs" : "/admin/programs"}>
                                    Lihat Semua Program
                                </Link>
                            </Button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-5 py-3.5 whitespace-nowrap">Program</th>
                                        <th className="px-5 py-3.5 whitespace-nowrap">Target Donasi</th>
                                        <th className="px-5 py-3.5 whitespace-nowrap">Terkumpul</th>
                                        <th className="px-5 py-3.5 text-right whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {(isCampaigner ? (campaignerStats?.myPrograms || []) : (recentCampaigns || [])).length > 0 ? (
                                        (isCampaigner ? (campaignerStats?.myPrograms || []) : (recentCampaigns || [])).map((program: any) => {
                                            const hasTarget = Boolean(program?.target_amount && parseFloat(program.target_amount) > 0);
                                            const progress = hasTarget 
                                                ? Math.min(100, Math.round(((program.collected_amount || 0) / parseFloat(program.target_amount)) * 100))
                                                : 0;

                                            return (
                                                <tr key={program.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {program.cover_image ? (
                                                                <img 
                                                                    src={program.cover_image.startsWith('http') ? program.cover_image : `/storage/${program.cover_image}`} 
                                                                    alt={getProgramTitle(program?.title)} 
                                                                    className="w-16 h-10 rounded-lg aspect-video object-cover border border-gray-200/80 dark:border-gray-700/80 shrink-0 shadow-2xs"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-10 rounded-lg aspect-video bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                                                                    <Target className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[200px] sm:max-w-xs md:max-w-sm" title={getProgramTitle(program?.title)}>
                                                                    {getProgramTitle(program?.title)}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                                    <span className="font-medium text-gray-600 dark:text-gray-300">{getCategoryName(program?.category)}</span>
                                                                    {program.program_code && (
                                                                        <>
                                                                            <span className="text-gray-300 dark:text-gray-700">•</span>
                                                                            <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">{program.program_code}</span>
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
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {hasTarget ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {formatCurrency(parseFloat(program.target_amount))}
                                                                </span>
                                                                <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                                    {program.deadline ? `Batas: ${formatDate(program.deadline)}` : 'Target Terbuka'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                    Tanpa Target
                                                                </span>
                                                                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                                    Fleksibel
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 min-w-[170px]">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-baseline justify-between gap-2 text-xs">
                                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                                    {formatCurrency(program.collected_amount || 0)}
                                                                </span>
                                                                {hasTarget ? (
                                                                    <span className="font-semibold text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60">
                                                                        {progress}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                                                        Terkumpul
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {hasTarget ? (
                                                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                                    <div 
                                                                        className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500" 
                                                                        style={{ width: `${progress}%` }} 
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                                                    Penggalangan fleksibel
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button asChild variant="outline" size="sm" className="rounded-lg h-8 px-3 text-xs font-semibold border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                                                <Link href={`/program/${program.slug}`}>
                                                                    Lihat
                                                                </Link>
                                                            </Button>
                                                            {isCampaigner ? (
                                                                <Button asChild variant="ghost" size="sm" className="rounded-lg h-8 px-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/50">
                                                                    <Link href={`/akun/programs/${program.id}`}>
                                                                        Detail
                                                                    </Link>
                                                                </Button>
                                                            ) : (
                                                                <Button asChild variant="ghost" size="sm" className="rounded-lg h-8 px-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/50">
                                                                    <Link href={`/admin/programs/${program.id}`}>
                                                                        Kelola
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
                                            <td colSpan={4} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                Belum ada program yang aktif saat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Quick Access / Information Card */}
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
                </div>
            </div>
        </>
    );
}
