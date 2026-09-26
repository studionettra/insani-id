import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Target, Infinity, Info, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn, getLocalizedValue } from '@/lib/utils';

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
        is_continuous: false,
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
        <>
            <Head title="Buat Program Galang Dana" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
                <div>
                    <Button variant="ghost" asChild className="mb-4 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800">
                        <Link href="/akun/programs">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar Program
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Buat Program Galang Dana Baru</h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">Lengkapi informasi di bawah ini untuk memulai penggalangan dana Anda.</p>
                </div>

                <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Informasi Program</CardTitle>
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
                                        className="flex h-10 w-full rounded-md border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{getLocalizedValue(cat.name)}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
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

                                {/* Pilihan Tipe Target Donasi */}
                                <div className="md:col-span-2 space-y-3 pt-2">
                                    <Label className="text-sm font-semibold text-slate-900 dark:text-white block">
                                        Tipe Target Donasi <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Opsi 1: Dengan Target Nominal */}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setData('is_continuous', false)}
                                            onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && setData('is_continuous', false)}
                                            className={cn(
                                                "relative flex items-start p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none",
                                                !data.is_continuous
                                                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-500 shadow-xs ring-1 ring-blue-600/20"
                                                    : "border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-slate-300 dark:hover:border-gray-600 hover:bg-slate-50/50"
                                            )}
                                        >
                                            <div className="flex items-center h-5 mt-0.5">
                                                <input
                                                    type="radio"
                                                    id="type_target"
                                                    name="target_type"
                                                    checked={!data.is_continuous}
                                                    onChange={() => setData('is_continuous', false)}
                                                    className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <label htmlFor="type_target" className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer">
                                                    <Target className={cn("h-4 w-4", !data.is_continuous ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                                                    Dengan Target Nominal
                                                </label>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                                                    Program memiliki batas nominal dana yang ingin dicapai. Otomatis selesai jika target 100% tercapai.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Opsi 2: Program Berkelanjutan / Rutin */}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => {
                                                setData(prev => ({
                                                    ...prev,
                                                    is_continuous: true,
                                                    target_amount: '',
                                                }));
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === ' ' || e.key === 'Enter') {
                                                    setData(prev => ({
                                                        ...prev,
                                                        is_continuous: true,
                                                        target_amount: '',
                                                    }));
                                                }
                                            }}
                                            className={cn(
                                                "relative flex items-start p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none",
                                                data.is_continuous
                                                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-600/20"
                                                    : "border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-slate-300 dark:hover:border-gray-600 hover:bg-slate-50/50"
                                            )}
                                        >
                                            <div className="flex items-center h-5 mt-0.5">
                                                <input
                                                    type="radio"
                                                    id="type_continuous"
                                                    name="target_type"
                                                    checked={data.is_continuous}
                                                    onChange={() => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            is_continuous: true,
                                                            target_amount: '',
                                                        }));
                                                    }}
                                                    className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                                />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <label htmlFor="type_continuous" className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer">
                                                    <Infinity className={cn("h-4 w-4", data.is_continuous ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                                                    Program Berkelanjutan
                                                </label>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                                                    Tanpa batas target nominal. Donasi berjalan fleksibel secara berkelanjutan (contoh: sedekah subuh, infaq dakwah).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Kolom Target Donasi */}
                                {!data.is_continuous ? (
                                    <div>
                                        <Label htmlFor="target_amount" className="mb-2 block">
                                            Target Donasi (Rp) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="target_amount"
                                            type="number"
                                            value={data.target_amount}
                                            onChange={e => setData('target_amount', e.target.value)}
                                            placeholder="Contoh: 50000000"
                                            min="10000"
                                            required={!data.is_continuous}
                                        />
                                        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 flex items-start gap-1">
                                            <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                            <span>Program akan otomatis berstatus <strong>Selesai</strong> jika dana terkumpul mencapai target.</span>
                                        </p>
                                        {errors.target_amount && <p className="text-red-500 text-sm mt-1">{errors.target_amount}</p>}
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-center">
                                        <div className="p-3.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                                            <div className="font-semibold flex items-center gap-1.5 mb-1 text-emerald-900 dark:text-emerald-200">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                Mode Donasi Berkelanjutan Aktif
                                            </div>
                                            <p className="leading-relaxed text-[11px] text-emerald-700 dark:text-emerald-300/90">
                                                Target donasi tidak dibatasi. Donasi yang masuk dapat disalurkan bertahap sesuai kebutuhan operasional penerima manfaat.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Batas Waktu */}
                                <div>
                                    <Label htmlFor="deadline" className="mb-2 block">
                                        Batas Waktu {data.is_continuous ? '(Opsional / Fleksibel)' : '(Opsional)'}
                                    </Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={data.deadline}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setData('deadline', e.target.value)}
                                        onClick={(e) => 'showPicker' in HTMLInputElement.prototype && (e.target as HTMLInputElement).showPicker()}
                                    />
                                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5">
                                        {data.is_continuous
                                            ? 'Kosongkan jika program berjalan tanpa batas akhir waktu (rutin/selamanya).'
                                            : 'Kosongkan jika masa penggalangan dana fleksibel hingga target terpenuhi.'}
                                    </p>
                                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
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
                                                <p className="text-sm text-slate-500 dark:text-gray-400 mb-2">Pratinjau:</p>
                                                <img src={coverPreview} alt="Pratinjau Sampul" className="max-w-full h-auto max-h-64 rounded-md object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="story" className="mb-2 block">Cerita & Latar Belakang <span className="text-red-500">*</span></Label>
                                        <RichTextEditor
                                            value={data.story}
                                            onChange={value => setData('story', value)}
                                            placeholder="Ceritakan mengapa Anda menggalang dana untuk program ini secara detail..."
                                        />
                                        {errors.story && <p className="text-red-500 text-sm mt-1">{errors.story}</p>}
                                    </div>
                                </div>

                                <div className="border-t pt-6 flex justify-end">
                                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                        <Save className="mr-2 h-4 w-4" />
                                        Ajukan Program
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
        </>
    );
}
