import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatRupiah, formatDate, getLocalizedValue } from '@/lib/utils';

export default function Receipt({ program, disbursement }: any) {
    const programTitle = getLocalizedValue(program?.title, 'Program');
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Kuitansi Pencairan #${disbursement.receipt_number || disbursement.id}`} />

            <div className="min-h-screen bg-slate-100 dark:bg-gray-950 py-8 px-4 print:p-0 print:bg-white text-slate-800 dark:text-gray-100">
                {/* Print action toolbar (hidden when printing) */}
                <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                    <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 dark:text-gray-400">
                        <Link href={`/akun/programs/${program.id}/disbursements`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Riwayat
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        {disbursement.transfer_proof && (
                            <Button variant="outline" asChild className="border-slate-300">
                                <a href={`/storage/${disbursement.transfer_proof}`} target="_blank" rel="noopener noreferrer">
                                    Lihat Slip Bukti Transfer
                                </a>
                            </Button>
                        )}
                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                            <Printer className="w-4 h-4 mr-2" /> Cetak / Simpan PDF
                        </Button>
                    </div>
                </div>

                {/* Receipt Card */}
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-8 md:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
                    {/* Header */}
                    <div className="border-b border-slate-200 dark:border-gray-800 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">INSANI</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">Official Receipt</span>
                            </div>
                            <p className="text-xs text-slate-500">Yayasan Insani Indonesia • Platform Kebaikan Digital</p>
                            <p className="text-xs text-slate-400">Website: insani.id • Email: sapa@insani.id</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white">KUITANSI PENCAIRAN</h2>
                            <p className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                                {disbursement.receipt_number || `KW-DISB-${disbursement.id}`}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Tanggal: {formatDate(disbursement.transferred_at || disbursement.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Program & Recipient Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                        <div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-lg border border-slate-100 dark:border-gray-800 space-y-1.5">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Program Penggalangan:</h4>
                            <p className="font-bold text-slate-900 dark:text-white">{programTitle}</p>
                            <p className="text-xs text-slate-500">Kode: {program.program_code || '-'}</p>
                            {disbursement.distribution_plan && (
                                <p className="text-xs text-slate-600 dark:text-gray-300 pt-2 border-t border-slate-200 dark:border-gray-700">
                                    <strong className="font-medium">Peruntukan:</strong> {disbursement.distribution_plan}
                                </p>
                            )}
                            {disbursement.location && (
                                <p className="text-xs text-slate-600 dark:text-gray-300">
                                    <strong className="font-medium">Lokasi:</strong> {disbursement.location}
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-lg border border-slate-100 dark:border-gray-800 space-y-1.5">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Penerima Dana (Rekening Terverifikasi):</h4>
                            <p className="font-bold text-slate-900 dark:text-white">{disbursement.bank_account_name}</p>
                            <p className="text-xs text-slate-700 dark:text-gray-300">{disbursement.bank_name}</p>
                            <p className="font-mono text-sm text-slate-800 dark:text-gray-200">{disbursement.bank_account_number}</p>
                            <div className="pt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <ShieldCheck className="w-4 h-4 mr-1" /> Rekening Terverifikasi KYC
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="border border-slate-200 dark:border-gray-800 rounded-lg overflow-hidden mb-8">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="py-3 px-4 text-left">Deskripsi Transaksi</th>
                                    <th className="py-3 px-4 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-slate-700 dark:text-gray-300">
                                <tr>
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-slate-900 dark:text-white">Nominal Permohonan Pencairan Dana</p>
                                        <p className="text-xs text-slate-400">Penarikan dana donasi terkumpul program kebaikan</p>
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                                        {formatRupiah(disbursement.requested_amount)}
                                    </td>
                                </tr>
                                {Number(disbursement.platform_fee_amount) > 0 && (
                                    <tr>
                                        <td className="py-3 px-4 text-slate-500">
                                            Biaya Operasional Platform ({disbursement.platform_fee_percent}%)
                                        </td>
                                        <td className="py-3 px-4 text-right text-red-500 font-medium">
                                            - {formatRupiah(disbursement.platform_fee_amount)}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-3 px-4 text-slate-500">
                                        Biaya Administrasi Transfer Antarbank (BI-Fast)
                                    </td>
                                    <td className="py-3 px-4 text-right text-red-500 font-medium">
                                        - {formatRupiah(disbursement.bank_fee || 2500)}
                                    </td>
                                </tr>
                                <tr className="bg-blue-50/60 dark:bg-blue-950/30 text-slate-900 dark:text-white font-bold text-base">
                                    <td className="py-4 px-4 text-blue-900 dark:text-blue-300">
                                        TOTAL DANA DITRANSFER
                                    </td>
                                    <td className="py-4 px-4 text-right text-blue-600 dark:text-blue-400 text-lg">
                                        {formatRupiah(disbursement.nett_amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer & Signature */}
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t border-slate-200 dark:border-gray-800 text-xs">
                        <div className="space-y-1 text-slate-400 max-w-sm">
                            <p className="font-semibold text-slate-600 dark:text-gray-300">Catatan & Amanah:</p>
                            <p>Kuitansi ini merupakan bukti sah transaksi penyaluran dana dari platform Insani Indonesia kepada penggalang dana.</p>
                            <p>Penggalang dana berkewajiban menyampaikan laporan penyaluran di menu Kabar Terbaru secara berkala.</p>
                        </div>
                        <div className="text-center sm:text-right min-w-[200px]">
                            <p className="text-slate-500 mb-8">Disahkan & Ditransfer Oleh:</p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-semibold text-xs mb-2">
                                <CheckCircle className="w-3.5 h-3.5" /> LUNAS / TERCURAHKAN
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">Tim Keuangan Insani Indonesia</p>
                            <p className="text-slate-400 text-[11px]">Otorisasi Sistem Digital</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
