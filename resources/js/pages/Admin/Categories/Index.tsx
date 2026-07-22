import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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

        if (!editingCategory) {
return;
}
        
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
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kategori Donasi</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola kategori program donasi di platform Insani.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Cari kategori..."
                                className="pl-9 w-full bg-white border-gray-200 focus-visible:ring-[#1A56DB]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        {isAdministrator && (
                            <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white whitespace-nowrap">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-16">ID</TableHead>
                                <TableHead>Nama Kategori (ID)</TableHead>
                                <TableHead>Biaya Platform</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                        Tidak ada kategori ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category: any) => (
                                    <TableRow key={category.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="text-gray-500">{category.id}</TableCell>
                                        <TableCell className="font-medium text-gray-900">{category.name_translations?.id || category.name}</TableCell>
                                        <TableCell className="text-gray-600">{category.platform_fee_percent}%</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {category.is_active ? (
                                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10">
                                                        Nonaktif
                                                    </span>
                                                )}
                                                {category.is_disaster_category && (
                                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20">
                                                        Bencana
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-[#1A56DB]"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                    onClick={() => deleteCategory(category)}
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
                <DialogContent className="sm:max-w-[500px] border-0 shadow-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    <form onSubmit={submitCreate} className="flex flex-col h-full overflow-hidden">
                        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <DialogTitle className="text-lg font-semibold text-gray-900">Tambah Kategori</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 mt-1">
                                Tambahkan kategori donasi baru.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="px-6 py-4 space-y-4 overflow-y-auto">
                            <div className="space-y-1.5">
                                <Label htmlFor="name_id" className="text-sm font-medium text-gray-700">Nama Kategori (ID) *</Label>
                                <Input
                                    id="name_id"
                                    value={data.name.id}
                                    onChange={(e) => setData('name', { ...data.name, id: e.target.value })}
                                    className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                />
                                {errors['name.id'] && <p className="text-xs text-red-500">{errors['name.id']}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name_en" className="text-sm font-medium text-gray-700">Nama (EN)</Label>
                                    <Input
                                        id="name_en"
                                        value={data.name.en}
                                        onChange={(e) => setData('name', { ...data.name, en: e.target.value })}
                                        className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="name_ar" className="text-sm font-medium text-gray-700">Nama (AR)</Label>
                                    <Input
                                        id="name_ar"
                                        value={data.name.ar}
                                        onChange={(e) => setData('name', { ...data.name, ar: e.target.value })}
                                        dir="rtl"
                                        className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="description_id" className="text-sm font-medium text-gray-700">Deskripsi (ID)</Label>
                                <Input
                                    id="description_id"
                                    value={data.description.id}
                                    onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                    className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="description_en" className="text-sm font-medium text-gray-700">Deskripsi (EN)</Label>
                                    <Input
                                        id="description_en"
                                        value={data.description.en}
                                        onChange={(e) => setData('description', { ...data.description, en: e.target.value })}
                                        className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="description_ar" className="text-sm font-medium text-gray-700">Deskripsi (AR)</Label>
                                    <Input
                                        id="description_ar"
                                        value={data.description.ar}
                                        onChange={(e) => setData('description', { ...data.description, ar: e.target.value })}
                                        dir="rtl"
                                        className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="icon" className="text-sm font-medium text-gray-700">Ikon Kategori</Label>
                                <Input
                                    id="icon"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('icon', e.target.files ? e.target.files[0] : null)}
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                />
                                {errors.icon && <p className="text-xs text-red-500">{errors.icon}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="pillar_image" className="text-sm font-medium text-gray-700">Gambar Pilar (Opsional)</Label>
                                <Input
                                    id="pillar_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('pillar_image', e.target.files ? e.target.files[0] : null)}
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                />
                                {errors.pillar_image && <p className="text-xs text-red-500">{errors.pillar_image}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="platform_fee" className="text-sm font-medium text-gray-700">Biaya Platform (%)</Label>
                                    <Input
                                        id="platform_fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.platform_fee_percent}
                                        onChange={(e) => setData('platform_fee_percent', parseFloat(e.target.value) || 0)}
                                        className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                    />
                                    {errors.platform_fee_percent && <p className="text-xs text-red-500">{errors.platform_fee_percent}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sort_order" className="text-sm font-medium text-gray-700">Urutan (Sort Order)</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                        className="border-gray-300 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Kategori Aktif
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_disaster" 
                                        checked={data.is_disaster_category}
                                        onCheckedChange={(checked) => setData('is_disaster_category', checked === true)}
                                        className="border-gray-300 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="is_disaster" className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Kategori Bencana Darurat
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_focus_program" 
                                        checked={data.is_focus_program}
                                        onCheckedChange={(checked) => setData('is_focus_program', checked === true)}
                                        className="border-gray-300 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="is_focus_program" className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Pilar (Fokus Program)
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-100">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] text-white hover:bg-[#1e40af]">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] border-0 shadow-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    <form onSubmit={submitEdit} className="flex flex-col h-full overflow-hidden">
                        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <DialogTitle className="text-lg font-semibold text-gray-900">Edit Kategori</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 mt-1">
                                Perbarui informasi kategori.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="px-6 py-4 space-y-4 overflow-y-auto">
                            {isAdministrator && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_name_id" className="text-sm font-medium text-gray-700">Nama Kategori (ID) *</Label>
                                        <Input
                                            id="edit_name_id"
                                            value={data.name.id}
                                            onChange={(e) => setData('name', { ...data.name, id: e.target.value })}
                                            className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                        />
                                        {errors['name.id'] && <p className="text-xs text-red-500">{errors['name.id']}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_name_en" className="text-sm font-medium text-gray-700">Nama (EN)</Label>
                                            <Input
                                                id="edit_name_en"
                                                value={data.name.en}
                                                onChange={(e) => setData('name', { ...data.name, en: e.target.value })}
                                                className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_name_ar" className="text-sm font-medium text-gray-700">Nama (AR)</Label>
                                            <Input
                                                id="edit_name_ar"
                                                value={data.name.ar}
                                                onChange={(e) => setData('name', { ...data.name, ar: e.target.value })}
                                                dir="rtl"
                                                className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_description_id" className="text-sm font-medium text-gray-700">Deskripsi (ID)</Label>
                                        <Input
                                            id="edit_description_id"
                                            value={data.description.id}
                                            onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                            className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_description_en" className="text-sm font-medium text-gray-700">Deskripsi (EN)</Label>
                                            <Input
                                                id="edit_description_en"
                                                value={data.description.en}
                                                onChange={(e) => setData('description', { ...data.description, en: e.target.value })}
                                                className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_description_ar" className="text-sm font-medium text-gray-700">Deskripsi (AR)</Label>
                                            <Input
                                                id="edit_description_ar"
                                                value={data.description.ar}
                                                onChange={(e) => setData('description', { ...data.description, ar: e.target.value })}
                                                dir="rtl"
                                                className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_icon" className="text-sm font-medium text-gray-700">Ikon Kategori</Label>
                                        <Input
                                            id="edit_icon"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('icon', e.target.files ? e.target.files[0] : null)}
                                            className="border-gray-200 focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                        />
                                        {editingCategory?.icon && <p className="text-xs text-gray-500">Sudah ada ikon. Biarkan kosong jika tidak ingin mengubah.</p>}
                                        {errors.icon && <p className="text-xs text-red-500">{errors.icon}</p>}
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="edit_pillar_image" className="text-sm font-medium text-gray-700">Gambar Pilar (Opsional)</Label>
                                <Input
                                    id="edit_pillar_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('pillar_image', e.target.files ? e.target.files[0] : null)}
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                />
                                {editingCategory?.pillar_image && <p className="text-xs text-gray-500">Sudah ada gambar pilar. Biarkan kosong jika tidak ingin mengubah.</p>}
                                {errors.pillar_image && <p className="text-xs text-red-500">{errors.pillar_image}</p>}
                            </div>

                            {isAdministrator && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_platform_fee" className="text-sm font-medium text-gray-700">Biaya Platform (%)</Label>
                                            <Input
                                                id="edit_platform_fee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.platform_fee_percent}
                                                onChange={(e) => setData('platform_fee_percent', parseFloat(e.target.value) || 0)}
                                                className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                            />
                                            {errors.platform_fee_percent && <p className="text-xs text-red-500">{errors.platform_fee_percent}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_sort_order" className="text-sm font-medium text-gray-700">Urutan (Sort Order)</Label>
                                            <Input
                                                id="edit_sort_order"
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                                className="border-gray-200 focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-3 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="edit_is_active" 
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked === true)}
                                                className="border-gray-300 text-[#1A56DB] focus:ring-[#1A56DB]"
                                            />
                                            <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Kategori Aktif
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="edit_is_disaster" 
                                                checked={data.is_disaster_category}
                                                onCheckedChange={(checked) => setData('is_disaster_category', checked === true)}
                                                className="border-gray-300 text-[#1A56DB] focus:ring-[#1A56DB]"
                                            />
                                            <label htmlFor="edit_is_disaster" className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Kategori Bencana Darurat
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="flex flex-col gap-3 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="edit_is_focus_program" 
                                        checked={data.is_focus_program}
                                        onCheckedChange={(checked) => setData('is_focus_program', checked === true)}
                                        className="border-gray-300 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="edit_is_focus_program" className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Pilar (Fokus Program)
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-100">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] text-white hover:bg-[#1e40af]">
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
