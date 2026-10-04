import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Turnstile } from '@marsidev/react-turnstile';
import {
    ArrowLeft,
    ArrowRight,
    Lock,
    Mail,
    User,
    LoaderCircle,
    Check,
    X,
} from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    passwordRules?: string;
};

export default function Register({ passwordRules }: Props) {
    const { siteSettings } = usePage().props as any;
    const siteLogo = siteSettings?.site_logo
        ? `/storage/${siteSettings.site_logo}`
        : '/images/logo/logo-landscape-color.png';

    const searchParams =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null;
    const initialName = searchParams?.get('name') || '';
    const initialEmail = searchParams?.get('email') || '';

    const { data, setData, post, processing, errors } = useForm({
        name: initialName,
        email: initialEmail,
        password: '',
        password_confirmation: '',
        'cf-turnstile-response': '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    // Password strength logic
    const reqLength = data.password.length >= 8;
    const reqCase = /[A-Z]/.test(data.password) && /[a-z]/.test(data.password);
    const reqNumber = /[0-9]/.test(data.password);
    const reqSymbol = /[^A-Za-z0-9]/.test(data.password);

    const Requirement = ({ met, text }: { met: boolean; text: string }) => (
        <div
            className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}
        >
            {met ? (
                <Check className="mr-1.5 h-3 w-3" />
            ) : (
                <X className="mr-1.5 h-3 w-3" />
            )}
            {text}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Daftar Akun" />

            {/* Kiri: Form Register */}
            <div className="flex w-full flex-col justify-center px-4 py-6 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32">
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

                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                        Buat Akun Baru
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Bergabunglah dan mulai perjalanan kebaikan Anda bersama
                        kami.
                    </p>

                    {initialEmail && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>
                                Akun Anda akan otomatis terhubung dengan seluruh
                                riwayat donasi sebelumnya yang menggunakan email{' '}
                                <strong>{initialEmail}</strong>.
                            </span>
                        </div>
                    )}

                    <form className="mt-8 space-y-5" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-gray-900">
                                Nama Lengkap
                            </Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Nama Lengkap"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-11 border-gray-200 bg-white pl-10 text-gray-900 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

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
                                    name="email"
                                    placeholder="nama@email.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="h-11 border-gray-200 bg-white pl-10 text-gray-900 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-gray-900">
                                Password
                            </Label>
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
                                autoComplete="new-password"
                            />
                            <div className="mt-1 grid grid-cols-2 gap-2">
                                <Requirement
                                    met={reqLength}
                                    text="Minimal 8 karakter"
                                />
                                <Requirement
                                    met={reqCase}
                                    text="Huruf besar & kecil"
                                />
                                <Requirement
                                    met={reqNumber}
                                    text="Mengandung angka"
                                />
                                <Requirement
                                    met={reqSymbol}
                                    text="Karakter spesial (!@#)"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-gray-900"
                            >
                                Konfirmasi Password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                placeholder="••••••••"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                startIcon={
                                    <Lock className="h-4 w-4 text-gray-400" />
                                }
                                className="h-11 border-gray-200 bg-white text-gray-900 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                required
                                autoComplete="new-password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
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
                            className="mt-2 h-11 w-full bg-brand-600 text-base text-white shadow-sm transition-transform hover:-translate-y-[1px] hover:bg-brand-700"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Daftar Sekarang
                            {!processing && (
                                <ArrowRight className="ml-2 h-4 w-4" />
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Sudah memiliki akun?{' '}
                        <Link
                            href="/login"
                            className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
                        >
                            Login di sini
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
