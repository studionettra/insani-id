import { useForm, Head } from '@inertiajs/react';
import { ArrowRight, Lock, LoaderCircle, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    token: string;
    email: string;
    passwordRules?: string;
};

export default function ResetPassword({ token, email }: Props) {
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
            <Head title="Reset Password - Insani Indonesia" />

            {/* Kiri: Form Reset Password */}
            <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32">
                <div className="mx-auto w-full max-w-sm lg:mx-0">
                    <img 
                        src="/images/logo-landscape-color.png" 
                        alt="Logo Insani" 
                        className="h-30 w-auto mb-3" 
                    />
                    
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Silakan masukkan password baru Anda di bawah ini.
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-900">Alamat Email</Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="pl-10 h-11 bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-gray-900">Password Baru</Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="pl-10 h-11 bg-white text-gray-900 border-gray-200 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                    required
                                    autoFocus
                                    autoComplete="new-password"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation" className="text-gray-900">Konfirmasi Password</Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="pl-10 h-11 bg-white text-gray-900 border-gray-200 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2 bg-brand-600 hover:bg-brand-700 hover:-translate-y-[1px] transition-transform text-white h-11 text-base shadow-sm"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Simpan Password
                            {!processing && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Kanan: Editorial Visual */}
            <div className="hidden lg:relative lg:block lg:w-1/2 overflow-hidden">
                <div className="absolute inset-0 bg-gray-950">
                    <img
                        className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                        alt="Background relawan Insani"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
                </div>
                
                <div className="absolute bottom-16 left-16 right-16 max-w-lg">
                    <blockquote className="space-y-6 text-white">
                        <p className="text-3xl font-medium leading-snug tracking-tight">
                            "Berbagi bukan tentang seberapa besar yang kita beri, melainkan seberapa tulus niat kita untuk membantu sesama yang membutuhkan."
                        </p>
                        <footer className="text-sm">
                            <p className="font-semibold text-white">Insani Indonesia</p>
                            <p className="text-gray-400 mt-0.5">Wadah Kebaikan Bersama</p>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
