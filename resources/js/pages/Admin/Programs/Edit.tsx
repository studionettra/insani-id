import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '@/components/rich-text-editor';

interface Category {
    id: number;
    name: { id: string };
}

interface Program {
    id: number;
    title: { id: string };
    category_id: number;
    target_amount: string | null;
    deadline: string | null;
    story: { id: string };
    cover_image: string;
    video_url: string | null;
}

interface Props {
    categories: Category[];
    program: Program;
}

export default function ProgramEdit({ categories, program }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: program.title,
        category_id: program.category_id,
        target_amount: program.target_amount || '',
        deadline: program.deadline ? program.deadline.split('T')[0] : '', // format YYYY-MM-DD
        story: program.story,
        cover_image: null as File | null,
        video_url: program.video_url || '',
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(
        program.cover_image ? `/storage/${program.cover_image}` : null
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are uploading a file, we need to use post with _method=PUT to handle multipart/form-data correctly in Inertia
        // Wait, Inertia's post method handles files. So we use router.post instead if we have files.
        // Or we can use post to a special route.
        // Actually, Inertia has a trick for PUT with files:
        // https://inertiajs.com/file-uploads#multipart-limitations
        // We will just use post and append _method: 'put'
        import('@inertiajs/react').then(({ router }) => {
            router.post(`/admin/programs/${program.id}`, {
                _method: 'put',
                ...data,
            }, {
                forceFormData: true,
            });
        });
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Head title="Edit Program" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="border-gray-200 hover:bg-gray-50 text-gray-600">
                        <Link href="/admin/programs"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Program</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Perbarui informasi program donasi.
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                        <h3 className="font-semibold text-gray-900">
                            Informasi Program Utama
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Judul Program */}
                            <div className="md:col-span-2 space-y-1.5">
                                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                                    Judul Program <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title as string}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full border-gray-200 focus-visible:ring-[#1A56DB]"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            {/* Kategori */}
                            <div className="space-y-1.5">
                                <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                                    Kategori <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', parseInt(e.target.value))}
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name.id || cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                            </div>

                            {/* Target Donasi */}
                            <div className="space-y-1.5">
                                <Label htmlFor="target_amount" className="text-sm font-medium text-gray-700">
                                    Target Donasi (Opsional)
                                </Label>
                                <Input
                                    id="target_amount"
                                    type="number"
                                    value={data.target_amount}
                                    onChange={(e) => setData('target_amount', e.target.value)}
                                    className="w-full border-gray-200 focus-visible:ring-[#1A56DB]"
                                    min="0"
                                />
                                {errors.target_amount && <p className="mt-1 text-xs text-red-500">{errors.target_amount}</p>}
                            </div>

                            {/* Deadline */}
                            <div className="space-y-1.5">
                                <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">
                                    Batas Waktu (Opsional)
                                </Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={data.deadline}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                    onClick={(e) => 'showPicker' in HTMLInputElement.prototype && (e.target as HTMLInputElement).showPicker()}
                                    className="w-full border-gray-200 focus-visible:ring-[#1A56DB]"
                                />
                                {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
                            </div>

                            {/* Video URL */}
                            <div className="space-y-1.5">
                                <Label htmlFor="video_url" className="text-sm font-medium text-gray-700">
                                    Tautan Video Youtube (Opsional)
                                </Label>
                                <Input
                                    id="video_url"
                                    type="url"
                                    value={data.video_url}
                                    onChange={(e) => setData('video_url', e.target.value)}
                                    className="w-full border-gray-200 focus-visible:ring-[#1A56DB]"
                                />
                                {errors.video_url && <p className="mt-1 text-xs text-red-500">{errors.video_url}</p>}
                            </div>

                            {/* Cover Image */}
                            <div className="md:col-span-2 space-y-1.5">
                                <Label htmlFor="cover_image" className="text-sm font-medium text-gray-700">
                                    Gambar Utama (Cover)
                                </Label>
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:py-1 file:px-3 file:text-xs file:font-medium file:text-[#1A56DB] hover:file:bg-blue-100 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]"
                                />
                                <p className="text-[11px] text-gray-500">Biarkan kosong jika tidak ingin mengubah gambar sampul.</p>
                                {errors.cover_image && <p className="mt-1 text-xs text-red-500">{errors.cover_image}</p>}
                                
                                {coverPreview && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                                        <img src={coverPreview} alt="Preview" className="h-48 rounded-lg object-cover border border-gray-100" />
                                    </div>
                                )}
                            </div>

                            {/* Story */}
                            <div className="md:col-span-2 space-y-1.5">
                                <Label htmlFor="story" className="text-sm font-medium text-gray-700">
                                    Cerita / Penjelasan Program <span className="text-red-500">*</span>
                                </Label>
                                <RichTextEditor
                                    value={data.story as string}
                                    onChange={(value) => setData('story', value)}
                                />
                                {errors.story && <p className="mt-1 text-xs text-red-500">{errors.story}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                disabled={processing}
                                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        
        </>
        
    );
}

ProgramEdit.layout = {
    breadcrumbs: [
        {
            title: 'Edit Program',
            href: '/admin/programs',
        },
    ],
};
