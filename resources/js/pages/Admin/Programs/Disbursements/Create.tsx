import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FileCheck,
    FileText,
    HandCoins,
    HelpCircle,
    Info,
    Landmark,
    MapPin,
    ReceiptText,
    ShieldCheck,
    UploadCloud,
    Users,
    Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate, getLocalizedValue } from '@/lib/utils';

interface Props {
    program: any;
    metrics: {
        total_collected: number;
        total_gateway_fees: number;
        total_disbursed: number;
        available_balance: number;
    };
    recentDisbursements: any[];
}

export default function AdminProgramDisbursementCreate({ program, metrics, recentDisbursements = [] }: Props) {
    const programTitle = getLocalizedValue(program?.title, 'Program');
    const availableBalance = metrics.available_balance || 0;

    const { data, setData, post, processing, errors } = useForm({
        requested_amount: '',
        disbursement_type: 'vendor',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        distribution_plan: '',
        beneficiary_target: '',
        location: '',
        estimated_distribution_date: new Date().toISOString().split('T')[0],
        supporting_document: null as File | null,
        transfer_proof: null as File | null,
        is_direct_transferred: true,
        notes: '',
    });

    const [formattedAmount, setFormattedAmount] = useState('');

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (!rawValue) {
            setData('requested_amount', '');
            setFormattedAmount('');
            return;
        }

        const numValue = parseInt(rawValue, 10);
        setData('requested_amount', rawValue);
        setFormattedAmount(new Intl.NumberFormat('id-ID').format(numValue));
    };

    const handleSetQuickAmount = (ratio: number) => {
        const targetVal = Math.floor(availableBalance * ratio);
        setData('requested_amount', targetVal.toString());
        setFormattedAmount(new Intl.NumberFormat('id-ID').format(targetVal));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(data.requested_amount);
        if (!numAmount || numAmount <= 0) {
            toast.error('Harap masukkan nominal penyaluran yang valid.');
            return;
        }

        if (numAmount > availableBalance) {
            toast.error(`Nominal melebihi sisa kas program (${formatCurrency(availableBalance)}).`);
            return;
        }

        if (data.is_direct_transferred && !data.transfer_proof) {
            toast.error('Harap unggah bukti transfer jika menandai dana telah ditransfer.');
            return;
        }

        post(`/admin/programs/${program.id}/disbursements`, {
            preserveScroll: true,
            onError: (err) => {
                toast.error('Gagal mencatat penyaluran. Silakan periksa formulir.');
            },
        });
    };

    return (
        <>
            <Head title={`Catat Penyaluran Dana - ${programTitle}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="border-gray-200 dark:border-gray-800 shrink-0">
                            <Link href={`/admin/programs/${program.id}`}>
                                <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Catat Penyaluran Dana Program
                                </h1>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
                                    Program Internal Yayasan
                                </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xl">
                                {programTitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ringkasan Kas & Saldo Program */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-2xs">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Donasi Terkumpul</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {formatCurrency(metrics.total_collected)}
                        </p>
                        <span className="text-[11px] text-gray-400">Gross penerimaan donatur</span>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-2xs">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Biaya Transaksi Digital</span>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                            - {formatCurrency(metrics.total_gateway_fees)}
                        </p>
                        <span className="text-[11px] text-gray-400">Payment gateway resmi BI</span>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-2xs">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Telah Disalurkan</span>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {formatCurrency(metrics.total_disbursed)}
                        </p>
                        <span className="text-[11px] text-gray-400">{recentDisbursements.length} termin penyaluran</span>
                    </div>

                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                                Sisa Kas Tersedia
                            </span>
                            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                            {formatCurrency(availableBalance)}
                        </p>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Batas maksimal penyaluran</span>
                    </div>
                </div>

                {availableBalance <= 0 && (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="font-semibold text-xs sm:text-sm">Kas Program Belum Memiliki Saldo</AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                            Saat ini belum ada donasi bersih yang dapat disalurkan untuk program ini. Pencatatan penyaluran baru dapat diproses setelah terdapat donasi terverifikasi.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Formulir Penyaluran Dana */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Kolom Kiri: Rincian Keuangan & Rekening */}
                        <div className="lg:col-span-7 space-y-6">
                            <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
                                            <HandCoins className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                                                Nominal & Alokasi Penyaluran
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Tentukan jumlah dana dan klasifikasi tujuan penyaluran
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-5">
                                    {/* Input Nominal */}
                                    <div className="space-y-2">
                                        <Label htmlFor="requested_amount" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Nominal Penyaluran (Rp) <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-gray-400">
                                                Rp
                                            </span>
                                            <Input
                                                id="requested_amount"
                                                type="text"
                                                value={formattedAmount}
                                                onChange={handleAmountChange}
                                                placeholder="Contoh: 10.000.000"
                                                disabled={availableBalance <= 0 || processing}
                                                className="pl-10 text-base font-bold h-11 border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                        {errors.requested_amount && (
                                            <p className="text-xs text-red-500 font-medium">{errors.requested_amount}</p>
                                        )}

                                        {/* Quick Amount Buttons */}
                                        {availableBalance > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                <span className="text-[11px] text-gray-500 mr-1">Shortcut:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetQuickAmount(0.25)}
                                                    className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
                                                >
                                                    25%
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetQuickAmount(0.5)}
                                                    className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
                                                >
                                                    50%
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetQuickAmount(1)}
                                                    className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 rounded-md transition-colors"
                                                >
                                                    Semua Saldo (100%)
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pilihan Tipe Penyaluran */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Klasifikasi Penerima Penyaluran <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                data.disbursement_type === 'vendor'
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-semibold text-blue-900 dark:text-blue-200'
                                                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="disbursement_type"
                                                    value="vendor"
                                                    checked={data.disbursement_type === 'vendor'}
                                                    onChange={(e) => setData('disbursement_type', e.target.value)}
                                                    className="mt-0.5 text-blue-600"
                                                />
                                                <div>
                                                    <span className="block font-bold">Vendor / Pengadaan</span>
                                                    <span className="text-[11px] text-gray-500 font-normal">Pembayaran sembako, material, sewa armada, logistik</span>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                data.disbursement_type === 'field_team'
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-semibold text-blue-900 dark:text-blue-200'
                                                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="disbursement_type"
                                                    value="field_team"
                                                    checked={data.disbursement_type === 'field_team'}
                                                    onChange={(e) => setData('disbursement_type', e.target.value)}
                                                    className="mt-0.5 text-blue-600"
                                                />
                                                <div>
                                                    <span className="block font-bold">PIC Lapangan / Relawan</span>
                                                    <span className="text-[11px] text-gray-500 font-normal">Dana operasional tim lapangan & biaya distribusi</span>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                data.disbursement_type === 'beneficiary_direct'
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-semibold text-blue-900 dark:text-blue-200'
                                                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="disbursement_type"
                                                    value="beneficiary_direct"
                                                    checked={data.disbursement_type === 'beneficiary_direct'}
                                                    onChange={(e) => setData('disbursement_type', e.target.value)}
                                                    className="mt-0.5 text-blue-600"
                                                />
                                                <div>
                                                    <span className="block font-bold">Penerima Manfaat Langsung</span>
                                                    <span className="text-[11px] text-gray-500 font-normal">Santunan tunai / transfer ke pasien atau mustahik</span>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                data.disbursement_type === 'other'
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-semibold text-blue-900 dark:text-blue-200'
                                                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="disbursement_type"
                                                    value="other"
                                                    checked={data.disbursement_type === 'other'}
                                                    onChange={(e) => setData('disbursement_type', e.target.value)}
                                                    className="mt-0.5 text-blue-600"
                                                />
                                                <div>
                                                    <span className="block font-bold">Keperluan Lainnya</span>
                                                    <span className="text-[11px] text-gray-500 font-normal">Pengeluaran khusus yang terverifikasi</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Rincian Rekening / Bank Tujuan */}
                                    <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                                            <Landmark className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Informasi Rekening / Pembayaran Tujuan</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="bank_name" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    Nama Bank / Metode <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="bank_name"
                                                    value={data.bank_name}
                                                    onChange={(e) => setData('bank_name', e.target.value)}
                                                    placeholder="Contoh: Bank Syariah Indonesia / BCA / Tunai BAST"
                                                    className="h-9 text-xs"
                                                />
                                                {errors.bank_name && <p className="text-xs text-red-500">{errors.bank_name}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="bank_account_number" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    No. Rekening / No. Bukti <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="bank_account_number"
                                                    value={data.bank_account_number}
                                                    onChange={(e) => setData('bank_account_number', e.target.value)}
                                                    placeholder="Contoh: 7123456789 atau KAS-TUNAI-01"
                                                    className="h-9 text-xs font-mono"
                                                />
                                                {errors.bank_account_number && <p className="text-xs text-red-500">{errors.bank_account_number}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="bank_account_name" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Atas Nama Pemilik Rekening / Penerima <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="bank_account_name"
                                                value={data.bank_account_name}
                                                onChange={(e) => setData('bank_account_name', e.target.value)}
                                                placeholder="Contoh: PT Pangan Nusantara / Ustadz Ahmad Dahlan / Bpk. Rudi"
                                                className="h-9 text-xs"
                                            />
                                            {errors.bank_account_name && <p className="text-xs text-red-500">{errors.bank_account_name}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pelaksanaan & Rencana Distribusi */}
                            <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                                                Rencana & Target Implementasi
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Data ini akan dicatat pada kuitansi dan transparansi publik
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="distribution_plan" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Rencana / Rincian Keperluan Penyaluran <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="distribution_plan"
                                            value={data.distribution_plan}
                                            onChange={(e) => setData('distribution_plan', e.target.value)}
                                            rows={3}
                                            placeholder="Contoh: Pengadaan 150 paket sembako dan perlengkapan sekolah untuk santri dhuafa di pelosok."
                                            className="text-xs leading-relaxed"
                                        />
                                        {errors.distribution_plan && <p className="text-xs text-red-500">{errors.distribution_plan}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="beneficiary_target" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Target Penerima Manfaat <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="beneficiary_target"
                                                value={data.beneficiary_target}
                                                onChange={(e) => setData('beneficiary_target', e.target.value)}
                                                placeholder="Contoh: 150 Anak Yatim & Dhuafa"
                                                className="h-9 text-xs"
                                            />
                                            {errors.beneficiary_target && <p className="text-xs text-red-500">{errors.beneficiary_target}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="location" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Lokasi Penyaluran <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="location"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                placeholder="Contoh: Kec. Sayung, Kab. Demak"
                                                className="h-9 text-xs"
                                            />
                                            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="estimated_distribution_date" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Tanggal Pelaksanaan Penyaluran <span className="text-red-500">*</span>
                                        </Label>
                                        <DatePicker
                                            value={data.estimated_distribution_date}
                                            onChange={(val) => setData('estimated_distribution_date', val)}
                                            placeholder="Pilih tanggal penyaluran"
                                            className="h-9 text-xs w-full"
                                        />
                                        {errors.estimated_distribution_date && (
                                            <p className="text-xs text-red-500">{errors.estimated_distribution_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Catatan Internal (Opsional)
                                        </Label>
                                        <Input
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Catatan persetujuan, nomor memo internal, atau referensi SPK"
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Kolom Kanan: Berkas RAB, Status Transfer Langsung, & Submit */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Berkas Pendukung (RAB / Invoice) */}
                            <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <UploadCloud className="w-4 h-4 text-blue-600" />
                                        Berkas RAB & Dokumen Pendukung
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Lampirkan RAB, proforma invoice, atau surat permohonan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setData('supporting_document', e.target.files?.[0] || null)}
                                        className="text-xs h-9"
                                    />
                                    <p className="text-[11px] text-gray-400">
                                        Format: PDF, JPG, PNG (Maksimal 5MB).
                                    </p>
                                    {errors.supporting_document && (
                                        <p className="text-xs text-red-500">{errors.supporting_document}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Opsi Transfer Langsung */}
                            <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileCheck className="w-4 h-4 text-emerald-600" />
                                        Status Realisasi Transfer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_direct_transferred}
                                            onChange={(e) => setData('is_direct_transferred', e.target.checked)}
                                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="text-xs">
                                            <span className="font-bold text-gray-900 dark:text-gray-100 block">
                                                Dana telah ditransfer oleh Finance / Bendahara
                                            </span>
                                            <span className="text-gray-500 leading-relaxed block mt-0.5">
                                                Status akan langsung ditandai <strong>Ditransfer</strong> dan memotong saldo dana program.
                                            </span>
                                        </div>
                                    </label>

                                    {data.is_direct_transferred && (
                                        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/60 space-y-2">
                                            <Label className="text-xs font-semibold text-emerald-950 dark:text-emerald-300">
                                                Unggah Bukti Transfer / Slip Bank <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setData('transfer_proof', e.target.files?.[0] || null)}
                                                className="text-xs h-9 bg-white dark:bg-gray-900"
                                            />
                                            <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                                                Slip BI-Fast / mutasi transfer bank resmi yayasan.
                                            </p>
                                            {errors.transfer_proof && (
                                                <p className="text-xs text-red-500">{errors.transfer_proof}</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Edukasi & Akuntabilitas Yayasan */}
                            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    <span>Akuntabilitas Penyaluran Internal</span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300/90">
                                    Penyaluran ini bebas potongan platform (0%). Nomor kuitansi resmi (KW-DISB-...) akan dibuat otomatis dan dapat dicetak sebagai bukti audit keuangan.
                                </p>
                            </div>

                            {/* Tombol Simpan */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={availableBalance <= 0 || processing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 h-11 text-xs sm:text-sm shadow-xs"
                                >
                                    {processing ? 'Menyimpan Penyaluran...' : 'Simpan & Terbitkan Kuitansi Penyaluran'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
