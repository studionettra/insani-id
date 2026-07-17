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

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Donasi</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola data donasi masuk.</p>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                placeholder="Cari ID, nama..." 
                                className="pl-9 h-9 border-gray-200 focus-visible:ring-[#1A56DB] text-sm"
                                defaultValue={filters.search}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="font-medium text-gray-500">ID Transaksi</TableHead>
                                    <TableHead className="font-medium text-gray-500">Tanggal</TableHead>
                                    <TableHead className="font-medium text-gray-500">Donatur</TableHead>
                                    <TableHead className="font-medium text-gray-500">Program</TableHead>
                                    <TableHead className="font-medium text-gray-500">Metode</TableHead>
                                    <TableHead className="font-medium text-gray-500">Nominal</TableHead>
                                    <TableHead className="font-medium text-gray-500">Status</TableHead>
                                    <TableHead className="font-medium text-gray-500 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.data.map((donation: any) => (
                                    <TableRow key={donation.id} className="border-gray-100 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50">
                                        <TableCell className="font-mono text-xs text-gray-600">{donation.donation_code}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{new Date(donation.created_at).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900 text-sm">{donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}</div>
                                            <div className="text-xs text-gray-500">{donation.donor_email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate max-w-[150px] text-sm text-gray-700" title={donation.program?.title?.id || donation.program?.title}>
                                                {donation.program?.title?.id || donation.program?.title}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-sm text-gray-600">{donation.channel}</TableCell>
                                        <TableCell className="font-semibold text-gray-900 text-sm">
                                            Rp {parseInt(donation.amount).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-medium ${
                                                donation.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                                donation.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {donation.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {donation.channel === 'offline' && donation.status === 'pending' && (
                                                    <Button size="sm" onClick={() => confirmManualDonation(donation.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-none h-8" title="Konfirmasi Pembayaran">
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Konfirmasi
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {donations.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                                            Tidak ada data donasi ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 text-xs text-gray-500 text-center bg-gray-50/30 mt-auto">
                        Menampilkan {donations.data.length} data.
                    </div>
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
