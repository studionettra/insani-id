import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Info, Ban, User, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
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

interface Program {
    id: number;
    title: { id: string };
    program_code: string;
    category: { title: { id: string }, name: { id: string } };
    campaigner_type: string;
    creator: { name: string, email: string, phone: string };
    campaignerProfile?: { institution_name: string, pic_name: string, type: string };
    collected_amount: number;
    target_amount: string | null;
    status: string;
    published_at: string | null;
    deadline: string | null;
    story: { id: string };
    cover_image: string;
    video_url: string | null;
    rejection_notes: string | null;
}

interface Props {
    program: Program;
}

export default function ProgramShow({ program }: Props) {
    const { errors } = usePage().props as any;
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    
    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing, errors: rejectErrors } = useForm({
        _method: 'put',
        status: 'rejected',
        rejection_notes: ''
    });

    const handleApprove = () => {
        if (confirm('Apakah Anda yakin ingin mempublikasikan program ini?')) {
            router.put(`/admin/programs/${program.id}/status`, {
                status: 'published'
            });
        }
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postReject(`/admin/programs/${program.id}/status`, {
            onSuccess: () => setIsRejectModalOpen(false)
        });
    };

    const handleCloseProgram = () => {
        if (confirm('Apakah Anda yakin ingin menutup program ini (Closed Manual)? Donatur tidak akan bisa berdonasi lagi.')) {
            router.put(`/admin/programs/${program.id}/status`, {
                status: 'closed_manual'
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default" className="bg-green-500 text-white">Aktif</Badge>;
            case 'pending_verification':
                return <Badge variant="secondary" className="bg-yellow-500 text-white">Menunggu Verifikasi</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-blue-500 text-white">Selesai</Badge>;
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
            <Head title={`Detail Program: ${program.title}`} />

            <div className="mb-6">
                <Link href="/admin/programs" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Manajemen Program
                </Link>
            </div>

            {errors.status && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <p>{errors.status}</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Detail Program</h1>
                <div>
                    {getStatusBadge(program.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Column - Details */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {program.status === 'rejected' && program.rejection_notes && (
                        <div className="rounded-sm border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
                            <div className="flex items-start">
                                <Info className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="text-red-800 dark:text-red-200 font-medium mb-1">Program Ditolak</h4>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        <strong>Catatan Penolakan:</strong> {program.rejection_notes}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-slate-800 dark:text-white">
                                Informasi Utama
                            </h3>
                        </div>
                        <div className="p-6.5">
                            <div className="mb-6">
                                <img 
                                    src={`/storage/${program.cover_image}`} 
                                    alt={program.title} 
                                    className="w-full h-64 object-cover rounded-md"
                                />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                {program.title}
                            </h2>
                            <p className="text-slate-500 mb-6 font-mono text-sm">Kode: {program.program_code}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                                    <p className="text-sm text-slate-500 mb-1">Target Donasi</p>
                                    <p className="font-semibold text-lg text-slate-800 dark:text-white">
                                        {program.target_amount ? formatCurrency(parseFloat(program.target_amount)) : 'Tanpa Target'}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                                    <p className="text-sm text-slate-500 mb-1">Terkumpul</p>
                                    <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                                        {formatCurrency(program.collected_amount)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Cerita Program</h4>
                                <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {program.story}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Action Card for Verification */}
                    {program.status === 'pending_verification' && (
                        <div className="rounded-sm border border-yellow-200 bg-yellow-50 shadow-default dark:border-yellow-800 dark:bg-yellow-900/20">
                            <div className="border-b border-yellow-200 py-4 px-6.5 dark:border-yellow-800">
                                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                                    Aksi Verifikasi
                                </h3>
                            </div>
                            <div className="p-6.5 space-y-4">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Program ini menunggu persetujuan Anda sebelum dapat dipublikasikan dan menerima donasi.
                                </p>
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                    onClick={handleApprove}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Setujui & Publikasikan
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={() => setIsRejectModalOpen(true)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Tolak Program
                                </Button>
                            </div>
                        </div>
                    )}

                    {program.status === 'published' && (
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6.5 space-y-4">
                                <Button 
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleCloseProgram}
                                >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Tutup Program (Manual)
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-slate-800 dark:text-white">
                                Informasi Metadata
                            </h3>
                        </div>
                        <div className="p-6.5 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Kategori</p>
                                <p className="font-medium">{program.category?.name?.id || 'N/A'}</p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-slate-500">Batas Waktu</p>
                                <div className="flex items-center mt-1">
                                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                    <p className="font-medium">
                                        {program.deadline ? formatDate(program.deadline) : 'Tanpa batas waktu (∞)'}
                                    </p>
                                </div>
                            </div>
                            
                            {program.published_at && (
                                <div>
                                    <p className="text-sm text-slate-500">Dipublikasikan Pada</p>
                                    <p className="font-medium">{formatDate(program.published_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-slate-800 dark:text-white flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                Informasi Pembuat
                            </h3>
                        </div>
                        <div className="p-6.5 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Tipe Campaigner</p>
                                <p className="font-medium capitalize">{program.campaigner_type}</p>
                            </div>
                            
                            {program.campaigner_type === 'internal' ? (
                                <div>
                                    <p className="text-sm text-slate-500">Nama Staff (Internal)</p>
                                    <p className="font-medium">{program.creator?.name}</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-slate-500">Nama Penggalang</p>
                                        <p className="font-medium">
                                            {program.campaignerProfile?.type === 'lembaga' 
                                                ? program.campaignerProfile.institution_name 
                                                : program.creator?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Email Kontak</p>
                                        <p className="font-medium">{program.creator?.email}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tolak */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Program</DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan agar campaigner dapat memperbaiki dan mengajukan ulang program ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRejectSubmit}>
                        <div className="py-4">
                            <Label htmlFor="rejection_notes" className="mb-2 block">Catatan Penolakan <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="rejection_notes"
                                value={rejectData.rejection_notes}
                                onChange={e => setRejectData('rejection_notes', e.target.value)}
                                placeholder="Contoh: Mohon hapus nomor rekening pribadi yang ada di dalam deskripsi cerita."
                                rows={4}
                                required
                            />
                            {rejectErrors.rejection_notes && <p className="mt-1 text-sm text-red-500">{rejectErrors.rejection_notes}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>Batal</Button>
                            <Button type="submit" variant="destructive" disabled={rejectProcessing}>Kirim Penolakan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        
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
