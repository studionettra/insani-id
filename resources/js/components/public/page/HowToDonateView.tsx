import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Check, 
    Copy, 
    CreditCard, 
    QrCode, 
    Building2, 
    Receipt, 
    Heart, 
    ShieldCheck, 
    MessageCircle, 
    ArrowRight,
    Search
} from 'lucide-react';

export default function HowToDonateView() {
    const { siteSettings, bankAccounts } = usePage().props as any;
    const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

    const foundationName = siteSettings?.legal_foundation_name || 'Yayasan Peduli Insani Indonesia';
    const whatsappNumber = siteSettings?.contact_donor_support_wa || siteSettings?.contact_whatsapp || '081319456675';
    const whatsappClean = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappClean.startsWith('0') ? '62' + whatsappClean.slice(1) : whatsappClean}`;

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedAccount(id);
        setTimeout(() => setCopiedAccount(null), 2500);
    };

    return (
        <div className="min-h-screen bg-slate-50/60 pb-20">
            {/* HERO HEADER */}
            <div className="relative bg-insani-darkblue text-white py-14 md:py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-insani-blue/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-insani-blue/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <nav className="flex items-center justify-center gap-2 text-xs md:text-sm text-blue-200 font-medium mb-4">
                        <Link href="/" className="hover:underline text-slate-300">Beranda</Link>
                        <span>/</span>
                        <Link href="/pusat-bantuan" className="hover:underline text-slate-300">Pusat Bantuan</Link>
                        <span>/</span>
                        <span className="text-white">Cara Berdonasi</span>
                    </nav>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Panduan Cara Berdonasi
                    </h1>
                    <p className="text-blue-100/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Salurkan niat baik Anda dengan mudah, transparan, dan terkonfirmasi otomatis melalui platform Insani Indonesia.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10 space-y-8">
                {/* 3 STEPS WIZARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-extrabold">
                            1
                        </span>
                        <span>Donasi Cepat via Website (Otomatis & Direkomendasikan)</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                            <span className="text-xs font-bold text-brand-600 bg-brand-100/60 px-2.5 py-1 rounded-md mb-3 inline-block">
                                Langkah 1
                            </span>
                            <h3 className="font-bold text-slate-900 text-base mb-2">Pilih Program</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Telusuri katalog <Link href="/program" className="text-insani-blue font-semibold hover:underline">Program Donasi</Link> dan pilih kampanye yang ingin Anda bantu, lalu klik tombol <strong>"Donasi Sekarang"</strong>.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                            <span className="text-xs font-bold text-brand-600 bg-brand-100/60 px-2.5 py-1 rounded-md mb-3 inline-block">
                                Langkah 2
                            </span>
                            <h3 className="font-bold text-slate-900 text-base mb-2">Isi Data & Nominal</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Tentukan nominal donasi (min. Rp 10.000). Masukkan nama, email, dan WhatsApp. Anda dapat mencentang <em>"Sembunyikan Nama Saya (Anonim)"</em> untuk berdonasi sebagai Hamba Allah.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                            <span className="text-xs font-bold text-brand-600 bg-brand-100/60 px-2.5 py-1 rounded-md mb-3 inline-block">
                                Langkah 3
                            </span>
                            <h3 className="font-bold text-slate-900 text-base mb-2">Bayar & Terkonfirmasi</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Pilih metode pembayaran otomatis (QRIS, VA Bank, E-Wallet). Sistem Xendit akan memverifikasi secara <em>real-time</em> tanpa perlu kirim bukti transfer.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/program"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-bold text-sm shadow-md transition-all active:scale-95"
                        >
                            <Heart className="w-4 h-4 fill-white" />
                            <span>Pilih Program Donasi Sekarang</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* TRANSFER MANUAL BANK REK */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-blue-50 text-insani-blue flex items-center justify-center text-sm font-extrabold">
                            2
                        </span>
                        <span>Transfer Manual ke Rekening Giro Yayasan</span>
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                        Jika Anda lebih nyaman berdonasi lewat transfer ATM atau internet banking langsung ke rekening giro resmi {foundationName}:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(bankAccounts && bankAccounts.length > 0 ? bankAccounts : [
                            { id: 'bsi', bank_name: 'Bank Syariah Indonesia (BSI)', bank_code: '451', bank_type: 'syariah', account_number: '7132195026', account_name: 'Insani Indonesia' },
                            { id: 'bri', bank_name: 'Bank Rakyat Indonesia (BRI)', bank_code: '002', bank_type: 'konvensional', account_number: '034501001366304', account_name: 'Insani Indonesia' },
                        ]).map((acc: any) => {
                            const accId = String(acc.id);
                            const cleanNum = String(acc.account_number).replace(/\s+/g, '');
                            const isSyariah = acc.bank_type === 'syariah';

                            return (
                                <div key={accId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-insani-blue/40 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="font-bold text-slate-900 text-base block">{acc.bank_name}</span>
                                            {acc.bank_code && (
                                                <span className="text-xs text-slate-500">Kode Bank: <strong>{acc.bank_code}</strong></span>
                                            )}
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                                            isSyariah ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {isSyariah ? 'Syariah' : 'Konvensional'}
                                        </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between mb-2">
                                        <span className="font-mono text-lg font-bold text-slate-900 tracking-wider">
                                            {acc.account_number}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(cleanNum, accId)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                        >
                                            {copiedAccount === accId ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                                    <span className="text-green-600">Tersalin!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Salin</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">Atas Nama: <strong>{acc.account_name}</strong></p>
                                </div>
                            );
                        })}
                    </div>

                    {/* WA KONFIRMASI BOX */}
                    <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-amber-900">
                                Wajib Konfirmasi Setelah Transfer Manual
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Kirimkan bukti foto/screenshot struk transfer Anda ke WhatsApp kami agar donasi dicatat pada program terkait.
                            </p>
                        </div>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Konfirmasi ke WhatsApp</span>
                        </a>
                    </div>
                </div>

                {/* CEK STATUS & KUITANSI BOX */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-extrabold">
                            3
                        </span>
                        <span>Cek Status Donasi & Unduh Kuitansi Resmi</span>
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                        Setiap donasi yang berhasil diverifikasi berhak mendapatkan bukti kuitansi sah elektronik (E-Receipt) yang dilengkapi cap digital dan QR Code validasi keabsahan yayasan:
                    </p>

                    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-insani-blue/10 text-insani-blue flex items-center justify-center shrink-0 mt-0.5">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">
                                    Lacak Transaksi Anda Kapan Saja
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Cukup masukkan Kode Donasi (contoh: <code>INS-2026xxxxxx</code>) atau alamat email Anda di halaman pelacakan.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/cek-donasi"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-insani-blue hover:bg-insani-blue/90 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
                        >
                            <Search className="w-4 h-4" />
                            <span>Cek Donasi Sekarang</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
