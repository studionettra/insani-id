import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronRight, ShieldCheck, CreditCard, Landmark, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/PublicLayout';


export default function Donate({ program }: any) {
    const { auth } = usePage().props as any;
    

    const presets = [10000, 20000, 50000, 100000, 500000, 1000000];

    const { data, setData, post, processing, errors } = useForm({
        amount: presets[2], // Default 50rb
        donor_name: auth?.user?.name || '',
        donor_email: auth?.user?.email || '',
        donor_phone: '',
        is_anonymous: false,
        message: '',
        channel: 'online'
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/program/${program.slug}/donasi`);
    };

    const title = program.title;

    return (
        <PublicLayout>
            <Head title={`Donasi untuk ${title}`} />

            <div className="bg-slate-50 min-h-screen py-8 md:py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-slate-500 mb-6">
                        <Link href="/program" className="hover:text-insani-blue transition-colors">Program Donasi</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link href={`/program/${program.slug}`} className="hover:text-insani-blue transition-colors truncate max-w-[150px]">{title}</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-slate-800 font-medium">Berdonasi</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="md:col-span-2 space-y-6">
                            
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                                <h1 className="text-2xl font-bold text-slate-800 mb-6">Masukkan Nominal Donasi</h1>
                                
                                <form onSubmit={submit} className="space-y-8">
                                    
                                    {/* Amount Selection */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {presets.map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setData('amount', preset)}
                                                    className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all ${
                                                        data.amount === preset 
                                                        ? 'bg-blue-50 border-insani-blue text-insani-blue' 
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-insani-blue/50 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    Rp {preset.toLocaleString('id-ID')}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <div className="pt-2">
                                            <Label htmlFor="custom_amount">Nominal Lainnya</Label>
                                            <div className="relative mt-1">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <span className="text-slate-500 font-medium">Rp</span>
                                                </div>
                                                <Input
                                                    id="custom_amount"
                                                    type="number"
                                                    min="10000"
                                                    step="1000"
                                                    className="pl-12 h-14 text-lg font-bold"
                                                    value={data.amount}
                                                    onChange={e => setData('amount', parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>
                                            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-slate-800 border-t pt-8">Metode Pembayaran</h2>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 flex-col gap-3 transition-all ${data.channel === 'online' ? 'border-insani-blue bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                                <input type="radio" name="channel" value="online" checked={data.channel === 'online'} onChange={() => setData('channel', 'online')} className="sr-only" />
                                                <div className="flex justify-between items-center w-full">
                                                    <CreditCard className={`w-6 h-6 ${data.channel === 'online' ? 'text-insani-blue' : 'text-slate-400'}`} />
                                                    {data.channel === 'online' && <CheckCircle2 className="w-5 h-5 text-insani-blue" />}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-slate-800">Online Payment</span>
                                                    <span className="block text-sm text-slate-500">Virtual Account, QRIS, e-Wallet</span>
                                                </div>
                                            </label>

                                            <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 flex-col gap-3 transition-all ${data.channel === 'offline' ? 'border-insani-blue bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                                <input type="radio" name="channel" value="offline" checked={data.channel === 'offline'} onChange={() => setData('channel', 'offline')} className="sr-only" />
                                                <div className="flex justify-between items-center w-full">
                                                    <Landmark className={`w-6 h-6 ${data.channel === 'offline' ? 'text-insani-blue' : 'text-slate-400'}`} />
                                                    {data.channel === 'offline' && <CheckCircle2 className="w-5 h-5 text-insani-blue" />}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-slate-800">Transfer Manual</span>
                                                    <span className="block text-sm text-slate-500">Transfer Bank & Verifikasi Manual</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Profile */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-t pt-8 pb-2">
                                            <h2 className="text-xl font-bold text-slate-800">Profil Donatur</h2>
                                            {!auth?.user && (
                                                <Link href="/login" className="text-sm font-semibold text-insani-blue hover:underline">
                                                    Masuk
                                                </Link>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="donor_name">Nama Lengkap</Label>
                                                <Input 
                                                    id="donor_name" 
                                                    className="mt-1" 
                                                    value={data.donor_name}
                                                    onChange={e => setData('donor_name', e.target.value)}
                                                    required
                                                />
                                                {errors.donor_name && <p className="text-red-500 text-sm mt-1">{errors.donor_name}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="donor_phone">Nomor WhatsApp</Label>
                                                <Input 
                                                    id="donor_phone" 
                                                    className="mt-1"
                                                    value={data.donor_phone}
                                                    onChange={e => setData('donor_phone', e.target.value)}
                                                    required
                                                />
                                                {errors.donor_phone && <p className="text-red-500 text-sm mt-1">{errors.donor_phone}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="donor_email">Email</Label>
                                                <Input 
                                                    id="donor_email" 
                                                    type="email"
                                                    className="mt-1" 
                                                    value={data.donor_email}
                                                    onChange={e => setData('donor_email', e.target.value)}
                                                    required
                                                />
                                                {errors.donor_email && <p className="text-red-500 text-sm mt-1">{errors.donor_email}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 pt-2 border-b pb-8">
                                            <Switch 
                                                id="is_anonymous" 
                                                checked={data.is_anonymous} 
                                                onCheckedChange={(checked) => setData('is_anonymous', checked)} 
                                            />
                                            <Label htmlFor="is_anonymous" className="cursor-pointer">Sembunyikan nama saya (Hamba Allah)</Label>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-slate-800">Doa & Dukungan <span className="text-slate-400 font-normal text-sm">(Opsional)</span></h2>
                                        <Textarea 
                                            placeholder="Tuliskan doa untuk program ini..."
                                            rows={4}
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                        />
                                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full h-14 text-lg font-bold bg-insani-blue hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                                        disabled={processing}
                                    >
                                        {processing ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                                    </Button>
                                    
                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mt-4">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Transaksi aman dan terenkripsi.</span>
                                    </div>

                                </form>
                            </div>
                        </div>

                        {/* Sidebar Recap */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                                <h3 className="font-bold text-slate-800 mb-4 pb-4 border-b">Ringkasan Donasi</h3>
                                
                                <div className="flex gap-4 items-start mb-6">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                        <img 
                                            src={program.image_url || 'https://placehold.co/150x150?text=No+Image'} 
                                            alt={title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 line-clamp-3">{title}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 pb-6 border-b">
                                    <div className="flex justify-between text-slate-600 text-sm">
                                        <span>Nominal Donasi</span>
                                        <span className="font-medium text-slate-800">Rp {data.amount.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 text-sm">
                                        <span>Metode</span>
                                        <span className="font-medium text-slate-800 capitalize">{data.channel === 'online' ? 'Online Payment' : 'Transfer Manual'}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                                    <span>Total Tagihan</span>
                                    <span className="text-insani-blue">Rp {data.amount.toLocaleString('id-ID')}</span>
                                </div>
                                {data.channel === 'offline' && (
                                    <p className="text-xs text-slate-500 mt-2 text-right">
                                        *Terdapat tambahan kode unik 3 angka saat transfer manual
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
