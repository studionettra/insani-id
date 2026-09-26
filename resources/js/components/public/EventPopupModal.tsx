import React, { useEffect, useState, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import useTranslation from '@/hooks/use-translation';
import { getLocalizedValue } from '@/lib/utils';

export interface PopupData {
    id: number;
    title: any;
    display_type: 'image_only' | 'hybrid';
    image_url: string | null;
    content: any;
    cta_text: any;
    cta_url: string | null;
    open_in_new_tab: boolean;
    delay_seconds: number;
    auto_close_seconds: number;
    frequency: 'once_per_day' | 'once_per_session' | 'always';
    target_page: 'all' | 'home_only';
    updated_at: string;
    title_translations?: Record<string, string>;
    content_translations?: Record<string, string>;
    cta_text_translations?: Record<string, string>;
}

interface Props {
    popup?: PopupData | null;
}

export default function EventPopupModal({ popup }: Props) {
    const { url } = usePage();
    const { locale, isRtl, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [progress, setProgress] = useState(100);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!popup) return;

        // 1. Validasi Target Halaman
        if (popup.target_page === 'home_only') {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : url;
            const isHomePage = currentPath === '/' || currentPath === '';
            if (!isHomePage) {
                return;
            }
        }

        // 2. Validasi Frekuensi & Kunci Penyimpanan
        const storageKey = `insani_popup_dismissed_${popup.id}`;

        try {
            if (popup.frequency === 'once_per_day') {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const isWithin24Hours = Date.now() - (parsed.timestamp || 0) < 24 * 60 * 60 * 1000;
                    const isSameVersion = parsed.updated_at === popup.updated_at;

                    // Jika masih dalam 24 jam dan konten belum diperbarui admin, lewati
                    if (isWithin24Hours && isSameVersion) {
                        return;
                    }
                }
            } else if (popup.frequency === 'once_per_session') {
                const stored = sessionStorage.getItem(storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.updated_at === popup.updated_at) {
                        return;
                    }
                }
            }
        } catch (e) {
            // Ignore storage parsing errors
        }

        // 3. Eksekusi Delay Kemunculan
        const delayMs = Math.max(0, (popup.delay_seconds ?? 2) * 1000);
        timerRef.current = setTimeout(() => {
            setIsOpen(true);

            // 4. Auto-close timer jika disetel > 0
            if (popup.auto_close_seconds && popup.auto_close_seconds > 0) {
                const totalMs = popup.auto_close_seconds * 1000;
                const intervalStep = 100;
                let elapsed = 0;

                progressIntervalRef.current = setInterval(() => {
                    elapsed += intervalStep;
                    const remainingPercent = Math.max(0, 100 - (elapsed / totalMs) * 100);
                    setProgress(remainingPercent);
                }, intervalStep);

                autoCloseTimerRef.current = setTimeout(() => {
                    handleClose();
                }, totalMs);
            }
        }, delayMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [popup, url]);

    // Tutup saat tombol Escape ditekan
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleClose = () => {
        if (!popup) return;

        // Simpan status penutupan di storage
        const storageKey = `insani_popup_dismissed_${popup.id}`;
        const record = JSON.stringify({
            timestamp: Date.now(),
            updated_at: popup.updated_at,
        });

        try {
            if (popup.frequency === 'once_per_day') {
                localStorage.setItem(storageKey, record);
            } else if (popup.frequency === 'once_per_session') {
                sessionStorage.setItem(storageKey, record);
            }
        } catch (e) {
            // Storage quota or private mode fallback
        }

        if (timerRef.current) clearTimeout(timerRef.current);
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        setIsOpen(false);
    };

    if (!popup || !isOpen) {
        return null;
    }

    const title = getLocalizedValue(popup.title_translations || popup.title, locale);
    const content = getLocalizedValue(popup.content_translations || popup.content, locale);
    const ctaText = getLocalizedValue(popup.cta_text_translations || popup.cta_text, locale) || t('Pelajari Selengkapnya', 'Pelajari Selengkapnya');

    const isExternalUrl = (url: string | null) => {
        if (!url) return false;
        return url.startsWith('http://') || url.startsWith('https://');
    };

    return (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 animate-in fade-in-0"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {/* Backdrop dengan blur lembut */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
                onClick={handleClose}
            />

            {/* Kontainer Modal Pop-up */}
            <div 
                className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-300 animate-in zoom-in-95"
            >
                {/* Tombol Tutup Melayang di Pojok Atas */}
                <button
                    type="button"
                    onClick={handleClose}
                    className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-md active:scale-90 focus:outline-hidden cursor-pointer`}
                    aria-label="Tutup pesan pop-up"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Indikator Hitung Mundur Auto-Close (jika aktif) */}
                {popup.auto_close_seconds > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 z-20 overflow-hidden">
                        <div 
                            className="h-full bg-brand-500 transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {popup.display_type === 'image_only' ? (
                    /* -------------------------------------------------------------
                       MODE 1: POSTER UTUH (IMAGE-ONLY)
                       Seluruh modal difokuskan pada poster grafis resolusi penuh
                    ------------------------------------------------------------- */
                    <div className="relative group">
                        {popup.cta_url ? (
                            isExternalUrl(popup.cta_url) || popup.open_in_new_tab ? (
                                <a
                                    href={popup.cta_url}
                                    target={popup.open_in_new_tab ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    onClick={handleClose}
                                    className="block group cursor-pointer"
                                >
                                    {popup.image_url ? (
                                        <img
                                            src={popup.image_url}
                                            alt={title}
                                            className="w-full max-h-[80vh] object-contain bg-zinc-950 block transition-transform duration-300 group-hover:scale-[1.01]"
                                        />
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50">
                                            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                                        </div>
                                    )}

                                    {/* Action Banner Bawah */}
                                    <div className="py-3 px-5 bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 text-white flex items-center justify-between transition-colors group-hover:from-brand-800">
                                        <span className="text-xs sm:text-sm font-semibold truncate">
                                            {ctaText}
                                        </span>
                                        <span className="text-xs font-bold inline-flex items-center gap-1 shrink-0 ml-2">
                                            {t('Kunjungi', 'Kunjungi')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                                        </span>
                                    </div>
                                </a>
                            ) : (
                                <Link
                                    href={popup.cta_url}
                                    onClick={handleClose}
                                    className="block group cursor-pointer"
                                >
                                    {popup.image_url ? (
                                        <img
                                            src={popup.image_url}
                                            alt={title}
                                            className="w-full max-h-[80vh] object-contain bg-zinc-950 block transition-transform duration-300 group-hover:scale-[1.01]"
                                        />
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50">
                                            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                                        </div>
                                    )}

                                    {/* Action Banner Bawah */}
                                    <div className="py-3 px-5 bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 text-white flex items-center justify-between transition-colors group-hover:from-brand-800">
                                        <span className="text-xs sm:text-sm font-semibold truncate">
                                            {ctaText}
                                        </span>
                                        <span className="text-xs font-bold inline-flex items-center gap-1 shrink-0 ml-2">
                                            {t('Kunjungi', 'Kunjungi')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                                        </span>
                                    </div>
                                </Link>
                            )
                        ) : (
                            <div>
                                {popup.image_url ? (
                                    <img
                                        src={popup.image_url}
                                        alt={title}
                                        className="w-full max-h-[82vh] object-contain bg-zinc-950 block"
                                    />
                                ) : (
                                    <div className="p-8 text-center bg-gray-50">
                                        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* -------------------------------------------------------------
                       MODE 2: HYBRID (BANNER GAMBAR + TEKS RINGKAS + TOMBOL)
                    ------------------------------------------------------------- */
                    <div className="flex flex-col">
                        {popup.image_url && (
                            <div className="w-full max-h-60 overflow-hidden bg-gray-100 shrink-0">
                                <img
                                    src={popup.image_url}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="p-5 sm:p-6 space-y-3">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                                {title}
                            </h3>
                            {content && (
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-h-36 overflow-y-auto">
                                    {content}
                                </p>
                            )}

                            {popup.cta_url && (
                                <div className="pt-2">
                                    {isExternalUrl(popup.cta_url) || popup.open_in_new_tab ? (
                                        <a
                                            href={popup.cta_url}
                                            target={popup.open_in_new_tab ? '_blank' : '_self'}
                                            rel="noopener noreferrer"
                                            onClick={handleClose}
                                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                                        >
                                            <span>{ctaText}</span>
                                            <ExternalLink className="w-4 h-4 rtl:rotate-180" />
                                        </a>
                                    ) : (
                                        <Link
                                            href={popup.cta_url}
                                            onClick={handleClose}
                                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                                        >
                                            <span>{ctaText}</span>
                                            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                        </Link>
                                    )}
                                </div>
                            )}

                            <div className="text-center pt-1">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    {t('Nanti Saja', 'Nanti Saja')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
