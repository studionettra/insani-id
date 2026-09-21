import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, router, usePage } from '@inertiajs/react';
import {
    User,
    ChevronDown,
    LogIn,
    UserPlus,
    Receipt,
    HelpCircle,
    Check,
    LayoutGrid,
    Settings,
    LogOut,
    Shield,
    X,
    Sparkles,
} from 'lucide-react';
import useTranslation from '@/hooks/use-translation';

interface SupportedLocale {
    name: string;
    url: string;
}

interface PublicAccountDropdownProps {
    variant?: 'desktop' | 'mobile';
    className?: string;
}

const FLAGS: Record<string, string> = {
    id: 'https://cdn.gtranslate.net/flags/svg/id.svg',
    en: 'https://cdn.gtranslate.net/flags/svg/en.svg',
    ar: 'https://cdn.gtranslate.net/flags/svg/ar.svg',
};

export default function PublicAccountDropdown({
    variant = 'desktop',
    className = '',
}: PublicAccountDropdownProps) {
    const page = usePage<any>();
    const { auth, supportedLocales } = page.props || {};
    const currentUrl = page.url || '';
    const { t, locale: currentLang, isRtl } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user = auth?.user;
    const userAccountUrl = user ? '/dashboard' : '/login';
    const isAccountActive = Boolean(
        currentUrl === userAccountUrl ||
        (currentUrl && (
            currentUrl.startsWith('/akun') ||
            currentUrl.startsWith('/dashboard') ||
            currentUrl.startsWith('/login') ||
            currentUrl.startsWith('/register')
        ))
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on click outside or escape key
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (variant === 'desktop' && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [variant]);

    // Handle scroll lock on mobile sheet
    useEffect(() => {
        if (variant === 'mobile' && isOpen) {
            document.body.style.overflow = 'hidden';
        } else if (variant === 'mobile') {
            document.body.style.overflow = '';
        }
        return () => {
            if (variant === 'mobile') {
                document.body.style.overflow = '';
            }
        };
    }, [variant, isOpen]);

    const changeLanguage = (targetUrl: string) => {
        setIsOpen(false);
        if (targetUrl) {
            router.visit(targetUrl, {
                preserveScroll: true,
            });
        }
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('logged_out', 'true');
        }
        router.post('/logout', {}, {
            onFinish: () => {
                router.clearHistory();
                window.location.replace('/login');
            },
        });
    };

    const availableLocales: Record<string, SupportedLocale> =
        supportedLocales && Object.keys(supportedLocales).length > 0
            ? supportedLocales
            : {
                  id: { name: 'Bahasa Indonesia', url: '/id' },
                  en: { name: 'English', url: '/en' },
                  ar: { name: 'العربية', url: '/ar' },
              };

    // User initials helper
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const isAdmin = user?.roles?.some((r: any) => ['admin', 'superadmin', 'Administrator'].includes(r.name || r)) || user?.is_admin;

    // Shared Menu Content (Guest & Authenticated)
    const renderMenuContent = (isMobileSheet = false) => (
        <div className="space-y-3.5">
            {/* GUEST MODE */}
            {!user ? (
                <>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pt-1 px-1">
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100 shadow-2xs">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                                    {t('Akun')}
                                </h4>
                                <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                                    {t('Masuk untuk menyimpan riwayat donasi')}
                                </p>
                            </div>
                        </div>
                        {isMobileSheet && (
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors shrink-0"
                                aria-label="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Masuk & Daftar Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-xs hover:shadow-sm active:scale-95 transition-all duration-150"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>{t('Masuk')}</span>
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 active:scale-95 transition-all duration-150"
                        >
                            <UserPlus className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{t('Daftar')}</span>
                        </Link>
                    </div>

                    <div className="border-t border-zinc-100" />

                    {/* Public Donor Quick Links */}
                    <div className="space-y-1">
                        {!isMobileSheet && (
                            <Link
                                href="/cek-donasi"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-zinc-700 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
                            >
                                <Receipt className="w-4 h-4 text-zinc-400" />
                                <span>{t('Cek Status Donasi')}</span>
                            </Link>
                        )}
                        <Link
                            href="/pusat-bantuan"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-zinc-700 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4 text-zinc-400" />
                            <span>{t('Pusat Bantuan (FAQ)')}</span>
                        </Link>
                    </div>

                    <div className="border-t border-zinc-100" />

                    {/* Language Selection */}
                    <div className="px-1 pt-0.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                            LANGUAGE
                        </span>
                        <div className="space-y-1">
                            {Object.entries(availableLocales).map(([code, item]) => {
                                const isActive = currentLang === code;
                                return (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => changeLanguage(item.url)}
                                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                                            isActive
                                                ? 'font-semibold text-brand-700 bg-brand-50/60'
                                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <img
                                                src={FLAGS[code] || FLAGS.id}
                                                alt={code}
                                                className="w-4 h-4 rounded-xs object-cover border border-zinc-200"
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        {isActive && <Check className="w-3.5 h-3.5 text-brand-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                /* AUTHENTICATED MODE */
                <>
                    {/* Profile Header */}
                    <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-zinc-50/80 border border-zinc-100">
                        <div className="flex items-center gap-3 min-w-0">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                                    {getInitials(user.name)}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-zinc-900 truncate">
                                    {user.name}
                                </div>
                                <div className="text-[11px] text-zinc-500 truncate">
                                    {user.email}
                                </div>
                                {isAdmin && (
                                    <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 bg-amber-50 rounded border border-amber-200/60">
                                        <Shield className="w-2.5 h-2.5" /> Admin
                                    </span>
                                )}
                            </div>
                        </div>
                        {isMobileSheet && (
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors shrink-0"
                                aria-label="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* User Links */}
                    <div className="space-y-1">
                        {isAdmin ? (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-zinc-800 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
                            >
                                <LayoutGrid className="w-4 h-4 text-zinc-400" />
                                <span>{t('Panel Admin')}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-zinc-800 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
                            >
                                <LayoutGrid className="w-4 h-4 text-zinc-400" />
                                <span>{t('Dashboard Donatur')}</span>
                            </Link>
                        )}

                        <Link
                            href="/akun/fundraiser"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-zinc-800 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
                        >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>{t('Fundraiser Saya')}</span>
                        </Link>

                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-zinc-800 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-zinc-400" />
                            <span>{t('Pengaturan Akun')}</span>
                        </Link>

                        {!isMobileSheet && (
                            <Link
                                href="/cek-donasi"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-zinc-800 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
                            >
                                <Receipt className="w-4 h-4 text-zinc-400" />
                                <span>{t('Riwayat & Cek Donasi')}</span>
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-zinc-100" />

                    {/* Language Switcher Section */}
                    <div className="px-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                            LANGUAGE
                        </span>
                        <div className="space-y-0.5">
                            {Object.entries(availableLocales).map(([code, item]) => {
                                const isActive = currentLang === code;
                                return (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => changeLanguage(item.url)}
                                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                                            isActive
                                                ? 'font-semibold text-brand-700 bg-brand-50/60'
                                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <img
                                                src={FLAGS[code] || FLAGS.id}
                                                alt={code}
                                                className="w-4 h-4 rounded-xs object-cover border border-zinc-200"
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        {isActive && <Check className="w-3.5 h-3.5 text-brand-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t border-zinc-100" />

                    {/* Logout Action */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{t('Keluar (Log out)')}</span>
                    </button>
                </>
            )}
        </div>
    );

    // ==========================================
    // MOBILE BOTTOM NAV VARIANT
    // ==========================================
    if (variant === 'mobile') {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex flex-col items-center justify-center w-16 transition-all duration-200 active:scale-90 ${
                        isOpen || isAccountActive ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-800'
                    } ${className}`}
                    aria-label={t('Akun')}
                >
                    <div
                        className={`p-1.5 rounded-full transition-colors ${
                            isOpen || isAccountActive ? 'bg-brand-50' : 'bg-transparent'
                        }`}
                    >
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-[22px] h-[22px] rounded-full object-cover border border-brand-200"
                            />
                        ) : (
                            <User
                                className="w-[22px] h-[22px]"
                                strokeWidth={isOpen || isAccountActive ? 2.5 : 2}
                            />
                        )}
                    </div>
                    <span className="text-[10px] font-medium mt-0.5">{t('Akun')}</span>
                </button>

                {/* Mobile Bottom Sheet Drawer (Portaled to document.body) */}
                {isOpen && mounted && typeof document !== 'undefined' && createPortal(
                    <div
                        className="fixed inset-0 z-[999998] bg-zinc-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in-0 duration-200"
                        onClick={() => setIsOpen(false)}
                        dir={isRtl ? 'rtl' : 'ltr'}
                    >
                        <div
                            className="w-full bg-white rounded-t-3xl p-5 shadow-2xl border-t border-zinc-200/90 pb-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drag Indicator Handle */}
                            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-4" />

                            {renderMenuContent(true)}
                        </div>
                    </div>,
                    document.body
                )}
            </>
        );
    }

    // ==========================================
    // DESKTOP NAVBAR VARIANT
    // ==========================================
    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            {/* Navbar Pill Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-2 rounded-full border px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    isOpen
                        ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-xs'
                        : 'border-zinc-200/90 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 shadow-2xs'
                }`}
                aria-expanded={isOpen}
                aria-label={t('Menu Akun')}
            >
                {user ? (
                    <div className="flex items-center gap-2">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-5 h-5 rounded-full object-cover border border-zinc-200"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <span className="font-semibold text-zinc-900 max-w-[100px] sm:max-w-[130px] truncate">
                            {user.name?.split(' ')[0]}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-zinc-500 group-hover:text-brand-600 transition-colors" />
                        <span className="text-zinc-800 font-medium">{t('Akun')}</span>
                    </div>
                )}
                <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-600' : 'group-hover:text-zinc-600'
                    }`}
                />
            </button>

            {/* Expand Popover Card */}
            {isOpen && (
                <div
                    className="absolute ltr:right-0 rtl:left-0 end-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white/98 backdrop-blur-xl shadow-2xl border border-zinc-200/90 py-3 px-3.5 z-[9999] origin-top-right animate-in fade-in-0 zoom-in-95 duration-150"
                    dir={isRtl ? 'rtl' : 'ltr'}
                >
                    {renderMenuContent(false)}
                </div>
            )}
        </div>
    );
}
