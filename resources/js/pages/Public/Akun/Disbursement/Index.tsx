import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Download, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah, formatDate, getLocalizedValue } from '@/lib/utils';

export default function Index({ program, disbursements }: any) {
    const programTitle = getLocalizedValue(program?.title, 'Program');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Menunggu</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="w-3 h-3 mr-1"/> Disetujui</Badge>;
            case 'transferred':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Download className="w-3 h-3 mr-1"/> Ditransfer</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1"/> Ditolak</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={`Pencairan Dana - ${programTitle}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <Link href="/akun/programs" className="text-sm text-slate-500 hover:text-primary flex items-center mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Program
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pencairan Dana</h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-1">{programTitle}</p>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                        <Link href={`/akun/programs/${program.id}/disbursements/create`}>
                            <Plus className="w-4 h-4 mr-2" /> Ajukan Pencairan
                        </Link>
                    </Button>
                </div>

                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white">Riwayat Pencairan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {disbursements.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 mb-4">
                                        <Download className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Belum ada riwayat pencairan</h3>
                                    <p className="text-slate-500 dark:text-gray-400 mb-6">Anda belum pernah mengajukan pencairan dana untuk program ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {disbursements.data.map((item: any) => (
                                        <div key={item.id} className="border border-slate-200 dark:border-gray-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 shadow-2xs">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-lg text-slate-900 dark:text-white">{formatRupiah(item.requested_amount)}</span>
                                                    {getStatusBadge(item.status)}
                                                    {item.receipt_number && (
                                                        <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-300">
                                                            {item.receipt_number}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-xs text-slate-500 dark:text-gray-400 space-y-1">
                                                    <p>Diajukan: {formatDate(item.created_at)}</p>
                                                    {item.distribution_plan && (
                                                        <p className="line-clamp-1 italic text-slate-600 dark:text-gray-300">
                                                            Rencana: &quot;{item.distribution_plan}&quot; {item.location ? `(${item.location})` : ''}
                                                        </p>
                                                    )}
                                                </div>

                                                {item.status === 'transferred' && (
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-gray-300 pt-1">
                                                        <span>Biaya Bank: <strong className="text-red-500">- {formatRupiah(item.bank_fee || 2500)}</strong></span>
                                                        <span>Bersih Ditransfer: <strong className="text-emerald-600 dark:text-emerald-400">{formatRupiah(item.nett_amount)}</strong></span>
                                                        {item.transferred_at && <span>Ditransfer: {formatDate(item.transferred_at)}</span>}
                                                    </div>
                                                )}

                                                {item.status === 'rejected' && item.rejection_reason && (
                                                    <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded border border-red-100 dark:border-red-900/60">
                                                        <span className="font-semibold">Alasan penolakan:</span> {item.rejection_reason}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col md:items-end justify-between gap-3 text-sm">
                                                <div className="text-left md:text-right">
                                                    <p className="font-semibold text-slate-900 dark:text-white text-xs">{item.bank_name}</p>
                                                    <p className="text-slate-600 dark:text-gray-400 font-mono text-xs">{item.bank_account_number}</p>
                                                    <p className="text-slate-500 dark:text-gray-500 text-xs">a.n. {item.bank_account_name}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                                                    {item.status === 'transferred' && (
                                                        <>
                                                            <Button size="sm" variant="outline" asChild className="h-8 text-xs border-slate-200 dark:border-gray-700">
                                                                <Link href={`/akun/programs/${program.id}/disbursements/${item.id}/receipt`}>
                                                                    Lihat Kuitansi
                                                                </Link>
                                                            </Button>
                                                            {item.transfer_proof && (
                                                                <Button size="sm" variant="outline" asChild className="h-8 text-xs border-slate-200 dark:border-gray-700">
                                                                    <a href={`/storage/${item.transfer_proof}`} target="_blank" rel="noopener noreferrer">
                                                                        Bukti Transfer
                                                                    </a>
                                                                </Button>
                                                            )}
                                                            <Button size="sm" asChild className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                                                <Link href={`/akun/programs/${program.id}/updates`}>
                                                                    Lapor Penyaluran
                                                                </Link>
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    {disbursements.last_page > 1 && (
                                        <div className="flex justify-center mt-6">
                                            <div className="flex gap-2">
                                                {disbursements.links.map((link: any, i: number) => (
                                                    <Link
                                                        key={i}
                                                        href={link.url || '#'}
                                                        className={`px-3 py-1 rounded border text-sm ${
                                                            link.active 
                                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                                : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
        </>
    );
}
