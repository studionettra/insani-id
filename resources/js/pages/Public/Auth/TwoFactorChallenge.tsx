import { useForm, Head, usePage, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Smartphone,
    KeyRound,
    LoaderCircle,
    AlertCircle,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TwoFactorChallenge() {
    const { siteSettings } = usePage().props as any;
    const siteLogo = siteSettings?.site_logo
        ? `/storage/${siteSettings.site_logo}`
        : '/images/logo/logo-landscape-color.png';

    const [recovery, setRecovery] = useState(false);
    const codeInput = useRef<HTMLInputElement>(null);
    const recoveryCodeInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        code: '',
        recovery_code: '',
    });

    const toggleRecovery = () => {
        const nextState = !recovery;
        setRecovery(nextState);
        clearErrors();
        reset();

        setTimeout(() => {
            if (nextState) {
                recoveryCodeInput.current?.focus();
            } else {
                codeInput.current?.focus();
            }
        }, 100);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/two-factor-challenge');
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Verifikasi Dua Faktor" />

            {/* Kiri: Form Verifikasi */}
            <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32">
                <div className="mx-auto w-full max-w-sm lg:mx-0">
                    <Link
                        href="/login"
                        className="group mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-brand-600"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Kembali ke Halaman Login</span>
                    </Link>

                    <div>
                        <Link
                            href="/"
                            title="Kembali ke Beranda"
                            className="mb-4 inline-block transition-opacity hover:opacity-85"
                        >
                            <img
                                src={siteLogo}
                                alt="Logo Insani"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                            Verifikasi Akun
                        </h2>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {recovery
                            ? 'Masukkan salah satu kode pemulihan darurat yang Anda simpan saat mengaktifkan 2FA.'
                            : 'Masukkan 6 digit kode keamanan dari aplikasi autentikator Anda (Google Authenticator, Cisco Duo, dll).'}
                    </p>

                    <form className="mt-7 space-y-5" onSubmit={submit}>
                        {!recovery ? (
                            <div className="grid gap-2">
                                <Label htmlFor="code" className="text-xs font-semibold text-gray-700">
                                    Kode Otentikasi (6 Digit)
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Smartphone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        id="code"
                                        ref={codeInput}
                                        name="code"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value.replace(/\D/g, ''))
                                        }
                                        className="h-12 border-gray-200 bg-white pl-10 text-center font-mono text-xl tracking-[0.3em] text-gray-900 focus-visible:ring-brand-500"
                                        autoFocus
                                        autoComplete="one-time-code"
                                        required
                                    />
                                </div>
                                <InputError message={errors.code} />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="recovery_code" className="text-xs font-semibold text-gray-700">
                                    Kode Pemulihan Darurat
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <KeyRound className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        id="recovery_code"
                                        ref={recoveryCodeInput}
                                        name="recovery_code"
                                        type="text"
                                        placeholder="xxxx-xxxx-xxxx"
                                        value={data.recovery_code}
                                        onChange={(e) =>
                                            setData('recovery_code', e.target.value)
                                        }
                                        className="h-12 border-gray-200 bg-white pl-10 font-mono text-sm text-gray-900 focus-visible:ring-brand-500"
                                        autoFocus
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                                <InputError message={errors.recovery_code} />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="h-11 w-full bg-brand-600 text-sm font-semibold text-white shadow-xs transition-transform hover:-translate-y-[1px] hover:bg-brand-700"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Verifikasi & Masuk
                            {!processing && (
                                <ArrowRight className="ml-2 h-4 w-4" />
                            )}
                        </Button>

                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={toggleRecovery}
                                className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
                            >
                                {recovery
                                    ? 'Gunakan kode dari aplikasi autentikator'
                                    : 'Kehilangan perangkat? Gunakan kode pemulihan darurat'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Kanan: Editorial Visual */}
            <div className="hidden overflow-hidden lg:relative lg:block lg:w-1/2">
                <div className="absolute inset-0 bg-gray-950">
                    <img
                        className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                        alt="Background relawan Insani"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
                </div>

                <div className="absolute right-16 bottom-16 left-16 max-w-lg">
                    <blockquote className="space-y-6 text-white">
                        <p className="text-3xl leading-snug font-medium tracking-tight">
                            "Perlindungan berlapis menjaga amanah donatur dan integritas data lembaga."
                        </p>
                        <footer className="text-sm">
                            <p className="font-semibold text-white">
                                Insani Indonesia
                            </p>
                            <p className="mt-0.5 text-gray-400">
                                Perlindungan Akun Staf (TOTP / 2FA)
                            </p>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
