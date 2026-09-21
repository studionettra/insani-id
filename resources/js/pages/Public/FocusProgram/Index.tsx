import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import React from 'react';
import { FadeIn } from '@/components/ui/fade-in';
import PublicLayout from '@/layouts/PublicLayout';
import { getLocalizedValue } from '@/lib/utils';
import useTranslation from '@/hooks/use-translation';

export default function FocusProgramIndex({ pillars }: any) {
    const { t, locale } = useTranslation();

    return (
        <PublicLayout title={t('Fokus Program')}>
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-insani-darkblue via-slate-900 to-insani-darkblue text-white py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#00a6c0_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-insani-turquoise text-xs font-semibold mb-6 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t('Pilar Kebaikan Berkelanjutan')}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            {t('Fokus Program')}
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed font-normal">
                            {t('Pilar kebaikan utama yang kami dedikasikan untuk memberdayakan, melindungi, dan membangkitkan harapan umat di berbagai dimensi kehidupan.')}
                        </p>
                    </FadeIn>
                </div>
            </div>

            {/* Pillar Grid Section */}
            <section className="py-20 md:py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {pillars && pillars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pillars.map((cat: any, index: number) => {
                                const catName = t(getLocalizedValue(cat.name_translations || cat.name, locale));
                                const catDesc = t(getLocalizedValue(cat.description_translations || cat.description, locale)) || 
                                    t(`Dedikasi kebaikan berkelanjutan untuk program bantuan dan pemberdayaan dalam pilar ${catName}.`);

                                return (
                                    <FadeIn key={cat.id} delay={index * 0.1}>
                                        <Link 
                                            href={`/fokus-program/${cat.slug}`} 
                                            className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-brand-300 transition-all duration-300 hover:-translate-y-1.5"
                                        >
                                            <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                                                {cat.pillar_image ? (
                                                    <img 
                                                        src={`/storage/${cat.pillar_image}`} 
                                                        alt={catName} 
                                                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900 to-slate-900 text-white text-2xl font-bold px-6 text-center">
                                                        {catName}
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                                                <div className="absolute bottom-5 left-6 right-6">
                                                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
                                                        {t('Pilar')}
                                                    </span>
                                                    <h2 className="text-2xl font-bold text-white tracking-tight leading-tight group-hover:text-brand-300 transition-colors">
                                                        {catName}
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="p-6 md:p-8 flex flex-col flex-grow">
                                                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                                    {catDesc}
                                                </p>
                                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-brand-600 font-semibold text-sm group-hover:text-brand-700">
                                                    <span>{t('Pelajari Selengkapnya')}</span>
                                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                                                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                            <p className="text-slate-500">{t('Belum ada fokus program yang ditambahkan.')}</p>
                        </div>
                    )}
                </div>
            </section>

        </PublicLayout>
    );
}
