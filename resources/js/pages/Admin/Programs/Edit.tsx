import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

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

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/programs">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Program</h1>
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <form onSubmit={handleSubmit} className="p-6.5 space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Judul Program */}
                        <div className="md:col-span-2">
                            <Label htmlFor="title" className="mb-2.5 block text-black dark:text-white">
                                Judul Program <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                type="text"
                                value={data.title as string}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                        </div>

                        {/* Kategori */}
                        <div>
                            <Label htmlFor="category_id" className="mb-2.5 block text-black dark:text-white">
                                Kategori <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', parseInt(e.target.value))}
                                className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-blue-500 active:border-blue-500 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-500"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name.id || cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                        </div>

                        {/* Target Donasi */}
                        <div>
                            <Label htmlFor="target_amount" className="mb-2.5 block text-black dark:text-white">
                                Target Donasi (Opsional)
                            </Label>
                            <Input
                                id="target_amount"
                                type="number"
                                value={data.target_amount}
                                onChange={(e) => setData('target_amount', e.target.value)}
                                className="w-full"
                                min="0"
                            />
                            {errors.target_amount && <p className="mt-1 text-sm text-red-500">{errors.target_amount}</p>}
                        </div>

                        {/* Deadline */}
                        <div>
                            <Label htmlFor="deadline" className="mb-2.5 block text-black dark:text-white">
                                Batas Waktu (Opsional)
                            </Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className="w-full"
                            />
                            {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}
                        </div>

                        {/* Video URL */}
                        <div>
                            <Label htmlFor="video_url" className="mb-2.5 block text-black dark:text-white">
                                Tautan Video Youtube (Opsional)
                            </Label>
                            <Input
                                id="video_url"
                                type="url"
                                value={data.video_url}
                                onChange={(e) => setData('video_url', e.target.value)}
                                className="w-full"
                            />
                            {errors.video_url && <p className="mt-1 text-sm text-red-500">{errors.video_url}</p>}
                        </div>

                        {/* Cover Image */}
                        <div className="md:col-span-2">
                            <Label htmlFor="cover_image" className="mb-2.5 block text-black dark:text-white">
                                Gambar Utama (Cover)
                            </Label>
                            <input
                                id="cover_image"
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="w-full rounded-md border border-input bg-transparent p-3 outline-none transition file:mr-4 file:rounded file:border-0 file:bg-secondary file:py-1 file:px-2.5 file:text-sm file:font-medium focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <p className="mt-1 text-xs text-slate-500">Biarkan kosong jika tidak ingin mengubah gambar sampul.</p>
                            {errors.cover_image && <p className="mt-1 text-sm text-red-500">{errors.cover_image}</p>}
                            
                            {coverPreview && (
                                <div className="mt-4">
                                    <p className="text-sm mb-2">Preview:</p>
                                    <img src={coverPreview} alt="Preview" className="h-48 rounded-md object-cover" />
                                </div>
                            )}
                        </div>

                        {/* Story */}
                        <div className="md:col-span-2">
                            <Label htmlFor="story" className="mb-2.5 block text-black dark:text-white">
                                Cerita / Penjelasan Program <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="story"
                                rows={8}
                                value={data.story as string}
                                onChange={(e) => setData('story', e.target.value)}
                                className="w-full"
                                required
                            />
                            {errors.story && <p className="mt-1 text-sm text-red-500">{errors.story}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
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
