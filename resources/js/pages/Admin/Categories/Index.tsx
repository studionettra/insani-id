import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search, X, Image as ImageIcon, Sparkles, Video, BarChart2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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
        reality_title: { id: '', en: '', ar: '' },
        reality_description: { id: '', en: '', ar: '' },
        reality_source: '',
        video_url: '',
        stats_metrics: [] as any[],
        gallery_images: [] as File[],
        existing_gallery: [] as string[],
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
            reality_title: {
                id: category.reality_title_translations?.id || '',
                en: category.reality_title_translations?.en || '',
                ar: category.reality_title_translations?.ar || '',
            },
            reality_description: {
                id: category.reality_description_translations?.id || '',
                en: category.reality_description_translations?.en || '',
                ar: category.reality_description_translations?.ar || '',
            },
            reality_source: category.reality_source || '',
            video_url: category.video_url || '',
            stats_metrics: Array.isArray(category.stats_metrics) ? category.stats_metrics : [],
            gallery_images: [],
            existing_gallery: Array.isArray(category.distribution_gallery) ? category.distribution_gallery : [],
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

    const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteCategory = () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        destroy(`/admin/categories/${categoryToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setCategoryToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Kategori" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kategori Donasi</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola kategori program donasi di platform Insani.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Cari kategori..."
                                className="pl-9 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-white focus-visible:ring-[#1A56DB]"
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

                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                            <TableRow>
                                <TableHead className="w-16 text-gray-500 dark:text-gray-400">ID</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Nama Kategori (ID)</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Biaya Platform</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Status</TableHead>
                                <TableHead className="text-right text-gray-500 dark:text-gray-400">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada kategori ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category: any) => (
                                    <TableRow key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <TableCell className="text-gray-500 dark:text-gray-400">{category.id}</TableCell>
                                        <TableCell className="font-medium text-gray-900 dark:text-white">{category.name_translations?.id || category.name}</TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-300">{category.platform_fee_percent}%</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {category.is_active ? (
                                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-800">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">
                                                        Nonaktif
                                                    </span>
                                                )}
                                                {category.is_disaster_category && (
                                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-800">
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
                                                    className="h-8 w-8 text-gray-400 hover:text-[#1A56DB] dark:hover:text-blue-400"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                    onClick={() => setCategoryToDelete(category)}
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
                <DialogContent className="sm:max-w-[500px] border-0 dark:border dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    <form onSubmit={submitCreate} className="flex flex-col h-full overflow-hidden">
                        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Kategori</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Tambahkan kategori donasi baru.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="px-6 py-4 space-y-4 overflow-y-auto">
                            <div className="space-y-1.5">
                                <Label htmlFor="name_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kategori (ID) *</Label>
                                <Input
                                    id="name_id"
                                    value={data.name.id}
                                    onChange={(e) => setData('name', { ...data.name, id: e.target.value })}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                                {errors['name.id'] && <p className="text-xs text-red-500">{errors['name.id']}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name_en" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama (EN)</Label>
                                    <Input
                                        id="name_en"
                                        value={data.name.en}
                                        onChange={(e) => setData('name', { ...data.name, en: e.target.value })}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="name_ar" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama (AR)</Label>
                                    <Input
                                        id="name_ar"
                                        value={data.name.ar}
                                        onChange={(e) => setData('name', { ...data.name, ar: e.target.value })}
                                        dir="rtl"
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="description_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi (ID)</Label>
                                <Input
                                    id="description_id"
                                    value={data.description.id}
                                    onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="description_en" className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi (EN)</Label>
                                    <Input
                                        id="description_en"
                                        value={data.description.en}
                                        onChange={(e) => setData('description', { ...data.description, en: e.target.value })}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="description_ar" className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi (AR)</Label>
                                    <Input
                                        id="description_ar"
                                        value={data.description.ar}
                                        onChange={(e) => setData('description', { ...data.description, ar: e.target.value })}
                                        dir="rtl"
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="icon" className="text-sm font-medium text-gray-700 dark:text-gray-300">Ikon Kategori</Label>
                                <Input
                                    id="icon"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('icon', e.target.files ? e.target.files[0] : null)}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                />
                                {errors.icon && <p className="text-xs text-red-500">{errors.icon}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="pillar_image" className="text-sm font-medium text-gray-700 dark:text-gray-300">Gambar Pilar (Opsional)</Label>
                                <Input
                                    id="pillar_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('pillar_image', e.target.files ? e.target.files[0] : null)}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                />
                                {errors.pillar_image && <p className="text-xs text-red-500">{errors.pillar_image}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="platform_fee" className="text-sm font-medium text-gray-700 dark:text-gray-300">Biaya Platform (%)</Label>
                                    <Input
                                        id="platform_fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.platform_fee_percent}
                                        onChange={(e) => setData('platform_fee_percent', parseFloat(e.target.value) || 0)}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    />
                                    {errors.platform_fee_percent && <p className="text-xs text-red-500">{errors.platform_fee_percent}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sort_order" className="text-sm font-medium text-gray-700 dark:text-gray-300">Urutan (Sort Order)</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                        className="border-gray-300 dark:border-gray-600 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Kategori Aktif
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_disaster" 
                                        checked={data.is_disaster_category}
                                        onCheckedChange={(checked) => setData('is_disaster_category', checked === true)}
                                        className="border-gray-300 dark:border-gray-600 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="is_disaster" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Kategori Bencana Darurat
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_focus_program" 
                                        checked={data.is_focus_program}
                                        onCheckedChange={(checked) => setData('is_focus_program', checked === true)}
                                        className="border-gray-300 dark:border-gray-600 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="is_focus_program" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Pilar (Fokus Program)
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
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
                <DialogContent className="sm:max-w-[700px] border-0 dark:border dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    <form onSubmit={submitEdit} className="flex flex-col h-full overflow-hidden">
                        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Edit Kategori</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Perbarui informasi kategori dan konfigurasi Fokus Program.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="px-6 py-4 space-y-5 overflow-y-auto">
                            {isAdministrator && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_name_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kategori (ID) *</Label>
                                        <Input
                                            id="edit_name_id"
                                            value={data.name.id}
                                            onChange={(e) => setData('name', { ...data.name, id: e.target.value })}
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                        />
                                        {errors['name.id'] && <p className="text-xs text-red-500">{errors['name.id']}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_name_en" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama (EN)</Label>
                                            <Input
                                                id="edit_name_en"
                                                value={data.name.en}
                                                onChange={(e) => setData('name', { ...data.name, en: e.target.value })}
                                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_name_ar" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama (AR)</Label>
                                            <Input
                                                id="edit_name_ar"
                                                value={data.name.ar}
                                                onChange={(e) => setData('name', { ...data.name, ar: e.target.value })}
                                                dir="rtl"
                                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_description_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi Singkat (ID)</Label>
                                        <Textarea
                                            id="edit_description_id"
                                            rows={2}
                                            value={data.description.id}
                                            onChange={(e) => setData('description', { ...data.description, id: e.target.value })}
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_icon" className="text-sm font-medium text-gray-700 dark:text-gray-300">Ikon Kategori</Label>
                                        <Input
                                            id="edit_icon"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('icon', e.target.files ? e.target.files[0] : null)}
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                        />
                                        {editingCategory?.icon && <p className="text-xs text-gray-500 dark:text-gray-400">Sudah ada ikon. Biarkan kosong jika tidak ingin mengubah.</p>}
                                        {errors.icon && <p className="text-xs text-red-500">{errors.icon}</p>}
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="edit_pillar_image" className="text-sm font-medium text-gray-700 dark:text-gray-300">Gambar Cover Pilar (Opsional)</Label>
                                <Input
                                    id="edit_pillar_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('pillar_image', e.target.files ? e.target.files[0] : null)}
                                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] cursor-pointer file:text-[#1A56DB]"
                                />
                                {editingCategory?.pillar_image && <p className="text-xs text-gray-500 dark:text-gray-400">Sudah ada gambar cover pilar. Biarkan kosong jika tidak ingin mengubah.</p>}
                                {errors.pillar_image && <p className="text-xs text-red-500">{errors.pillar_image}</p>}
                            </div>

                            {isAdministrator && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_platform_fee" className="text-sm font-medium text-gray-700 dark:text-gray-300">Biaya Platform (%)</Label>
                                            <Input
                                                id="edit_platform_fee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.platform_fee_percent}
                                                onChange={(e) => setData('platform_fee_percent', parseFloat(e.target.value) || 0)}
                                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                            />
                                            {errors.platform_fee_percent && <p className="text-xs text-red-500">{errors.platform_fee_percent}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_sort_order" className="text-sm font-medium text-gray-700 dark:text-gray-300">Urutan (Sort Order)</Label>
                                            <Input
                                                id="edit_sort_order"
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB]"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-3 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="edit_is_active" 
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked === true)}
                                                className="border-gray-300 dark:border-gray-600 text-[#1A56DB] focus:ring-[#1A56DB]"
                                            />
                                            <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Kategori Aktif
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="edit_is_disaster" 
                                                checked={data.is_disaster_category}
                                                onCheckedChange={(checked) => setData('is_disaster_category', checked === true)}
                                                className="border-gray-300 dark:border-gray-600 text-[#1A56DB] focus:ring-[#1A56DB]"
                                            />
                                            <label htmlFor="edit_is_disaster" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                                        className="border-gray-300 dark:border-gray-600 text-[#1A56DB] focus:ring-[#1A56DB]"
                                    />
                                    <label htmlFor="edit_is_focus_program" className="text-sm font-semibold text-brand-600 dark:text-brand-400 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Pilar (Fokus Program) - Aktifkan Halaman Landing Dedikasi
                                    </label>
                                </div>
                            </div>

                            {/* Section Khusus Fokus Program (PureHands Style) */}
                            {data.is_focus_program && (
                                <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-brand-200 dark:border-brand-900/50 space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-700">
                                        <Sparkles className="w-4 h-4 text-brand-600" />
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                            Pengaturan Halaman Dedikasi Fokus Program
                                        </h3>
                                    </div>

                                    {/* 1. Realitas & Urgensi */}
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_reality_title_id" className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase">
                                                Judul Section Realitas / Urgensi (ID)
                                            </Label>
                                            <Input
                                                id="edit_reality_title_id"
                                                placeholder="Contoh: Realitas Krisis Ketahanan Pangan"
                                                value={data.reality_title.id}
                                                onChange={(e) => setData('reality_title', { ...data.reality_title, id: e.target.value })}
                                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_reality_description_id" className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase">
                                                Narasi Kondisi Lapangan (ID)
                                            </Label>
                                            <Textarea
                                                id="edit_reality_description_id"
                                                rows={3}
                                                placeholder="Jelaskan kondisi krisis lapangan yang dihadapi masyarakat secara menyentuh..."
                                                value={data.reality_description.id}
                                                onChange={(e) => setData('reality_description', { ...data.reality_description, id: e.target.value })}
                                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit_reality_source" className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase">
                                                Sumber Data Resmi / Sitasi
                                            </Label>
                                            <Input
                                                id="edit_reality_source"
                                                placeholder="Contoh: Sumber: Yemen HNRP 2026 – OCHA & UNICEF / Data BPS"
                                                value={data.reality_source}
                                                onChange={(e) => setData('reality_source', e.target.value)}
                                                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. Video YouTube */}
                                    <div className="space-y-1.5 pt-2">
                                        <Label htmlFor="edit_video_url" className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase flex items-center gap-1.5">
                                            <Video className="w-3.5 h-3.5 text-red-500" />
                                            <span>Link Video YouTube Dokumentasi</span>
                                        </Label>
                                        <Input
                                            id="edit_video_url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={data.video_url}
                                            onChange={(e) => setData('video_url', e.target.value)}
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm"
                                        />
                                    </div>

                                    {/* 3. Metrik Statistik Dinamis */}
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase flex items-center gap-1.5">
                                                <BarChart2 className="w-3.5 h-3.5 text-brand-600" />
                                                <span>Counter Statistik Dampak</span>
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = [...(data.stats_metrics || []), { value: '', label: { id: '' }, icon: 'Users' }];
                                                    setData('stats_metrics', updated);
                                                }}
                                                className="h-7 text-xs px-2.5 rounded-lg border-brand-200 text-brand-600 hover:bg-brand-50"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Tambah Metrik
                                            </Button>
                                        </div>

                                        {data.stats_metrics && data.stats_metrics.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {data.stats_metrics.map((metric: any, mIdx: number) => (
                                                    <div key={mIdx} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-slate-200 dark:border-gray-700">
                                                        <Input
                                                            placeholder="Angka (cth: 2.3 Juta+)"
                                                            value={metric.value || ''}
                                                            onChange={(e) => {
                                                                const updated = [...data.stats_metrics];
                                                                updated[mIdx] = { ...updated[mIdx], value: e.target.value };
                                                                setData('stats_metrics', updated);
                                                            }}
                                                            className="h-8 text-xs w-1/3"
                                                        />
                                                        <Input
                                                            placeholder="Label (cth: Orang Butuh Pangan)"
                                                            value={typeof metric.label === 'object' ? metric.label?.id || '' : metric.label || ''}
                                                            onChange={(e) => {
                                                                const updated = [...data.stats_metrics];
                                                                updated[mIdx] = { ...updated[mIdx], label: { id: e.target.value } };
                                                                setData('stats_metrics', updated);
                                                            }}
                                                            className="h-8 text-xs flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const updated = data.stats_metrics.filter((_: any, i: number) => i !== mIdx);
                                                                setData('stats_metrics', updated);
                                                            }}
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Belum ada metrik angka statistik.</p>
                                        )}
                                    </div>

                                    {/* 4. Dokumentasi Galeri Distribusi */}
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase flex items-center gap-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                                            <span>Foto Dokumentasi Distribusi</span>
                                        </Label>

                                        {data.existing_gallery && data.existing_gallery.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mb-2">
                                                {data.existing_gallery.map((img: string, gIdx: number) => (
                                                    <div key={gIdx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                                                        <img src={`/storage/${img}`} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = data.existing_gallery.filter((item: string) => item !== img);
                                                                setData('existing_gallery', updated);
                                                            }}
                                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = e.target.files ? Array.from(e.target.files) : [];
                                                setData('gallery_images', files);
                                            }}
                                            className="text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                        />
                                        <p className="text-[11px] text-slate-400">Dapat memilih lebih dari satu foto sekaligus untuk ditambahkan ke galeri dokumentasi.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] text-white hover:bg-[#1e40af]">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name_translations?.id || (typeof categoryToDelete?.name === 'string' ? categoryToDelete.name : categoryToDelete?.name?.id || '')}"? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDeleteCategory}
            />
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
