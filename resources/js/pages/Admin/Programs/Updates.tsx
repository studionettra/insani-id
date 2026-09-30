import { Head, Link, useForm, router } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import {
    Plus,
    ArrowLeft,
    Pencil,
    Trash2,
    Megaphone,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Languages,
    Lock,
    Check,
    XCircle,
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import { autoTranslateFields } from '@/lib/translate';
import RichTextEditor from '@/components/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getLocalizedValue } from '@/lib/utils';

interface UpdateItem {
    id: number;
    title: any;
    content: any;
    is_published: boolean;
    moderation_status?: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string | null;
    created_at: string;
    title_translations?: Record<string, string>;
    content_translations?: Record<string, string>;
}

interface ProgramData {
    id: number;
    title: any;
    slug: string;
    program_code: string;
    cover_image?: string;
    status: string;
    created_by: number;
}

interface Props {
    program: ProgramData;
    updates: {
        data: UpdateItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}

export default function AdminProgramUpdates({ program, updates }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<UpdateItem | null>(null);
    const [updateToDelete, setUpdateToDelete] = useState<UpdateItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [contentTab, setContentTab] = useState<'id' | 'en' | 'ar'>('id');
    const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

    const [updateToReject, setUpdateToReject] = useState<UpdateItem | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isModerating, setIsModerating] = useState(false);

    const handleApprove = (item: UpdateItem) => {
        setIsModerating(true);
        router.put(`/admin/programs/${program.id}/updates/${item.id}/moderation`, {
            moderation_status: 'approved',
        }, {
            onSuccess: () => toast.success('Laporan kabar berhasil disetujui dan dipublikasikan.'),
            onFinish: () => setIsModerating(false),
        });
    };

    const handleConfirmReject = () => {
        if (!updateToReject || !rejectionReason.trim()) {
            toast.error('Silakan isi alasan penolakan.');
            return;
        }

        setIsModerating(true);
        router.put(`/admin/programs/${program.id}/updates/${updateToReject.id}/moderation`, {
            moderation_status: 'rejected',
            rejection_reason: rejectionReason.trim(),
        }, {
            onSuccess: () => {
                toast.success('Laporan kabar berhasil ditolak dengan catatan.');
                setUpdateToReject(null);
                setRejectionReason('');
            },
            onFinish: () => setIsModerating(false),
        });
    };

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: { id: '', en: '', ar: '' },
        content: { id: '', en: '', ar: '' },
        is_published: true,
    });

    const toggleExpand = (id: number) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAutoTranslate = async () => {
        const sourceTitle = data.title.id;
        const sourceContent = data.content.id;

        if (!sourceTitle.trim() && !sourceContent.trim()) {
            toast.error('Silakan isi Judul atau Isi Kabar (ID) terlebih dahulu sebelum menerjemahkan.');
            return;
        }

        setIsTranslating(true);
        try {
            const fieldsToTranslate: Record<string, string> = {};
            if (sourceTitle.trim()) {
                fieldsToTranslate.title = sourceTitle.trim();
            }
            if (sourceContent.trim()) {
                fieldsToTranslate.content = sourceContent.trim();
            }

            const res = await autoTranslateFields(fieldsToTranslate);

            if (res) {
                setData(prev => ({
                    ...prev,
                    title: {
                        id: prev.title.id,
                        en: res.title?.en || prev.title.en,
                        ar: res.title?.ar || prev.title.ar,
                    },
                    content: {
                        id: prev.content.id,
                        en: res.content?.en || prev.content.en,
                        ar: res.content?.ar || prev.content.ar,
                    },
                }));
                toast.success('Kabar berhasil diterjemahkan ke bahasa Inggris dan Arab.');
            }
        } catch (err) {
            toast.error('Gagal menerjemahkan secara otomatis. Silakan coba lagi.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingUpdate(null);
        reset();
        clearErrors();
        setData({
            title: { id: '', en: '', ar: '' },
            content: { id: '', en: '', ar: '' },
            is_published: true,
        });
        setContentTab('id');
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (update: UpdateItem) => {
        setEditingUpdate(update);
        clearErrors();

        const titleObj = typeof update.title === 'object' && update.title !== null
            ? update.title
            : (update.title_translations || { id: update.title || '', en: '', ar: '' });

        const contentObj = typeof update.content === 'object' && update.content !== null
            ? update.content
            : (update.content_translations || { id: update.content || '', en: '', ar: '' });

        const isApproved = Boolean(update.is_published || update.moderation_status === 'approved');

        setData({
            title: {
                id: titleObj.id || (typeof update.title === 'string' ? update.title : ''),
                en: titleObj.en || '',
                ar: titleObj.ar || '',
            },
            content: {
                id: contentObj.id || (typeof update.content === 'string' ? update.content : ''),
                en: contentObj.en || '',
                ar: contentObj.ar || '',
            },
            is_published: Boolean(update.is_published),
        });

        if (isApproved && !contentObj.en) {
            setContentTab('en');
        } else {
            setContentTab('id');
        }

        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUpdate) {
            put(`/admin/programs/${program.id}/updates/${editingUpdate.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingUpdate(null);
                    reset();
                },
            });
        } else {
            post(`/admin/programs/${program.id}/updates`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleConfirmDelete = () => {
        if (!updateToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/programs/${program.id}/updates/${updateToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setUpdateToDelete(null);
            },
        });
    };

    const programTitle = getLocalizedValue(program.title, 'Program');

    return (
        <>
            <Head title={`Kabar Terbaru: ${programTitle} - Admin Insani`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 mx-auto w-full max-w-5xl">
                {/* Back button & Breadcrumb */}
                <div className="flex items-center justify-between gap-4">
                    <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Link href={`/admin/programs/${program.id}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Detail Program
                        </Link>
                    </Button>
                    <div className="text-xs text-gray-500 font-mono">
                        Kode: {program.program_code}
                    </div>
                </div>

                {/* Page Header Banner */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                                <Megaphone className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                                Kabar & Cerita Penyaluran
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {programTitle}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola cerita berkala, progres penyaluran donasi, dan transparansi kegiatan untuk para donatur.
                        </p>
                    </div>

                    <Button onClick={handleOpenCreate} className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm shrink-0">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kabar Baru
                    </Button>
                </div>

                {/* Updates List */}
                <div className="space-y-4">
                    {(!updates.data || updates.data.length === 0) ? (
                        <div className="text-center py-14 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs">
                            <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Belum Ada Kabar Terbaru</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5">
                                Belum ada pembaruan cerita atau laporan penyaluran yang dipublikasikan untuk program ini.
                            </p>
                            <Button onClick={handleOpenCreate} variant="outline" className="border-brand-300 text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-950">
                                <Plus className="mr-2 h-4 w-4" /> Buat Kabar Pertama
                            </Button>
                        </div>
                    ) : (
                        updates.data.map((item) => {
                            const isExpanded = Boolean(expandedCards[item.id]);
                            const itemTitle = getLocalizedValue(item.title, 'id');
                            const itemContent = getLocalizedValue(item.content, 'id');
                            const hasEn = Boolean(
                                (typeof item.title === 'object' ? item.title?.en : item.title_translations?.en) ||
                                (typeof item.content === 'object' ? item.content?.en : item.content_translations?.en)
                            );
                            const hasAr = Boolean(
                                (typeof item.title === 'object' ? item.title?.ar : item.title_translations?.ar) ||
                                (typeof item.content === 'object' ? item.content?.ar : item.content_translations?.ar)
                            );

                            return (
                                <Card key={item.id} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                        {itemTitle}
                                                    </h3>
                                                    {item.is_published || item.moderation_status === 'approved' ? (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Terpublikasi &amp; Terkunci
                                                        </Badge>
                                                    ) : item.moderation_status === 'rejected' ? (
                                                        <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-[11px] font-semibold">
                                                            <XCircle className="w-3 h-3 mr-1" /> Ditolak
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-semibold">
                                                            <Clock className="w-3 h-3 mr-1" /> Menunggu Peninjauan
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Language badges */}
                                                <div className="flex items-center gap-1.5 pt-0.5">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        ID ✓
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                                        hasEn
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                    }`}>
                                                        EN {hasEn ? '✓' : '—'}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                                        hasAr
                                                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                    }`}>
                                                        AR {hasAr ? '✓' : '—'}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Diposting pada {format(new Date(item.created_at), 'd MMMM yyyy HH:mm', { locale: idLocale })}
                                                </p>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                                                {item.moderation_status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(item)}
                                                            disabled={isModerating}
                                                            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setUpdateToReject(item);
                                                                setRejectionReason(item.rejection_reason || '');
                                                            }}
                                                            disabled={isModerating}
                                                            className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
                                                        </Button>
                                                    </>
                                                )}

                                                {item.is_published || item.moderation_status === 'approved' ? (
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            <Lock className="w-3.5 h-3.5 text-gray-400" /> Terkunci Permanen
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(item)}
                                                            className="h-8 px-2.5 text-xs text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                                                        >
                                                            <Languages className="w-3.5 h-3.5 mr-1" /> Terjemahan
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(item)}
                                                            className="h-8 px-2.5 text-xs text-blue-600 hover:text-blue-700 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setUpdateToDelete(item)}
                                                            className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {item.moderation_status === 'rejected' && item.rejection_reason && (
                                            <div className="mt-3 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2.5">
                                                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold mb-0.5">Catatan Penolakan Admin:</p>
                                                    <p className="leading-relaxed">{item.rejection_reason}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rich Content View */}
                                        <div className="relative pt-4">
                                            <div
                                                className={`prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 break-words overflow-hidden transition-all duration-300 prose-img:max-w-full prose-img:h-auto prose-img:rounded-xl prose-p:leading-relaxed ${
                                                    isExpanded ? '' : 'max-h-48'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(itemContent) }}
                                            />

                                            {!isExpanded && (
                                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                                            )}
                                        </div>

                                        <div className="mt-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(item.id)}
                                                className="inline-flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline focus:outline-none"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        Tutup Selengkapnya <ChevronUp className="w-3.5 h-3.5 ml-1" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Baca Selengkapnya <ChevronDown className="w-3.5 h-3.5 ml-1" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}

                    {/* Pagination */}
                    {updates.last_page > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="flex space-x-1.5">
                                {updates.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                                            link.active
                                                ? 'bg-brand-600 text-white shadow-xs'
                                                : link.url
                                                    ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    : 'bg-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Create / Edit */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
                        {(() => {
                            const isApprovedUpdate = Boolean(editingUpdate && (editingUpdate.is_published || editingUpdate.moderation_status === 'approved'));

                            return (
                                <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 overflow-hidden">
                                    <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                            {editingUpdate ? (isApprovedUpdate ? 'Kelola Terjemahan Kabar (EN / AR)' : 'Edit Kabar Terbaru') : 'Tambah Kabar Terbaru'}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {isApprovedUpdate
                                                ? 'Naskah utama Bahasa Indonesia telah dipublikasikan dan terkunci permanen. Anda dapat melengkapi dan memperbaiki terjemahan bahasa Inggris dan Arab.'
                                                : 'Berikan kabar perkembangan kegiatan atau dokumentasi penyaluran donasi untuk para donatur program ini (Mendukung ID, EN, AR).'}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4 min-w-0">
                                        {isApprovedUpdate && (
                                            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                                                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold mb-0.5">Naskah Bahasa Indonesia Terkunci Permanen</p>
                                                    <p className="leading-relaxed">Sesuai kebijakan integritas platform, naskah utama yang telah disetujui tidak dapat diubah agar tidak terjadi manipulasi laporan penyaluran. Anda dapat melengkapi atau menyunting terjemahan bahasa Inggris (EN) dan Arab (AR).</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Translation Status Card */}
                                        <TranslationStatusCard
                                            hasId={Boolean(data.title.id && data.content.id)}
                                            hasEn={Boolean(data.title.en && data.content.en)}
                                            hasAr={Boolean(data.title.ar && data.content.ar)}
                                            onTranslate={handleAutoTranslate}
                                            isTranslating={isTranslating}
                                            compact
                                            description="Terjemahkan judul dan isi cerita kabar penyaluran ke bahasa Inggris dan Arab secara otomatis."
                                        />

                                        {/* Judul Multi-Bahasa */}
                                        <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
                                            <Label className="text-xs font-semibold flex items-center gap-1.5 text-gray-900 dark:text-gray-100">
                                                <Languages className="w-3.5 h-3.5 text-brand-600" />
                                                Judul Kabar
                                            </Label>

                                            <div className="min-w-0">
                                                <span className="text-[11px] font-bold text-gray-500 block mb-1">
                                                    ID (Bahasa Indonesia) * {isApprovedUpdate && <span className="font-normal text-gray-400">(Terkunci)</span>}
                                                </span>
                                                <Input
                                                    id="title_id"
                                                    value={data.title.id}
                                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                                    placeholder="Contoh: Penyaluran Bantuan Sembako Tahap 1"
                                                    required
                                                    disabled={isApprovedUpdate}
                                                    className={isApprovedUpdate ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : ''}
                                                />
                                                {errors['title.id'] && <p className="text-xs text-rose-600 mt-1">{errors['title.id']}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                                                <div className="min-w-0">
                                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">EN (English)</span>
                                                    <Input
                                                        value={data.title.en}
                                                        onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                                        placeholder="e.g. Distribution of Phase 1 Aid"
                                                    />
                                                    {errors['title.en'] && <p className="text-xs text-rose-600 mt-1">{errors['title.en']}</p>}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">AR (العربية)</span>
                                                    <Input
                                                        dir="rtl"
                                                        value={data.title.ar}
                                                        onChange={(e) => setData('title', { ...data.title, ar: e.target.value })}
                                                        placeholder="مثال: توزيع المساعدات الغذائية - المرحلة الأولى"
                                                    />
                                                    {errors['title.ar'] && <p className="text-xs text-rose-600 mt-1">{errors['title.ar']}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Isi Cerita Multi-Bahasa */}
                                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 min-w-0">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <Label className="text-xs font-semibold flex items-center gap-1.5 text-gray-900 dark:text-gray-100">
                                                    <Languages className="w-3.5 h-3.5 text-brand-600" />
                                                    Isi Cerita &amp; Dokumentasi
                                                </Label>

                                                {/* Language switcher tabs */}
                                                <div className="inline-flex rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800 text-xs shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setContentTab('id')}
                                                        className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                                                            contentTab === 'id' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                                        }`}
                                                    >
                                                        🇮🇩 ID * {isApprovedUpdate && <Lock className="inline w-3 h-3 ml-0.5" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setContentTab('en')}
                                                        className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                                                            contentTab === 'en' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                                        }`}
                                                    >
                                                        🇬🇧 EN {data.content.en ? '✓' : ''}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setContentTab('ar')}
                                                        className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                                                            contentTab === 'ar' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                                        }`}
                                                    >
                                                        🇸🇦 AR {data.content.ar ? '✓' : ''}
                                                    </button>
                                                </div>
                                            </div>

                                            {contentTab === 'id' && (
                                                <div className="mt-1 min-w-0">
                                                    {isApprovedUpdate ? (
                                                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 max-h-72 overflow-y-auto overflow-x-hidden">
                                                            <div
                                                                className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 break-words prose-img:max-w-full prose-img:h-auto prose-img:rounded-xl prose-p:leading-relaxed"
                                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content.id) }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="min-w-0">
                                                            <RichTextEditor
                                                                value={data.content.id}
                                                                onChange={(val) => setData('content', { ...data.content, id: val })}
                                                                placeholder="Ceritakan proses penyaluran, cerita penerima manfaat, dan lampirkan foto dokumentasi (Bahasa Indonesia)..."
                                                            />
                                                        </div>
                                                    )}
                                                    {errors['content.id'] && <p className="text-xs text-rose-600 mt-1">{errors['content.id']}</p>}
                                                </div>
                                            )}
                                            {contentTab === 'en' && (
                                                <div className="mt-1 min-w-0">
                                                    <RichTextEditor
                                                        value={data.content.en}
                                                        onChange={(val) => setData('content', { ...data.content, en: val })}
                                                        placeholder="Describe distribution progress, recipient stories, and attach documentation photos (English)..."
                                                    />
                                                    {errors['content.en'] && <p className="text-xs text-rose-600 mt-1">{errors['content.en']}</p>}
                                                </div>
                                            )}
                                            {contentTab === 'ar' && (
                                                <div className="mt-1 min-w-0" dir="rtl">
                                                    <RichTextEditor
                                                        value={data.content.ar}
                                                        onChange={(val) => setData('content', { ...data.content, ar: val })}
                                                        placeholder="صف تفاصيل توزيع المساعدات وقصص المستفيدين وصور التوثيق (العربية)..."
                                                    />
                                                    {errors['content.ar'] && <p className="text-xs text-rose-600 mt-1">{errors['content.ar']}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {!isApprovedUpdate && (
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                                                <div>
                                                    <Label htmlFor="is_published" className="text-xs font-semibold block cursor-pointer">
                                                        Status Publikasi
                                                    </Label>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Jika diaktifkan, kabar ini akan langsung terlihat oleh publik dan donatur di halaman program.
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="is_published"
                                                    checked={data.is_published}
                                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                            disabled={processing}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={processing} className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs">
                                            {processing ? 'Menyimpan...' : (isApprovedUpdate ? 'Simpan Terjemahan' : (editingUpdate ? 'Simpan Perubahan' : 'Terbitkan Kabar'))}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            );
                        })()}
                    </DialogContent>
                </Dialog>

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    open={Boolean(updateToDelete)}
                    onOpenChange={(open) => { if (!open) setUpdateToDelete(null); }}
                    onConfirm={handleConfirmDelete}
                    title="Hapus Kabar Terbaru"
                    description={`Apakah Anda yakin ingin menghapus kabar "${updateToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                    confirmText="Hapus Kabar"
                    cancelText="Batal"
                    variant="danger"
                    loading={isDeleting}
                />

                {/* Rejection Reason Modal */}
                <Dialog open={Boolean(updateToReject)} onOpenChange={(open) => { if (!open) setUpdateToReject(null); }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Tolak Laporan Kabar
                            </DialogTitle>
                            <DialogDescription>
                                Berikan alasan penolakan yang jelas agar Campaigner dapat memperbaiki bukti dokumentasi atau nota penyaluran donasi.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label htmlFor="rejection_reason" className="text-xs font-semibold">Alasan Penolakan / Catatan Perbaikan</Label>
                                <Textarea
                                    id="rejection_reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Contoh: Bukti kuitansi atau foto penyerahan bantuan tahap 1 belum dilampirkan dengan jelas..."
                                    rows={4}
                                    className="mt-1.5"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setUpdateToReject(null)}
                                    disabled={isModerating}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleConfirmReject}
                                    disabled={isModerating || !rejectionReason.trim()}
                                    className="bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                    {isModerating ? 'Memproses...' : 'Kirim Penolakan'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
