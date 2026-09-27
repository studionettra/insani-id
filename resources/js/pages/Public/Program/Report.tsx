import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ShieldAlert,
    Upload,
    X,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Camera,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/PublicLayout';
import { getLocalizedValue } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface Props {
    program: {
        id: number;
        title: any;
        slug: string;
        cover_image?: string | null;
        campaigner_name: string;
    };
    categories: Array<{
        id: number;
        name: any;
        name_translations?: { id?: string; en?: string; ar?: string };
        slug: string;
        description?: any;
    }>;
}

export default function ProgramReport({ program, categories }: Props) {
    const { t, locale } = useTranslation();
    const { auth, flash } = usePage<any>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<any>(null);

    const turnstileSiteKey = (import.meta as any).env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const title = getLocalizedValue(program.title, locale);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        reporter_name: auth?.user?.name || '',
        reporter_phone: auth?.user?.phone || '',
        reporter_email: auth?.user?.email || '',
        category_id: '',
        description: '',
        evidence: [] as File[],
        website: '', // Honeypot
        'cf-turnstile-response': '',
    });

    useEffect(() => {
        if (!document.getElementById('turnstile-script')) {
            const script = document.createElement('script');
            script.id = 'turnstile-script';
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        const renderWidget = () => {
            if ((window as any).turnstile && turnstileRef.current) {
                try {
                    widgetIdRef.current = (window as any).turnstile.render(turnstileRef.current, {
                        sitekey: turnstileSiteKey,
                        callback: (token: string) => {
                            setData('cf-turnstile-response', token);
                            clearErrors('cf-turnstile-response');
                        },
                        'expired-callback': () => {
                            setData('cf-turnstile-response', '');
                        },
                        'error-callback': () => {
                            setData('cf-turnstile-response', '');
                        },
                    });
                } catch (e) {
                    console.error('Turnstile rendering error', e);
                }
            } else {
                setTimeout(renderWidget, 500);
            }
        };

        renderWidget();

        return () => {
            if ((window as any).turnstile && widgetIdRef.current) {
                try {
                    (window as any).turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, []);

    const ticketNumber = flash?.ticket_number;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles = Array.from(e.target.files);
        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        for (const file of newFiles) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Ukuran file "${file.name}" melebihi 5MB.`);
                continue;
            }

            validFiles.push(file);
            if (file.type.startsWith('image/')) {
                newPreviews.push(URL.createObjectURL(file));
            } else {
                newPreviews.push('');
            }
        }

        const combinedFiles = [...files, ...validFiles].slice(0, 5);
        const combinedPreviews = [...previews, ...newPreviews].slice(0, 5);

        setFiles(combinedFiles);
        setPreviews(combinedPreviews);
        setData('evidence', combinedFiles);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);

        setFiles(updatedFiles);
        setPreviews(updatedPreviews);
        setData('evidence', updatedFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.category_id) {
            toast.error(t('Silakan pilih kategori pelanggaran.', 'Silakan pilih kategori pelanggaran.'));
            return;
        }

        if (data.description.length < 10) {
            toast.error(t('Detail laporan minimal 10 karakter.', 'Detail laporan minimal 10 karakter.'));
            return;
        }

        if (!data['cf-turnstile-response']) {
            toast.error(t('Mohon selesaikan verifikasi keamanan Cloudflare terlebih dahulu.', 'Mohon selesaikan verifikasi keamanan Cloudflare terlebih dahulu.'));
            return;
        }

        post(`/program/${program.slug}/lapor`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Laporan Anda berhasil dikirimkan.', 'Laporan Anda berhasil dikirimkan.'));
            },
            onError: () => {
                toast.error(t('Mohon periksa kembali form laporan Anda.', 'Mohon periksa kembali form laporan Anda.'));
            },
        });
    };

    // Render Success View
    if (ticketNumber) {
        return (
            <PublicLayout title={`Laporan Terkirim - ${title}`} hideFooter>
                <div className="bg-slate-50 min-h-screen py-10 px-4 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800">
                            {t('Laporan Berhasil Dikirim', 'Laporan Berhasil Dikirim')}
                        </h2>

                        <p className="text-sm text-slate-500 mt-2">
                            {t(
                                'Terima kasih atas kepedulian Anda menjaga ruang kebaikan tetap aman dan transparan.',
                                'Terima kasih atas kepedulian Anda menjaga ruang kebaikan tetap aman dan transparan.'
                            )}
                        </p>

                        <div className="my-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-left">
                            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                                {t('Nomor Tiket Laporan', 'Nomor Tiket Laporan')}
                            </span>
                            <span className="font-mono text-lg font-bold text-slate-800 block mt-0.5">
                                #{ticketNumber}
                            </span>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                {t(
                                    'Laporan Anda bersifat rahasia dan akan segera ditinjau oleh tim kepatuhan Insani Indonesia.',
                                    'Laporan Anda bersifat rahasia dan akan segera ditinjau oleh tim kepatuhan Insani Indonesia.'
                                )}
                            </p>
                        </div>

                        <Link href={`/program/${program.slug}`}>
                            <Button className="w-full bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl h-11 text-sm font-semibold">
                                {t('Kembali ke Halaman Program', 'Kembali ke Halaman Program')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout title={`Laporkan Program - ${title}`} hideFooter>
            <div className="bg-slate-50 min-h-screen py-6 sm:py-10">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Header Top Bar */}
                    <div className="flex items-center gap-3 mb-6">
                        <Link
                            href={`/program/${program.slug}`}
                            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-insani-blue hover:border-insani-blue transition-colors shadow-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <span className="text-xs font-semibold text-[#1A56DB] block uppercase tracking-wider">
                                {t('Pusat Bantuan & Kepatuhan', 'Pusat Bantuan & Kepatuhan')}
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                                {t('Laporkan Penyalahgunaan Galang Dana', 'Laporkan Penyalahgunaan Galang Dana')}
                            </h1>
                        </div>
                    </div>

                    {/* Program Preview Card */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs mb-6 flex gap-4 items-center">
                        {program.cover_image ? (
                            <img
                                src={program.cover_image}
                                alt={title}
                                className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-xl shrink-0"
                            />
                        ) : (
                            <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <span className="text-[11px] text-slate-400 block">{program.campaigner_name}</span>
                            <h2 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 mt-0.5 leading-snug">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Main Form Box */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Honeypot field (hidden from real users) */}
                            <input
                                type="text"
                                name="website"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                style={{ display: 'none' }}
                                tabIndex={-1}
                                autoComplete="off"
                            />

                            {/* Nama Lengkap */}
                            <div className="space-y-1.5">
                                <Label htmlFor="reporter_name" className="text-xs font-semibold text-slate-700">
                                    {t('Nama Lengkap', 'Nama Lengkap')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="reporter_name"
                                    type="text"
                                    placeholder={t('Masukkan nama lengkap Anda', 'Masukkan nama lengkap Anda')}
                                    value={data.reporter_name}
                                    onChange={(e) => setData('reporter_name', e.target.value)}
                                    className="rounded-xl h-11 text-sm bg-slate-50/50 border-slate-200"
                                />
                                {errors.reporter_name && (
                                    <p className="text-xs text-rose-500">{errors.reporter_name}</p>
                                )}
                            </div>

                            {/* Nomor Handphone */}
                            <div className="space-y-1.5">
                                <Label htmlFor="reporter_phone" className="text-xs font-semibold text-slate-700">
                                    {t('Nomor Handphone / WhatsApp', 'Nomor Handphone / WhatsApp')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="reporter_phone"
                                    type="tel"
                                    placeholder="081234567890"
                                    value={data.reporter_phone}
                                    onChange={(e) => setData('reporter_phone', e.target.value)}
                                    className="rounded-xl h-11 text-sm bg-slate-50/50 border-slate-200"
                                />
                                {errors.reporter_phone && (
                                    <p className="text-xs text-rose-500">{errors.reporter_phone}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="reporter_email" className="text-xs font-semibold text-slate-700">
                                    {t('Email', 'Email')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="reporter_email"
                                    type="email"
                                    placeholder="email@anda.com"
                                    value={data.reporter_email}
                                    onChange={(e) => setData('reporter_email', e.target.value)}
                                    className="rounded-xl h-11 text-sm bg-slate-50/50 border-slate-200"
                                />
                                {errors.reporter_email && (
                                    <p className="text-xs text-rose-500">{errors.reporter_email}</p>
                                )}
                            </div>

                            {/* Kategori Pelanggaran */}
                            <div className="space-y-1.5">
                                <Label htmlFor="category_id" className="text-xs font-semibold text-slate-700">
                                    {t('Kategori Pelanggaran', 'Kategori Pelanggaran')} <span className="text-rose-500">*</span>
                                </Label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A56DB]/20 focus:border-[#1A56DB]"
                                >
                                    <option value="">{t('Pilih kategori pelanggaran', 'Pilih kategori pelanggaran')}</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {getLocalizedValue(cat.name_translations || cat.name, locale)}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="text-xs text-rose-500">{errors.category_id}</p>
                                )}
                            </div>

                            {/* Detail Laporan */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                                        {t('Detail Laporan', 'Detail Laporan')} <span className="text-rose-500">*</span>
                                    </Label>
                                    <span
                                        className={`text-xs ${
                                            data.description.length > 1000
                                                ? 'text-rose-500 font-bold'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        {data.description.length} / 1000
                                    </span>
                                </div>
                                <Textarea
                                    id="description"
                                    rows={5}
                                    placeholder={t(
                                        'Silakan tulis deskripsi laporan Anda secara rinci...',
                                        'Silakan tulis deskripsi laporan Anda secara rinci...'
                                    )}
                                    value={data.description}
                                    maxLength={1000}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="rounded-xl text-sm bg-slate-50/50 border-slate-200"
                                />
                                {errors.description && (
                                    <p className="text-xs text-rose-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Upload Bukti Pendukung */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700 block">
                                    {t(
                                        'Lampirkan foto bukti atau dokumen pendukung untuk menunjang laporan Anda',
                                        'Lampirkan foto bukti atau dokumen pendukung untuk menunjang laporan Anda'
                                    )}
                                </Label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {previews.map((preview, idx) => (
                                        <div
                                            key={idx}
                                            className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group"
                                        >
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Bukti"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="p-2 text-center">
                                                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                                                    <span className="text-[10px] text-slate-500 truncate block mt-1">
                                                        {files[idx]?.name}
                                                    </span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}

                                    {files.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1A56DB] bg-slate-50/50 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center p-2 text-slate-500 hover:text-[#1A56DB]"
                                        >
                                            <Camera className="w-6 h-6 mb-1 text-slate-400" />
                                            <span className="text-[11px] font-semibold">{t('Unggah', 'Unggah')}</span>
                                            <span className="text-[9px] text-slate-400">Maks. 5MB</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    {t('Maksimal 5 file bukti (JPG, PNG, atau PDF).', 'Maksimal 5 file bukti (JPG, PNG, atau PDF).')}
                                </p>
                            </div>

                            {/* Cloudflare Turnstile */}
                            <div className="flex flex-col items-center sm:items-start py-2">
                                <div ref={turnstileRef} className="my-1"></div>
                                {errors['cf-turnstile-response'] && (
                                    <p className="text-xs text-rose-500 mt-1">{errors['cf-turnstile-response']}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-12 bg-[#1A56DB] hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('Mengirimkan Laporan...', 'Mengirimkan Laporan...')}
                                        </>
                                    ) : (
                                        t('Kirim Laporan', 'Kirim Laporan')
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
