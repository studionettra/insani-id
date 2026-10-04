import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, RefreshCw, ShieldAlert, FileQuestion, ServerCrash, AlertTriangle } from 'lucide-react';
import React from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    status: number;
    message?: string;
}

export default function Error({ status, message }: ErrorProps) {
    const errorDetails: Record<number, { title: string; subtitle: string; description: string; icon: React.ReactNode }> = {
        403: {
            title: '403',
            subtitle: 'Akses Dilarang',
            description: message || 'Maaf, Anda tidak memiliki izin untuk mengakses halaman atau sumber daya ini.',
            icon: <ShieldAlert className="w-16 h-16 text-amber-500" />,
        },
        404: {
            title: '404',
            subtitle: 'Halaman Tidak Ditemukan',
            description: message || 'Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tautan tidak valid.',
            icon: <FileQuestion className="w-16 h-16 text-insani-blue" />,
        },
        500: {
            title: '500',
            subtitle: 'Terjadi Kesalahan Server',
            description: message || 'Terjadi gangguan internal pada server kami. Tim teknis telah diberi tahu dan sedang menanganinya.',
            icon: <ServerCrash className="w-16 h-16 text-rose-500" />,
        },
        503: {
            title: '503',
            subtitle: 'Layanan Sedang Pemeliharaan',
            description: message || 'Sistem kami sedang dalam pemeliharaan berkala untuk meningkatkan kualitas layanan. Silakan coba beberapa saat lagi.',
            icon: <AlertTriangle className="w-16 h-16 text-orange-500" />,
        },
    };

    const currentError = errorDetails[status] || {
        title: String(status || 'Error'),
        subtitle: 'Terjadi Kendala',
        description: message || 'Terjadi kendala saat memproses permintaan Anda.',
        icon: <AlertTriangle className="w-16 h-16 text-slate-500" />,
    };

    return (
        <PublicLayout title={`${currentError.title} — ${currentError.subtitle}`}>
            <Head title={`${currentError.title} — ${currentError.subtitle}`} />

            <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
                <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-flex items-center justify-center">
                            {currentError.icon}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
                        {currentError.title}
                    </h1>

                    <h2 className="text-lg font-bold text-slate-700 mb-3">
                        {currentError.subtitle}
                    </h2>

                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        {currentError.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            asChild
                            className="bg-insani-blue hover:bg-blue-700 text-white font-semibold rounded-xl h-11 px-6 shadow-sm"
                        >
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Beranda
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="font-medium rounded-xl h-11 px-6 border-slate-200 hover:bg-slate-100 text-slate-700"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Muat Ulang
                        </Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
