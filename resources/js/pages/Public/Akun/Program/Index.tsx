import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, Trash2, Target } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency, formatDate, getLocalizedValue } from '@/lib/utils';

interface Program {
    id: number;
    title: { id: string };
    program_code: string;
    category: { title: { id: string }, name: { id: string } };
    target_amount: string | null;
    collected_amount: number;
    status: string;
    cover_image: string;
    created_at: string;
}

interface Props {
    programs: {
        data: Program[];
        current_page: number;
        last_page: number;
        links: any[];
    };
}

export default function AkunProgramIndex({ programs }: Props) {
    const [programToDelete, setProgramToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Program Saya</h1>
                            <p className="text-slate-500 dark:text-gray-400 mt-1">Kelola program penggalangan dana yang Anda buat.</p>
                        </div>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                            <Link href="/akun/programs/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Galang Dana Baru
                            </Link>
                        </Button>
                    </div>

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
                                                    const progress = hasTarget
                                                        ? Math.min(100, Math.round(((program.collected_amount || 0) / parseFloat(program.target_amount!)) * 100))
                                                        : 0;

                                                    return (
                                                        <div className="mt-4 p-3.5 rounded-xl bg-slate-50/80 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Terkumpul</p>
                                                                    <p className="font-bold text-base text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(program.collected_amount)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Target Donasi</p>
                                                                    <p className="font-semibold text-base text-slate-900 dark:text-white mt-0.5">
                                                                        {hasTarget ? formatCurrency(parseFloat(program.target_amount!)) : 'Tanpa Target'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {hasTarget && (
                                                                <div className="mt-3">
                                                                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-gray-400 mb-1.5">
                                                                        <span>Progres Pengumpulan</span>
                                                                        <span className="font-semibold text-slate-700 dark:text-gray-200">{progress}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-200/70 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                                        <div 
                                                                            className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500" 
                                                                            style={{ width: `${progress}%` }} 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
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
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Link href="/akun/programs/create">
                                            Buat Program Sekarang
                                        </Link>
                                    </Button>
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
