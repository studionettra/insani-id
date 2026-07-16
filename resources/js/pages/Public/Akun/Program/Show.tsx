import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Info, Calendar, DollarSign, Target } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
        <PublicLayout>
            <Head title={`Detail Program - ${program.title}`} />

            <div className="bg-slate-50 py-12 min-h-screen">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <Button variant="ghost" asChild className="mb-4 -ml-4">
                                <Link href="/akun/programs">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Daftar Program
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                Detail Program {getStatusBadge(program.status)}
                            </h1>
                            <p className="text-slate-500 mt-1 font-mono">{program.program_code}</p>
                        </div>
                        
                        {['draft', 'rejected'].includes(program.status) && (
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href={`/akun/programs/${program.id}/edit`}>
                                    Edit Program
                                </Link>
                            </Button>
                        )}
                    </div>

                    {program.status === 'rejected' && program.rejection_notes && (
                        <Alert variant="destructive" className="mb-6 bg-red-50 text-red-800 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800 font-bold">Program Ditolak</AlertTitle>
                            <AlertDescription className="text-red-700">
                                <strong>Catatan dari Tim Verifikasi:</strong><br />
                                {program.rejection_notes}
                            </AlertDescription>
                        </Alert>
                    )}

                    {program.status === 'pending_verification' && (
                        <Alert className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200">
                            <Info className="h-4 w-4 text-yellow-600" />
                            <AlertTitle className="text-yellow-800 font-bold">Dalam Proses Verifikasi</AlertTitle>
                            <AlertDescription className="text-yellow-700">
                                Program Anda sedang ditinjau oleh tim kami. Proses ini membutuhkan waktu maksimal 2x24 jam kerja.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <img 
                                    src={`/storage/${program.cover_image}`} 
                                    alt={program.title} 
                                    className="w-full h-[400px] object-cover rounded-t-lg"
                                />
                                <CardContent className="pt-6">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                        {program.title}
                                    </h2>
                                    <Badge variant="outline" className="mb-6">{program.category?.name?.id || 'Kategori'}</Badge>
                                    
                                    <div className="prose max-w-none text-slate-600 whitespace-pre-wrap">
                                        {program.story}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg">Ringkasan Donasi</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium">Target</p>
                                            <p className="font-bold text-slate-800">
                                                {program.target_amount ? formatCurrency(parseFloat(program.target_amount)) : 'Tanpa Target'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600 mr-4">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium">Terkumpul</p>
                                            <p className="font-bold text-green-600">{formatCurrency(program.collected_amount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mr-4">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium">Batas Waktu</p>
                                            <p className="font-bold text-slate-800">
                                                {program.deadline ? formatDate(program.deadline) : 'Tanpa Batas Waktu'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500 text-sm">Dibuat Pada</span>
                                        <span className="font-medium text-sm">{formatDate(program.created_at)}</span>
                                    </div>
                                    {program.published_at && (
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500 text-sm">Dipublikasikan</span>
                                            <span className="font-medium text-sm">{formatDate(program.published_at)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-sm">Video Youtube</span>
                                        <span className="font-medium text-sm text-blue-600">
                                            {program.video_url ? (
                                                <a href={program.video_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Lihat Video</a>
                                            ) : 'Tidak ada'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
