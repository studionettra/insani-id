import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
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

export function getLocalizedValue(val: any, fallback = ''): string {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (typeof val.id === 'string' && val.id.trim() !== '') return val.id;
        if (typeof val.en === 'string' && val.en.trim() !== '') return val.en;
        const first = Object.values(val).find(v => typeof v === 'string' && (v as string).trim() !== '');
        if (first) return first as string;
    }
    return String(val || fallback);
}


