import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

interface Category {
    id: number;
    name: { id: string };
}

interface Props {
    categories: Category[];
}

export default function AkunProgramCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: '',
        target_amount: '',
        deadline: '',
        story: '',
        cover_image: null as File | null,
        video_url: '',
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/akun/programs');
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    return (
        <PublicLayout>
            <Head title="Buat Program Galang Dana" />

            <div className="bg-slate-50 py-12 min-h-screen">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-6">
                        <Button variant="ghost" asChild className="mb-4">
                            <Link href="/akun/programs">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Program
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-800">Buat Program Galang Dana Baru</h1>
                        <p className="text-slate-500 mt-1">Lengkapi informasi di bawah ini untuk memulai penggalangan dana Anda.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Program</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="title" className="mb-2 block">Judul Program <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            placeholder="Contoh: Bantuan Sembako untuk Lansia Dhuafa"
                                            required
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="category_id" className="mb-2 block">Kategori <span className="text-red-500">*</span></Label>
                                        <select
                                            id="category_id"
                                            value={data.category_id}
                                            onChange={e => setData('category_id', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name.id || cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="target_amount" className="mb-2 block">Target Donasi (Rp) (Opsional)</Label>
                                        <Input
                                            id="target_amount"
                                            type="number"
                                            value={data.target_amount}
                                            onChange={e => setData('target_amount', e.target.value)}
                                            placeholder="Contoh: 100000000"
                                            min="0"
                                        />
                                        {errors.target_amount && <p className="text-red-500 text-sm mt-1">{errors.target_amount}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="deadline" className="mb-2 block">Batas Waktu (Opsional)</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={data.deadline}
                                            onChange={e => setData('deadline', e.target.value)}
                                        />
                                        {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="video_url" className="mb-2 block">URL Video Youtube (Opsional)</Label>
                                        <Input
                                            id="video_url"
                                            type="url"
                                            value={data.video_url}
                                            onChange={e => setData('video_url', e.target.value)}
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                        {errors.video_url && <p className="text-red-500 text-sm mt-1">{errors.video_url}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="cover_image" className="mb-2 block">Gambar Sampul <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="cover_image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverChange}
                                            required
                                        />
                                        {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>}
                                        
                                        {coverPreview && (
                                            <div className="mt-4">
                                                <p className="text-sm text-slate-500 mb-2">Pratinjau:</p>
                                                <img src={coverPreview} alt="Pratinjau Sampul" className="max-w-full h-auto max-h-64 rounded-md object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="story" className="mb-2 block">Cerita & Latar Belakang <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="story"
                                            value={data.story}
                                            onChange={e => setData('story', e.target.value)}
                                            placeholder="Ceritakan mengapa Anda menggalang dana untuk program ini secara detail..."
                                            rows={10}
                                            required
                                        />
                                        {errors.story && <p className="text-red-500 text-sm mt-1">{errors.story}</p>}
                                    </div>
                                </div>

                                <div className="border-t pt-6 flex justify-end">
                                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                        <Save className="mr-2 h-4 w-4" />
                                        Ajukan Program (Verifikasi)
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}
