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
            case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Menunggu</Badge>;
            case 'verified': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Terverifikasi</Badge>;
            case 'rejected': return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>;
            case 'suspended': return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Dibekukan</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Verifikasi Campaigner" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Verifikasi Campaigner</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola pendaftaran penggalang dana (Individu & Lembaga).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={status} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
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

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nama User</TableCell>
                                <TableCell>Tipe</TableCell>
                                <TableCell>Nama Lembaga</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Tanggal Daftar</TableCell>
                                <TableCell className="text-right">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigners.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Tidak ada data yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaigners.data.map((campaigner: any) => (
                                    <TableRow key={campaigner.id}>
                                        <TableCell className="font-medium">{campaigner.id}</TableCell>
                                        <TableCell>{campaigner.user?.name}</TableCell>
                                        <TableCell className="capitalize">{campaigner.type}</TableCell>
                                        <TableCell>{campaigner.type === 'lembaga' ? campaigner.nama_lembaga : '-'}</TableCell>
                                        <TableCell>{getStatusBadge(campaigner.verification_status)}</TableCell>
                                        <TableCell>{new Date(campaigner.created_at).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
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
