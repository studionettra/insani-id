import { usePage } from '@inertiajs/react';

interface SharedProps {
    locale?: string;
    translations?: Record<string, string>;
    [key: string]: unknown;
}

export function useTranslation() {
    const { props } = usePage<SharedProps>();
    const locale = (props.locale as string) || 'id';
    const translations = (props.translations as Record<string, string>) || {};
    const isRtl = locale === 'ar';

    /**
     * Translate a given key with optional fallback and parameter replacements.
     * Example:
     * t('Beranda') -> "Home" (if locale is en)
     * t('nav.home', 'Beranda') -> "Home"
     * t('Halo :name', { name: 'Budi' }) -> "Halo Budi"
     */
    const t = (
        key: string,
        fallbackOrParams?: string | Record<string, string | number>,
        params?: Record<string, string | number>
    ): string => {
        let fallback = key;
        let replaceParams: Record<string, string | number> = {};

        if (typeof fallbackOrParams === 'string') {
            fallback = fallbackOrParams;
            if (params && typeof params === 'object') {
                replaceParams = params;
            }
        } else if (fallbackOrParams && typeof fallbackOrParams === 'object') {
            replaceParams = fallbackOrParams;
        }

        let translation = translations[key] || fallback;

        if (replaceParams && Object.keys(replaceParams).length > 0) {
            Object.entries(replaceParams).forEach(([pKey, pVal]) => {
                translation = translation
                    .replace(new RegExp(`:${pKey}`, 'g'), String(pVal))
                    .replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
            });
        }

        return translation;
    };

    return { t, locale, isRtl };
}

export default useTranslation;
