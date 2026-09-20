import React from 'react';
import { Sparkles, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AutoTranslateBarProps {
    activeLocale: 'id' | 'en' | 'ar';
    onLocaleChange: (locale: 'id' | 'en' | 'ar') => void;
    onAutoTranslate: () => void;
    isTranslating: boolean;
    hasTranslations?: boolean;
}

export default function AutoTranslateBar({
    activeLocale,
    onLocaleChange,
    onAutoTranslate,
    isTranslating,
    hasTranslations = false,
}: AutoTranslateBarProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-insani-blue/10 dark:bg-insani-blue/20 text-insani-blue flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Bahasa Konten
                        </span>
                        {hasTranslations && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Tersedia EN & AR
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Admin dapat mengedit naskah untuk masing-masing bahasa pilihan.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* Language Tabs */}
                <div className="inline-flex rounded-lg p-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 text-xs">
                    <button
                        type="button"
                        onClick={() => onLocaleChange('id')}
                        className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                            activeLocale === 'id'
                                ? 'bg-insani-blue text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        🇮🇩 Indonesia
                    </button>
                    <button
                        type="button"
                        onClick={() => onLocaleChange('en')}
                        className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                            activeLocale === 'en'
                                ? 'bg-insani-blue text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        🇬🇧 English
                    </button>
                    <button
                        type="button"
                        onClick={() => onLocaleChange('ar')}
                        className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                            activeLocale === 'ar'
                                ? 'bg-insani-blue text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        🇸🇦 العربية
                    </button>
                </div>

                {/* Auto-Translate Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAutoTranslate}
                    disabled={isTranslating}
                    className="h-8 text-xs font-semibold border-insani-blue/40 text-insani-blue hover:bg-insani-blue hover:text-white transition-colors gap-1.5 shadow-xs bg-white dark:bg-slate-900"
                >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isTranslating ? 'animate-spin' : ''}`} />
                    {isTranslating ? 'Menerjemahkan...' : '✨ Auto-Translate'}
                </Button>
            </div>
        </div>
    );
}
