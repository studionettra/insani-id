import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    Compass, 
    Plus, 
    Search, 
    ExternalLink, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    Video, 
    Image as ImageIcon, 
    BarChart2, 
    FileText, 
    Edit,
    Power,
    Layers,
    ArrowUpRight
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { renderStatIcon } from '@/components/ui/icon-picker';

interface FocusProgramItem {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    pillar_image: string | null;
    is_focus_program: boolean;
    is_active: boolean;
    sort_order: number;
    name_translations: { id?: string; en?: string; ar?: string };
    public_name_translations: { id?: string; en?: string; ar?: string };
    description_translations: { id?: string; en?: string; ar?: string };
    display_name: string;
    has_cover: boolean;
    has_reality: boolean;
    has_video: boolean;
    gallery_count: number;
    metrics_count: number;
    programs_count: number;
}

interface AvailableCategory {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
}

interface Props {
    focusPrograms: FocusProgramItem[];
    availableCategories: AvailableCategory[];
    filters: { search?: string };
}

export default function FocusProgramIndex({ focusPrograms, availableCategories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const { post, processing } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/focus-programs', { search }, { preserveState: true, preserveScroll: true });
    };

    const handleActivateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryId) return;

        router.post('/admin/focus-programs', {
            category_id: selectedCategoryId,
        }, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setSelectedCategoryId('');
            },
        });
    };

    const handleToggleStatus = (category: FocusProgramItem) => {
        router.patch(`/admin/focus-programs/${category.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Manajemen Fokus Program" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 text-[#1A56DB] dark:bg-blue-950/60 dark:text-blue-400">
                                <Compass className="w-6 h-6" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Fokus Program
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Dedikasi program utama, narasi krisis lapangan, galeri dokumentasi, dan metrik dampak publik.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/fokus-program"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors shadow-xs"
                        >
                            <span>Lihat Halaman Publik</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        <Button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#1A56DB] hover:bg-[#1e40af] text-white shadow-xs"
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> Tambah Fokus Program
                        </Button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Cari berdasarkan nama fokus program atau kategori..."
                            className="pl-9 bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-sm focus-visible:ring-[#1A56DB]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Total: <span className="font-semibold text-gray-900 dark:text-white">{focusPrograms.length}</span> Fokus Program Aktif
                    </div>
                </div>

                {/* Grid List */}
                {focusPrograms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1A56DB] dark:text-blue-400 flex items-center justify-center mb-4">
                            <Compass className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            Belum Ada Fokus Program yang Ditetapkan
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
                            Pilih kategori program donasi yang ingin Anda tampilkan sebagai fokus program utama di halaman Beranda dan landing page Fokus Program.
                        </p>
                        <Button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#1A56DB] hover:bg-[#1e40af] text-white"
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> Pilih Kategori Sekarang
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {focusPrograms.map((item) => {
                            const customPublicName = item.public_name_translations?.id;
                            const categoryName = item.name_translations?.id || item.name;
                            const titleToDisplay = customPublicName || categoryName;

                            return (
                                <div 
                                    key={item.id}
                                    className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200"
                                >
                                    {/* Cover Preview Image */}
                                    <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                                        {item.pillar_image ? (
                                            <img 
                                                src={`/storage/${item.pillar_image}`} 
                                                alt={titleToDisplay}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-400 p-4 text-center">
                                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-xs">Belum ada cover foto fokus program</span>
                                            </div>
                                        )}

                                        {/* Status Badges Overlay */}
                                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-800 dark:text-gray-200 shadow-xs">
                                                <Layers className="w-3 h-3 text-[#1A56DB]" />
                                                <span>{categoryName}</span>
                                            </span>

                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-md ${
                                                item.is_focus_program 
                                                    ? 'bg-emerald-500/90 text-white' 
                                                    : 'bg-zinc-800/80 text-zinc-300'
                                            }`}>
                                                {item.is_focus_program ? 'Aktif di Publik' : 'Draft / Nonaktif'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Card Body */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug line-clamp-2">
                                                    {titleToDisplay}
                                                </h3>
                                            </div>

                                            {customPublicName && (
                                                <div className="mb-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-[#1A56DB] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                                        <Sparkles className="w-3 h-3" /> Nama Publik Kustom
                                                    </span>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                                                {item.description_translations?.id || 'Belum ada deskripsi narasi pendukung fokus program ini.'}
                                            </p>

                                            {/* Kelengkapan Konten Checklist */}
                                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2 mb-4">
                                                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                    Kelengkapan Konten Landing Page
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.has_reality ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                        )}
                                                        <span className={item.has_reality ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                                                            Narasi Krisis
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {item.has_video ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        )}
                                                        <span className={item.has_video ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                                                            Video YouTube
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {item.gallery_count > 0 ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                        )}
                                                        <span className={item.gallery_count > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                                                            {item.gallery_count} Foto Galeri
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {item.metrics_count > 0 ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                        )}
                                                        <span className={item.metrics_count > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                                                            {item.metrics_count} Metrik Dampak
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleStatus(item)}
                                                className={`h-8 text-xs font-medium px-2.5 ${
                                                    item.is_focus_program
                                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50'
                                                        : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50'
                                                }`}
                                            >
                                                <Power className="w-3.5 h-3.5 mr-1" />
                                                {item.is_focus_program ? 'Nonaktifkan' : 'Aktifkan'}
                                            </Button>

                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    href={`/fokus-program/${item.slug}`}
                                                    target="_blank"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title="Preview Landing Page Publik"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>

                                                <Link
                                                    href={`/admin/focus-programs/${item.id}/edit`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#1A56DB] hover:bg-[#1e40af] rounded-lg transition-colors shadow-xs"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    <span>Kelola Konten</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Tambah / Aktifkan Kategori Menjadi Fokus Program */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[480px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleActivateCategory}>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Compass className="w-5 h-5 text-[#1A56DB]" />
                                <span>Tambah Fokus Program</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Pilih kategori donasi yang ingin Anda jadikan fokus program di halaman Fokus Program.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            {availableCategories.length === 0 ? (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                                    Semua kategori program donasi yang ada saat ini sudah diaktifkan sebagai Fokus Program. Jika Anda ingin menambah fokus program baru, buat kategori baru terlebih dahulu di menu <strong>Kategori Program</strong>.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                        Pilih Kategori Donasi
                                    </label>
                                    <Select 
                                        value={selectedCategoryId} 
                                        onValueChange={setSelectedCategoryId}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            <SelectValue placeholder="-- Pilih Kategori --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{renderStatIcon(cat.icon, "w-4 h-4 text-blue-500")}</span>
                                                        <span>{cat.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Setelah diaktifkan, Anda dapat menentukan nama publik khusus, narasi urgensi, video dokumentasi, dan galeri fokus program.
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                className="border-gray-200 dark:border-gray-700"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!selectedCategoryId || processing}
                                className="bg-[#1A56DB] hover:bg-[#1e40af] text-white"
                            >
                                {processing ? 'Mengaktifkan...' : 'Aktifkan & Lanjutkan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

FocusProgramIndex.layout = {
    breadcrumbs: [
        {
            title: 'Fokus Program',
            href: '#',
        },
    ],
};
