import { Head, Link } from '@inertiajs/react';
import { Heart, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle, ShieldCheck, ExternalLink, Filter } from 'lucide-react';
import React, { useState } from 'react';
import DonationReceiptModal from '@/components/donation/DonationReceiptModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DonationItem {
    id: number;
    donation_code: string;
    amount: number;
    unique_code?: number;
    channel: string;
    status: string;
    created_at: string;
    paid_at?: string;
    message?: string;
    is_anonymous: boolean;
    donor_name?: string;
    donor_email?: string;
    donor_phone?: string;
    program?: {
        id: number;
        title: string | { id?: string };
        slug: string;
        cover_image: string;
        category?: {
            name: string | { id?: string };
        };
    };
    payments?: Array<{
        payment_method: string;
        payment_channel?: string;
        gateway_status: string;
        gateway_reference_id?: string;
    }>;
}

interface Props {
    donations: {
        data: DonationItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
    };
}

export default function DonorDonationsIndex({ donations }: Props) {
    const [selectedReceipt, setSelectedReceipt] = useState<DonationItem | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const getProgramTitle = (program: any) => {
        if (!program) return 'Program Kebaikan';
        const title = program.title;
        if (!title) return 'Program Kebaikan';
        if (typeof title === 'string') return title;
        if (typeof title === 'object' && title !== null) {
            if (typeof title.id === 'string' && title.id.trim() !== '') {
                return title.id;
            }
            const values = Object.values(title).filter(v => typeof v === 'string' && v.trim() !== '');
            if (values.length > 0) {
                return values[0] as string;
            }
        }
        return String(title || 'Program Kebaikan');
    };

    const getCategoryName = (category: any) => {
        if (!category) return 'Umum';
        const name = category.name;
        if (!name) return 'Umum';
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            if (typeof name.id === 'string' && name.id.trim() !== '') {
                return name.id;
            }
            const values = Object.values(name).filter(v => typeof v === 'string' && v.trim() !== '');
            if (values.length > 0) {
                return values[0] as string;
            }
        }
        return String(name || 'Umum');
    };


    const filteredDonations = (donations?.data || []).filter((item) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'paid') return item.status === 'paid';
        if (statusFilter === 'pending') return item.status === 'pending';
        if (statusFilter === 'expired') return ['expired', 'failed'].includes(item.status);
        return true;
    });

    return (
        <>
            <Head title="Donasi Saya - Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 lg:p-6 print:hidden">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Donasi Saya
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Lacak seluruh jejak kebaikan, status pembayaran, dan unduh bukti donasi resmi Anda.
                        </p>
                    </div>
                    <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm h-10 px-5 rounded-xl hover:-translate-y-[1px] transition-all text-xs sm:text-sm shrink-0">
                        <Link href="/program">
                            <Heart className="w-4 h-4 mr-2" />
                            Jelajah Program Baru
                        </Link>
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                            statusFilter === 'all'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                        }`}
                    >
                        Semua ({donations.data?.length || 0})
                    </button>
                    <button
                        onClick={() => setStatusFilter('paid')}
                        className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                            statusFilter === 'paid'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                        }`}
                    >
                        Berhasil ({donations.data?.filter(d => d.status === 'paid').length || 0})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                            statusFilter === 'pending'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                        }`}
                    >
                        Menunggu ({donations.data?.filter(d => d.status === 'pending').length || 0})
                    </button>
                    <button
                        onClick={() => setStatusFilter('expired')}
                        className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                            statusFilter === 'expired'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                        }`}
                    >
                        Kedaluwarsa ({donations.data?.filter(d => ['expired', 'failed'].includes(d.status)).length || 0})
                    </button>
                </div>

                {/* Donation List */}
                {filteredDonations.length > 0 ? (
                    <div className="space-y-4">
                        {filteredDonations.map((donation) => {
                            const programTitle = getProgramTitle(donation.program);
                            const categoryName = getCategoryName(donation.program?.category);
                            const totalAmount = Number(donation.amount) + Number(donation.unique_code || 0);

                            return (
                                <Card key={donation.id} className="overflow-hidden border border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-brand-300 dark:hover:border-gray-700 transition-colors">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                                                    {donation.donation_code}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(donation.created_at)}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div>
                                                {donation.status === 'paid' && (
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Berhasil Lunas
                                                    </Badge>
                                                )}
                                                {donation.status === 'pending' && (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-50 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Menunggu Pembayaran
                                                    </Badge>
                                                )}
                                                {['expired', 'failed'].includes(donation.status) && (
                                                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-100 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        {donation.status === 'expired' ? 'Kedaluwarsa' : 'Gagal'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="py-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                            <div className="flex gap-3.5 items-start">
                                                {donation.program?.cover_image ? (
                                                    <img 
                                                        src={donation.program.cover_image.startsWith('http') ? donation.program.cover_image : `/storage/${donation.program.cover_image}`} 
                                                        alt={programTitle}
                                                        className="w-20 h-14 rounded-xl object-cover border border-gray-200/80 dark:border-gray-700 shrink-0 shadow-2xs"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-14 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                                                        <Heart className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-full">
                                                        {categoryName}
                                                    </span>
                                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mt-1 line-clamp-1 hover:text-brand-600 transition-colors">
                                                        <Link href={`/program/${donation.program?.slug || ''}`}>
                                                            {programTitle}
                                                        </Link>
                                                    </h2>
                                                    {donation.message && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                                                            "{donation.message}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-full md:w-auto text-left md:text-right pt-2 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-gray-800">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Total Donasi</div>
                                                <div className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                                                    {formatCurrency(totalAmount)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                Metode: <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                                    {donation.payments?.[0]?.payment_method || donation.channel}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {donation.status === 'paid' && (
                                                    <Button 
                                                        onClick={() => setSelectedReceipt(donation)}
                                                        variant="outline" 
                                                        size="sm"
                                                        className="h-8 rounded-lg text-xs font-semibold border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-600 dark:text-brand-400" />
                                                        Lihat Kuitansi Resmi
                                                    </Button>
                                                )}

                                                <Button 
                                                    asChild 
                                                    size="sm"
                                                    variant={donation.status === 'pending' ? 'default' : 'outline'}
                                                    className={`h-8 rounded-lg text-xs font-semibold ${
                                                        donation.status === 'pending' 
                                                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs' 
                                                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <Link href={`/donasi/status/${donation.donation_code}`}>
                                                        {donation.status === 'pending' ? 'Bayar Sekarang' : 'Detail'}
                                                        <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Pagination Links */}
                        {donations.links && donations.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1.5 pt-4">
                                {donations.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        asChild={Boolean(link.url)}
                                        disabled={!link.url}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={`h-8 min-w-8 text-xs font-semibold rounded-lg ${
                                            link.active 
                                                ? 'bg-brand-600 text-white' 
                                                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Empty State */
                    <Card className="p-10 text-center border-dashed border-2 border-gray-200 dark:border-gray-800">
                        <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                            <Heart className="w-6 h-6" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                            {statusFilter === 'all' ? 'Belum Ada Riwayat Donasi' : 'Tidak Ada Donasi dengan Status Ini'}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                            {statusFilter === 'all' 
                                ? 'Anda belum memiliki riwayat donasi tercatat. Mulai langkah kebaikan pertama Anda bersama Insani Indonesia.' 
                                : 'Silakan pilih filter status lainnya untuk melihat riwayat donasi Anda.'}
                        </p>
                        <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-9 px-5 text-xs font-semibold">
                            <Link href="/program">
                                Jelajah Program Donasi
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Link>
                        </Button>
                    </Card>
                )}

            </div>

            {/* E-Receipt Modal */}
            <DonationReceiptModal 
                receipt={selectedReceipt}
                onClose={() => setSelectedReceipt(null)}
            />
        </>
    );
}
