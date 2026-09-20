import { CheckCircle2, Heart, Mail, MapPin, Phone, Printer, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface DonationReceiptData {
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
        slug?: string;
        category?: {
            name: string | { id?: string };
        };
    };
    payments?: Array<{
        payment_method: string;
        payment_channel?: string;
        gateway_status?: string;
        gateway_reference_id?: string;
    }>;
}

interface Props {
    receipt: DonationReceiptData | null;
    onClose: () => void;
}

export default function DonationReceiptModal({ receipt, onClose }: Props) {
    const [paperSize, setPaperSize] = useState<'A5' | 'A4'>('A5');

    if (!receipt) return null;

    const getProgramTitle = (program: any): string => {
        if (!program) return 'Program Kebaikan Insani';
        const title = program.title;
        if (!title) return 'Program Kebaikan Insani';
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
        return String(title || 'Program Kebaikan Insani');
    };

    const getCategoryName = (category: any): string => {
        if (!category) return 'Program Kemanusiaan';
        const name = category.name;
        if (!name) return 'Program Kemanusiaan';
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
        return String(name || 'Program Kemanusiaan');
    };

    const handlePrint = () => {
        window.print();
    };

    const programTitle = getProgramTitle(receipt.program);
    const categoryName = getCategoryName(receipt.program?.category);
    const totalAmount = Number(receipt.amount) + Number(receipt.unique_code || 0);
    const paymentMethodDisplay = receipt.payments?.[0]?.payment_channel || receipt.payments?.[0]?.payment_method || receipt.channel;
    const donorDisplayName = receipt.is_anonymous ? 'Hamba Allah (Anonim)' : (receipt.donor_name || 'Donatur Insani');
    const transactionDate = receipt.paid_at || receipt.created_at;

    return (
        <div 
            id="printable-receipt-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in print:static print:inset-auto print:z-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:block"
        >
            {/* Dynamic Print Page Size Stylesheet */}
            <style>{`
                @media print {
                    @page {
                        size: ${paperSize === 'A5' ? 'A5 portrait' : 'A4 portrait'};
                        margin: ${paperSize === 'A5' ? '6mm 7mm' : '10mm 12mm'};
                    }
                    ${paperSize === 'A4' ? `
                        #printable-receipt-card {
                            min-height: 260mm !important;
                            display: flex !important;
                            flex-direction: column !important;
                            justify-content: space-between !important;
                            padding: 32px 36px !important;
                        }
                    ` : `
                        #printable-receipt-card {
                            min-height: 0 !important;
                            padding: 20px 22px !important;
                            max-width: 100% !important;
                        }
                    `}
                }
            `}</style>

            <div 
                id="printable-receipt-card"
                className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:shadow-none print:border print:border-slate-300 print:rounded-2xl print:m-0 print:w-full print:max-w-none print:bg-white print:text-slate-900"
            >
                {/* Close Button (Screen only) */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors print:hidden"
                    title="Tutup Kuitansi"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Outer Content Wrapper */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        {/* ===================== KOP SURAT RESMI ===================== */}
                        <div className="pb-4 border-b-2 border-slate-800 dark:border-slate-700 print:border-slate-900 print:pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:flex-row print:items-center print:justify-between">
                                {/* Logo & Legal Info */}
                                <div className="flex items-start gap-3">
                                    <img 
                                        src="/images/logo/logo-landscape-color.png" 
                                        alt="Yayasan Peduli Insani Indonesia" 
                                        className="h-10 sm:h-11 w-auto object-contain shrink-0 mt-0.5 print:h-10"
                                    />
                                    <div className="border-l border-slate-200 dark:border-slate-800 print:border-slate-300 pl-3 space-y-0.5">
                                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:text-slate-950 uppercase tracking-tight print:text-xs">
                                            Yayasan Peduli Insani Indonesia
                                        </h2>
                                        <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 leading-tight print:text-[9.5px]">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">SK Menkumham:</span> AHU-0007222.AH.01.12.TAHUN 2024
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 leading-tight print:text-[9.5px]">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">Izin Kegiatan:</span> NOMOR 1/F.3.1/31.74.09.1001.24.K-2/4/TM.17.02/e/2025
                                        </p>
                                    </div>
                                </div>

                                {/* Document Title & Reference */}
                                <div className="text-left sm:text-right shrink-0 print:text-right">
                                    <div className="inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 print:bg-blue-50 rounded text-insani-blue dark:text-blue-400 print:text-blue-800 font-extrabold text-xs tracking-wider uppercase mb-0.5 print:text-[11px]">
                                        Kuitansi Resmi Donasi
                                    </div>
                                    <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 print:text-slate-900 print:text-[11px]">
                                        No: {receipt.donation_code}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 print:text-[10px]">
                                        {formatDate(transactionDate)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===================== STATUS & VERIFICATION BADGE ===================== */}
                        <div className="py-3 print:py-2 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-slate-200 dark:border-slate-800 print:border-slate-300">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 print:bg-emerald-50 print:text-emerald-800 print:border-emerald-300 text-xs px-2.5 py-0.5 font-bold flex items-center gap-1.5 print:text-[10.5px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 print:w-3 print:h-3" />
                                    PEMBAYARAN LUNAS & TERVERIFIKASI
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 flex items-center gap-1.5 font-medium print:text-[10px]">
                                <ShieldCheck className="w-3.5 h-3.5 text-insani-blue print:text-blue-700" />
                                Bukti Transaksi Sah Sistem Insani
                            </div>
                        </div>

                        {/* ===================== DETAIL DONASI & DONATUR ===================== */}
                        <div className="py-3 print:py-2 space-y-2.5 print:space-y-1.5 text-xs sm:text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-1 border-b border-slate-100 dark:border-slate-800/80 print:border-slate-200 print:grid-cols-3 print:py-1">
                                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium print:text-xs">Telah Diterima Dari</span>
                                <div className="sm:col-span-2 print:col-span-2">
                                    <span className="font-bold text-slate-900 dark:text-white print:text-slate-950 text-sm print:text-xs">
                                        {donorDisplayName}
                                    </span>
                                    {receipt.donor_email && (
                                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 print:text-[9.5px]">
                                            {receipt.donor_email}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-1 border-b border-slate-100 dark:border-slate-800/80 print:border-slate-200 print:grid-cols-3 print:py-1">
                                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium print:text-xs">Penyaluran Program</span>
                                <div className="sm:col-span-2 print:col-span-2">
                                    <span className="font-semibold text-slate-900 dark:text-white print:text-slate-950 leading-snug block print:text-xs">
                                        {programTitle}
                                    </span>
                                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-insani-blue dark:text-blue-400 print:text-blue-800 bg-blue-50 dark:bg-blue-950/40 print:bg-blue-50 px-2 py-0.5 rounded print:text-[9.5px]">
                                        Kategori: {categoryName}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-1 border-b border-slate-100 dark:border-slate-800/80 print:border-slate-200 print:grid-cols-3 print:py-1">
                                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium print:text-xs">Metode Pembayaran</span>
                                <div className="sm:col-span-2 print:col-span-2">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-slate-900 uppercase print:text-xs">
                                        {paymentMethodDisplay}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-1 border-b border-slate-100 dark:border-slate-800/80 print:border-slate-200 print:grid-cols-3 print:py-1">
                                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium print:text-xs">Waktu Transaksi</span>
                                <div className="sm:col-span-2 print:col-span-2">
                                    <span className="font-medium text-slate-800 dark:text-slate-200 print:text-slate-900 print:text-xs">
                                        {formatDate(transactionDate)}
                                    </span>
                                </div>
                            </div>

                            {/* ===================== HIGHLIGHT TOTAL BOX ===================== */}
                            <div className="my-3 print:my-2 p-3.5 print:p-3 rounded-xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/40 dark:from-slate-800/60 dark:to-slate-800/30 print:bg-slate-100 print:border print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 print:flex-row print:items-center">
                                <div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 print:text-slate-700 block print:text-[10.5px]">
                                        Jumlah Donasi Diterima
                                    </span>
                                    {Boolean(receipt.unique_code) && (
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 print:text-[9.5px]">
                                            (Pokok: {formatCurrency(receipt.amount)} + Kode Unik: Rp {receipt.unique_code})
                                        </span>
                                    )}
                                </div>
                                <div className="text-2xl font-black text-brand-600 dark:text-brand-400 print:text-blue-900 tracking-tight print:text-xl">
                                    {formatCurrency(totalAmount)}
                                </div>
                            </div>

                            {/* Doa / Pesan Donatur jika ada */}
                            {receipt.message && (
                                <div className="p-3 print:p-2.5 bg-slate-50 dark:bg-slate-800/50 print:bg-slate-50 rounded-xl border border-slate-100 dark:border-slate-800 print:border-slate-200 text-xs text-slate-700 dark:text-slate-300 print:text-slate-800 italic print:text-[10px] print:my-1.5">
                                    <span className="font-semibold not-italic block mb-0.5 text-slate-800 dark:text-slate-200 print:text-slate-900">
                                        Doa / Pesan Kebaikan:
                                    </span>
                                    "{receipt.message}"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===================== FOOTER INFORMASI LEGAL & DUKUNGAN DONATUR ===================== */}
                    <div className="pt-3 mt-2 border-t-2 border-slate-200 dark:border-slate-800 print:border-slate-300 text-[11px] print:text-[10px] leading-relaxed">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 print:grid-cols-2 print:gap-2.5 print:pb-2">
                            {/* Kolom Dukungan Donatur */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 print:bg-slate-50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 print:border-slate-200">
                                <h3 className="font-bold text-slate-900 dark:text-white print:text-slate-950 mb-1 flex items-center gap-1.5 print:text-[10.5px]">
                                    <Phone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 print:text-blue-800 print:w-3 print:h-3" />
                                    Dukungan Donatur
                                </h3>
                                <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 print:text-slate-700 print:text-[9.5px]">
                                    <li><strong>WhatsApp / Telp:</strong> 0813-1945-6675</li>
                                    <li><strong>Telepon Kantor:</strong> (021) 38820199</li>
                                    <li><strong>Email Layanan:</strong> sapa@insani.id</li>
                                </ul>
                            </div>

                            {/* Kolom Alamat & Jam Kerja */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 print:bg-slate-50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 print:border-slate-200">
                                <h3 className="font-bold text-slate-900 dark:text-white print:text-slate-950 mb-1 flex items-center gap-1.5 print:text-[10.5px]">
                                    <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 print:text-blue-800 print:w-3 print:h-3" />
                                    Alamat & Jam Kerja
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 print:text-slate-700 print:text-[9.5px]">
                                    <strong>Alamat:</strong> Jln. Moh Kahfi 1 No 90A
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 print:text-slate-700 print:text-[9.5px]">
                                    <strong>Operasional:</strong> Senin - Jum'at | 10:00 - 18.00 WIB
                                </p>
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 print:text-slate-600 font-medium print:text-[8.5px]">
                                    * Tutup Pada Tanggal Merah & Cuti Bersama
                                </p>
                            </div>
                        </div>

                        {/* Klausul Pengesahan Elektronik & Stempel Sah */}
                        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 print:flex-row print:justify-between">
                            <p className="text-[10px] print:text-[9px] text-slate-500 dark:text-slate-400 print:text-slate-600 text-center sm:text-left print:text-left max-w-sm">
                                Dokumen ini diterbitkan secara elektronik oleh sistem <strong>Yayasan Peduli Insani Indonesia</strong> dan sah tanpa tanda tangan basah.
                            </p>
                            <div className="shrink-0 flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800 print:border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 print:bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-800 dark:text-emerald-300 print:text-emerald-900">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 print:text-emerald-700 shrink-0" />
                                <div className="text-[8.5px] font-bold uppercase tracking-wide leading-tight">
                                    Terverifikasi Sah
                                    <span className="block font-normal text-[7.5px] opacity-80">Yayasan Peduli Insani</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===================== CONTROLS & TOMBOL AKSI (SCREEN ONLY) ===================== */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                    {/* Paper Size Selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Ukuran Kertas:</span>
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setPaperSize('A5')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    paperSize === 'A5'
                                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Ukuran A5 (Kwitansi standar pas tanpa ruang kosong berlebih)"
                            >
                                A5 (Kwitansi Pas)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaperSize('A4')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    paperSize === 'A4'
                                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Ukuran A4 (Dokumen penuh)"
                            >
                                A4 (Dokumen Penuh)
                            </button>
                        </div>
                    </div>

                    {/* Print & Close Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button 
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold h-10 px-5 shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Cetak / Simpan PDF
                        </Button>
                        <Button 
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 sm:flex-none rounded-xl text-xs sm:text-sm font-semibold h-10 px-5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
