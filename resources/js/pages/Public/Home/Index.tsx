import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
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
            <section className="relative w-full h-[75dvh] min-h-[500px] overflow-hidden bg-gray-50">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
                                
                                {banner.cta_link && (
                                    <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-24">
                                        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                                            <Button asChild size="lg" className="bg-white text-gray-950 hover:bg-gray-100 rounded-full font-semibold px-8 h-12 shadow-sm transition-transform hover:-translate-y-[1px]">
                                                <a href={banner.cta_link}>
                                                    Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
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
                <section className="py-20 md:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                            <div className="lg:col-span-5 lg:sticky lg:top-24">
                                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-950 leading-[1.1]">
                                    Jejak Kebaikan Bersama
                                </h2>
                                <p className="mt-5 text-lg text-gray-600 max-w-md leading-relaxed">
                                    Berkat dukungan Anda, kami telah menyalurkan bantuan ke berbagai wilayah yang membutuhkan. Setiap donasi menciptakan perubahan nyata.
                                </p>
                            </div>
                            
                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                                {stats.map((stat: any, i: number) => (
                                    <motion.div 
                                        key={stat.id}
                                        initial={reduce ? false : { opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.6, delay: i * 0.1 }}
                                        className="flex flex-col border-l-2 border-gray-100 pl-6"
                                    >
                                        <div className="text-5xl md:text-6xl font-semibold tracking-tighter text-brand-600 mb-3">
                                            {stat.value}
                                        </div>
                                        <div className="text-base font-medium text-gray-900">
                                            {stat.title_translations?.id || (typeof stat.title === 'object' ? stat.title?.id || stat.title?.en : stat.title)}
                                        </div>
                                        {stat.category && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                {stat.category}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Focus Programs (Bento Grid) Section */}
            {focusPrograms && focusPrograms.length > 0 && (
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="max-w-2xl mb-16">
                            <h2 className="text-4xl font-semibold tracking-tight text-gray-950 mb-4">
                                Fokus Program
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Pilar kebaikan yang kami salurkan untuk memberdayakan dan membangkitkan harapan umat di berbagai aspek kehidupan.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px]">
                            {focusPrograms.map((cat: any, index: number) => {
                                // Dynamic bento sizing logic
                                let spanClass = "col-span-1 md:col-span-2";
                                if (focusPrograms.length % 2 !== 0 && index === 0) {
                                    spanClass = "col-span-1 md:col-span-4 row-span-2";
                                } else if (index % 3 === 0) {
                                    spanClass = "col-span-1 md:col-span-2";
                                }
                                
                                return (
                                    <Link 
                                        key={cat.id} 
                                        href={`/program?category=${cat.id}`} 
                                        className={`group relative rounded-3xl overflow-hidden bg-gray-900 ${spanClass}`}
                                    >
                                        {cat.pillar_image ? (
                                            <img 
                                                src={`/storage/${cat.pillar_image}`} 
                                                alt={typeof cat.name === 'object' ? cat.name?.id : cat.name} 
                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 opacity-90"></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent p-8 flex flex-col justify-end">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-2xl font-medium text-white tracking-tight">
                                                    {cat.name_translations?.id || (typeof cat.name === 'object' ? cat.name?.id || cat.name?.en : cat.name)}
                                                </h3>
                                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-gray-950 transition-colors">
                                                    <ArrowUpRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
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
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl font-semibold tracking-tight text-gray-950 mb-4">
                                    Bantu Mereka Sekarang
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Pilih program kebaikan dan salurkan donasi Anda hari ini.
                                </p>
                            </div>
                            <Button asChild variant="outline" className="rounded-full h-11 px-6 border-gray-200 hover:bg-gray-50 text-gray-950">
                                <Link href="/program">
                                    Lihat Semua Program <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
                            {programs.map((program: any) => (
                                <Link 
                                    key={program.id} 
                                    href={`/program/${program.slug}`} 
                                    className="group flex flex-col"
                                >
                                    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-5 bg-gray-100">
                                        <img 
                                            src={`/storage/${program.thumbnail_url}`} 
                                            alt={program.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full text-xs font-semibold text-gray-900 shadow-sm">
                                            {typeof program.category?.name === 'object' ? program.category.name?.id || program.category.name?.en : program.category?.name}
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-medium text-gray-950 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight tracking-tight">
                                        {program.title}
                                    </h3>
                                    
                                    <div className="mt-auto pt-2">
                                        {program.target_amount && (
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-4">
                                                <div 
                                                    className="bg-brand-600 h-full rounded-full" 
                                                    style={{ width: `${Math.min(100, (program.collected_amount / program.target_amount) * 100)}%` }}
                                                ></div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Terkumpul</p>
                                                <p className="font-semibold text-gray-950 tracking-tight">
                                                    {formatCurrency(program.collected_amount)}
                                                </p>
                                            </div>
                                            <div className="text-sm font-medium text-brand-600 group-hover:underline underline-offset-4">
                                                Donasi Sekarang
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Latest Blogs Section */}
            {blogs && blogs.length > 0 && (
                <section className="py-24 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                            <div className="max-w-xl">
                                <h2 className="text-4xl font-semibold tracking-tight text-gray-950 mb-4">
                                    Kabar Terbaru
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Baca berita dan laporan penyaluran program yang telah Anda dukung.
                                </p>
                            </div>
                            <Button asChild variant="outline" className="rounded-full h-11 px-6 border-gray-200 hover:bg-gray-50 text-gray-950">
                                <Link href="/berita">
                                    Baca Semua Berita
                                </Link>
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {blogs.map((blog: any) => (
                                <Link key={blog.id} href={`/berita/${blog.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                                    {blog.thumbnail_url && (
                                        <div className="h-56 overflow-hidden bg-gray-100">
                                            <img src={blog.thumbnail_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                        </div>
                                    )}
                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="text-sm text-gray-500 mb-3">
                                            {new Date(blog.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-950 mb-4 line-clamp-2 group-hover:text-brand-600 tracking-tight leading-snug">
                                            {blog.title}
                                        </h3>
                                        <p className="text-base text-gray-600 line-clamp-3 mt-auto">
                                            {blog.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. Partners Section */}
            {partners && partners.length > 0 && (
                <section className="py-20 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            {partners.map((partner: any) => (
                                <a key={partner.id} href={partner.website_url || '#'} target={partner.website_url ? "_blank" : "_self"} rel="noreferrer" className="block">
                                    <img src={`/storage/${partner.logo_url}`} alt={partner.name} className="h-10 md:h-12 object-contain max-w-[140px]" />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </PublicLayout>
    );
}
