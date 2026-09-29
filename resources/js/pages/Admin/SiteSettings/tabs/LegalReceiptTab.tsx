import React from 'react';
import { ShieldCheck, FileCheck, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ImageDropzone from '../components/ImageDropzone';

interface LegalReceiptTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    settings: Record<string, string>;
    errors: Record<string, string>;
    previews: {
        stamp: string | null;
        signature: string | null;
    };
    onFileChange: (key: string, file: File | null) => void;
}

export default function LegalReceiptTab({
    data,
    setData,
    settings,
    errors,
    previews,
    onFileChange,
}: LegalReceiptTabProps) {
    const activeStampUrl = previews.stamp || (settings.receipt_stamp_image ? `/storage/${settings.receipt_stamp_image}` : null);
    const activeSignatureUrl = previews.signature || (settings.receipt_signature_image ? `/storage/${settings.receipt_signature_image}` : null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri: Form Legalitas & Kwitansi */}
            <div className="lg:col-span-7 space-y-6">
                {/* Card 1: Legalitas Yayasan */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Legalitas Yayasan & SK</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Data badan hukum resmi yang mengesahkan operasional lembaga.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                            <Label htmlFor="show_sk_in_footer" className="text-xs font-medium cursor-pointer">
                                Tampilkan di Footer
                            </Label>
                            <Switch
                                id="show_sk_in_footer"
                                checked={data.show_sk_in_footer === '1'}
                                onCheckedChange={(checked) => setData('show_sk_in_footer', checked ? '1' : '0')}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label htmlFor="legal_foundation_name" className="text-xs font-semibold">
                                    Nama Resmi Badan Hukum Yayasan
                                </Label>
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                    Identitas Utama
                                </span>
                            </div>
                            <Input
                                id="legal_foundation_name"
                                value={data.legal_foundation_name}
                                onChange={(e) => setData('legal_foundation_name', e.target.value)}
                                placeholder="cth: Yayasan Peduli Insani Indonesia"
                                className="mt-1"
                            />
                            {errors.legal_foundation_name && <p className="text-xs text-red-500 mt-1">{errors.legal_foundation_name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="legal_sk_label" className="text-xs font-semibold">Label Pengenal SK</Label>
                                <Input
                                    id="legal_sk_label"
                                    value={data.legal_sk_label}
                                    onChange={(e) => setData('legal_sk_label', e.target.value)}
                                    placeholder="SK Kemenkumham RI"
                                    className="mt-1"
                                />
                                {errors.legal_sk_label && <p className="text-xs text-red-500 mt-1">{errors.legal_sk_label}</p>}
                            </div>

                            <div>
                                <Label htmlFor="legal_sk_kemenkumham" className="text-xs font-semibold">Nomor SK Kemenkumham RI</Label>
                                <Input
                                    id="legal_sk_kemenkumham"
                                    value={data.legal_sk_kemenkumham}
                                    onChange={(e) => setData('legal_sk_kemenkumham', e.target.value)}
                                    placeholder="AHU-0002557.AH.01.04.Tahun 2019"
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.legal_sk_kemenkumham && <p className="text-xs text-red-500 mt-1">{errors.legal_sk_kemenkumham}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="legal_operational_permit" className="text-xs font-semibold">Izin Operasional PUB Kemensos</Label>
                                <Input
                                    id="legal_operational_permit"
                                    value={data.legal_operational_permit}
                                    onChange={(e) => setData('legal_operational_permit', e.target.value)}
                                    placeholder="SK Kemensos No. xxx/HUK-PS/2024"
                                    className="mt-1 text-xs"
                                />
                                {errors.legal_operational_permit && <p className="text-xs text-red-500 mt-1">{errors.legal_operational_permit}</p>}
                            </div>

                            <div>
                                <Label htmlFor="legal_npwp" className="text-xs font-semibold">NPWP Lembaga</Label>
                                <Input
                                    id="legal_npwp"
                                    value={data.legal_npwp}
                                    onChange={(e) => setData('legal_npwp', e.target.value)}
                                    placeholder="00.000.000.0-000.000"
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.legal_npwp && <p className="text-xs text-red-500 mt-1">{errors.legal_npwp}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Butuh mengunggah berkas PDF akta atau sertifikat resmi?</span>
                            </div>
                            <a 
                                href="/admin/legal-documents" 
                                className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 whitespace-nowrap ml-2"
                            >
                                Arsip Dokumen
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Card 2: Pengesahan Kwitansi Donasi */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pengesahan Kwitansi Donasi</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pejabat penandatangan, stempel resmi, dan tanda tangan pada e-kwitansi donatur.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="receipt_signatory_name" className="text-xs font-semibold">Nama Lengkap Penandatangan</Label>
                                <Input
                                    id="receipt_signatory_name"
                                    value={data.receipt_signatory_name}
                                    onChange={(e) => setData('receipt_signatory_name', e.target.value)}
                                    placeholder="H. Muhammad Ihsan, S.Sos"
                                    className="mt-1"
                                />
                                {errors.receipt_signatory_name && <p className="text-xs text-red-500 mt-1">{errors.receipt_signatory_name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="receipt_signatory_title" className="text-xs font-semibold">Jabatan Lembaga</Label>
                                <Input
                                    id="receipt_signatory_title"
                                    value={data.receipt_signatory_title}
                                    onChange={(e) => setData('receipt_signatory_title', e.target.value)}
                                    placeholder="Direktur Eksekutif Yayasan"
                                    className="mt-1"
                                />
                                {errors.receipt_signatory_title && <p className="text-xs text-red-500 mt-1">{errors.receipt_signatory_title}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <ImageDropzone
                                id="receipt_stamp_image"
                                label="Stempel Resmi Yayasan"
                                helperText="Format PNG transparan. Diletakkan bertumpuk dengan tanda tangan pada kwitansi."
                                previewUrl={previews.stamp}
                                currentStorageUrl={settings.receipt_stamp_image}
                                onFileSelected={(file) => onFileChange('receipt_stamp_image', file)}
                                error={errors.receipt_stamp_image}
                                aspectRatio="square"
                            />

                            <ImageDropzone
                                id="receipt_signature_image"
                                label="Tanda Tangan Digital Pejabat"
                                helperText="Format PNG transparan. Ditampilkan di bawah jabatan penandatangan."
                                previewUrl={previews.signature}
                                currentStorageUrl={settings.receipt_signature_image}
                                onFileSelected={(file) => onFileChange('receipt_signature_image', file)}
                                error={errors.receipt_signature_image}
                                aspectRatio="square"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Kolom Kanan: Interactive Live Previews */}
            <div className="lg:col-span-5 space-y-6">
                {/* 1. Live Footer Preview */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 shadow-md space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-bold text-slate-200 tracking-wider uppercase">
                                Pratinjau Footer Publik
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                            Live
                        </span>
                    </div>

                    <div className="text-xs space-y-3">
                        <p className="text-slate-400 leading-relaxed">
                            &copy; {new Date().getFullYear()} <strong className="text-slate-200">{data.legal_foundation_name || 'Yayasan Peduli Insani Indonesia'}</strong>. Hak cipta dilindungi.
                        </p>

                        <div>
                            {data.show_sk_in_footer === '1' ? (
                                <div className="inline-flex items-center gap-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>
                                        {data.legal_sk_label || 'SK Kemenkumham RI'}: <strong className="text-white font-mono">{data.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.Tahun 2019'}</strong>
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[11px] text-amber-400/80 italic block">
                                    (Badge SK disembunyikan dari footer)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Live E-Receipt Card Preview */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/70">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span>Simulasi Pengesahan Kwitansi</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sah Terverifikasi
                        </span>
                    </div>

                    <div className="bg-gray-50/70 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-200/70 dark:border-gray-700 text-xs space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-gray-500">Badan Hukum:</span>
                            <span className="font-semibold text-gray-900 dark:text-white text-right">
                                {data.legal_foundation_name || 'Yayasan Peduli Insani Indonesia'}
                            </span>
                        </div>
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-gray-500">No. SK Kemenkumham:</span>
                            <span className="font-mono text-gray-800 dark:text-gray-200 text-right">
                                {data.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.Tahun 2019'}
                            </span>
                        </div>
                        {data.legal_operational_permit && (
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-500">Izin PUB:</span>
                                <span className="text-gray-800 dark:text-gray-200 text-right">
                                    {data.legal_operational_permit}
                                </span>
                            </div>
                        )}
                        {data.legal_npwp && (
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-500">NPWP:</span>
                                <span className="font-mono text-gray-800 dark:text-gray-200 text-right">
                                    {data.legal_npwp}
                                </span>
                            </div>
                        )}

                        {/* Stempel & Signature Simulation */}
                        <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] text-gray-400 block">Tertanda:</span>
                                <span className="font-semibold text-gray-900 dark:text-white block mt-0.5">
                                    {data.receipt_signatory_name || 'Pengurus Yayasan'}
                                </span>
                                <span className="text-[11px] text-gray-500 block">
                                    {data.receipt_signatory_title || 'Divisi Keuangan & Donasi'}
                                </span>
                            </div>

                            <div className="relative w-24 h-14 flex items-center justify-center">
                                {activeStampUrl && (
                                    <img 
                                        src={activeStampUrl} 
                                        alt="Stempel" 
                                        className="absolute inset-0 w-full h-full object-contain opacity-75 transform -rotate-6" 
                                    />
                                )}
                                {activeSignatureUrl && (
                                    <img 
                                        src={activeSignatureUrl} 
                                        alt="TTD" 
                                        className="absolute inset-0 w-full h-full object-contain z-10" 
                                    />
                                )}
                                {!activeStampUrl && !activeSignatureUrl && (
                                    <span className="text-[10px] text-gray-400 italic text-center">
                                        (Stempel/TTD belum diunggah)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
