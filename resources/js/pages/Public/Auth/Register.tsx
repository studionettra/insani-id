import { useForm, Head, Link } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, User, LoaderCircle, Check, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Turnstile } from '@marsidev/react-turnstile';

type Props = {
    passwordRules?: string;
};

export default function Register({ passwordRules }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
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
        <div className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
            {met ? <Check className="w-3 h-3 mr-1.5" /> : <X className="w-3 h-3 mr-1.5" />}
            {text}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Daftar - Insani Indonesia" />

            {/* Kiri: Form Register */}
            <div className="flex w-full flex-col justify-center px-4 py-6 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32">
                <div className="mx-auto w-full max-w-sm lg:mx-0">
                    <img 
                        src="/images/logo/logo-landscape-color.png" 
                        alt="Logo Insani" 
                        className="h-24 w-auto mb-3" 
                    />
                    
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                        Buat Akun Baru
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Bergabunglah dan mulai perjalanan kebaikan Anda bersama kami.
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-gray-900">Nama Lengkap</Label>
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
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="pl-10 h-11 bg-white text-gray-900 border-gray-200 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

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
                                    placeholder="nama@email.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="pl-10 h-11 bg-white text-gray-900 border-gray-200 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-gray-900">Password</Label>
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
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <Requirement met={reqLength} text="Minimal 8 karakter" />
                                <Requirement met={reqCase} text="Huruf besar & kecil" />
                                <Requirement met={reqNumber} text="Mengandung angka" />
                                <Requirement met={reqSymbol} text="Karakter spesial (!@#)" />
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
                        
                        <div className="grid gap-2">
                            <Turnstile 
                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                                onSuccess={(token) => setData('cf-turnstile-response', token)}
                                options={{
                                    theme: 'light',
                                }}
                            />
                            <InputError message={errors['cf-turnstile-response']} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2 bg-brand-600 hover:bg-brand-700 hover:-translate-y-[1px] transition-transform text-white h-11 text-base shadow-sm"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Daftar Sekarang
                            {!processing && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>
                    
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Sudah memiliki akun?{' '}
                        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500 hover:underline">
                            Login di sini
                        </Link>
                    </p>
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
                    {/* Gradient Overlay for better contrast */}
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
