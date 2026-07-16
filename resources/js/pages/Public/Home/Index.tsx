import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function HomeIndex({ banners, stats, partners, focusPrograms, programs, blogs }: any) {
    const { locale } = usePage().props as any;
    
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
            <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-gray-100">
                {banners && banners.length > 0 ? (
                    <>
                        {banners.map((banner: any, index: number) => (
                            <div 
                                key={banner.id} 
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            >
                                {/* Desktop Image */}
                                <img 
                                    src={`/storage/${banner.desktop_image_url}`} 
                                    alt={banner.title} 
                                    className="hidden md:block w-full h-full object-cover" 
                                />
                                {/* Mobile Image (Fallback to desktop if no mobile) */}
                                <img 
                                    src={`/storage/${banner.mobile_image_url || banner.desktop_image_url}`} 
                                    alt={banner.title} 
                                    className="block md:hidden w-full h-full object-cover" 
                                />
                                {/* Overlay & Content if CTA exists */}
                                {banner.cta_link && (
                                    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8 md:p-16">
                                        <div className="max-w-7xl mx-auto w-full">
                                            <a href={banner.cta_link} className="inline-block bg-insani-blue text-white px-6 py-3 rounded-full font-semibold hover:bg-insani-darkblue transition-colors">
                                                Selengkapnya
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Slider Controls */}
                        {banners.length > 1 && (
                            <>
                                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-sm transition">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-sm transition">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                {/* Dots */}
                                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
                                    {banners.map((_: any, index: number) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <span className="text-slate-400">Belum ada banner aktif</span>
                    </div>
                )}
            </section>

            {/* 2. Impact Stats Section */}
            {stats && stats.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-insani-darkblue">Jejak Kebaikan Bersama</h2>
                            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                                Berkat dukungan Anda, kami telah menyalurkan bantuan ke berbagai wilayah.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            {stats.map((stat: any) => (
                                <div key={stat.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                                    <div className="text-4xl font-bold text-insani-turquoise mb-2">{stat.value}</div>
                                    <div className="text-sm font-semibold text-gray-800 mb-1">{stat.title_translations?.id || (typeof stat.title === 'object' ? stat.title?.id || stat.title?.en : stat.title)}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.category}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Focus Programs (Pillars) Section */}
            {focusPrograms && focusPrograms.length > 0 && (
                <section className="py-16 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-insani-darkblue">Fokus Program</h2>
                            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                                Pilar kebaikan yang kami salurkan untuk memberdayakan dan membangkitkan harapan umat.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {focusPrograms.map((cat: any) => (
                                <Link key={cat.id} href={`/program?category=${cat.id}`} className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-all">
                                    {cat.pillar_image ? (
                                        <img src={`/storage/${cat.pillar_image}`} alt={typeof cat.name === 'object' ? cat.name?.id : cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 bg-insani-blue/20"></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                                        <h3 className="text-xl font-bold mb-1 group-hover:text-insani-turquoise transition-colors">{cat.name_translations?.id || (typeof cat.name === 'object' ? cat.name?.id || cat.name?.en : cat.name)}</h3>
                                        <div className="flex items-center text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                            <span>Lihat Program</span>
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Latest Programs Section */}
            {programs && programs.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-insani-darkblue">Bantu Mereka Sekarang</h2>
                                <p className="mt-2 text-gray-600">Pilih program kebaikan dan salurkan donasi Anda.</p>
                            </div>
                            <Link href="/program" className="hidden sm:flex items-center text-insani-blue font-semibold hover:text-insani-darkblue">
                                Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {programs.map((program: any) => (
                                <Link key={program.id} href={`/program/${program.slug}`} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                    <div className="relative h-48 md:h-56 overflow-hidden">
                                        <img 
                                            src={`/storage/${program.thumbnail_url}`} 
                                            alt={program.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-insani-blue">
                                            {typeof program.category?.name === 'object' ? program.category.name?.id || program.category.name?.en : program.category?.name}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-insani-blue transition-colors">
                                            {program.title}
                                        </h3>
                                        
                                        <div className="mt-auto pt-4 space-y-3">
                                            {/* Progress Bar */}
                                            {program.target_amount && (
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="bg-insani-turquoise h-2 rounded-full" 
                                                        style={{ width: `${Math.min(100, (program.collected_amount / program.target_amount) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-gray-500">Terkumpul</p>
                                                    <p className="font-bold text-insani-blue">{formatCurrency(program.collected_amount)}</p>
                                                </div>
                                                <Button size="sm" className="bg-insani-turquoise hover:bg-insani-turquoise/90 rounded-full px-4">
                                                    Donasi
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-8 text-center sm:hidden">
                            <Link href="/program">
                                <Button variant="outline" className="w-full rounded-full">Lihat Semua Program</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Latest Blogs Section */}
            {blogs && blogs.length > 0 && (
                <section className="py-16 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-insani-darkblue">Kabar Terbaru</h2>
                            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                                Baca berita dan laporan penyaluran program yang telah Anda dukung.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {blogs.map((blog: any) => (
                                <Link key={blog.id} href={`/berita/${blog.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group border border-slate-100">
                                    {blog.thumbnail_url && (
                                        <div className="h-48 overflow-hidden">
                                            <img src={blog.thumbnail_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="text-xs text-insani-blue font-semibold mb-2">
                                            {new Date(blog.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-insani-blue">
                                            {blog.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {blog.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                        <div className="mt-10 text-center">
                            <Link href="/berita">
                                <Button variant="outline" className="rounded-full px-8 border-insani-blue text-insani-blue hover:bg-insani-blue hover:text-white">
                                    Baca Semua Berita
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. Partners Section */}
            {partners && partners.length > 0 && (
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-8">Telah Dipercaya Oleh</h2>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
                            {partners.map((partner: any) => (
                                <a key={partner.id} href={partner.website_url || '#'} target={partner.website_url ? "_blank" : "_self"} rel="noreferrer" className="block transition hover:opacity-100 hover:scale-105">
                                    <img src={`/storage/${partner.logo_url}`} alt={partner.name} className="h-12 md:h-16 object-contain max-w-[150px]" />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </PublicLayout>
    );
}
