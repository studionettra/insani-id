import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Wallet, AlertCircle, FileText, Calendar, MapPin, Users, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';
import React, { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah, getLocalizedValue } from '@/lib/utils';

export default function Create({
    program,
    availableBalance,
    canWithdraw = true,
    gatingMessage = null,
    bankDetails,
}: any) {
    const programTitle = getLocalizedValue(program?.title, 'Program');
    const platformFeePercent = Number(program?.category?.platform_fee_percent || 0);
    const bankTransferFee = 2500; // Flat BI-Fast admin fee

    const { data, setData, post, processing, errors } = useForm({
        requested_amount: '',
        distribution_plan: '',
        beneficiary_target: '',
        location: '',
        estimated_distribution_date: '',
        supporting_document: null as File | null,
        notes: '',
    });

    const requestedNum = Number(data.requested_amount) || 0;
    const isAmountValid = requestedNum >= 150000 && requestedNum <= availableBalance;

    const calculation = useMemo(() => {
        if (requestedNum < 150000) {
            return {
                platformFee: 0,
                bankFee: bankTransferFee,
                nettAmount: 0,
            };
        }
        const platformFee = requestedNum * (platformFeePercent / 100);
        const nettAmount = Math.max(0, requestedNum - platformFee - bankTransferFee);
        return {
            platformFee,
            bankFee: bankTransferFee,
            nettAmount,
        };
    }, [requestedNum, platformFeePercent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/akun/programs/${program.id}/disbursements`, {
            forceFormData: true,
        });
    };

    const todayDate = new Date().toISOString().split('T')[0];

    return (
        <>
            <Head title={`Pengajuan Pencairan - ${programTitle}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl mx-auto w-full">
                <div className="mb-2">
                    <Link
                        href={`/akun/programs/${program.id}/disbursements`}
                        className="text-sm text-slate-500 hover:text-primary flex items-center mb-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Riwayat Pencairan
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ajukan Pencairan Dana</h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">{programTitle}</p>
                </div>

                {/* Rekening Belum Lengkap */}
                {!bankDetails?.bank_account_number ? (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Data Rekening Belum Lengkap</AlertTitle>
                        <AlertDescription>
                            Anda belum melengkapi data rekening bank di profil Anda. Silakan lengkapi profil rekening terlebih dahulu agar dapat melakukan pencairan dana.
                        </AlertDescription>
                    </Alert>
                ) : !canWithdraw ? (
                    /* Gating Lock Alert */
                    <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">
                        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="ml-2">
                            <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold">Pencairan Dana Belum Dapat Diajukan</AlertTitle>
                            <AlertDescription className="text-amber-700 dark:text-amber-300/90 mt-1 text-sm leading-relaxed">
                                {gatingMessage || 'Anda memiliki kewajiban penyampaian laporan penyaluran yang belum diselesaikan.'}
                            </AlertDescription>
                            <div className="mt-4">
                                <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                                    <Link href={`/akun/programs/${program.id}/updates`}>
                                        <FileText className="w-4 h-4 mr-1.5" /> Buka Menu Kabar Terbaru
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Alert>
                ) : (
                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white">Form Permohonan Pencairan</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-gray-400">
                                Lengkapi rencana penyaluran dan rincian alokasi dana secara transparan untuk diverifikasi oleh tim keuangan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Saldo Tersedia & Warning jika < 150k */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 flex items-center gap-4 border border-blue-100 dark:border-blue-900/40">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Saldo Tersedia</p>
                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatRupiah(availableBalance)}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Min. penarikan Rp 150.000</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-gray-800/60 rounded-lg p-4 border border-slate-100 dark:border-gray-800">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1">Rekening Tujuan:</h4>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{bankDetails.bank_name}</p>
                                    <p className="text-slate-700 dark:text-gray-300 font-mono text-sm">{bankDetails.bank_account_number}</p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">a.n. {bankDetails.bank_account_name}</p>
                                </div>
                            </div>

                            {availableBalance < 150000 && (
                                <Alert className="mb-6 border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertTitle>Saldo Belum Mencukupi</AlertTitle>
                                    <AlertDescription className="text-sm">
                                        Saldo program Anda saat ini ({formatRupiah(availableBalance)}) belum mencapai batas minimal penarikan dana yaitu <strong>Rp 150.000</strong>.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Nominal Penarikan */}
                                <div className="space-y-2">
                                    <Label htmlFor="requested_amount" className="text-slate-900 dark:text-gray-200 font-medium">
                                        Nominal Penarikan (Rp) <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-500">Rp</span>
                                        <Input
                                            id="requested_amount"
                                            type="number"
                                            placeholder="Minimal 150000"
                                            value={data.requested_amount}
                                            onChange={(e) => setData('requested_amount', e.target.value)}
                                            min="150000"
                                            max={availableBalance}
                                            disabled={availableBalance < 150000}
                                            className="pl-10 border-slate-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white font-medium"
                                        />
                                    </div>
                                    {errors.requested_amount && (
                                        <p className="text-xs text-red-500 font-medium">{errors.requested_amount}</p>
                                    )}
                                    {data.requested_amount && !isAmountValid && (
                                        <p className="text-xs text-red-500 font-medium">Nominal harus minimal Rp 150.000 dan tidak melebihi saldo tersedia.</p>
                                    )}
                                </div>

                                {/* Live Breakdown Card */}
                                {requestedNum >= 150000 && (
                                    <div className="bg-slate-50 dark:bg-gray-800/60 rounded-lg p-4 border border-slate-200 dark:border-gray-700/80 space-y-2">
                                        <h4 className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-2">Simulasi Realistis Pencairan:</h4>
                                        <div className="flex justify-between text-sm text-slate-600 dark:text-gray-300">
                                            <span>Nominal Diajukan:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(requestedNum)}</span>
                                        </div>
                                        {platformFeePercent > 0 && (
                                            <div className="flex justify-between text-sm text-slate-600 dark:text-gray-300">
                                                <span>Biaya Platform ({platformFeePercent}%):</span>
                                                <span className="text-red-500 font-medium">- {formatRupiah(calculation.platformFee)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-slate-600 dark:text-gray-300">
                                            <span>Biaya Admin Transfer Bank (BI-Fast):</span>
                                            <span className="text-red-500 font-medium">- {formatRupiah(calculation.bankFee)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 dark:border-gray-700 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                                            <span>Estimasi Dana Bersih Masuk ke Rekening:</span>
                                            <span className="text-lg text-emerald-600 dark:text-emerald-400">{formatRupiah(calculation.nettAmount)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Rencana Penyaluran */}
                                <div className="space-y-2">
                                    <Label htmlFor="distribution_plan" className="text-slate-900 dark:text-gray-200 font-medium flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        Rencana Penggunaan / Penyaluran Dana <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="distribution_plan"
                                        placeholder="Contoh: Pembelian 50 paket sembako, biaya operasional ambulans, dan santunan tunai untuk 20 keluarga dhuafa..."
                                        value={data.distribution_plan}
                                        onChange={(e) => setData('distribution_plan', e.target.value)}
                                        rows={3}
                                        className="border-slate-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                    />
                                    {errors.distribution_plan && (
                                        <p className="text-xs text-red-500">{errors.distribution_plan}</p>
                                    )}
                                </div>

                                {/* Target Penerima Manfaat & Lokasi */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="beneficiary_target" className="text-slate-900 dark:text-gray-200 font-medium flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-slate-500" />
                                            Target Penerima Manfaat <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="beneficiary_target"
                                            placeholder="Contoh: 50 Anak Yatim & Dhuafa"
                                            value={data.beneficiary_target}
                                            onChange={(e) => setData('beneficiary_target', e.target.value)}
                                            className="border-slate-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                        />
                                        {errors.beneficiary_target && (
                                            <p className="text-xs text-red-500">{errors.beneficiary_target}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-slate-900 dark:text-gray-200 font-medium flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            Lokasi Penyaluran <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="location"
                                            placeholder="Contoh: Kec. Dayeuhkolot, Kab. Bandung"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            className="border-slate-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                        />
                                        {errors.location && (
                                            <p className="text-xs text-red-500">{errors.location}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Estimasi Tanggal Penyaluran & Lampiran Dokumen RAB */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_distribution_date" className="text-slate-900 dark:text-gray-200 font-medium flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            Estimasi Tanggal Penyaluran <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="estimated_distribution_date"
                                            type="date"
                                            min={todayDate}
                                            value={data.estimated_distribution_date}
                                            onChange={(e) => setData('estimated_distribution_date', e.target.value)}
                                            className="border-slate-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                        />
                                        {errors.estimated_distribution_date && (
                                            <p className="text-xs text-red-500">{errors.estimated_distribution_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supporting_document" className="text-slate-900 dark:text-gray-200 font-medium flex items-center gap-1.5">
                                            <Upload className="w-4 h-4 text-slate-500" />
                                            Lampiran RAB / Dokumen Pendukung (Opsional)
                                        </Label>
                                        <Input
                                            id="supporting_document"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setData('supporting_document', e.target.files ? e.target.files[0] : null)}
                                            className="border-slate-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-xs py-1.5"
                                        />
                                        <p className="text-[11px] text-slate-400">PDF atau Gambar (Maks. 2MB)</p>
                                        {errors.supporting_document && (
                                            <p className="text-xs text-red-500">{errors.supporting_document}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Catatan Tambahan */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-slate-900 dark:text-gray-200 font-medium">Catatan Tambahan (Opsional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Catatan tambahan untuk tim verifikasi..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={2}
                                        className="border-slate-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                    />
                                    {errors.notes && (
                                        <p className="text-xs text-red-500">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-gray-800 flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                        className="border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800"
                                    >
                                        <Link href={`/akun/programs/${program.id}/disbursements`}>Batal</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            !isAmountValid ||
                                            availableBalance < 150000 ||
                                            !data.distribution_plan ||
                                            !data.beneficiary_target ||
                                            !data.location ||
                                            !data.estimated_distribution_date
                                        }
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold px-6"
                                    >
                                        {processing ? 'Memproses...' : 'Kirim Pengajuan Pencairan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
