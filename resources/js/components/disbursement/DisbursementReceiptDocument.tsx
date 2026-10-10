import React from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck, MapPin, Users, ReceiptText } from 'lucide-react';
import BankLogo from '@/components/ui/bank-logo';
import { formatRupiah, formatDate, getLocalizedValue, terbilang } from '@/lib/utils';

interface DisbursementReceiptDocumentProps {
    program: any;
    disbursement: any;
}

export default function DisbursementReceiptDocument({
    program,
    disbursement,
}: DisbursementReceiptDocumentProps) {
    const { siteSettings } = usePage().props as any;

    const programTitle = getLocalizedValue(program?.title, 'Program');
    const foundationName = siteSettings?.legal_foundation_name || 'Yayasan Peduli Insani Indonesia';
    const foundationSk = siteSettings?.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.Tahun 2019';
    const foundationAddress = siteSettings?.contact_address || 'Jln. Moh Kahfi 1 No 90A, Jagakarsa, Jakarta Selatan';
    const foundationPhone = siteSettings?.contact_phone || '(021) 27871199';
    const foundationEmail = siteSettings?.contact_email || 'sapa@insani.id';

    const signatoryName = siteSettings?.receipt_signatory_name || 'Tim Keuangan Insani Indonesia';
    const signatoryTitle = siteSettings?.receipt_signatory_title || 'Divisi Keuangan & Penyaluran';

    const receiptNumber = disbursement.receipt_number || `KW-DISB-${disbursement.id}`;
    const transferDate = formatDate(disbursement.transferred_at || disbursement.created_at);

    const hasDeductions = Number(disbursement.platform_fee_amount) > 0 || Number(disbursement.gateway_fee) > 0;
    const brutoAmount = hasDeductions
        ? Number(disbursement.requested_amount) +
          Number(disbursement.platform_fee_amount || 0) +
          Number(disbursement.gateway_fee || 0)
        : Number(disbursement.requested_amount);

    const recipientName = disbursement.bank_account_name || 'Penerima Amanah Program';

    return (
        <div
            id="printable-receipt-card"
            className="w-full max-w-4xl mx-auto bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xs print:shadow-none print:border-none print:rounded-none print:max-w-none print:m-0 print:p-0 p-6 sm:p-8 space-y-4 text-xs leading-normal"
        >
            {/* ==================== 1. KOP RESMI YAYASAN ==================== */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Logo & Legalitas Yayasan */}
                <div className="flex items-center gap-3.5">
                    <img
                        src="/images/logo/logo-landscape-color.png"
                        alt="Insani Indonesia"
                        className="h-10 w-auto object-contain shrink-0"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div>
                        <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                            {foundationName}
                        </h1>
                        <p className="text-[10px] text-slate-600 font-medium">
                            SK Kemenkumham RI: {foundationSk}
                        </p>
                        <p className="text-[9.5px] text-slate-500">
                            {foundationAddress} • Telp: {foundationPhone} • {foundationEmail}
                        </p>
                    </div>
                </div>

                {/* Judul & Nomor Kuitansi */}
                <div className="text-left sm:text-right shrink-0">
                    <h2 className="text-base font-black tracking-wider text-slate-900 uppercase">
                        KUITANSI PENCAIRAN
                    </h2>
                    <div className="inline-flex items-center gap-1 font-mono text-xs font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200 mt-1">
                        <ReceiptText className="w-3.5 h-3.5 text-blue-600" />
                        {receiptNumber}
                    </div>
                    <p className="text-[10.5px] text-slate-600 mt-0.5">
                        Tanggal Transfer: <strong className="text-slate-800">{transferDate}</strong>
                    </p>
                </div>
            </div>

            {/* Garis Ganda Pemisah Kop Formal */}
            <div className="border-t-2 border-slate-900 pt-0.5 border-b border-slate-400" />

            {/* ==================== 2. MATRIKS METADATA PENYALURAN ==================== */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/60 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* Kolom Kiri: Program Penyaluran */}
                <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Program Penggalangan
                        </span>
                        {program?.program_code && (
                            <span className="font-mono text-[10px] font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                Kode: {program.program_code}
                            </span>
                        )}
                    </div>

                    <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                        {programTitle}
                    </p>

                    {disbursement.distribution_plan && (
                        <div className="bg-white/90 rounded p-1.5 border-l-2 border-blue-500 text-[11px] text-slate-700 italic">
                            <span className="not-italic font-semibold text-slate-800">Rencana: </span>
                            &ldquo;{disbursement.distribution_plan}&rdquo;
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-600 pt-0.5">
                        {disbursement.location && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                {disbursement.location}
                            </span>
                        )}
                        {disbursement.beneficiary_target && (
                            <span className="inline-flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400 shrink-0" />
                                Target: {disbursement.beneficiary_target}
                            </span>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Rekening Penerima */}
                <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Penerima Dana
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            Rekening Terverifikasi
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <BankLogo code={disbursement.bank_name} size="xs" />
                        <span className="font-bold text-slate-900 uppercase text-xs">
                            {disbursement.bank_name}
                        </span>
                    </div>

                    <div className="bg-white/90 rounded p-1.5 border border-slate-200 flex items-center justify-between gap-2">
                        <div>
                            <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-wider">
                                {disbursement.bank_account_number}
                            </p>
                            <p className="text-[10.5px] text-slate-600">
                                Atas Nama: <strong className="text-slate-900">{recipientName}</strong>
                            </p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            BI-Fast
                        </span>
                    </div>

                    <p className="text-[10px] text-slate-500">
                        Metode Transfer: Kliring Otomatis BI-Fast / Real-Time Antarbank
                    </p>
                </div>
            </div>

            {/* ==================== 3. TABEL RINCIAN KEUANGAN ==================== */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase font-bold text-[10.5px]">
                        <tr>
                            <th className="py-2 px-3 text-left">Deskripsi Transaksi Penyaluran</th>
                            <th className="py-2 px-3 text-right w-44">Jumlah (Rp)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                        {hasDeductions ? (
                            <>
                                {/* 1. Alokasi Donasi Bruto */}
                                <tr>
                                    <td className="py-2 px-3">
                                        <p className="font-semibold text-slate-900">Alokasi Donasi Terkumpul Program</p>
                                        <p className="text-[10.5px] text-slate-500">Total akumulasi donasi yang dialokasikan dari program</p>
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold font-mono text-slate-900 tabular-nums">
                                        {formatRupiah(brutoAmount)}
                                    </td>
                                </tr>

                                {/* 2. Biaya Transaksi Payment Gateway */}
                                {Number(disbursement.gateway_fee) > 0 && (
                                    <tr>
                                        <td className="py-2 px-3">
                                            <p className="font-medium text-slate-700">Biaya Transaksi Payment Gateway</p>
                                            <p className="text-[10.5px] text-slate-500">Pemrosesan transaksi gerbang pembayaran QRIS & Virtual Account</p>
                                        </td>
                                        <td className="py-2 px-3 text-right font-semibold font-mono text-rose-600 tabular-nums">
                                            - {formatRupiah(disbursement.gateway_fee)}
                                        </td>
                                    </tr>
                                )}

                                {/* 3. Biaya Operasional Platform */}
                                {Number(disbursement.platform_fee_amount) > 0 && (
                                    <tr>
                                        <td className="py-2 px-3">
                                            <p className="font-medium text-slate-700">
                                                Biaya Operasional Platform ({disbursement.platform_fee_percent}%)
                                            </p>
                                            <p className="text-[10.5px] text-slate-500">Infaq operasional & keberlanjutan yayasan</p>
                                        </td>
                                        <td className="py-2 px-3 text-right font-semibold font-mono text-rose-600 tabular-nums">
                                            - {formatRupiah(disbursement.platform_fee_amount)}
                                        </td>
                                    </tr>
                                )}
                            </>
                        ) : (
                            <tr>
                                <td className="py-2 px-3">
                                    <p className="font-semibold text-slate-900">Nominal Permohonan Pencairan Dana</p>
                                    <p className="text-[10.5px] text-slate-500">Penarikan dana donasi terkumpul program kebaikan</p>
                                </td>
                                <td className="py-2 px-3 text-right font-bold font-mono text-slate-900 tabular-nums">
                                    {formatRupiah(disbursement.requested_amount)}
                                </td>
                            </tr>
                        )}

                        {/* 4. Biaya Transfer Bank (BI-Fast) */}
                        <tr>
                            <td className="py-2 px-3">
                                <p className="font-medium text-slate-700">Biaya Transfer Bank (BI-Fast)</p>
                                <p className="text-[10.5px] text-slate-500">Biaya transaksi kliring antarbank BI-Fast</p>
                            </td>
                            <td className="py-2 px-3 text-right font-semibold font-mono text-rose-600 tabular-nums">
                                - {formatRupiah(disbursement.bank_fee || 2500)}
                            </td>
                        </tr>

                        {/* 5. Total Bersih Ditransfer */}
                        <tr className="bg-slate-50 border-t-2 border-slate-400">
                            <td className="py-2.5 px-3">
                                <span className="font-black text-slate-900 uppercase text-xs sm:text-sm tracking-wide">
                                    TOTAL DANA DITRANSFER (NETTO)
                                </span>
                                <p className="text-[10px] text-slate-600">
                                    Jumlah dana yang efektif berhasil ditransfer ke rekening penerima
                                </p>
                            </td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-base sm:text-lg text-blue-700 print:text-slate-950 tabular-nums">
                                {formatRupiah(disbursement.nett_amount)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Terbilang */}
                <div className="bg-slate-100/90 border-t border-slate-300 p-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] shrink-0">
                        Terbilang:
                    </span>
                    <span className="italic font-semibold text-slate-900 text-[11px] leading-relaxed">
                        # {terbilang(Number(disbursement.nett_amount))} #
                    </span>
                </div>
            </div>

            {/* ==================== 4. CATATAN & KETENTUAN ==================== */}
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[10.5px] text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                    Catatan Ketentuan Penyaluran:
                </p>
                <p>
                    1. Kuitansi ini merupakan dokumen bukti sah transaksi penyaluran dana perbankan dari {foundationName} kepada penggalang dana.
                </p>
                <p>
                    2. Penggalang dana berkewajiban menyampaikan laporan pertanggungjawaban penyaluran dana secara transparan melalui menu <strong>Kabar Terbaru</strong>.
                </p>
            </div>

            {/* ==================== 5. PENGESAHAN DUA PIHAK ==================== */}
            <div className="pt-2 grid grid-cols-2 gap-4 text-center">
                {/* Pihak Penerima */}
                <div className="flex flex-col justify-between items-center h-28">
                    <p className="text-[11px] text-slate-600">Penerima Dana / Inisiator Program,</p>
                    <div className="w-full">
                        <p className="font-bold text-slate-900 text-xs underline decoration-slate-400 underline-offset-4">
                            {recipientName}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Penggalang Dana / Mitra Penerima</p>
                    </div>
                </div>

                {/* Pihak Yayasan (Pengesahan Elektronik Resmi) */}
                <div className="flex flex-col justify-between items-center h-28">
                    <p className="text-[11px] text-slate-600">Disahkan & Ditransfer Oleh,</p>

                    {/* Segel Pengesahan Resmi */}
                    <div className="border border-emerald-600 bg-emerald-50/70 rounded px-3 py-1 text-emerald-900 flex flex-col items-center justify-center shadow-2xs">
                        <div className="flex items-center gap-1 font-black text-[10px] uppercase tracking-wider text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            LUNAS - TERVERIFIKASI
                        </div>
                        <span className="text-[8.5px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">
                            {foundationName}
                        </span>
                    </div>

                    <div className="w-full">
                        <p className="font-bold text-slate-900 text-xs">
                            {signatoryName}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            {signatoryTitle} • Pengesahan Elektronik
                        </p>
                    </div>
                </div>
            </div>

            {/* ==================== 6. MICRO-FOOTER DOKUMEN ==================== */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-400 font-mono gap-1">
                <span>No. Dokumen: {receiptNumber}-{disbursement.program_id}</span>
                <span>Dokumen sah diterbitkan secara elektronik oleh sistem Insani-ID</span>
            </div>
        </div>
    );
}
