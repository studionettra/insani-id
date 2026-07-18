import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { FadeIn } from '@/components/ui/fade-in';
import { motion, useReducedMotion } from 'motion/react';

export default function HomeIndex({ banners, stats, partners, focusPrograms, programs, blogs }: any) {
    const { locale } = usePage().props as any;
    const reduce = useReducedMotion();
    
    // --- Banner Slider Logic ---
    const [currentSlide, setCurrentSlide] = useState(0);
    
    useEffect(() => {
        if (!banners || banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [banners]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };
    
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    return (
        <PublicLayout title="Beranda">
            
            {/* 1. Hero Banners Section */}
            <section className="relative w-full h-[85dvh] min-h-[600px] overflow-hidden bg-zinc-50">
                {banners && banners.length > 0 ? (
                    <>
                        {banners.map((banner: any, index: number) => (
                            <div 
                                key={banner.id} 
                                className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            >
                                <img 
                                    src={`/storage/${banner.desktop_image_url}`} 
                                    alt={banner.title} 
                                    className="hidden md:block w-full h-full object-cover" 
                                />
                                <img 
                                    src={`/storage/${banner.mobile_image_url || banner.desktop_image_url}`} 
                                    alt={banner.title} 
                                    className="block md:hidden w-full h-full object-cover" 
                                />
                                
                                {/* Gradient for CTA contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                                
                                {banner.cta_link && (
                                    <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24">
                                        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                                            {banner.title && (
                                                <FadeIn>
                                                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-3xl leading-tight tracking-tight shadow-sm">
                                                        {banner.title}
                                                    </h2>
                                                </FadeIn>
                                            )}
                                            <FadeIn delay={0.1}>
                                                <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 rounded-full font-semibold px-8 h-12 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                    <a href={banner.cta_link}>
                                                        Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </FadeIn>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Slider Controls */}
                        {banners.length > 1 && (
                            <div className="absolute bottom-12 right-6 md:right-12 z-20 flex space-x-3">
                                <button onClick={prevSlide} className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-gray-950 transition-all">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={nextSlide} className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-gray-950 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        
                        {/* Progress Indicators */}
                        {banners.length > 1 && (
                            <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 flex flex-col space-y-3 -rotate-90 origin-bottom-right">
                                <div className="flex space-x-2">
                                    {banners.map((_: any, index: number) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-[2px] transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-4 bg-white/40'}`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 font-medium">Belum ada banner aktif</span>
                    </div>
                )}
            </section>

            {/* 2. Impact Stats Section */}
            {stats && stats.length > 0 && (
                <section className="py-24 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                            <div className="lg:col-span-5 lg:sticky lg:top-32">
                                <FadeIn>
                                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.1]">
                                        Jejak Kebaikan<br />Bersama
                                    </h2>
                                    <p className="mt-6 text-lg text-zinc-600 max-w-md leading-relaxed">
                                        Berkat dukungan Anda, kami telah menyalurkan bantuan ke berbagai wilayah yang membutuhkan. Setiap donasi menciptakan perubahan nyata.
                                    </p>
                                </FadeIn>
                            </div>
                            
                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                                {stats.map((stat: any, i: number) => (
                                    <FadeIn 
                                        key={stat.id}
                                        delay={i * 0.1}
                                        className="flex flex-col border-l-2 border-zinc-100 pl-6 hover:border-brand-300 transition-colors duration-500"
                                    >
                                        <div className="text-5xl md:text-6xl font-bold tracking-tighter text-brand-600 mb-4">
                                            {stat.value}
                                        </div>
                                        <div className="text-lg font-semibold text-zinc-900">
                                            {stat.title_translations?.id || (typeof stat.title === 'object' ? stat.title?.id || stat.title?.en : stat.title)}
                                        </div>
                                        {stat.category && (
                                            <div className="text-sm text-zinc-500 mt-2 font-medium">
                                                {stat.category}
                                            </div>
                                        )}
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Focus Programs (Bento Grid) Section */}
            {focusPrograms && focusPrograms.length > 0 && (
                <section className="py-24 bg-zinc-50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <FadeIn className="max-w-2xl mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-6">
                                Fokus Program
                            </h2>
                            <p className="text-lg text-zinc-600 leading-relaxed">
                                Pilar kebaikan yang kami salurkan untuk memberdayakan dan membangkitkan harapan umat di berbagai aspek kehidupan.
                            </p>
                        </FadeIn>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px]">
                            {focusPrograms.map((cat: any, index: number) => {
                                // Dynamic bento sizing logic
                                let spanClass = "col-span-1 md:col-span-2";
                                if (focusPrograms.length % 2 !== 0 && index === 0) {
                                    spanClass = "col-span-1 md:col-span-4 row-span-2";
                                } else if (index % 3 === 0) {
                                    spanClass = "col-span-1 md:col-span-2";
                                }
                                
                                // Color tints for variety
                                const tints = [
                                    "bg-brand-900",
                                    "bg-slate-900",
                                    "bg-zinc-900",
                                    "bg-stone-900"
                                ];
                                const bgColor = tints[index % tints.length];
                                
                                return (
                                    <FadeIn
                                        key={cat.id} 
                                        delay={index * 0.1}
                                        className={spanClass}
                                    >
                                        <Link 
                                            href={`/program?category=${cat.id}`} 
                                            className={`group relative block w-full h-full rounded-2xl overflow-hidden ${bgColor} transition-transform hover:-translate-y-1`}
                                        >
                                            {cat.pillar_image && (
                                                <img 
                                                    src={`/storage/${cat.pillar_image}`} 
                                                    alt={typeof cat.name === 'object' ? cat.name?.id : cat.name} 
                                                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out" 
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent p-8 flex flex-col justify-end">
                                                <div className="flex justify-between items-end">
                                                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                                        {cat.name_translations?.id || (typeof cat.name === 'object' ? cat.name?.id || cat.name?.en : cat.name)}
                                                    </h3>
                                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-zinc-950 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Latest Programs Section */}
            {programs && programs.length > 0 && (
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <FadeIn className="flex flex-col mb-16">
                            <div className="max-w-2xl mb-8">
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-6">
                                    Bantu Mereka Sekarang
                                </h2>
                                <p className="text-lg text-zinc-600 leading-relaxed">
                                    Pilih program kebaikan dan salurkan donasi Anda hari ini.
                                </p>
                            </div>
                            <div>
                                <Button asChild variant="outline" className="rounded-full h-11 px-6 border-zinc-200 hover:bg-zinc-50 text-zinc-950 transition-all active:scale-[0.98]">
                                    <Link href="/program">
                                        Lihat Semua Program <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
                            {programs.map((program: any, index: number) => (
                                <FadeIn key={program.id} delay={index * 0.1}>
                                    <Link 
                                        href={`/program/${program.slug}`} 
                                        className="group flex flex-col h-full bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-300"
                                    >
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                                            <img 
                                                src={`/storage/${program.cover_image}`} 
                                                alt={program.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-zinc-900 shadow-sm">
                                                {typeof program.category?.name === 'object' ? program.category.name?.id || program.category.name?.en : program.category?.name}
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-zinc-950 mb-4 line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight tracking-tight">
                                                {program.title}
                                            </h3>
                                            
                                            <div className="mt-auto pt-4 border-t border-zinc-50">
                                                {program.target_amount && (
                                                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden mb-5">
                                                        <div 
                                                            className="bg-brand-600 h-full rounded-full transition-all duration-1000 ease-out relative" 
                                                            style={{ width: `${Math.min(100, (program.collected_amount / program.target_amount) * 100)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 w-full h-full origin-left animate-pulse"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Terkumpul</p>
                                                        <p className="font-bold text-zinc-950 tracking-tight text-lg">
                                                            {formatCurrency(program.collected_amount)}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm font-bold text-brand-600 flex items-center group-hover:translate-x-1 transition-transform">
                                                        Donasi <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Latest Blogs Section (Editorial Layout) */}
            {blogs && blogs.length > 0 && (
                <section className="py-24 bg-zinc-50 border-t border-zinc-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                            <div className="max-w-xl">
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-6">
                                    Kabar Terbaru
                                </h2>
                                <p className="text-lg text-zinc-600 leading-relaxed">
                                    Baca berita dan laporan penyaluran program yang telah Anda dukung.
                                </p>
                            </div>
                            <div>
                                <Button asChild variant="outline" className="rounded-full h-11 px-6 border-zinc-200 hover:bg-zinc-100 text-zinc-950 transition-all active:scale-[0.98]">
                                    <Link href="/berita">
                                        Baca Semua Berita
                                    </Link>
                                </Button>
                            </div>
                        </FadeIn>
                        
                        {blogs.length >= 2 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                                {/* Featured Post (Left) */}
                                <FadeIn className="lg:col-span-7">
                                    <Link href={`/berita/${blogs[0].slug}`} className="group block relative rounded-3xl overflow-hidden bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="aspect-[16/10] overflow-hidden bg-zinc-100 relative">
                                            {blogs[0].featured_image_url ? (
                                                <img src={blogs[0].featured_image_url} alt={blogs[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-50"></div>
                                            )}
                                        </div>
                                        <div className="p-8 md:p-10">
                                            <div className="text-sm font-semibold text-brand-600 mb-4 uppercase tracking-wider">
                                                {new Date(blogs[0].published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-zinc-950 mb-4 group-hover:text-brand-600 tracking-tight leading-snug transition-colors">
                                                {blogs[0].title}
                                            </h3>
                                            <p className="text-lg text-zinc-600 line-clamp-3 leading-relaxed">
                                                {blogs[0].excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                </FadeIn>

                                {/* Side Posts (Right) */}
                                <div className="lg:col-span-5 flex flex-col gap-6">
                                    {blogs.slice(1).map((blog: any, idx: number) => (
                                        <FadeIn key={blog.id} delay={0.2 + (idx * 0.1)} className="h-full">
                                            <Link href={`/berita/${blog.slug}`} className="group flex flex-col sm:flex-row lg:flex-col xl:flex-row h-full bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-300">
                                                <div className="sm:w-2/5 lg:w-full xl:w-2/5 aspect-[4/3] sm:aspect-auto lg:aspect-[16/9] xl:aspect-auto overflow-hidden bg-zinc-100 flex-shrink-0 relative">
                                                    {blog.featured_image_url ? (
                                                        <img src={blog.featured_image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-50"></div>
                                                    )}
                                                </div>
                                                <div className="p-6 flex flex-col justify-center flex-grow">
                                                    <div className="text-xs font-semibold text-brand-600 mb-3 uppercase tracking-wider">
                                                        {new Date(blog.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-zinc-950 mb-3 group-hover:text-brand-600 tracking-tight leading-snug transition-colors line-clamp-3">
                                                        {blog.title}
                                                    </h3>
                                                </div>
                                            </Link>
                                        </FadeIn>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8">
                                {/* Fallback if only 1 blog */}
                                {blogs.map((blog: any) => (
                                    <FadeIn key={blog.id}>
                                        <Link href={`/berita/${blog.slug}`} className="group flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="md:w-1/2 aspect-[16/9] md:aspect-auto overflow-hidden bg-zinc-100 relative">
                                                {blog.featured_image_url ? (
                                                    <img src={blog.featured_image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-50"></div>
                                                )}
                                            </div>
                                            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                                <div className="text-sm font-semibold text-brand-600 mb-4 uppercase tracking-wider">
                                                    {new Date(blog.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                                <h3 className="text-3xl font-bold text-zinc-950 mb-6 group-hover:text-brand-600 tracking-tight leading-snug transition-colors">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-lg text-zinc-600 line-clamp-4 leading-relaxed">
                                                    {blog.excerpt}
                                                </p>
                                            </div>
                                        </Link>
                                    </FadeIn>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 6. Partners Section */}
            {partners && partners.length > 0 && (
                <section className="py-20 bg-white border-t border-zinc-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <FadeIn delay={0.2} className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                            {partners.map((partner: any) => (
                                <a key={partner.id} href={partner.website_url || '#'} target={partner.website_url ? "_blank" : "_self"} rel="noreferrer" className="block transform transition-transform hover:-translate-y-1">
                                    <img src={`/storage/${partner.logo_url}`} alt={partner.name} className="h-10 md:h-12 object-contain max-w-[140px]" />
                                </a>
                            ))}
                        </FadeIn>
                    </div>
                </section>
            )}

        </PublicLayout>
    );
}
