import { Head, Link, router } from '@inertiajs/react';
import { 
    Layers, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Building2, 
    AlertCircle, 
    ArrowRight,
    MessageSquare,
    User,
    Check,
    X
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface SlotRequest {
    id: number;
    campaigner_profile_id: number;
    current_slots: number;
    requested_slots: number;
    reason: string;
    planned_programs?: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string | null;
    reviewed_at?: string | null;
    created_at: string;
    campaigner_profile?: {
        id: number;
        nama_lembaga?: string;
        institution_name?: string;
        user?: {
            name: string;
            email: string;
        };
    };
    requester?: {
        name: string;
        email: string;
    };
    reviewer?: {
        name: string;
    };
}

interface Props {
    slotRequests: {
        data: SlotRequest[];
        current_page: number;
        last_page: number;
        links: any[];
        total: number;
    };
    filters: {
        status: string;
    };
    counts: {
        pending: number;
        approved: number;
        rejected: number;
        all: number;
    };
}

export default function SlotRequestsIndex({ slotRequests, filters, counts }: Props) {
    const [approvingRequest, setApprovingRequest] = useState<SlotRequest | null>(null);
    const [approvedSlots, setApprovedSlots] = useState<number>(3);
    const [approveNotes, setApproveNotes] = useState('');
    const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);

    const [rejectingRequest, setRejectingRequest] = useState<SlotRequest | null>(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    const handleFilterStatus = (status: string) => {
        router.get('/admin/slot-requests', { status }, { preserveState: true });
    };

    const openApproveModal = (req: SlotRequest) => {
        setApprovingRequest(req);
        setApprovedSlots(req.requested_slots);
        setApproveNotes('');
    };

    const handleApproveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!approvingRequest) return;

        setIsSubmittingApprove(true);
        router.post(
            `/admin/slot-requests/${approvingRequest.id}/approve`,
            {
                approved_slots: approvedSlots,
                admin_notes: approveNotes,
            },
            {
                onFinish: () => {
                    setIsSubmittingApprove(false);
                    setApprovingRequest(null);
                },
            }
        );
    };

    const openRejectModal = (req: SlotRequest) => {
        setRejectingRequest(req);
        setRejectNotes('');
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingRequest) return;

        setIsSubmittingReject(true);
        router.post(
            `/admin/slot-requests/${rejectingRequest.id}/reject`,
            {
                admin_notes: rejectNotes,
            },
            {
                onFinish: () => {
                    setIsSubmittingReject(false);
                    setRejectingRequest(null);
                },
            }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 border-0 font-medium inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Menunggu Peninjauan
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 border-0 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Disetujui
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-inset ring-red-600/10 border-0 font-medium inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-600" /> Ditolak
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const tabs = [
        { id: 'pending', label: 'Menunggu Peninjauan', count: counts.pending, highlight: counts.pending > 0 },
        { id: 'approved', label: 'Disetujui', count: counts.approved },
        { id: 'rejected', label: 'Ditolak', count: counts.rejected },
        { id: 'semua', label: 'Semua Permohonan', count: counts.all },
    ];

    return (
        <>
            <Head title="Pengajuan Slot Lembaga" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pengajuan Slot Campaign</h1>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                {counts.pending} Menunggu Review
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Tinjau dan setujui permohonan penambahan kuota slot program aktif dari mitra lembaga terverifikasi.
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200 dark:border-gray-800">
                    {tabs.map((tab) => {
                        const isCurrent = (filters.status || 'pending') === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleFilterStatus(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                                    isCurrent
                                        ? 'border-[#1A56DB] text-[#1A56DB] dark:border-blue-500 dark:text-blue-400 bg-blue-50/20'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                        isCurrent
                                            ? 'bg-[#1A56DB] text-white'
                                            : tab.highlight
                                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Table Data */}
                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto shadow-xs">
                    <Table>
                        <TableHeader className="bg-gray-50/75 dark:bg-gray-800/60">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 min-w-[200px]">Lembaga & Pemohon</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center w-28">Slot Saat Ini</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center w-28">Diajukan</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 min-w-[280px]">Alasan & Rencana Program</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 w-36">Status</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 min-w-[170px]">Catatan / Reviewer</TableHead>
                                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 w-32">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {slotRequests.data.length > 0 ? (
                                slotRequests.data.map((req) => {
                                    const orgName = req.campaigner_profile?.nama_lembaga 
                                        || req.campaigner_profile?.institution_name 
                                        || req.requester?.name 
                                        || 'Lembaga Mitra';
                                    return (
                                        <TableRow key={req.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                                            <TableCell>
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                                    <span>{orgName}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    PIC: {req.requester?.name} ({req.requester?.email})
                                                </div>
                                                <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                    Diajukan: {formatDate(req.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-gray-700 dark:text-gray-300">
                                                <span className="inline-flex px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm">
                                                    {req.current_slots} Slot
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-sm border border-blue-200 dark:border-blue-800">
                                                    <ArrowRight className="w-3.5 h-3.5" /> {req.requested_slots} Slot
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2" title={req.reason}>
                                                        <span className="font-semibold text-gray-600 dark:text-gray-400">Alasan: </span>
                                                        {req.reason}
                                                    </div>
                                                    {req.planned_programs && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2" title={req.planned_programs}>
                                                            <span className="font-semibold text-gray-600 dark:text-gray-400">Rencana: </span>
                                                            {req.planned_programs}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(req.status)}
                                            </TableCell>
                                            <TableCell>
                                                {req.status === 'pending' ? (
                                                    <span className="text-xs text-gray-400 italic">Belum ditinjau</span>
                                                ) : (
                                                    <div className="space-y-0.5 text-xs">
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {req.reviewer?.name || 'Superadmin'}
                                                        </div>
                                                        {req.reviewed_at && (
                                                            <div className="text-[11px] text-gray-400">
                                                                {formatDate(req.reviewed_at)}
                                                            </div>
                                                        )}
                                                        {req.admin_notes && (
                                                            <div className="text-[11px] text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800/80 p-1.5 rounded mt-1 border border-gray-100 dark:border-gray-800">
                                                                "{req.admin_notes}"
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openApproveModal(req)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold"
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openRejectModal(req)}
                                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 text-xs"
                                                        >
                                                            <X className="w-3.5 h-3.5 mr-1" /> Tolak
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">— Selesai —</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 text-gray-400">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">Tidak ada pengajuan slot</p>
                                            <p className="text-xs mt-1 text-gray-500">
                                                Saat ini tidak ada permohonan penambahan slot campaign dalam status ini.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {slotRequests.last_page > 1 && (
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Menampilkan halaman <span className="font-semibold">{slotRequests.current_page}</span> dari <span className="font-semibold">{slotRequests.last_page}</span>
                        </div>
                        <div className="flex space-x-1">
                            {slotRequests.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-[#1A56DB] text-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800'
                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Approve Dialog */}
            <Dialog open={!!approvingRequest} onOpenChange={(open) => !open && setApprovingRequest(null)}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleApproveSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                Setujui Penambahan Slot Campaign
                            </DialogTitle>
                        </DialogHeader>

                        {approvingRequest && (
                            <div className="space-y-4 text-sm">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {approvingRequest.campaigner_profile?.nama_lembaga || approvingRequest.campaigner_profile?.institution_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Slot Saat Ini: <span className="font-bold">{approvingRequest.current_slots}</span> | Diajukan: <span className="font-bold text-blue-600">{approvingRequest.requested_slots} Slot</span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">
                                        "{approvingRequest.reason}"
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Jumlah Slot Akhir yang Disetujui <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        min={approvingRequest.current_slots + 1}
                                        max={100}
                                        value={approvedSlots}
                                        onChange={(e) => setApprovedSlots(parseInt(e.target.value) || approvingRequest.requested_slots)}
                                        required
                                        className="font-bold text-base"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        Anda dapat menyetujui sesuai permintaan ({approvingRequest.requested_slots}) atau menentukan jumlah kuota yang sesuai.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Catatan / Pesan untuk Lembaga (Opsional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={approveNotes}
                                        onChange={(e) => setApproveNotes(e.target.value)}
                                        placeholder="Contoh: Disetujui untuk ekspansi program kesehatan wilayah Jawa Barat."
                                        className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setApprovingRequest(null)}
                                disabled={isSubmittingApprove}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingApprove}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isSubmittingApprove ? 'Memproses...' : 'Setujui & Tambah Slot'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!rejectingRequest} onOpenChange={(open) => !open && setRejectingRequest(null)}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleRejectSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <XCircle className="w-5 h-5 text-red-600" />
                                Tolak Pengajuan Slot Campaign
                            </DialogTitle>
                        </DialogHeader>

                        {rejectingRequest && (
                            <div className="space-y-4 text-sm">
                                <div className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-lg space-y-1">
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {rejectingRequest.campaigner_profile?.nama_lembaga || rejectingRequest.campaigner_profile?.institution_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Mengajukan kenaikan ke {rejectingRequest.requested_slots} slot.
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Alasan Penolakan <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={rejectNotes}
                                        onChange={(e) => setRejectNotes(e.target.value)}
                                        required
                                        placeholder="Berikan alasan mengapa permohonan penambahan slot belum dapat disetujui (misal: mohon lengkapi laporan penyaluran campaign yang sedang berjalan terlebih dahulu)."
                                        className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectingRequest(null)}
                                disabled={isSubmittingReject}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isSubmittingReject || !rejectNotes.trim()}
                            >
                                {isSubmittingReject ? 'Menolak...' : 'Ya, Tolak Permohonan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

SlotRequestsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Verifikasi Campaigner',
            href: '/admin/campaigners',
        },
        {
            title: 'Pengajuan Slot Lembaga',
            href: '/admin/slot-requests',
        },
    ],
};
