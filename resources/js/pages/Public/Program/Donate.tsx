import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
    ChevronRight, 
    ShieldCheck, 
    CreditCard, 
    Landmark, 
    Smartphone, 
    Info,
    Check,
    AlertCircle,
    QrCode
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/PublicLayout';
import { trackInitiateDonation } from '@/lib/analytics';
import { getLocalizedValue, formatCurrency } from '@/lib/utils';

interface PaymentChannel {
    code: string;
    name: string;
    subtitle?: string;
    category: 'qris' | 'virtual_account' | 'ewallet' | 'manual';
    method: 'qris' | 'virtual_account' | 'ewallet' | 'bank_transfer_manual';
    channel: 'online' | 'offline';
    min_amount: number;
    max_amount: number;
    badge?: string;
    account_number?: string;
    account_name?: string;
}

const DEFAULT_CHANNELS: PaymentChannel[] = [
    {
        code: 'QRIS',
        name: 'QRIS',
        subtitle: 'GoPay, OVO, DANA, ShopeePay, BCA, dll',
        category: 'qris',
        method: 'qris',
        channel: 'online',
        min_amount: 10000,
        max_amount: 10000000,
        badge: 'Paling Populer',
    },
    {
        code: 'BCA',
        name: 'BCA Virtual Account',
        subtitle: 'Verifikasi Otomatis',
        category: 'virtual_account',
        method: 'virtual_account',
        channel: 'online',
        min_amount: 10000,
        max_amount: 50000000,
    },
    {
        code: 'MANDIRI',
        name: 'Mandiri Virtual Account',
        subtitle: 'Verifikasi Otomatis',
        category: 'virtual_account',
        method: 'virtual_account',
        channel: 'online',
        min_amount: 10000,
        max_amount: 50000000,
    },
    {
        code: 'BRI',
        name: 'BRI Virtual Account',
        subtitle: 'Verifikasi Otomatis',
        category: 'virtual_account',
        method: 'virtual_account',
        channel: 'online',
        min_amount: 10000,
        max_amount: 50000000,
    },
    {
        code: 'BNI',
        name: 'BNI Virtual Account',
        subtitle: 'Verifikasi Otomatis',
        category: 'virtual_account',
        method: 'virtual_account',
        channel: 'online',
        min_amount: 10000,
        max_amount: 50000000,
    },
    {
        code: 'PERMATA',
        name: 'Permata Virtual Account',
        subtitle: 'Verifikasi Otomatis',
        category: 'virtual_account',
        method: 'virtual_account',
        channel: 'online',
        min_amount: 10000,
        max_amount: 50000000,
    },
    {
        code: 'CIMB',
        name: 'CIMB Niaga Virtual Account',
        subtitle: 'Verifikasi Otomatis',
        category: 'virtual_account',
        method: 'virtual_account',
        channel: 'online',
        min_amount: 10000,
        max_amount: 50000000,
    },
    {
        code: 'SHOPEEPAY',
        name: 'ShopeePay',
        subtitle: 'Aplikasi Shopee / ShopeePay',
        category: 'ewallet',
        method: 'ewallet',
        channel: 'online',
        min_amount: 10000,
        max_amount: 10000000,
    },
    {
        code: 'OVO',
        name: 'OVO',
        subtitle: 'Aplikasi OVO',
        category: 'ewallet',
        method: 'ewallet',
        channel: 'online',
        min_amount: 10000,
        max_amount: 10000000,
    },
    {
        code: 'DANA',
        name: 'DANA',
        subtitle: 'Aplikasi DANA',
        category: 'ewallet',
        method: 'ewallet',
        channel: 'online',
        min_amount: 10000,
        max_amount: 10000000,
    },
    {
        code: 'ASTRAPAY',
        name: 'AstraPay',
        subtitle: 'Aplikasi AstraPay',
        category: 'ewallet',
        method: 'ewallet',
        channel: 'online',
        min_amount: 10000,
        max_amount: 10000000,
    },
    {
        code: 'MANUAL_BSI',
        name: 'Bank Syariah Indonesia (BSI)',
        subtitle: 'Konfirmasi WhatsApp',
        category: 'manual',
        method: 'bank_transfer_manual',
        channel: 'offline',
        min_amount: 10000,
        max_amount: 500000000,
        account_number: '713 219 5026',
        account_name: 'A.n Insani Indonesia',
    },
    {
        code: 'MANUAL_BRI',
        name: 'Bank Rakyat Indonesia (BRI)',
        subtitle: 'Konfirmasi WhatsApp',
        category: 'manual',
        method: 'bank_transfer_manual',
        channel: 'offline',
        min_amount: 10000,
        max_amount: 500000000,
        account_number: '0345 0100 1366 304',
        account_name: 'A.n Insani Indonesia',
    },
];

export default function Donate({ program, onlinePaymentAvailable = true, paymentChannels }: any) {
    const { auth, flash } = usePage().props as any;

    const channels: PaymentChannel[] = (paymentChannels && paymentChannels.length > 0) 
        ? paymentChannels 
        : DEFAULT_CHANNELS;

    const presets = [10000, 20000, 50000, 100000, 500000, 1000000];

    const initialChannel = onlinePaymentAvailable ? 'QRIS' : 'MANUAL_BSI';
    const initialMethod = onlinePaymentAvailable ? 'qris' : 'bank_transfer_manual';
    const initialCategory = onlinePaymentAvailable ? 'online' : 'offline';

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    const { data, setData, post, processing, errors } = useForm({
        amount: presets[2], // Default 50rb
        donor_name: auth?.user?.name || '',
        donor_email: auth?.user?.email || '',
        donor_phone: '',
        is_anonymous: false,
        message: '',
        channel: initialCategory,
        payment_method: initialMethod,
        payment_channel: initialChannel,
        utm_source: urlParams?.get('utm_source') || urlParams?.get('ref') || '',
        utm_medium: urlParams?.get('utm_medium') || '',
        utm_campaign: urlParams?.get('utm_campaign') || '',
        utm_term: urlParams?.get('utm_term') || '',
        utm_content: urlParams?.get('utm_content') || '',
    });

    const [activeTab, setActiveTab] = useState<'qris' | 'virtual_account' | 'ewallet' | 'manual'>(
        onlinePaymentAvailable ? 'qris' : 'manual'
    );

    const selectedChannelDef = useMemo(() => {
        return channels.find(c => c.code.toUpperCase() === data.payment_channel.toUpperCase()) || channels[0];
    }, [channels, data.payment_channel]);

    // Check if the current amount is valid for the selected channel
    const amountValidationNotice = useMemo(() => {
        if (!selectedChannelDef) {
return null;
}

        if (data.amount < selectedChannelDef.min_amount) {
            return `Minimal donasi untuk ${selectedChannelDef.name} adalah ${formatCurrency(selectedChannelDef.min_amount)}`;
        }

        if (data.amount > selectedChannelDef.max_amount) {
            return `Maksimal donasi untuk ${selectedChannelDef.name} adalah ${formatCurrency(selectedChannelDef.max_amount)}. Silakan pilih metode Virtual Account atau Transfer Bank.`;
        }

        return null;
    }, [data.amount, selectedChannelDef]);

    const selectChannel = (channel: PaymentChannel) => {
        setData(prev => ({
            ...prev,
            channel: channel.channel,
            payment_method: channel.method,
            payment_channel: channel.code,
        }));
    };

    const title = getLocalizedValue(program.title);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.amount < 10000) {
            toast.error('Minimal donasi adalah Rp 10.000');

            return;
        }

        if (amountValidationNotice) {
            toast.error(amountValidationNotice);

            return;
        }

        trackInitiateDonation({
            programId: program.id,
            programTitle: title,
            amount: Number(data.amount),
            paymentChannel: data.payment_channel,
            paymentMethod: data.payment_method,
        });

        post(`/program/${program.slug}/donasi`);
    };

    const qrisChannels = channels.filter(c => c.category === 'qris');
    const vaChannels = channels.filter(c => c.category === 'virtual_account');
    const ewalletChannels = channels.filter(c => c.category === 'ewallet');
    const manualChannels = channels.filter(c => c.category === 'manual');

    return (
        <PublicLayout title={`Donasi untuk ${title}`}>

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

                                    {flash?.error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="font-semibold text-red-800">Gagal Memproses Donasi</p>
                                                <p className="leading-relaxed">{flash.error}</p>
                                            </div>
                                        </div>
                                    )}
                                    
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
                                                        ? 'bg-blue-50 border-insani-blue text-insani-blue shadow-xs' 
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-insani-blue/50 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {formatCurrency(preset)}
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
                                                    step="1000"
                                                    min="10000"
                                                    className="pl-12 h-14 text-lg font-bold"
                                                    value={data.amount || ''}
                                                    onChange={e => setData('amount', parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>
                                            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                                        </div>
                                    </div>

                                    {/* Payment Method Section (Option A: Selected in Website) */}
                                    <div className="space-y-4 border-t pt-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-800">Pilih Metode Pembayaran</h2>
                                                <p className="text-xs text-slate-500 mt-0.5">Pilih metode yang paling nyaman untuk Anda.</p>
                                            </div>
                                            {selectedChannelDef && (
                                                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-insani-blue rounded-full border border-blue-100">
                                                    {selectedChannelDef.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Category Navigation Pills */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                            <button
                                                type="button"
                                                disabled={!onlinePaymentAvailable}
                                                onClick={() => {
                                                    setActiveTab('qris');

                                                    if (qrisChannels[0]) {
selectChannel(qrisChannels[0]);
}
                                                }}
                                                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                                    activeTab === 'qris'
                                                        ? 'border-insani-blue bg-blue-50/80 text-insani-blue shadow-xs font-semibold'
                                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                                } ${!onlinePaymentAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <QrCode className="w-5 h-5" />
                                                <span className="text-xs">QRIS</span>
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!onlinePaymentAvailable}
                                                onClick={() => {
                                                    setActiveTab('virtual_account');

                                                    if (vaChannels[0]) {
selectChannel(vaChannels[0]);
}
                                                }}
                                                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                                    activeTab === 'virtual_account'
                                                        ? 'border-insani-blue bg-blue-50/80 text-insani-blue shadow-xs font-semibold'
                                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                                } ${!onlinePaymentAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <CreditCard className="w-5 h-5" />
                                                <span className="text-xs">Virtual Account</span>
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!onlinePaymentAvailable}
                                                onClick={() => {
                                                    setActiveTab('ewallet');

                                                    if (ewalletChannels[0]) {
selectChannel(ewalletChannels[0]);
}
                                                }}
                                                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                                    activeTab === 'ewallet'
                                                        ? 'border-insani-blue bg-blue-50/80 text-insani-blue shadow-xs font-semibold'
                                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                                } ${!onlinePaymentAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Smartphone className="w-5 h-5" />
                                                <span className="text-xs">E-Wallet</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveTab('manual');

                                                    if (manualChannels[0]) {
selectChannel(manualChannels[0]);
}
                                                }}
                                                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                                    activeTab === 'manual'
                                                        ? 'border-insani-blue bg-blue-50/80 text-insani-blue shadow-xs font-semibold'
                                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <Landmark className="w-5 h-5" />
                                                <span className="text-xs">Transfer Manual</span>
                                            </button>
                                        </div>

                                        {/* Channel Options Box */}
                                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 mt-3">
                                            
                                            {/* Tab 1: QRIS */}
                                            {activeTab === 'qris' && (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-slate-500 font-medium">Pindai kode QRIS menggunakan GoPay, OVO, DANA, ShopeePay, BCA Mobile, atau aplikasi bank apa pun.</p>
                                                    {qrisChannels.map((channel) => {
                                                        const isSelected = data.payment_channel.toUpperCase() === channel.code.toUpperCase();
                                                        const isNominalExceeded = data.amount > channel.max_amount;

                                                        return (
                                                            <div
                                                                key={channel.code}
                                                                onClick={() => !isNominalExceeded && selectChannel(channel)}
                                                                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                                                                    isNominalExceeded 
                                                                        ? 'opacity-60 bg-slate-100 border-slate-200 cursor-not-allowed'
                                                                        : isSelected 
                                                                            ? 'border-insani-blue bg-white shadow-xs cursor-pointer' 
                                                                            : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-insani-blue text-white' : 'bg-slate-100 text-slate-700'}`}>
                                                                        QRIS
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-slate-800 text-sm sm:text-base">{channel.name}</span>
                                                                            {channel.badge && (
                                                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                                                                                    {channel.badge}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-slate-500 block mt-0.5">{channel.subtitle}</span>
                                                                        <span className="text-[11px] text-slate-400 block mt-0.5">
                                                                            Maks. {formatCurrency(channel.max_amount)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0 pl-2">
                                                                    {isSelected ? (
                                                                        <div className="w-6 h-6 rounded-full bg-insani-blue text-white flex items-center justify-center">
                                                                            <Check className="w-4 h-4 stroke-[3]" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Tab 2: Virtual Account */}
                                            {activeTab === 'virtual_account' && (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-slate-500 font-medium mb-3">Nomor Virtual Account terbit otomatis dan diverifikasi secara instan 24/7.</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                        {vaChannels.map((channel) => {
                                                            const isSelected = data.payment_channel.toUpperCase() === channel.code.toUpperCase();
                                                            const isNominalExceeded = data.amount > channel.max_amount;

                                                            return (
                                                                <div
                                                                    key={channel.code}
                                                                    onClick={() => !isNominalExceeded && selectChannel(channel)}
                                                                    className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                                                                        isNominalExceeded
                                                                            ? 'opacity-60 bg-slate-100 border-slate-200 cursor-not-allowed'
                                                                            : isSelected
                                                                                ? 'border-insani-blue bg-white shadow-xs cursor-pointer'
                                                                                : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                                                                    }`}
                                                                >
                                                                    <div>
                                                                        <span className="font-bold text-slate-800 text-sm block">{channel.name}</span>
                                                                        <span className="text-[11px] text-slate-400 block mt-0.5">
                                                                            Maks. {formatCurrency(channel.max_amount)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="shrink-0 pl-2">
                                                                        {isSelected ? (
                                                                            <div className="w-5 h-5 rounded-full bg-insani-blue text-white flex items-center justify-center">
                                                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 3: E-Wallets */}
                                            {activeTab === 'ewallet' && (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-slate-500 font-medium mb-3">Bayar langsung melalui aplikasi e-wallet Anda.</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                        {ewalletChannels.map((channel) => {
                                                            const isSelected = data.payment_channel.toUpperCase() === channel.code.toUpperCase();
                                                            const isNominalExceeded = data.amount > channel.max_amount;

                                                            return (
                                                                <div
                                                                    key={channel.code}
                                                                    onClick={() => !isNominalExceeded && selectChannel(channel)}
                                                                    className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                                                                        isNominalExceeded
                                                                            ? 'opacity-60 bg-slate-100 border-slate-200 cursor-not-allowed'
                                                                            : isSelected
                                                                                ? 'border-insani-blue bg-white shadow-xs cursor-pointer'
                                                                                : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                                                                    }`}
                                                                >
                                                                    <div>
                                                                        <span className="font-bold text-slate-800 text-sm block">{channel.name}</span>
                                                                        <span className="text-[11px] text-slate-400 block mt-0.5">
                                                                            Maks. {formatCurrency(channel.max_amount)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="shrink-0 pl-2">
                                                                        {isSelected ? (
                                                                            <div className="w-5 h-5 rounded-full bg-insani-blue text-white flex items-center justify-center">
                                                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 4: Manual Transfer */}
                                            {activeTab === 'manual' && (
                                                <div className="space-y-2.5">
                                                    <p className="text-xs text-slate-500 font-medium mb-2">Transfer ke rekening resmi Yayasan Peduli Insani Indonesia dengan kode unik 3 angka.</p>
                                                    {manualChannels.map((channel) => {
                                                        const isSelected = data.payment_channel.toUpperCase() === channel.code.toUpperCase();

                                                        return (
                                                            <div
                                                                key={channel.code}
                                                                onClick={() => selectChannel(channel)}
                                                                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                                                                    isSelected
                                                                        ? 'border-insani-blue bg-white shadow-xs'
                                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-insani-blue text-white' : 'bg-slate-100 text-slate-700'}`}>
                                                                        BANK
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold text-slate-800 text-sm sm:text-base block">{channel.name}</span>
                                                                        <span className="text-xs text-slate-500 font-mono mt-0.5 block">{channel.account_number} ({channel.account_name})</span>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0 pl-2">
                                                                    {isSelected ? (
                                                                        <div className="w-6 h-6 rounded-full bg-insani-blue text-white flex items-center justify-center">
                                                                            <Check className="w-4 h-4 stroke-[3]" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                        </div>

                                        {/* Validation Limit Warning */}
                                        {amountValidationNotice && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
                                                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                                                <span>{amountValidationNotice}</span>
                                            </div>
                                        )}
                                        {errors.payment_channel && (
                                            <p className="text-red-500 text-xs mt-1">{errors.payment_channel}</p>
                                        )}
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
                                                <Label htmlFor="donor_name">Nama Lengkap <span className="text-red-500">*</span></Label>
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
                                                <Label htmlFor="donor_phone">Nomor WhatsApp <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    id="donor_phone" 
                                                    className="mt-1" 
                                                    placeholder="Contoh: 08123456789"
                                                    value={data.donor_phone}
                                                    onChange={e => setData('donor_phone', e.target.value)}
                                                    required
                                                />
                                                {errors.donor_phone && <p className="text-red-500 text-sm mt-1">{errors.donor_phone}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="donor_email">Email <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    id="donor_email" 
                                                    type="email"
                                                    className="mt-1" 
                                                    placeholder="alamat@email.com"
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
                                        className="w-full h-14 text-lg font-bold bg-insani-blue hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                        disabled={processing || !!amountValidationNotice}
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
                                            src={program.cover_image ? `/storage/${program.cover_image}` : 'https://placehold.co/150x150?text=No+Image'} 
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
                                        <span className="font-medium text-slate-800">{formatCurrency(data.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 text-sm">
                                        <span>Metode Dipilih</span>
                                        <span className="font-semibold text-slate-800 text-right max-w-[150px] truncate">
                                            {selectedChannelDef?.name || 'Metode Pembayaran'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                                    <span>Total Tagihan</span>
                                    <span className="text-insani-blue">{formatCurrency(data.amount)}</span>
                                </div>
                                {data.channel === 'offline' && (
                                    <p className="text-xs text-slate-500 mt-2 text-right">
                                        *Terdapat penyesuaian kode unik 3 digit saat transfer manual
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
