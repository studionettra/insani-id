import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';


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

    const deletePage = (page: any) => {
        if (confirm(`Apakah Anda yakin ingin menghapus halaman "${page.title_translations?.id || page.title}"?`)) {
            router.delete(`/admin/pages/${page.id}`);
        }
    };

    return (
        <>
            <Head title="Manajemen Halaman" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Halaman (Pages)</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola halaman statis seperti Tentang Kami, Syarat & Ketentuan, dll.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari judul/slug..."
                                className="w-full pl-8 sm:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Link href="/admin/pages/create">
                            <Button className="bg-insani-turquoise hover:bg-insani-turquoise/90 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Halaman
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-medium">Judul (ID)</TableCell>
                                <TableCell className="font-medium">Slug</TableCell>
                                <TableCell className="font-medium text-center">Status</TableCell>
                                <TableCell className="text-right font-medium">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data halaman.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pages.data.map((page: any) => (
                                    <TableRow key={page.id}>
                                        <TableCell>
                                            <div className="font-medium">{page.title_translations?.id || page.title}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {page.meta_title_translations?.id || ''}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer" className="text-insani-blue hover:underline">
                                                /{page.slug}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {page.is_active ? (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/pages/${page.id}/edit`}>
                                                    <Button variant="outline" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deletePage(page)}
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
