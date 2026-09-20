import { Head, Link, router } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    ExternalLink, 
    Calendar, 
    User, 
    RefreshCw, 
    Filter, 
    CheckCircle2, 
    Clock, 
    FileText,
    Eye
} from 'lucide-react';
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

interface BlogsIndexProps {
    blogs: any;
    categories: string[];
    filters: {
        search?: string;
        status?: string;
    };
}

export default function BlogsIndex({ blogs, categories, filters }: BlogsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deletingBlog, setDeletingBlog] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/blogs',
            { 
                search: search || undefined, 
                status: status || undefined 
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get(
            '/admin/blogs',
            { 
                search: search || undefined, 
                status: newStatus || undefined 
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = () => {
        if (!deletingBlog) return;
        setIsDeleting(true);
        router.delete(`/admin/blogs/${deletingBlog.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeletingBlog(null);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Berita" />

            <div className="flex flex-col gap-6 p-6">
                
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Manajemen Berita & Kabar
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Tulis, sunting, dan kelola seluruh artikel berita kegiatan dan penyaluran program Insani.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button asChild size="sm" className="h-9 bg-insani-blue hover:bg-insani-darkblue text-white shadow-xs">
                            <Link href="/admin/blogs/create">
                                <Plus className="w-4 h-4 mr-1.5" />
                                Tulis Berita Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium self-start">
                            <button
                                type="button"
                                onClick={() => handleStatusChange('')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    !status 
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                Semua Status
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('published')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    status === 'published' 
                                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                Diterbitkan
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('draft')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    status === 'draft' 
                                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                Draf
                            </button>
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
                            <div className="relative w-full">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari judul atau kategori..."
                                    className="w-full pl-9 h-9 text-sm"
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="h-9 px-3 text-xs shrink-0">
                                Cari
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <TableCell className="w-16 font-semibold text-xs">Foto</TableCell>
                                    <TableCell className="font-semibold text-xs">Judul & Ringkasan</TableCell>
                                    <TableCell className="font-semibold text-xs">Kategori</TableCell>
                                    <TableCell className="font-semibold text-xs">Penulis</TableCell>
                                    <TableCell className="font-semibold text-xs">Status</TableCell>
                                    <TableCell className="text-center font-semibold text-xs">Dilihat</TableCell>
                                    <TableCell className="font-semibold text-xs">Tanggal Terbit</TableCell>
                                    <TableCell className="text-right font-semibold text-xs">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogs && blogs.data && blogs.data.length > 0 ? (
                                    blogs.data.map((blog: any) => (
                                        <TableRow key={blog.id}>
                                            <TableCell>
                                                {blog.thumbnail_url || blog.featured_image_url ? (
                                                    <img 
                                                        src={blog.thumbnail_url || blog.featured_image_url} 
                                                        alt={blog.title} 
                                                        className="w-12 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0" 
                                                    />
                                                ) : (
                                                    <div className="w-12 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-medium shrink-0">
                                                        No Img
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                    {blog.title}
                                                </div>
                                                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                    {blog.excerpt || 'Tidak ada ringkasan'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-1">
                                                    /{blog.slug}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
                                                    {blog.wp_category || 'Umum'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                <span className="inline-flex items-center">
                                                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                    {blog.author?.name || blog.author_name || 'Admin Insani'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {blog.status === 'published' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                        <CheckCircle2 className="w-3 h-3" /> Diterbitkan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                                                        <Clock className="w-3 h-3" /> Draf
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                    {(blog.views_count || 0).toLocaleString('id-ID')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(blog.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {blog.status === 'published' && (
                                                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-insani-blue" title="Lihat di Web">
                                                            <a href={`/berita/${blog.slug}`} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" title="Sunting">
                                                        <Link href={`/admin/blogs/${blog.id}/edit`}>
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => setDeletingBlog(blog)}
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" 
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16 text-slate-500">
                                            <div className="max-w-xs mx-auto text-center">
                                                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Belum Ada Artikel</p>
                                                <p className="text-xs text-slate-400 mt-1 mb-4">Mulai tulis artikel berita pertama untuk dipublikasikan ke pembaca.</p>
                                                <Button asChild size="sm" className="bg-insani-blue hover:bg-insani-darkblue text-white">
                                                    <Link href="/admin/blogs/create">
                                                        <Plus className="w-4 h-4 mr-1.5" />
                                                        Tulis Berita Baru
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {blogs && blogs.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-1">
                            {blogs.links.map((link: any, idx: number) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-insani-blue text-white'
                                            : link.url
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                                : 'text-slate-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={!!deletingBlog}
                onOpenChange={(open) => !open && setDeletingBlog(null)}
                title="Hapus Artikel Berita"
                description={`Apakah Anda yakin ingin menghapus artikel "${deletingBlog?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus Artikel"
                cancelText="Batal"
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}
