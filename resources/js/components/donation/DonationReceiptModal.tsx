import { usePage } from '@inertiajs/react';
import { CheckCircle2, Heart, Mail, MapPin, Phone, Printer, ShieldCheck, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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
    const { siteSettings } = usePage().props as any;
    const [paperSize, setPaperSize] = useState<'A5' | 'A4'>('A5');

    const foundationName = siteSettings?.legal_foundation_name || 'Yayasan Peduli Insani Indonesia';
    const skNumber = siteSettings?.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.Tahun 2019';
    const skLabel = siteSettings?.legal_sk_label || 'SK Kemenkumham RI';
    const operationalPermit = siteSettings?.legal_operational_permit || '';
    const legalNpwp = siteSettings?.legal_npwp || '';
    const siteLogo = siteSettings?.site_logo ? `/storage/${siteSettings.site_logo}` : '/images/logo/logo-landscape-color.png';
    const contactPhone = siteSettings?.contact_phone || '(021) 27871199';
    const contactWa = siteSettings?.contact_donor_support_wa || siteSettings?.contact_whatsapp || '081319456675';
    const contactEmail = siteSettings?.contact_email || 'sapa@insani.id';
    const contactAddress = siteSettings?.contact_address || 'Jln. Moh Kahfi 1 No 90A, Jagakarsa, Jakarta Selatan';
    const operatingHours = siteSettings?.contact_operating_hours || "Senin - Jum'at | 10:00 - 18.00 WIB";
    const holidayNote = siteSettings?.contact_holiday_note || 'Tutup Pada Tanggal Merah & Cuti Bersama';

    useEffect(() => {
        if (!receipt) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [receipt, onClose]);

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
            className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in print:static print:inset-auto print:z-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:block print:overflow-visible"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
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
                className="min-h-full flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 print:p-0 print:m-0 print:block"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <div className="my-auto w-full max-w-2xl flex flex-col gap-3 print:m-0 print:p-0 print:max-w-none print:block">
                    {/* Floating Modal Control Bar (Screen only) */}
                    <div className="sticky top-2 sm:top-4 z-20 flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl text-white print:hidden">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                    <span>Kuitansi Resmi</span>
                                    <span className="font-mono text-[10px] text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                                        {receipt.donation_code}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate hidden xs:block sm:block">
                                    Terverifikasi sistem • Sah tanpa tanda tangan basah
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Paper Size Selector */}
                            <div className="inline-flex rounded-xl p-1 bg-slate-800/80 border border-slate-700/80 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setPaperSize('A5')}
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                                        paperSize === 'A5'
                                            ? 'bg-brand-600 text-white shadow-xs'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                    title="Ukuran A5 (Standar kuitansi resmi)"
                                >
                                    A5 Pas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaperSize('A4')}
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                                        paperSize === 'A4'
                                            ? 'bg-brand-600 text-white shadow-xs'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                    title="Ukuran A4 (Dokumen penuh)"
                                >
                                    A4 Penuh
                                </button>
                            </div>

                            {/* Print Button */}
                            <Button 
                                onClick={handlePrint}
                                size="sm"
                                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold h-8 sm:h-9 px-3 sm:px-4 shadow-sm transition-all flex items-center gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline sm:inline">Cetak / PDF</span>
                            </Button>

                            {/* Close Button */}
                            <Button 
                                onClick={onClose}
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-8 w-8 sm:h-9 sm:w-9 p-0 flex items-center justify-center transition-colors"
                                title="Tutup (Esc)"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        </div>
                    </div>

                    <div 
                        id="printable-receipt-card"
                        className="bg-white dark:bg-gray-900 rounded-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 dark:border-gray-800 print:max-h-none print:overflow-visible print:shadow-none print:border print:border-slate-300 print:rounded-2xl print:m-0 print:w-full print:max-w-none print:bg-white print:text-slate-900"
                    >
                        {/* Outer Content Wrapper */}
                        <div className="flex-1 flex flex-col justify-between">
                    <div>
                        {/* ===================== KOP SURAT RESMI ===================== */}
                        <div className="pb-4 border-b-2 border-slate-800 dark:border-slate-700 print:border-slate-900 print:pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:flex-row print:items-center print:justify-between">
                                {/* Logo & Legal Info */}
                                <div className="flex items-start gap-3">
                                    <img 
                                        src={siteLogo} 
                                        alt={foundationName} 
                                        className="h-10 sm:h-11 w-auto object-contain shrink-0 mt-0.5 print:h-10"
                                    />
                                    <div className="border-l border-slate-200 dark:border-slate-800 print:border-slate-300 pl-3 space-y-0.5">
                                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:text-slate-950 uppercase tracking-tight print:text-xs">
                                            {foundationName}
                                        </h2>
                                        <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 leading-tight print:text-[9.5px]">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">{skLabel}:</span> {skNumber}
                                        </p>
                                        {operationalPermit && (
                                            <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 leading-tight print:text-[9.5px]">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">Izin Kegiatan:</span> {operationalPermit}
                                            </p>
                                        )}
                                        {legalNpwp && (
                                            <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 leading-tight print:text-[9.5px]">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">NPWP:</span> {legalNpwp}
                                            </p>
                                        )}
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
                                    <li><strong>WhatsApp / Telp:</strong> {contactWa}</li>
                                    <li><strong>Telepon Kantor:</strong> {contactPhone}</li>
                                    <li><strong>Email Layanan:</strong> {contactEmail}</li>
                                </ul>
                            </div>

                            {/* Kolom Alamat & Jam Kerja */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 print:bg-slate-50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 print:border-slate-200">
                                <h3 className="font-bold text-slate-900 dark:text-white print:text-slate-950 mb-1 flex items-center gap-1.5 print:text-[10.5px]">
                                    <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 print:text-blue-800 print:w-3 print:h-3" />
                                    Alamat & Jam Kerja
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 print:text-slate-700 print:text-[9.5px]">
                                    <strong>Alamat:</strong> {contactAddress}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 print:text-slate-700 print:text-[9.5px]">
                                    <strong>Operasional:</strong> {operatingHours}
                                </p>
                                {holidayNote && (
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 print:text-slate-600 font-medium print:text-[8.5px]">
                                        * {holidayNote}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Klausul Pengesahan Elektronik & Stempel Sah */}
                        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 print:flex-row print:justify-between">
                            <p className="text-[10px] print:text-[9px] text-slate-500 dark:text-slate-400 print:text-slate-600 text-center sm:text-left print:text-left max-w-sm">
                                Dokumen ini diterbitkan secara elektronik oleh sistem <strong>{foundationName}</strong> dan sah tanpa tanda tangan basah.
                            </p>
                            <div className="shrink-0 flex items-center gap-2.5">
                                {siteSettings?.receipt_stamp_image && (
                                    <img 
                                        src={`/storage/${siteSettings.receipt_stamp_image}`} 
                                        alt="Stempel Yayasan" 
                                        className="h-9 w-auto object-contain opacity-85"
                                    />
                                )}
                                <div className="text-right hidden sm:block print:block">
                                    <span className="text-[10px] font-bold block text-slate-800 dark:text-white print:text-black leading-tight">
                                        {siteSettings?.receipt_signatory_name || 'Pengurus Yayasan'}
                                    </span>
                                    <span className="text-[8px] text-slate-500 dark:text-slate-400 block leading-tight">
                                        {siteSettings?.receipt_signatory_title || 'Divisi Keuangan & Donasi'}
                                    </span>
                                </div>
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
                </div>
            </div>
        </div>
    </div>
</div>
    );
}

