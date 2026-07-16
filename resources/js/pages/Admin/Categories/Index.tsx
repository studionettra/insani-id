import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function CategoriesIndex({ categories, filters }: any) {
    const { auth } = usePage().props as any;
    const isAdministrator = auth?.user?.roles?.some((role: any) => role.name === 'Administrator' || role === 'Administrator');
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: { id: '', en: '', ar: '' },
        description: { id: '', en: '', ar: '' },
        icon: null as File | null,
        pillar_image: null as File | null,
        platform_fee_percent: 0,
        is_disaster_category: false,
        is_focus_program: false,
        is_active: true,
        sort_order: 0,
        _method: 'post',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/categories',
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

    const openEditModal = (category: any) => {
        setEditingCategory(category);
        setData({
            name: { 
                id: category.name_translations?.id || '', 
                en: category.name_translations?.en || '', 
                ar: category.name_translations?.ar || '' 
            },
            description: { 
                id: category.description_translations?.id || '', 
                en: category.description_translations?.en || '', 
                ar: category.description_translations?.ar || '' 
            },
            icon: null,
            pillar_image: null,
            platform_fee_percent: category.platform_fee_percent,
            is_disaster_category: category.is_disaster_category,
            is_focus_program: category.is_focus_program,
            is_active: category.is_active,
            sort_order: category.sort_order,
            _method: 'put',
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/categories', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        
        const targetUrl = isAdministrator 
            ? `/admin/categories/${editingCategory.id}` 
            : `/admin/categories/${editingCategory.id}/pillar`;

        // If not admin, we force the method to be patch for updatePillar endpoint
        if (!isAdministrator) {
            setData('_method', 'patch');
        }

        post(targetUrl, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const deleteCategory = (category: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            destroy(`/admin/categories/${category.id}`);
        }
    };

    return (
        <>
            <Head title="Manajemen Kategori" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Kategori Donasi</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola kategori program donasi di platform Insani.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari kategori..."
                                className="w-full pl-8 sm:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        {isAdministrator && (
                            <Button onClick={openCreateModal} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nama Kategori (ID)</TableCell>
                                <TableCell>Biaya Platform</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell className="text-right">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Tidak ada kategori ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category: any) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.id}</TableCell>
                                        <TableCell>{category.name_translations?.id || category.name}</TableCell>
                                        <TableCell>{category.platform_fee_percent}%</TableCell>
                                        <TableCell>
                                            {category.is_active ? (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
                                                    Nonaktif
                                                </span>
                                            )}
                                            {category.is_disaster_category && (
                                                <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800">
                                                    Bencana
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    <Edit className="h-4 w-4 text-insani-blue" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => deleteCategory(category)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
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
                            <DialogTitle>Tambah Kategori</DialogTitle>
                            <DialogDescription>
                                Tambahkan kategori donasi baru.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name_id">Nama Kategori (ID) *</Label>
                                <Input
                                    id="name_id"
                                    value={data.name.id}
                                    onChange={(e) => setData('name', { ...data.name, id: e.target.value })}
                                />
                                {errors['name.id'] && <p className="text-sm text-red-500">{errors['name.id']}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name_en">Nama (EN)</Label>
                                    <Input
                                        id="name_en"
                                        value={data.name.en}
                                        onChange={(e) => setData('name', { ...data.name, en: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name_ar">Nama (AR)</Label>
                                    <Input
                                        id="name_ar"
                                        value={data.name.ar}
                                        onChange={(e) => setData('name', { ...data.name, ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="description_id">Deskripsi (ID)</Label>
                                <Input
                                    id="description_id"
                                    value={data.description.id}
                                    onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="description_en">Deskripsi (EN)</Label>
                                    <Input
                                        id="description_en"
                                        value={data.description.en}
                                        onChange={(e) => setData('description', { ...data.description, en: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description_ar">Deskripsi (AR)</Label>
                                    <Input
                                        id="description_ar"
                                        value={data.description.ar}
                                        onChange={(e) => setData('description', { ...data.description, ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="icon">Ikon Kategori</Label>
                                <Input
                                    id="icon"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('icon', e.target.files ? e.target.files[0] : null)}
                                />
                                {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pillar_image">Gambar Pilar (Opsional)</Label>
                                <Input
                                    id="pillar_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('pillar_image', e.target.files ? e.target.files[0] : null)}
                                />
                                {errors.pillar_image && <p className="text-sm text-red-500">{errors.pillar_image}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="platform_fee">Biaya Platform (%)</Label>
                                    <Input
                                        id="platform_fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.platform_fee_percent}
                                        onChange={(e) => setData('platform_fee_percent', parseFloat(e.target.value) || 0)}
                                    />
                                    {errors.platform_fee_percent && <p className="text-sm text-red-500">{errors.platform_fee_percent}</p>}
                                </div>
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
                                    <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Kategori Aktif
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_disaster" 
                                        checked={data.is_disaster_category}
                                        onCheckedChange={(checked) => setData('is_disaster_category', checked === true)}
                                    />
                                    <label htmlFor="is_disaster" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Kategori Bencana Darurat
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_focus_program" 
                                        checked={data.is_focus_program}
                                        onCheckedChange={(checked) => setData('is_focus_program', checked === true)}
                                    />
                                    <label htmlFor="is_focus_program" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Pilar (Fokus Program)
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
                            <DialogTitle>Edit Kategori</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi kategori.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {isAdministrator && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_name_id">Nama Kategori (ID) *</Label>
                                        <Input
                                            id="edit_name_id"
                                            value={data.name.id}
                                            onChange={(e) => setData('name', { ...data.name, id: e.target.value })}
                                        />
                                        {errors['name.id'] && <p className="text-sm text-red-500">{errors['name.id']}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit_name_en">Nama (EN)</Label>
                                            <Input
                                                id="edit_name_en"
                                                value={data.name.en}
                                                onChange={(e) => setData('name', { ...data.name, en: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit_name_ar">Nama (AR)</Label>
                                            <Input
                                                id="edit_name_ar"
                                                value={data.name.ar}
                                                onChange={(e) => setData('name', { ...data.name, ar: e.target.value })}
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_description_id">Deskripsi (ID)</Label>
                                        <Input
                                            id="edit_description_id"
                                            value={data.description.id}
                                            onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit_description_en">Deskripsi (EN)</Label>
                                            <Input
                                                id="edit_description_en"
                                                value={data.description.en}
                                                onChange={(e) => setData('description', { ...data.description, en: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit_description_ar">Deskripsi (AR)</Label>
                                            <Input
                                                id="edit_description_ar"
                                                value={data.description.ar}
                                                onChange={(e) => setData('description', { ...data.description, ar: e.target.value })}
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_icon">Ikon Kategori</Label>
                                        <Input
                                            id="edit_icon"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('icon', e.target.files ? e.target.files[0] : null)}
                                        />
                                        {editingCategory?.icon && <p className="text-xs text-muted-foreground">Sudah ada ikon. Biarkan kosong jika tidak ingin mengubah.</p>}
                                        {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                                    </div>
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="edit_pillar_image">Gambar Pilar (Opsional)</Label>
                                <Input
                                    id="edit_pillar_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('pillar_image', e.target.files ? e.target.files[0] : null)}
                                />
                                {editingCategory?.pillar_image && <p className="text-xs text-muted-foreground">Sudah ada gambar pilar. Biarkan kosong jika tidak ingin mengubah.</p>}
                                {errors.pillar_image && <p className="text-sm text-red-500">{errors.pillar_image}</p>}
                            </div>

                            {isAdministrator && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit_platform_fee">Biaya Platform (%)</Label>
                                            <Input
                                                id="edit_platform_fee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.platform_fee_percent}
                                                onChange={(e) => setData('platform_fee_percent', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors.platform_fee_percent && <p className="text-sm text-red-500">{errors.platform_fee_percent}</p>}
                                        </div>
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
                                            <label htmlFor="edit_is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Kategori Aktif
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="edit_is_disaster" 
                                                checked={data.is_disaster_category}
                                                onCheckedChange={(checked) => setData('is_disaster_category', checked === true)}
                                            />
                                            <label htmlFor="edit_is_disaster" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Kategori Bencana Darurat
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="edit_is_focus_program" 
                                        checked={data.is_focus_program}
                                        onCheckedChange={(checked) => setData('is_focus_program', checked === true)}
                                    />
                                    <label htmlFor="edit_is_focus_program" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Pilar (Fokus Program)
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

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Kategori',
            href: '#',
        },
    ],
};
