import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { 
    CreditCard, 
    QrCode, 
    Smartphone, 
    Landmark, 
    CheckCircle2, 
    XCircle, 
    RefreshCw, 
    Building2,
    Wallet,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BankLogo from '@/components/ui/bank-logo';

export interface BankAccount {
    id: number;
    bank_name: string;
    bank_code: string | null;
    account_number: string;
    account_name: string;
    bank_type: 'syariah' | 'konvensional';
    logo_path: string | null;
    logo_url: string | null;
    instructions: string | null;
    is_active: boolean;
    sort_order: number;
}

interface PaymentGatewayTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    bankAccounts?: BankAccount[];
}

export default function PaymentGatewayTab({
    data,
    setData,
    errors,
    bankAccounts = [],
}: PaymentGatewayTabProps) {
    const [togglingBankId, setTogglingBankId] = useState<number | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
        environment?: string;
    } | null>(null);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/admin/site-settings/test-midtrans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });
            const json = await res.json();
            setTestResult(json);
            if (json.success) {
                toast.success(json.message);
            } else {
                toast.error(json.message);
            }
        } catch (err: any) {
            const msg = err?.message || 'Gagal menghubungi server testing.';
            setTestResult({ success: false, message: msg });
            toast.error(msg);
        } finally {
            setIsTesting(false);
        }
    };

    const handleToggleBankAccount = (account: BankAccount) => {
        setTogglingBankId(account.id);
        router.patch(
            `/admin/bank-accounts/${account.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status rekening ${account.bank_name} berhasil ${account.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
                },
                onError: () => {
                    toast.error(`Gagal mengubah status rekening ${account.bank_name}.`);
                },
                onFinish: () => {
                    setTogglingBankId(null);
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* ======================================================== */}
            {/* Card 1: Status Gateway Midtrans Core API & Uji Koneksi   */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-gray-800/95 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-brand-600 dark:bg-blue-950 dark:text-blue-400">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Status Gateway Midtrans Core API</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Integrasi 100% Custom End-to-End Server-to-Server tanpa popup Snap.</p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Uji Koneksi Kredensial API</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Memvalidasi Server Key dan Client Key yang terpasang di sistem apakah siap bertransaksi.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="self-start sm:self-auto gap-2 bg-white dark:bg-gray-800 text-xs font-semibold border-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Memeriksa...' : 'Uji Koneksi Midtrans'}</span>
                    </Button>
                </div>

                {testResult && (
                    <div className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                        testResult.success 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200' 
                            : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200'
                    }`}>
                        {testResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                            <p className="font-semibold">{testResult.message}</p>
                            {testResult.environment && (
                                <p className="opacity-80">Environment Terdeteksi: <strong>{testResult.environment}</strong></p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* Card 2: Saluran QRIS & E-Wallet (Aktif)                   */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-gray-800/95 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Saluran QRIS & E-Wallet</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Metode donasi instan yang aktif di akun Midtrans Anda.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* QRIS */}
                    {(() => {
                        const isActive = data.midtrans_channel_qris !== '0';
                        return (
                            <div className={`p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                                isActive 
                                    ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 shadow-2xs' 
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 opacity-75'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <BankLogo code="qris" size="md" />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-gray-900 dark:text-white">GoPay Dynamic QRIS</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">0.7%</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Mendukung BCA, Mandiri, BRI, BSI, OVO, DANA</p>
                                        <div className="pt-0.5">
                                            {isActive ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={(checked) => setData('midtrans_channel_qris', checked ? '1' : '0')}
                                />
                            </div>
                        );
                    })()}

                    {/* ShopeePay */}
                    {(() => {
                        const isActive = data.midtrans_channel_shopeepay !== '0';
                        return (
                            <div className={`p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                                isActive 
                                    ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 shadow-2xs' 
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 opacity-75'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <BankLogo code="shopeepay" size="md" />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-gray-900 dark:text-white">ShopeePay</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">2.0%</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Deeplink buka aplikasi Shopee di HP / QR scan</p>
                                        <div className="pt-0.5">
                                            {isActive ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={(checked) => setData('midtrans_channel_shopeepay', checked ? '1' : '0')}
                                />
                            </div>
                        );
                    })()}

                    {/* GoPay */}
                    {(() => {
                        const isActive = data.midtrans_channel_gopay !== '0';
                        return (
                            <div className={`p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                                isActive 
                                    ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 shadow-2xs' 
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 opacity-75'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <BankLogo code="gopay" size="md" />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-gray-900 dark:text-white">GoPay E-Wallet</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">2.0%</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Deeplink buka aplikasi Gojek di HP / QR scan</p>
                                        <div className="pt-0.5">
                                            {isActive ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={(checked) => setData('midtrans_channel_gopay', checked ? '1' : '0')}
                                />
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* ======================================================== */}
            {/* Card 3: Saluran Virtual Account Bank (Dalam Pengajuan)   */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-gray-800/95 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Saluran Virtual Account Bank</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Aktifkan sakelar bank di bawah begitu permohonan disetujui di Midtrans.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    {/* Daftar 8 Bank Virtual Account */}
                    {[
                        { 
                            key: 'midtrans_channel_bsi_va', 
                            code: 'bsi',
                            name: 'BSI Virtual Account', 
                            desc: 'Bank Syariah Indonesia'
                        },
                        { 
                            key: 'midtrans_channel_bri_va', 
                            code: 'bri',
                            name: 'BRI Virtual Account', 
                            desc: 'Bank Rakyat Indonesia'
                        },
                        { 
                            key: 'midtrans_channel_bni_va', 
                            code: 'bni',
                            name: 'BNI Virtual Account', 
                            desc: 'Bank Negara Indonesia'
                        },
                        { 
                            key: 'midtrans_channel_mandiri_va', 
                            code: 'mandiri',
                            name: 'Mandiri Bill Payment', 
                            desc: 'Bank Mandiri'
                        },
                        { 
                            key: 'midtrans_channel_bca_va', 
                            code: 'bca',
                            name: 'BCA Virtual Account', 
                            desc: 'Akun BCA Bisnis'
                        },
                        { 
                            key: 'midtrans_channel_permata_va', 
                            code: 'permata',
                            name: 'Permata Virtual Account', 
                            desc: 'Bank Permata'
                        },
                        { 
                            key: 'midtrans_channel_cimb_va', 
                            code: 'cimb',
                            name: 'CIMB Niaga VA', 
                            desc: 'Bank CIMB Niaga'
                        },
                        { 
                            key: 'midtrans_channel_danamon_va', 
                            code: 'danamon',
                            name: 'Danamon VA', 
                            desc: 'Bank Danamon'
                        },
                    ].map((bank) => {
                        const isActive = data[bank.key] === '1';
                        return (
                            <div 
                                key={bank.key}
                                className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2.5 ${
                                    isActive 
                                        ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 shadow-2xs' 
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-75'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <BankLogo code={bank.code} size="sm" />
                                    <div className="min-w-0">
                                        <span className="font-bold text-xs text-gray-900 dark:text-white block truncate leading-tight">
                                            {bank.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 block truncate mt-0.5 leading-tight">
                                            {bank.desc}
                                        </span>
                                    </div>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={(checked) => setData(bank.key, checked ? '1' : '0')}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ======================================================== */}
            {/* Card 4: Teks Pemberitahuan Pemeliharaan VA               */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-gray-800/95 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="midtrans_va_maintenance_notice" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Pesan Pemberitahuan Saat VA Belum Aktif
                    </Label>
                    <span className="text-xs text-slate-400 font-normal">(Fallback edukasi otomatis)</span>
                </div>
                <Textarea
                    id="midtrans_va_maintenance_notice"
                    value={data.midtrans_va_maintenance_notice || 'Layanan Virtual Account otomatis sedang dalam integrasi perbankan berkala. Anda dapat berdonasi secara instan menggunakan QRIS (mendukung semua M-Banking: BCA, Mandiri, BRI, BNI, BSI) atau melalui Transfer Manual BSI & BRI.'}
                    onChange={(e) => setData('midtrans_va_maintenance_notice', e.target.value)}
                    rows={3}
                    className="text-xs"
                    placeholder="Tuliskan pesan yang ramah kepada donatur saat belum ada VA yang aktif..."
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    💡 <em>Pesan ini akan otomatis tampil di tab Virtual Account donatur selama seluruh sakelar bank di atas dalam keadaan nonaktif. Begitu Anda mengaktifkan salah satu bank, pesan ini otomatis hilang dan langsung digantikan kartu bank tersebut.</em>
                </p>
            </div>

            {/* ======================================================== */}
            {/* Card 5: Rekening Transfer Manual Yayasan (Internal)      */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-gray-800/95 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Rekening Transfer Manual Yayasan</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Rekening resmi yayasan tanpa potongan biaya gateway (100% donasi diterima penuh). Terhubung langsung dengan menu Rekening Bank.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/bank-accounts"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 shrink-0 bg-brand-50 hover:bg-brand-100/80 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 px-3.5 py-2 rounded-xl border border-brand-200 dark:border-brand-850 transition-all shadow-2xs"
                    >
                        <span>Kelola Rekening Bank</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {bankAccounts && bankAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {bankAccounts.map((acc) => {
                            const isToggling = togglingBankId === acc.id;
                            return (
                                <div
                                    key={acc.id}
                                    className={`p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                                        acc.is_active
                                            ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 shadow-2xs'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 opacity-75'
                                    }`}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        {acc.logo_url ? (
                                            <img
                                                src={acc.logo_url}
                                                alt={acc.bank_name}
                                                className="h-9 w-13 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shrink-0"
                                            />
                                        ) : (
                                            <BankLogo code={acc.bank_code || acc.bank_name} size="md" />
                                        )}
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-xs text-gray-900 dark:text-white truncate block">
                                                    {acc.bank_name}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                                        acc.bank_type === 'syariah'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60'
                                                    }`}
                                                >
                                                    {acc.bank_type === 'syariah' ? 'Syariah' : 'Konvensional'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-700 dark:text-gray-200 font-mono font-medium block">
                                                {acc.account_number}
                                            </span>
                                            <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate block">
                                                {acc.account_name}
                                            </span>
                                            <div className="pt-1">
                                                {acc.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Aktif di Form Donasi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                        Nonaktif (Disembunyikan)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={acc.is_active}
                                        disabled={isToggling}
                                        onCheckedChange={() => handleToggleBankAccount(acc)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-slate-50/50 dark:bg-slate-900/20 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Belum Ada Rekening Bank Yayasan</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                                Belum ada data rekening bank yang terdaftar. Tambahkan rekening resmi yayasan agar donatur dapat memilih opsi transfer manual.
                            </p>
                        </div>
                        <Link
                            href="/admin/bank-accounts"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-xs transition-colors"
                        >
                            <span>Tambah Rekening Sekarang</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* Card 6: Saluran Masa Depan (Kartu Kredit & Internasional) */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-gray-800/95 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Kartu Kredit / Debit (Visa, Mastercard, JCB, Amex)</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Memfasilitasi donatur internasional menggunakan enkripsi Midtrans.js standar PCI-DSS.
                        </p>
                    </div>
                    <Switch
                        checked={data.midtrans_channel_credit_card === '1'}
                        onCheckedChange={(checked) => setData('midtrans_channel_credit_card', checked ? '1' : '0')}
                    />
                </div>
            </div>
        </div>
    );
}
