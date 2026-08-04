import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/PublicLayout';

export default function BlogShow({ blog, relatedBlogs }: any) {
    const { locale } = usePage().props as any;

    return (
        <PublicLayout title={blog.title}>
            
            <div className="bg-slate-50 py-12 md:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <Link href="/berita" className="inline-flex items-center text-insani-blue hover:text-insani-darkblue mb-8 font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Indeks Berita
                    </Link>
                    
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        
                        {/* Hero Image */}
                        {blog.thumbnail_url && (
                            <div className="w-full aspect-[21/9] bg-slate-100">
                                <img 
                                    src={blog.thumbnail_url} 
                                    alt={blog.title} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        )}
                        
                        <div className="p-8 md:p-12">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-6 border-b border-slate-100 pb-6">
                                <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-insani-blue" />
                                    {new Date(blog.published_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-insani-blue" />
                                    Oleh: {blog.author_name || 'Admin Insani'}
                                </span>
                            </div>
                            
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                                {blog.title}
                            </h1>
                            
                            {/* Content */}
                            <div 
                                className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: blog.content }} 
                            />
                            
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* Related Blogs Section */}
            {relatedBlogs && relatedBlogs.length > 0 && (
                <section className="py-16 bg-white border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-2xl font-bold text-insani-darkblue">Berita Lainnya</h2>
                            <Link href="/berita" className="text-insani-blue font-semibold hover:text-insani-darkblue">
                                Lihat Semua
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedBlogs.map((item: any) => (
                                <Link 
                                    key={item.id} 
                                    href={`/berita/${item.slug}`} 
                                    className="flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md transition-all duration-300 group"
                                >
                                    {item.thumbnail_url && (
                                        <div className="aspect-[16/10] overflow-hidden">
                                            <img 
                                                src={item.thumbnail_url} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="text-xs text-insani-blue font-semibold mb-2">
                                            {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-insani-blue transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </PublicLayout>
    );
}
