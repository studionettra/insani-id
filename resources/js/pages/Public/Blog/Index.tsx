import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, User, ArrowRight, Search, X, BookOpen } from 'lucide-react';
import React, { useState } from 'react';
import GoogleAd from '@/components/ads/GoogleAd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useTranslation from '@/hooks/use-translation';
import PublicLayout from '@/layouts/PublicLayout';
import { getLocalizedValue } from '@/lib/utils';

interface BlogIndexProps {
    blogs: any;
    categories?: string[];
    filters?: {
        search?: string;
        category?: string;
    };
}

export default function BlogIndex({ blogs, categories = [], filters = {} }: BlogIndexProps) {
    const { t, locale, isRtl } = useTranslation();
    const { siteSettings } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/berita',
            {
                search: searchQuery || undefined,
                category: filters.category || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryClick = (categoryName?: string) => {
        router.get(
            '/berita',
            {
                search: filters.search || undefined,
                category: categoryName || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        router.get('/berita', {}, { preserveState: true, preserveScroll: true });
    };

    const isFiltered = Boolean(filters.search || filters.category);

    return (
        <PublicLayout title="Kabar & Berita">
            
            {/* Hero Header */}
            <div className="bg-insani-darkblue text-white py-16 md:py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-insani-blue/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-blue-200 backdrop-blur-md mb-4">
                        <BookOpen className="w-3.5 h-3.5 mr-2" /> Kabar Insani
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Kabar & Berita Terbaru</h1>
                    <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Ikuti perkembangan terbaru, laporan penyaluran amanah, dan kisah inspiratif dari program kebaikan Insani Indonesia.
                    </p>
                </div>
            </div>

            {/* Filter & Search Section */}
            <section className="bg-slate-50 border-b border-slate-200 py-6 sticky top-16 z-20 backdrop-blur-md bg-slate-50/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        
                        {/* Categories Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none text-sm">
                            <button
                                type="button"
                                onClick={() => handleCategoryClick(undefined)}
                                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap active:scale-95 ${
                                    !filters.category
                                        ? 'bg-insani-blue text-white shadow-sm'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Semua Kabar
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap active:scale-95 ${
                                        filters.category === cat
                                            ? 'bg-insani-blue text-white shadow-sm'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
                            <div className="relative w-full">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari judul atau topik kabar..."
                                    className="pl-10 pr-9 bg-white border-slate-200 rounded-full h-10 text-sm focus-visible:ring-insani-blue"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <Button type="submit" className="rounded-full h-10 px-5 bg-insani-blue hover:bg-insani-darkblue text-white shrink-0">
                                Cari
                            </Button>
                        </form>
                    </div>

                    {/* Active Filter Indicator */}
                    {isFiltered && (
                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-500">
                            <span>
                                Menampilkan hasil untuk: 
                                {filters.category && <strong className="ml-1 text-insani-blue">Kategori "{filters.category}"</strong>}
                                {filters.category && filters.search && <span> dan </span>}
                                {filters.search && <strong className="text-slate-800">Kata kunci "{filters.search}"</strong>}
                            </span>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-red-600 hover:text-red-700 font-medium inline-flex items-center ml-2"
                            >
                                <X className="w-3.5 h-3.5 mr-1" /> Reset Filter
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-12 md:py-16 bg-white min-h-[50vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Google AdSense Slot (Blog Index Banner) */}
                    <GoogleAd 
                        slot={siteSettings?.adsense_slot_blog_index} 
                        className="mb-10 max-w-4xl mx-auto"
                    />

                    {blogs && blogs.data && blogs.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {blogs.data.map((blog: any) => (
                                    <Link 
                                        key={blog.id} 
                                        href={`/berita/${blog.slug}`} 
                                        className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                    >
                                        {blog.thumbnail_url || blog.featured_image_url ? (
                                            <div className="aspect-[16/10] overflow-hidden relative">
                                                <img 
                                                    src={blog.thumbnail_url || blog.featured_image_url} 
                                                    alt={blog.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                />
                                                {blog.wp_category && (
                                                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                                                        {blog.wp_category}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center relative">
                                                <span className="text-slate-400 font-medium">Insani Indonesia</span>
                                                {blog.wp_category && (
                                                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                                                        {blog.wp_category}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                                <span className="flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                    {new Date(blog.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center">
                                                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                    {blog.author_name || 'Admin Insani'}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-insani-blue transition-colors leading-snug">
                                                {getLocalizedValue(blog.title, locale)}
                                            </h3>
                                            
                                            <p className="text-gray-600 mb-6 flex-grow line-clamp-3 text-sm leading-relaxed">
                                                {getLocalizedValue(blog.excerpt, locale)}
                                            </p>
                                            
                                            <div className="flex items-center text-insani-blue font-semibold text-sm group-hover:text-insani-darkblue pt-2 border-t border-slate-50">
                                                {t('Baca Selengkapnya')} <ArrowRight className={`w-4 h-4 ${isRtl ? 'mr-1.5 rotate-180' : 'ml-1.5'} group-hover:translate-x-1 transition-transform`} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {blogs.last_page > 1 && (
                                <div className="flex justify-center items-center gap-1.5 flex-wrap pt-4 border-t border-slate-100">
                                    {blogs.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                link.active 
                                                    ? 'bg-insani-blue text-white shadow-xs' 
                                                    : link.url 
                                                        ? 'bg-slate-100 text-gray-700 hover:bg-slate-200' 
                                                        : 'bg-slate-50 text-gray-300 cursor-not-allowed pointer-events-none'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 max-w-xl mx-auto px-6">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                {isFiltered ? 'Tidak ada berita yang ditemukan' : 'Belum Ada Berita'}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                {isFiltered 
                                    ? 'Coba ubah kata kunci pencarian atau pilih kategori lain.' 
                                    : 'Kabar dan berita terbaru dari Insani Indonesia akan segera hadir di sini.'}
                            </p>
                            {isFiltered && (
                                <Button onClick={handleResetFilters} variant="outline" className="rounded-full">
                                    Lihat Semua Berita
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </section>

        </PublicLayout>
    );
}
