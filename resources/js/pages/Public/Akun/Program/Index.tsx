import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, Trash2, Target, ArrowUpRight, Clock, Building2 } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, getLocalizedValue } from '@/lib/utils';
import DonationProgressBar from '@/components/donation/DonationProgressBar';

interface Program {
    id: number;
    title: { id: string };
    program_code: string;
    category: { title: { id: string }, name: { id: string } };
    target_amount: string | null;
    is_continuous?: boolean;
    collected_amount: number;
    status: string;
    cover_image: string;
    created_at: string;
}

interface QuotaInfo {
    type: 'individu' | 'lembaga' | string;
    active_count: number;
    max_slots: number;
    remaining_slots: number;
    can_create: boolean;
    has_pending_request?: boolean;
    pending_request?: {
        requested_slots: number;
        created_at: string;
    } | null;
}

interface Props {
    programs: {
        data: Program[];
        current_page: number;
        last_page: number;
        links: any[];
    };
    quota?: QuotaInfo | null;
}

export default function AkunProgramIndex({ programs, quota }: Props) {
    const [programToDelete, setProgramToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Slot request state
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [requestedSlots, setRequestedSlots] = useState(quota ? quota.max_slots + 2 : 5);
    const [requestReason, setRequestReason] = useState('');
    const [plannedPrograms, setPlannedPrograms] = useState('');
    const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

    const handleSlotRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingSlot(true);
        router.post(
            '/akun/slot-requests',
            {
                requested_slots: requestedSlots,
                reason: requestReason,
                planned_programs: plannedPrograms,
            },
            {
                onFinish: () => {
                    setIsSubmittingSlot(false);
                    setIsSlotModalOpen(false);
                    setRequestReason('');
                    setPlannedPrograms('');
                },
            }
        );
    };

    const handleConfirmDelete = () => {
        if (!programToDelete) return;
        setIsDeleting(true);
        router.delete(`/akun/programs/${programToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setProgramToDelete(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
            case 'pending_verification':
                return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Menunggu Verifikasi</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Selesai</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Ditolak</Badge>;
            case 'draft':
                return <Badge variant="outline">Draft</Badge>;
            case 'closed_manual':
                return <Badge variant="secondary">Ditutup Manual</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Program Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 w-full">
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Program Saya</h1>
                            <p className="text-slate-500 dark:text-gray-400 mt-1">Kelola program penggalangan dana yang Anda buat.</p>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {quota?.type === 'lembaga' && !quota.has_pending_request && !quota.can_create && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSlotModalOpen(true)}
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 shadow-xs"
                                >
                                    <ArrowUpRight className="mr-1.5 h-4 w-4" />
                                    Ajukan Tambah Slot
                                </Button>
                            )}
                            {quota?.can_create === false ? (
                                <Button
                                    disabled
                                    className="bg-slate-200 text-slate-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed shadow-none"
                                    title="Batas kuota campaign aktif Anda telah tercapai."
                                >
                                    Slot Penuh ({quota.active_count}/{quota.max_slots})
                                </Button>
                            ) : (
                                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                                    <Link href="/akun/programs/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Galang Dana Baru
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Kuota Slot Campaign Aktif Banner */}
                    {quota && (
                        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all ${
                            quota.can_create 
                                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50' 
                                : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                        }`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                                            Status Kuota Campaign ({quota.type === 'lembaga' ? 'Mitra Lembaga' : 'Individu'})
                                        </span>
                                        {quota.can_create ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 text-[10px] py-0 font-semibold">
                                                {quota.remaining_slots} Slot Tersedia
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 text-[10px] py-0 font-semibold">
                                                Kuota Penuh
                                            </Badge>
                                        )}
                                        {quota.has_pending_request && (
                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 text-[10px] py-0 font-semibold inline-flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-purple-600 animate-pulse" />
                                                Pengajuan {quota.pending_request?.requested_slots} Slot Sedang Ditinjau
                                            </Badge>
                                        )}
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                        {quota.active_count} dari {quota.max_slots} Slot Campaign Sedang Berjalan
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                                        {quota.type === 'lembaga'
                                            ? 'Kuota slot dihitung berdasarkan campaign aktif (status Berjalan / Menunggu Verifikasi). Ketika campaign selesai atau ditutup, slot otomatis terbuka kembali.'
                                            : 'Campaigner individu memiliki batas 1 slot campaign aktif agar fokus dalam pengelolaan donasi dan pelaporan hingga selesai.'}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0 self-start sm:self-center">
                                    {/* Visual Slot Pills */}
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: quota.max_slots }).map((_, index) => {
                                            const isUsed = index < quota.active_count;
                                            return (
                                                <div
                                                    key={index}
                                                    title={isUsed ? `Slot ${index + 1}: Digunakan` : `Slot ${index + 1}: Tersedia`}
                                                    className={`h-2.5 w-7 sm:w-9 rounded-full transition-all ${
                                                        isUsed
                                                            ? quota.can_create ? 'bg-blue-600 dark:bg-blue-500' : 'bg-amber-500'
                                                            : 'bg-slate-200 dark:bg-gray-700'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Tombol Ajukan Slot untuk Lembaga */}
                                    {quota.type === 'lembaga' && !quota.has_pending_request && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setRequestedSlots(quota.max_slots + 2);
                                                setIsSlotModalOpen(true);
                                            }}
                                            className="text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/50"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                                            Ajukan Tambah Slot
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {programs.data.length > 0 ? (
                            programs.data.map((program) => (
                                <Card key={program.id} className="overflow-hidden border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-sm transition-all p-5 sm:p-6 gap-0">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="w-full md:w-80 lg:w-96 shrink-0 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 relative shadow-2xs border border-slate-200/70 dark:border-gray-800">
                                            {program.cover_image ? (
                                                <img 
                                                    src={program.cover_image.startsWith('http') ? program.cover_image : `/storage/${program.cover_image}`} 
                                                    alt={getLocalizedValue(program.title, 'Cover Program')} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-gray-500">
                                                    <Target className="w-12 h-12" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between w-full min-w-0">
                                            <div>
                                                <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300">
                                                            {getLocalizedValue(program.category?.name, 'Kategori')}
                                                        </Badge>
                                                        {getStatusBadge(program.status)}
                                                    </div>
                                                    <span className="text-xs text-slate-400 dark:text-gray-500 font-mono bg-slate-50 dark:bg-gray-800 px-2 py-1 rounded">
                                                        {program.program_code}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                                                    {getLocalizedValue(program.title, 'Program Tanpa Judul')}
                                                </h3>
                                                
                                                {(() => {
                                                    const hasTarget = Boolean(program.target_amount && parseFloat(program.target_amount) > 0);

                                                    return (
                                                        <div className="mt-4 p-3.5 rounded-xl bg-slate-50/80 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Terkumpul</p>
                                                                    <p className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{formatCurrency(program.collected_amount)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Target Donasi</p>
                                                                    <p className="font-semibold text-base text-slate-900 dark:text-white mt-0.5">
                                                                        {hasTarget ? formatCurrency(parseFloat(program.target_amount!)) : (program.is_continuous ? 'Berkelanjutan' : 'Tanpa Target')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3">
                                                                <DonationProgressBar
                                                                    collectedAmount={program.collected_amount}
                                                                    targetAmount={program.target_amount}
                                                                    size="sm"
                                                                    percentagePlacement="top-right"
                                                                    percentageFormat="badge"
                                                                    label="Progres Pengumpulan"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-gray-800 pt-4">
                                                <div className="text-sm text-slate-500 dark:text-gray-400">
                                                    Dibuat pada {formatDate(program.created_at)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button variant="outline" size="sm" asChild className="border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300">
                                                        <Link href={`/akun/programs/${program.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> Detail
                                                        </Link>
                                                    </Button>
                                                    
                                                    {['published', 'completed'].includes(program.status) && (
                                                        <Button variant="outline" size="sm" asChild className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 border-slate-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                                                            <Link href={`/akun/programs/${program.id}/updates`}>
                                                                <span className="flex items-center">Update Kabar</span>
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {['published', 'completed'].includes(program.status) && (
                                                        <Button variant="outline" size="sm" asChild className="text-green-600 dark:text-green-400 hover:text-green-700 border-slate-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-950/40">
                                                            <Link href={`/akun/programs/${program.id}/disbursements`}>
                                                                <span className="flex items-center">Pencairan</span>
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {['draft', 'rejected'].includes(program.status) && (
                                                        <Button variant="outline" size="sm" asChild className="border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300">
                                                            <Link href={`/akun/programs/${program.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    
                                                    {program.status !== 'published' && program.status !== 'completed' && program.status !== 'closed_manual' && (
                                                        <Button variant="outline" size="sm" className="text-red-500 dark:text-red-400 hover:text-red-600 border-slate-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/40" onClick={() => setProgramToDelete(program)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada program</h3>
                                    <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-md">
                                        Anda belum membuat program penggalangan dana apapun. Mulai tebarkan kebaikan dengan membuat program pertama Anda.
                                    </p>
                                    {quota?.can_create === false ? (
                                        <Button disabled className="bg-slate-200 text-slate-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed">
                                            Batas Kuota Tercapai ({quota.active_count}/{quota.max_slots})
                                        </Button>
                                    ) : (
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Link href="/akun/programs/create">
                                                Buat Program Sekarang
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {programs.last_page > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex space-x-1">
                                {programs.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded text-sm ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Ajukan Tambahan Slot Campaign */}
            <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSlotRequestSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Pengajuan Tambahan Slot Campaign
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 text-sm">
                            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                                Standar kuota aktif untuk mitra lembaga adalah <strong>{quota?.max_slots || 3} slot</strong>. Anda dapat mengajukan kuota yang lebih besar kepada Superadmin dengan menyertakan alasan dan rencana program.
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                                    Jumlah Total Slot yang Diminta <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    min={(quota?.max_slots || 3) + 1}
                                    max={50}
                                    value={requestedSlots}
                                    onChange={(e) => setRequestedSlots(parseInt(e.target.value) || ((quota?.max_slots || 3) + 1))}
                                    required
                                    className="font-bold text-base"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Kuota saat ini: {quota?.max_slots} slot. Masukkan target total slot yang Anda butuhkan.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                                    Alasan Pengajuan Tambahan Kuota <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={requestReason}
                                    onChange={(e) => setRequestReason(e.target.value)}
                                    required
                                    placeholder="Jelaskan kebutuhan pengajuan slot tambahan untuk lembaga Anda..."
                                    className="w-full text-sm rounded-md border border-slate-300 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                                    Rencana Program yang Akan Dibuka (Opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={plannedPrograms}
                                    onChange={(e) => setPlannedPrograms(e.target.value)}
                                    placeholder="Contoh: Program renovasi pesantren di Garut dan bantuan pangan dhuafa."
                                    className="w-full text-sm rounded-md border border-slate-300 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsSlotModalOpen(false)}
                                disabled={isSubmittingSlot}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingSlot || !requestReason.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isSubmittingSlot ? 'Mengirim...' : 'Kirim Pengajuan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!programToDelete}
                onOpenChange={(open) => !open && setProgramToDelete(null)}
                title="Hapus / Batalkan Program"
                description={`Apakah Anda yakin ingin membatalkan atau menghapus program "${programToDelete ? getLocalizedValue(programToDelete.title, 'id') : ''}"? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
