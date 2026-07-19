import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import campaigner from '@/routes/campaigner';

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
        post(campaigner.register.store().url);
    };

    return (
        <>
            <Head title="Pendaftaran Campaigner" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Pendaftaran Campaigner</h1>
                    <p className="text-sm text-gray-500">Lengkapi data berikut untuk bergabung sebagai penggalang dana.</p>
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 text-gray-900">Informasi Dasar</h2>
                            
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-gray-700">Tipe Campaigner</Label>
                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                    <SelectTrigger className="border-gray-200">
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
                                        <Label htmlFor="nama_lembaga" className="text-gray-700">Nama Lembaga</Label>
                                        <Input id="nama_lembaga" className="border-gray-200" value={data.nama_lembaga} onChange={e => setData('nama_lembaga', e.target.value)} />
                                        {errors.nama_lembaga && <p className="text-sm text-red-500">{errors.nama_lembaga}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nomor_sk" className="text-gray-700">Nomor SK Kemenkumham</Label>
                                            <Input id="nomor_sk" className="border-gray-200" value={data.nomor_sk} onChange={e => setData('nomor_sk', e.target.value)} />
                                            {errors.nomor_sk && <p className="text-sm text-red-500">{errors.nomor_sk}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="npwp" className="text-gray-700">NPWP Lembaga</Label>
                                            <Input id="npwp" className="border-gray-200" value={data.npwp} onChange={e => setData('npwp', e.target.value)} />
                                            {errors.npwp && <p className="text-sm text-red-500">{errors.npwp}</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-700">Nomor Telepon / WhatsApp</Label>
                                <Input id="phone" className="border-gray-200" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-gray-700">Alamat Lengkap</Label>
                                <Textarea id="address" className="border-gray-200 min-h-[100px]" value={data.address} onChange={e => setData('address', e.target.value)} />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 text-gray-900">Informasi Rekening Bank</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Dana donasi akan dicairkan ke rekening ini. {data.type === 'lembaga' && <strong className="text-red-500">Wajib atas nama lembaga.</strong>}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name" className="text-gray-700">Nama Bank</Label>
                                    <Input id="bank_name" className="border-gray-200" placeholder="Contoh: BCA, BSI, Mandiri" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} />
                                    {errors.bank_name && <p className="text-sm text-red-500">{errors.bank_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_account_number" className="text-gray-700">Nomor Rekening</Label>
                                    <Input id="bank_account_number" className="border-gray-200" value={data.bank_account_number} onChange={e => setData('bank_account_number', e.target.value)} />
                                    {errors.bank_account_number && <p className="text-sm text-red-500">{errors.bank_account_number}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bank_account_name" className="text-gray-700">Atas Nama Rekening</Label>
                                <Input id="bank_account_name" className="border-gray-200" value={data.bank_account_name} onChange={e => setData('bank_account_name', e.target.value)} />
                                {errors.bank_account_name && <p className="text-sm text-red-500">{errors.bank_account_name}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 text-gray-900">Dokumen Verifikasi</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ktp" className="text-gray-700">Scan/Foto KTP PIC</Label>
                                    <Input id="ktp" type="file" accept="image/*" className="border-gray-200 cursor-pointer" onChange={e => setData('ktp', e.target.files ? e.target.files[0] : null)} />
                                    {errors.ktp && <p className="text-sm text-red-500">{errors.ktp}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="selfie_ktp" className="text-gray-700">Selfie dengan KTP</Label>
                                    <Input id="selfie_ktp" type="file" accept="image/*" className="border-gray-200 cursor-pointer" onChange={e => setData('selfie_ktp', e.target.files ? e.target.files[0] : null)} />
                                    {errors.selfie_ktp && <p className="text-sm text-red-500">{errors.selfie_ktp}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="buku_rekening" className="text-gray-700">Foto Buku Rekening (Bagian Nama & Nomor)</Label>
                                    <Input id="buku_rekening" type="file" accept="image/*" className="border-gray-200 cursor-pointer" onChange={e => setData('buku_rekening', e.target.files ? e.target.files[0] : null)} />
                                    {errors.buku_rekening && <p className="text-sm text-red-500">{errors.buku_rekening}</p>}
                                </div>
                            </div>

                            {data.type === 'lembaga' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sk_lembaga" className="text-gray-700">Surat Keputusan (SK) Lembaga</Label>
                                        <Input id="sk_lembaga" type="file" accept=".pdf,image/*" className="border-gray-200 cursor-pointer" onChange={e => setData('sk_lembaga', e.target.files ? e.target.files[0] : null)} />
                                        {errors.sk_lembaga && <p className="text-sm text-red-500">{errors.sk_lembaga}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="npwp_lembaga" className="text-gray-700">Scan NPWP Lembaga</Label>
                                        <Input id="npwp_lembaga" type="file" accept="image/*" className="border-gray-200 cursor-pointer" onChange={e => setData('npwp_lembaga', e.target.files ? e.target.files[0] : null)} />
                                        {errors.npwp_lembaga && <p className="text-sm text-red-500">{errors.npwp_lembaga}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button type="submit" className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Ajukan Pendaftaran'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
