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
import DOMPurify from 'dompurify';

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
                return <Badge variant="outline" className="bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 border-0 font-medium">Aktif</Badge>;
            case 'pending_verification':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20 border-0 font-medium">Menunggu Verifikasi</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 border-0 font-medium">Selesai</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 border-0 font-medium">Ditolak</Badge>;
            case 'draft':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20 border-0 font-medium">Draft</Badge>;
            case 'closed_manual':
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 border-0 font-medium">Ditutup Manual</Badge>;
            default:
                return <Badge variant="outline" className="font-medium">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={`Detail Program: ${program.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <Button variant="outline" size="sm" asChild className="mb-6 border-gray-200 hover:bg-gray-50 text-gray-600">
                        <Link href="/admin/programs"><ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Manajemen Program</Link>
                    </Button>
                </div>

                {errors.status && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{errors.status}</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Detail Program</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Tinjau informasi program donasi.
                        </p>
                    </div>
                    <div>
                        {getStatusBadge(program.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Left Column - Details */}
                    <div className="xl:col-span-2 space-y-6">
                        
                        {program.status === 'rejected' && program.rejection_notes && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
                                <div className="flex items-start">
                                    <Info className="h-5 w-5 text-red-600 mr-3 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="text-red-900 font-semibold mb-1">Program Ditolak</h4>
                                        <p className="text-sm text-red-700 leading-relaxed">
                                            <strong>Catatan Penolakan:</strong> {program.rejection_notes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900">
                                    Informasi Utama
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <img 
                                        src={`/storage/${program.cover_image}`} 
                                        alt={program.title} 
                                        className="w-full h-64 sm:h-[400px] object-cover rounded-lg border border-gray-100"
                                    />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                    {program.title}
                                </h2>
                                <p className="text-gray-500 mb-6 font-mono text-sm tracking-wide">Kode: {program.program_code}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                        <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Target Donasi</p>
                                        <p className="font-bold text-2xl text-gray-900 tracking-tight">
                                            {program.target_amount ? formatCurrency(parseFloat(program.target_amount)) : 'Tanpa Target'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                                        <p className="text-sm font-medium text-blue-600 mb-1 uppercase tracking-wider">Terkumpul</p>
                                        <p className="font-bold text-2xl text-[#1A56DB] tracking-tight">
                                            {formatCurrency(program.collected_amount)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-4">Cerita Program</h4>
                                    <div 
                                        className="prose prose-sm sm:prose-base max-w-none text-gray-600 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(program.story.id || program.story as unknown as string) }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Action Card for Verification */}
                        {program.status === 'pending_verification' && (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 overflow-hidden sticky top-6">
                                <div className="border-b border-yellow-200/60 bg-yellow-100/50 py-4 px-6">
                                    <h3 className="font-semibold text-yellow-900 flex items-center">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Aksi Verifikasi
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-sm text-yellow-800 leading-relaxed">
                                        Program ini menunggu persetujuan Anda sebelum dapat dipublikasikan dan menerima donasi.
                                    </p>
                                    <div className="pt-2 space-y-3">
                                        <Button 
                                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                                            onClick={handleApprove}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" /> Setujui & Publikasikan
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                            onClick={() => setIsRejectModalOpen(true)}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Tolak Program
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {program.status === 'published' && (
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden sticky top-6">
                                <div className="p-6">
                                    <Button 
                                        variant="outline"
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={handleCloseProgram}
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Tutup Program (Manual)
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900">
                                    Informasi Metadata
                                </h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kategori</p>
                                    <p className="font-medium text-gray-900">{program.category?.name?.id || 'N/A'}</p>
                                </div>
                                
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Batas Waktu</p>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        <p className="font-medium text-gray-900">
                                            {program.deadline ? formatDate(program.deadline) : 'Tanpa batas waktu (∞)'}
                                        </p>
                                    </div>
                                </div>
                                
                                {program.published_at && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Dipublikasikan Pada</p>
                                        <p className="font-medium text-gray-900">{formatDate(program.published_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <User className="mr-2 h-4 w-4 text-gray-500" />
                                    Informasi Pembuat
                                </h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tipe Campaigner</p>
                                    <p className="font-medium text-gray-900 capitalize">{program.campaigner_type}</p>
                                </div>
                                
                                {program.campaigner_type === 'internal' ? (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nama Staff (Internal)</p>
                                        <p className="font-medium text-gray-900">{program.creator?.name}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nama Penggalang</p>
                                            <p className="font-medium text-gray-900">
                                                {program.campaignerProfile?.type === 'lembaga' 
                                                    ? program.campaignerProfile.institution_name 
                                                    : program.creator?.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Kontak</p>
                                            <p className="font-medium text-gray-900">{program.creator?.email}</p>
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
                <DialogContent className="sm:max-w-[425px] border-0 shadow-lg p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900">Tolak Program</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Berikan alasan penolakan agar campaigner dapat memperbaiki dan mengajukan ulang program ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRejectSubmit}>
                        <div className="px-6 py-4">
                            <Label htmlFor="rejection_notes" className="text-sm font-medium text-gray-700 mb-2 block">Catatan Penolakan <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="rejection_notes"
                                value={rejectData.rejection_notes}
                                onChange={e => setRejectData('rejection_notes', e.target.value)}
                                placeholder="Contoh: Mohon hapus nomor rekening pribadi yang ada di dalam deskripsi cerita."
                                rows={4}
                                required
                                className="border-gray-200 focus-visible:ring-red-500 min-h-[120px]"
                            />
                            {rejectErrors.rejection_notes && <p className="mt-1.5 text-xs text-red-500">{rejectErrors.rejection_notes}</p>}
                        </div>
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-100">Batal</Button>
                            <Button type="submit" variant="destructive" disabled={rejectProcessing} className="bg-red-600 hover:bg-red-700 text-white">Kirim Penolakan</Button>
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
