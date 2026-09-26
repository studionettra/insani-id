import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, Upload, Check, Copy, FileText, Download, Receipt, ExternalLink, Calendar, MapPin, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah, formatDate } from '@/lib/utils';
import admin from '@/routes/admin';

export default function Show({ disbursement }: any) {
    const [actionType, setActionType] = useState<string | null>(null);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedAmount, setCopiedAmount] = useState(false);

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

    const copyToClipboard = (text: string, type: 'account' | 'amount') => {
        navigator.clipboard.writeText(text);
        if (type === 'account') {
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
        } else {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Menunggu Review</Badge>;
            case 'approved': return <Badge className="bg-blue-100 text-blue-800">Disetujui (Siap Transfer)</Badge>;
            case 'transferred': return <Badge className="bg-green-100 text-green-800">Ditransfer</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={`Detail Pencairan #${disbursement.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="border-gray-200 hover:bg-gray-50 text-gray-600">
                            <Link href="/admin/disbursements"><ArrowLeft className="w-4 h-4" /></Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Detail Pencairan Dana</h1>
                                {disbursement.receipt_number && (
                                    <Badge variant="outline" className="font-mono bg-purple-50 text-purple-700 border-purple-200">
                                        {disbursement.receipt_number}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                #{disbursement.id} &bull; Diajukan pada {formatDate(disbursement.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(disbursement.status)}
                        {disbursement.status === 'transferred' && (
                            <Button size="sm" variant="outline" asChild className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                <Link href={`/admin/disbursements/${disbursement.id}/receipt`} target="_blank">
                                    <Receipt className="w-4 h-4 mr-1.5" />
                                    Lihat Kuitansi
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Rincian Finansial & Kalkulasi Anti-Nombok */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-3.5 px-6 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm">Rincian Finansial Pencairan</h3>
                                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                                    Metode Payout: BI-Fast Manual
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Nominal Diajukan (Gross)</p>
                                        <p className="text-xl font-bold text-gray-900">{formatRupiah(disbursement.requested_amount)}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 relative">
                                        <p className="text-xs text-emerald-700 font-medium mb-1">Nominal Bersih Wajib Ditransfer</p>
                                        <p className="text-2xl font-black text-emerald-700">{formatRupiah(disbursement.nett_amount)}</p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-3 right-3 text-xs text-emerald-700 hover:bg-emerald-100 h-7 px-2"
                                            onClick={() => copyToClipboard(String(Math.round(disbursement.nett_amount)), 'amount')}
                                        >
                                            {copiedAmount ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                            {copiedAmount ? 'Disalin!' : 'Salin'}
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2.5 pt-4 border-t border-gray-100 text-sm">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Nominal Pengajuan Campaigner</span>
                                        <span className="font-medium text-gray-900">{formatRupiah(disbursement.requested_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Biaya Operasional Platform ({disbursement.platform_fee_percent}%)</span>
                                        <span className="font-medium text-red-600">- {formatRupiah(disbursement.platform_fee_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Biaya Admin Transfer Bank (BI-Fast)</span>
                                        <span className="font-medium text-red-600">- {formatRupiah(disbursement.bank_fee || 2500)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 font-bold text-gray-900">
                                        <span>Total Bersih Diterima Campaigner</span>
                                        <span className="text-emerald-700 text-base">{formatRupiah(disbursement.nett_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rekening Tujuan & Tombol Copy */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-3.5 px-6 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm">Rekening Tujuan Transfer</h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 border-gray-200 hover:bg-gray-50 text-gray-700"
                                    onClick={() => copyToClipboard(disbursement.bank_account_number, 'account')}
                                >
                                    {copiedAccount ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                    {copiedAccount ? 'Tersalin' : 'Salin Rekening'}
                                </Button>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50/60 p-4 rounded-lg border border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Bank Tujuan</p>
                                            <p className="font-semibold text-gray-900 text-sm">{disbursement.bank_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Nomor Rekening</p>
                                            <p className="font-mono font-bold text-gray-900 text-base tracking-wider">{disbursement.bank_account_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Atas Nama Pemilik</p>
                                            <p className="font-semibold text-gray-900 text-sm uppercase">{disbursement.bank_account_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rencana & Keperluan Penyaluran Dana */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-3.5 px-6">
                                <h3 className="font-semibold text-gray-900 text-sm">Rencana & Keperluan Penyaluran</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rencana Penggunaan Dana</h4>
                                    <p className="text-sm text-gray-800 bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 whitespace-pre-line leading-relaxed">
                                        {disbursement.distribution_plan || disbursement.notes || 'Tidak dicantumkan'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div className="flex items-start gap-2.5">
                                        <Users className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">Target Penerima</p>
                                            <p className="text-sm font-medium text-gray-800 mt-0.5">{disbursement.beneficiary_target || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">Lokasi Penyaluran</p>
                                            <p className="text-sm font-medium text-gray-800 mt-0.5">{disbursement.location || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">Estimasi Tanggal</p>
                                            <p className="text-sm font-medium text-gray-800 mt-0.5">
                                                {disbursement.estimated_distribution_date ? formatDate(disbursement.estimated_distribution_date) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {disbursement.supporting_document && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dokumen Pendukung (RAB / Proposal)</h4>
                                        <a
                                            href={`/storage/${disbursement.supporting_document}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span>Lihat / Unduh Dokumen Pendukung</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-1" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {(disbursement.notes || disbursement.rejection_reason) && (
                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <div className="p-6 space-y-4">
                                    {disbursement.notes && (
                                        <div>
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Catatan Tambahan Campaigner</h4>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-lg border border-gray-100">{disbursement.notes}</p>
                                        </div>
                                    )}
                                    {disbursement.rejection_reason && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1.5">Alasan Penolakan</h4>
                                            <p className="text-sm text-red-700 bg-red-50 p-3.5 rounded-lg border border-red-200">{disbursement.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {disbursement.status === 'transferred' && disbursement.transfer_proof && (
                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-gray-100 bg-gray-50/50 py-3.5 px-6 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 text-sm">Bukti Transfer Resmi</h3>
                                    <a
                                        href={`/storage/${disbursement.transfer_proof}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Buka Resolusi Penuh
                                    </a>
                                </div>
                                <div className="p-6 flex flex-col items-center">
                                    <img src={`/storage/${disbursement.transfer_proof}`} alt="Bukti Transfer" className="rounded-lg border border-gray-200 max-w-full h-auto max-h-[420px] object-contain shadow-sm" />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Ditransfer pada {disbursement.transferred_at ? formatDate(disbursement.transferred_at) : '-'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Info Program */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-3.5 px-6">
                                <h3 className="font-semibold text-gray-900 text-sm">Program Terkait</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <Link href={admin.programs.show(disbursement.program_id).url} className="font-semibold text-[#1A56DB] hover:underline text-sm block leading-snug">
                                    {disbursement.program?.title}
                                </Link>
                                <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                                    <p><span className="font-medium text-gray-700">Kategori:</span> {disbursement.program?.category?.name || '-'}</p>
                                    <p><span className="font-medium text-gray-700">Campaigner:</span> {disbursement.program?.campaigner_profile?.organization_name || disbursement.program?.creator?.name || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card Aksi Admin */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 py-3.5 px-6">
                                <h3 className="font-semibold text-gray-900 text-sm">Tindakan Persetujuan</h3>
                            </div>
                            <div className="p-6">
                                {disbursement.status === 'pending' && (
                                    <div className="space-y-4">
                                        {actionType === 'reject' ? (
                                            <div className="space-y-3">
                                                <Label className="text-xs font-semibold text-gray-700">Alasan Penolakan</Label>
                                                <Textarea 
                                                    value={data.rejection_reason}
                                                    onChange={e => setData('rejection_reason', e.target.value)}
                                                    placeholder="Contoh: Dokumen RAB tidak valid / rekening tidak sesuai..."
                                                    className="border-gray-200 focus-visible:ring-red-500 text-sm"
                                                    rows={3}
                                                />
                                                {errors.rejection_reason && <p className="text-red-500 text-xs">{errors.rejection_reason}</p>}
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => setActionType(null)} className="border-gray-200 hover:bg-gray-50 flex-1">Batal</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => submitAction('rejected')} disabled={processing || !data.rejection_reason} className="bg-red-600 hover:bg-red-700 flex-1">
                                                        Tolak Pengajuan
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2.5">
                                                <Button onClick={() => {
                                                    setData('status', 'approved'); submitAction('approved'); 
                                                }} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white" disabled={processing}>
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
                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-2">
                                            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                                                <span>Instruksi Transfer BI-Fast:</span>
                                            </p>
                                            <p>1. Lakukan transfer bank via BI-Fast manual sebesar:</p>
                                            <div className="bg-white p-2 rounded border border-amber-200 font-mono font-bold text-sm text-gray-900 flex justify-between items-center">
                                                <span>{formatRupiah(disbursement.nett_amount)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(String(Math.round(disbursement.nett_amount)), 'amount')}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    {copiedAmount ? 'Disalin!' : 'Salin'}
                                                </button>
                                            </div>
                                            <p>2. Ke Rekening: <span className="font-mono font-semibold">{disbursement.bank_name} {disbursement.bank_account_number}</span> a.n. <span className="font-semibold">{disbursement.bank_account_name}</span></p>
                                            <p>3. Unggah resi/bukti transfer di bawah ini untuk menerbitkan kuitansi resmi & notifikasi email ke campaigner.</p>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-700">Bukti Transfer (Gambar / PDF)</Label>
                                            <Input 
                                                type="file" 
                                                accept="image/*,application/pdf"
                                                onChange={e => setData('transfer_proof', e.target.files ? e.target.files[0] : null)}
                                                className="border-gray-200 text-xs py-1.5"
                                            />
                                            {errors.transfer_proof && <p className="text-red-500 text-xs">{errors.transfer_proof}</p>}
                                        </div>

                                        <Button onClick={() => submitAction('transferred')} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white" disabled={processing || !data.transfer_proof}>
                                            <Upload className="w-4 h-4 mr-2" /> Konfirmasi Telah Ditransfer
                                        </Button>
                                    </div>
                                )}

                                {disbursement.status === 'transferred' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                                            <Check className="w-5 h-5 mr-2 text-emerald-600" />
                                            <div className="text-left">
                                                <p className="font-semibold text-sm">Pencairan Selesai</p>
                                                <p className="text-xs text-emerald-700">Kuitansi resmi telah diterbitkan & dikirim via email.</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50" asChild>
                                            <Link href={`/admin/disbursements/${disbursement.id}/receipt`} target="_blank">
                                                <Receipt className="w-4 h-4 mr-2" /> Cetak / Lihat Kuitansi Resmi
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                                
                                {disbursement.status === 'rejected' && (
                                    <div className="flex items-center justify-center p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                        <XCircle className="w-5 h-5 mr-2" />
                                        <span className="font-medium text-sm">Pengajuan Ditolak</span>
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
