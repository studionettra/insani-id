import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/PublicLayout';
import { formatCurrency, getLocalizedValue } from '@/lib/utils';
import DonationProgressBar from '@/components/donation/DonationProgressBar';
import useTranslation from '@/hooks/use-translation';
import { renderStatIcon } from '@/components/ui/icon-picker';

interface Category {
    id: number;
    name: { id: string };
    icon?: string | null;
}

interface Program {
    id: number;
    title: { id: string };
    slug: string;
    category: { title: { id: string }, name: { id: string } };
    target_amount: string | null;
    collected_amount: number;
    cover_image: string;
}

interface Props {
    programs: {
        data: Program[];
        current_page: number;
        last_page: number;
        links: any[];
    };
    categories: Category[];
    filters: {
        category: string | null;
        search: string | null;
        sort?: string;
    };
}

export default function ProgramListing({ programs, categories, filters }: Props) {
    const { t, locale } = useTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 6);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        updateScrollButtons();
        el.addEventListener('scroll', updateScrollButtons, { passive: true });
        window.addEventListener('resize', updateScrollButtons);

        return () => {
            el.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [updateScrollButtons, categories]);

    const handleScroll = (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const scrollAmount = Math.min(el.clientWidth * 0.75, 260);
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    // Auto-scroll the active category button into view on load or when category filter changes
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        if (!filters.category) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
            return;
        }

        const activeItem = el.querySelector<HTMLElement>('[data-active="true"]');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [filters.category]);

    const handleFilterChange = (key: string, value: string) => {
        const query = { ...filters, [key]: value || undefined };
        router.get('/program', query, { preserveState: true });
    };

    return (
        <PublicLayout title={t('Program Donasi')}>

            <div className="bg-white">
                {/* Hero Section */}
                <div className="relative bg-insani-darkblue text-white py-16 md:py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-insani-blue/20 via-transparent to-transparent"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-insani-blue/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                    <div className="container mx-auto px-4 max-w-6xl text-center relative z-10">
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('Program Donasi')}</h1>
                        <p className="text-blue-100 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                            {t('Pilih program kebaikan yang ingin Anda dukung hari ini. Setiap donasi Anda membawa harapan baru bagi mereka yang membutuhkan.')}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-6xl py-12">
                    {/* Filters & Search Modern UI */}
                    <div className="flex flex-col gap-5 mb-12 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-slate-100 relative">
                        
                        {/* Subtle Background Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-insani-blue/20 via-insani-blue to-insani-blue/20 rounded-t-2xl sm:rounded-t-3xl"></div>

                        {/* Search & Sort Row */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-center z-10">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 rtl:right-4 rtl:left-auto" />
                                <Input 
                                    type="text"
                                    placeholder={t('Cari program donasi...')}
                                    className="pl-12 rtl:pr-12 rtl:pl-4 h-12 w-full bg-slate-50/80 border-slate-200 focus:bg-white focus:border-insani-blue focus:ring-insani-blue/20 rounded-xl transition-all text-base shadow-sm"
                                    defaultValue={filters.search || ''}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            handleFilterChange('search', e.currentTarget.value);
                                        }
                                    }}
                                />
                            </div>
                            <select
                                className="h-12 w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-insani-blue/20 focus:bg-white focus:border-insani-blue transition-all cursor-pointer min-w-[170px] shadow-sm shrink-0"
                                value={filters.sort || 'terbaru'}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="terbaru">{t('Terbaru')}</option>
                                <option value="terlama">{t('Terlama')}</option>
                                <option value="terbanyak">{t('Terkumpul Terbanyak')}</option>
                            </select>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-slate-100 my-0.5 z-10"></div>

                        {/* Single-Row Horizontal Scrollable Categories */}
                        <div className="relative w-full z-10 group/category-scroll">
                            {/* Left Fade Gradient */}
                            <div
                                className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 transition-opacity duration-300 ${
                                    canScrollLeft ? 'opacity-100' : 'opacity-0'
                                }`}
                            />

                            {/* Left Arrow Button (Desktop) */}
                            {canScrollLeft && (
                                <button
                                    type="button"
                                    onClick={() => handleScroll('left')}
                                    aria-label="Scroll left"
                                    className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-600 hover:text-insani-blue hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            )}

                            {/* Horizontal Scroll Track */}
                            <div
                                ref={scrollContainerRef}
                                className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth py-1 px-1 -mx-2 px-2 sm:mx-0 sm:px-0"
                            >
                                <button 
                                    type="button"
                                    data-active={!filters.category ? 'true' : 'false'}
                                    onClick={() => handleFilterChange('category', '')}
                                    className={`inline-flex items-center justify-center shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                                        !filters.category 
                                            ? 'bg-insani-blue text-white shadow-sm shadow-insani-blue/25 font-semibold border border-insani-blue' 
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-insani-blue border border-slate-200/80 hover:border-insani-blue/30'
                                    }`}
                                >
                                    {t('Semua')}
                                </button>
                                {categories.map(cat => {
                                    const isActive = filters.category === cat.id.toString();
                                    return (
                                        <button 
                                            key={cat.id}
                                            type="button"
                                            data-active={isActive ? 'true' : 'false'}
                                            onClick={() => handleFilterChange('category', cat.id.toString())}
                                            className={`inline-flex items-center justify-center gap-2 shrink-0 px-4.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                                                isActive 
                                                    ? 'bg-insani-blue text-white shadow-sm shadow-insani-blue/25 font-semibold border border-insani-blue' 
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-insani-blue border border-slate-200/80 hover:border-insani-blue/30'
                                            }`}
                                        >
                                            {cat.icon && (
                                                <span className="shrink-0">{renderStatIcon(cat.icon, "w-4 h-4 text-current")}</span>
                                            )}
                                            <span>{t(getLocalizedValue(cat.name, locale))}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right Fade Gradient */}
                            <div
                                className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 transition-opacity duration-300 ${
                                    canScrollRight ? 'opacity-100' : 'opacity-0'
                                }`}
                            />

                            {/* Right Arrow Button (Desktop) */}
                            {canScrollRight && (
                                <button 
                                    type="button"
                                    onClick={() => handleScroll('right')}
                                    aria-label="Scroll right"
                                    className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-600 hover:text-insani-blue hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Program Grid */}
                    {programs.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {programs.data.map(program => {
                                return (
                                    <Link key={program.id} href={`/program/${program.slug}`} className="group h-full">
                                        <Card className="h-full flex flex-col overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                <img 
                                                    src={`/storage/${program.cover_image}`} 
                                                    alt={getLocalizedValue(program.title, locale)} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <Badge className="absolute top-3 right-3 bg-white/90 text-insani-blue hover:bg-white backdrop-blur-sm border-none font-semibold">
                                                    {t(getLocalizedValue(program.category?.name, locale, 'Kategori'))}
                                                </Badge>
                                            </div>
                                            <CardContent className="flex-1 p-5 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-insani-blue transition-colors">
                                                        {getLocalizedValue(program.title, locale)}
                                                    </h3>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="mb-3">
                                                        <DonationProgressBar 
                                                            collectedAmount={program.collected_amount}
                                                            targetAmount={program.target_amount}
                                                            size="sm"
                                                            percentagePlacement="top-right"
                                                            percentageFormat="badge"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-end text-sm">
                                                        <div>
                                                            <p className="text-slate-500 text-xs mb-0.5">{t('Terkumpul')}</p>
                                                            <p className="font-bold text-slate-900">{formatCurrency(program.collected_amount)}</p>
                                                            {program.target_amount && parseFloat(program.target_amount) > 0 && (
                                                                <p className="text-[11px] text-slate-400">
                                                                    {t('dari target', 'dari')} {formatCurrency(parseFloat(program.target_amount))}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-slate-500 text-xs mb-0.5">{t('Sisa Hari')}</p>
                                                            <p className="font-medium text-slate-700">∞</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('Program Tidak Ditemukan')}</h3>
                            <p className="text-slate-500">{t('Silakan coba dengan kata kunci atau kategori yang berbeda.')}</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {programs.last_page > 1 && (
                        <div className="flex justify-center mt-12">
                            <div className="flex space-x-2">
                                {programs.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                            link.active
                                                ? 'bg-insani-blue text-white shadow-md'
                                                : link.url 
                                                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-insani-blue' 
                                                    : 'bg-transparent text-slate-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
