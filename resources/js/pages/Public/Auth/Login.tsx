import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Turnstile } from '@marsidev/react-turnstile';
import {
    ArrowLeft,
    ArrowRight,
    Lock,
    Mail,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login({ status }: { status?: string }) {
    const { siteSettings } = usePage().props as any;
    const siteLogo = siteSettings?.site_logo
        ? `/storage/${siteSettings.site_logo}`
        : '/images/logo/logo-landscape-color.png';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
        'cf-turnstile-response': '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Login" />

            {/* Kiri: Form Login */}
            <div className="flex w-full flex-col justify-center px-4 py-6 sm:px-12 lg:w-1/2 lg:px-24 lg:py-0 xl:px-32">
                <div className="mx-auto w-full max-w-sm lg:mx-0">
                    {/* Navigasi Sekunder Kembali ke Beranda */}
                    <Link
                        href="/"
                        className="group mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-brand-600"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    {/* Logo sebagai tautan ke beranda */}
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

                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                        Selamat Datang
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masuk untuk mengelola dan memantau program galang dana
                        Anda.
                    </p>

                    {status && (
                        <div
                            className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm font-medium ${
                                status.toLowerCase().includes('sesi')
                                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            }`}
                        >
                            {status.toLowerCase().includes('sesi') ? (
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                            ) : (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            )}
                            <div className="leading-snug">{status}</div>
                        </div>
                    )}

                    <form className="mt-8 space-y-5" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-900">
                                Alamat Email
                            </Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="h-11 border-gray-200 bg-white pl-10 text-gray-900 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                    required
                                    autoFocus
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-gray-900"
                                >
                                    Password
                                </Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-brand-600 hover:text-brand-500 hover:underline"
                                >
                                    Lupa Password?
                                </Link>
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                startIcon={
                                    <Lock className="h-4 w-4 text-gray-400" />
                                }
                                className="h-11 border-gray-200 bg-white text-gray-900 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                required
                                autoComplete="current-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-2 pb-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="cursor-pointer text-sm leading-none font-medium text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Ingat Saya
                            </Label>
                        </div>

                        <div className="grid gap-2">
                            <Turnstile
                                siteKey={
                                    import.meta.env.VITE_TURNSTILE_SITE_KEY
                                }
                                onSuccess={(token) =>
                                    setData('cf-turnstile-response', token)
                                }
                                options={{
                                    theme: 'light',
                                }}
                            />
                            <InputError
                                message={errors['cf-turnstile-response']}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="h-11 w-full bg-brand-600 text-base text-white shadow-sm transition-transform hover:-translate-y-[1px] hover:bg-brand-700"
                            disabled={processing}
                        >
                            Masuk
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Belum memiliki akun?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
                        >
                            Daftar sekarang
                        </Link>
                    </p>
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
                    {/* Gradient Overlay for better contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
                </div>

                <div className="absolute right-16 bottom-16 left-16 max-w-lg">
                    <blockquote className="space-y-6 text-white">
                        <p className="text-3xl leading-snug font-medium tracking-tight">
                            "Berbagi bukan tentang seberapa besar yang kita
                            beri, melainkan seberapa tulus niat kita untuk
                            membantu sesama yang membutuhkan."
                        </p>
                        <footer className="text-sm">
                            <p className="font-semibold text-white">
                                Insani Indonesia
                            </p>
                            <p className="mt-0.5 text-gray-400">
                                Wadah Kebaikan Bersama
                            </p>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
