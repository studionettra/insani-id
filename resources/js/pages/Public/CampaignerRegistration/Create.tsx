import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/PublicLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        type: 'individu',
        nama_lembaga: '',
        nomor_sk: '',
        npwp: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        address: '',
        phone: '',
        ktp: null as File | null,
        selfie_ktp: null as File | null,
        buku_rekening: null as File | null,
        sk_lembaga: null as File | null,
        npwp_lembaga: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('campaigner.register.store'));
    };

    return (
        <PublicLayout>
            <Head title="Pendaftaran Campaigner" />
            
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-insani-blue mb-2">Pendaftaran Campaigner</h1>
                    <p className="text-muted-foreground">Bergabunglah sebagai penggalang dana untuk membantu mereka yang membutuhkan.</p>
                </div>

                <div className="bg-card shadow-sm rounded-lg border p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold border-b pb-2">Informasi Dasar</h2>
                            
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipe Campaigner</Label>
                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individu">Individu / Pribadi</SelectItem>
                                        <SelectItem value="lembaga">Lembaga / Yayasan</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                            </div>

                            {data.type === 'lembaga' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_lembaga">Nama Lembaga</Label>
                                        <Input id="nama_lembaga" value={data.nama_lembaga} onChange={e => setData('nama_lembaga', e.target.value)} />
                                        {errors.nama_lembaga && <p className="text-sm text-red-500">{errors.nama_lembaga}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nomor_sk">Nomor SK Kemenkumham</Label>
                                            <Input id="nomor_sk" value={data.nomor_sk} onChange={e => setData('nomor_sk', e.target.value)} />
                                            {errors.nomor_sk && <p className="text-sm text-red-500">{errors.nomor_sk}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="npwp">NPWP Lembaga</Label>
                                            <Input id="npwp" value={data.npwp} onChange={e => setData('npwp', e.target.value)} />
                                            {errors.npwp && <p className="text-sm text-red-500">{errors.npwp}</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                                <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea id="address" value={data.address} onChange={e => setData('address', e.target.value)} />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold border-b pb-2">Informasi Rekening Bank</h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Dana donasi akan dicairkan ke rekening ini. {data.type === 'lembaga' && <strong className="text-red-500">Wajib atas nama lembaga.</strong>}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Nama Bank</Label>
                                    <Input id="bank_name" placeholder="Contoh: BCA, BSI, Mandiri" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} />
                                    {errors.bank_name && <p className="text-sm text-red-500">{errors.bank_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_account_number">Nomor Rekening</Label>
                                    <Input id="bank_account_number" value={data.bank_account_number} onChange={e => setData('bank_account_number', e.target.value)} />
                                    {errors.bank_account_number && <p className="text-sm text-red-500">{errors.bank_account_number}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bank_account_name">Atas Nama Rekening</Label>
                                <Input id="bank_account_name" value={data.bank_account_name} onChange={e => setData('bank_account_name', e.target.value)} />
                                {errors.bank_account_name && <p className="text-sm text-red-500">{errors.bank_account_name}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold border-b pb-2">Dokumen Verifikasi</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ktp">Scan/Foto KTP PIC</Label>
                                    <Input id="ktp" type="file" accept="image/*" onChange={e => setData('ktp', e.target.files ? e.target.files[0] : null)} />
                                    {errors.ktp && <p className="text-sm text-red-500">{errors.ktp}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="selfie_ktp">Selfie dengan KTP</Label>
                                    <Input id="selfie_ktp" type="file" accept="image/*" onChange={e => setData('selfie_ktp', e.target.files ? e.target.files[0] : null)} />
                                    {errors.selfie_ktp && <p className="text-sm text-red-500">{errors.selfie_ktp}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="buku_rekening">Foto Buku Rekening (Bagian Nama & Nomor)</Label>
                                    <Input id="buku_rekening" type="file" accept="image/*" onChange={e => setData('buku_rekening', e.target.files ? e.target.files[0] : null)} />
                                    {errors.buku_rekening && <p className="text-sm text-red-500">{errors.buku_rekening}</p>}
                                </div>
                            </div>

                            {data.type === 'lembaga' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sk_lembaga">Surat Keputusan (SK) Lembaga</Label>
                                        <Input id="sk_lembaga" type="file" accept=".pdf,image/*" onChange={e => setData('sk_lembaga', e.target.files ? e.target.files[0] : null)} />
                                        {errors.sk_lembaga && <p className="text-sm text-red-500">{errors.sk_lembaga}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="npwp_lembaga">Scan NPWP Lembaga</Label>
                                        <Input id="npwp_lembaga" type="file" accept="image/*" onChange={e => setData('npwp_lembaga', e.target.files ? e.target.files[0] : null)} />
                                        {errors.npwp_lembaga && <p className="text-sm text-red-500">{errors.npwp_lembaga}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button type="submit" className="w-full bg-insani-blue hover:bg-insani-blue/90" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Ajukan Pendaftaran'}
                        </Button>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
