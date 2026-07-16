import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle, AlertCircle, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';


export default function Status({ donation }: any) {
    
    const title = donation.program?.title?.id || donation.program?.title || 'Program Donasi';

    const getStatusInfo = (status: string, channel: string) => {
        if (status === 'paid') {
            return {
                icon: <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />,
                title: 'Donasi Berhasil!',
                color: 'text-emerald-500',
                desc: 'Terima kasih atas donasi Anda. Semoga menjadi amal jariyah yang terus mengalir.',
                bg: 'bg-emerald-50 border-emerald-100'
            };
        }
        
        if (status === 'expired' || status === 'failed') {
            return {
                icon: <XCircle className="w-16 h-16 text-red-500 mx-auto" />,
                title: 'Donasi Gagal/Kedaluwarsa',
                color: 'text-red-500',
                desc: 'Waktu pembayaran telah habis atau transaksi dibatalkan. Silakan ulangi donasi Anda.',
                bg: 'bg-red-50 border-red-100'
            };
        }

        if (channel === 'offline') {
            return {
                icon: <Clock className="w-16 h-16 text-amber-500 mx-auto" />,
                title: 'Menunggu Transfer Manual',
                color: 'text-amber-500',
                desc: 'Silakan transfer tepat sesuai nominal hingga 3 digit terakhir agar sistem/admin dapat memverifikasi secara cepat.',
                bg: 'bg-amber-50 border-amber-100'
            };
        }

        return {
            icon: <AlertCircle className="w-16 h-16 text-blue-500 mx-auto" />,
            title: 'Menunggu Pembayaran',
            color: 'text-blue-500',
            desc: 'Silakan selesaikan pembayaran Anda melalui metode yang dipilih sebelumnya.',
            bg: 'bg-blue-50 border-blue-100'
        };
    };

    const info = getStatusInfo(donation.status, donation.channel);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Tersalin: ' + text);
    };

    return (
        <PublicLayout>
            <Head title={`Status Donasi ${donation.donation_code}`} />

            <div className="bg-slate-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        
                        <div className={`${info.bg} border-b p-8 text-center`}>
                            {info.icon}
                            <h1 className={`text-2xl font-bold mt-4 ${info.color}`}>{info.title}</h1>
                            <p className="text-slate-600 mt-2 max-w-md mx-auto">{info.desc}</p>
                        </div>

                        <div className="p-8 space-y-6">
                            
                            <div className="text-center pb-6 border-b">
                                <p className="text-sm text-slate-500 mb-1">Total Tagihan (Termasuk Kode Unik)</p>
                                <div className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
                                    {formatCurrency(Number(donation.amount))}
                                    {donation.channel === 'offline' && donation.status === 'pending' && (
                                        <button onClick={() => copyToClipboard(donation.amount.toString())} className="text-slate-400 hover:text-insani-blue transition-colors">
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                    <span className="text-slate-500 text-sm">ID Transaksi</span>
                                    <span className="font-medium text-slate-800">{donation.donation_code}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                    <span className="text-slate-500 text-sm">Program Donasi</span>
                                    <span className="font-medium text-slate-800 truncate max-w-[200px] text-right">{title}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                    <span className="text-slate-500 text-sm">Nama Donatur</span>
                                    <span className="font-medium text-slate-800">{donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                    <span className="text-slate-500 text-sm">Metode</span>
                                    <span className="font-medium text-slate-800 uppercase">{donation.channel}</span>
                                </div>
                            </div>

                            {donation.channel === 'offline' && donation.status === 'pending' && (
                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 mt-6 text-sm">
                                    <h4 className="font-bold text-amber-800 mb-2">Instruksi Transfer Manual</h4>
                                    <p className="text-amber-700 mb-4">Silakan transfer ke salah satu rekening Yayasan Peduli Insani Indonesia berikut:</p>
                                    <ul className="space-y-3">
                                        <li className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-200">
                                            <div>
                                                <span className="block font-bold">BSI (Bank Syariah Indonesia)</span>
                                                <span className="text-slate-600 font-mono text-lg tracking-wider">712 345 6789</span>
                                            </div>
                                            <button onClick={() => copyToClipboard('7123456789')} className="p-2 text-insani-blue bg-blue-50 rounded-md hover:bg-blue-100">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </li>
                                        <li className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-200">
                                            <div>
                                                <span className="block font-bold">Mandiri</span>
                                                <span className="text-slate-600 font-mono text-lg tracking-wider">131 00 1234567 8</span>
                                            </div>
                                            <button onClick={() => copyToClipboard('1310012345678')} className="p-2 text-insani-blue bg-blue-50 rounded-md hover:bg-blue-100">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </li>
                                    </ul>
                                    <div className="mt-5">
                                        <a 
                                            href={`https://wa.me/6282123998593?text=${encodeURIComponent(`Halo Admin, saya sudah mentransfer donasi sebesar ${formatCurrency(Number(donation.amount))} untuk ID Transaksi ${donation.donation_code} pada program ${title}. Mohon dicek ya, terima kasih!`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
                                        >
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                            </svg>
                                            Konfirmasi via WhatsApp
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6">
                                <Link href={`/program/${donation.program?.slug || ''}`} className="w-full">
                                    <Button className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
                                        Kembali ke Halaman Program
                                    </Button>
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
