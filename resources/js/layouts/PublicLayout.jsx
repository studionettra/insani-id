import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/theme-toggle';
export default function PublicLayout({ children, title }) {
    const { locale } = usePage().props;
    const isRtl = locale === 'ar';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-outfit" dir={isRtl ? 'rtl' : 'ltr'}>
            <Head>
                <title>{title ? `${title} - Insani Indonesia` : 'Insani Indonesia'}</title>
                <meta name="description" content="Platform Galang Dana Insani Indonesia" />
            </Head>

            {/* Header (Desktop & Mobile) */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-theme-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/">
                                <img
                                    src="/images/logo-landscape-color.png"
                                    alt="Insani Indonesia Logo"
                                    className="h-8 w-auto"
                                    onError={(e) => {
                                        // Fallback if logo not found
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <span className="hidden text-xl font-bold text-insani-darkblue mx-2">
                                    Insani.id
                                </span>
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse text-sm lg:text-base">
                            <Link href="/" className="text-gray-600 hover:text-insani-blue font-medium">Beranda</Link>
                            <Link href="/tentang-kami" className="text-gray-600 hover:text-insani-blue font-medium">Tentang Kami</Link>
                            <Link href="/fokus-program" className="text-gray-600 hover:text-insani-blue font-medium">Fokus Program</Link>
                            <Link href="/program" className="text-gray-600 hover:text-insani-blue font-medium">Donasi</Link>
                            <Link href="/berita" className="text-gray-600 hover:text-insani-blue font-medium">Berita</Link>
                            <Link href="/buat-program" className="text-gray-600 hover:text-insani-blue font-medium hidden lg:block">Galang Dana</Link>
                        </nav>
                        
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className="hidden sm:block">
                                    <LanguageSwitcher />
                                </div>
                                <ThemeToggle />
                                <Link href="/login" className="hidden md:block text-insani-blue bg-insani-blue/10 px-4 py-2 rounded-full font-medium hover:bg-insani-blue/20 transition">
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
            <footer className="bg-white border-t border-gray-200 mt-auto pb-16 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <Link href="/">
                                <span className="text-2xl font-bold text-insani-darkblue">Insani.id</span>
                            </Link>
                            <p className="mt-4 text-gray-500 text-sm max-w-sm">
                                Platform urun dana (crowdfunding) terpercaya untuk membantu mewujudkan program-program kebaikan bersama Insani Indonesia.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Perusahaan</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/tentang-kami" className="hover:text-insani-blue">Tentang Kami</Link></li>
                                <li><Link href="/fokus-program" className="hover:text-insani-blue">Fokus Program</Link></li>
                                <li><Link href="/berita" className="hover:text-insani-blue">Berita & Kabar</Link></li>
                                <li><Link href="/kontak" className="hover:text-insani-blue">Hubungi Kami</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Sosial Media</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-insani-blue">Instagram</a></li>
                                <li><a href="#" className="hover:text-insani-blue">Facebook</a></li>
                                <li><a href="#" className="hover:text-insani-blue">Twitter / X</a></li>
                                <li><a href="#" className="hover:text-insani-blue">WhatsApp</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} Insani Indonesia. Hak cipta dilindungi.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Bottom Navigation (Mobile Only) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around py-3 pb-safe">
                <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-insani-turquoise focus:text-insani-turquoise">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    <span className="text-[10px] font-medium">Beranda</span>
                </Link>
                <Link href="/program" className="flex flex-col items-center text-gray-500 hover:text-insani-turquoise focus:text-insani-turquoise">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <span className="text-[10px] font-medium">Donasi</span>
                </Link>
                <Link href="/buat-program" className="flex flex-col items-center text-gray-500 hover:text-insani-turquoise focus:text-insani-turquoise">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span className="text-[10px] font-medium">Galang Dana</span>
                </Link>
                <Link href="/login" className="flex flex-col items-center text-gray-500 hover:text-insani-turquoise focus:text-insani-turquoise">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span className="text-[10px] font-medium">Akun</span>
                </Link>
            </nav>
        </div>
    );
}
