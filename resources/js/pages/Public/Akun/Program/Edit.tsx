import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

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
    rejection_notes: string | null;
    status: string;
}

interface Props {
    categories: Category[];
    program: Program;
}

export default function AkunProgramEdit({ categories, program }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: program.title,
        category_id: program.category_id,
        target_amount: program.target_amount || '',
        deadline: program.deadline ? program.deadline.split('T')[0] : '',
        story: program.story,
        cover_image: null as File | null,
        video_url: program.video_url || '',
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(
        program.cover_image ? `/storage/${program.cover_image}` : null
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        import('@inertiajs/react').then(({ router }) => {
            router.post(`/akun/programs/${program.id}`, {
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
        <AppLayout breadcrumbs={[{ title: 'Edit Program', href: `/akun/programs/${program.id}/edit` }]}>
            <Head title={`Edit Program: ${program.title.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div>
                        <Button variant="ghost" asChild className="mb-4">
                            <Link href="/akun/programs">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Program
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-800">Edit Program</h1>
                        <p className="text-slate-500 mt-1">Perbarui informasi program galang dana Anda.</p>
                    </div>

                    {program.status === 'rejected' && program.rejection_notes && (
                        <Alert variant="destructive" className="mb-6 bg-red-50 text-red-800 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800 font-bold">Program Ditolak</AlertTitle>
                            <AlertDescription className="text-red-700">
                                <strong>Catatan dari Tim Verifikasi:</strong><br />
                                {program.rejection_notes}
                            </AlertDescription>
                        </Alert>
                    )}

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
                                            value={data.title as string}
                                            onChange={e => setData('title', e.target.value)}
                                            required
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="category_id" className="mb-2 block">Kategori <span className="text-red-500">*</span></Label>
                                        <select
                                            id="category_id"
                                            value={data.category_id}
                                            onChange={e => setData('category_id', parseInt(e.target.value))}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
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
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setData('deadline', e.target.value)}
                                            onClick={(e) => 'showPicker' in HTMLInputElement.prototype && (e.target as HTMLInputElement).showPicker()}
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
                                        />
                                        {errors.video_url && <p className="text-red-500 text-sm mt-1">{errors.video_url}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="cover_image" className="mb-2 block">Gambar Sampul</Label>
                                        <Input
                                            id="cover_image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverChange}
                                        />
                                        <p className="mt-1 text-xs text-slate-500">Biarkan kosong jika tidak ingin mengubah gambar.</p>
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
                                        <RichTextEditor
                                            value={data.story as string}
                                            onChange={value => setData('story', value)}
                                        />
                                        {errors.story && <p className="text-red-500 text-sm mt-1">{errors.story}</p>}
                                    </div>
                                </div>

                                <div className="border-t pt-6 flex justify-end">
                                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan Perubahan & Ajukan Ulang
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
        </AppLayout>
    );
}
