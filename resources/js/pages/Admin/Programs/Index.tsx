import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface Program {
    id: number;
    title: { id: string };
    program_code: string;
    cover_image: string;
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
            <Head title="Manajemen Program" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Program</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola semua kampanye dan program donasi yang ada.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Link href="/admin/programs/create">
                                <Plus className="mr-2 h-4 w-4" /> Buat Program
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tabs Filter */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 border-b border-gray-100">
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
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                                filters.status === tab.id
                                    ? 'border-[#1A56DB] text-[#1A56DB]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-medium text-gray-500">Kode / Judul</TableHead>
                                <TableHead className="font-medium text-gray-500 w-1/8">Cover</TableHead>
                                <TableHead className="font-medium text-gray-500">Kategori</TableHead>
                                <TableHead className="font-medium text-gray-500">Pembuat</TableHead>
                                <TableHead className="font-medium text-gray-500">Terkumpul</TableHead>
                                <TableHead className="font-medium text-gray-500">Status</TableHead>
                                <TableHead className="text-center font-medium text-gray-500 ">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {programs.data.length > 0 ? (
                                programs.data.map((program) => (
                                    <TableRow key={program.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-gray-900">
                                                {program.title}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-0.5">
                                                {program.program_code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <img
                                                src={`/storage/${program.cover_image}`}
                                                alt={program.title}
                                                className="h-20 w-35 rounded-md object-cover border border-gray-200"
                                            />
                                        </TableCell>
                                        <TableCell className="text-gray-600">{program.category?.name?.id || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{program.creator?.name}</div>
                                            <div className="text-xs text-gray-500 capitalize mt-0.5">{program.campaigner_type}</div>
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">{formatCurrency(program.collected_amount)}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(program.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-[#1A56DB] hover:bg-blue-50 hover:text-[#1e40af]">
                                                    <Link href={`/admin/programs/${program.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                                                    <Link href={`/admin/programs/${program.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(program.id)} className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-32 text-gray-500">
                                        Tidak ada data program.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {programs.last_page > 1 && (
                    <div className="flex justify-center mt-2">
                        <div className="flex space-x-1">
                            {programs.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-[#1A56DB] text-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
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
