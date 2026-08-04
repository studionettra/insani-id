import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Wallet, AlertCircle } from 'lucide-react';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/PublicLayout';
import { formatRupiah } from '@/lib/utils';

export default function Create({ program, availableBalance, bankDetails }: any) {
    const { data, setData, post, processing, errors } = useForm({
        requested_amount: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('akun.programs.disbursements.store', program.id));
    };

    const isAmountValid = Number(data.requested_amount) >= 10000 && Number(data.requested_amount) <= availableBalance;

    return (
        <PublicLayout>
            <Head title={`Pengajuan Pencairan - ${program.title}`} />

            <div className="bg-slate-50 py-12 min-h-screen">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="mb-6">
                        <Link href={route('akun.programs.disbursements.index', program.id)} className="text-sm text-slate-500 hover:text-primary flex items-center mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Riwayat Pencairan
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">Ajukan Pencairan Dana</h1>
                        <p className="text-slate-500 mt-1">{program.title}</p>
                    </div>

                    {!bankDetails?.bank_account_number ? (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Data Rekening Belum Lengkap</AlertTitle>
                            <AlertDescription>
                                Anda belum melengkapi data rekening bank di profil Anda. Silakan lengkapi profil rekening terlebih dahulu agar dapat melakukan pencairan dana.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Pencairan</CardTitle>
                                <CardDescription>Pencairan akan ditransfer ke rekening terdaftar Anda.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-primary/5 rounded-lg p-4 mb-6 flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Saldo Tersedia</p>
                                        <p className="text-2xl font-bold text-primary">{formatRupiah(availableBalance)}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
                                    <h4 className="font-medium text-slate-900 mb-2">Rekening Tujuan:</h4>
                                    <p className="text-slate-700">{bankDetails.bank_name}</p>
                                    <p className="text-slate-700 font-mono">{bankDetails.bank_account_number}</p>
                                    <p className="text-slate-700">a.n. {bankDetails.bank_account_name}</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="requested_amount">Nominal Penarikan (Rp)</Label>
                                        <Input
                                            id="requested_amount"
                                            type="number"
                                            placeholder="Min. 10000"
                                            value={data.requested_amount}
                                            onChange={(e) => setData('requested_amount', e.target.value)}
                                            min="10000"
                                            max={availableBalance}
                                        />
                                        {errors.requested_amount && (
                                            <p className="text-sm text-red-500">{errors.requested_amount}</p>
                                        )}
                                        {data.requested_amount && !isAmountValid && (
                                            <p className="text-sm text-red-500">Nominal harus antara Rp 10.000 hingga saldo tersedia.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Keperluan penarikan..."
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                        />
                                        {errors.notes && (
                                            <p className="text-sm text-red-500">{errors.notes}</p>
                                        )}
                                    </div>

                                    {program.category?.platform_fee_percent > 0 && (
                                        <Alert className="bg-blue-50 border-blue-200">
                                            <AlertCircle className="h-4 w-4 text-blue-600" />
                                            <AlertTitle className="text-blue-800">Informasi Biaya Platform</AlertTitle>
                                            <AlertDescription className="text-blue-700">
                                                Kategori program ini mengenakan biaya platform sebesar <strong>{program.category.platform_fee_percent}%</strong> dari nominal yang ditarik.
                                                Biaya ini akan dipotong secara otomatis dari total penarikan Anda.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={route('akun.programs.disbursements.index', program.id)}>Batal</Link>
                                        </Button>
                                        <Button type="submit" disabled={processing || !isAmountValid || availableBalance < 10000}>
                                            Ajukan Pencairan
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
