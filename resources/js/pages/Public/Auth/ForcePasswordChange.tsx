import { useForm, Head, Link, usePage, router } from '@inertiajs/react';
import { ArrowRight, Lock, LoaderCircle, ShieldAlert, LogOut } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = {
    passwordRules?: string;
};

export default function ForcePasswordChange({ passwordRules }: Props) {
    const { auth, siteSettings } = usePage().props as any;
    const siteLogo = siteSettings?.site_logo ? `/storage/${siteSettings.site_logo}` : '/images/logo/logo-landscape-color.png';
    const userName = auth?.user?.name || 'Pengelola Sistem';
    const userEmail = auth?.user?.email || '';

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
        'cf-turnstile-response': '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/force-password-change', {
            onError: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Pembaruan Kata Sandi Wajib - Insani Indonesia" />

            {/* Kiri: Form Force Password Change */}
            <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32 py-10">
                <div className="mx-auto w-full max-w-sm lg:mx-0">
                    {/* Logo yayasan */}
                    <div>
                        <Link href="/" title="Kembali ke Beranda" className="inline-block mb-4 hover:opacity-85 transition-opacity">
                            <img 
                                src={siteLogo} 
                                alt="Logo Insani" 
                                className="h-10 w-auto object-contain" 
                            />
                        </Link>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 mb-4">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        Pembaruan Kata Sandi Wajib
                    </div>
                    
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Buat Kata Sandi Pribadi Anda
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-gray-600">
                        Halo, <span className="font-semibold text-gray-900">{userName}</span> ({userEmail}). Demi keamanan dan privasi data yayasan, akun pengelola sistem baru diwajibkan untuk membuat kata sandi pribadi saat pertama kali masuk.
                    </p>

                    <div className="mt-4 rounded-xl bg-blue-50/70 p-3.5 border border-blue-200/60 text-[11px] text-blue-900 leading-relaxed space-y-1">
                        <p className="font-semibold text-blue-950">Syarat Kata Sandi Baru:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                            <li>Minimal 8 karakter.</li>
                            <li>Kombinasi huruf besar, huruf kecil, angka, dan simbol (!@#$%^&*).</li>
                            <li>Tidak boleh sama dengan kata sandi sementara yang diberikan sebelumnya.</li>
                        </ul>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={submit}>
                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-gray-800">
                                Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Masukkan kata sandi baru"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-11 bg-white text-gray-900 border-gray-200 focus-visible:ring-[#1A56DB]"
                                required
                                autoFocus
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-800">
                                Konfirmasi Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                placeholder="Ketik ulang kata sandi baru"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="h-11 bg-white text-gray-900 border-gray-200 focus-visible:ring-[#1A56DB]"
                                required
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Cloudflare Turnstile */}
                        <div className="grid gap-1.5 pt-1">
                            <Turnstile 
                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                                onSuccess={(token) => setData('cf-turnstile-response', token)}
                                options={{
                                    theme: 'light',
                                }}
                            />
                            <InputError message={errors['cf-turnstile-response']} />
                        </div>

                        <div className="space-y-2 pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white h-11 text-sm font-semibold shadow-xs transition-colors"
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Simpan Kata Sandi & Buka Dashboard
                                {!processing && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleLogout}
                                className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 h-10 text-xs font-medium"
                            >
                                <LogOut className="mr-2 h-3.5 w-3.5" />
                                Keluar Akun (Batalkan Sesi)
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Kanan: Editorial Visual */}
            <div className="hidden lg:relative lg:block lg:w-1/2 overflow-hidden">
                <div className="absolute inset-0 bg-gray-950">
                    <img
                        className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                        alt="Tim Insani Indonesia"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
                </div>
                
                <div className="absolute bottom-16 left-16 right-16 max-w-lg">
                    <blockquote className="space-y-6 text-white">
                        <p className="text-3xl font-medium leading-snug tracking-tight">
                            "Amanah dan integritas adalah fondasi utama dalam mengelola kebaikan dan melayani masyarakat."
                        </p>
                        <footer className="text-sm">
                            <p className="font-semibold text-white">Insani Indonesia</p>
                            <p className="text-gray-400 mt-0.5">Sistem Manajemen Pengelola Yayasan</p>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
