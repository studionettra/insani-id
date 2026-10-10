import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as dateId } from 'date-fns/locale/id';
import DOMPurify from 'dompurify';
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    Building2,
    Calendar,
    CheckCircle,
    CheckCircle2,
    Edit,
    ExternalLink,
    Eye,
    FileText,
    HandCoins,
    Info,
    Languages,
    Megaphone,
    Plus,
    Printer,
    ReceiptText,
    RefreshCcw,
    ShieldCheck,
    User,
    Wallet,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import DonationProgressBar from '@/components/donation/DonationProgressBar';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate, getLocalizedValue } from '@/lib/utils';

interface Program {
    id: number;
    title: any;
    slug?: string;
    program_code: string;
    category: any;
    campaigner_type: string;
    creator: { name: string; email: string; phone: string };
    campaignerProfile?: { institution_name: string; pic_name: string; type: string };
    collected_amount: number;
    target_amount: string | null;
    status: string;
    published_at: string | null;
    deadline: string | null;
    story: any;
    cover_image: string;
    video_url: string | null;
    rejection_notes: string | null;
    created_by: number;
    views_count?: number;
    created_at?: string;
    title_translations?: { id?: string; en?: string; ar?: string };
    story_translations?: { id?: string; en?: string; ar?: string };
    financial_metrics?: {
        total_collected: number;
        total_gateway_fees: number;
        total_disbursed: number;
        available_balance: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
    };
    disbursements?: Array<any>;
    updates?: Array<{
        id: number;
        title: string;
        content: string;
        is_published: boolean;
        created_at: string;
    }>;
}

interface Props {
    program: Program;
}

const AdminProgramUpdateCard = ({ update, programId }: { update: any; programId: number }) => {
    const [expanded, setExpanded] = useState(false);

    let formattedDate = '';
    try {
        formattedDate = format(new Date(update.created_at), 'd MMMM yyyy HH:mm', { locale: dateId });
    } catch {
        formattedDate = formatDate(update.created_at);
    }

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-brand-500/30 transition-all bg-white dark:bg-gray-900/90 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    {update.is_published ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] py-0 border-emerald-200 dark:border-emerald-800">
                            Terbit
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] py-0 border-amber-200 dark:border-amber-800">
                            Draf
                        </Badge>
                    )}
                    <Button asChild variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40">
                        <Link href={`/admin/programs/${programId}/updates`}>
                            Kelola
                        </Link>
                    </Button>
                </div>
            </div>

            <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-3 leading-snug">
                {getLocalizedValue(update.title)}
            </h4>

            <div className="relative">
                <div
                    className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-img:max-w-full prose-img:h-auto prose-img:rounded-md break-words overflow-hidden transition-all duration-300 ${expanded ? '' : 'max-h-40'}`}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getLocalizedValue(update.content)) }}
                />
                {!expanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                )}
            </div>

            <div className="mt-3 text-center">
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="text-brand-600 dark:text-brand-400 font-medium text-sm hover:underline focus:outline-none cursor-pointer"
                >
                    {expanded ? 'Tutup' : 'Baca Selengkapnya'}
                </button>
            </div>
        </div>
    );
};

export default function ProgramShow({ program }: Props) {
    const { errors, auth } = usePage().props as any;
    const isCreator = Boolean(auth?.user?.id && Number(program.created_by) === Number(auth.user.id));
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    // Initial tab determination: check query param first, then fallback based on context
    const getInitialTab = (): 'finances' | 'story' | 'updates' => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'finances' || tabParam === 'story' || tabParam === 'updates') {
                return tabParam;
            }
        }
        if (program.status === 'pending_verification') {
            return 'story';
        }
        return 'finances';
    };

    const [activeTab, setActiveTab] = useState<'finances' | 'story' | 'updates'>(getInitialTab);

    const handleTabChange = (tab: 'finances' | 'story' | 'updates') => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing, errors: rejectErrors } = useForm({
        _method: 'put',
        status: 'rejected',
        rejection_notes: '',
    });

    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [previewLocale, setPreviewLocale] = useState<'id' | 'en' | 'ar'>('id');
    const [isTranslating, setIsTranslating] = useState(false);

    const hasId = Boolean(program.title_translations?.id || (typeof program.title === 'string' && program.title));
    const hasEn = Boolean(program.title_translations?.en && program.story_translations?.en);
    const hasAr = Boolean(program.title_translations?.ar && program.story_translations?.ar);

    const handleTranslate = () => {
        setIsTranslating(true);
        router.post(`/admin/programs/${program.id}/translate`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Penerjemahan program sedang diproses di antrean.');
            },
            onError: () => {
                toast.error('Gagal memicu penerjemahan program.');
            },
            onFinish: () => {
                setIsTranslating(false);
            },
        });
    };

    const currentTitle = program.title_translations?.[previewLocale]
        || (previewLocale === 'id' ? (typeof program.title === 'string' ? program.title : getLocalizedValue(program.title)) : '');

    const currentStory = program.story_translations?.[previewLocale]
        || (previewLocale === 'id' ? (typeof program.story === 'string' ? program.story : getLocalizedValue(program.story)) : '');

    const handleApproveConfirm = () => {
        setIsUpdatingStatus(true);
        router.put(`/admin/programs/${program.id}/status`, {
            status: 'published',
        }, {
            onFinish: () => {
                setIsUpdatingStatus(false);
                setIsApproveConfirmOpen(false);
            },
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postReject(`/admin/programs/${program.id}/status`, {
            onSuccess: () => setIsRejectModalOpen(false),
        });
    };

    const handleCloseConfirm = () => {
        setIsUpdatingStatus(true);
        router.put(`/admin/programs/${program.id}/status`, {
            status: 'closed_manual',
        }, {
            onFinish: () => {
                setIsUpdatingStatus(false);
                setIsCloseConfirmOpen(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/30 border-0 font-medium">Aktif</Badge>;
            case 'pending_verification':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-inset ring-yellow-600/20 dark:ring-amber-500/30 border-0 font-medium">Menunggu Verifikasi</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/30 border-0 font-medium">Selesai</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-inset ring-red-600/10 dark:ring-red-500/30 border-0 font-medium">Ditolak</Badge>;
            case 'draft':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ring-1 ring-inset ring-gray-600/20 dark:ring-gray-700 border-0 font-medium">Draft</Badge>;
            case 'closed_manual':
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20 dark:ring-orange-500/30 border-0 font-medium">Ditutup Manual</Badge>;
            default:
                return <Badge variant="outline" className="font-medium">{status}</Badge>;
        }
    };

    const getCampaignerBadge = () => {
        if (program.campaigner_type === 'internal') {
            return (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-medium">
                    <Building2 className="w-3 h-3 mr-1" /> Internal Yayasan
                </Badge>
            );
        }
        if (program.campaigner_type === 'lembaga' || program.campaignerProfile?.type === 'lembaga') {
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-medium">
                    <Building2 className="w-3 h-3 mr-1" /> Mitra Lembaga
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium">
                <User className="w-3 h-3 mr-1" /> Mitra Individu
            </Badge>
        );
    };

    return (
        <>
            <Head title={`Detail Program: ${getLocalizedValue(program.title)}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Back Button */}
                <div>
                    <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Link href="/admin/programs">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Manajemen Program
                        </Link>
                    </Button>
                </div>

                {errors.status && (
                    <div className="p-4 bg-yellow-50 dark:bg-amber-950/30 border border-yellow-200 dark:border-amber-900/50 text-yellow-800 dark:text-amber-200 rounded-xl flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{errors.status}</p>
                    </div>
                )}

                {/* Header Utama & Action Bar Terpadu */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            {getStatusBadge(program.status)}
                            {getCampaignerBadge()}
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-md font-semibold">
                                {program.program_code}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
                            {getLocalizedValue(program.title)}
                        </h1>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 self-start lg:self-auto">
                        {program.slug && (
                            <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <a href={`/program/${program.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-1.5" /> Lihat Publik
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Link href={`/admin/programs/${program.id}/edit`}>
                                <Edit className="w-4 h-4 mr-1.5" /> Edit Program
                            </Link>
                        </Button>
                        {program.status === 'published' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300"
                                onClick={() => setIsCloseConfirmOpen(true)}
                            >
                                <Ban className="w-4 h-4 mr-1.5" /> Tutup Program (Manual)
                            </Button>
                        )}
                    </div>
                </div>

                {/* Top Metrics Ribbon (4 Kartu Ringkas) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1: Total Donasi Masuk & Progress Bar */}
                    <div className="p-4.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Donasi Masuk</span>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatCurrency(program.financial_metrics?.total_collected ?? program.collected_amount)}
                            </p>
                        </div>
                        <div className="mt-3">
                            <DonationProgressBar
                                collectedAmount={program.collected_amount}
                                targetAmount={program.target_amount}
                                size="xs"
                                percentagePlacement="top-right"
                                percentageFormat="badge"
                            />
                        </div>
                    </div>

                    {/* Stat 2: Sisa Kas Tersedia (Available Balance) */}
                    <div className="p-4.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                                Sisa Kas Tersedia
                            </span>
                            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                                <Wallet className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                                {formatCurrency(program.financial_metrics?.available_balance ?? 0)}
                            </p>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                {program.campaigner_type === 'internal' ? 'Bebas potongan fee platform' : 'Tersedia untuk dicairkan'}
                            </span>
                        </div>
                    </div>

                    {/* Stat 3: Total Telah Disalurkan */}
                    <div className="p-4.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Telah Disalurkan</span>
                            <span className="text-xs text-gray-400">{program.disbursements?.length || 0} termin</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {formatCurrency(program.financial_metrics?.total_disbursed ?? 0)}
                            </p>
                            <span className="text-[11px] text-gray-400">Realisasi transfer lapangan</span>
                        </div>
                    </div>

                    {/* Stat 4: Kabar & Dokumentasi */}
                    <div className="p-4.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Laporan Penyaluran</span>
                            <Megaphone className="w-4 h-4 text-[#1A56DB] dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {program.updates?.length || 0} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Kabar</span>
                            </p>
                            <span className="text-[11px] text-gray-400">Dokumentasi transparansi donatur</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout (2 Columns) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Tabbed Content (8 cols) */}
                    <div className="xl:col-span-8 space-y-4">
                        {/* Tab Navigation Pill Bar */}
                        <div className="flex items-center flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                            <button
                                type="button"
                                onClick={() => handleTabChange('finances')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'finances'
                                        ? 'bg-[#1A56DB] text-white shadow-xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Wallet className="w-4 h-4" />
                                <span>Keuangan & Penyaluran Kas</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('story')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'story'
                                        ? 'bg-[#1A56DB] text-white shadow-xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>Konten & Cerita Program</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('updates')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'updates'
                                        ? 'bg-[#1A56DB] text-white shadow-xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Megaphone className="w-4 h-4" />
                                <span>Kabar & Dokumentasi ({program.updates?.length || 0})</span>
                            </button>
                        </div>

                        {/* TAB 1: KEUANGAN & PENYALURAN KAS */}
                        {activeTab === 'finances' && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                                <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Keuangan & Penyaluran Kas Program
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Rekonsiliasi donasi masuk, realisasi penyaluran, dan sisa kas amanah
                                            </p>
                                        </div>
                                    </div>

                                    {program.campaigner_type === 'internal' && (
                                        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs self-start sm:self-auto">
                                            <Link href={`/admin/programs/${program.id}/disbursements/create`}>
                                                <HandCoins className="w-4 h-4 mr-1.5" /> Salurkan Dana Program
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* 4 Financial Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Donasi Masuk</span>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                                {formatCurrency(program.financial_metrics?.total_collected ?? program.collected_amount)}
                                            </p>
                                            <span className="text-[11px] text-gray-400">Penerimaan donatur</span>
                                        </div>

                                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Biaya Transaksi Digital</span>
                                            <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                                                - {formatCurrency(program.financial_metrics?.total_gateway_fees ?? 0)}
                                            </p>
                                            <span className="text-[11px] text-gray-400">Potongan gateway BI</span>
                                        </div>

                                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Telah Disalurkan</span>
                                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                                                {formatCurrency(program.financial_metrics?.total_disbursed ?? 0)}
                                            </p>
                                            <span className="text-[11px] text-gray-400">{program.disbursements?.length || 0} termin pencairan</span>
                                        </div>

                                        <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                                                    Sisa Kas Tersedia
                                                </span>
                                                <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                                                    <Wallet className="w-3 h-3" />
                                                </div>
                                            </div>
                                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                                                {formatCurrency(program.financial_metrics?.available_balance ?? 0)}
                                            </p>
                                            <span className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90">Saldo kas amanah program</span>
                                        </div>
                                    </div>

                                    {/* Riwayat Penyaluran Dana Tabel */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                                <ReceiptText className="w-4 h-4 text-gray-500" />
                                                <span>Riwayat Penyaluran Dana Program</span>
                                            </h4>
                                            <span className="text-xs text-gray-500">
                                                Total: {program.disbursements?.length || 0} Penyaluran
                                            </span>
                                        </div>

                                        {(!program.disbursements || program.disbursements.length === 0) ? (
                                            <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30">
                                                <Wallet className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Belum ada riwayat pencairan atau penyaluran dana
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                                    {program.campaigner_type === 'internal'
                                                        ? 'Dana kas yang terkumpul dapat disalurkan secara bertahap sesuai kebutuhan operasional dan RAB lapangan.'
                                                        : 'Penyaluran dana untuk program mitra akan tercatat di sini setelah campaigner mengajukan pencairan dan disetujui.'}
                                                </p>
                                                {program.campaigner_type === 'internal' && ((program.financial_metrics?.available_balance ?? 0) > 0) && (
                                                    <Button asChild size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                                                        <Link href={`/admin/programs/${program.id}/disbursements/create`}>
                                                            <HandCoins className="w-4 h-4 mr-1.5" /> Salurkan Dana Program Sekarang
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold">Tgl / No. Kuitansi</th>
                                                            <th className="px-4 py-3 font-semibold">Keperluan & Target</th>
                                                            <th className="px-4 py-3 font-semibold">Rekening Penerima</th>
                                                            <th className="px-4 py-3 font-semibold text-right">Nominal</th>
                                                            <th className="px-4 py-3 font-semibold text-center">Status</th>
                                                            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                        {program.disbursements.map((d: any) => (
                                                            <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="font-mono font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 text-[11px] block w-fit">
                                                                        {d.receipt_number || `#${d.id}`}
                                                                    </span>
                                                                    <span className="text-[11px] text-gray-400 mt-1 block">
                                                                        {d.transferred_at ? formatDate(d.transferred_at) : formatDate(d.created_at)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 max-w-xs">
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                        {d.distribution_plan || '-'}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                                                        {d.beneficiary_target ? `Target: ${d.beneficiary_target}` : ''} {d.location ? `• ${d.location}` : ''}
                                                                    </p>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                        {d.bank_account_name || '-'}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-400 font-mono">
                                                                        {d.bank_name} - {d.bank_account_number}
                                                                    </p>
                                                                </td>
                                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                                                        {formatCurrency(d.nett_amount ?? d.requested_amount)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                                    {d.status === 'transferred' ? (
                                                                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px]">
                                                                            Ditransfer
                                                                        </Badge>
                                                                    ) : d.status === 'approved' ? (
                                                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 text-[10px]">
                                                                            Disetujui
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px]">
                                                                            {d.status}
                                                                        </Badge>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300">
                                                                            <Link href={`/admin/disbursements/${d.id}/receipt`} target="_blank">
                                                                                <Printer className="w-3.5 h-3.5 mr-1" /> Kuitansi
                                                                            </Link>
                                                                        </Button>
                                                                        <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs">
                                                                            <Link href={`/admin/disbursements/${d.id}`}>
                                                                                Detail
                                                                            </Link>
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KONTEN & CERITA PROGRAM */}
                        {activeTab === 'story' && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                                <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#1A56DB]" />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Informasi Konten & Cerita
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-transparent dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewLocale('id')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                                previewLocale === 'id'
                                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-semibold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            🇮🇩 ID
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewLocale('en')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                                previewLocale === 'en'
                                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-semibold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            🇬🇧 EN {hasEn ? '✓' : ''}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewLocale('ar')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                                previewLocale === 'ar'
                                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-semibold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            🇸🇦 AR {hasAr ? '✓' : ''}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <img
                                            src={`/storage/${program.cover_image}`}
                                            alt={getLocalizedValue(program.title)}
                                            className="w-full h-64 sm:h-[380px] object-cover rounded-xl border border-gray-100 dark:border-gray-800"
                                        />
                                    </div>

                                    <h2
                                        dir={previewLocale === 'ar' ? 'rtl' : 'ltr'}
                                        className={`text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight ${
                                            previewLocale === 'ar' ? 'text-right font-arabic' : 'text-left'
                                        }`}
                                    >
                                        {currentTitle || (
                                            <span className="text-gray-400 dark:text-gray-500 italic font-normal">
                                                (Judul belum diterjemahkan ke {previewLocale === 'en' ? 'Bahasa Inggris' : 'Bahasa Arab'})
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 font-mono text-xs tracking-wide">
                                        Kode Program: {program.program_code}
                                    </p>

                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Cerita Program</h4>
                                        {currentStory ? (
                                            <div
                                                dir={previewLocale === 'ar' ? 'rtl' : 'ltr'}
                                                className={`prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-[#1A56DB] dark:prose-a:text-blue-400 prose-headings:text-gray-900 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-img:max-w-full prose-img:h-auto prose-img:rounded-md prose-img:mx-auto prose-li:marker:text-gray-400 dark:prose-li:marker:text-gray-500 break-words overflow-hidden ${
                                                    previewLocale === 'ar' ? 'text-right font-arabic' : 'text-left prose-p:text-justify'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentStory) }}
                                            />
                                        ) : (
                                            <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                                                <Languages className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                                    Belum ada terjemahan cerita dalam {previewLocale === 'en' ? 'Bahasa Inggris (EN)' : 'Bahasa Arab (AR)'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                                                    Program ini belum memiliki teks terjemahan cerita. Anda dapat memicu proses translasi otomatis kapan saja.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleTranslate}
                                                    disabled={isTranslating}
                                                    className="bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-950/50 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 shadow-xs"
                                                >
                                                    <RefreshCcw className={`w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400 ${isTranslating ? 'animate-spin' : ''}`} />
                                                    {isTranslating ? 'Memproses Terjemahan...' : 'Terjemahkan ke EN & AR Sekarang'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: KABAR & DOKUMENTASI PENYALURAN */}
                        {activeTab === 'updates' && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                                <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
                                            <Megaphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Kabar & Cerita Penyaluran
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Laporan perkembangan lapangan dan transparansi donasi ({program.updates?.length || 0} kabar)
                                            </p>
                                        </div>
                                    </div>

                                    <Button asChild size="sm" className="bg-[#1A56DB] hover:bg-[#1e40af] text-white shadow-xs self-start sm:self-auto">
                                        <Link href={`/admin/programs/${program.id}/updates`}>
                                            <Plus className="w-4 h-4 mr-1.5" /> Kelola & Tambah Kabar
                                        </Link>
                                    </Button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {!isCreator && program.campaigner_type !== 'internal' && (
                                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div className="text-xs leading-relaxed">
                                                <p className="font-bold text-amber-950 dark:text-amber-100 mb-0.5">Pengelolaan Kabar Mandiri</p>
                                                Program ini dibuat oleh Campaigner <strong className="text-amber-950 dark:text-amber-100">{program.creator?.name || 'Eksternal'}</strong>. Sesuai kebijakan integritas platform, kabar terbaru dan laporan penyaluran dikelola secara independen oleh Campaigner yang bersangkutan.
                                            </div>
                                        </div>
                                    )}

                                    {(!program.updates || program.updates.length === 0) ? (
                                        <div className="text-center py-10 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                            <Megaphone className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Belum ada kabar penyaluran yang diterbitkan
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                                                Dokumentasi penyaluran donasi meningkatkan transparansi dan kepercayaan donatur di halaman publik.
                                            </p>
                                            <Button asChild variant="outline" size="sm" className="border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40">
                                                <Link href={`/admin/programs/${program.id}/updates`}>
                                                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Kabar Sekarang
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {program.updates.map((update: any) => (
                                                <AdminProgramUpdateCard key={update.id} update={update} programId={program.id} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Unified Sidebar (4 cols) */}
                    <div className="xl:col-span-4 space-y-5">
                        {/* 1. Action Card for Verification (Only for pending programs) */}
                        {program.status === 'pending_verification' && (
                            <div className="rounded-xl border border-yellow-200 dark:border-amber-900/60 bg-yellow-50 dark:bg-amber-950/20 overflow-hidden shadow-xs">
                                <div className="border-b border-yellow-200/60 dark:border-amber-900/40 bg-yellow-100/50 dark:bg-amber-950/40 py-3.5 px-5">
                                    <h3 className="font-semibold text-yellow-900 dark:text-amber-200 flex items-center text-sm">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Aksi Verifikasi Program
                                    </h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <p className="text-xs text-yellow-800 dark:text-amber-300 leading-relaxed">
                                        Program ini diajukan dan menunggu persetujuan Anda sebelum dapat dipublikasikan dan menerima donasi publik.
                                    </p>
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs h-9"
                                            onClick={() => setIsApproveConfirmOpen(true)}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" /> Setujui & Publikasikan
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs h-9"
                                            onClick={() => setIsRejectModalOpen(true)}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Tolak Program
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Catatan Penolakan (Jika ditolak) */}
                        {program.status === 'rejected' && program.rejection_notes && (
                            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4.5">
                                <div className="flex items-start">
                                    <Info className="h-5 w-5 text-red-600 dark:text-red-400 mr-2.5 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="text-red-900 dark:text-red-200 font-semibold text-xs mb-1">Catatan Penolakan</h4>
                                        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                                            {program.rejection_notes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Translation Status Card */}
                        <TranslationStatusCard
                            hasId={hasId}
                            hasEn={hasEn}
                            hasAr={hasAr}
                            onTranslate={handleTranslate}
                            isTranslating={isTranslating}
                            description="Status kelengkapan terjemahan judul dan cerita dalam 3 bahasa resmi."
                        />

                        {/* 3. Unified Information & Attribution Card */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-3.5 px-5 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4 text-[#1A56DB]" />
                                    <span>Informasi & Atribusi Program</span>
                                </h3>
                                {getCampaignerBadge()}
                            </div>
                            <div className="p-5 space-y-4 text-xs">
                                {/* Section: Inisiator & PIC */}
                                <div className="p-3 bg-gray-50/70 dark:bg-gray-800/50 rounded-lg space-y-2 border border-gray-100 dark:border-gray-800">
                                    <span className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] block">
                                        Inisiator & Penanggung Jawab
                                    </span>
                                    {program.campaigner_type === 'internal' ? (
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">Tim Internal Yayasan</p>
                                            <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                                Staf Pengelola: <span className="text-gray-800 dark:text-gray-200 font-medium">{program.creator?.name || 'Staf Yayasan'}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div>
                                                <p className="text-gray-400 text-[11px]">Nama Penggalang / Lembaga:</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {(program as any).campaigner_profile?.nama_lembaga || (program as any).campaigner_profile?.institution_name || program.campaignerProfile?.institution_name || program.creator?.name}
                                                </p>
                                            </div>
                                            {program.creator?.name && ((program as any).campaigner_profile?.type === 'lembaga' || program.campaignerProfile?.type === 'lembaga') && (
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    PIC: <span className="font-medium text-gray-900 dark:text-white">{program.creator.name}</span>
                                                </p>
                                            )}
                                            {program.creator?.email && (
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    Email: <span className="font-medium text-gray-900 dark:text-white">{program.creator.email}</span>
                                                </p>
                                            )}
                                            {((program as any).campaigner_profile?.phone || program.creator?.phone) && (
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    WA / Telp: <span className="font-medium text-gray-900 dark:text-white font-mono">{(program as any).campaigner_profile?.phone || program.creator?.phone}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Section: Metadata Rincian */}
                                <div className="space-y-2.5 pt-1">
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                        <span className="text-gray-400">Kategori</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {getLocalizedValue(program.category?.name, 'N/A')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                        <span className="text-gray-400">Batas Waktu</span>
                                        <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {program.deadline ? formatDate(program.deadline) : 'Tanpa Batas (∞)'}
                                        </span>
                                    </div>
                                    {program.published_at && (
                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                            <span className="text-gray-400">Dipublikasikan</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatDate(program.published_at)}
                                            </span>
                                        </div>
                                    )}
                                    {program.created_at && (
                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                            <span className="text-gray-400">Dibuat Pada</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatDate(program.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                        <span className="text-gray-400">Pengunjung (Views)</span>
                                        <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                                            {(program.views_count || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tolak */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-[425px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Tolak Program</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Berikan alasan penolakan agar campaigner dapat memperbaiki dan mengajukan ulang program ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRejectSubmit}>
                        <div className="px-6 py-4">
                            <Label htmlFor="rejection_notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Catatan Penolakan <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="rejection_notes"
                                value={rejectData.rejection_notes}
                                onChange={e => setRejectData('rejection_notes', e.target.value)}
                                placeholder="Contoh: Mohon hapus nomor rekening pribadi yang ada di dalam deskripsi cerita."
                                rows={4}
                                required
                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-red-500 min-h-[120px]"
                            />
                            {rejectErrors.rejection_notes && <p className="mt-1.5 text-xs text-red-500">{rejectErrors.rejection_notes}</p>}
                        </div>
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)} className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Batal
                            </Button>
                            <Button type="submit" variant="destructive" disabled={rejectProcessing} className="bg-red-600 hover:bg-red-700 text-white">
                                Kirim Penolakan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isApproveConfirmOpen}
                onOpenChange={setIsApproveConfirmOpen}
                title="Publikasikan Program"
                description={`Apakah Anda yakin ingin mempublikasikan program "${getLocalizedValue(program.title)}"? Program akan aktif tayang di halaman publik dan donatur dapat mulai berdonasi.`}
                confirmText="Publikasikan"
                variant="info"
                loading={isUpdatingStatus}
                onConfirm={handleApproveConfirm}
            />

            <ConfirmDialog
                open={isCloseConfirmOpen}
                onOpenChange={setIsCloseConfirmOpen}
                title="Tutup Program (Manual)"
                description="Apakah Anda yakin ingin menutup program donasi ini? Penggalangan dana akan dihentikan dan donatur tidak dapat berdonasi lagi."
                confirmText="Ya, Tutup Program"
                variant="warning"
                loading={isUpdatingStatus}
                onConfirm={handleCloseConfirm}
            />
        </>
    );
}

ProgramShow.layout = {
    breadcrumbs: [
        {
            title: 'Detail Program',
            href: '/admin/programs',
        },
    ],
};
