import { Head, Link } from '@inertiajs/react';
import { Heart, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle, Printer, X, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PublicLayout from '@/layouts/PublicLayout';
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

    const handlePrint = () => {
        window.print();
    };

    return (
        <PublicLayout title="Riwayat Donasi Saya">
            <Head title="Donasi Saya - Insani Indonesia" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                            Riwayat Donasi Saya
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Lacak seluruh jejak kebaikan dan unduh bukti donasi resmi Anda.
                        </p>
                    </div>
                    <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-6 shadow-xs">
                        <Link href="/program">
                            <Heart className="w-4 h-4 mr-2" />
                            Donasi Lagi
                        </Link>
                    </Button>
                </div>

                {/* Donation List */}
                {donations.data && donations.data.length > 0 ? (
                    <div className="space-y-4">
                        {donations.data.map((donation) => {
                            const programTitle = getProgramTitle(donation.program);
                            const categoryName = getCategoryName(donation.program?.category);

                            return (
                                <Card key={donation.id} className="overflow-hidden border border-gray-200/80 shadow-xs hover:border-brand-300 transition-colors">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
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
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Berhasil / Lunas
                                                    </Badge>
                                                )}
                                                {donation.status === 'pending' && (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Menunggu Pembayaran
                                                    </Badge>
                                                )}
                                                {['expired', 'failed'].includes(donation.status) && (
                                                    <Badge className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        {donation.status === 'expired' ? 'Kedaluwarsa' : 'Gagal'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 mt-4 items-start sm:items-center justify-between">
                                            <div className="flex gap-3.5 items-center">
                                                {donation.program?.cover_image ? (
                                                    <img 
                                                        src={`/storage/${donation.program.cover_image}`} 
                                                        alt={programTitle} 
                                                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                                                        <Heart className="w-7 h-7" />
                                                    </div>
                                                )}
                                                <div>
                                                    <Badge variant="outline" className="text-[10px] text-brand-600 border-brand-200 mb-1">
                                                        {categoryName}
                                                    </Badge>
                                                    <Link 
                                                        href={`/program/${donation.program?.slug}`}
                                                        className="font-bold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1 block text-sm sm:text-base"
                                                    >
                                                        {programTitle}
                                                    </Link>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Metode: <span className="font-medium text-gray-700 uppercase">{donation.payments?.[0]?.payment_method || donation.channel}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500">Nominal Donasi</div>
                                                    <div className="text-base sm:text-lg font-extrabold text-brand-600">
                                                        {formatCurrency(donation.amount + (donation.unique_code || 0))}
                                                    </div>
                                                </div>

                                                {donation.status === 'paid' && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => setSelectedReceipt(donation)}
                                                        className="rounded-full text-xs font-semibold hover:border-brand-500 hover:text-brand-600"
                                                    >
                                                        Lihat E-Kuitansi
                                                    </Button>
                                                )}

                                                {donation.status === 'pending' && (
                                                    <Button 
                                                        asChild
                                                        size="sm" 
                                                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-semibold"
                                                    >
                                                        <Link href={`/donasi/status/${donation.donation_code}`}>
                                                            Instruksi Bayar
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Pagination */}
                        {donations.links && donations.links.length > 3 && (
                            <div className="flex justify-center gap-1.5 mt-8">
                                {donations.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        asChild={!!link.url}
                                        disabled={!link.url}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={`rounded-lg ${link.active ? 'bg-brand-600 text-white' : ''}`}
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
                    <Card className="border border-dashed border-gray-300 p-12 text-center rounded-3xl">
                        <div className="w-16 h-16 mx-auto bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Riwayat Donasi</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                            Anda belum memiliki riwayat donasi tercatat. Mulai langkah kebaikan pertama Anda sekarang bersama Insani Indonesia.
                        </p>
                        <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-8">
                            <Link href="/program">
                                Cari Program Donasi
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </Card>
                )}

            </div>

            {/* E-Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 print:shadow-none print:border-none print:m-0 print:p-0">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedReceipt(null)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 rounded-full p-1 print:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center pb-6 border-b border-gray-100">
                            <div className="flex items-center justify-center gap-1.5 text-brand-600 font-bold text-lg mb-1">
                                <ShieldCheck className="w-6 h-6" />
                                <span>Insani Indonesia</span>
                            </div>
                            <div className="text-xs text-gray-500">Kuitansi Resmi Tanda Penerimaan Donasi</div>
                            <div className="mt-3 font-mono text-xs font-semibold bg-gray-50 py-1 px-3 rounded-full inline-block text-gray-700">
                                No: {selectedReceipt.donation_code}
                            </div>
                        </div>

                        <div className="py-5 space-y-3.5 text-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-gray-500">Program:</span>
                                <span className="font-semibold text-gray-900 text-right max-w-[220px]">
                                    {getProgramTitle(selectedReceipt.program)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Tanggal Donasi:</span>
                                <span className="font-medium text-gray-800">
                                    {formatDate(selectedReceipt.paid_at || selectedReceipt.created_at)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Status Pembayaran:</span>
                                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Berhasil Lunas
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Metode:</span>
                                <span className="font-medium text-gray-800 uppercase">
                                    {selectedReceipt.payments?.[0]?.payment_method || selectedReceipt.channel}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-baseline">
                                <span className="font-bold text-gray-800">Total Donasi:</span>
                                <span className="text-xl font-extrabold text-brand-600">
                                    {formatCurrency(selectedReceipt.amount + (selectedReceipt.unique_code || 0))}
                                </span>
                            </div>

                            {selectedReceipt.message && (
                                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 italic">
                                    "{selectedReceipt.message}"
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-3 print:hidden">
                            <Button 
                                onClick={handlePrint}
                                variant="outline" 
                                className="w-full rounded-full text-xs font-semibold"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak / PDF
                            </Button>
                            <Button 
                                onClick={() => setSelectedReceipt(null)}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-full text-xs font-semibold"
                            >
                                Tutup
                            </Button>
                        </div>

                        <div className="mt-4 text-[10px] text-center text-gray-400">
                            Dokumen ini diterbitkan secara elektronik oleh sistem Insani Indonesia dan sah tanpa tanda tangan basah.
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
