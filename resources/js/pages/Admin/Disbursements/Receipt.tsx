import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, FileCheck } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { getLocalizedValue } from '@/lib/utils';
import DisbursementReceiptDocument from '@/components/disbursement/DisbursementReceiptDocument';

export default function Receipt({ disbursement }: any) {
    const program = disbursement.program;
    const programTitle = getLocalizedValue(program?.title, 'Program');

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Kuitansi Pencairan #${disbursement.receipt_number || disbursement.id} - ${programTitle}`} />

            <div className="min-h-screen bg-slate-100/70 dark:bg-gray-950 py-8 px-4 sm:px-6 print:p-0 print:bg-white text-slate-800 dark:text-gray-100">
                {/* Print toolbar (hidden saat mencetak) */}
                <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white text-xs">
                        <Link href={`/admin/disbursements/${disbursement.id}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Detail Penyaluran
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        {disbursement.transfer_proof && (
                            <Button variant="outline" asChild className="border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs shadow-2xs">
                                <a href={`/admin/disbursements/${disbursement.id}/proof`} target="_blank" rel="noopener noreferrer">
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
                <DisbursementReceiptDocument
                    program={program}
                    disbursement={disbursement}
                />
            </div>
        </>
    );
}
