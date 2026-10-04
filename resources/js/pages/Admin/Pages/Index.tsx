import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';


export default function PagesIndex({ pages, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/pages',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const [pageToDelete, setPageToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeletePage = () => {
        if (!pageToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/pages/${pageToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setPageToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Halaman" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Halaman Statis</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola halaman statis seperti Tentang Kami, Syarat & Ketentuan, dll.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-gray-400 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari judul/slug..."
                                className="w-full pl-8 sm:w-[250px] border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Link href="/admin/pages/create">
                            <Button className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Halaman
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-x-auto shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                            <TableRow>
                                <TableCell className="font-medium text-gray-500 dark:text-gray-400">Judul Halaman</TableCell>
                                <TableCell className="font-medium text-gray-500 dark:text-gray-400">Slug / Tautan Publik</TableCell>
                                <TableCell className="font-medium text-gray-500 dark:text-gray-400 text-center">Status Terjemahan</TableCell>
                                <TableCell className="font-medium text-gray-500 dark:text-gray-400 text-center">Status</TableCell>
                                <TableCell className="text-right font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data halaman.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pages.data.map((page: any) => {
                                    const hasId = Boolean(page.title?.id || (typeof page.title === 'string' && page.title));
                                    const hasEn = Boolean(page.title?.en && (page.content_html?.en || typeof page.content_html === 'string'));
                                    const hasAr = Boolean(page.title?.ar && (page.content_html?.ar || typeof page.content_html === 'string'));
                                    const isFullyTranslated = hasId && hasEn && hasAr;
                                    const isCleanSlug = ['syarat-ketentuan', 'kebijakan-privasi', 'cara-donasi', 'pusat-bantuan', 'logo'].includes(page.slug);
                                    const publicUrl = isCleanSlug ? `/${page.slug}` : `/halaman/${page.slug}`;

                                    return (
                                        <TableRow key={page.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <TableCell>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {typeof page.title === 'string' ? page.title : (page.title?.id || '')}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[240px] mt-0.5">
                                                    {typeof page.meta_title === 'string' ? page.meta_title : (page.meta_title?.id || page.meta_description?.id || '')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <a 
                                                    href={publicUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="inline-flex items-center gap-1 text-[#1A56DB] dark:text-blue-400 hover:underline font-mono text-xs bg-blue-50/70 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/60"
                                                >
                                                    {publicUrl}
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex flex-col items-center gap-1">
                                                    <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                                                        <span 
                                                            title={hasId ? 'Bahasa Indonesia: Tersedia' : 'Bahasa Indonesia: Belum'} 
                                                            className={`px-1.5 py-0.5 rounded font-semibold ${
                                                                hasId 
                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                            }`}
                                                        >
                                                            ID {hasId ? '✓' : '—'}
                                                        </span>
                                                        <span 
                                                            title={hasEn ? 'Bahasa Inggris: Tersedia' : 'Bahasa Inggris: Belum'} 
                                                            className={`px-1.5 py-0.5 rounded font-semibold ${
                                                                hasEn 
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                            }`}
                                                        >
                                                            EN {hasEn ? '✓' : '—'}
                                                        </span>
                                                        <span 
                                                            title={hasAr ? 'Bahasa Arab: Tersedia' : 'Bahasa Arab: Belum'} 
                                                            className={`px-1.5 py-0.5 rounded font-semibold ${
                                                                hasAr 
                                                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' 
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                            }`}
                                                        >
                                                            AR {hasAr ? '✓' : '—'}
                                                        </span>
                                                    </div>
                                                    {isFullyTranslated ? (
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                            3 Bahasa Siap
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                            Perlu Terjemahan
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {page.is_active ? (
                                                    <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-800">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/pages/${page.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#1A56DB] dark:hover:text-blue-400" title="Sunting Halaman">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                        title="Hapus Halaman"
                                                        onClick={() => setPageToDelete(page)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                <ConfirmDialog
                    open={!!pageToDelete}
                    onOpenChange={(open) => !open && setPageToDelete(null)}
                    title="Hapus Halaman"
                    description={`Apakah Anda yakin ingin menghapus halaman "${pageToDelete?.title_translations?.id || (typeof pageToDelete?.title === 'string' ? pageToDelete.title : pageToDelete?.title?.id || '')}"? Tindakan ini tidak dapat dibatalkan.`}
                    variant="danger"
                    loading={isDeleting}
                    onConfirm={handleDeletePage}
                />
            </div>
        </>
    );
}

PagesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Halaman',
            href: '/admin/pages',
        },
    ],
};
