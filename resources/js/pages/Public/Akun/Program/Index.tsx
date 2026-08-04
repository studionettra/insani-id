import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/utils';

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
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin membatalkan/menghapus program ini?')) {
            router.delete(`/akun/programs/${id}`);
        }
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
        <AppLayout breadcrumbs={[{ title: 'Program Saya', href: '/akun/programs' }]}>
            <Head title="Program Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 mx-auto w-full max-w-5xl">
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Program Saya</h1>
                            <p className="text-slate-500 mt-1">Kelola program penggalangan dana yang Anda buat.</p>
                        </div>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/akun/programs/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Galang Dana Baru
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {programs.data.length > 0 ? (
                            programs.data.map((program) => (
                                <Card key={program.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-48 h-48 md:h-auto">
                                            <img 
                                                src={`/storage/${program.cover_image}`} 
                                                alt={program.title} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <Badge variant="outline" className="mb-2 mr-2">{program.category?.name?.id || 'Kategori'}</Badge>
                                                        {getStatusBadge(program.status)}
                                                    </div>
                                                    <span className="text-sm text-slate-400 font-mono">{program.program_code}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">
                                                    {program.title}
                                                </h3>
                                                
                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Terkumpul</p>
                                                        <p className="font-bold text-blue-600">{formatCurrency(program.collected_amount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Target</p>
                                                        <p className="font-semibold text-slate-700">
                                                            {program.target_amount ? formatCurrency(parseFloat(program.target_amount)) : '∞'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                                                <div className="text-sm text-slate-500">
                                                    Dibuat pada {formatDate(program.created_at)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/akun/programs/${program.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> Detail
                                                        </Link>
                                                    </Button>
                                                    
                                                    {['published', 'completed'].includes(program.status) && (
                                                        <Button variant="outline" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                                            <Link href={`/akun/programs/${program.id}/updates`}>
                                                                <span className="flex items-center">Update Kabar</span>
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {['active', 'completed'].includes(program.status) && (
                                                        <Button variant="outline" size="sm" asChild className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                            <Link href={`/akun/programs/${program.id}/disbursements`}>
                                                                <span className="flex items-center">Pencairan</span>
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {['draft', 'rejected'].includes(program.status) && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/akun/programs/${program.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    
                                                    {program.status !== 'published' && program.status !== 'completed' && program.status !== 'closed_manual' && (
                                                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(program.id)}>
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
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada program</h3>
                                    <p className="text-slate-500 mb-6 max-w-md">
                                        Anda belum membuat program penggalangan dana apapun. Mulai tebarkan kebaikan dengan membuat program pertama Anda.
                                    </p>
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
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
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
