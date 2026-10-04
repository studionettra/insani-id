import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, router } from '@inertiajs/react';
import { 
    Search, 
    X, 
    Compass, 
    Heart, 
    Newspaper, 
    ArrowRight, 
    TrendingUp, 
    Loader2, 
    SearchX,
    HelpCircle,
    Palette,
    Phone,
    FileText,
    CreditCard,
    Receipt,
    Building2,
    ShieldCheck,
    Rocket,
    Users
} from 'lucide-react';
import useTranslation from '@/hooks/use-translation';

interface ProgramResult {
    id: number;
    title: string;
    slug: string;
    cover_image?: string | null;
    collected_amount: number;
    target_amount: number;
    percentage: number;
    category_name?: string | null;
    url: string;
}

interface FocusProgramResult {
    id: number;
    name: string;
    slug: string;
    pillar_image?: string | null;
    url: string;
}

interface BlogResult {
    id: number;
    title: string;
    slug: string;
    featured_image_url?: string | null;
    published_at?: string | null;
    url: string;
}

interface PageResult {
    id: number;
    title: string;
    slug: string;
    meta_description?: string | null;
    badge?: string | null;
    url: string;
}

interface FaqResult {
    id: number | string;
    question: string;
    category?: string | null;
    url: string;
}

interface SearchResponse {
    programs: ProgramResult[];
    focusPrograms: FocusProgramResult[];
    blogs: BlogResult[];
    pages: PageResult[];
    faqs: FaqResult[];
}

const POPULAR_TAGS = [
    { label: 'Bantuan Pangan', icon: '🌾' },
    { label: 'Air Bersih', icon: '💧' },
    { label: 'Yatim & Dhuafa', icon: '👶' },
    { label: 'Kesehatan', icon: '🏥' },
    { label: 'Pendidikan', icon: '📚' },
    { label: 'Panduan Logo', icon: '🎨' },
    { label: 'Cara Donasi', icon: '💳' },
    { label: 'Sedekah Subuh', icon: '✨' },
];

const getPageIcon = (slug: string) => {
    switch (slug) {
        case 'logo':
            return <Palette className="w-4 h-4 text-purple-600" />;
        case 'kontak':
            return <Phone className="w-4 h-4 text-blue-600" />;
        case 'cara-donasi':
            return <CreditCard className="w-4 h-4 text-emerald-600" />;
        case 'cek-donasi':
            return <Receipt className="w-4 h-4 text-amber-600" />;
        case 'pusat-bantuan':
            return <HelpCircle className="w-4 h-4 text-teal-600" />;
        case 'laporan-keuangan':
            return <FileText className="w-4 h-4 text-sky-600" />;
        case 'tentang-kami':
            return <Building2 className="w-4 h-4 text-slate-600" />;
        case 'syarat-ketentuan':
        case 'kebijakan-privasi':
            return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
        case 'buat-program':
            return <Rocket className="w-4 h-4 text-rose-600" />;
        case 'fundraiser':
            return <Users className="w-4 h-4 text-orange-600" />;
        default:
            return <Compass className="w-4 h-4 text-indigo-600" />;
    }
};

const getPageIconBg = (slug: string) => {
    switch (slug) {
        case 'logo':
            return 'bg-purple-50';
        case 'kontak':
            return 'bg-blue-50';
        case 'cara-donasi':
            return 'bg-emerald-50';
        case 'cek-donasi':
            return 'bg-amber-50';
        case 'pusat-bantuan':
            return 'bg-teal-50';
        case 'laporan-keuangan':
            return 'bg-sky-50';
        case 'tentang-kami':
            return 'bg-slate-100';
        case 'syarat-ketentuan':
        case 'kebijakan-privasi':
            return 'bg-indigo-50';
        case 'buat-program':
            return 'bg-rose-50';
        case 'fundraiser':
            return 'bg-orange-50';
        default:
            return 'bg-indigo-50';
    }
};

export default function PublicSearchDialog() {
    const { t, isRtl } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [results, setResults] = useState<SearchResponse>({
        programs: [],
        focusPrograms: [],
        blogs: [],
        pages: [],
        faqs: [],
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Keyboard shortcut to open dialog: Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input on open and lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults({ programs: [], focusPrograms: [], blogs: [], pages: [], faqs: [] });
            setIsLoading(false);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const performSearch = useCallback(async (keyword: string) => {
        if (keyword.trim().length < 2) {
            setResults({ programs: [], focusPrograms: [], blogs: [], pages: [], faqs: [] });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/public/search?q=${encodeURIComponent(keyword.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setResults({
                    programs: data.programs || [],
                    focusPrograms: data.focusPrograms || [],
                    blogs: data.blogs || [],
                    pages: data.pages || [],
                    faqs: data.faqs || [],
                });
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            performSearch(val);
        }, 250);
    };

    const handleSelectTag = (tag: string) => {
        setQuery(tag);
        performSearch(tag);
        inputRef.current?.focus();
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const totalResults = results.programs.length + results.focusPrograms.length + results.blogs.length + results.pages.length + (results.faqs?.length || 0);
    const hasSearched = query.trim().length >= 2;

    return (
        <>
            {/* Trigger Button on Navbar - Compact Icon Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-600 hover:text-brand-600 hover:bg-zinc-100 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                aria-label={t('Cari program, topik atau berita')}
                title={`${t('Cari')} (Ctrl+K)`}
            >
                <Search className="w-5 h-5 transition-transform hover:scale-110" />
            </button>

            {/* Modal Backdrop & Dialog (Portaled to document.body) */}
            {isOpen && mounted && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[999999] overflow-y-auto bg-zinc-950/60 backdrop-blur-md p-3 sm:p-6 md:p-16 flex justify-center items-start animate-in fade-in-0 duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleClose();
                    }}
                    dir={isRtl ? 'rtl' : 'ltr'}
                >
                    <div
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-zinc-200/80 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Search Input Bar */}
                        <div className="relative flex items-center border-b border-zinc-100 px-4 sm:px-5 py-3.5 bg-zinc-50/50">
                            <Search className="w-5 h-5 text-brand-600 shrink-0 mr-3 rtl:mr-0 rtl:ml-3" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={handleQueryChange}
                                placeholder={t('Cari program donasi, fokus program, atau berita...')}
                                className="w-full bg-transparent text-sm sm:text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                            />
                            {isLoading && (
                                <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0 mx-2" />
                            )}
                            {query && !isLoading && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setResults({ programs: [], focusPrograms: [], blogs: [] });
                                        inputRef.current?.focus();
                                    }}
                                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors mx-1"
                                    aria-label={t('Hapus teks')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleClose}
                                className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-400 bg-white border border-zinc-200 hover:text-zinc-700 transition-colors shadow-2xs ml-2 rtl:ml-0 rtl:mr-2"
                            >
                                ESC
                            </button>
                        </div>

                        {/* Search Body Content */}
                        <div className="overflow-y-auto p-4 sm:p-5 space-y-6 flex-1 min-h-[160px]">
                            {/* Empty Query State: Popular Tags & Quick Discovery */}
                            {!hasSearched && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <TrendingUp className="w-4 h-4 text-amber-500" />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                                {t('Topik Pencarian Populer')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {POPULAR_TAGS.map((tag) => (
                                                <button
                                                    key={tag.label}
                                                    type="button"
                                                    onClick={() => handleSelectTag(tag.label)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-transparent text-zinc-700 transition-all active:scale-95"
                                                >
                                                    <span>{tag.icon}</span>
                                                    <span>{tag.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-zinc-100">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                                            {t('Tautan Cepat')}
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <Link
                                                href="/program"
                                                onClick={handleClose}
                                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/40 text-zinc-800 transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                        <Heart className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-emerald-700">
                                                            {t('Katalog Donasi')}
                                                        </div>
                                                        <div className="text-[11px] text-zinc-400">
                                                            {t('Semua program aktif')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-transform" />
                                            </Link>

                                            <Link
                                                href="/fokus-program"
                                                onClick={handleClose}
                                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/40 text-zinc-800 transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                                        <Compass className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-blue-700">
                                                            {t('Fokus Program')}
                                                        </div>
                                                        <div className="text-[11px] text-zinc-400">
                                                            {t('Fokus program utama')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-transform" />
                                            </Link>

                                            <Link
                                                href="/pusat-bantuan"
                                                onClick={handleClose}
                                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-teal-200 hover:bg-teal-50/40 text-zinc-800 transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                                        <HelpCircle className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-teal-700">
                                                            {t('Pusat Bantuan & FAQ')}
                                                        </div>
                                                        <div className="text-[11px] text-zinc-400">
                                                            {t('Panduan donatur & narahubung')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-teal-600 transition-transform" />
                                            </Link>

                                            <Link
                                                href="/logo"
                                                onClick={handleClose}
                                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-purple-200 hover:bg-purple-50/40 text-zinc-800 transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                                        <Palette className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-purple-700">
                                                            {t('Panduan Logo Resmi')}
                                                        </div>
                                                        <div className="text-[11px] text-zinc-400">
                                                            {t('Identitas brand & aset unduh')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loading Skeletons */}
                            {isLoading && (
                                <div className="space-y-3 py-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/80 animate-pulse">
                                            <div className="w-14 h-14 rounded-lg bg-zinc-200 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 bg-zinc-200 rounded w-2/3" />
                                                <div className="h-2.5 bg-zinc-200 rounded w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Results: Has query and finished loading */}
                            {hasSearched && !isLoading && (
                                <>
                                    {totalResults === 0 ? (
                                        <div className="text-center py-10 px-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                                                <SearchX className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-zinc-900 mb-1">
                                                {t('Tidak ditemukan hasil untuk')} "{query}"
                                            </h4>
                                            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                                                {t('Coba gunakan kata kunci lain seperti bantuan pangan, air bersih, kesehatan, atau sedekah.')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* 1. Fokus Program Matches */}
                                            {results.focusPrograms.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                                            <Compass className="w-3.5 h-3.5 text-blue-600" />
                                                            {t('Fokus Program Unggulan')}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-zinc-400">
                                                            {results.focusPrograms.length} {t('ditemukan')}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {results.focusPrograms.map((focus) => (
                                                            <Link
                                                                key={focus.id}
                                                                href={focus.url}
                                                                onClick={handleClose}
                                                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-blue-50/30 hover:bg-blue-50/70 hover:border-blue-200 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                                        🎯
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-blue-700 truncate">
                                                                            {focus.name}
                                                                        </div>
                                                                        <div className="text-[11px] text-zinc-500">
                                                                            {t('Lihat Fokus Program')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-transform shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. Program Donasi Matches */}
                                            {results.programs.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                                                            {t('Program Donasi')}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-zinc-400">
                                                            {results.programs.length} {t('program')}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {results.programs.map((prog) => (
                                                            <Link
                                                                key={prog.id}
                                                                href={prog.url}
                                                                onClick={handleClose}
                                                                className="flex items-center gap-3 p-2.5 rounded-2xl border border-zinc-100 hover:border-brand-200 hover:bg-zinc-50/80 transition-all group"
                                                            >
                                                                {/* Thumbnail */}
                                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/60">
                                                                    {prog.cover_image ? (
                                                                        <img
                                                                            src={prog.cover_image.startsWith('http') ? prog.cover_image : `/storage/${prog.cover_image}`}
                                                                            alt={prog.title}
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLElement).style.display = 'none';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                                            <Heart className="w-6 h-6" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        {prog.category_name && (
                                                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200/50">
                                                                                {prog.category_name}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h5 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                                                                        {prog.title}
                                                                    </h5>
                                                                    
                                                                    {/* Progress & Target */}
                                                                    <div className="space-y-1 pt-0.5">
                                                                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="bg-brand-600 h-full rounded-full"
                                                                                style={{ width: `${Math.min(100, prog.percentage)}%` }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-[10px] text-zinc-500">
                                                                            <span>
                                                                                {t('Terkumpul')}: <strong className="text-zinc-800">{formatCurrency(prog.collected_amount)}</strong>
                                                                            </span>
                                                                            <span className="font-semibold text-brand-700">
                                                                                {prog.percentage}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="shrink-0 pl-1 rtl:pl-0 rtl:pr-1">
                                                                    <span className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-brand-700 bg-brand-50 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                                                        {t('Donasi')}
                                                                    </span>
                                                                    <ArrowRight className="sm:hidden w-4 h-4 text-zinc-400 group-hover:text-brand-600" />
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 3. Halaman Layanan & Informasi Matches */}
                                            {results.pages.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                                            <Compass className="w-3.5 h-3.5 text-indigo-500" />
                                                            {t('Halaman Layanan & Informasi')}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-zinc-400">
                                                            {results.pages.length} {t('halaman')}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {results.pages.map((page) => (
                                                            <Link
                                                                key={page.id}
                                                                href={page.url}
                                                                onClick={handleClose}
                                                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/80 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={`w-8 h-8 rounded-lg ${getPageIconBg(page.slug)} flex items-center justify-center shrink-0`}>
                                                                        {getPageIcon(page.slug)}
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-semibold text-zinc-900 group-hover:text-brand-700 truncate">
                                                                                {page.title}
                                                                            </span>
                                                                            {page.badge && (
                                                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200/70 shrink-0">
                                                                                    {page.badge}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {page.meta_description && (
                                                                            <div className="text-[10px] text-zinc-400 truncate max-w-[200px] sm:max-w-md">
                                                                                {page.meta_description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-brand-600 transition-transform shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 4. Pusat Bantuan & Tanya Jawab Matches */}
                                            {results.faqs && results.faqs.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                                            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                                                            {t('Pusat Bantuan & Tanya Jawab')}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-zinc-400">
                                                            {results.faqs.length} {t('tanya jawab')}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {results.faqs.map((faq) => (
                                                            <Link
                                                                key={faq.id}
                                                                href={faq.url}
                                                                onClick={handleClose}
                                                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50/50 border border-transparent hover:border-teal-200/60 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                                                                        <HelpCircle className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-teal-700 truncate">
                                                                            {faq.question}
                                                                        </div>
                                                                        <div className="text-[10px] text-zinc-400 capitalize">
                                                                            {t('Kategori')}: {faq.category} • {t('Buka Solusi FAQ')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-teal-600 transition-transform shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 5. Berita / Artikel Matches */}
                                            {results.blogs.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                                            <Newspaper className="w-3.5 h-3.5 text-amber-500" />
                                                            {t('Berita')}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-zinc-400">
                                                            {results.blogs.length} {t('artikel')}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {results.blogs.map((blog) => (
                                                            <Link
                                                                key={blog.id}
                                                                href={blog.url}
                                                                onClick={handleClose}
                                                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/80 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                                                        <Newspaper className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-amber-700 truncate">
                                                                            {blog.title}
                                                                        </div>
                                                                        {blog.published_at && (
                                                                            <div className="text-[10px] text-zinc-400">
                                                                                {blog.published_at}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-amber-600 transition-transform shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Search Dialog Footer */}
                        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/70 px-4 sm:px-6 py-2.5 text-xs text-zinc-500">
                            <div className="flex items-center gap-3">
                                <span className="hidden sm:inline-flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white rounded border border-zinc-200">ESC</kbd> {t('tutup')}
                                </span>
                            </div>
                            <Link
                                href="/program"
                                onClick={handleClose}
                                className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800 transition-colors"
                            >
                                <span>{t('Lihat semua program donasi')}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
