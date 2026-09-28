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
    Printer,
    Eye,
    FileCheck
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import DonationReceiptModal from '@/components/donation/DonationReceiptModal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import PublicLayout from '@/layouts/PublicLayout';
import useTranslation from '@/hooks/use-translation';
import { trackDonationSuccess } from '@/lib/analytics';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function Status({ donation, selectedBankAccount }: any) {
    const { t } = useTranslation();
    const { auth, siteSettings, bankAccounts } = usePage().props as any;
    const foundationName = siteSettings?.legal_foundation_name || 'Yayasan Peduli Insani Indonesia';
    const [isChecking, setIsChecking] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);

    const title = donation.program?.title?.id || donation.program?.title || 'Program Donasi';
    const latestPayment = donation.payments && donation.payments.length > 0 ? donation.payments[0] : null;
    const proofUrl = latestPayment?.transfer_proof_url 
        || (latestPayment?.transfer_proof ? `/storage/${latestPayment.transfer_proof}` : null);

    const selectedBank = useMemo(() => {
        if (selectedBankAccount) {
            return selectedBankAccount;
        }

        if (donation.channel !== 'offline') {
            return null;
        }

        const destNum = String(latestPayment?.payment_destination || '').replace(/\D/g, '');
        const channelCode = String(latestPayment?.payment_channel || '').toUpperCase().trim();

        const accounts: any[] = bankAccounts && bankAccounts.length > 0 ? bankAccounts : [
            { id: 1, bank_name: 'Bank Syariah Indonesia (BSI)', bank_code: 'MANUAL_BSI', account_number: '713 219 5026', account_name: 'Yayasan Peduli Insani Indonesia' },
            { id: 2, bank_name: 'Bank Rakyat Indonesia (BRI)', bank_code: 'MANUAL_BRI', account_number: '0345 0100 1366 304', account_name: 'Yayasan Peduli Insani Indonesia' },
        ];

        // 1. Match by account number (digits only)
        if (destNum) {
            const matchByAcc = accounts.find((acc) => {
                const accClean = String(acc.account_number || '').replace(/\D/g, '');
                return accClean === destNum;
            });
            if (matchByAcc) return matchByAcc;
        }

        // 2. Match by bank_code or generated code
        if (channelCode) {
            const matchByCode = accounts.find((acc) => {
                const accCode = String(acc.bank_code || '').toUpperCase().trim();
                if (accCode && (channelCode === accCode || channelCode === `MANUAL_${accCode}` || `MANUAL_${channelCode}` === accCode)) {
                    return true;
                }
                const genCode = `MANUAL_${String(acc.bank_name || '').toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
                return channelCode === genCode;
            });
            if (matchByCode) return matchByCode;

            // 3. Fallback keyword matching (e.g. BRI, BSI, BCA, MANDIRI)
            const matchByKeyword = accounts.find((acc) => {
                const bankNameUpper = String(acc.bank_name || '').toUpperCase();
                if (channelCode.includes('BRI') && bankNameUpper.includes('BRI')) return true;
                if (channelCode.includes('BSI') && bankNameUpper.includes('BSI')) return true;
                if (channelCode.includes('BCA') && bankNameUpper.includes('BCA')) return true;
                if (channelCode.includes('MANDIRI') && bankNameUpper.includes('MANDIRI')) return true;
                return false;
            });
            if (matchByKeyword) return matchByKeyword;
        }

        // 4. Fallback if destination number is present
        if (latestPayment?.payment_destination) {
            return {
                id: 0,
                bank_name: channelCode.includes('BRI') 
                    ? 'Bank Rakyat Indonesia (BRI)' 
                    : channelCode.includes('BSI') 
                        ? 'Bank Syariah Indonesia (BSI)' 
                        : 'Transfer Bank Manual',
                account_number: latestPayment.payment_destination,
                account_name: foundationName,
            };
        }

        return accounts[0] || null;
    }, [selectedBankAccount, donation.channel, latestPayment, bankAccounts, foundationName]);

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
        if (donation.channel === 'offline') {
            if (selectedBank?.bank_name) {
                return selectedBank.bank_name;
            }
            return 'Transfer Bank Manual';
        }

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
        if (channel) return channel;

        if (latestPayment?.payment_method === 'qris') return 'QRIS';
        if (latestPayment?.payment_method === 'virtual_account') return 'Virtual Account';
        if (latestPayment?.payment_method === 'ewallet') return 'E-Wallet';
        if (latestPayment?.payment_method === 'bank_transfer_manual') return 'Transfer Bank Manual';

        return donation.channel === 'online' ? 'Pembayaran Online' : 'Transfer Manual';
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
        <PublicLayout title={`Status Donasi ${donation.donation_code}`} hideFooter>

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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {latestPayment?.checkout_url && (
                                            <a 
                                                href={latestPayment.checkout_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-insani-blue hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition-all text-sm"
                                            >
                                                <span>Lanjutkan Pembayaran</span>
                                                <ExternalLink className="w-4 h-4 shrink-0" />
                                            </a>
                                        )}
                                        <Button
                                            type="button"
                                            onClick={handleCheckStatus}
                                            disabled={isChecking}
                                            variant="outline"
                                            className="w-full min-h-[48px] py-3 px-4 rounded-xl border-blue-200 bg-white hover:bg-blue-50 text-insani-blue font-semibold gap-2 text-sm"
                                        >
                                            <RefreshCw className={`w-4 h-4 shrink-0 ${isChecking ? 'animate-spin' : ''}`} />
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
                                <div className="pt-3 sm:pt-4 space-y-2">
                                    <Button 
                                        type="button"
                                        onClick={() => setShowReceipt(true)}
                                        className="w-full min-h-[50px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
                                    >
                                        <Printer className="w-5 h-5 shrink-0" />
                                        <span>{t('Lihat / Cetak Kuitansi Resmi')}</span>
                                    </Button>
                                    <p className="text-center text-xs text-slate-400 pt-1">
                                        {t('Kuitansi elektronik resmi ber-QR Code validasi keabsahan yayasan')}
                                    </p>
                                </div>
                            )}

                            {/* Bukti Transfer Terverifikasi (Donatur View-Only) */}
                            {donation.status === 'paid' && donation.channel === 'offline' && Boolean(proofUrl) && (
                                <div className="pt-2">
                                    <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-4 sm:p-5">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                    <FileCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="block text-xs sm:text-sm font-bold text-emerald-950">
                                                        {t('Bukti Transfer Terverifikasi')}
                                                    </span>
                                                    <span className="block text-[11px] text-emerald-800/80">
                                                        {t('Disahkan oleh Tim Keuangan')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-white/90 border border-emerald-200 px-2.5 py-1 rounded-full shadow-2xs">
                                                {t('Terverifikasi')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-emerald-900/90 leading-relaxed mb-3">
                                            {t('Donasi manual Anda telah divalidasi dengan melampirkan salinan bukti transfer resmi.')}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowProofModal(true)}
                                            className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-300 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4 text-emerald-600" />
                                            <span>{t('Lihat Lampiran Bukti Transfer')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Instructions for Manual Transfer */}
                            {donation.channel === 'offline' && donation.status === 'pending' && (
                                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-sm space-y-4">
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-base">Instruksi Transfer Manual</h4>
                                        <p className="text-amber-800 mt-1 text-xs sm:text-sm leading-relaxed">
                                            Silakan transfer tepat sebesar <strong>{formatCurrency(Number(donation.amount))}</strong> ke rekening resmi {selectedBank?.bank_name ? <strong>{selectedBank.bank_name}</strong> : foundationName} di bawah ini:
                                        </p>
                                    </div>

                                    {selectedBank && (
                                        <div className="flex justify-between items-center bg-white p-3.5 sm:p-4 rounded-xl border border-amber-200/80 shadow-xs">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {selectedBank.logo_url ? (
                                                    <img 
                                                        src={selectedBank.logo_url} 
                                                        alt={selectedBank.bank_name} 
                                                        className="w-11 h-11 object-contain bg-white rounded-lg p-1 border border-slate-100 shrink-0" 
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                        BANK
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <span className="block font-bold text-slate-800 text-sm sm:text-base truncate">{selectedBank.bank_name}</span>
                                                    <span className="text-slate-800 font-mono text-base sm:text-lg font-bold tracking-wider">{selectedBank.account_number}</span>
                                                    <span className="block text-xs text-slate-500 truncate">{selectedBank.account_name}</span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => copyToClipboard(String(selectedBank.account_number).replace(/\s+/g, ''))} 
                                                className="p-2.5 text-insani-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shrink-0 ml-2"
                                                title="Salin nomor rekening"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {selectedBank?.instructions && (
                                        <div className="bg-white/80 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900/90 leading-relaxed">
                                            <span className="font-semibold block mb-0.5 text-amber-950">Petunjuk Transfer:</span>
                                            {selectedBank.instructions}
                                        </div>
                                    )}

                                    <div>
                                        {(() => {
                                            const waNumber = (siteSettings?.contact_donation_confirm_wa || siteSettings?.contact_donor_support_wa || '6282123998593').replace(/\D/g, '');
                                            const bankInfo = selectedBank?.bank_name ? ` melalui ${selectedBank.bank_name}` : '';
                                            const message = `Halo Admin Insani, saya sudah mentransfer donasi sebesar ${formatCurrency(Number(donation.amount))} untuk ID Transaksi ${donation.donation_code} pada program ${title}${bankInfo}. Mohon dicek dan diverifikasi, terima kasih!`;
                                            return (
                                                <a 
                                                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-xs text-sm"
                                                >
                                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                                    </svg>
                                                    <span>Konfirmasi via WhatsApp</span>
                                                </a>
                                            );
                                        })()}
                                    </div>
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

                            {/* Back to Program button */}
                            <div className="pt-4">
                                <Link href={`/program/${donation.program?.slug || ''}`} className="w-full block">
                                    <Button className="w-full min-h-[50px] py-3.5 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl text-sm sm:text-base font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.99]">
                                        {t('Kembali ke Halaman Program')}
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

            {/* Modal Pratinjau Bukti Transfer Donatur (View-Only) */}
            {Boolean(proofUrl) && (
                <Dialog open={showProofModal} onOpenChange={setShowProofModal}>
                    <DialogContent className="max-w-lg p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        <span>{t('Bukti Transfer Donasi')}</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                        {t('Transaksi')} <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">{donation.donation_code}</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="mt-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center max-h-[65vh]">
                            <img 
                                src={proofUrl!} 
                                alt={t('Bukti Transfer Terverifikasi')} 
                                className="w-full h-auto max-h-[65vh] object-contain"
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                            <a
                                href={proofUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{t('Buka / Unduh')}</span>
                            </a>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowProofModal(false)}
                                className="text-xs rounded-xl"
                            >
                                {t('Tutup')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </PublicLayout>
    );
}
