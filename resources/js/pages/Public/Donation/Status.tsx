import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    CheckCircle2, 
    Clock, 
    XCircle, 
    AlertCircle, 
    Copy, 
    RefreshCw, 
    ExternalLink,
    ChevronRight,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Printer
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DonationReceiptModal from '@/components/donation/DonationReceiptModal';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/PublicLayout';
import { trackDonationSuccess } from '@/lib/analytics';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function Status({ donation }: any) {
    const { auth } = usePage().props as any;
    const [isChecking, setIsChecking] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    const title = donation.program?.title?.id || donation.program?.title || 'Program Donasi';
    const latestPayment = donation.payments && donation.payments.length > 0 ? donation.payments[0] : null;

    useEffect(() => {
        if (donation.status === 'paid') {
            const trackKey = `tracked_donation_${donation.donation_code}`;
            if (typeof window !== 'undefined' && !sessionStorage.getItem(trackKey)) {
                trackDonationSuccess({
                    donationCode: donation.donation_code,
                    programTitle: title,
                    amount: Number(donation.amount),
                    paymentChannel: latestPayment?.payment_channel,
                    paymentMethod: latestPayment?.payment_method || donation.payment_method,
                });
                sessionStorage.setItem(trackKey, '1');
            }
        }
    }, [donation.status, donation.donation_code, donation.amount, title, latestPayment, donation.payment_method]);

    const getPaymentMethodDisplay = () => {
        const channel = latestPayment?.payment_channel?.toUpperCase();
        if (channel === 'QRIS') return 'QRIS (E-Wallet & M-Banking)';
        if (channel === 'BCA') return 'BCA Virtual Account';
        if (channel === 'MANDIRI') return 'Mandiri Virtual Account';
        if (channel === 'BRI') return 'BRI Virtual Account';
        if (channel === 'BNI') return 'BNI Virtual Account';
        if (channel === 'PERMATA') return 'Permata Virtual Account';
        if (channel === 'CIMB') return 'CIMB Niaga Virtual Account';
        if (channel === 'SHOPEEPAY') return 'ShopeePay';
        if (channel === 'OVO') return 'OVO';
        if (channel === 'DANA') return 'DANA';
        if (channel === 'ASTRAPAY') return 'AstraPay';
        if (channel === 'MANUAL_BSI') return 'Bank Syariah Indonesia (BSI)';
        if (channel === 'MANUAL_BRI') return 'Bank Rakyat Indonesia (BRI)';
        if (channel) return channel;

        if (latestPayment?.payment_method === 'qris') return 'QRIS';
        if (latestPayment?.payment_method === 'virtual_account') return 'Virtual Account';
        if (latestPayment?.payment_method === 'ewallet') return 'E-Wallet';
        if (latestPayment?.payment_method === 'bank_transfer_manual') return 'Transfer Bank Manual';

        return donation.channel === 'online' ? 'Online Payment (Xendit)' : 'Transfer Manual';
    };

    const getStatusInfo = (status: string, channel: string) => {
        if (status === 'paid') {
            return {
                icon: <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />,
                title: 'Donasi Berhasil!',
                color: 'text-emerald-500',
                desc: 'Alhamdulillah, donasi Anda telah kami terima. Semoga menjadi amal jariyah yang terus mengalir pahalanya.',
                bg: 'bg-emerald-50 border-emerald-100'
            };
        }
        
        if (status === 'expired' || status === 'failed') {
            return {
                icon: <XCircle className="w-16 h-16 text-red-500 mx-auto" />,
                title: 'Donasi Gagal / Kedaluwarsa',
                color: 'text-red-500',
                desc: 'Batas waktu pembayaran telah habis atau transaksi dibatalkan. Silakan ulangi donasi Anda.',
                bg: 'bg-red-50 border-red-100'
            };
        }

        if (channel === 'offline') {
            return {
                icon: <Clock className="w-16 h-16 text-amber-500 mx-auto" />,
                title: 'Menunggu Transfer Manual',
                color: 'text-amber-500',
                desc: 'Silakan transfer tepat sesuai nominal total hingga 3 digit terakhir untuk memudahkan verifikasi.',
                bg: 'bg-amber-50 border-amber-100'
            };
        }

        return {
            icon: <AlertCircle className="w-16 h-16 text-insani-blue mx-auto" />,
            title: 'Menunggu Pembayaran',
            color: 'text-insani-blue',
            desc: `Silakan selesaikan pembayaran donasi Anda melalui ${getPaymentMethodDisplay()}.`,
            bg: 'bg-blue-50 border-blue-100'
        };
    };

    const info = getStatusInfo(donation.status, donation.channel);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Berhasil disalin ke clipboard');
    };

    const handleCheckStatus = () => {
        setIsChecking(true);
        toast.info('Memeriksa status pembayaran ke Xendit...');
        router.reload({
            only: ['donation'],
            onFinish: () => {
                setIsChecking(false);
                toast.success('Pemeriksaan status selesai');
            }
        });
    };

    return (
        <PublicLayout>
            <Head title={`Status Donasi ${donation.donation_code}`} />

            <div className="bg-slate-50 min-h-screen py-8 md:py-12 print:hidden">
                <div className="container mx-auto px-4 max-w-2xl">
                    
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        
                        {/* Header Banner */}
                        <div className={`${info.bg} border-b p-6 sm:p-8 text-center`}>
                            {info.icon}
                            <h1 className={`text-2xl sm:text-3xl font-bold mt-4 ${info.color}`}>{info.title}</h1>
                            <p className="text-slate-600 mt-2 max-w-md mx-auto text-sm sm:text-base leading-relaxed">{info.desc}</p>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            
                            {/* Amount Display */}
                            <div className="text-center pb-6 border-b">
                                <p className="text-xs sm:text-sm text-slate-500 mb-1">
                                    {donation.channel === 'offline' 
                                        ? 'Total Tagihan (Termasuk 3 Digit Kode Unik)' 
                                        : 'Total Donasi'}
                                </p>
                                <div className="text-3xl sm:text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
                                    {formatCurrency(Number(donation.amount))}
                                    {donation.channel === 'offline' && donation.status === 'pending' && (
                                        <button 
                                            onClick={() => copyToClipboard(donation.amount.toString())} 
                                            title="Salin nominal"
                                            className="text-slate-400 hover:text-insani-blue transition-colors p-1"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons when Pending Online */}
                            {donation.channel === 'online' && donation.status === 'pending' && (
                                <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-2.5">
                                        {latestPayment?.checkout_url && (
                                            <a 
                                                href={latestPayment.checkout_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center gap-2 bg-insani-blue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition-all"
                                            >
                                                <span>Lanjutkan Pembayaran</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <Button
                                            type="button"
                                            onClick={handleCheckStatus}
                                            disabled={isChecking}
                                            variant="outline"
                                            className="flex-1 h-12 rounded-xl border-blue-200 bg-white hover:bg-blue-50 text-insani-blue font-semibold gap-2"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                                            <span>{isChecking ? 'Memeriksa...' : 'Cek Status Pembayaran'}</span>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500 text-center">
                                        Sudah menyelesaikan pembayaran? Klik <strong>Cek Status Pembayaran</strong> untuk verifikasi instan.
                                    </p>
                                </div>
                            )}

                            {/* Donation Details */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">ID Transaksi</span>
                                    <span className="font-mono font-bold text-slate-800">{donation.donation_code}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4 py-2.5 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500 shrink-0">Program Donasi</span>
                                    <span className="font-medium text-slate-800 text-right leading-snug">{title}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">Nama Donatur</span>
                                    <span className="font-medium text-slate-800">{donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">Metode Pembayaran</span>
                                    <span className="font-semibold text-slate-800 text-right">
                                        {getPaymentMethodDisplay()}
                                    </span>
                                </div>
                                {donation.status === 'paid' && donation.paid_at && (
                                    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-200">
                                        <span className="text-slate-500">Waktu Pembayaran</span>
                                        <span className="font-medium text-slate-800 text-right">
                                            {formatDate(donation.paid_at)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button: Official Receipt when Paid */}
                            {donation.status === 'paid' && (
                                <div className="pt-2">
                                    <Button 
                                        type="button"
                                        onClick={() => setShowReceipt(true)}
                                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>Lihat & Cetak Kuitansi Resmi</span>
                                    </Button>
                                </div>
                            )}

                            {/* Guest Donor Registration CTA */}
                            {!auth?.user && (
                                <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                                    <div className="flex flex-col sm:flex-row items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-insani-blue text-white flex items-center justify-center shrink-0 shadow-xs">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            <h3 className="font-bold text-slate-900 text-base">
                                                Simpan & Pantau Jejak Kebaikan Anda
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                Daftar akun Insani menggunakan email <strong>{donation.donor_email}</strong> agar seluruh riwayat donasi Anda tersimpan rapi, serta dapatkan laporan penyaluran dana program ini secara berkala.
                                            </p>
                                            <div className="pt-2">
                                                <Link
                                                    href={`/register?email=${encodeURIComponent(donation.donor_email || '')}&name=${encodeURIComponent(donation.donor_name || '')}`}
                                                    className="inline-flex items-center gap-2 bg-insani-blue hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all"
                                                >
                                                    <span>Daftar Akun Donatur Sekarang</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Instructions for Manual Transfer */}
                            {donation.channel === 'offline' && donation.status === 'pending' && (
                                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-sm space-y-4">
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-base">Instruksi Transfer Manual</h4>
                                        <p className="text-amber-800 mt-1 text-xs sm:text-sm leading-relaxed">
                                            Silakan transfer tepat sebesar <strong>{formatCurrency(Number(donation.amount))}</strong> ke salah satu rekening resmi Yayasan Peduli Insani Indonesia:
                                        </p>
                                    </div>

                                    <ul className="space-y-3">
                                        <li className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
                                            <div>
                                                <span className="block font-bold text-slate-800">Bank Syariah Indonesia (BSI)</span>
                                                <span className="text-slate-700 font-mono text-lg font-bold tracking-wider">713 219 5026</span>
                                                <span className="block text-xs text-slate-500">A.n Insani Indonesia</span>
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard('7132195026')} 
                                                className="p-2.5 text-insani-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Salin nomor rekening"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </li>
                                        <li className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
                                            <div>
                                                <span className="block font-bold text-slate-800">Bank Rakyat Indonesia (BRI)</span>
                                                <span className="text-slate-700 font-mono text-lg font-bold tracking-wider">0345 0100 1366 304</span>
                                                <span className="block text-xs text-slate-500">A.n Insani Indonesia</span>
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard('034501001366304')} 
                                                className="p-2.5 text-insani-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Salin nomor rekening"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </li>
                                    </ul>

                                    <div>
                                        <a 
                                            href={`https://wa.me/6282123998593?text=${encodeURIComponent(`Halo Admin Insani, saya sudah mentransfer donasi sebesar ${formatCurrency(Number(donation.amount))} untuk ID Transaksi ${donation.donation_code} pada program ${title}. Mohon dicek dan diverifikasi, terima kasih!`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-xs text-sm"
                                        >
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                            </svg>
                                            <span>Konfirmasi via WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Back to Program button */}
                            <div className="pt-4">
                                <Link href={`/program/${donation.program?.slug || ''}`} className="w-full block">
                                    <Button className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold">
                                        Kembali ke Halaman Program
                                    </Button>
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Donation Receipt Modal */}
            <DonationReceiptModal 
                receipt={showReceipt ? donation : null}
                onClose={() => setShowReceipt(false)}
            />
        </PublicLayout>
    );
}
