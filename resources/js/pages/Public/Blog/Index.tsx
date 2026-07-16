import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogIndex({ blogs }: any) {
    const { locale } = usePage().props as any;

    return (
        <PublicLayout title="Kabar & Berita">
            
            <div className="bg-insani-darkblue text-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Kabar & Berita</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                        Ikuti perkembangan terbaru, laporan penyaluran, dan kisah inspiratif dari program-program kebaikan Insani Indonesia.
                    </p>
                </div>
            </div>

            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {blogs && blogs.data && blogs.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {blogs.data.map((blog: any) => (
                                    <Link 
                                        key={blog.id} 
                                        href={`/berita/${blog.slug}`} 
                                        className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
                                    >
                                        {blog.thumbnail_url ? (
                                            <div className="aspect-[16/10] overflow-hidden">
                                                <img 
                                                    src={blog.thumbnail_url} 
                                                    alt={blog.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center">
                                                <span className="text-slate-400">Insani Indonesia</span>
                                            </div>
                                        )}
                                        
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                                <span className="flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                                    {new Date(blog.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center">
                                                    <User className="w-3.5 h-3.5 mr-1" />
                                                    {blog.author_name || 'Admin'}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-insani-blue transition-colors">
                                                {blog.title}
                                            </h3>
                                            
                                            <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                                                {blog.excerpt}
                                            </p>
                                            
                                            <div className="flex items-center text-insani-blue font-semibold group-hover:text-insani-darkblue">
                                                Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            
                            {/* Pagination (Simplistic) */}
                            {blogs.last_page > 1 && (
                                <div className="flex justify-center space-x-2">
                                    {blogs.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                link.active 
                                                    ? 'bg-insani-blue text-white' 
                                                    : link.url 
                                                        ? 'bg-slate-100 text-gray-700 hover:bg-slate-200' 
                                                        : 'bg-slate-50 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-gray-500">Belum ada berita yang dipublikasikan.</p>
                        </div>
                    )}
                </div>
            </section>

        </PublicLayout>
    );
}
