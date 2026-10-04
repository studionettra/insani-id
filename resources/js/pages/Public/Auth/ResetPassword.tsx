import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Lock, LoaderCircle, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    token: string;
    email: string;
    passwordRules?: string;
};

export default function ResetPassword({ token, email }: Props) {
    const { siteSettings } = usePage().props as any;
    const siteLogo = siteSettings?.site_logo
        ? `/storage/${siteSettings.site_logo}`
        : '/images/logo/logo-landscape-color.png';

    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Reset Password" />

            {/* Kiri: Form Reset Password */}
            <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32">
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
                        Atur Ulang Kata Sandi
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Silakan buat kata sandi baru untuk akun Anda. Anda tidak
                        perlu mengingat kata sandi lama.
                    </p>

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
                                    name="email"
                                    value={data.email}
                                    className="h-11 cursor-not-allowed border-gray-200 bg-gray-50 pl-10 text-gray-500"
                                    readOnly
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-gray-900">
                                Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Minimal 8 karakter (huruf, angka, simbol)"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                startIcon={
                                    <Lock className="h-4 w-4 text-gray-400" />
                                }
                                className="h-11 border-gray-200 bg-white text-gray-900 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                required
                                autoFocus
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <div>
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-gray-900"
                                >
                                    Ulangi Kata Sandi Baru
                                </Label>
                                <p className="mt-0.5 text-[11px] text-gray-500">
                                    Ketik ulang kata sandi baru untuk memastikan
                                    tidak ada kesalahan ketik.
                                </p>
                            </div>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                placeholder="Ketik ulang kata sandi baru"
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

                        <Button
                            type="submit"
                            className="mt-2 h-11 w-full bg-brand-600 text-base text-white shadow-sm transition-transform hover:-translate-y-[1px] hover:bg-brand-700"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Simpan Kata Sandi Baru
                            {!processing && (
                                <ArrowRight className="ml-2 h-4 w-4" />
                            )}
                        </Button>
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
