import React, { useState } from 'react';
import { Palette, QrCode, FileText, Loader2, Languages, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ImageDropzone from '../components/ImageDropzone';
import { MultilingualField } from '../types';

interface BrandingMediaTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    settings: Record<string, string>;
    errors: Record<string, string>;
    previews: {
        logo: string | null;
        logoWhite: string | null;
        favicon: string | null;
        qris: string | null;
    };
    onFileChange: (key: string, file: File | null) => void;
    onTranslateFooter: () => Promise<void>;
    isTranslatingFooter: boolean;
}

export default function BrandingMediaTab({
    data,
    setData,
    settings,
    errors,
    previews,
    onFileChange,
    onTranslateFooter,
    isTranslatingFooter,
}: BrandingMediaTabProps) {
    const [footerLang, setFooterLang] = useState<'id' | 'en' | 'ar'>('id');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri: Logo & Identitas Visual */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Identitas Visual & Logo</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Logo resmi yayasan dalam versi standar, versi putih, dan favicon browser.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ImageDropzone
                            id="site_logo"
                            label="Logo Utama Website (Light Mode & Kwitansi)"
                            helperText="Digunakan pada header halaman publik, navbar admin, dan kop e-kwitansi resmi. Format PNG/SVG transparan direkomendasikan."
                            previewUrl={previews.logo}
                            currentStorageUrl={settings.site_logo}
                            onFileSelected={(file) => onFileChange('site_logo', file)}
                            error={errors.site_logo}
                            aspectRatio="wide"
                        />

                        <ImageDropzone
                            id="site_logo_white"
                            label="Logo Versi Putih (Dark Mode & Footer)"
                            helperText="Ditampilkan pada background gelap seperti footer publik dan sidebar gelap."
                            previewUrl={previews.logoWhite}
                            currentStorageUrl={settings.site_logo_white}
                            onFileSelected={(file) => onFileChange('site_logo_white', file)}
                            error={errors.site_logo_white}
                            darkPreview={true}
                            aspectRatio="wide"
                        />

                        <ImageDropzone
                            id="site_favicon"
                            label="Favicon Browser"
                            helperText="Ikon kecil pada tab browser (.ico, .png, atau .svg). Ukuran rekomendasi 32x32 atau 64x64 piksel."
                            previewUrl={previews.favicon}
                            currentStorageUrl={settings.site_favicon}
                            onFileSelected={(file) => onFileChange('site_favicon', file)}
                            error={errors.site_favicon}
                            aspectRatio="square"
                            maxSizeText="Maksimal 1 MB"
                        />
                    </div>
                </div>

                {/* Deskripsi Footer Ringkas */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profil Ringkas Footer</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Teks singkat 2-3 kalimat di bawah logo pada footer publik.</p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onTranslateFooter}
                            disabled={isTranslatingFooter || !data.footer_description.id}
                            className="h-8 text-xs font-medium border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/60 gap-1.5 self-start sm:self-auto shadow-2xs"
                        >
                            {isTranslatingFooter ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menerjemahkan...</span>
                                </>
                            ) : (
                                <>
                                    <Languages className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Terjemahkan Otomatis</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Language Switcher Tabs */}
                    <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-900 text-xs">
                        <button
                            type="button"
                            onClick={() => setFooterLang('id')}
                            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                footerLang === 'id'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                            }`}
                        >
                            🇮🇩 Indonesia {data.footer_description.id && '✓'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFooterLang('en')}
                            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                footerLang === 'en'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                            }`}
                        >
                            🇬🇧 English {data.footer_description.en && '✓'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFooterLang('ar')}
                            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                footerLang === 'ar'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                            }`}
                        >
                            🇸🇦 العربية {data.footer_description.ar && '✓'}
                        </button>
                    </div>

                    <div>
                        <Label htmlFor={`footer_desc_${footerLang}`} className="text-xs font-medium">
                            Naskah Ringkasan Profil ({footerLang === 'id' ? 'Bahasa Indonesia' : footerLang === 'en' ? 'English' : 'العربية'})
                        </Label>
                        <textarea
                            id={`footer_desc_${footerLang}`}
                            rows={3}
                            dir={footerLang === 'ar' ? 'rtl' : 'ltr'}
                            value={data.footer_description[footerLang] || ''}
                            onChange={(e) => setData('footer_description', {
                                ...data.footer_description,
                                [footerLang]: e.target.value
                            })}
                            placeholder={footerLang === 'ar' ? 'وصف موجز للمؤسسة...' : footerLang === 'en' ? 'Brief organization overview for the footer...' : 'Deskripsi singkat profil yayasan...'}
                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                        />
                        {errors[`footer_description.${footerLang}`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`footer_description.${footerLang}`]}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Kolom Kanan: QRIS Donasi Cepat */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">QRIS Donasi Cepat</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Barcode QRIS resmi yayasan yang ditampilkan pada fat footer website.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-5 bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                        <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 mb-4">
                            <img 
                                src={previews.qris || (settings.qris_image ? `/storage/${settings.qris_image}` : '/images/qris/logo-qris-insani.webp')} 
                                alt="QRIS Donasi" 
                                className="w-48 h-auto object-contain rounded-lg" 
                            />
                        </div>

                        <label className="cursor-pointer">
                            <div className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
                                <QrCode className="w-3.5 h-3.5 mr-2" />
                                {data.qris_image ? 'Ganti Berkas Barcode QRIS' : 'Unggah Barcode QRIS Baru'}
                            </div>
                            <input 
                                type="file" 
                                accept="image/png,image/jpeg,image/webp" 
                                className="hidden" 
                                onChange={(e) => onFileChange('qris_image', e.target.files?.[0] || null)} 
                            />
                        </label>

                        <p className="text-[11px] text-gray-400 mt-2 max-w-xs">
                            Format: PNG, JPG, atau WebP (Maks 3 MB). Disarankan menggunakan barcode berlatar putih bersih.
                        </p>

                        {errors.qris_image && (
                            <p className="text-xs text-red-500 mt-2">{errors.qris_image}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
