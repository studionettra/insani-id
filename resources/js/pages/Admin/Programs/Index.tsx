import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface Program {
    id: number;
    title: { id: string };
    program_code: string;
    category: { title: { id: string }, name: { id: string } };
    campaigner_type: string;
    creator: { name: string };
    collected_amount: number;
    status: string;
    published_at: string | null;
}

interface Props {
    programs: {
        data: Program[];
        current_page: number;
        last_page: number;
        links: any[];
    };
    filters: {
        status: string;
    };
}

export default function ProgramsIndex({ programs, filters }: Props) {
    const handleStatusFilter = (status: string) => {
        router.get('/admin/programs', { status }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
            router.delete(`/admin/programs/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Aktif</Badge>;
            case 'pending_verification':
                return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Menunggu Verifikasi</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">Selesai</Badge>;
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
            <Head title="Manajemen Program" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Program</h1>
                
                <div className="flex items-center space-x-4">
                    <Button asChild>
                        <Link href="/admin/programs/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Program
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Tabs Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {[
                    { id: 'semua', label: 'Semua Status' },
                    { id: 'pending_verification', label: 'Menunggu Verifikasi' },
                    { id: 'published', label: 'Aktif' },
                    { id: 'completed', label: 'Selesai' },
                    { id: 'rejected', label: 'Ditolak' },
                    { id: 'draft', label: 'Draft' },
                    { id: 'closed_manual', label: 'Ditutup Manual' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleStatusFilter(tab.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                            filters.status === tab.id
                                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border bg-card text-card-foreground px-5 pt-6 pb-2.5 shadow-sm sm:px-7.5 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode / Judul</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Pembuat</TableHead>
                                <TableHead>Terkumpul</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {programs.data.length > 0 ? (
                                programs.data.map((program) => (
                                    <TableRow key={program.id}>
                                        <TableCell>
                                            <div className="font-medium text-slate-800 dark:text-white">
                                                {program.title}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {program.program_code}
                                            </div>
                                        </TableCell>
                                        <TableCell>{program.category?.name?.id || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div>{program.creator?.name}</div>
                                            <div className="text-xs text-slate-500 capitalize">{program.campaigner_type}</div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(program.collected_amount)}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(program.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/programs/${program.id}`}>
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/programs/${program.id}/edit`}>
                                                        <Edit className="h-4 w-4 text-slate-500" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(program.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        Tidak ada data program.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {programs.last_page > 1 && (
                    <div className="flex justify-center mt-4 pb-4">
                        <div className="flex space-x-1">
                            {programs.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
        </>
        
    );
}

ProgramsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Program',
            href: '/admin/programs',
        },
    ],
};
