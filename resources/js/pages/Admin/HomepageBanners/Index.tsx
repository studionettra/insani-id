import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import { autoTranslateFields } from '@/lib/translate';
import { getLocalizedValue } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface BannerItem {
    id: number;
    title: any;
    description: any;
    desktop_image_url: string;
    mobile_image_url: string | null;
    cta_link: string | null;
    is_active: boolean;
    sort_order: number;
    title_translations?: Record<string, string>;
    description_translations?: Record<string, string>;
}

interface Props {
    banners: {
        data: BannerItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function HomepageBannersIndex({ banners, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
    const [langTab, setLangTab] = useState<'id' | 'en' | 'ar'>('id');
    const [isTranslating, setIsTranslating] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        title: { id: '', en: '', ar: '' },
        description: { id: '', en: '', ar: '' },
        desktop_image_url: null as File | null,
        mobile_image_url: null as File | null,
        cta_link: '',
        is_active: true,
        sort_order: 0,
    });

    const handleAutoTranslate = async () => {
        const sourceTitle = data.title.id;
        const sourceDesc = data.description.id;

        if (!sourceTitle.trim()) {
            toast.error('Silakan isi Judul Banner (ID) terlebih dahulu sebelum menerjemahkan.');
            return;
        }

        setIsTranslating(true);
        try {
            const fieldsToTranslate: Record<string, string> = {
                title: sourceTitle,
            };
            if (sourceDesc && sourceDesc.trim()) {
                fieldsToTranslate.description = sourceDesc.trim();
            }

            const res = await autoTranslateFields(fieldsToTranslate);

            if (res) {
                setData(prev => ({
                    ...prev,
                    title: {
                        id: prev.title.id,
                        en: res.title?.en || prev.title.en,
                        ar: res.title?.ar || prev.title.ar,
                    },
                    description: {
                        id: prev.description.id,
                        en: res.description?.en || prev.description.en,
                        ar: res.description?.ar || prev.description.ar,
                    },
                }));
            }
        } finally {
            setIsTranslating(false);
        }
    };

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
        setData({
            _method: 'post',
            title: { id: '', en: '', ar: '' },
            description: { id: '', en: '', ar: '' },
            desktop_image_url: null,
            mobile_image_url: null,
            cta_link: '',
            is_active: true,
            sort_order: (banners.data?.length || 0) + 1,
        });
        setLangTab('id');
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (banner: BannerItem) => {
        setEditingBanner(banner);
        const titleObj = banner.title_translations || (typeof banner.title === 'object' && banner.title !== null ? banner.title : { id: banner.title || '', en: '', ar: '' });
        const descObj = banner.description_translations || (typeof banner.description === 'object' && banner.description !== null ? banner.description : { id: banner.description || '', en: '', ar: '' });

        setData({
            _method: 'put',
            title: {
                id: titleObj.id || (typeof banner.title === 'string' ? banner.title : '') || '',
                en: titleObj.en || '',
                ar: titleObj.ar || '',
            },
            description: {
                id: descObj.id || (typeof banner.description === 'string' ? banner.description : '') || '',
                en: descObj.en || '',
                ar: descObj.ar || '',
            },
            cta_link: banner.cta_link || '',
            desktop_image_url: null,
            mobile_image_url: null,
            is_active: Boolean(banner.is_active),
            sort_order: banner.sort_order ?? 0,
        });
        setLangTab('id');
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/homepage-banners', {
            forceFormData: true,
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
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteBanner = () => {
        if (!bannerToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/homepage-banners/${bannerToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setBannerToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Banner Beranda" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Banner Beranda</h2>
                        <p className="text-muted-foreground text-sm">
                            Kelola gambar banner/slider utama di halaman beranda dengan dukungan terjemahan otomatis.
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

                        <Button onClick={openCreateModal} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Banner
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/70 dark:bg-gray-800/50">
                            <TableRow>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Gambar Desktop</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Gambar Mobile</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Judul & Link</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400 text-center">Urutan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Status</TableCell>
                                <TableCell className="text-right font-semibold text-xs text-gray-500 dark:text-gray-400">Aksi</TableCell>
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
                                banners.data.map((banner) => {
                                    const titleId = getLocalizedValue(banner.title_translations || banner.title, 'id');
                                    const descId = getLocalizedValue(banner.description_translations || banner.description, 'id');
                                    const hasEn = Boolean(banner.title_translations?.en || (typeof banner.title === 'object' && banner.title?.en));
                                    const hasAr = Boolean(banner.title_translations?.ar || (typeof banner.title === 'object' && banner.title?.ar));

                                    return (
                                        <TableRow key={banner.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <TableCell>
                                                <div className="h-16 w-32 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                                    {banner.desktop_image_url ? (
                                                        <img src={`/storage/${banner.desktop_image_url}`} alt={titleId} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No Image</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-16 w-12 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                                    {banner.mobile_image_url ? (
                                                        <img src={`/storage/${banner.mobile_image_url}`} alt={titleId} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs text-center leading-tight">Gunakan<br/>Desktop</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900 dark:text-white">{titleId}</div>
                                                {descId && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 max-w-sm">
                                                        {descId}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        ID ✓
                                                    </span>
                                                    {hasEn ? (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                                                            EN ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                            EN -
                                                        </span>
                                                    )}
                                                    {hasAr ? (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                                                            AR ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                            AR -
                                                        </span>
                                                    )}
                                                </div>
                                                {banner.cta_link && (
                                                    <div className="mt-1">
                                                        <a href={banner.cta_link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                            Tautan CTA &rarr;
                                                        </a>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm text-gray-500 dark:text-gray-400">{banner.sort_order}</TableCell>
                                            <TableCell>
                                                {banner.is_active ? (
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
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
                                                        className="border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => setBannerToDelete(banner)}
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
            </div>

            {/* Modal Tambah */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitCreate}>
                        <DialogHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
                            <DialogTitle className="text-gray-900 dark:text-white">Tambah Banner Beranda</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Card Status & Auto Translate */}
                            <TranslationStatusCard
                                hasId={Boolean(data.title.id)}
                                hasEn={Boolean(data.title.en && (!data.description.id || data.description.en))}
                                hasAr={Boolean(data.title.ar && (!data.description.id || data.description.ar))}
                                onTranslate={handleAutoTranslate}
                                isTranslating={isTranslating}
                                compact
                                description="Terjemahkan judul dan deskripsi banner ke bahasa Inggris dan Arab secara otomatis."
                            />

                            {/* Language Switcher Tabs */}
                            <div className="flex border-b border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setLangTab('id')}
                                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                                        langTab === 'id'
                                            ? 'border-[#1A56DB] text-[#1A56DB] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    <span>🇮🇩 Bahasa Indonesia</span>
                                    <span className="text-[10px] text-red-500 font-bold">*</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLangTab('en')}
                                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                                        langTab === 'en'
                                            ? 'border-[#1A56DB] text-[#1A56DB] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    <span>🇬🇧 English</span>
                                    {data.title.en && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLangTab('ar')}
                                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                                        langTab === 'ar'
                                            ? 'border-[#1A56DB] text-[#1A56DB] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    <span>🇸🇦 العربية</span>
                                    {data.title.ar && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                </button>
                            </div>

                            {/* Tab ID */}
                            {langTab === 'id' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title_id" className="text-gray-700 dark:text-gray-200">
                                            Judul Banner (ID) *
                                        </Label>
                                        <Input
                                            id="title_id"
                                            value={data.title.id}
                                            onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                            placeholder="Contoh: Gotong Royong Kemanusiaan"
                                            required
                                        />
                                        {(errors as any)['title.id'] && <p className="text-sm text-red-500">{(errors as any)['title.id']}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="description_id" className="text-gray-700 dark:text-gray-200">
                                                Deskripsi Singkat (ID) (Opsional)
                                            </Label>
                                            <span className={`text-xs ${data.description.id.length > 180 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                                                {data.description.id.length}/200 karakter
                                            </span>
                                        </div>
                                        <Textarea
                                            id="description_id"
                                            value={data.description.id}
                                            onChange={(e) => setData('description', { ...data.description, id: e.target.value.slice(0, 200) })}
                                            placeholder="Tuliskan deskripsi singkat atau pesan ajakan yang tampil di bawah judul banner..."
                                            className="resize-none h-20 text-sm"
                                            maxLength={200}
                                        />
                                        {(errors as any)['description.id'] && <p className="text-sm text-red-500">{(errors as any)['description.id']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Tab EN */}
                            {langTab === 'en' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title_en" className="text-gray-700 dark:text-gray-200">
                                            Banner Title (EN) (Opsional)
                                        </Label>
                                        <Input
                                            id="title_en"
                                            value={data.title.en}
                                            onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                            placeholder="Example: Together for Humanitarian Relief"
                                        />
                                        {(errors as any)['title.en'] && <p className="text-sm text-red-500">{(errors as any)['title.en']}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="description_en" className="text-gray-700 dark:text-gray-200">
                                                Short Description (EN) (Opsional)
                                            </Label>
                                            <span className={`text-xs ${data.description.en.length > 180 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                                                {data.description.en.length}/200 characters
                                            </span>
                                        </div>
                                        <Textarea
                                            id="description_en"
                                            value={data.description.en}
                                            onChange={(e) => setData('description', { ...data.description, en: e.target.value.slice(0, 200) })}
                                            placeholder="Write a brief tagline or call to action displayed below the banner title..."
                                            className="resize-none h-20 text-sm"
                                            maxLength={200}
                                        />
                                        {(errors as any)['description.en'] && <p className="text-sm text-red-500">{(errors as any)['description.en']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Tab AR */}
                            {langTab === 'ar' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title_ar" className="text-gray-700 dark:text-gray-200">
                                            عنوان الشعار (AR) (اختياري)
                                        </Label>
                                        <Input
                                            id="title_ar"
                                            dir="rtl"
                                            value={data.title.ar}
                                            onChange={(e) => setData('title', { ...data.title, ar: e.target.value })}
                                            placeholder="مثال: التكاتف من أجل الإغاثة الإنسانية"
                                        />
                                        {(errors as any)['title.ar'] && <p className="text-sm text-red-500">{(errors as any)['title.ar']}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="description_ar" className="text-gray-700 dark:text-gray-200">
                                                وصف قصير (AR) (اختياري)
                                            </Label>
                                            <span className={`text-xs ${data.description.ar.length > 180 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                                                {data.description.ar.length}/200 حرف
                                            </span>
                                        </div>
                                        <Textarea
                                            id="description_ar"
                                            dir="rtl"
                                            value={data.description.ar}
                                            onChange={(e) => setData('description', { ...data.description, ar: e.target.value.slice(0, 200) })}
                                            placeholder="اكتب وصفاً موجزاً أو رسالة دعوة تظهر أسفل عنوان الشعار..."
                                            className="resize-none h-20 text-sm"
                                            maxLength={200}
                                        />
                                        {(errors as any)['description.ar'] && <p className="text-sm text-red-500">{(errors as any)['description.ar']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Gambar & CTA */}
                            <div className="grid gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <Label htmlFor="desktop_image" className="text-gray-700 dark:text-gray-200">Gambar Desktop *</Label>
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
                                <Label htmlFor="mobile_image" className="text-gray-700 dark:text-gray-200">Gambar Mobile (Opsional)</Label>
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
                                <Label htmlFor="cta_link" className="text-gray-700 dark:text-gray-200">Link Tujuan (Tautan saat di-klik)</Label>
                                <Input
                                    id="cta_link"
                                    placeholder="https://"
                                    value={data.cta_link}
                                    onChange={(e) => setData('cta_link', e.target.value)}
                                />
                                {errors.cta_link && <p className="text-sm text-red-500">{errors.cta_link}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sort_order" className="text-gray-700 dark:text-gray-200">Urutan Tampil</Label>
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
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none cursor-pointer">
                                        Aktif (Tampilkan di website)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-gray-100 dark:border-gray-800 pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={submitEdit}>
                        <DialogHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
                            <DialogTitle className="text-gray-900 dark:text-white">Edit Banner Beranda</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Card Status & Auto Translate */}
                            <TranslationStatusCard
                                hasId={Boolean(data.title.id)}
                                hasEn={Boolean(data.title.en && (!data.description.id || data.description.en))}
                                hasAr={Boolean(data.title.ar && (!data.description.id || data.description.ar))}
                                onTranslate={handleAutoTranslate}
                                isTranslating={isTranslating}
                                compact
                                description="Terjemahkan judul dan deskripsi banner ke bahasa Inggris dan Arab secara otomatis."
                            />

                            {/* Language Switcher Tabs */}
                            <div className="flex border-b border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setLangTab('id')}
                                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                                        langTab === 'id'
                                            ? 'border-[#1A56DB] text-[#1A56DB] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    <span>🇮🇩 Bahasa Indonesia</span>
                                    <span className="text-[10px] text-red-500 font-bold">*</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLangTab('en')}
                                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                                        langTab === 'en'
                                            ? 'border-[#1A56DB] text-[#1A56DB] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    <span>🇬🇧 English</span>
                                    {data.title.en && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLangTab('ar')}
                                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                                        langTab === 'ar'
                                            ? 'border-[#1A56DB] text-[#1A56DB] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    <span>🇸🇦 العربية</span>
                                    {data.title.ar && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                </button>
                            </div>

                            {/* Tab ID */}
                            {langTab === 'id' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_title_id" className="text-gray-700 dark:text-gray-200">
                                            Judul Banner (ID) *
                                        </Label>
                                        <Input
                                            id="edit_title_id"
                                            value={data.title.id}
                                            onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                            required
                                        />
                                        {(errors as any)['title.id'] && <p className="text-sm text-red-500">{(errors as any)['title.id']}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="edit_description_id" className="text-gray-700 dark:text-gray-200">
                                                Deskripsi Singkat (ID) (Opsional)
                                            </Label>
                                            <span className={`text-xs ${data.description.id.length > 180 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                                                {data.description.id.length}/200 karakter
                                            </span>
                                        </div>
                                        <Textarea
                                            id="edit_description_id"
                                            value={data.description.id}
                                            onChange={(e) => setData('description', { ...data.description, id: e.target.value.slice(0, 200) })}
                                            className="resize-none h-20 text-sm"
                                            maxLength={200}
                                        />
                                        {(errors as any)['description.id'] && <p className="text-sm text-red-500">{(errors as any)['description.id']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Tab EN */}
                            {langTab === 'en' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_title_en" className="text-gray-700 dark:text-gray-200">
                                            Banner Title (EN) (Opsional)
                                        </Label>
                                        <Input
                                            id="edit_title_en"
                                            value={data.title.en}
                                            onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                        />
                                        {(errors as any)['title.en'] && <p className="text-sm text-red-500">{(errors as any)['title.en']}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="edit_description_en" className="text-gray-700 dark:text-gray-200">
                                                Short Description (EN) (Opsional)
                                            </Label>
                                            <span className={`text-xs ${data.description.en.length > 180 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                                                {data.description.en.length}/200 characters
                                            </span>
                                        </div>
                                        <Textarea
                                            id="edit_description_en"
                                            value={data.description.en}
                                            onChange={(e) => setData('description', { ...data.description, en: e.target.value.slice(0, 200) })}
                                            className="resize-none h-20 text-sm"
                                            maxLength={200}
                                        />
                                        {(errors as any)['description.en'] && <p className="text-sm text-red-500">{(errors as any)['description.en']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Tab AR */}
                            {langTab === 'ar' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_title_ar" className="text-gray-700 dark:text-gray-200">
                                            عنوان الشعار (AR) (اختياري)
                                        </Label>
                                        <Input
                                            id="edit_title_ar"
                                            dir="rtl"
                                            value={data.title.ar}
                                            onChange={(e) => setData('title', { ...data.title, ar: e.target.value })}
                                        />
                                        {(errors as any)['title.ar'] && <p className="text-sm text-red-500">{(errors as any)['title.ar']}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="edit_description_ar" className="text-gray-700 dark:text-gray-200">
                                                وصف قصير (AR) (اختياري)
                                            </Label>
                                            <span className={`text-xs ${data.description.ar.length > 180 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                                                {data.description.ar.length}/200 حرف
                                            </span>
                                        </div>
                                        <Textarea
                                            id="edit_description_ar"
                                            dir="rtl"
                                            value={data.description.ar}
                                            onChange={(e) => setData('description', { ...data.description, ar: e.target.value.slice(0, 200) })}
                                            className="resize-none h-20 text-sm"
                                            maxLength={200}
                                        />
                                        {(errors as any)['description.ar'] && <p className="text-sm text-red-500">{(errors as any)['description.ar']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Gambar & CTA */}
                            <div className="grid gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <Label htmlFor="edit_desktop_image" className="text-gray-700 dark:text-gray-200">Ganti Gambar Desktop</Label>
                                {editingBanner?.desktop_image_url && (
                                    <div className="mb-2 h-16 w-32 border border-gray-200 dark:border-gray-700 overflow-hidden rounded bg-gray-50 dark:bg-gray-800">
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
                                <Label htmlFor="edit_mobile_image" className="text-gray-700 dark:text-gray-200">Ganti Gambar Mobile (Opsional)</Label>
                                {editingBanner?.mobile_image_url && (
                                    <div className="mb-2 h-16 w-12 border border-gray-200 dark:border-gray-700 overflow-hidden rounded bg-gray-50 dark:bg-gray-800">
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
                                <Label htmlFor="edit_cta_link" className="text-gray-700 dark:text-gray-200">Link Tujuan (Tautan saat di-klik)</Label>
                                <Input
                                    id="edit_cta_link"
                                    placeholder="https://"
                                    value={data.cta_link}
                                    onChange={(e) => setData('cta_link', e.target.value)}
                                />
                                {errors.cta_link && <p className="text-sm text-red-500">{errors.cta_link}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_sort_order" className="text-gray-700 dark:text-gray-200">Urutan Tampil</Label>
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
                                    <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none cursor-pointer">
                                        Aktif (Tampilkan di website)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-gray-100 dark:border-gray-800 pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!bannerToDelete}
                onOpenChange={(open) => !open && setBannerToDelete(null)}
                title="Hapus Banner Beranda"
                description={`Apakah Anda yakin ingin menghapus banner "${bannerToDelete ? getLocalizedValue(bannerToDelete.title_translations || bannerToDelete.title, 'id') : ''}"? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDeleteBanner}
            />
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
