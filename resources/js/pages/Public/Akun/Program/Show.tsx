import { Head, Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ArrowLeft, AlertCircle, Info, Calendar, DollarSign, Target, Wallet } from 'lucide-react';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    video_url: string | null;
    rejection_notes: string | null;
    story: { id: string };
    created_at: string;
    published_at: string | null;
    deadline: string | null;
}

interface Props {
    program: Program;
}

export default function AkunProgramShow({ program }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white">Aktif</Badge>;
            case 'pending_verification':
                return <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">Menunggu Verifikasi</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">Selesai</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Ditolak</Badge>;
            case 'draft':
                return <Badge variant="outline" className="border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300">Draft</Badge>;
            case 'closed_manual':
                return <Badge variant="secondary" className="bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200">Ditutup Manual</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={`Detail Program: ${getLocalizedValue(program.title, 'Program')}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                <div className="mb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Button variant="ghost" asChild className="mb-4 -ml-4 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800">
                            <Link href="/akun/programs">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Program
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            Detail Program {getStatusBadge(program.status)}
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-1 font-mono">{program.program_code}</p>
                    </div>
                    
                    <div className="flex gap-2">
                        {['published', 'completed'].includes(program.status) && (
                            <>
                                <Button asChild variant="outline" className="text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                                    <Link href={`/akun/programs/${program.id}/disbursements`}>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Pencairan Dana
                                    </Link>
                                </Button>
                                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                                    <Link href={`/akun/programs/${program.id}/updates`}>
                                        Update Kabar
                                    </Link>
                                </Button>
                            </>
                        )}
                        {['draft', 'rejected'].includes(program.status) && (
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                                <Link href={`/akun/programs/${program.id}/edit`}>
                                    Edit Program
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {program.status === 'rejected' && program.rejection_notes && (
                    <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertTitle className="text-red-900 dark:text-red-200 font-bold">Program Ditolak</AlertTitle>
                        <AlertDescription className="text-red-800 dark:text-red-300/90">
                            <strong>Catatan dari Tim Verifikasi:</strong><br />
                            {program.rejection_notes}
                        </AlertDescription>
                    </Alert>
                )}

                {program.status === 'pending_verification' && (
                    <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <AlertTitle className="text-amber-900 dark:text-amber-200 font-bold">Dalam Proses Verifikasi</AlertTitle>
                        <AlertDescription className="text-amber-800 dark:text-amber-300/90">
                            Program Anda sedang ditinjau oleh tim kami. Proses ini membutuhkan waktu maksimal 2x24 jam kerja.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs py-0 gap-0">
                            {program.cover_image && (
                                <img 
                                    src={`/storage/${program.cover_image}`} 
                                    alt={getLocalizedValue(program.title, 'Cover Program')} 
                                    className="w-full h-[400px] object-cover rounded-t-xl"
                                />
                            )}
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {getLocalizedValue(program.title, 'Program Tanpa Judul')}
                                </h2>
                                <Badge variant="outline" className="mb-6 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300">
                                    {getLocalizedValue(program.category?.name, 'Kategori')}
                                </Badge>
                                
                                <div 
                                    className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-justify text-slate-700 dark:text-gray-300 prose-img:max-w-full prose-img:h-auto prose-img:rounded-md prose-img:mx-auto text-left"
                                    dangerouslySetInnerHTML={{ 
                                        __html: DOMPurify.sanitize(
                                            getLocalizedValue(
                                                program.story, 
                                                '<p class="text-slate-500 dark:text-gray-400 italic">Belum ada cerita atau deskripsi untuk program ini.</p>'
                                            )
                                        ) 
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="overflow-hidden border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs py-0 gap-0">
                            <CardHeader className="bg-slate-50/80 dark:bg-gray-800/60 border-b border-slate-100 dark:border-gray-800 px-6 py-4">
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Ringkasan Donasi</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 dark:bg-blue-950/60 p-2.5 rounded-xl text-blue-600 dark:text-blue-400 mr-4 shrink-0">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-gray-400">Target</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">
                                            {program.target_amount ? formatCurrency(parseFloat(program.target_amount)) : 'Tanpa Target'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-emerald-100 dark:bg-emerald-950/60 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 mr-4 shrink-0">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-gray-400">Terkumpul</p>
                                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(program.collected_amount)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-amber-100 dark:bg-amber-950/60 p-2.5 rounded-xl text-amber-600 dark:text-amber-400 mr-4 shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-gray-400">Batas Waktu</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">
                                            {program.deadline ? formatDate(program.deadline) : 'Tanpa Batas Waktu'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs py-0 gap-0">
                            <CardHeader className="bg-slate-50/80 dark:bg-gray-800/60 border-b border-slate-100 dark:border-gray-800 px-6 py-4">
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Informasi Tambahan</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-gray-800 pb-2.5">
                                    <span className="text-slate-500 dark:text-gray-400 text-sm">Dibuat Pada</span>
                                    <span className="font-medium text-sm text-slate-800 dark:text-gray-200">{formatDate(program.created_at)}</span>
                                </div>
                                {program.published_at && (
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-gray-800 pb-2.5">
                                        <span className="text-slate-500 dark:text-gray-400 text-sm">Dipublikasikan</span>
                                        <span className="font-medium text-sm text-slate-800 dark:text-gray-200">{formatDate(program.published_at)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-gray-400 text-sm">Video Youtube</span>
                                    <span className="font-medium text-sm">
                                        {program.video_url ? (
                                            <a href={program.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Lihat Video</a>
                                        ) : (
                                            <span className="text-slate-400 dark:text-gray-500">Tidak ada</span>
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
