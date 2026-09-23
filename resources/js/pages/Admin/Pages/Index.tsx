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
                                <TableCell className="font-medium text-gray-500 dark:text-gray-400">Judul (ID)</TableCell>
                                <TableCell className="font-medium text-gray-500 dark:text-gray-400">Slug</TableCell>
                                <TableCell className="font-medium text-gray-500 dark:text-gray-400 text-center">Status</TableCell>
                                <TableCell className="text-right font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data halaman.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pages.data.map((page: any) => (
                                    <TableRow key={page.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {typeof page.title === 'string' ? page.title : (page.title?.id || '')}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                {typeof page.meta_title === 'string' ? page.meta_title : (page.meta_title?.id || '')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <a 
                                                href={['syarat-ketentuan', 'kebijakan-privasi', 'cara-donasi', 'pusat-bantuan'].includes(page.slug) ? `/${page.slug}` : `/halaman/${page.slug}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="text-[#1A56DB] dark:text-blue-400 hover:underline font-mono text-xs"
                                            >
                                                {['syarat-ketentuan', 'kebijakan-privasi', 'cara-donasi', 'pusat-bantuan'].includes(page.slug) ? `/${page.slug}` : `/halaman/${page.slug}`}
                                            </a>
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#1A56DB] dark:hover:text-blue-400">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                    onClick={() => setPageToDelete(page)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
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
