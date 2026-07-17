import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function CampaignersIndex({ campaigners, filters }: any) {
    const [status, setStatus] = useState(filters.status || 'pending');

    const handleFilterChange = (value: string) => {
        setStatus(value);
        router.get(
            '/admin/campaigners',
            { status: value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20 border-0 font-medium">Menunggu</Badge>;
            case 'verified': return <Badge variant="outline" className="bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 border-0 font-medium">Terverifikasi</Badge>;
            case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 border-0 font-medium">Ditolak</Badge>;
            case 'suspended': return <Badge variant="outline" className="bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20 border-0 font-medium">Dibekukan</Badge>;
            default: return <Badge variant="outline" className="font-medium">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Verifikasi Campaigner" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Verifikasi Campaigner</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola pendaftaran penggalang dana (Individu & Lembaga).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={status} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px] bg-white border-gray-200 focus:ring-[#1A56DB]">
                                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Menunggu (Pending)</SelectItem>
                                <SelectItem value="verified">Terverifikasi</SelectItem>
                                <SelectItem value="rejected">Ditolak</SelectItem>
                                <SelectItem value="suspended">Dibekukan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableCell className="font-medium text-gray-500 w-16">ID</TableCell>
                                <TableCell className="font-medium text-gray-500">Nama User</TableCell>
                                <TableCell className="font-medium text-gray-500">Tipe</TableCell>
                                <TableCell className="font-medium text-gray-500">Nama Lembaga</TableCell>
                                <TableCell className="font-medium text-gray-500">Status</TableCell>
                                <TableCell className="font-medium text-gray-500">Tanggal Daftar</TableCell>
                                <TableCell className="text-right font-medium text-gray-500">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigners.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                        Tidak ada data yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaigners.data.map((campaigner: any) => (
                                    <TableRow key={campaigner.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="text-gray-500">{campaigner.id}</TableCell>
                                        <TableCell className="font-medium text-gray-900">{campaigner.user?.name}</TableCell>
                                        <TableCell className="capitalize text-gray-600">{campaigner.type}</TableCell>
                                        <TableCell className="text-gray-600">{campaigner.type === 'lembaga' ? campaigner.nama_lembaga : '-'}</TableCell>
                                        <TableCell>{getStatusBadge(campaigner.verification_status)}</TableCell>
                                        <TableCell className="text-gray-600">{new Date(campaigner.created_at).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="text-[#1A56DB] hover:text-[#1e40af] hover:bg-blue-50 font-medium"
                                            >
                                                <Link href={`/admin/campaigners/${campaigner.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" /> Detail
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

CampaignersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Verifikasi Campaigner',
            href: '#',
        },
    ],
};
