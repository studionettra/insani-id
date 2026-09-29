import React, { useState } from 'react';
import { Sparkles, Globe, Compass, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AboutProfileTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    onTranslateAbout: () => Promise<void>;
    isTranslatingAbout: boolean;
}

export default function AboutProfileTab({
    data,
    setData,
    errors,
    onTranslateAbout,
    isTranslatingAbout,
}: AboutProfileTabProps) {
    const [activeLang, setActiveLang] = useState<'id' | 'en' | 'ar'>('id');

    const hasId = Boolean(data.about_vision.id || data.about_mission.id || data.about_values.id);
    const hasEn = Boolean(data.about_vision.en && data.about_mission.en && data.about_values.en);
    const hasAr = Boolean(data.about_vision.ar && data.about_mission.ar && data.about_values.ar);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri: Form Editor Visi, Misi, & Nilai */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                    {/* Header Card dengan Terjemahan Terpadu */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                <Compass className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profil Lembaga: Visi, Misi & Nilai</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Landasan pergerakan yayasan yang ditampilkan pada halaman Tentang Kami (/tentang-kami).</p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onTranslateAbout}
                            disabled={isTranslatingAbout || !hasId}
                            className="h-8 text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/60 gap-1.5 self-start sm:self-auto shadow-2xs"
                        >
                            {isTranslatingAbout ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menerjemahkan...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Terjemahkan Otomatis (EN & AR)</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Language Selector Tabs */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-900 text-xs">
                            <button
                                type="button"
                                onClick={() => setActiveLang('id')}
                                className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                    activeLang === 'id'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                }`}
                            >
                                🇮🇩 Bahasa Indonesia (Sumber)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveLang('en')}
                                className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                    activeLang === 'en'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                }`}
                            >
                                🇬🇧 English {hasEn && '✓'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveLang('ar')}
                                className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                    activeLang === 'ar'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                }`}
                            >
                                🇸🇦 العربية {hasAr && '✓'}
                            </button>
                        </div>

                        {/* Status Terjemahan Ringkas */}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                            <span>Status:</span>
                            <span className={`px-1.5 py-0.5 rounded font-medium ${hasEn ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                EN {hasEn ? '✓' : '—'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-medium ${hasAr ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                AR {hasAr ? '✓' : '—'}
                            </span>
                        </div>
                    </div>

                    {/* Visi Yayasan */}
                    <div className="space-y-1.5">
                        <Label htmlFor={`vision_${activeLang}`} className="text-xs font-semibold">
                            Visi Yayasan ({activeLang === 'id' ? 'Bahasa Indonesia' : activeLang === 'en' ? 'English' : 'العربية'})
                        </Label>
                        <textarea
                            id={`vision_${activeLang}`}
                            rows={3}
                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            value={data.about_vision[activeLang] || ''}
                            onChange={(e) => setData('about_vision', {
                                ...data.about_vision,
                                [activeLang]: e.target.value
                            })}
                            placeholder={activeLang === 'ar' ? 'رؤية المؤسسة...' : activeLang === 'en' ? 'Foundation vision...' : 'Menjadi pelopor kolaborasi kebaikan lintas batas demi mewujudkan masyarakat yang berdaya...'}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                        />
                        {activeLang === 'id' && (
                            <p className="text-[11px] text-gray-400">Kosongkan jika ingin menggunakan rumusan visi baku bawaan sistem.</p>
                        )}
                        {errors[`about_vision.${activeLang}`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`about_vision.${activeLang}`]}</p>
                        )}
                    </div>

                    {/* Misi Yayasan */}
                    <div className="space-y-1.5">
                        <Label htmlFor={`mission_${activeLang}`} className="text-xs font-semibold">
                            Misi Yayasan ({activeLang === 'id' ? 'Bahasa Indonesia' : activeLang === 'en' ? 'English' : 'العربية'})
                        </Label>
                        <textarea
                            id={`mission_${activeLang}`}
                            rows={4}
                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            value={data.about_mission[activeLang] || ''}
                            onChange={(e) => setData('about_mission', {
                                ...data.about_mission,
                                [activeLang]: e.target.value
                            })}
                            placeholder={activeLang === 'ar' ? 'رسالة المؤسسة...' : activeLang === 'en' ? 'Foundation mission points (one per line)...' : 'Menggalang kepedulian masyarakat...\nMemberikan bantuan tepat sasaran...\nMengedukasi masyarakat...'}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                        />
                        <p className="text-[11px] text-gray-400">Gunakan baris baru (Enter) untuk setiap butir misi. Setiap baris otomatis dirender sebagai poin terpisah.</p>
                        {errors[`about_mission.${activeLang}`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`about_mission.${activeLang}`]}</p>
                        )}
                    </div>

                    {/* Nilai-Nilai Perjuangan */}
                    <div className="space-y-1.5">
                        <Label htmlFor={`values_${activeLang}`} className="text-xs font-semibold">
                            Nilai-Nilai Perjuangan ({activeLang === 'id' ? 'Bahasa Indonesia' : activeLang === 'en' ? 'English' : 'العربية'})
                        </Label>
                        <textarea
                            id={`values_${activeLang}`}
                            rows={4}
                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            value={data.about_values[activeLang] || ''}
                            onChange={(e) => setData('about_values', {
                                ...data.about_values,
                                [activeLang]: e.target.value
                            })}
                            placeholder={activeLang === 'ar' ? 'القيم الأساسية...' : activeLang === 'en' ? 'Core Values (Format: Title: Description per line)...' : 'Integritas: Transparan dan akuntabel dalam pengelolaan amanah donatur.\nKolaborasi: Bersinergi dengan semua pihak untuk dampak yang lebih luas.\nEmpati: Bergerak dari panggilan hati nurani untuk meringankan beban sesama.'}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                        />
                        <p className="text-[11px] text-gray-400">Format: <code>Judul: Keterangan</code> per baris (contoh: <code>Integritas: Transparan dan akuntabel...</code>).</p>
                        {errors[`about_values.${activeLang}`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`about_values.${activeLang}`]}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Kolom Kanan: Panduan & Tips Tampilan */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Info className="w-4 h-4 text-indigo-500" />
                        <span>Panduan Format & Tampilan</span>
                    </div>

                    <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                            <span className="font-semibold text-indigo-900 dark:text-indigo-300 block">
                                🌟 Terjemahan Otomatis Berbasis AI
                            </span>
                            <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                                Cukup isi teks dalam Bahasa Indonesia, lalu tekan tombol <strong>Terjemahkan Otomatis</strong>. Sistem akan mengisi versi bahasa Inggris dan Arab secara simultan tanpa merusak format baris.
                            </p>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                🎯 Distribusi Konten di Website
                            </span>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                                <li>Halaman <code>/tentang-kami</code></li>
                                <li>Proposal kemitraan CSR otomatis</li>
                                <li>Laporan tahunan akuntabilitas publik</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
