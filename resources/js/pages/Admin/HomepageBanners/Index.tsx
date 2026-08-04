import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function HomepageBannersIndex({ banners, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        title: '',
        desktop_image_url: null as File | null,
        mobile_image_url: null as File | null,
        cta_link: '',
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/homepage-banners',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData('_method', 'post');
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (banner: any) => {
        setEditingBanner(banner);
        setData({
            _method: 'put',
            title: banner.title,
            cta_link: banner.cta_link || '',
            desktop_image_url: null,
            mobile_image_url: null,
            is_active: banner.is_active,
            sort_order: banner.sort_order,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/homepage-banners', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingBanner) {
return;
}
        
        post(`/admin/homepage-banners/${editingBanner.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const deleteBanner = (banner: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
            router.delete(`/admin/homepage-banners/${banner.id}`);
        }
    };

    return (
        <>
            <Head title="Banner Beranda" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Banner Beranda</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola gambar banner/slider utama di halaman beranda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari judul..."
                                className="w-full pl-8 sm:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <Button onClick={openCreateModal} className="bg-insani-turquoise hover:bg-insani-turquoise/90 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Banner
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-medium">Gambar Desktop</TableCell>
                                <TableCell className="font-medium">Gambar Mobile</TableCell>
                                <TableCell className="font-medium">Judul & Link</TableCell>
                                <TableCell className="font-medium text-center">Urutan</TableCell>
                                <TableCell className="font-medium">Status</TableCell>
                                <TableCell className="text-right font-medium">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banners.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Tidak ada banner beranda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners.data.map((banner: any) => (
                                    <TableRow key={banner.id}>
                                        <TableCell>
                                            <div className="h-16 w-32 rounded bg-gray-100 overflow-hidden flex items-center justify-center border">
                                                {banner.desktop_image_url ? (
                                                    <img src={`/storage/${banner.desktop_image_url}`} alt={banner.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Image</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-16 w-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center border">
                                                {banner.mobile_image_url ? (
                                                    <img src={`/storage/${banner.mobile_image_url}`} alt={banner.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs text-center leading-tight">Gunakan<br/>Desktop</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{banner.title}</div>
                                            {banner.cta_link && (
                                                <a href={banner.cta_link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                                                    Link Tautan
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{banner.sort_order}</TableCell>
                                        <TableCell>
                                            {banner.is_active ? (
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
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditModal(banner)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deleteBanner(banner)}
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

            {/* Modal Tambah */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={submitCreate}>
                        <DialogHeader>
                            <DialogTitle>Tambah Banner Beranda</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Judul Banner (Internal) *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="desktop_image">Gambar Desktop *</Label>
                                <Input
                                    id="desktop_image"
                                    type="file"
                                    onChange={(e) => setData('desktop_image_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Rekomendasi rasio lanskap (misal 1920x800px).</p>
                                {errors.desktop_image_url && <p className="text-sm text-red-500">{errors.desktop_image_url}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mobile_image">Gambar Mobile (Opsional)</Label>
                                <Input
                                    id="mobile_image"
                                    type="file"
                                    onChange={(e) => setData('mobile_image_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                />
                                <p className="text-xs text-muted-foreground">Jika dikosongkan, gambar desktop akan digunakan. Rekomendasi rasio potret/persegi (misal 800x1000px).</p>
                                {errors.mobile_image_url && <p className="text-sm text-red-500">{errors.mobile_image_url}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cta_link">Link Tujuan (Tautan saat di-klik)</Label>
                                <Input
                                    id="cta_link"
                                    placeholder="https://"
                                    value={data.cta_link}
                                    onChange={(e) => setData('cta_link', e.target.value)}
                                />
                                {errors.cta_link && <p className="text-sm text-red-500">{errors.cta_link}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sort_order">Urutan (Sort Order)</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium leading-none">
                                        Aktif (Tampilkan di website)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={submitEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Banner Beranda</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_title">Judul Banner (Internal) *</Label>
                                <Input
                                    id="edit_title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_desktop_image">Ganti Gambar Desktop</Label>
                                {editingBanner?.desktop_image_url && (
                                    <div className="mb-2 h-16 w-32 border overflow-hidden rounded bg-gray-50">
                                        <img src={`/storage/${editingBanner.desktop_image_url}`} alt="Current" className="h-full w-full object-cover" />
                                    </div>
                                )}
                                <Input
                                    id="edit_desktop_image"
                                    type="file"
                                    onChange={(e) => setData('desktop_image_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                />
                                {errors.desktop_image_url && <p className="text-sm text-red-500">{errors.desktop_image_url}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_mobile_image">Ganti Gambar Mobile (Opsional)</Label>
                                {editingBanner?.mobile_image_url && (
                                    <div className="mb-2 h-16 w-12 border overflow-hidden rounded bg-gray-50">
                                        <img src={`/storage/${editingBanner.mobile_image_url}`} alt="Current" className="h-full w-full object-cover" />
                                    </div>
                                )}
                                <Input
                                    id="edit_mobile_image"
                                    type="file"
                                    onChange={(e) => setData('mobile_image_url', e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                />
                                {errors.mobile_image_url && <p className="text-sm text-red-500">{errors.mobile_image_url}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_cta_link">Link Tujuan (Tautan saat di-klik)</Label>
                                <Input
                                    id="edit_cta_link"
                                    placeholder="https://"
                                    value={data.cta_link}
                                    onChange={(e) => setData('cta_link', e.target.value)}
                                />
                                {errors.cta_link && <p className="text-sm text-red-500">{errors.cta_link}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_sort_order">Urutan (Sort Order)</Label>
                                    <Input
                                        id="edit_sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="edit_is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <label htmlFor="edit_is_active" className="text-sm font-medium leading-none">
                                        Aktif (Tampilkan di website)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

HomepageBannersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Banner Beranda',
            href: '/admin/homepage-banners',
        },
    ],
};
