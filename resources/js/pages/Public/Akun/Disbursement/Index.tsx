import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Download, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/PublicLayout';
import { formatRupiah, formatDate } from '@/lib/utils';

export default function Index({ program, disbursements }: any) {
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
        <PublicLayout>
            <Head title={`Pencairan Dana - ${program.title}`} />

            <div className="bg-slate-50 py-12 min-h-screen">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link href={route('akun.programs.index')} className="text-sm text-slate-500 hover:text-primary flex items-center mb-2">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Program
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900">Pencairan Dana</h1>
                            <p className="text-slate-500 mt-1">{program.title}</p>
                        </div>
                        <Button asChild>
                            <Link href={route('akun.programs.disbursements.create', program.id)}>
                                <Plus className="w-4 h-4 mr-2" /> Ajukan Pencairan
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Pencairan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {disbursements.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                        <Download className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">Belum ada riwayat pencairan</h3>
                                    <p className="text-slate-500 mb-6">Anda belum pernah mengajukan pencairan dana untuk program ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {disbursements.data.map((item: any) => (
                                        <div key={item.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold text-lg">{formatRupiah(item.requested_amount)}</span>
                                                    {getStatusBadge(item.status)}
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    Diajukan pada {formatDate(item.created_at)}
                                                </p>
                                                {item.status === 'rejected' && item.rejection_reason && (
                                                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                                        <span className="font-medium">Alasan penolakan:</span> {item.rejection_reason}
                                                    </div>
                                                )}
                                                {item.status === 'transferred' && item.transferred_at && (
                                                    <div className="mt-2 text-sm text-green-600">
                                                        Ditransfer pada {formatDate(item.transferred_at)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-left md:text-right text-sm">
                                                <p className="font-medium text-slate-900">{item.bank_name}</p>
                                                <p className="text-slate-500">{item.bank_account_number}</p>
                                                <p className="text-slate-500">a.n. {item.bank_account_name}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination (Simplified for demo) */}
                                    {disbursements.last_page > 1 && (
                                        <div className="flex justify-center mt-6">
                                            <div className="flex gap-2">
                                                {disbursements.links.map((link: any, i: number) => (
                                                    <Link
                                                        key={i}
                                                        href={link.url || '#'}
                                                        className={`px-3 py-1 rounded border ${link.active ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
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
            </div>
        </PublicLayout>
    );
}
