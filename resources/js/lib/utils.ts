import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import DOMPurify from 'dompurify';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : (value || 0);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

import { format } from 'date-fns';
import { id as dateId } from 'date-fns/locale/id';

export function formatDate(dateString: string): string {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: dateId });
}
export const formatRupiah = formatCurrency;

export function getYouTubeEmbedUrl(url: string | null): string | null {
    if (!url) {
return null;
}

    const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:[?&].*)?$/,
    );

    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function getLocalizedValue(val: any, locale = 'id', fallback = ''): string {
    if (!val) return fallback;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                const parsed = JSON.parse(trimmed);
                return getLocalizedValue(parsed, locale, fallback);
            } catch (e) {
                return val;
            }
        }
        return val;
    }
    if (typeof val === 'object') {
        if (typeof val[locale] === 'string' && val[locale].trim() !== '') return val[locale];
        if (typeof val.id === 'string' && val.id.trim() !== '') return val.id;
        if (typeof val.en === 'string' && val.en.trim() !== '') return val.en;
        const first = Object.values(val).find(v => typeof v === 'string' && (v as string).trim() !== '');
        if (first) return first as string;
    }
    return String(val || fallback);
}

const ID_LOWERCASE_WORDS = new Set([
    'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan', 'dan', 'atau',
    'serta', 'yang', 'oleh', 'tentang', 'sebagai', 'atas', 'terhadap',
    'hingga', 'sampai', 'bagi', 'karena', 'agar', 'namun', 'tetapi',
    'melalui', 'secara', 'per', 'pun', 'si', 'sang'
]);

const EN_LOWERCASE_WORDS = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at',
    'to', 'from', 'by', 'with', 'in', 'of', 'as', 'into', 'onto'
]);

export function toTitleCase(text: string, locale: string = 'id'): string {
    if (!text || typeof text !== 'string') return text || '';
    if (locale === 'ar') return text;

    const stopWords = locale === 'en' ? EN_LOWERCASE_WORDS : ID_LOWERCASE_WORDS;
    const isAllUpper = text === text.toUpperCase() && text !== text.toLowerCase();

    const capitalizeToken = (token: string, isFirstWord: boolean, isLastWord: boolean): string => {
        if (!token) return token;

        if (token.includes('-')) {
            return token
                .split('-')
                .map((subToken, idx, arr) => capitalizeToken(subToken, isFirstWord && idx === 0, isLastWord && idx === arr.length - 1))
                .join('-');
        }

        const cleanWord = token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();

        if (!isAllUpper && token.length > 1 && token === token.toUpperCase() && /[A-Z]/.test(token)) {
            return token;
        }

        if (!isFirstWord && !isLastWord && stopWords.has(cleanWord)) {
            return token.replace(new RegExp(`\\b${cleanWord}\\b`, 'i'), cleanWord);
        }

        const firstLetterMatch = token.match(/[\p{L}]/u);
        if (!firstLetterMatch || firstLetterMatch.index === undefined) {
            return token;
        }

        const idx = firstLetterMatch.index;
        const prefix = token.slice(0, idx);
        const letter = token.charAt(idx).toUpperCase();
        const suffix = token.slice(idx + 1).toLowerCase();

        return `${prefix}${letter}${suffix}`;
    };

    const clauses = text.split(/([:–—])/);

    return clauses.map((clause) => {
        if (clause === ':' || clause === '–' || clause === '—') return clause;

        const words = clause.split(/(\s+)/);
        const wordTokens = words.filter(w => !/^\s*$/.test(w));
        let wordCount = 0;
        const totalWords = wordTokens.length;

        return words.map(part => {
            if (/^\s*$/.test(part)) return part;

            const isFirst = wordCount === 0;
            const isLast = wordCount === totalWords - 1;
            wordCount++;

            return capitalizeToken(part, isFirst, isLast);
        }).join('');
    }).join('');
}

export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return '';
    if (typeof window !== 'undefined' && typeof (DOMPurify as any)?.sanitize === 'function') {
        return (DOMPurify as any).sanitize(html);
    }
    return html;
}

export function terbilang(n: number | string): string {
    const rawNum = typeof n === 'string' ? parseFloat(n.replace(/[^\d.-]/g, '')) : n;
    const angka = Math.floor(Math.abs(rawNum || 0));
    if (angka === 0) return 'Nol Rupiah';

    const bilangan = [
        '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
        'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sekuluh', 'Sebelas'
    ];
    bilangan[10] = 'Sepuluh';

    function toWords(num: number): string {
        if (num < 12) {
            return bilangan[num];
        } else if (num < 20) {
            return toWords(num - 10) + ' Belas';
        } else if (num < 100) {
            return toWords(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + toWords(num % 10) : '');
        } else if (num < 200) {
            return 'Seratus' + (num % 100 !== 0 ? ' ' + toWords(num % 100) : '');
        } else if (num < 1000) {
            return toWords(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + toWords(num % 100) : '');
        } else if (num < 2000) {
            return 'Seribu' + (num % 1000 !== 0 ? ' ' + toWords(num % 1000) : '');
        } else if (num < 1000000) {
            return toWords(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + toWords(num % 1000) : '');
        } else if (num < 1000000000) {
            return toWords(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + toWords(num % 1000000) : '');
        } else if (num < 1000000000000) {
            return toWords(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 !== 0 ? ' ' + toWords(num % 1000000000) : '');
        } else {
            return toWords(Math.floor(num / 1000000000000)) + ' Triliun' + (num % 1000000000000 !== 0 ? ' ' + toWords(num % 1000000000000) : '');
        }
    }

    return `${toWords(angka).trim()} Rupiah`;
}
