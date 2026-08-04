import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import PublicLayout from '@/layouts/PublicLayout';

export default function FocusProgramIndex({ pillars }: any) {
    const { locale } = usePage().props as any;

    return (
        <PublicLayout title="Fokus Program">
            
            <div className="bg-insani-darkblue text-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Fokus Program</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                        Pilar kebaikan utama yang kami dedikasikan untuk memberdayakan dan membangkitkan harapan umat.
                    </p>
                </div>
            </div>

            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {pillars && pillars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pillars.map((cat: any) => (
                                <Link 
                                    key={cat.id} 
                                    href={`/program?category=${cat.id}`} 
                                    className="group flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
                                        {cat.pillar_image ? (
                                            <img 
                                                src={`/storage/${cat.pillar_image}`} 
                                                alt={typeof cat.name === 'object' ? cat.name?.id : cat.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-insani-blue/10 text-insani-blue text-xl font-bold">
                                                {typeof cat.name === 'object' ? cat.name?.id || cat.name?.en : cat.name}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <h3 className="absolute bottom-6 left-6 right-6 text-2xl font-bold text-white group-hover:text-insani-turquoise transition-colors">
                                            {cat.name_translations?.id || (typeof cat.name === 'object' ? cat.name?.id || cat.name?.en : cat.name)}
                                        </h3>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <p className="text-gray-600 mb-6 flex-grow">
                                            {cat.description_translations?.id || (typeof cat.description === 'object' ? cat.description?.id : cat.description) || `Berbagai program donasi dan kebaikan yang berfokus pada ${typeof cat.name === 'object' ? cat.name?.id : cat.name}.`}
                                        </p>
                                        <div className="flex items-center text-insani-blue font-semibold group-hover:text-insani-darkblue">
                                            Lihat Program <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-gray-500">Belum ada fokus program yang ditambahkan.</p>
                        </div>
                    )}
                </div>
            </section>

        </PublicLayout>
    );
}
