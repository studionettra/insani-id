import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Category {
    id: number;
    name: { id: string };
}

interface Program {
    id: number;
    title: { id: string };
    slug: string;
    category: { title: { id: string }, name: { id: string } };
    target_amount: string | null;
    collected_amount: number;
    cover_image: string;
}

interface Props {
    programs: {
        data: Program[];
        current_page: number;
        last_page: number;
        links: any[];
    };
    categories: Category[];
    filters: {
        category: string | null;
        search: string | null;
    };
}

export default function ProgramListing({ programs, categories, filters }: Props) {
    const handleFilterChange = (key: string, value: string) => {
        const query = { ...filters, [key]: value || undefined };
        router.get('/program', query, { preserveState: true });
    };

    return (
        <PublicLayout>
            <Head title="Program Donasi" />

            <div className="bg-white">
                {/* Hero Section */}
                <div className="bg-insani-blue/5 py-12 md:py-20">
                    <div className="container mx-auto px-4 max-w-6xl text-center">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Program Donasi</h1>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            Pilih program kebaikan yang ingin Anda dukung hari ini. Setiap donasi Anda membawa harapan baru bagi mereka yang membutuhkan.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-6xl py-12">
                    {/* Filters & Search Modern UI */}
                    <div className="flex flex-col gap-6 mb-12 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 items-center justify-center relative overflow-hidden">
                        
                        {/* Subtle Background Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-insani-blue/20 via-insani-blue to-insani-blue/20"></div>

                        {/* Search & Sort Centered */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl justify-center z-10">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input 
                                    type="text"
                                    placeholder="Cari program donasi..."
                                    className="pl-12 h-12 w-full bg-slate-50/80 border-slate-200 focus:bg-white focus:border-insani-blue focus:ring-insani-blue/20 rounded-xl transition-all text-base shadow-sm"
                                    defaultValue={filters.search || ''}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            handleFilterChange('search', e.currentTarget.value);
                                        }
                                    }}
                                />
                            </div>
                            <select
                                className="h-12 rounded-xl border border-slate-200 bg-slate-50/80 px-5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-insani-blue/20 focus:bg-white focus:border-insani-blue transition-all cursor-pointer min-w-[180px] shadow-sm"
                                value={filters.sort || 'terbaru'}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="terbaru">Terbaru</option>
                                <option value="terlama">Terlama</option>
                                <option value="terbanyak">Terkumpul Terbanyak</option>
                            </select>
                        </div>

                        {/* Divider */}
                        <div className="w-full max-w-4xl h-px bg-slate-100 my-1 z-10"></div>

                        {/* Categories Tabs (Wrap & Centered) */}
                        <div className="w-full flex flex-wrap justify-center gap-3 z-10">
                            <button 
                                onClick={() => handleFilterChange('category', '')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                    !filters.category 
                                        ? 'bg-insani-blue text-white shadow-md shadow-insani-blue/30 scale-100' 
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-insani-blue border border-slate-200/60 hover:border-insani-blue/30 scale-95 hover:scale-100'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => handleFilterChange('category', cat.id.toString())}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                        filters.category == cat.id.toString() 
                                            ? 'bg-insani-blue text-white shadow-md shadow-insani-blue/30 scale-100' 
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-insani-blue border border-slate-200/60 hover:border-insani-blue/30 scale-95 hover:scale-100'
                                    }`}
                                >
                                    {cat.name.id || cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Program Grid */}
                    {programs.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {programs.data.map(program => {
                                const progress = program.target_amount 
                                    ? Math.min(100, Math.round((program.collected_amount / parseFloat(program.target_amount)) * 100))
                                    : null;

                                return (
                                    <Link key={program.id} href={`/program/${program.slug}`} className="group h-full">
                                        <Card className="h-full flex flex-col overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                            <div className="relative h-48 overflow-hidden">
                                                <img 
                                                    src={`/storage/${program.cover_image}`} 
                                                    alt={program.title as string} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <Badge className="absolute top-3 right-3 bg-white/90 text-insani-blue hover:bg-white backdrop-blur-sm border-none font-semibold">
                                                    {program.category?.name?.id || 'Kategori'}
                                                </Badge>
                                            </div>
                                            <CardContent className="flex-1 p-5 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-insani-blue transition-colors">
                                                        {program.title}
                                                    </h3>
                                                </div>

                                                <div className="mt-4">
                                                    {progress !== null ? (
                                                        <>
                                                            <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                                                                <div 
                                                                    className="bg-insani-blue h-2 rounded-full transition-all duration-1000 ease-out" 
                                                                    style={{ width: `${progress}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex justify-between items-end text-sm">
                                                                <div>
                                                                    <p className="text-slate-500 text-xs mb-1">Terkumpul</p>
                                                                    <p className="font-bold text-insani-blue">{formatCurrency(program.collected_amount)}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-slate-500 text-xs mb-1">Sisa Hari</p>
                                                                    <p className="font-medium text-slate-700">{/* To be calculated */} ∞</p>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="pt-2 border-t border-slate-100">
                                                            <p className="text-slate-500 text-xs mb-1">Terkumpul</p>
                                                            <p className="font-bold text-insani-blue text-lg">{formatCurrency(program.collected_amount)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Program Tidak Ditemukan</h3>
                            <p className="text-slate-500">Silakan coba dengan kata kunci atau kategori yang berbeda.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {programs.last_page > 1 && (
                        <div className="flex justify-center mt-12">
                            <div className="flex space-x-2">
                                {programs.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                            link.active
                                                ? 'bg-insani-blue text-white shadow-md'
                                                : link.url 
                                                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-insani-blue' 
                                                    : 'bg-transparent text-slate-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
