import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AboutIndex({ management, faqs, aboutPage }: any) {
    const { locale } = usePage().props as any;
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        if (openFaq === index) {
            setOpenFaq(null);
        } else {
            setOpenFaq(index);
        }
    };

    return (
        <PublicLayout title="Tentang Kami">
            
            {/* 1. Header Section */}
            <div className="bg-insani-darkblue text-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Tentang Kami</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                        Insani Indonesia adalah platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat.
                    </p>
                </div>
            </div>

            {/* 2. Profil & Sejarah (Dari Page Content) */}
            {aboutPage && (
                <section className="py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="prose prose-lg prose-blue mx-auto" dangerouslySetInnerHTML={{ __html: aboutPage.content_translations?.id || (typeof aboutPage.content === 'object' ? aboutPage.content?.id : aboutPage.content) }} />
                    </div>
                </section>
            )}

            {/* 3. Tim Manajemen Section */}
            {management && management.length > 0 && (
                <section className="py-16 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-insani-darkblue">Susunan Pengurus</h2>
                            <p className="mt-4 text-gray-600">Mengenal lebih dekat sosok di balik Yayasan Peduli Insani Indonesia.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {management.map((member: any) => (
                                <div key={member.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
                                    <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                                        {member.photo_url ? (
                                            <img 
                                                src={`/storage/${member.photo_url}`} 
                                                alt={member.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                No Photo
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 text-center">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                                        <p className="text-insani-blue font-medium text-sm">{member.position_translations?.id || (typeof member.position === 'object' ? member.position?.id : member.position)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. FAQ Section */}
            {faqs && faqs.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-insani-darkblue">Tanya Jawab (FAQ)</h2>
                            <p className="mt-4 text-gray-600">Pertanyaan yang sering diajukan seputar donasi di Insani Indonesia.</p>
                        </div>
                        
                        <div className="space-y-4">
                            {faqs.map((faq: any, index: number) => (
                                <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <button 
                                        className={`w-full px-6 py-5 flex justify-between items-center text-left transition-colors ${openFaq === index ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <span className="font-semibold text-gray-900">{faq.question_translations?.id || (typeof faq.question === 'object' ? faq.question?.id : faq.question)}</span>
                                        {openFaq === index ? (
                                            <ChevronUp className="w-5 h-5 text-insani-blue flex-shrink-0 ml-4" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                                        )}
                                    </button>
                                    <div 
                                        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-[500px] py-5 border-t border-slate-100 bg-white' : 'max-h-0'}`}
                                    >
                                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                            {faq.answer_translations?.id || (typeof faq.answer === 'object' ? faq.answer?.id : faq.answer)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </PublicLayout>
    );
}
