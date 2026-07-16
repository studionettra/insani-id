import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
        post(route('admin.disbursements.update-status', disbursement.id), {
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

            <div className="mb-6">
                <Link href={route('admin.disbursements.index')} className="text-sm text-slate-500 hover:text-primary flex items-center mb-2">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Detail Pencairan Dana</h2>
                        <p className="text-muted-foreground">#{disbursement.id} - {formatDate(disbursement.created_at)}</p>
                    </div>
                    {getStatusBadge(disbursement.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rincian Dana</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Nominal Diajukan</p>
                                    <p className="text-xl font-bold">{formatRupiah(disbursement.requested_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Nominal Bersih (Ditransfer)</p>
                                    <p className="text-xl font-bold text-green-600">{formatRupiah(disbursement.nett_amount)}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Biaya Platform ({disbursement.platform_fee_percent}%)</span>
                                    <span className="font-medium text-red-500">- {formatRupiah(disbursement.platform_fee_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Rekening Tujuan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Nama Bank</p>
                                        <p className="font-medium">{disbursement.bank_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Nomor Rekening</p>
                                        <p className="font-medium font-mono">{disbursement.bank_account_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Atas Nama</p>
                                        <p className="font-medium">{disbursement.bank_account_name}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {(disbursement.notes || disbursement.rejection_reason) && (
                        <Card>
                            <CardContent className="pt-6">
                                {disbursement.notes && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-slate-700 mb-1">Catatan Campaigner</h4>
                                        <p className="text-slate-600 bg-slate-50 p-3 rounded">{disbursement.notes}</p>
                                    </div>
                                )}
                                {disbursement.rejection_reason && (
                                    <div>
                                        <h4 className="text-sm font-medium text-red-700 mb-1">Alasan Penolakan</h4>
                                        <p className="text-red-600 bg-red-50 p-3 rounded border border-red-100">{disbursement.rejection_reason}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {disbursement.status === 'transferred' && disbursement.transfer_proof && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Bukti Transfer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <img src={`/storage/${disbursement.transfer_proof}`} alt="Bukti Transfer" className="rounded-lg border max-w-full h-auto max-h-[400px] object-contain" />
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Program</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={route('programs.show', disbursement.program_id)} className="font-medium text-primary hover:underline block mb-2">
                                {disbursement.program?.title}
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {disbursement.status === 'pending' && (
                                <div className="space-y-3">
                                    {actionType === 'reject' ? (
                                        <div className="space-y-3">
                                            <Label>Alasan Penolakan</Label>
                                            <Textarea 
                                                value={data.rejection_reason}
                                                onChange={e => setData('rejection_reason', e.target.value)}
                                                placeholder="Tuliskan alasan penolakan..."
                                            />
                                            {errors.rejection_reason && <p className="text-red-500 text-xs">{errors.rejection_reason}</p>}
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setActionType(null)}>Batal</Button>
                                                <Button size="sm" variant="destructive" onClick={() => submitAction('rejected')} disabled={processing || !data.rejection_reason}>
                                                    Tolak Pengajuan
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Button onClick={() => { setData('status', 'approved'); submitAction('approved'); }} className="w-full" disabled={processing}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Setujui Pengajuan
                                            </Button>
                                            <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={() => setActionType('reject')}>
                                                <XCircle className="w-4 h-4 mr-2" /> Tolak Pengajuan
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {disbursement.status === 'approved' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                                        Silakan transfer sejumlah <strong>{formatRupiah(disbursement.nett_amount)}</strong> ke rekening tujuan, lalu unggah bukti transfer.
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Bukti Transfer (Gambar)</Label>
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={e => setData('transfer_proof', e.target.files ? e.target.files[0] : null)}
                                        />
                                        {errors.transfer_proof && <p className="text-red-500 text-xs">{errors.transfer_proof}</p>}
                                    </div>

                                    <Button onClick={() => submitAction('transferred')} className="w-full" disabled={processing || !data.transfer_proof}>
                                        <Upload className="w-4 h-4 mr-2" /> Konfirmasi Transfer
                                    </Button>
                                </div>
                            )}

                            {disbursement.status === 'transferred' && (
                                <div className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                    <Check className="w-5 h-5 mr-2" />
                                    Pencairan telah selesai
                                </div>
                            )}
                            
                            {disbursement.status === 'rejected' && (
                                <div className="flex items-center justify-center p-4 bg-slate-50 text-slate-500 rounded-lg border">
                                    Pencairan dibatalkan
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
