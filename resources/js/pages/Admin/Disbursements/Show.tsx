import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import admin from '@/routes/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle, XCircle, Upload, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function Show({ disbursement }: any) {
    const [actionType, setActionType] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        status: '',
        rejection_reason: '',
        transfer_proof: null as File | null,
    });

    const submitAction = (status: string) => {
        setData('status', status);
        // We use post with _method=PUT to support file uploads in Inertia
        post(admin.disbursements.updateStatus(disbursement.id).url, {
            preserveScroll: true,
            onSuccess: () => setActionType(null)
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
            case 'approved': return <Badge className="bg-blue-100 text-blue-800">Disetujui</Badge>;
            case 'transferred': return <Badge className="bg-green-100 text-green-800">Ditransfer</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Detail Pencairan Dana" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="border-gray-200 hover:bg-gray-50 text-gray-600">
                        <Link href="/admin/disbursements"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div className="flex-1 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Detail Pencairan Dana</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                #{disbursement.id} - {formatDate(disbursement.created_at)}
                            </p>
                        </div>
                        {getStatusBadge(disbursement.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900">Rincian Dana</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Nominal Diajukan</p>
                                        <p className="text-xl font-bold text-gray-900">{formatRupiah(disbursement.requested_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Nominal Bersih (Ditransfer)</p>
                                        <p className="text-xl font-bold text-emerald-600">{formatRupiah(disbursement.nett_amount)}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Biaya Platform ({disbursement.platform_fee_percent}%)</span>
                                        <span className="font-medium text-red-500">- {formatRupiah(disbursement.platform_fee_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900">Informasi Rekening Tujuan</h3>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50/50 p-4 rounded-md border border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Nama Bank</p>
                                            <p className="font-medium text-gray-900 text-sm">{disbursement.bank_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Nomor Rekening</p>
                                            <p className="font-medium font-mono text-gray-900 text-sm">{disbursement.bank_account_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Atas Nama</p>
                                            <p className="font-medium text-gray-900 text-sm">{disbursement.bank_account_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {(disbursement.notes || disbursement.rejection_reason) && (
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <div className="p-6">
                                    {disbursement.notes && (
                                        <div className="mb-4">
                                            <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Catatan Campaigner</h4>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-100">{disbursement.notes}</p>
                                        </div>
                                    )}
                                    {disbursement.rejection_reason && (
                                        <div>
                                            <h4 className="text-xs font-medium text-red-700 mb-2 uppercase tracking-wider">Alasan Penolakan</h4>
                                            <p className="text-sm text-red-700 bg-red-50 p-4 rounded-md border border-red-100">{disbursement.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {disbursement.status === 'transferred' && disbursement.transfer_proof && (
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                    <h3 className="font-semibold text-gray-900">Bukti Transfer</h3>
                                </div>
                                <div className="p-6 flex justify-center">
                                    <img src={`/storage/${disbursement.transfer_proof}`} alt="Bukti Transfer" className="rounded-lg border border-gray-100 max-w-full h-auto max-h-[400px] object-contain shadow-sm" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900">Program</h3>
                            </div>
                            <div className="p-6">
                                <Link href={admin.programs.show(disbursement.program_id).url} className="font-medium text-[#1A56DB] hover:underline text-sm block">
                                    {disbursement.program?.title}
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900">Aksi</h3>
                            </div>
                            <div className="p-6">
                                {disbursement.status === 'pending' && (
                                    <div className="space-y-4">
                                        {actionType === 'reject' ? (
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-gray-700">Alasan Penolakan</Label>
                                                <Textarea 
                                                    value={data.rejection_reason}
                                                    onChange={e => setData('rejection_reason', e.target.value)}
                                                    placeholder="Tuliskan alasan penolakan..."
                                                    className="border-gray-200 focus-visible:ring-red-500"
                                                />
                                                {errors.rejection_reason && <p className="text-red-500 text-xs">{errors.rejection_reason}</p>}
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => setActionType(null)} className="border-gray-200 hover:bg-gray-50">Batal</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => submitAction('rejected')} disabled={processing || !data.rejection_reason} className="bg-red-600 hover:bg-red-700">
                                                        Tolak Pengajuan
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <Button onClick={() => { setData('status', 'approved'); submitAction('approved'); }} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white" disabled={processing}>
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Setujui Pengajuan
                                                </Button>
                                                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50" onClick={() => setActionType('reject')}>
                                                    <XCircle className="w-4 h-4 mr-2" /> Tolak Pengajuan
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {disbursement.status === 'approved' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100 text-sm text-blue-800 mb-4">
                                            Silakan transfer sejumlah <strong className="font-semibold">{formatRupiah(disbursement.nett_amount)}</strong> ke rekening tujuan, lalu unggah bukti transfer.
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Bukti Transfer (Gambar)</Label>
                                            <Input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={e => setData('transfer_proof', e.target.files ? e.target.files[0] : null)}
                                                className="border-gray-200 file:text-[#1A56DB] file:bg-blue-50 hover:file:bg-blue-100 text-sm py-1.5"
                                            />
                                            {errors.transfer_proof && <p className="text-red-500 text-xs">{errors.transfer_proof}</p>}
                                        </div>

                                        <Button onClick={() => submitAction('transferred')} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white mt-4" disabled={processing || !data.transfer_proof}>
                                            <Upload className="w-4 h-4 mr-2" /> Konfirmasi Transfer
                                        </Button>
                                    </div>
                                )}

                                {disbursement.status === 'transferred' && (
                                    <div className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                                        <Check className="w-5 h-5 mr-2" />
                                        <span className="font-medium text-sm">Pencairan telah selesai</span>
                                    </div>
                                )}
                                
                                {disbursement.status === 'rejected' && (
                                    <div className="flex items-center justify-center p-4 bg-gray-50 text-gray-500 rounded-md border border-gray-200">
                                        <span className="font-medium text-sm">Pencairan dibatalkan</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
        
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Detail Pencairan Dana',
            href: '/admin/disbursements',
        },
    ],
};
