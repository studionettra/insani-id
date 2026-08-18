import { Head, Link, router } from '@inertiajs/react';
import { Search, Filter, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from '@/components/ui/dialog';
import { index as donationsIndex, confirm as donationsConfirm } from '@/routes/admin/donations';
import { route as wayfinder } from '@/routes/admin/wayfinder';

export default function Index({ donations, filters }: any) {
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmingDonation, setConfirmingDonation] = useState<number | null>(null);
    const [loadingConfirm, setLoadingConfirm] = useState(false);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get(donationsIndex.url({ search: e.currentTarget.value, status: filters.status }), undefined, { preserveState: true });
        }
    };

    const confirmManualDonation = (donationId: number) => {
        setConfirmingDonation(donationId);
        setIsConfirmDialogOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (!confirmingDonation) return;

        setLoadingConfirm(true);
        try {
            await router.post(
                donationsConfirm.url({ donation: confirmingDonation }),
                {},
                {
                    onSuccess: () => {
                        setIsConfirmDialogOpen(false);
                        setConfirmingDonation(null);
                        toast.success('Donasi berhasil dikonfirmasi!');
                    },
                    onError: () => {
                        toast.error('Gagal mengkonfirmasi donasi. Silakan coba lagi.');
                    },
                }
            );
        } finally {
            setLoadingConfirm(false);
        }
    };

    const handleCancelConfirm = () => {
        setIsConfirmDialogOpen(false);
        setConfirmingDonation(null);
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

            {/* Full Screen SweetAlert-style Confirm Dialog with Premium Design */}
            <Dialog
                open={isConfirmDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCancelConfirm();
                    }
                }}
            >
                <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 mx-auto">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
                                <AlertCircle className="h-8 w-8" />
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                                Konfirmasi Pembayaran Donasi
                            </h3>

                            {/* Description */}
                            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                                Apakah Anda yakin ingin mengkonfirmasi donasi ini?<br />
                                Pastikan pembayaran sudah berhasil dilakukan sebelum mengkonfirmasi.
                            </p>

                            {/* Buttons */}
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={handleCancelConfirm}
                                    disabled={loadingConfirm}
                                    className="flex-1 px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmSubmit}
                                    disabled={loadingConfirm}
                                    className="flex-1 px-6 py-3 rounded-xl bg-[#1A56DB] hover:bg-[#1A4DB5] text-white font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingConfirm ? 'Mengkonfirmasi...' : 'Ya, Konfirmasi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
