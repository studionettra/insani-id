import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye, CheckCircle } from 'lucide-react';
import { index as donationsIndex, confirm as donationsConfirm } from '@/routes/admin/donations';
import { route as wayfinder } from '@/routes/admin/wayfinder';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Index({ donations, filters }: any) {
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get(donationsIndex.url({ search: e.currentTarget.value, status: filters.status }), undefined, { preserveState: true });
        }
    };

    const confirmManualDonation = (donationId: number) => {
        if (window.confirm('Apakah Anda yakin donasi ini telah dibayar?')) {
            router.post(donationsConfirm.url({ donation: donationId }));
        }
    };

    return (
        <>
            <Head title="Manajemen Donasi" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Manajemen Donasi</h1>
            </div>

            <div className="bg-card text-card-foreground rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Cari ID, nama..." 
                            className="pl-9 h-10 bg-background"
                            defaultValue={filters.search}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>ID Transaksi</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Donatur</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead>Nominal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donations.data.map((donation: any) => (
                                <TableRow key={donation.id}>
                                    <TableCell className="font-mono text-sm">{donation.donation_code}</TableCell>
                                    <TableCell>{new Date(donation.created_at).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-800">{donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}</div>
                                        <div className="text-xs text-slate-500">{donation.donor_email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="truncate max-w-[150px]" title={donation.program?.title?.id || donation.program?.title}>
                                            {donation.program?.title?.id || donation.program?.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{donation.channel}</TableCell>
                                    <TableCell className="font-bold text-slate-800">
                                        Rp {parseInt(donation.amount).toLocaleString('id-ID')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            donation.status === 'paid' ? 'success' :
                                            donation.status === 'pending' ? 'warning' : 'destructive'
                                        }>
                                            {donation.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {donation.channel === 'offline' && donation.status === 'pending' && (
                                                <Button size="sm" onClick={() => confirmManualDonation(donation.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white" title="Konfirmasi Pembayaran">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {donations.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                        Tidak ada data donasi ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination placeholder if needed, omitted for brevity but should ideally be included */}
                <div className="p-4 border-t text-sm text-slate-500 text-center">
                    Menampilkan {donations.data.length} data.
                </div>
            </div>
        
        </>
        
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Donasi',
            href: '/admin/donations',
        },
    ],
};
