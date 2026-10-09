import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Printer,
    CheckCircle2,
    ShieldCheck,
    FileText,
    ReceiptText,
    Landmark,
    MapPin,
    Users,
    FileCheck,
    Info,
} from 'lucide-react';
import React from 'react';
import BankLogo from '@/components/ui/bank-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah, formatDate, getLocalizedValue, terbilang } from '@/lib/utils';

export default function Receipt({ program, disbursement }: any) {
    const programTitle = getLocalizedValue(program?.title, 'Program');

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Kuitansi Pencairan #${disbursement.receipt_number || disbursement.id} - ${programTitle}`} />

            <div className="min-h-screen bg-slate-100/70 dark:bg-gray-950 py-8 px-4 sm:px-6 print:p-0 print:bg-white text-slate-800 dark:text-gray-100">
                {/* Print action toolbar (hidden saat mencetak) */}
                <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white text-xs">
                        <Link href={`/akun/programs/${program.id}/disbursements`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Riwayat Pencairan
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        {disbursement.transfer_proof && (
                            <Button variant="outline" asChild className="border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs shadow-2xs">
                                <a href={`/akun/programs/${program.id}/disbursements/${disbursement.id}/proof`} target="_blank" rel="noopener noreferrer">
                                    <FileCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                                    Lihat Slip Bukti Transfer
                                </a>
                            </Button>
                        )}
                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs font-semibold">
                            <Printer className="w-4 h-4 mr-2" /> Cetak / Simpan PDF
                        </Button>
                    </div>
                </div>

                {/* Lembar Dokumen Kuitansi Resmi */}
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none overflow-hidden">
                    {/* Aksen Keamanan / Identity Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 print:hidden" />

                    {/* Kop Kuitansi Dokumen */}
                    <div className="p-6 sm:p-10 border-b border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-3.5">
                            <img
                                src="/images/logo/logo-landscape-color.png"
                                alt="Insani Indonesia"
                                className="h-10 w-auto object-contain shrink-0"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            {/* <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">INSANI</span>
                                    <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                                        Official Receipt
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Yayasan Insani Indonesia • Platform Kebaikan Digital</p>
                                <p className="text-[11px] text-slate-400">Website: insani.id • Email: sapa@insani.id</p>
                            </div> */}
                        </div>

                        <div className="text-left sm:text-right">
                            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                KUITANSI PENCAIRAN
                            </h2>
                            <div className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 px-3 py-1 rounded-md border border-blue-200/80 dark:border-blue-800/60 mt-1.5">
                                <ReceiptText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {disbursement.receipt_number || `KW-DISB-${disbursement.id}`}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5">
                                Tanggal: {formatDate(disbursement.transferred_at || disbursement.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Strip Keamanan & Status Transfer */}
                    {/* <div className="bg-slate-50/70 dark:bg-gray-800/40 px-6 sm:px-10 py-3 border-b border-slate-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas / Tercurahkan
                            </span>
                            <span className="text-slate-500 dark:text-gray-400">• Metode: BI-Fast Antarbank</span>
                        </div>
                        <span className="text-slate-400 dark:text-gray-500 font-mono text-[11px]">
                            ID Penyaluran #{disbursement.id}
                        </span>
                    </div> */}

                    {/* Metadata 2-Kolom: Program vs Rekening Penerima */}
                    <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {/* Kolom Kiri: Program Penggalangan */}
                        <div className="bg-slate-50/70 dark:bg-gray-800/40 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-4 sm:p-5 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" /> Program Penggalangan
                                </span>
                                {program?.program_code && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium normal-case tracking-normal text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-900 px-2.5 py-0.5 rounded-md border border-slate-200/90 dark:border-gray-700 shadow-2xs shrink-0 whitespace-nowrap">
                                        <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Kode:</span>
                                        <span className="font-semibold text-slate-800 dark:text-gray-200">{program.program_code}</span>
                                    </span>
                                )}
                            </div>

                            <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                                {programTitle}
                            </p>

                            {/* Rencana Penyaluran Rapi */}
                            {disbursement.distribution_plan && (
                                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border-l-3 border-blue-500 text-xs shadow-2xs space-y-1">
                                    <p className="font-medium text-slate-700 dark:text-gray-300">Rencana Penggunaan:</p>
                                    <p className="text-slate-600 dark:text-gray-300 italic leading-relaxed whitespace-normal">
                                        &ldquo;{disbursement.distribution_plan}&rdquo;
                                    </p>
                                </div>
                            )}

                            {/* Lokasi & Target */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-gray-400 pt-1">
                                {disbursement.location && (
                                    <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700 text-[11px]">
                                        <MapPin className="w-3 h-3 text-rose-500" />
                                        {disbursement.location}
                                    </span>
                                )}
                                {disbursement.beneficiary_target && (
                                    <span className="inline-flex items-center gap-1 text-[11px]">
                                        <Users className="w-3 h-3 text-slate-400" />
                                        Target: {disbursement.beneficiary_target}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Kolom Kanan: Penerima Dana (Rekening Terverifikasi) */}
                        <div className="bg-slate-50/70 dark:bg-gray-800/40 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-4 sm:p-5 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5">
                                    <Landmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Penerima Dana
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <BankLogo code={disbursement.bank_name} size="sm" />
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                                        {disbursement.bank_name}
                                    </p>
                                    {/* <p className="text-[11px] text-slate-500 dark:text-gray-400">Jaringan Kliring BI-Fast Terhubung</p> */}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-slate-200/80 dark:border-gray-700/60 space-y-1 shadow-2xs">
                                <p className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider">
                                    {disbursement.bank_account_number}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-gray-400">
                                    Atas Nama: <strong className="text-slate-900 dark:text-white">{disbursement.bank_account_name}</strong>
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Rekening Terverifikasi
                            </div>
                        </div>
                    </div>

                    {/* Tabel Rincian Keuangan (Financial Ledger Table) */}
                    <div className="px-6 sm:px-10 pb-6">
                        <div className="border border-slate-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="py-3 px-4 sm:px-6 text-left">Deskripsi Transaksi Penyaluran</th>
                                        <th className="py-3 px-4 sm:px-6 text-right">Jumlah (IDR)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-slate-700 dark:text-gray-300">
                                    {Number(disbursement.platform_fee_amount) > 0 || Number(disbursement.gateway_fee) > 0 ? (
                                        <>
                                            {/* 1. Total Donasi Program (Bruto) */}
                                            <tr>
                                                <td className="py-3.5 px-4 sm:px-6">
                                                    <p className="font-semibold text-slate-900 dark:text-white">Alokasi Donasi Program </p>
                                                    <p className="text-xs text-slate-500 dark:text-gray-400">Total akumulasi donasi yang dialokasikan dari program</p>
                                                </td>
                                                <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                                                    {formatRupiah(
                                                        Number(disbursement.requested_amount) +
                                                        Number(disbursement.platform_fee_amount || 0) +
                                                        Number(disbursement.gateway_fee || 0)
                                                    )}
                                                </td>
                                            </tr>

                                            {/* 2. Biaya Transaksi Payment Gateway */}
                                            {Number(disbursement.gateway_fee) > 0 && (
                                                <tr>
                                                    <td className="py-3.5 px-4 sm:px-6">
                                                        <p className="font-medium text-slate-700 dark:text-gray-300">Biaya Transaksi Payment Gateway</p>
                                                        <p className="text-xs text-slate-500 dark:text-gray-400">Pemrosesan otomatis via QRIS & Virtual Account (Midtrans)</p>
                                                    </td>
                                                    <td className="py-3.5 px-4 sm:px-6 text-right text-rose-600 dark:text-rose-400 font-semibold font-mono tabular-nums">
                                                        - {formatRupiah(disbursement.gateway_fee)}
                                                    </td>
                                                </tr>
                                            )}

                                            {/* 3. Biaya Operasional Platform */}
                                            {Number(disbursement.platform_fee_amount) > 0 && (
                                                <tr>
                                                    <td className="py-3.5 px-4 sm:px-6">
                                                        <p className="font-medium text-slate-700 dark:text-gray-300">
                                                            Biaya Operasional Platform ({disbursement.platform_fee_percent}%)
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-gray-400">Infaq operasional & keberlanjutan yayasan</p>
                                                    </td>
                                                    <td className="py-3.5 px-4 sm:px-6 text-right text-rose-600 dark:text-rose-400 font-semibold font-mono tabular-nums">
                                                        - {formatRupiah(disbursement.platform_fee_amount)}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ) : (
                                        <tr>
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <p className="font-semibold text-slate-900 dark:text-white">Nominal Permohonan Pencairan Dana</p>
                                                <p className="text-xs text-slate-500 dark:text-gray-400">Penarikan dana donasi terkumpul program kebaikan</p>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                                                {formatRupiah(disbursement.requested_amount)}
                                            </td>
                                        </tr>
                                    )}

                                    {/* 4. Biaya Transfer Bank (BI-Fast) */}
                                    <tr>
                                        <td className="py-3.5 px-4 sm:px-6">
                                            <p className="font-medium text-slate-700 dark:text-gray-300">Biaya Transfer Bank (BI-Fast)</p>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">Biaya transaksi kliring antarbank BI-Fast</p>
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 text-right text-rose-600 dark:text-rose-400 font-semibold font-mono tabular-nums">
                                            - {formatRupiah(disbursement.bank_fee || 2500)}
                                        </td>
                                    </tr>

                                    {/* 5. Total Dana Bersih Ditransfer */}
                                    <tr className="bg-blue-50/70 dark:bg-blue-950/40 border-t-2 border-blue-200 dark:border-blue-800">
                                        <td className="py-4 px-4 sm:px-6">
                                            <span className="font-black text-blue-950 dark:text-blue-200 text-sm sm:text-base uppercase tracking-wide">
                                                TOTAL DANA DITRANSFER
                                            </span>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                                Jumlah dana yang efektif ditransfer ke rekening penerima
                                            </p>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-right text-blue-700 dark:text-blue-300 font-black text-lg sm:text-2xl font-mono tabular-nums">
                                            {formatRupiah(disbursement.nett_amount)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Kotak Terbilang (Spelled-out words) */}
                        <div className="mt-3.5 bg-slate-50 dark:bg-gray-800/40 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-2">
                            <span className="font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider shrink-0">
                                Terbilang:
                            </span>
                            <span className="italic font-semibold text-slate-900 dark:text-white leading-relaxed">
                                # {terbilang(Number(disbursement.nett_amount))} #
                            </span>
                        </div>
                    </div>

                    {/* Footer Pengesahan, Catatan Amanah & Stempel Otorisasi Digital */}
                    <div className="p-6 sm:p-10 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-end gap-8 text-xs">
                        <div className="space-y-2 text-slate-500 dark:text-gray-400 max-w-md">
                            <p className="font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Catatan & Amanah:
                            </p>
                            <p className="leading-relaxed">
                                Kuitansi ini merupakan bukti sah transaksi penyaluran dana dari platform Insani Indonesia kepada penggalang dana.
                            </p>
                            <p className="leading-relaxed">
                                Penggalang dana berkewajiban menyampaikan laporan penyaluran di menu <strong>Kabar Terbaru</strong> secara berkala.
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono pt-1">
                                Otorisasi: {disbursement.receipt_number || `KW-DISB-${disbursement.id}`}-{disbursement.program_id}
                            </p>
                        </div>

                        <div className="text-center sm:text-right flex flex-col items-center sm:items-end min-w-[240px]">
                            <p className="text-slate-500 dark:text-gray-400 text-xs mb-3">Disahkan & Ditransfer Oleh:</p>

                            {/* Stempel Otorisasi Digital Resmi */}
                            <div className="border-2 border-dashed border-emerald-600/80 dark:border-emerald-500/80 rounded-xl px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 mb-3 shadow-2xs rotate-[-1deg]">
                                <div className="flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wider">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    LUNAS
                                </div>
                                <div className="text-[10px] font-semibold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 mt-0.5">
                                    PEMBAYARAN TERVERIFIKASI
                                </div>
                            </div>

                            <p className="font-bold text-slate-900 dark:text-white text-sm">Tim Keuangan Insani Indonesia</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">Otorisasi Sistem Digital</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

