import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Info,
    Ban,
    User,
    Calendar,
    AlertTriangle,
    Megaphone,
    ShieldCheck,
    Plus,
    CheckCircle2,
    Clock,
    Languages,
    Sparkles,
    Loader2,
    Edit,
    ExternalLink
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate, getLocalizedValue } from '@/lib/utils';
import DonationProgressBar from '@/components/donation/DonationProgressBar';

interface Program {
    id: number;
    title: any;
    slug?: string;
    program_code: string;
    category: any;
    campaigner_type: string;
    creator: { name: string, email: string, phone: string };
    campaignerProfile?: { institution_name: string, pic_name: string, type: string };
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
    title_translations?: { id?: string; en?: string; ar?: string };
    story_translations?: { id?: string; en?: string; ar?: string };
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

export default function ProgramShow({ program }: Props) {
    const { errors, auth } = usePage().props as any;
    const isCreator = Boolean(auth?.user?.id && Number(program.created_by) === Number(auth.user.id));
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing, errors: rejectErrors } = useForm({
        _method: 'put',
        status: 'rejected',
        rejection_notes: ''
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
            status: 'published'
        }, {
            onFinish: () => {
                setIsUpdatingStatus(false);
                setIsApproveConfirmOpen(false);
            }
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postReject(`/admin/programs/${program.id}/status`, {
            onSuccess: () => setIsRejectModalOpen(false)
        });
    };

    const handleCloseConfirm = () => {
        setIsUpdatingStatus(true);
        router.put(`/admin/programs/${program.id}/status`, {
            status: 'closed_manual'
        }, {
            onFinish: () => {
                setIsUpdatingStatus(false);
                setIsCloseConfirmOpen(false);
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/30 border-0 font-medium">Aktif</Badge>;
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

    return (
        <>
            <Head title={`Detail Program: ${getLocalizedValue(program.title)}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <Button variant="outline" size="sm" asChild className="mb-6 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Link href="/admin/programs"><ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Manajemen Program</Link>
                    </Button>
                </div>

                {errors.status && (
                    <div className="p-4 bg-yellow-50 dark:bg-amber-950/30 border border-yellow-200 dark:border-amber-900/50 text-yellow-800 dark:text-amber-200 rounded-md flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{errors.status}</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Detail Program</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Tinjau informasi program donasi.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(program.status)}
                        <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Link href={`/admin/programs/${program.id}/edit`}>
                                <Edit className="w-4 h-4 mr-1.5" /> Edit Program
                            </Link>
                        </Button>
                        {program.slug && (
                            <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <a href={`/program/${program.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-1.5" /> Lihat Publik
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Left Column - Details */}
                    <div className="xl:col-span-2 space-y-6">

                        {program.status === 'rejected' && program.rejection_notes && (
                            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-5">
                                <div className="flex items-start">
                                    <Info className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="text-red-900 dark:text-red-200 font-semibold mb-1">Program Ditolak</h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                                            <strong>Catatan Penolakan:</strong> {program.rejection_notes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Informasi Utama
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <img
                                        src={`/storage/${program.cover_image}`}
                                        alt={getLocalizedValue(program.title)}
                                        className="w-full h-64 sm:h-[400px] object-cover rounded-lg border border-gray-100 dark:border-gray-800"
                                    />
                                </div>

                                <div className="mb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Languages className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pratinjau Bahasa Konten:</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto border border-transparent dark:border-gray-700">
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
                                <p className="text-gray-500 dark:text-gray-400 mb-6 font-mono text-sm tracking-wide">Kode: {program.program_code}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Target Donasi</p>
                                        <p className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
                                             {program.target_amount ? formatCurrency(parseFloat(program.target_amount)) : 'Tanpa Target'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/40 p-5 rounded-lg border border-blue-100 dark:border-blue-900/60">
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Terkumpul</p>
                                        <p className="font-bold text-2xl text-[#1A56DB] dark:text-blue-400 tracking-tight">
                                             {formatCurrency(program.collected_amount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-8 p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                    <DonationProgressBar
                                        collectedAmount={program.collected_amount}
                                        targetAmount={program.target_amount}
                                        size="md"
                                        percentagePlacement="top-right"
                                        percentageFormat="badge"
                                        label="Persentase Ketercapaian Donasi"
                                    />
                                </div>

                                <div>
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
                                                {isTranslating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                        Memproses Terjemahan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
                                                        Terjemahkan ke EN & AR Sekarang
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kabar & Cerita Penyaluran Program Card */}
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
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
                                            Laporan perkembangan dan transparansi penyaluran donasi
                                        </p>
                                    </div>
                                </div>

                                {isCreator && (
                                    <Button asChild size="sm" className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs self-start sm:self-auto">
                                        <Link href={`/admin/programs/${program.id}/updates`}>
                                            <Plus className="w-4 h-4 mr-1.5" /> Kelola Kabar ({program.updates?.length || 0})
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            <div className="p-6">
                                {!isCreator ? (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div className="text-xs leading-relaxed">
                                                <p className="font-bold text-amber-950 dark:text-amber-100 mb-0.5">Pengelolaan Kabar Mandiri</p>
                                                Program ini dibuat oleh Campaigner <strong className="text-amber-950 dark:text-amber-100">{program.creator?.name || 'Eksternal'}</strong>. Sesuai kebijakan integritas platform, kabar terbaru dan laporan penyaluran dikelola secara independen oleh Campaigner yang bersangkutan.
                                            </div>
                                        </div>

                                        {(!program.updates || program.updates.length === 0) ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                                                Campaigner belum mempublikasikan kabar terbaru untuk program ini.
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {program.updates.map((update: any) => (
                                                    <div key={update.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 space-y-1.5">
                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <h5 className="font-semibold text-sm text-gray-900 dark:text-white">{update.title}</h5>
                                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">{formatDate(update.created_at)}</span>
                                                        </div>
                                                        <div 
                                                            className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 prose prose-xs dark:prose-invert"
                                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(update.content) }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    (!program.updates || program.updates.length === 0) ? (
                                        <div className="text-center py-6">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                Anda belum menambahkan kabar terbaru atau dokumentasi penyaluran untuk program ini.
                                            </p>
                                            <Button asChild variant="outline" size="sm" className="border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40">
                                                <Link href={`/admin/programs/${program.id}/updates`}>
                                                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Kabar Sekarang
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {program.updates.slice(0, 3).map((update: any) => (
                                                <div key={update.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 flex items-start justify-between gap-4">
                                                    <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{update.title}</h5>
                                                            {update.is_published ? (
                                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] py-0 border-emerald-200 dark:border-emerald-800">Terbit</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] py-0 border-amber-200 dark:border-amber-800">Draf</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500">{formatDate(update.created_at)}</p>
                                                    </div>
                                                    <Button asChild variant="ghost" size="sm" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 shrink-0">
                                                        <Link href={`/admin/programs/${program.id}/updates`}>
                                                            Kelola
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}

                                            <div className="pt-2 text-center">
                                                <Button asChild variant="outline" size="sm" className="w-full text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <Link href={`/admin/programs/${program.id}/updates`}>
                                                        Lihat Semua Kabar ({program.updates.length}) & Kelola
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Action Card for Verification */}
                        {program.status === 'pending_verification' && (
                            <div className="rounded-lg border border-yellow-200 dark:border-amber-900/60 bg-yellow-50 dark:bg-amber-950/20 overflow-hidden sticky top-6 shadow-xs">
                                <div className="border-b border-yellow-200/60 dark:border-amber-900/40 bg-yellow-100/50 dark:bg-amber-950/40 py-4 px-6">
                                    <h3 className="font-semibold text-yellow-900 dark:text-amber-200 flex items-center">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Aksi Verifikasi
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-sm text-yellow-800 dark:text-amber-300 leading-relaxed">
                                        Program ini menunggu persetujuan Anda sebelum dapat dipublikasikan dan menerima donasi.
                                    </p>
                                    <div className="pt-2 space-y-3">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                            onClick={() => setIsApproveConfirmOpen(true)}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" /> Setujui & Publikasikan
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-700"
                                            onClick={() => setIsRejectModalOpen(true)}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Tolak Program
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {program.status === 'published' && (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
                                        onClick={() => setIsCloseConfirmOpen(true)}
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Tutup Program (Manual)
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isCreator && (
                            <div className="rounded-lg border border-brand-200 dark:border-brand-900/50 bg-brand-50/40 dark:bg-brand-950/30 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Megaphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                    <span className="text-xs font-bold text-brand-900 dark:text-brand-200">Kabar Program Anda</span>
                                </div>
                                <p className="text-xs text-brand-700 dark:text-brand-300 mb-3 leading-relaxed">
                                    Program ini Anda buat. Anda memiliki akses untuk menerbitkan kabar cerita dan dokumentasi progres.
                                </p>
                                <Button asChild size="sm" className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-xs">
                                    <Link href={`/admin/programs/${program.id}/updates`}>
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Kelola Kabar ({program.updates?.length || 0})
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Translation Status Card */}
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                                    <Languages className="mr-2 h-4 w-4 text-brand-600 dark:text-brand-400" />
                                    Status Terjemahan
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800">
                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                            <span>🇮🇩</span> Bahasa Indonesia
                                        </span>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                                            Sumber ✓
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800">
                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                            <span>🇬🇧</span> English
                                        </span>
                                        {hasEn ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                                                Tersedia ✓
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-xs font-semibold">
                                                Belum Ada
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-1">
                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                            <span>🇸🇦</span> العربية
                                        </span>
                                        {hasAr ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                                                Tersedia ✓
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-xs font-semibold">
                                                Belum Ada
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTranslate}
                                    disabled={isTranslating}
                                    className="w-full text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 border-brand-200 dark:border-brand-800"
                                >
                                    {isTranslating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Memproses Antrean...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" />
                                            {hasEn && hasAr ? 'Perbarui Terjemahan (Auto)' : 'Terjemahkan Sekarang (Auto)'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Informasi Metadata
                                </h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Kategori</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{program.category?.name?.id || 'N/A'}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Batas Waktu</p>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {program.deadline ? formatDate(program.deadline) : 'Tanpa batas waktu (∞)'}
                                        </p>
                                    </div>
                                </div>

                                {program.published_at && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Dipublikasikan Pada</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(program.published_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                                    <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    Informasi Pembuat
                                </h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tipe Campaigner</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{program.campaigner_type}</p>
                                </div>

                                {program.campaigner_type === 'internal' ? (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Staf Internal</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{program.creator?.name}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nama Penggalang</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {program.campaignerProfile?.type === 'lembaga'
                                                    ? program.campaignerProfile.institution_name
                                                    : program.creator?.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email Kontak</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{program.creator?.email}</p>
                                        </div>
                                    </>
                                )}
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
                            <Label htmlFor="rejection_notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Catatan Penolakan <span className="text-red-500">*</span></Label>
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
                            <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)} className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Batal</Button>
                            <Button type="submit" variant="destructive" disabled={rejectProcessing} className="bg-red-600 hover:bg-red-700 text-white">Kirim Penolakan</Button>
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
            title: 'ProgramShow',
            href: '/admin/programs',
        },
    ],
};
