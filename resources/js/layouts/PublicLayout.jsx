import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Home, Heart, PlusCircle, User } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/theme-toggle';
export default function PublicLayout({ children, title }) {
    const { locale } = usePage().props;
    const { url } = usePage();
    const isRtl = locale === 'ar';
    const isActive = (path) => path === '/' ? url === '/' : url.startsWith(path);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-outfit" dir={isRtl ? 'rtl' : 'ltr'}>
            <Head>
                <title>{title ? `${title} - Insani Indonesia` : 'Insani Indonesia'}</title>
                <meta name="description" content="Platform Galang Dana Insani Indonesia" />
            </Head>

            {/* Header (Desktop & Mobile) */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2 group">
                                <img
                                    src="/images/logo/logo-landscape-color.png"
                                    alt="Insani Indonesia Logo"
                                    className="h-20 md:h-20 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        // Fallback if logo not found
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <span className="hidden text-xl font-bold text-insani-darkblue">
                                    Insani.id
                                </span>
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-2 rtl:space-x-reverse text-sm lg:text-base font-medium">
                            <Link href="/" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>Beranda</Link>
                            <Link href="/tentang-kami" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/tentang-kami') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>Tentang Kami</Link>
                            <Link href="/fokus-program" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/fokus-program') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>Fokus Program</Link>
                            <Link href="/program" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/program') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>Donasi</Link>
                            <Link href="/berita" className={`px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/berita') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>Berita</Link>
                            <Link href="/buat-program" className={`hidden lg:block px-4 py-2 rounded-full transition-all active:scale-95 ${isActive('/buat-program') ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}`}>Galang Dana</Link>
                        </nav>
                        
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="hidden sm:block">
                                <LanguageSwitcher />
                            </div>
                            <ThemeToggle />
                            <Link href="/login" className="hidden md:inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 hover:shadow-md transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                                Masuk
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col w-full mx-auto pb-20 md:pb-0">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative bg-insani-darkblue text-white mt-auto overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-insani-blue/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-insani-blue/10 rounded-l-full blur-3xl transform translate-x-1/2 opacity-50"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
                        {/* Kolom 1: Logo & Profil Singkat */}
                        <div className="col-span-1 md:col-span-12 lg:col-span-4">
                            <Link href="/" className="inline-block mb-2">
                                <img 
                                    src="/images/logo/logo-landscape-white.png" 
                                    alt="Insani Indonesia" 
                                    className="h-25 w-auto object-contain hover:opacity-90 transition-opacity"
                                />
                            </Link>
                            <p className="text-blue-100 text-sm leading-relaxed max-w-sm mb-8">
                                Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan universal.
                            </p>
                            
                            {/* Social Media Icons */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* WhatsApp */}
                                <a href="https://api.whatsapp.com/send/?phone=6281319456675&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-110">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.613 5.613 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </a>
                                {/* Facebook */}
                                <a href="https://www.facebook.com/insaniindonesia" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:scale-110">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                {/* Instagram */}
                                <a href="https://www.instagram.com/insaniindonesia" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all duration-300 hover:scale-110">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                </a>
                                {/* Threads */}
                                <a href="https://www.threads.com/@insaniindonesia" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2.022 18.293c-2.735 0-4.831-1.642-4.831-4.707 0-3.13 2.184-4.856 5.067-4.856 2.001 0 3.395.845 3.967 2.148h-1.696c-.347-.638-1.12-1.026-2.128-1.026-1.666 0-3.081 1.054-3.081 3.528 0 2.378 1.4 3.42 2.956 3.42 1.83 0 3.037-1.166 3.037-3.238v-2.92h-3.328v-1.424h4.945v5.338c0 1.042-.324 1.847-.96 2.385-.644.545-1.584.825-2.787.825zm4.847-5.111v-.158h-3.693v.098c0 1.258.85 2.126 2.176 2.126.966 0 1.631-.418 1.956-1.155h1.564c-.456 1.488-1.782 2.388-3.563 2.388-2.226 0-3.864-1.536-3.864-3.666 0-2.164 1.547-3.714 3.738-3.714 2.144 0 3.585 1.492 3.585 3.57v.511h-1.899zM12 9.47c-.94 0-1.716.638-1.836 1.624h3.655c-.13-1.025-.916-1.624-1.819-1.624z"/></svg>
                                </a>
                                {/* X (Twitter) */}
                                <a href="https://x.com/officialinsani" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 hover:scale-110">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                                </a>
                                {/* YouTube */}
                                <a href="https://www.youtube.com/@insaniindonesia" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all duration-300 hover:scale-110">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* Kolom 2: Tautan Perusahaan */}
                        <div className="col-span-1 md:col-span-4 lg:col-span-2 lg:col-start-6">
                            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm uppercase">Perusahaan</h3>
                            <ul className="space-y-3 text-sm text-blue-100">
                                <li>
                                    <Link href="/tentang-kami" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Tentang Kami
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/fokus-program" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Fokus Program
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/berita" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Berita & Kabar
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kontak" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Hubungi Kami
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Kolom 3: Tautan Bantuan */}
                        <div className="col-span-1 md:col-span-4 lg:col-span-2">
                            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm uppercase">Bantuan</h3>
                            <ul className="space-y-3 text-sm text-blue-100">
                                <li>
                                    <Link href="/faq" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Pusat Bantuan (FAQ)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/syarat-ketentuan" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Syarat & Ketentuan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kebijakan-privasi" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Kebijakan Privasi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cara-donasi" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                                        Cara Berdonasi
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Kolom 4: QRIS Donasi */}
                        <div className="col-span-1 md:col-span-4 lg:col-span-3 lg:col-start-10">
                            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm uppercase">Donasi Cepat QRIS</h3>
                            <div className="bg-white p-3 rounded-2xl shadow-xl inline-block hover:scale-105 transition-transform duration-300">
                                <img 
                                    src="/images/qris/logo-qris-insani.webp" 
                                    alt="QRIS Donasi Yayasan Peduli Insani Indonesia" 
                                    className="w-48 h-auto rounded-lg"
                                />
                            </div>
                            <p className="text-blue-100 text-xs mt-4 leading-relaxed max-w-[200px]">
                                Scan QRIS untuk berdonasi langsung ke rekening resmi Yayasan Peduli Insani Indonesia.
                            </p>
                        </div>
                    </div>
                    
                    {/* Copyright & Bottom Bar */}
                    <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-blue-100/60 text-sm text-center md:text-left">
                            &copy; {new Date().getFullYear()} Yayasan Peduli Insani Indonesia. Hak cipta dilindungi.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Bottom Navigation (Mobile Only) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200/60 z-50 flex justify-around py-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <Link href="/" className={`flex flex-col items-center justify-center w-16 transition-all duration-200 active:scale-90 ${isActive('/') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive('/') ? 'bg-brand-50' : 'bg-transparent'}`}>
                        <Home className="w-[22px] h-[22px]" strokeWidth={isActive('/') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">Beranda</span>
                </Link>
                <Link href="/program" className={`flex flex-col items-center justify-center w-16 transition-all duration-200 active:scale-90 ${isActive('/program') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive('/program') ? 'bg-brand-50' : 'bg-transparent'}`}>
                        <Heart className="w-[22px] h-[22px]" strokeWidth={isActive('/program') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">Donasi</span>
                </Link>
                <Link href="/buat-program" className={`flex flex-col items-center justify-center w-16 transition-all duration-200 active:scale-90 ${isActive('/buat-program') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive('/buat-program') ? 'bg-brand-50' : 'bg-transparent'}`}>
                        <PlusCircle className="w-[22px] h-[22px]" strokeWidth={isActive('/buat-program') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">Galang</span>
                </Link>
                <Link href="/login" className={`flex flex-col items-center justify-center w-16 transition-all duration-200 active:scale-90 ${isActive('/login') || isActive('/akun') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive('/login') || isActive('/akun') ? 'bg-brand-50' : 'bg-transparent'}`}>
                        <User className="w-[22px] h-[22px]" strokeWidth={isActive('/login') || isActive('/akun') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">Akun</span>
                </Link>
            </nav>
        </div>
    );
}
