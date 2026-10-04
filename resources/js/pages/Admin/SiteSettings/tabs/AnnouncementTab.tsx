import React, { useState } from 'react';
import { Megaphone, Languages, Loader2, ExternalLink, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface AnnouncementTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    onTranslateAnnouncement: () => Promise<void>;
    isTranslatingAnnouncement: boolean;
}

export default function AnnouncementTab({
    data,
    setData,
    errors,
    onTranslateAnnouncement,
    isTranslatingAnnouncement,
}: AnnouncementTabProps) {
    const [lang, setLang] = useState<'id' | 'en' | 'ar'>('id');

    const currentText = data.announcement_text[lang] || data.announcement_text.id || 'Pengumuman / Siaran Darurat Penting Yayasan';
    const isEnabled = data.announcement_enabled === '1';

    return (
        <div className="space-y-6">
            {/* Live Interactive Banner Preview di Bagian Atas */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/70">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isEnabled ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        </span>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            Pratinjau Langsung Bilah Pengumuman (Header Website)
                        </h3>
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isEnabled 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                    }`}>
                        {isEnabled ? 'Status: Aktif' : 'Status: Nonaktif'}
                    </span>
                </div>

                {/* Banner simulation */}
                <div 
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center text-center text-xs text-white font-medium shadow-inner transition-colors duration-200"
                    style={{ backgroundColor: data.announcement_bg_color || '#1A56DB' }}
                >
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Megaphone className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentText}</span>
                        {data.announcement_link && (
                            <span className="inline-flex items-center gap-1 underline font-semibold text-white/90 hover:text-white ml-1">
                                Selengkapnya <ArrowRight className="w-3 h-3" />
                            </span>
                        )}
                    </div>
                </div>

                {!isEnabled && (
                    <p className="text-[11px] text-gray-400 text-center italic">
                        Banner saat ini disembunyikan dari halaman publik karena switch di bawah berada dalam posisi nonaktif.
                    </p>
                )}
            </div>

            {/* Konfigurasi Banner */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pengaturan Bilah Pengumuman</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tampilkan siaran darurat atau pengumuman prioritas di bagian paling atas situs.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                        <Label htmlFor="announcement_enabled" className="text-xs font-semibold cursor-pointer">
                            Aktifkan Banner
                        </Label>
                        <Switch
                            id="announcement_enabled"
                            checked={isEnabled}
                            onCheckedChange={(checked) => setData('announcement_enabled', checked ? '1' : '0')}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Language Switcher & Auto Translate */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-900 text-xs">
                            <button
                                type="button"
                                onClick={() => setLang('id')}
                                className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                    lang === 'id'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                }`}
                            >
                                🇮🇩 Indonesia {data.announcement_text.id && '✓'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('en')}
                                className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                    lang === 'en'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                }`}
                            >
                                🇬🇧 English {data.announcement_text.en && '✓'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('ar')}
                                className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                                    lang === 'ar'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                }`}
                            >
                                🇸🇦 العربية {data.announcement_text.ar && '✓'}
                            </button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onTranslateAnnouncement}
                            disabled={isTranslatingAnnouncement || !data.announcement_text.id}
                            className="h-8 text-xs font-semibold border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/60 gap-1.5 shadow-2xs"
                        >
                            {isTranslatingAnnouncement ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menerjemahkan...</span>
                                </>
                            ) : (
                                <>
                                    <Languages className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Terjemahkan Otomatis</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <div>
                        <Label htmlFor={`announcement_${lang}`} className="text-xs font-semibold">
                            Teks Pengumuman ({lang === 'id' ? 'Bahasa Indonesia' : lang === 'en' ? 'English' : 'العربية'})
                        </Label>
                        <Input
                            id={`announcement_${lang}`}
                            dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            value={data.announcement_text[lang] || ''}
                            onChange={(e) => setData('announcement_text', {
                                ...data.announcement_text,
                                [lang]: e.target.value
                            })}
                            placeholder={lang === 'ar' ? 'نص الإعلان أو التنبيه...' : lang === 'en' ? 'Announcement alert text...' : 'cth: Tanggap Darurat Bencana Banjir Bandang: Salurkan bantuan Anda sekarang!'}
                            className="mt-1"
                        />
                        {errors[`announcement_text.${lang}`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`announcement_text.${lang}`]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                            <Label htmlFor="announcement_link" className="text-xs font-semibold">Tautan Target / Link Halaman (Opsional)</Label>
                            <Input
                                id="announcement_link"
                                value={data.announcement_link}
                                onChange={(e) => setData('announcement_link', e.target.value)}
                                placeholder="cth: /program/tanggap-darurat"
                                className="mt-1 font-mono text-xs"
                            />
                            {errors.announcement_link && (
                                <p className="text-xs text-red-500 mt-1">{errors.announcement_link}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="announcement_bg_color" className="text-xs font-semibold">Warna Latar Banner</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <input 
                                    type="color" 
                                    id="announcement_bg_color"
                                    value={data.announcement_bg_color}
                                    onChange={(e) => setData('announcement_bg_color', e.target.value)}
                                    className="w-10 h-9 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer shrink-0"
                                />
                                <Input
                                    value={data.announcement_bg_color}
                                    onChange={(e) => setData('announcement_bg_color', e.target.value)}
                                    className="font-mono text-xs"
                                    placeholder="#1A56DB"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
