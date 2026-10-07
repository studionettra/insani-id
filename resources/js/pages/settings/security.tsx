import { Form, Head, Link, router } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import {
    Clock,
    ShieldCheck,
    ShieldAlert,
    KeyRound,
    Copy,
    Check,
    RefreshCw,
    Download,
    Trash2,
    LoaderCircle,
    Smartphone,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
    lastLoginAt?: string | null;
    canManageTwoFactor?: boolean;
    twoFactorEnabled?: boolean;
    requiresConfirmation?: boolean;
};

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [logoutOtherDevices, setLogoutOtherDevices] = useState(true);

    // 2FA Dialog States
    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [setupCompleted, setSetupCompleted] = useState(false);
    const [justEnabledRecoveryCodes, setJustEnabledRecoveryCodes] = useState<string[]>([]);

    const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [loadingRecoveryCodes, setLoadingRecoveryCodes] = useState(false);
    const [regeneratingRecoveryCodes, setRegeneratingRecoveryCodes] = useState(false);

    const [disableModalOpen, setDisableModalOpen] = useState(false);
    const [disabling2Fa, setDisabling2Fa] = useState(false);

    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    const copyToClipboard = (text: string, onCopied: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        onCopied(true);
        setTimeout(() => onCopied(false), 2000);
        toast.success('Berhasil disalin ke clipboard');
    };

    const downloadRecoveryCodesFile = (codes: string[]) => {
        const content = `KODE PEMULIHAN DARURAT 2FA - INSANI INDONESIA\n` +
            `Dibuat pada: ${new Date().toLocaleString('id-ID')}\n\n` +
            `PERINGATAN: Simpan file ini di tempat yang aman dan rahasia.\n` +
            `Setiap kode hanya dapat digunakan 1 kali saat perangkat login utama tidak tersedia.\n\n` +
            codes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
            `\n\n--- Insani Indonesia Sistem Keamanan ---`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `insani-2fa-recovery-codes-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('File kode pemulihan berhasil diunduh');
    };

    // Load QR Code and Secret Key
    const fetchQrAndSecret = async () => {
        setSetupLoading(true);
        setConfirmError(null);
        try {
            const [qrRes, secretRes] = await Promise.all([
                fetch('/user/two-factor-qr-code', {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                }),
                fetch('/user/two-factor-secret-key', {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                }),
            ]);

            if (qrRes.ok && secretRes.ok) {
                const qrData = await qrRes.json();
                const secretData = await secretRes.json();
                setQrCodeSvg(qrData.svg);
                setSecretKey(secretData.secretKey);
            } else {
                toast.error('Gagal memuat QR Code autentikator. Silakan coba lagi.');
            }
        } catch {
            toast.error('Gagal mengambil konfigurasi 2FA.');
        } finally {
            setSetupLoading(false);
        }
    };

    // Trigger enable 2FA flow
    const start2FaSetup = () => {
        setSetupModalOpen(true);
        setSetupCompleted(false);
        setConfirmationCode('');
        setConfirmError(null);

        // Call Fortify enable 2FA
        router.post('/user/two-factor-authentication', {}, {
            preserveScroll: true,
            onSuccess: () => {
                fetchQrAndSecret();
            },
            onError: () => {
                toast.error('Gagal menginisialisasi 2FA. Silakan muat ulang halaman.');
                setSetupModalOpen(false);
            },
        });
    };

    // Confirm 2FA code
    const handleConfirm2Fa = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmationCode.trim().length !== 6) {
            setConfirmError('Kode harus berupa 6 digit angka.');
            return;
        }

        setConfirming(true);
        setConfirmError(null);

        router.post('/user/confirmed-two-factor-authentication', {
            code: confirmationCode,
        }, {
            preserveScroll: true,
            onSuccess: async () => {
                setConfirming(false);
                setSetupCompleted(true);
                toast.success('Otentikasi Dua Faktor (2FA) berhasil diaktifkan!');

                // Fetch the generated recovery codes
                try {
                    const res = await fetch('/user/two-factor-recovery-codes', {
                        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    });
                    if (res.ok) {
                        const codes = await res.json();
                        setJustEnabledRecoveryCodes(codes);
                    }
                } catch {
                    // silently handled
                }
            },
            onError: (errs) => {
                setConfirming(false);
                setConfirmError(errs.code || 'Kode autentikasi tidak valid. Silakan coba lagi.');
            },
        });
    };

    // Load recovery codes
    const openRecoveryModal = async () => {
        setRecoveryModalOpen(true);
        setLoadingRecoveryCodes(true);
        try {
            const res = await fetch('/user/two-factor-recovery-codes', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const codes = await res.json();
                setRecoveryCodes(codes);
            } else {
                toast.error('Gagal memuat kode pemulihan.');
            }
        } catch {
            toast.error('Gagal mengambil kode pemulihan.');
        } finally {
            setLoadingRecoveryCodes(false);
        }
    };

    // Regenerate recovery codes
    const handleRegenerateRecoveryCodes = () => {
        setRegeneratingRecoveryCodes(true);
        router.post('/user/two-factor-recovery-codes', {}, {
            preserveScroll: true,
            onSuccess: async () => {
                try {
                    const res = await fetch('/user/two-factor-recovery-codes', {
                        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    });
                    if (res.ok) {
                        const codes = await res.json();
                        setRecoveryCodes(codes);
                        toast.success('Kode pemulihan baru berhasil dibuat!');
                    }
                } finally {
                    setRegeneratingRecoveryCodes(false);
                }
            },
            onError: () => {
                setRegeneratingRecoveryCodes(false);
                toast.error('Gagal membuat kode pemulihan baru.');
            },
        });
    };

    // Disable 2FA
    const handleDisable2Fa = () => {
        setDisabling2Fa(true);
        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,
            onSuccess: () => {
                setDisabling2Fa(false);
                setDisableModalOpen(false);
                toast.success('Otentikasi Dua Faktor (2FA) telah dinonaktifkan.');
            },
            onError: () => {
                setDisabling2Fa(false);
                toast.error('Gagal menonaktifkan 2FA. Silakan coba lagi.');
            },
        });
    };

    return (
        <>
            <Head title="Keamanan & Kata Sandi" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Ubah Kata Sandi
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Pastikan akun Anda menggunakan kata sandi yang kuat, unik, dan tidak digunakan di platform lain demi menjaga keamanan akun.
                    </p>
                </div>

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="current_password"
                                    className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Kata Sandi Saat Ini
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi saat ini"
                                />

                                <InputError
                                    className="text-xs mt-1"
                                    message={errors.current_password}
                                />

                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Lupa kata sandi saat ini? Anda dapat keluar akun dan gunakan tautan{' '}
                                    <Link href="/forgot-password" className="text-brand-600 dark:text-brand-400 font-semibold underline hover:text-brand-700">
                                        Lupa Password
                                    </Link>{' '}
                                    di layar login untuk mengatur ulang kata sandi melalui email terdaftar.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Kata Sandi Baru
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    autoComplete="new-password"
                                    placeholder="Masukkan kata sandi baru (minimal 8 karakter)"
                                    passwordrules={props.passwordRules}
                                />

                                <InputError
                                    className="text-xs mt-1"
                                    message={errors.password}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Konfirmasi Kata Sandi Baru
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    autoComplete="new-password"
                                    placeholder="Ketik ulang kata sandi baru"
                                    passwordrules={props.passwordRules}
                                />

                                <InputError
                                    className="text-xs mt-1"
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="logout_other_devices_checkbox"
                                        checked={logoutOtherDevices}
                                        onCheckedChange={(checked) =>
                                            setLogoutOtherDevices(Boolean(checked))
                                        }
                                        className="mt-0.5"
                                    />
                                    <input
                                        type="hidden"
                                        name="logout_other_devices"
                                        value={logoutOtherDevices ? '1' : '0'}
                                    />
                                    <div className="grid gap-1">
                                        <Label
                                            htmlFor="logout_other_devices_checkbox"
                                            className="cursor-pointer text-xs font-semibold text-gray-800 dark:text-gray-200"
                                        >
                                            Keluarkan akun dari semua perangkat lain
                                        </Label>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Sangat disarankan jika Anda menduga kata sandi akun telah diketahui orang lain atau pernah login di komputer umum/bersama.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 h-10 font-semibold text-xs shadow-xs"
                                >
                                    {processing ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                {/* 2FA Section - Khusus Staf */}
                {props.canManageTwoFactor && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900/60">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                            props.twoFactorEnabled
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                                        }`}
                                    >
                                        {props.twoFactorEnabled ? (
                                            <ShieldCheck className="h-4 w-4" />
                                        ) : (
                                            <ShieldAlert className="h-4 w-4" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        Otentikasi Dua Faktor (2FA / TOTP)
                                    </h3>
                                    {props.twoFactorEnabled ? (
                                        <Badge className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                            Aktif & Terlindungi
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-amber-300 bg-amber-50 text-[10px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                        >
                                            Belum Diaktifkan
                                        </Badge>
                                    )}
                                </div>
                                <p className="max-w-xl text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                    {props.twoFactorEnabled
                                        ? 'Akun staf Anda terlindungi verifikasi dua langkah. Saat masuk, sistem akan meminta kode 6 digit dari aplikasi autentikator (Google Authenticator, Cisco Duo, dll).'
                                        : 'Tambahkan lapisan pertahanan ekstra pada akun staf Anda. Sangat direkomendasikan untuk mencegah akses tidak sah dan menjaga kerahasiaan data lembaga.'}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                {props.twoFactorEnabled ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={openRecoveryModal}
                                            className="h-9 rounded-xl border-gray-200 text-xs font-semibold dark:border-gray-700"
                                        >
                                            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                                            Kode Pemulihan
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setDisableModalOpen(true)}
                                            className="h-9 rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                                        >
                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                            Nonaktifkan
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={start2FaSetup}
                                        className="h-9 rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
                                    >
                                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                                        Aktifkan 2FA
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span>Aktivitas Login Terakhir</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {props.lastLoginAt
                            ? `Akun terakhir kali masuk pada ${new Date(props.lastLoginAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB`
                            : 'Belum ada rekaman riwayat login sebelumnya.'}
                    </p>
                </div>
            </div>

            {/* Setup 2FA Dialog */}
            <Dialog open={setupModalOpen} onOpenChange={setSetupModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                                <Smartphone className="h-4 w-4" />
                            </div>
                            <DialogTitle className="text-base font-bold">
                                {setupCompleted ? '2FA Berhasil Diaktifkan' : 'Aktivasi Otentikasi Dua Faktor'}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-gray-500">
                            {setupCompleted
                                ? 'Simpan kode pemulihan berikut di tempat yang aman sebelum menutup jendela ini.'
                                : 'Pindai kode QR menggunakan Google Authenticator atau Cisco Duo di ponsel Anda.'}
                        </DialogDescription>
                    </DialogHeader>

                    {setupLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <LoaderCircle className="h-8 w-8 animate-spin text-brand-600" />
                            <p className="mt-3 text-xs">Menyiapkan kunci keamanan...</p>
                        </div>
                    ) : setupCompleted ? (
                        <div className="space-y-4 pt-2">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                <p className="font-semibold">Akun Anda kini terlindungi!</p>
                                <p className="mt-1 text-[11px] leading-relaxed">
                                    Jika Anda kehilangan akses ke aplikasi autentikator, kode pemulihan di bawah ini adalah satu-satunya cara untuk masuk ke akun Anda.
                                </p>
                            </div>

                            {justEnabledRecoveryCodes.length > 0 && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-xs dark:border-gray-800 dark:bg-gray-800/60">
                                        {justEnabledRecoveryCodes.map((code, idx) => (
                                            <div key={idx} className="rounded bg-white px-2 py-1 text-center font-semibold text-gray-800 shadow-2xs dark:bg-gray-900 dark:text-gray-200">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(justEnabledRecoveryCodes.join('\n'), setCopiedCodes)}
                                            className="h-8 text-xs"
                                        >
                                            {copiedCodes ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                                            {copiedCodes ? 'Tersalin' : 'Salin Semua'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadRecoveryCodesFile(justEnabledRecoveryCodes)}
                                            className="h-8 text-xs"
                                        >
                                            <Download className="mr-1.5 h-3.5 w-3.5" />
                                            Unduh (.txt)
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setSetupModalOpen(false)}
                                    className="w-full bg-brand-600 text-xs font-semibold text-white hover:bg-brand-700 sm:w-auto"
                                >
                                    Selesai
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-1">
                            {/* QR Code */}
                            {qrCodeSvg && (
                                <div className="flex flex-col items-center justify-center">
                                    <div
                                        className="rounded-2xl border border-gray-200 bg-white p-3 shadow-2xs dark:border-gray-700 [&>svg]:h-44 [&>svg]:w-44"
                                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                                    />
                                    <p className="mt-2 text-[11px] text-gray-400">
                                        Pindai menggunakan Google Authenticator atau Cisco Duo
                                    </p>
                                </div>
                            )}

                            {/* Secret Key manual */}
                            {secretKey && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                                Kunci Rahasia Manual
                                            </p>
                                            <p className="mt-0.5 font-mono text-xs font-bold tracking-wider text-gray-800 dark:text-gray-200">
                                                {secretKey}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(secretKey, setCopiedKey)}
                                            className="h-8 w-8 p-0"
                                            title="Salin Kunci Rahasia"
                                        >
                                            {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Konfirmasi Kode 6 digit */}
                            <form onSubmit={handleConfirm2Fa} className="space-y-3 pt-1">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="two_factor_code" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Masukkan 6 Digit Kode Konfirmasi
                                    </Label>
                                    <Input
                                        id="two_factor_code"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={confirmationCode}
                                        onChange={(e) => setConfirmationCode(e.target.value.replace(/\D/g, ''))}
                                        className="h-11 text-center font-mono text-lg tracking-[0.3em]"
                                        autoComplete="one-time-code"
                                        required
                                    />
                                    {confirmError && (
                                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            <span>{confirmError}</span>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSetupModalOpen(false)}
                                        className="text-xs font-semibold"
                                        disabled={confirming}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={confirming || confirmationCode.length !== 6}
                                        className="bg-brand-600 text-xs font-semibold text-white hover:bg-brand-700"
                                    >
                                        {confirming && <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                        Konfirmasi & Aktifkan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Recovery Codes Dialog */}
            <Dialog open={recoveryModalOpen} onOpenChange={setRecoveryModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                                <KeyRound className="h-4 w-4" />
                            </div>
                            <DialogTitle className="text-base font-bold">
                                Kode Pemulihan Darurat (2FA)
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-gray-500">
                            Simpan kode ini di tempat yang aman. Setiap kode hanya dapat digunakan 1 kali jika Anda tidak dapat mengakses aplikasi autentikator.
                        </DialogDescription>
                    </DialogHeader>

                    {loadingRecoveryCodes ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                            <LoaderCircle className="h-7 w-7 animate-spin text-brand-600" />
                            <p className="mt-3 text-xs">Memuat kode pemulihan...</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-xs dark:border-gray-800 dark:bg-gray-800/60">
                                {recoveryCodes.map((code, idx) => (
                                    <div key={idx} className="rounded bg-white px-2 py-1 text-center font-semibold text-gray-800 shadow-2xs dark:bg-gray-900 dark:text-gray-200">
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(recoveryCodes.join('\n'), setCopiedCodes)}
                                        className="h-8 text-xs font-semibold"
                                    >
                                        {copiedCodes ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                                        {copiedCodes ? 'Tersalin' : 'Salin Semua'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadRecoveryCodesFile(recoveryCodes)}
                                        className="h-8 text-xs font-semibold"
                                    >
                                        <Download className="mr-1.5 h-3.5 w-3.5" />
                                        Unduh (.txt)
                                    </Button>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRegenerateRecoveryCodes}
                                    disabled={regeneratingRecoveryCodes}
                                    className="h-8 text-xs font-semibold text-gray-600 hover:text-gray-900"
                                    title="Buat ulang semua kode (kode lama tidak berlaku lagi)"
                                >
                                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${regeneratingRecoveryCodes ? 'animate-spin' : ''}`} />
                                    Regenerasi
                                </Button>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setRecoveryModalOpen(false)}
                                    className="w-full bg-brand-600 text-xs font-semibold text-white hover:bg-brand-700 sm:w-auto"
                                >
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Disable 2FA Confirm Dialog */}
            <Dialog open={disableModalOpen} onOpenChange={setDisableModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                                Nonaktifkan Otentikasi Dua Faktor?
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-gray-500 leading-relaxed pt-1">
                            Akun Anda tidak akan lagi meminta verifikasi 2 langkah saat login. Hal ini dapat menurunkan tingkat keamanan akun staf Anda. Apakah Anda yakin ingin menonaktifkannya?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 pt-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDisableModalOpen(false)}
                            disabled={disabling2Fa}
                            className="text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDisable2Fa}
                            disabled={disabling2Fa}
                            className="text-xs font-semibold"
                        >
                            {disabling2Fa && <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                            Ya, Nonaktifkan 2FA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan Akun',
            href: edit.url(),
        },
    ],
};

