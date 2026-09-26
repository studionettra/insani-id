import React from 'react';
import { Languages, Sparkles, Loader2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TranslationStatusCardProps {
    hasId?: boolean;
    hasEn?: boolean;
    hasAr?: boolean;
    onTranslate?: () => void | Promise<void>;
    onAutoTranslate?: () => void | Promise<void>;
    isTranslating: boolean;
    title?: string | { id?: string; en?: string; ar?: string };
    content?: { id?: string; en?: string; ar?: string };
    description?: string;
    className?: string;
    buttonText?: string;
    disabled?: boolean;
    compact?: boolean;
}

export default function TranslationStatusCard({
    hasId,
    hasEn,
    hasAr,
    onTranslate,
    onAutoTranslate,
    isTranslating,
    title = 'Status Terjemahan',
    content,
    description,
    className,
    buttonText,
    disabled = false,
    compact = false,
}: TranslationStatusCardProps) {
    let headerTitle = 'Status Terjemahan';
    let isIdReady = hasId;
    let isEnReady = hasEn;
    let isArReady = hasAr;

    if (typeof title === 'string') {
        headerTitle = title;
    } else if (title && typeof title === 'object') {
        if (isIdReady === undefined) isIdReady = Boolean(title.id);
        if (isEnReady === undefined) isEnReady = Boolean(title.en);
        if (isArReady === undefined) isArReady = Boolean(title.ar);
    }

    if (content && typeof content === 'object') {
        if (isIdReady === undefined && content.id) isIdReady = true;
        if (!content.en) isEnReady = false;
        if (!content.ar) isArReady = false;
    }

    if (isIdReady === undefined) isIdReady = true;
    if (isEnReady === undefined) isEnReady = false;
    if (isArReady === undefined) isArReady = false;

    const isFullyTranslated = isEnReady && isArReady;
    const handleAction = onTranslate || onAutoTranslate || (() => {});

    return (
        <div
            className={cn(
                'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden transition-colors',
                className
            )}
        >
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50 py-3.5 px-5 flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Languages className="h-4 w-4 text-[#1A56DB] dark:text-sky-400" />
                    <span>{headerTitle}</span>
                </h3>
                {isFullyTranslated && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> 3 Bahasa Siap
                    </span>
                )}
            </div>

            {/* Content Body */}
            <div className={cn('p-5 space-y-4', compact && 'p-4 space-y-3')}>
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* List of Languages */}
                <div className="space-y-2">
                    {/* ID */}
                    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 text-xs">
                        <div className="flex items-center gap-2.5">
                            <span className="font-bold text-[11px] text-gray-500 dark:text-gray-400 w-5">ID</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">Bahasa Indonesia</span>
                        </div>
                        <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold px-2 py-0.5"
                        >
                            Sumber ✓
                        </Badge>
                    </div>

                    {/* EN */}
                    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 text-xs">
                        <div className="flex items-center gap-2.5">
                            <span className="font-bold text-[11px] text-gray-500 dark:text-gray-400 w-5">GB</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">English</span>
                        </div>
                        {isEnReady ? (
                            <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold px-2 py-0.5"
                            >
                                Tersedia ✓
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-semibold px-2 py-0.5"
                            >
                                Belum Ada
                            </Badge>
                        )}
                    </div>

                    {/* AR */}
                    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 text-xs">
                        <div className="flex items-center gap-2.5">
                            <span className="font-bold text-[11px] text-gray-500 dark:text-gray-400 w-5">SA</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">العربية</span>
                        </div>
                        {isArReady ? (
                            <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold px-2 py-0.5"
                            >
                                Tersedia ✓
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-semibold px-2 py-0.5"
                            >
                                Belum Ada
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Auto Translate Trigger Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAction}
                    disabled={isTranslating || disabled}
                    className="w-full h-10 text-xs font-semibold rounded-xl bg-white dark:bg-gray-950/70 border-blue-200 dark:border-sky-900/60 text-[#1A56DB] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-sky-300 transition-all shadow-xs gap-2"
                >
                    {isTranslating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#1A56DB] dark:text-sky-400" />
                            <span>Menerjemahkan Otomatis...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-[#1A56DB] dark:text-sky-400" />
                            <span>
                                {buttonText || (isFullyTranslated ? 'Perbarui Terjemahan (Auto)' : 'Terjemahkan Sekarang (Auto)')}
                            </span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export { TranslationStatusCard };
