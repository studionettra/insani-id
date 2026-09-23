import { Head, Link } from '@inertiajs/react';
import { 
    ArrowRight, 
    ArrowUpRight, 
    ChevronRight, 
    Heart, 
    Play, 
    Sparkles, 
    ShieldCheck, 
    ImageIcon, 
    X, 
    Info, 
    Share2, 
    TrendingUp, 
    Layers
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/fade-in';
import PublicLayout from '@/layouts/PublicLayout';
import { formatCurrency, getLocalizedValue } from '@/lib/utils';
import DonationProgressBar from '@/components/donation/DonationProgressBar';
import { renderStatIcon } from '@/components/ui/icon-picker';
import useTranslation from '@/hooks/use-translation';

interface FocusProgramShowProps {
    pillar: any;
    programs: any[];
    otherPillars: any[];
}

export default function FocusProgramShow({ pillar, programs, otherPillars }: FocusProgramShowProps) {
    const { t, locale } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const pillarTitle = t(getLocalizedValue(pillar.name_translations || pillar.name, locale));
    const pillarDesc = t(getLocalizedValue(pillar.description_translations || pillar.description, locale));
    const realityTitle = t(getLocalizedValue(pillar.reality_title_translations || pillar.reality_title, locale));
    const realityDesc = t(getLocalizedValue(pillar.reality_description_translations || pillar.reality_description, locale));
    const realitySource = pillar.reality_source;
    const metrics = Array.isArray(pillar.stats_metrics) ? pillar.stats_metrics : [];
    const gallery = Array.isArray(pillar.distribution_gallery) ? pillar.distribution_gallery : [];

    // Helper to get YouTube Embed URL
    const getYouTubeEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0` : null;
    };

    const youtubeEmbedUrl = getYouTubeEmbedUrl(pillar.video_url);
    const cleanDesc = (pillarDesc || '').replace(/<[^>]*>?/gm, '').slice(0, 160);
    const pillarImageUrl = pillar.pillar_image ? `/storage/${pillar.pillar_image}` : '/images/logo/logo-landscape-color.png';

    return (
        <PublicLayout title={`${pillarTitle} - ${t('Fokus Program')}`}>
            <Head>
                <meta name="description" content={cleanDesc} />
                <meta property="og:title" content={`${pillarTitle} - ${t('Fokus Program')} - Insani Indonesia`} />
                <meta property="og:description" content={cleanDesc} />
                <meta property="og:image" content={pillarImageUrl} />
                <meta name="twitter:title" content={`${pillarTitle} - ${t('Fokus Program')} - Insani Indonesia`} />
                <meta name="twitter:description" content={cleanDesc} />
                <meta name="twitter:image" content={pillarImageUrl} />
            </Head>
            
            {/* 1. Hero Section */}
            <section className="relative w-full min-h-[520px] md:min-h-[600px] flex items-center bg-slate-950 text-white overflow-hidden">
                {pillar.pillar_image ? (
                    <img 
                        src={`/storage/${pillar.pillar_image}`} 
                        alt={pillarTitle} 
                        className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-75 scale-105 transform transition-transform duration-1000" 
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-insani-darkblue via-slate-900 to-slate-950 opacity-95"></div>
                )}

                {/* Ambient glow overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,166,192,0.18),transparent_50%)]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10 w-full">
                    {/* Breadcrumbs */}
                    <FadeIn>
                        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-xs md:text-sm text-slate-300/80 mb-6 font-medium">
                            <Link href="/" className="hover:text-white transition-colors">{t('Beranda')}</Link>
                            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-500" />
                            <Link href="/fokus-program" className="hover:text-white transition-colors">{t('Fokus Program')}</Link>
                            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-500" />
                            <span className="text-insani-turquoise truncate max-w-[200px] md:max-w-none">{pillarTitle}</span>
                        </nav>
                    </FadeIn>

                    <div className="max-w-3xl">
                        <FadeIn delay={0.1}>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-insani-turquoise text-xs font-semibold uppercase tracking-wider mb-5 border border-white/15">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{t('Fokus Program')}</span>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                                {pillarTitle}
                            </h1>
                        </FadeIn>

                        {pillarDesc && (
                            <FadeIn delay={0.3}>
                                <p className="text-lg md:text-xl text-slate-200/90 leading-relaxed mb-8 max-w-2xl font-normal">
                                    {pillarDesc}
                                </p>
                            </FadeIn>
                        )}

                        <FadeIn delay={0.4}>
                            <div className="flex flex-wrap gap-4 items-center pt-2">
                                <Button 
                                    size="lg" 
                                    asChild 
                                    className="bg-brand-600 hover:bg-brand-500 text-white rounded-full font-semibold px-8 h-12 shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <a href="#campaigns">
                                        <Heart className="w-4 h-4 mr-2 fill-current" />
                                        {t('Donasi Program Ini')}
                                    </a>
                                </Button>
                                {(realityTitle || metrics.length > 0) && (
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        asChild 
                                        className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full font-medium px-6 h-12 backdrop-blur-md transition-all active:scale-[0.98]"
                                    >
                                        <a href="#realitas">
                                            {t('Pelajari Realitas')}
                                            <ArrowRight className="w-4 h-4 ml-2 rtl:rotate-180" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* 2. Reality & Problem Statement Section */}
            {(realityTitle || realityDesc || metrics.length > 0) && (
                <section id="realitas" className="py-20 md:py-32 bg-white relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                            
                            {/* Left Column: Context & Narrative */}
                            <div className="lg:col-span-5 lg:sticky lg:top-28">
                                <FadeIn>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-100">
                                        <Info className="w-3.5 h-3.5" />
                                        <span>{t('Kondisi Nyata Lapangan')}</span>
                                    </div>

                                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-6">
                                        {realityTitle || t('Mengapa Fokus Ini Sangat Krusial?')}
                                    </h2>

                                    <p className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-line mb-6">
                                        {realityDesc || t('Banyak saudara kita yang berhadapan dengan situasi krisis dan membutuhkan uluran tangan kebaikan sesegera mungkin. Setiap kontribusi Anda memberikan napas baru dan harapan nyata.')}
                                    </p>

                                    {realitySource && (
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium">
                                            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                                            <span>{realitySource}</span>
                                        </div>
                                    )}
                                </FadeIn>
                            </div>

                            {/* Right Column: Key Stats Counters */}
                            <div className="lg:col-span-7">
                                {metrics.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {metrics.map((metric: any, idx: number) => {
                                            const labelText = typeof metric.label === 'object' 
                                                ? getLocalizedValue(metric.label, locale) 
                                                : metric.label;

                                            return (
                                                <FadeIn 
                                                    key={idx} 
                                                    delay={idx * 0.1}
                                                    className="p-8 rounded-3xl bg-slate-50/80 border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                                                >
                                                    {metric.icon && (
                                                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                                                            {renderStatIcon(metric.icon, "w-6 h-6")}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors mb-2">
                                                            {metric.value}
                                                        </div>
                                                        <div className="text-slate-600 text-sm md:text-base font-medium leading-snug">
                                                            {t(labelText)}
                                                        </div>
                                                    </div>
                                                </FadeIn>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 text-slate-500 text-sm">
                                        <TrendingUp className="w-6 h-6 text-brand-600 shrink-0" />
                                        <span>{t('Data dan metrik dampak sedang diperbarui oleh tim monitoring evaluasi Insani.')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Video Documentation Section */}
            {youtubeEmbedUrl && (
                <section className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <FadeIn className="text-center max-w-2xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-insani-turquoise text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
                                <Play className="w-3 h-3 fill-current" />
                                <span>{t('Dokumentasi Video')}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                {t('Aksi Nyata & Suara Penerima Manfaat')}
                            </h2>
                            <p className="text-slate-300 text-sm md:text-base">
                                {t('Saksikan langsung bagaimana amanah donasi Anda sampai dan membawa dampak kebaikan bagi sesama.')}
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.2} className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video bg-black">
                            <iframe 
                                src={youtubeEmbedUrl} 
                                title={`${pillarTitle} Documentation`} 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen 
                                className="w-full h-full"
                            ></iframe>
                        </FadeIn>
                    </div>
                </section>
            )}

            {/* 4. Distribution Photo Gallery Section */}
            {gallery.length > 0 && (
                <section className="py-20 md:py-28 bg-slate-50 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider mb-3">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>{t('Dokumentasi Penyaluran')}</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                                    {t('Jejak Langkah Distribusi di Lapangan')}
                                </h2>
                            </div>
                            <p className="text-slate-500 text-sm max-w-md">
                                {t('Dokumentasi transparan penyaluran bantuan langsung dari tim relawan Insani Indonesia kepada para penerima manfaat.')}
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {gallery.map((imgPath: string, idx: number) => (
                                <FadeIn key={idx} delay={idx * 0.05}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(`/storage/${imgPath}`)}
                                        className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-200/60 shadow-xs hover:shadow-xl transition-all duration-300 block text-left focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    >
                                        <img 
                                            src={`/storage/${imgPath}`} 
                                            alt={`${pillarTitle} gallery ${idx + 1}`} 
                                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out" 
                                        />
                                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                            <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                                                <ArrowUpRight className="w-5 h-5 rtl:rotate-90" />
                                            </div>
                                        </div>
                                    </button>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Lightbox Modal for Gallery */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        type="button"
                        onClick={() => setSelectedImage(null)} 
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        aria-label="Tutup"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Preview Dokumentasi" 
                        className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

            {/* 5. Related Campaigns Section */}
            <section id="campaigns" className="py-20 md:py-32 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                                <Heart className="w-3.5 h-3.5 fill-current" />
                                <span>{t('Aksi Nyata Anda')}</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                                {t('Program Donasi Terkait')}
                            </h2>
                            <p className="text-slate-600 text-base mt-2 max-w-xl">
                                {t('Pilih kampanye bantuan di bawah fokus ini dan salurkan kebaikan Anda sekarang.')}
                            </p>
                        </div>
                        {programs.length > 0 && (
                            <div>
                                <Button asChild variant="outline" className="rounded-full px-6 h-11 border-slate-200 hover:bg-slate-50 text-slate-900 font-medium">
                                    <Link href={`/program?category=${pillar.id}`}>
                                        {t('Lihat Semua di Katalog')}
                                        <ArrowRight className="w-4 h-4 ml-2 rtl:rotate-180" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </FadeIn>

                    {programs && programs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {programs.map((program: any, idx: number) => (
                                <FadeIn key={program.id} delay={idx * 0.1}>
                                    <Link 
                                        href={`/program/${program.slug}`} 
                                        className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300"
                                    >
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                            {program.cover_image ? (
                                                <img 
                                                    src={`/storage/${program.cover_image}`} 
                                                    alt={getLocalizedValue(program.title, locale)} 
                                                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                    Insani.id
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xs">
                                                {pillarTitle}
                                            </div>
                                        </div>

                                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight">
                                                {getLocalizedValue(program.title, locale)}
                                            </h3>

                                            <div className="mt-auto pt-4 border-t border-slate-100">
                                                <div className="mb-4">
                                                    <DonationProgressBar 
                                                        collectedAmount={program.collected_amount}
                                                        targetAmount={program.target_amount}
                                                        size="sm"
                                                        percentagePlacement="top-right"
                                                        percentageFormat="badge"
                                                    />
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">{t('Terkumpul')}</p>
                                                        <p className="font-bold text-slate-900 tracking-tight text-lg">
                                                            {formatCurrency(program.collected_amount)}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm font-bold text-brand-600 flex items-center group-hover:translate-x-1 transition-transform">
                                                        <span>{t('Donasi')}</span>
                                                        <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
                            <p className="text-slate-600 text-base mb-4">
                                {t('Saat ini belum ada kampanye spesifik yang terbit di bawah fokus ini.')}
                            </p>
                            <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white rounded-full">
                                <Link href="/program">{t('Jelajahi Program Lainnya')}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* 6. Other Focus Programs Navigation */}
            {otherPillars && otherPillars.length > 0 && (
                <section className="py-20 bg-slate-50 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <FadeIn className="mb-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <Layers className="w-4 h-4" />
                                <span>{t('Eksplorasi Fokus Lain')}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                                {t('Fokus Program Lainnya')}
                            </h2>
                        </FadeIn>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {otherPillars.map((other: any) => {
                                const title = t(getLocalizedValue(other.name_translations || other.name, locale));
                                return (
                                    <Link 
                                        key={other.id} 
                                        href={`/fokus-program/${other.slug}`} 
                                        className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-brand-300 transition-all flex flex-col justify-between"
                                    >
                                        <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-4 relative">
                                            {other.pillar_image ? (
                                                <img 
                                                    src={`/storage/${other.pillar_image}`} 
                                                    alt={title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-semibold text-sm">
                                                    {title}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-base line-clamp-1">
                                                {title}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-brand-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2 rtl:rotate-180" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* 7. Bottom Quick Donate Call to Action */}
            <section className="py-20 bg-gradient-to-br from-insani-darkblue to-slate-950 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#00a6c0_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            {t('Bersama Nyalakan Harapan di')} {pillarTitle}
                        </h2>
                        <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                            {t('Dukungan dan kepedulian Anda menghadirkan perubahan besar bagi mereka yang membutuhkan. Mari salurkan kebaikan terbaik Anda hari ini.')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" asChild className="bg-brand-600 hover:bg-brand-500 text-white rounded-full font-semibold px-8 h-12 shadow-xl shadow-brand-600/30">
                                <a href="#campaigns">
                                    <Heart className="w-4 h-4 mr-2 fill-current" />
                                    {t('Pilih Kampanye Sekarang')}
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full px-6 h-12 backdrop-blur-md">
                                <Link href="/program">
                                    {t('Jelajahi Semua Program')}
                                    <ArrowRight className="w-4 h-4 ml-2 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </div>
                    </FadeIn>
                </div>
            </section>

        </PublicLayout>
    );
}
