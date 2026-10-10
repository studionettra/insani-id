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
    UserRoundPlus, 
    ShieldCheck, 
    Printer, 
    Eye, 
    FileCheck,
    QrCode,
    Download,
    Smartphone,
    CreditCard,
    Check,
    ChevronDown,
    ChevronUp,
    Timer,
    Info,
    Landmark
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import DonationReceiptModal from '@/components/donation/DonationReceiptModal';
import BankLogo from '@/components/ui/bank-logo';
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

interface BankInstruction {
    mobile: string[];
    atm: string[];
    ibanking: string[];
}

function getBankInstructions(channelCode: string, vaNumber: string, billerCode?: string, billKey?: string): BankInstruction {
    const code = (channelCode || '').toUpperCase().replace('MANUAL_', '');

    if (code.includes('MANDIRI')) {
        return {
            mobile: [
                'Buka aplikasi Livin\' by Mandiri, login dan pilih menu "Bayar".',
                `Ketik nama penyedia jasa atau masukkan Kode Perusahaan: ${billerCode || '70012'}.`,
                `Masukkan Nomor Pelanggan / Tagihan: ${billKey || vaNumber}.`,
                'Konfirmasi detail tagihan donasi dan pastikan nama penerima sesuai.',
                'Masukkan PIN Livin\' Mandiri Anda untuk menyelesaikan pembayaran.'
            ],
            atm: [
                'Masukkan kartu ATM Mandiri dan 6 digit PIN Anda.',
                'Pilih menu "Bayar / Beli" -> "Lainnya" -> "Multi Payment".',
                `Masukkan Kode Perusahaan: ${billerCode || '70012'}, lalu tekan "Benar".`,
                `Masukkan Nomor Pelanggan / Tagihan: ${billKey || vaNumber}, lalu tekan "Benar".`,
                'Konfirmasi pembayaran dan simpan struk sebagai bukti transaksi.'
            ],
            ibanking: [
                'Login ke Mandiri Internet Banking.',
                'Pilih menu "Pembayaran" -> "Multi Payment".',
                `Pilih penyedia jasa dengan kode ${billerCode || '70012'}.`,
                `Masukkan Nomor Pelanggan: ${billKey || vaNumber}.`,
                'Konfirmasi transaksi dengan Token Mandiri Anda.'
            ]
        };
    }

    if (code.includes('BSI')) {
        return {
            mobile: [
                'Buka aplikasi BSI Mobile, login dan pilih menu "Bayar".',
                'Pilih menu "Virtual Account" atau "Institusi / Akademik".',
                `Masukkan Nomor BSI Virtual Account: ${vaNumber}.`,
                'Periksa nominal donasi dan nama penerima di layar konfirmasi.',
                'Masukkan PIN BSI Mobile Anda dan selesaikan transaksi.'
            ],
            atm: [
                'Masukkan kartu ATM BSI dan PIN Anda.',
                'Pilih menu "Pembayaran / Pembelian" -> "Virtual Account".',
                `Masukkan Nomor Virtual Account: ${vaNumber}.`,
                'Pastikan detail pembayaran sesuai, lalu pilih "Ya / Lanjutkan".',
                'Simpan struk transaksi pembayaran.'
            ],
            ibanking: [
                'Login ke BSI Net Banking.',
                'Pilih menu "Pembayaran" -> "Virtual Account".',
                `Masukkan Nomor Virtual Account: ${vaNumber}.`,
                'Periksa rincian donasi dan masukkan kode TAN / Token Anda.'
            ]
        };
    }

    if (code.includes('BRI')) {
        return {
            mobile: [
                'Buka aplikasi BRImo, login dan pilih menu "Tagihan" -> "BRIVA".',
                'Pilih "Tambah Transaksi Baru".',
                `Masukkan Nomor BRIVA: ${vaNumber}.`,
                'Periksa detail donasi yang tampil di layar konfirmasi.',
                'Klik "Lanjutkan" dan masukkan PIN BRImo Anda.'
            ],
            atm: [
                'Masukkan kartu ATM BRI dan PIN Anda.',
                'Pilih menu "Transaksi Lain" -> "Pembayaran" -> "Lainnya" -> "BRIVA".',
                `Masukkan Nomor BRIVA: ${vaNumber}, lalu tekan "Benar".`,
                'Periksa rincian pembayaran, lalu pilih "Ya".',
                'Simpan struk transaksi sebagai bukti donasi.'
            ],
            ibanking: [
                'Login ke Internet Banking BRI.',
                'Pilih menu "Pembayaran" -> "BRIVA".',
                `Masukkan Nomor BRIVA: ${vaNumber}.`,
                'Konfirmasi data dan masukkan password & mToken untuk menyelesaikan.'
            ]
        };
    }

    if (code.includes('BNI')) {
        return {
            mobile: [
                'Buka aplikasi BNI Mobile Banking, login dan pilih menu "Pembayaran".',
                'Pilih menu "Virtual Account Billing", lalu pilih tab "Input Baru".',
                `Masukkan Nomor Virtual Account: ${vaNumber}.`,
                'Periksa rincian tagihan donasi di layar validasi.',
                'Masukkan Password Transaksi BNI Mobile Banking Anda.'
            ],
            atm: [
                'Masukkan kartu ATM BNI dan PIN Anda.',
                'Pilih menu "Menu Lain" -> "Transfer" -> "Virtual Account Billing".',
                `Masukkan Nomor Virtual Account: ${vaNumber}.`,
                'Periksa nominal dan konfirmasi pembayaran.',
                'Ambil struk transaksi pembayaran.'
            ],
            ibanking: [
                'Login ke BNI Internet Banking.',
                'Pilih menu "Transaksi" -> "Pembayaran Tagihan" -> "Virtual Account Billing".',
                `Masukkan Nomor Virtual Account: ${vaNumber}.`,
                'Selesaikan transaksi menggunakan BNI e-Secure token.'
            ]
        };
    }

    if (code.includes('BCA')) {
        return {
            mobile: [
                'Buka aplikasi BCA mobile (m-BCA), login dan pilih menu "m-Transfer".',
                'Pilih menu "BCA Virtual Account".',
                `Masukkan Nomor BCA Virtual Account: ${vaNumber}.`,
                'Periksa rincian tagihan donasi dan pastikan nominal sesuai.',
                'Masukkan PIN m-BCA Anda untuk menyelesaikan pembayaran.'
            ],
            atm: [
                'Masukkan kartu ATM BCA dan 6 digit PIN Anda.',
                'Pilih menu "Transaksi Lainnya" -> "Transfer" -> "ke Rekening BCA Virtual Account".',
                `Masukkan Nomor BCA Virtual Account: ${vaNumber}.`,
                'Periksa konfirmasi pembayaran, lalu pilih "Ya".',
                'Ambil kartu ATM dan simpan bukti transfer.'
            ],
            ibanking: [
                'Login ke KlikBCA Individual.',
                'Pilih menu "Transfer Dana" -> "Transfer ke BCA Virtual Account".',
                `Masukkan Nomor BCA Virtual Account: ${vaNumber}.`,
                'Masukkan respon KeyBCA Appli 1 dan klik "Kirim".'
            ]
        };
    }

    if (code.includes('PERMATA')) {
        return {
            mobile: [
                'Buka aplikasi PermataMobile X, login dan pilih menu "Bayar Tagihan".',
                'Pilih menu "Virtual Account".',
                `Masukkan Nomor Permata Virtual Account: ${vaNumber}.`,
                'Periksa nominal donasi dan konfirmasi transaksi dengan Mobile PIN.'
            ],
            atm: [
                'Masukkan kartu ATM Permata dan PIN Anda.',
                'Pilih menu "Transaksi Lainnya" -> "Pembayaran" -> "Virtual Account".',
                `Masukkan Nomor Permata Virtual Account: ${vaNumber}.`,
                'Pilih "Benar" untuk memproses pembayaran.'
            ],
            ibanking: [
                'Login ke PermataNet.',
                'Pilih menu "Pembayaran" -> "Virtual Account".',
                `Masukkan Nomor Virtual Account: ${vaNumber}.`,
                'Konfirmasi pembayaran dengan kode SMS Token.'
            ]
        };
    }

    return {
        mobile: [
            'Buka aplikasi Mobile Banking bank Anda dan login.',
            'Pilih menu "Transfer" atau "Pembayaran" -> "Virtual Account".',
            `Masukkan Nomor Virtual Account: ${vaNumber}.`,
            'Periksa nama dan nominal donasi pada layar konfirmasi.',
            'Masukkan PIN transaksi untuk menyelesaikan donasi.'
        ],
        atm: [
            'Masukkan kartu ATM dan PIN Anda di mesin ATM.',
            'Pilih menu "Transaksi Lain" -> "Pembayaran" -> "Virtual Account".',
            `Masukkan Nomor Virtual Account: ${vaNumber}.`,
            'Periksa nominal pembayaran dan tekan "Ya" untuk menyelesaikan.',
            'Simpan struk transaksi pembayaran.'
        ],
        ibanking: [
            'Login ke layanan Internet Banking bank Anda.',
            'Pilih menu "Pembayaran Tagihan" -> "Virtual Account".',
            `Masukkan Nomor Virtual Account: ${vaNumber}.`,
            'Verifikasi data dan masukkan token keamanan Anda.'
        ]
    };
}

export default function Status({ donation, selectedBankAccount, proofUrl: propProofUrl }: any) {
    const { t } = useTranslation();
    const { auth, siteSettings, bankAccounts } = usePage().props as any;
    const foundationName = siteSettings?.legal_foundation_name || 'Yayasan Peduli Insani Indonesia';
    const [isChecking, setIsChecking] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [instructionTab, setInstructionTab] = useState<'mobile' | 'atm' | 'ibanking'>('mobile');
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

    const title = donation.program?.title?.id || donation.program?.title || 'Program Donasi';
    const latestPayment = donation.payments && donation.payments.length > 0 ? donation.payments[0] : null;
    const proofUrl = propProofUrl || latestPayment?.transfer_proof_url || null;

    const isMidtrans = latestPayment?.gateway === 'midtrans';
    const paymentMethod = (latestPayment?.payment_method || donation.payment_method || '').toLowerCase();
    const paymentChannel = (latestPayment?.payment_channel || '').toUpperCase();
    const rawPayload = latestPayment?.raw_payload || {};
    const actions: Array<{ name: string; url: string; method?: string }> = Array.isArray(rawPayload?.actions) ? rawPayload.actions : [];

    // Midtrans extraction
    const qrCodeUrl = actions.find((a) => a.name === 'generate-qr-code')?.url 
        || (paymentMethod === 'qris' ? latestPayment?.checkout_url : null);

    const deeplinkUrl = actions.find((a) => a.name === 'deeplink-redirect')?.url 
        || (paymentMethod === 'ewallet' ? latestPayment?.checkout_url : null);

    const rawVaCandidate = rawPayload?.va_numbers?.[0]?.va_number 
        || rawPayload?.permata_va_number 
        || rawPayload?.bill_key 
        || latestPayment?.payment_destination 
        || null;

    // Pastikan nomor VA benar-benar memiliki digit angka (bukan string nama channel seperti 'BSI')
    const vaNumber = rawVaCandidate && /\d/.test(rawVaCandidate) ? rawVaCandidate : null;

    const billerCode = rawPayload?.biller_code || null;
    const billKey = rawPayload?.bill_key || null;

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

    // Analytics tracking when paid
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

    // Real-time auto-polling for pending online payments (Midtrans)
    useEffect(() => {
        if (donation.status !== 'pending' || donation.channel !== 'online') {
            return;
        }

        const pollInterval = setInterval(() => {
            router.reload({
                only: ['donation'],
            });
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [donation.status, donation.channel]);

    // Countdown timer for expiry
    useEffect(() => {
        if (donation.status !== 'pending') {
            setTimeLeft(null);
            return;
        }

        let expiryTimestamp: number | null = null;
        const rawExpiry = rawPayload?.expiry_time;

        if (donation.channel === 'online') {
            if (rawExpiry) {
                // Midtrans format: "YYYY-MM-DD HH:mm:ss"
                const iso = String(rawExpiry).replace(' ', 'T');
                expiryTimestamp = new Date(iso).getTime();
            } else if (donation.created_at) {
                const durationMinutes = paymentMethod === 'virtual_account' ? 24 * 60 : 30;
                expiryTimestamp = new Date(donation.created_at).getTime() + durationMinutes * 60 * 1000;
            }
        } else if (donation.channel === 'offline' && donation.created_at) {
            // Transfer Bank Manual: Batas waktu 24 jam sejak pembuatan tagihan
            expiryTimestamp = new Date(donation.created_at).getTime() + 24 * 60 * 60 * 1000;
        }

        if (!expiryTimestamp || isNaN(expiryTimestamp)) return;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((expiryTimestamp! - Date.now()) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [donation.status, donation.channel, rawPayload?.expiry_time, donation.created_at, paymentMethod]);

    const formatCountdown = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours} jam ${mins} menit ${secs} dtk`;
        }
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getPaymentMethodDisplay = () => {
        if (donation.channel === 'offline') {
            if (selectedBank?.bank_name) {
                return selectedBank.bank_name;
            }
            return 'Transfer Bank Manual';
        }

        const channel = latestPayment?.payment_channel?.toUpperCase();
        if (channel === 'QRIS') return 'QRIS (E-Wallet & M-Banking)';
        if (channel === 'BSI') return 'BSI Virtual Account';
        if (channel === 'BRI') return 'BRI Virtual Account';
        if (channel === 'BNI') return 'BNI Virtual Account';
        if (channel === 'MANDIRI') return 'Mandiri Virtual Account';
        if (channel === 'BCA') return 'BCA Virtual Account';
        if (channel === 'PERMATA') return 'Permata Virtual Account';
        if (channel === 'CIMB') return 'CIMB Niaga Virtual Account';
        if (channel === 'DANAMON') return 'Danamon Virtual Account';
        if (channel === 'SHOPEEPAY') return 'ShopeePay';
        if (channel === 'GOPAY') return 'GoPay';
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
        
        if (status === 'cancelled') {
            return {
                icon: <XCircle className="w-16 h-16 text-rose-500 mx-auto" />,
                title: 'Donasi Dibatalkan',
                color: 'text-rose-500',
                desc: 'Tagihan donasi ini telah dibatalkan dan tidak lagi aktif. Anda dapat berdonasi kembali kapan saja.',
                bg: 'bg-rose-50 border-rose-100'
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
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success('Berhasil disalin ke clipboard');
    };

    const handleCheckStatus = () => {
        setIsChecking(true);
        toast.info('Memeriksa status pembayaran...');
        router.reload({
            only: ['donation'],
            onFinish: () => {
                setIsChecking(false);
                toast.success('Pemeriksaan status selesai');
            }
        });
    };

    const handleDownloadQr = () => {
        if (!qrCodeUrl) return;
        const filename = `QRIS-${donation.donation_code}.png`;

        fetch(qrCodeUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success('Kode QR berhasil diunduh');
            })
            .catch(() => {
                window.open(qrCodeUrl, '_blank');
            });
    };

    const vaInstructions = useMemo(() => {
        return getBankInstructions(paymentChannel, vaNumber || '', billerCode, billKey);
    }, [paymentChannel, vaNumber, billerCode, billKey]);

    const handleCancelDonation = () => {
        setIsCancelling(true);
        router.post(`/donasi/${donation.donation_code}/batal`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCancelModal(false);
                toast.success('Tagihan donasi berhasil dibatalkan.');
            },
            onError: () => {
                toast.error('Gagal membatalkan donasi. Silakan coba kembali.');
            },
            onFinish: () => {
                setIsCancelling(false);
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
                                    <button 
                                        onClick={() => copyToClipboard(donation.amount.toString())} 
                                        title="Salin nominal"
                                        className="text-slate-400 hover:text-insani-blue transition-colors p-1"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* NATIVE ONLINE PAYMENT SECTION (Midtrans Core API & Fallback) */}
                            {donation.channel === 'online' && donation.status === 'pending' && (
                                <div className="space-y-4">
                                    
                                    {/* 1. NATIVE DYNAMIC QRIS */}
                                    {(paymentMethod === 'qris' || paymentChannel === 'QRIS') && (
                                        <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-center space-y-4 shadow-2xs">
                                            
                                            {/* QRIS Header Badge & Expiry Countdown */}
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <BankLogo code="qris" size="sm" />
                                                    <span className="text-xs font-bold text-slate-800">
                                                        QRIS Standar Nasional
                                                    </span>
                                                </div>
                                                {timeLeft !== null && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                                                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                                        <span>Sisa waktu: {formatCountdown(timeLeft)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* QR Code Container */}
                                            <div className="py-2 flex flex-col items-center justify-center">
                                                <div className="p-4 bg-white rounded-2xl border-2 border-slate-800 shadow-md inline-block max-w-[280px]">
                                                    {qrCodeUrl ? (
                                                        <img 
                                                            src={qrCodeUrl} 
                                                            alt={`QRIS Donasi ${donation.donation_code}`}
                                                            className="w-56 h-56 sm:w-60 sm:h-60 object-contain mx-auto rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2">
                                                            <QrCode className="w-12 h-12" />
                                                            <span className="text-xs">Memuat kode QR...</span>
                                                        </div>
                                                    )}
                                                    <p className="text-[11px] font-bold text-slate-500 mt-2 tracking-wide uppercase">
                                                        NMID: ID1020021198704
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons for QRIS */}
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
                                                {qrCodeUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={handleDownloadQr}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span>Unduh Gambar QR</span>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(donation.amount.toString())}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
                                                >
                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                    <span>Salin Nominal: {formatCurrency(Number(donation.amount))}</span>
                                                </button>
                                            </div>

                                            {/* QRIS Supported Badges & Instructions */}
                                            <div className="pt-2 text-left bg-blue-50/60 rounded-xl p-3.5 border border-blue-100 text-xs space-y-2">
                                                <p className="font-semibold text-blue-950 flex items-center gap-1.5">
                                                    <ShieldCheck className="w-4 h-4 text-insani-blue" />
                                                    <span>Mendukung Semua Aplikasi Pembayaran Indonesia:</span>
                                                </p>
                                                <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                                                    BCA mobile, Livin' Mandiri, BRImo, BNI Mobile, BSI Mobile, GoPay, OVO, DANA, ShopeePay, LinkAja, dan seluruh aplikasi yang memiliki fitur <strong>Scan QRIS</strong>.
                                                </p>
                                                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] sm:text-xs pt-1">
                                                    <li>Buka aplikasi m-Banking atau E-Wallet di smartphone Anda.</li>
                                                    <li>Pilih menu <strong>Scan / Bayar / QRIS</strong>.</li>
                                                    <li>Arahkan kamera ke kode QR di atas (atau unggah foto QR jika diunduh).</li>
                                                    <li>Periksa nominal donasi dan masukkan PIN Anda.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. NATIVE E-WALLET (ShopeePay & GoPay) */}
                                    {paymentMethod === 'ewallet' && (
                                        <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
                                            
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <BankLogo code={paymentChannel} size="sm" />
                                                    <span className="font-bold text-sm text-slate-800">
                                                        Pembayaran {paymentChannel === 'SHOPEEPAY' ? 'ShopeePay' : 'GoPay'}
                                                    </span>
                                                </div>
                                                {timeLeft !== null && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                                                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                                        <span>Sisa waktu: {formatCountdown(timeLeft)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mobile App Deeplink Button */}
                                            {deeplinkUrl && (
                                                <div className="space-y-2">
                                                    <a
                                                        href={deeplinkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`w-full min-h-[50px] inline-flex items-center justify-center gap-2.5 font-bold py-3.5 px-4 rounded-xl text-white shadow-sm transition-all text-sm sm:text-base ${
                                                            paymentChannel === 'SHOPEEPAY' 
                                                                ? 'bg-[#EE4D2D] hover:bg-[#D73211] active:bg-[#B8280B]' 
                                                                : 'bg-[#00880C] hover:bg-[#00700A] active:bg-[#005508]'
                                                        }`}
                                                    >
                                                        <Smartphone className="w-5 h-5" />
                                                        <span>
                                                            Buka Aplikasi {paymentChannel === 'SHOPEEPAY' ? 'ShopeePay' : 'Gojek / GoPay'}
                                                        </span>
                                                        <ExternalLink className="w-4 h-4 ml-1" />
                                                    </a>
                                                    <p className="text-center text-xs text-slate-500">
                                                        Klik tombol di atas untuk membuka aplikasi secara langsung di ponsel Anda.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Desktop Fallback QR Code */}
                                            {qrCodeUrl && (
                                                <div className="pt-3 border-t border-slate-100 text-center space-y-3">
                                                    <p className="text-xs font-semibold text-slate-600">
                                                        Atau pindai kode QR menggunakan kamera ponsel Anda:
                                                    </p>
                                                    <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-xs">
                                                        <img 
                                                            src={qrCodeUrl} 
                                                            alt={`${paymentChannel} QR`}
                                                            className="w-44 h-44 object-contain mx-auto"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* E-Wallet Steps */}
                                            <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5 border border-slate-100">
                                                <p className="font-semibold text-slate-900">Cara Pembayaran:</p>
                                                <ol className="list-decimal list-inside space-y-1 text-[11px] sm:text-xs">
                                                    <li>Buka aplikasi melalui tombol di atas atau scan QR code.</li>
                                                    <li>Periksa detail donasi sebesar <strong>{formatCurrency(Number(donation.amount))}</strong>.</li>
                                                    <li>Masukkan PIN keamanan {paymentChannel === 'SHOPEEPAY' ? 'ShopeePay' : 'GoPay'} Anda.</li>
                                                    <li>Setelah selesai, status donasi akan otomatis diperbarui dalam hitungan detik.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. NATIVE VIRTUAL ACCOUNT */}
                                    {paymentMethod === 'virtual_account' && (
                                        <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-2xs">
                                            
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <BankLogo code={paymentChannel} size="sm" />
                                                    <span className="font-bold text-sm text-slate-800">
                                                        {getPaymentMethodDisplay()}
                                                    </span>
                                                </div>
                                                {timeLeft !== null && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                                                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                                        <span>Berlaku: {formatCountdown(timeLeft)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mandiri Multi-payment Dual Fields (Biller Code + Bill Key) */}
                                            {billerCode && billKey ? (
                                                <div className="space-y-3">
                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                                                        <div>
                                                            <span className="block text-xs text-slate-500 font-medium">Kode Perusahaan</span>
                                                            <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-800 tracking-wider">
                                                                {billerCode}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(billerCode)}
                                                            className="p-2.5 bg-blue-50 text-insani-blue hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Salin Kode Perusahaan"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                                                        <div>
                                                            <span className="block text-xs text-slate-500 font-medium">Nomor Tagihan / Pelanggan</span>
                                                            <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-800 tracking-wider">
                                                                {billKey}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(billKey)}
                                                            className="p-2.5 bg-blue-50 text-insani-blue hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Salin Nomor Tagihan"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                !vaNumber ? (
                                                    <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 text-left space-y-3 shadow-xs">
                                                        <div className="flex items-start gap-3">
                                                            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                            <div className="space-y-1">
                                                                <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                                                                    Layanan {getPaymentMethodDisplay()} Sedang Integrasi Perbankan
                                                                </h4>
                                                                <p className="text-xs text-amber-900/90 leading-relaxed">
                                                                    Nomor Virtual Account belum dapat diterbitkan otomatis karena saluran bank {paymentChannel} sedang dalam integrasi berkala oleh penyedia perbankan. Anda dapat berdonasi instan menggunakan <strong>Virtual Account BCA / BNI / Mandiri</strong>, <strong>QRIS</strong>, atau <strong>Transfer Manual</strong>.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {donation.program?.slug && (
                                                            <div className="pt-1 flex flex-wrap items-center gap-2">
                                                                <Link
                                                                    href={`/program/${donation.program.slug}/donasi?replace=${donation.donation_code}`}
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-insani-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs"
                                                                >
                                                                    Pilih Metode Pembayaran Lain
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-blue-200 shadow-xs space-y-3">
                                                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                            Nomor Virtual Account
                                                        </span>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900 tracking-wider select-all">
                                                                {vaNumber}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(vaNumber)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-insani-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                <span>Salin VA</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {/* Bank Transfer Guide Accordion */}
                                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                                                    className="w-full p-3.5 flex items-center justify-between text-left font-semibold text-slate-800 bg-slate-50/80 hover:bg-slate-100 transition-colors"
                                                >
                                                    <span>Petunjuk Cara Pembayaran {getPaymentMethodDisplay()}</span>
                                                    {isInstructionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>

                                                {isInstructionsOpen && (
                                                    <div className="p-4 space-y-3 border-t border-slate-100">
                                                        {/* Tab Buttons */}
                                                        <div className="flex rounded-lg bg-slate-100 p-1 text-center font-medium">
                                                            <button
                                                                type="button"
                                                                onClick={() => setInstructionTab('mobile')}
                                                                className={`flex-1 py-1.5 rounded-md transition-all text-xs ${
                                                                    instructionTab === 'mobile' 
                                                                        ? 'bg-white text-insani-blue shadow-xs font-bold' 
                                                                        : 'text-slate-600 hover:text-slate-900'
                                                                }`}
                                                            >
                                                                Mobile Banking
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setInstructionTab('atm')}
                                                                className={`flex-1 py-1.5 rounded-md transition-all text-xs ${
                                                                    instructionTab === 'atm' 
                                                                        ? 'bg-white text-insani-blue shadow-xs font-bold' 
                                                                        : 'text-slate-600 hover:text-slate-900'
                                                                }`}
                                                            >
                                                                ATM
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setInstructionTab('ibanking')}
                                                                className={`flex-1 py-1.5 rounded-md transition-all text-xs ${
                                                                    instructionTab === 'ibanking' 
                                                                        ? 'bg-white text-insani-blue shadow-xs font-bold' 
                                                                        : 'text-slate-600 hover:text-slate-900'
                                                                }`}
                                                            >
                                                                Internet Banking
                                                            </button>
                                                        </div>

                                                        {/* Steps List */}
                                                        <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed text-[11px] sm:text-xs pt-1">
                                                            {vaInstructions[instructionTab]?.map((step, idx) => (
                                                                <li key={idx} className="pl-1">
                                                                    {step}
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}



                                    {/* Real-time Status Check & Auto-sync Footer Notice */}
                                    <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-2xl space-y-3">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <RefreshCw className={`w-3.5 h-3.5 text-insani-blue shrink-0 ${isChecking ? 'animate-spin' : ''}`} />
                                                <span>Sistem memverifikasi status otomatis setiap 5 detik.</span>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleCheckStatus}
                                                disabled={isChecking}
                                                variant="outline"
                                                className="w-full sm:w-auto min-h-[40px] py-2 px-4 rounded-xl border-blue-200 bg-white hover:bg-blue-50 text-insani-blue font-semibold gap-2 text-xs sm:text-sm"
                                            >
                                                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isChecking ? 'animate-spin' : ''}`} />
                                                <span>{isChecking ? 'Memeriksa...' : 'Cek Status Sekarang'}</span>
                                            </Button>
                                        </div>
                                    </div>

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
                                    <span className="font-medium text-slate-800">{donation.is_anonymous ? 'Inisiator Kebaikan' : donation.donor_name}</span>
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
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/70">
                                        <h4 className="font-bold text-amber-950 text-base">Instruksi Transfer Manual</h4>
                                        {timeLeft !== null && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-full text-xs font-semibold self-start sm:self-auto shadow-2xs">
                                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                                <span>Batas waktu: {formatCountdown(timeLeft)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
                                        Silakan transfer tepat sebesar <strong>{formatCurrency(Number(donation.amount))}</strong> ke rekening resmi {selectedBank?.bank_name ? <strong>{selectedBank.bank_name}</strong> : foundationName} di bawah ini sebelum batas waktu berakhir:
                                    </p>

                                    {selectedBank && (
                                        <div className="flex justify-between items-center bg-white p-3.5 sm:p-4 rounded-xl border border-amber-200/80 shadow-xs">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <BankLogo code={selectedBank.bank_name || selectedBank.bank_code || 'bsi'} size="md" />
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
                                            <UserRoundPlus className="w-5 h-5" />
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

                            {/* Action Buttons for Pending Donation */}
                            {donation.status === 'pending' && (
                                <div className="pt-3 space-y-2.5">
                                    {donation.program?.slug && (
                                        <Link href={`/program/${donation.program.slug}/donasi?replace=${donation.donation_code}`} className="w-full block">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="w-full min-h-[46px] py-2.5 border-blue-200 text-insani-blue hover:bg-blue-50/80 rounded-xl text-xs sm:text-sm font-semibold transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Pilih / Ganti Metode Pembayaran Lain
                                            </Button>
                                        </Link>
                                    )}

                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full min-h-[42px] py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-semibold transition-all"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Batalkan Tagihan Donasi Ini
                                    </Button>
                                </div>
                            )}

                            {/* Back to Program / Donate Again button */}
                            <div className="pt-2">
                                <Link href={`/program/${donation.program?.slug || ''}`} className="w-full block">
                                    <Button className="w-full min-h-[50px] py-3.5 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl text-sm sm:text-base font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.99]">
                                        {['cancelled', 'expired', 'failed'].includes(donation.status)
                                            ? 'Donasi ke Program Ini Lagi'
                                            : t('Kembali ke Halaman Program')}
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

            {/* Modal Konfirmasi Pembatalan Donasi */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>Batalkan Tagihan Donasi?</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                            Apakah Anda yakin ingin membatalkan tagihan donasi dengan kode <strong className="text-slate-800 dark:text-zinc-200 font-mono">{donation.donation_code}</strong> sebesar <strong className="text-slate-800 dark:text-zinc-200">{formatCurrency(Number(donation.amount))}</strong>?
                            <br /><br />
                            Tagihan yang dibatalkan tidak akan dapat dibayar lagi dan pengingat di dashboard donatur Anda akan langsung dibersihkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCancelModal(false)}
                            disabled={isCancelling}
                            className="text-xs rounded-xl"
                        >
                            Kembali
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCancelDonation}
                            disabled={isCancelling}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                        >
                            {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Donasi'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}
