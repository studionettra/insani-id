import React, { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import useTranslation from '@/hooks/use-translation';

const flags: Record<string, string> = {
    id: 'https://cdn.gtranslate.net/flags/svg/id.svg',
    en: 'https://cdn.gtranslate.net/flags/svg/en.svg',
    ar: 'https://cdn.gtranslate.net/flags/svg/ar.svg',
};

interface LocaleItem {
    name: string;
    url: string;
}

interface SharedPageProps {
    supportedLocales?: Record<string, LocaleItem>;
    [key: string]: unknown;
}

export default function LanguageSwitcher() {
    const { supportedLocales } = usePage<SharedPageProps>().props;
    const { t, locale: currentLang } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (targetUrl: string) => {
        setIsOpen(false);
        if (targetUrl) {
            router.visit(targetUrl, {
                preserveScroll: true,
            });
        }
    };

    const currentFlag = flags[currentLang] || flags.id;

    const availableLocales: Record<string, LocaleItem> = supportedLocales && Object.keys(supportedLocales).length > 0
        ? supportedLocales
        : {
            id: { name: 'Bahasa Indonesia', url: '/id' },
            en: { name: 'English', url: '/en' },
            ar: { name: 'العربية', url: '/ar' },
        };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Custom Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none active:scale-95"
                title={t('Ganti Bahasa')}
                type="button"
                aria-label={t('Ganti Bahasa')}
            >
                <img 
                    src={currentFlag} 
                    alt={currentLang} 
                    className="w-[22px] h-[22px] rounded-sm object-cover shadow-sm border border-zinc-200"
                />
            </button>

            {/* Custom Dropdown */}
            {isOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 end-0 mt-2 py-2 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200/80 z-50 flex flex-col gap-1 origin-top-right transition-all">
                    {Object.entries(availableLocales).map(([code, item]) => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => changeLanguage(item.url)}
                            className={`flex items-center gap-3 px-3 py-2 text-sm text-left w-full hover:bg-brand-50 transition-colors ${currentLang === code ? 'font-semibold text-brand-600 bg-brand-50/50' : 'text-zinc-700'}`}
                        >
                            <img 
                                src={flags[code] || flags.id} 
                                alt={code} 
                                className="w-5 h-5 rounded-sm object-cover shadow-sm border border-zinc-200"
                            />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
