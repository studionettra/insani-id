import React, { useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Home, Heart, PlusCircle, User, Compass, HandHeart, MapPin, Phone, Mail, Clock, ShieldCheck, QrCode, Megaphone } from 'lucide-react';
import PublicSearchDialog from '@/components/public/PublicSearchDialog';
import PublicAccountDropdown from '@/components/public/PublicAccountDropdown';
import { FlashMessages } from '@/components/flash-messages';
import useTranslation from '@/hooks/use-translation';

export default function PublicLayout({ children, title = '', hideFooter = false, hideMobileNav = false, hideTopNav = false }) {
    const { auth, siteSettings } = usePage().props;
    const { t, locale, isRtl } = useTranslation();
    const { url } = usePage();
    const isActive = (path) => path === '/' ? url === '/' : url.startsWith(path);

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    }, []);

    const userAccountUrl = auth?.user ? '/dashboard' : '/login';

    const pageTitle = title ? `${title} - Insani Indonesia` : 'Insani Indonesia - Platform Galang Dana dan Donasi Online';
    const pageDescription = 'Platform Galang Dana dan Donasi Online Insani Indonesia. Bersama menebar kebaikan dan kepedulian.';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://insani.id';
    const logoUrl = siteSettings?.site_logo 
        ? (typeof window !== 'undefined' ? `${window.location.origin}/storage/${siteSettings.site_logo}` : `https://insani.id/storage/${siteSettings.site_logo}`) 
        : (typeof window !== 'undefined' ? `${window.location.origin}/images/logo/logo-landscape-color.png` : 'https://insani.id/images/logo/logo-landscape-color.png');

    const getWhatsAppUrl = () => {
        const raw = siteSettings?.contact_whatsapp;
        if (!raw) return "https://api.whatsapp.com/send/?phone=6281319456675&text&type=phone_number&app_absent=0";
        if (raw.startsWith('http')) return raw;
        let clean = raw.replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.slice(1);
        return `https://wa.me/${clean}`;
    };

    const footerDescription = siteSettings?.footer_description || "Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan universal.";
    const facebookUrl = siteSettings?.social_facebook || "https://www.facebook.com/insaniindonesia";
    const instagramUrl = siteSettings?.social_instagram || "https://www.instagram.com/insaniindonesia";
    const threadsUrl = siteSettings?.social_threads || "https://www.threads.com/@insaniindonesia";
    const xUrl = siteSettings?.social_x || "https://x.com/officialinsani";
    const youtubeUrl = siteSettings?.social_youtube || "https://www.youtube.com/@insaniindonesia";
    const qrisImageUrl = siteSettings?.qris_image ? `/storage/${siteSettings.qris_image}` : "/images/qris/logo-qris-insani.webp";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-outfit" dir={isRtl ? 'rtl' : 'ltr'}>
            <FlashMessages />
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={logoUrl} />
                <meta property="og:site_name" content="Insani Indonesia" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={logoUrl} />
            </Head>

            {/* Global Announcement Bar */}
            {siteSettings?.announcement_enabled === '1' && siteSettings?.announcement_text && (
                <div 
                    className="text-white text-xs sm:text-sm font-medium py-2 px-4 text-center transition-all print:hidden relative z-[101] shadow-xs"
                    style={{ backgroundColor: siteSettings?.announcement_bg_color || '#0284c7' }}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                        <span className="flex h-2 w-2 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <Megaphone className="w-4 h-4 shrink-0 opacity-90 hidden sm:inline-block" />
                        <span className="truncate sm:overflow-visible">{siteSettings.announcement_text}</span>
                        {siteSettings?.announcement_link && (
                            <Link 
                                href={siteSettings.announcement_link}
                                className="underline font-bold hover:opacity-85 inline-flex items-center gap-1 shrink-0 ml-1 text-white"
                            >
                                {t('Lihat Detail')} &rarr;
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Header (Desktop & Mobile) */}
            {!hideTopNav && (
            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm transition-all duration-300 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2 group">
                                <img
                                    src={siteSettings?.site_logo ? `/storage/${siteSettings.site_logo}` : "/images/logo/logo-landscape-color.png"}
                                    alt="Insani Indonesia Logo"
                                    className="h-10 md:h-12 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        // Fallback if logo not found
                                        e.target.src = "/images/logo/logo-landscape-color.png";
                                    }}
                                />
                                <span className="hidden text-xl font-bold text-insani-darkblue">
                                    Insani.id
                                </span>
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse text-sm lg:text-base font-medium">
                            <Link href="/" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>{t('Beranda')}</Link>
                            <Link href="/tentang-kami" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/tentang-kami') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>{t('Tentang Kami')}</Link>
                            <Link href="/fokus-program" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/fokus-program') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>{t('Fokus Program')}</Link>
                            <Link href="/kontak" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/kontak') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>{t('Kontak')}</Link>
                            <Link href="/berita" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/berita') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>{t('Berita')}</Link>
                        </nav>
                        
                        <div className="flex items-center gap-2 sm:gap-2.5 rtl:space-x-reverse">
                            <PublicSearchDialog />
                            <div className="hidden md:block">
                                <PublicAccountDropdown variant="desktop" />
                            </div>
                            <div className="hidden md:block">
                                <Link
                                    href="/program"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-brand-600 via-emerald-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 shadow-sm hover:shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-200 active:scale-95 border border-emerald-400/30"
                                >
                                    <Heart className="w-4 h-4 fill-white" />
                                    <span>{t('Donasi Sekarang')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col w-full mx-auto pb-20 md:pb-0">
                {children}
            </main>

            {/* Footer */}
            {!hideFooter && (
            <footer className="relative bg-gradient-to-b from-[#0B1528] via-insani-darkblue to-slate-950 text-white mt-auto overflow-hidden print:hidden border-t border-slate-800/80">
                {/* Background ambient glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 md:py-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
                        {/* Kolom 1: Profil Lembaga & Kontak (lg:col-span-4) */}
                        <div className="lg:col-span-4 space-y-5">
                            <Link href="/" className="inline-block">
                                <img 
                                    src={siteSettings?.site_logo_white ? `/storage/${siteSettings.site_logo_white}` : (siteSettings?.site_logo ? `/storage/${siteSettings.site_logo}` : "/images/logo/logo-landscape-white.png")} 
                                    alt="Insani Indonesia" 
                                    className="h-12 md:h-14 w-auto object-contain hover:opacity-95 transition-opacity"
                                    onError={(e) => {
                                        e.target.src = "/images/logo/logo-landscape-white.png";
                                    }}
                                />
                            </Link>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
                                {footerDescription}
                            </p>
                            
                            {/* Alamat & Kontak Resmi */}
                            <div className="space-y-2.5 text-xs text-slate-300 pt-1">
                                <div className="flex items-start gap-2.5">
                                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">
                                        {siteSettings?.contact_address || "Jl. Kebaikan No. 1, Jakarta Selatan, DKI Jakarta"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <span>{siteSettings?.contact_phone || "(021) 27871199"}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <a href={`mailto:${siteSettings?.contact_email || "sapa@insani.id"}`} className="hover:text-cyan-300 transition-colors">
                                        {siteSettings?.contact_email || "sapa@insani.id"}
                                    </a>
                                </div>
                            </div>

                            {/* Social Media Icons */}
                            <div className="pt-2">
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    {t('Kanal Resmi Kami')}
                                </span>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {/* WhatsApp */}
                                    <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.613 5.613 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    </a>
                                    {/* Facebook */}
                                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-200 hover:-translate-y-0.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                    {/* Instagram */}
                                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all duration-200 hover:-translate-y-0.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    </a>
                                    {/* Threads */}
                                    <a href={threadsUrl} target="_blank" rel="noopener noreferrer" aria-label="Threads" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-200 hover:-translate-y-0.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098c1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>
                                    </a>
                                    {/* X (Twitter) */}
                                    <a href={xUrl} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-200 hover:-translate-y-0.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                                    </a>
                                    {/* YouTube */}
                                    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all duration-200 hover:-translate-y-0.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Kolom 2: Program & Kebaikan (lg:col-span-3) */}
                        <div className="lg:col-span-3 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                                <Heart className="w-3.5 h-3.5" />
                                <span>{t('Program & Kebaikan')}</span>
                            </h3>
                            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                                <li>
                                    <Link href="/program" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Katalog Program Donasi')}</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/fokus-program" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Fokus & Pilar Garapan')}</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/buat-program" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Daftar Jadi Campaigner')}</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pusat-bantuan" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Program Relawan Fundraiser')}</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/berita" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Kabar Penyaluran & Berita')}</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Kolom 3: Layanan Donatur (lg:col-span-2) */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                                <Compass className="w-3.5 h-3.5" />
                                <span>{t('Layanan Donatur')}</span>
                            </h3>
                            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                                <li>
                                    <Link href="/cek-donasi" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Cek Status Donasi')}</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cara-donasi" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Panduan Cara Donasi')}</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pusat-bantuan" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Pusat Bantuan & FAQ')}</span>
                                    </Link>
                                </li>
                                <li>
                                    <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Konfirmasi Transfer Manual')}</span>
                                    </a>
                                </li>
                                <li>
                                    <Link href="/kontak" className="hover:text-cyan-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                                        <span>{t('Hubungi Layanan CS')}</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Kolom 4: QRIS Cepat & Kebijakan (lg:col-span-3) */}
                        <div className="lg:col-span-3 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                                <QrCode className="w-3.5 h-3.5" />
                                <span>{t('Donasi Cepat QRIS')}</span>
                            </h3>
                            
                            {/* QRIS Card with modern styling */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl shadow-xl inline-block max-w-[220px]">
                                <div className="bg-white p-2 rounded-xl">
                                    <img 
                                        src={qrisImageUrl} 
                                        alt="QRIS Donasi Yayasan Peduli Insani Indonesia" 
                                        className="w-full h-auto rounded-lg"
                                    />
                                </div>
                                <p className="text-slate-300 text-[11px] mt-2.5 leading-snug text-center font-medium">
                                    {t('Scan via GoPay, OVO, BCA, BSI, Mandiri & E-Wallet')}
                                </p>
                            </div>

                            {/* Legal compliance links */}
                            <div className="pt-1 flex flex-col space-y-1.5 text-xs text-slate-400">
                                <Link href="/syarat-ketentuan" className="hover:text-cyan-300 transition-colors">
                                    &bull; {t('Syarat & Ketentuan')}
                                </Link>
                                <Link href="/kebijakan-privasi" className="hover:text-cyan-300 transition-colors">
                                    &bull; {t('Kebijakan Privasi')}
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Bar: Copyright & SK Kemenkumham */}
                    <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
                        <p className="text-center sm:text-left">
                            &copy; {new Date().getFullYear()} {siteSettings?.legal_foundation_name || t('Yayasan Peduli Insani Indonesia')}. {t('Hak cipta dilindungi.')}
                        </p>
                        {siteSettings?.show_sk_in_footer !== '0' && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span>
                                    {siteSettings?.legal_sk_label || 'SK Kemenkumham RI'}: <strong>{siteSettings?.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.Tahun 2019'}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </footer>
            )}

            {/* Bottom Navigation (Mobile Only) with Floating Center Button */}
            {!hideMobileNav && (
            <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-200/60 z-50 flex items-center justify-around py-1.5 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)] print:hidden">
                {/* 1. Beranda */}
                <Link href="/" className={`flex flex-col items-center justify-center w-14 transition-all duration-200 active:scale-90 ${isActive('/') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive('/') ? 'bg-brand-50' : 'bg-transparent'}`}>
                        <Home className="w-5 h-5" strokeWidth={isActive('/') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">{t('Beranda')}</span>
                </Link>

                {/* 2. Fokus Program */}
                <Link href="/fokus-program" className={`flex flex-col items-center justify-center w-14 transition-all duration-200 active:scale-90 ${isActive('/fokus-program') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive('/fokus-program') ? 'bg-brand-50' : 'bg-transparent'}`}>
                        <Compass className="w-5 h-5" strokeWidth={isActive('/fokus-program') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">{t('Fokus')}</span>
                </Link>

                {/* 3. Floating Center Action: DONASI */}
                <Link
                    href="/program"
                    className="relative -top-4 flex flex-col items-center group active:scale-90 transition-transform duration-200"
                    aria-label={t('Donasi Sekarang')}
                >
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-brand-600 via-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/35 border-4 border-white group-hover:scale-105 transition-transform">
                        <Heart className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-[10px] font-bold text-brand-700 mt-0.5 tracking-tight">
                        {t('Donasi')}
                    </span>
                </Link>

                {/* 4. Cek Status Donasi */}
                <Link href="/cek-donasi" className={`flex flex-col items-center justify-center w-14 transition-all duration-200 active:scale-90 ${isActive('/cek-donasi') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive('/cek-donasi') ? 'bg-brand-50' : 'bg-transparent'}`}>
                        <HandHeart className="w-5 h-5" strokeWidth={isActive('/cek-donasi') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">{t('Cek Donasi')}</span>
                </Link>

                {/* 5. Akun (Bottom Sheet Drawer) */}
                <PublicAccountDropdown variant="mobile" />
            </nav>
            )}
        </div>
    );
}
