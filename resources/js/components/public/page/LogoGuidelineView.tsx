import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Palette, 
    Download, 
    Check, 
    Copy, 
    CheckCircle2, 
    XCircle, 
    Compass, 
    ShieldCheck, 
    ExternalLink, 
    Layers, 
    Maximize2, 
    FileText, 
    Eye, 
    Mail, 
    MessageCircle,
    Info,
    ArrowDown
} from 'lucide-react';

interface LogoGuidelineViewProps {
    page?: {
        title?: string | { id?: string; en?: string; ar?: string };
        meta_title?: string | { id?: string; en?: string; ar?: string };
        meta_description?: string | { id?: string; en?: string; ar?: string };
        content_html?: string | { id?: string; en?: string; ar?: string };
    };
}

interface BackgroundPreviewSwitcherProps {
    value: 'light' | 'slate' | 'dark';
    onChange: (val: 'light' | 'slate' | 'dark') => void;
}

function BackgroundPreviewSwitcher({ value, onChange }: BackgroundPreviewSwitcherProps) {
    return (
        <div className="inline-flex items-center flex-nowrap shrink-0 whitespace-nowrap bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium px-2 whitespace-nowrap shrink-0 select-none">
                Preview Latar:
            </span>
            <button
                type="button"
                onClick={() => onChange('light')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    value === 'light'
                        ? 'bg-slate-100 text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                }`}
            >
                Putih
            </button>
            <button
                type="button"
                onClick={() => onChange('slate')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    value === 'slate'
                        ? 'bg-slate-200 text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                }`}
            >
                Abu-abu
            </button>
            <button
                type="button"
                onClick={() => onChange('dark')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    value === 'dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                }`}
            >
                Gelap
            </button>
        </div>
    );
}

export default function LogoGuidelineView({ page }: LogoGuidelineViewProps) {
    const { siteSettings } = usePage().props as any;
    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const [primaryBg, setPrimaryBg] = useState<'light' | 'slate' | 'dark'>('light');
    const [secondaryBg, setSecondaryBg] = useState<'light' | 'slate' | 'dark'>('light');

    const whatsappNumber = siteSettings?.contact_whatsapp || siteSettings?.contact_donor_support_wa || '081319456675';
    const whatsappClean = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappClean.startsWith('0') ? '62' + whatsappClean.slice(1) : whatsappClean}`;
    const contactEmail = siteSettings?.contact_email || 'sapa@insani.id';

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(label);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    // Google Drive Official Download Links
    const downloadLinks = {
        primary: {
            color: 'https://drive.google.com/file/d/146ZWyVZa9buV90kh0wytXv7oyuXuR2t9/view',
            black: 'https://drive.google.com/file/d/1L1rB43sd2fR7ipTA6oiJmiNU5VMQug4S/view',
            white: 'https://drive.google.com/file/d/1m0RkjykFGcgIuMe364CfkQ54WnyS9AlQ/view',
        },
        secondary: {
            color: 'https://drive.google.com/file/d/1QDAvqsfZbyJomJvT1DTGBtULakxufPi0/view',
            black: 'https://drive.google.com/file/d/1fmV7HsQm7tpivlpB0IKXHDiP8hoZwS1Q/view',
            white: 'https://drive.google.com/file/d/10JQTQbNFP5RsYcqIHyphgtT-272t3vZN/view',
        }
    };

    // Official Palette Colors
    const colorSwatches = [
        {
            name: 'Insani Blue',
            role: 'Warna Utama Digital',
            hex: '#0080FF',
            rgb: '0, 128, 255',
            cmyk: '76, 45, 0, 0',
            bgClass: 'bg-[#0080FF]',
            textColor: 'text-white',
            desc: 'Merefleksikan tanggung jawab, profesionalisme, transparansi, dan komitmen kemanusiaan universal.'
        },
        {
            name: 'Insani Dark Navy',
            role: 'Warna Kontras & Header',
            hex: '#054BAD',
            rgb: '5, 75, 173',
            cmyk: '95, 75, 0, 5',
            bgClass: 'bg-[#054BAD]',
            textColor: 'text-white',
            desc: 'Memberikan kedalaman, keteguhan institusi, dan keterbacaan teks tingkat tinggi.'
        },
        {
            name: 'Insani Turquoise',
            role: 'Warna Pertumbuhan & Harmoni',
            hex: '#00D1B4',
            rgb: '0, 209, 180',
            cmyk: '68, 0, 42, 0',
            bgClass: 'bg-[#00D1B4]',
            textColor: 'text-slate-900',
            desc: 'Melambangkan kesegaran, semangat pembaruan pemuda, pertumbuhan berkelanjutan, dan keselarasan sosial.'
        },
        {
            name: 'Neutral Dark Slate',
            role: 'Warna Teks & Monokrom Hitam',
            hex: '#101828',
            rgb: '16, 24, 40',
            cmyk: '60, 40, 40, 100',
            bgClass: 'bg-[#101828]',
            textColor: 'text-white',
            desc: 'Digunakan untuk varian logo monokrom hitam, tipografi body text, dan latar belakang kontras tinggi.'
        },
        {
            name: 'Pure White',
            role: 'Warna Kontras Terbalik & Latar',
            hex: '#FFFFFF',
            rgb: '255, 255, 255',
            cmyk: '0, 0, 0, 0',
            bgClass: 'bg-white border border-slate-200',
            textColor: 'text-slate-900',
            desc: 'Digunakan untuk varian logo monokrom putih pada latar gelap atau foto dokumentasi.'
        }
    ];

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -90;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/70 pb-20 font-outfit">
            {/* 1. HERO HEADER */}
            <div className="relative bg-insani-darkblue text-white py-14 md:py-20 px-4 overflow-hidden">
                {/* Decorative radial gradients & glow orb */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-insani-blue/25 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-insani-blue/15 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    {/* 2. BREADCRUMBS */}
                    <nav className="flex items-center justify-center gap-2 text-xs md:text-sm text-blue-200 font-medium mb-4">
                        <Link href="/" className="hover:underline text-slate-300 transition-colors">Beranda</Link>
                        <span>/</span>
                        <Link href="/pusat-bantuan" className="hover:underline text-slate-300 transition-colors">Pusat Bantuan</Link>
                        <span>/</span>
                        <span className="text-white font-semibold">Panduan Logo</span>
                    </nav>

                    {/* 3. BADGE IDENTITY */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-semibold backdrop-blur-md mb-4 shadow-xs">
                        <Palette className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Identitas Visual &amp; Panduan Brand Resmi</span>
                    </div>

                    {/* 4. CAPTION HEADER */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Panduan Penggunaan Logo Insani Indonesia
                    </h1>
                    <p className="text-blue-100/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Standar resmi penggunaan logo, filosofi identitas visual, aturan penempatan, dan pusat unduhan berkas master Yayasan Peduli Insani Indonesia.
                    </p>

                    {/* Quick Action: Jump to Download */}
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <a
                            href="#unduh-logo"
                            onClick={(e) => scrollToSection(e, 'unduh-logo')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-insani-darkblue hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-insani-blue" />
                            <span>Unduh Berkas Logo</span>
                            {/* <ArrowDown className="w-3.5 h-3.5" /> */}
                        </a>
                        <a
                            href="#filosofi-logo"
                            onClick={(e) => scrollToSection(e, 'filosofi-logo')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-all cursor-pointer backdrop-blur-md"
                        >
                            <span>Pelajari Filosofi</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* 5. BODY */}
            <div className="container mx-auto px-4 max-w-5xl -mt-8 relative z-10 space-y-8">
                {/* STICKY QUICK NAV PILLS */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200/80 shadow-sm flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold text-slate-600 scrollbar-none">
                    <a href="#filosofi-logo" onClick={(e) => scrollToSection(e, 'filosofi-logo')} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap transition-colors">
                        1. Filosofi &amp; Nilai
                    </a>
                    <a href="#format-logo" onClick={(e) => scrollToSection(e, 'format-logo')} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap transition-colors">
                        2. Format Utama
                    </a>
                    <a href="#aturan-penggunaan" onClick={(e) => scrollToSection(e, 'aturan-penggunaan')} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap transition-colors">
                        3. Do &amp; Don'ts
                    </a>
                    <a href="#zona-eksklusif" onClick={(e) => scrollToSection(e, 'zona-eksklusif')} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap transition-colors">
                        4. Zona Eksklusif
                    </a>
                    <a href="#palet-warna" onClick={(e) => scrollToSection(e, 'palet-warna')} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap transition-colors">
                        5. Palet Warna
                    </a>
                    <a href="#unduh-logo" onClick={(e) => scrollToSection(e, 'unduh-logo')} className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-bold hover:bg-brand-100 whitespace-nowrap transition-colors">
                        6. Pusat Unduhan Logo
                    </a>
                </div>

                {/* SECTION 1: FILOSOFI & NILAI BRAND */}
                <section id="filosofi-logo" className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm scroll-mt-24">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-3">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Filosofi &amp; Nilai Inti</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            YOUTH, GROWTH AND RESPONSIBLE
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Identitas visual baru Insani Indonesia merupakan manifestasi dari semangat gerakan kemanusiaan generasi muda yang bertumbuh secara berkesinambungan serta menjunjung tinggi transparansi dan amanah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {/* Pilar Hijau */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100/80 relative overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-[#00D1B4]/20 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">
                                <span className="w-4 h-4 rounded-full bg-[#00D1B4]" />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-lg mb-2 flex items-center gap-2">
                                <span>Hijau Insani</span>
                                <span className="text-xs font-mono font-medium text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">Fresh &amp; Growth</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Hijau selalu identik dengan kesegaran ide, regenerasi, pertumbuhan sosial, dan keselarasan atau harmoni hidup bersama masyarakat yang kami dampingi.
                            </p>
                        </div>

                        {/* Pilar Biru */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100/80 relative overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-insani-blue/20 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
                                <span className="w-4 h-4 rounded-full bg-insani-blue" />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-lg mb-2 flex items-center gap-2">
                                <span>Biru Insani</span>
                                <span className="text-xs font-mono font-medium text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">Responsible</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Biru merefleksikan rasa tanggung jawab, integritas pengabdian, profesionalisme tata kelola, dan ketenangan dalam menghadapi tantangan krisis kemanusiaan.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-xs sm:text-sm text-slate-700 font-medium italic">
                            "Warna baru pada logo ini memiliki makna fundamental: <strong>Muda, Bertumbuh &amp; Bertanggung Jawab</strong>."
                        </p>
                    </div>
                </section>

                {/* SECTION 2: FORMAT UTAMA LOGO (PRIMARY & SECONDARY) */}
                <section id="format-logo" className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm scroll-mt-24 space-y-10">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-3">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Format &amp; Orientasi Logo</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Dua Format Resmi Logo Insani
                        </h2>
                        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                            Logo Insani Indonesia dirancang dalam dua varian tata letak baku: <strong>Logo Primer</strong> dan <strong>Logo Sekunder</strong>. Pemilihan format harus disesuaikan dengan proporsi ruang media yang tersedia.
                        </p>
                    </div>

                    {/* Varian 1: Logo Primer (Vertikal) */}
                    <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                            <div className="min-w-0 pr-2">
                                <span className="text-xs font-bold text-brand-600 bg-brand-100/60 px-2.5 py-1 rounded-md mb-2 inline-block">
                                    Varian 1
                                </span>
                                <h3 className="text-xl font-bold text-slate-900">Logo Primer</h3>
                                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                                    Ikon simbol diposisikan di bagian atas dan teks logotype berada di bagian bawah. Digunakan untuk avatar akun resmi, plakat, sampul proposal, kop surat, dan materi vertikal.
                                </p>
                            </div>

                            {/* Background preview switcher */}
                            <div className="shrink-0 self-start sm:self-center overflow-x-auto max-w-full py-0.5">
                                <BackgroundPreviewSwitcher value={primaryBg} onChange={setPrimaryBg} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* Anatomi Guideline */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                <img
                                    src="/images/logo-guideline/Guideline-Primary-Log.png"
                                    alt="Panduan Anatomi Logo Primer"
                                    className="w-full h-auto rounded-lg object-contain"
                                />
                                <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                                    Pedoman proporsi: Ikon berdiri di atas garis tengah teks nama institusi
                                </p>
                            </div>

                            {/* Dynamic Asset Preview */}
                            <div className={`p-8 rounded-xl border flex flex-col items-center justify-center min-h-[260px] transition-colors ${
                                primaryBg === 'dark' 
                                    ? 'bg-slate-950 border-slate-800' 
                                    : primaryBg === 'slate' 
                                    ? 'bg-slate-100 border-slate-300' 
                                    : 'bg-white border-slate-200'
                            }`}>
                                <img
                                    src={primaryBg === 'dark' ? '/images/logo/logo-portrait-white.png' : '/images/logo/logo-portrait-color.png'}
                                    alt="Preview Logo Primer Insani"
                                    className="max-h-48 w-auto object-contain transition-all"
                                />
                                <span className={`text-[11px] mt-4 font-mono font-medium ${primaryBg === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {primaryBg === 'dark' ? 'logo-portrait-white.png' : 'logo-portrait-color.png'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Varian 2: Logo Sekunder (Horizontal) */}
                    <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                            <div className="min-w-0 pr-2">
                                <span className="text-xs font-bold text-cyan-700 bg-cyan-100/60 px-2.5 py-1 rounded-md mb-2 inline-block">
                                    Varian 2
                                </span>
                                <h3 className="text-xl font-bold text-slate-900">Logo Sekunder</h3>
                                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                                    Ikon dan teks berdiri sejajar di baris yang sama. Format paling ideal untuk navbar website, bumper video kegiatan, spanduk horizontal, dan co-branding bersama mitra.
                                </p>
                            </div>

                            {/* Background preview switcher */}
                            <div className="shrink-0 self-start sm:self-center overflow-x-auto max-w-full py-0.5">
                                <BackgroundPreviewSwitcher value={secondaryBg} onChange={setSecondaryBg} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* Anatomi Guideline */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                <img
                                    src="/images/logo-guideline/Guideline-Secondary-Logo.png"
                                    alt="Panduan Anatomi Logo Sekunder"
                                    className="w-full h-auto rounded-lg object-contain"
                                />
                                <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                                    Pedoman proporsi: Ikon sejajar horizontal dengan logotype nama institusi
                                </p>
                            </div>

                            {/* Dynamic Asset Preview */}
                            <div className={`p-8 rounded-xl border flex flex-col items-center justify-center min-h-[260px] transition-colors ${
                                secondaryBg === 'dark' 
                                    ? 'bg-slate-950 border-slate-800' 
                                    : secondaryBg === 'slate' 
                                    ? 'bg-slate-100 border-slate-300' 
                                    : 'bg-white border-slate-200'
                            }`}>
                                <img
                                    src={secondaryBg === 'dark' ? '/images/logo/logo-landscape-white.png' : '/images/logo/logo-landscape-color.png'}
                                    alt="Preview Logo Sekunder Insani"
                                    className="max-h-24 w-auto object-contain transition-all"
                                />
                                <span className={`text-[11px] mt-4 font-mono font-medium ${secondaryBg === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {secondaryBg === 'dark' ? 'logo-landscape-white.png' : 'logo-landscape-color.png'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: DO & DON'TS GUIDELINE */}
                <section id="aturan-penggunaan" className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm scroll-mt-24">
                    <div className="max-w-3xl mb-8">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-3">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Integritas Brand</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Do &amp; Don'ts
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Demi menjaga reputasi, keterbacaan, dan integritas visual identitas lembaga, harap selalu mematuhi panduan hal yang dianjurkan (Do's) dan hal yang dilarang keras (Don'ts) berikut ini.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* THE DOS */}
                        <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-200 shadow-xs flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                </span>
                                <h3 className="font-extrabold text-slate-900 text-lg">Dos</h3>
                            </div>

                            <div className="bg-white p-3.5 rounded-xl border border-emerald-100 mb-4 shadow-2xs">
                                <img
                                    src="/images/logo-guideline/Guideline-Dos-Usage.png"
                                    alt="Contoh Penggunaan Logo yang Dianjurkan"
                                    className="w-full h-auto rounded-lg object-contain"
                                />
                            </div>

                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 flex-1">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Gunakan logo pada latar belakang yang memiliki kontras tinggi agar simbol dan teks terbaca jernih.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Gunakan varian <strong>Monokrom Putih</strong> jika ditempatkan di atas foto dokumentasi atau latar berwarna pekat.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Pertahankan proporsi aspek rasio asli saat memperbesar atau memperkecil ukuran berkas logo.</span>
                                </li>
                            </ul>
                        </div>

                        {/* THE DON'TS */}
                        <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200 shadow-xs flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                                    <XCircle className="w-4 h-4 stroke-[2.5]" />
                                </span>
                                <h3 className="font-extrabold text-slate-900 text-lg">Don'ts</h3>
                            </div>

                            <div className="bg-white p-3.5 rounded-xl border border-rose-100 mb-4 shadow-2xs">
                                <img
                                    src="/images/logo-guideline/Guideline-Dont-Usage.png"
                                    alt="Contoh Larangan Penggunaan Logo"
                                    className="w-full h-auto rounded-lg object-contain"
                                />
                            </div>

                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 flex-1">
                                <li className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Dilarang meregangkan atau memipihkan</strong> logo sehingga bentuk simbol atau font menjadi terdistorsi.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Dilarang mengubah atau memodifikasi warna</strong> logo di luar palet resmi yang telah ditetapkan yayasan.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Dilarang menambahkan efek visual</strong> seperti drop shadow tebal, garis tepi (*stroke*), atau bevel berlebihan.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Dilarang memutar orientasi</strong> sudut logo atau memindahkan susunan posisi simbol terhadap teks.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* SECTION 4: ZONA EKSKLUSIF & UKURAN MINIMUM */}
                <section id="zona-eksklusif" className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm scroll-mt-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-6 space-y-4">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Area Batas Aman</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Zona Eksklusif
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Zona eksklusif sangat penting agar logo dapat dibedakan dengan jelas dari teks lain, foto, atau elemen grafis di sekelilingnya. Tidak boleh ada elemen grafis lain yang masuk ke dalam batas ini.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                    <Info className="w-4 h-4 text-insani-blue" />
                                    <span>Rekomendasi Ukuran Minimum Keterbacaan:</span>
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                    <li><strong>Media Digital / Layar:</strong> Lebar minimum 120px (Logo Sekunder) dan 48px (Logo Primer).</li>
                                    <li><strong>Media Cetak / Print:</strong> Lebar minimum 25mm (Logo Sekunder) dan 15mm (Logo Primer).</li>
                                </ul>
                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                                <img
                                    src="/images/logo-guideline/Guideline-Exclusive-Zone.png"
                                    alt="Panduan Zona Eksklusif Logo"
                                    className="w-full h-auto rounded-xl object-contain bg-white p-3 border border-slate-200"
                                />
                                <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                                    Margin aman proporsional mengelilingi seluruh sisi batas luar logo
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: PALET WARNA RESMI */}
                <section id="palet-warna" className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm scroll-mt-24 space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-3">
                            <Palette className="w-3.5 h-3.5" />
                            <span>Spesifikasi Warna</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Palet Warna Resmi Insani Indonesia
                        </h2>
                        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                            Standar kode warna resmi dalam mode HEX dan RGB untuk kebutuhan antarmuka digital, serta CMYK untuk kebutuhan produksi percetakan dan merchandise.
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <img
                            src="/images/logo-guideline/Guideline-Colors.png"
                            alt="Visual Panduan Warna Logo"
                            className="w-full h-auto rounded-xl object-contain bg-white p-4 border border-slate-200"
                        />
                    </div>

                    {/* Interactive Swatches Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {colorSwatches.map((color) => (
                            <div
                                key={color.hex}
                                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                            >
                                <div>
                                    <div className={`h-16 rounded-xl ${color.bgClass} flex items-center justify-between px-3.5 mb-3 shadow-inner`}>
                                        <span className={`text-xs font-bold font-mono tracking-wider ${color.textColor}`}>
                                            {color.hex}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(color.hex, color.hex)}
                                            className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-current transition-colors cursor-pointer"
                                            title="Salin Kode HEX"
                                        >
                                            {copiedColor === color.hex ? (
                                                <Check className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 opacity-80" />
                                            )}
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm">{color.name}</h4>
                                    <span className="text-[11px] text-brand-600 font-semibold block mb-1">{color.role}</span>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{color.desc}</p>
                                </div>

                                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                    <span>RGB: {color.rgb}</span>
                                    <span>CMYK: {color.cmyk}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 6: PUSAT UNDUHAN LOGO RESMI */}
                <section id="unduh-logo" className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm scroll-mt-24 space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-3">
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Center</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Unduh Logo
                        </h2>
                        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                            Unduh aset logo resmi langsung melalui tautan Google Drive yayasan dalam tiga varian warna (Warna Asli, Monokrom Hitam, Monokrom Putih).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* KARTU UNDUHAN 1: LOGO PRIMER */}
                        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-brand-700 bg-brand-100/70 px-2.5 py-1 rounded-md">
                                        Format Vertikal
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-lg mb-2">Logo Primer Insani Indonesia</h3>
                                <p className="text-xs text-slate-600 mb-6">
                                    Cocok untuk plakat, surat resmi, sertifikat, merchandise berbentuk vertikal, dan profil sosial media.
                                </p>

                                {/* Preview Visual */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-center mb-6 min-h-[180px]">
                                    <img
                                        src="/images/logo/logo-portrait-color.png"
                                        alt="Logo Primer Insani"
                                        className="h-28 w-auto object-contain"
                                    />
                                </div>
                            </div>

                            {/* Download Buttons Group */}
                            <div className="space-y-2.5">
                                <a
                                    href={downloadLinks.primary.color}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all active:scale-98"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
                                        <span>Unduh Versi Warna</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                                </a>

                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={downloadLinks.primary.black}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                                        <span>Unduh Versi Hitam</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </a>
                                    <a
                                        href={downloadLinks.primary.white}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-white-300 border border-slate-400" />
                                        <span>Unduh Versi Putih</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </a>
                                </div>

                                <a
                                    href="/images/logo/logo-portrait-color.png"
                                    download="Logo-Insani-Indonesia-Primer.png"
                                    className="w-full text-center block text-[11px] text-insani-blue hover:underline font-medium pt-1"
                                >
                                    &darr; Unduh Cepat
                                </a>
                            </div>
                        </div>

                        {/* KARTU UNDUHAN 2: LOGO SEKUNDER */}
                        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-cyan-800 bg-cyan-100/70 px-2.5 py-1 rounded-md">
                                        Format Horizontal
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-lg mb-2">Logo Sekunder Insani Indonesia</h3>
                                <p className="text-xs text-slate-600 mb-6">
                                    Cocok untuk header website, spanduk panggung, backdrop foto bersama sponsor, lanyard, dan video bumper.
                                </p>

                                {/* Preview Visual */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-center mb-6 min-h-[180px]">
                                    <img
                                        src="/images/logo/logo-landscape-color.png"
                                        alt="Logo Sekunder Insani"
                                        className="h-12 w-auto object-contain"
                                    />
                                </div>
                            </div>

                            {/* Download Buttons Group */}
                            <div className="space-y-2.5">
                                <a
                                    href={downloadLinks.secondary.color}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all active:scale-98"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
                                        <span>Unduh Versi Warna</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                                </a>

                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={downloadLinks.secondary.black}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                                        <span>Unduh Versi Hitam</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </a>
                                    <a
                                        href={downloadLinks.secondary.white}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-white-300 border border-slate-400" />
                                        <span>Unduh Versi Putih</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </a>
                                </div>

                                <a
                                    href="/images/logo/logo-landscape-color.png"
                                    download="Logo-Insani-Indonesia-Sekunder.png"
                                    className="w-full text-center block text-[11px] text-insani-blue hover:underline font-medium pt-1"
                                >
                                    &darr; Unduh Cepat
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 7: KEBIJAKAN HAK CIPTA & NARAHUBUNG MEDIA */}
                <section className="bg-gradient-to-br from-slate-900 to-insani-darkblue text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-insani-blue/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-2.5 py-1 rounded-md mb-3 backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Ketentuan Penggunaan &amp; Lisensi Merek</span>
                        </div>
                        {/* <h2 className="text-xl sm:text-2xl font-extrabold mb-3">
                            Butuh Resolusi Khusus, Format Vector SVG/EPS, atau Izin Liputan Media?
                        </h2> */}
                        <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mb-6">
                            Logo dan merek dagang Insani Indonesia dilindungi oleh peraturan perundang-undangan Republik Indonesia. Bagi mitra korporasi CSR, jurnalis media massa, maupun lembaga penyelenggara acara amal yang membutuhkan izin tertulis atau berkas vektor khusus, silakan menghubungi tim komunikasi kami.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={`mailto:${contactEmail}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-blue-50 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <Mail className="w-4 h-4 text-insani-blue" />
                                <span>{contactEmail}</span>
                            </a>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>WhatsApp Humas</span>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
