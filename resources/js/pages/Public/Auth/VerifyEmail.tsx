import { useForm, Head, Link } from '@inertiajs/react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Verifikasi Email - Insani Indonesia" />

            {/* Kiri: Form Verifikasi */}
            <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32">
                <div className="mx-auto w-full max-w-sm lg:mx-0">
                    <img 
                        src="/images/logo-landscape-color.png" 
                        alt="Logo Insani" 
                        className="h-30 w-auto mb-3" 
                    />
                    
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                        Verifikasi Email Anda
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        Terima kasih telah mendaftar! Sebelum memulai, mohon verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan ke email Anda. Jika Anda tidak menerima email tersebut, kami akan dengan senang hati mengirimkan yang baru.
                    </p>

                    {status === 'verification-link-sent' && (
                        <div className="mt-4 rounded-md bg-green-50 p-4 text-sm font-medium text-green-800">
                            Tautan verifikasi baru telah dikirimkan ke alamat email yang Anda berikan saat pendaftaran.
                        </div>
                    )}

                    <form className="mt-8 space-y-5" onSubmit={submit}>
                        <Button
                            type="submit"
                            className="w-full bg-brand-600 hover:bg-brand-700 hover:-translate-y-[1px] transition-transform text-white h-11 text-base shadow-sm"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Kirim Ulang Email Verifikasi
                            {!processing && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>
                    
                    <div className="mt-8 flex justify-center text-sm text-gray-500">
                        <Link 
                            href="/logout" 
                            method="post"
                            as="button"
                            className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
                        >
                            Keluar dari akun (Log out)
                        </Link>
                    </div>
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
