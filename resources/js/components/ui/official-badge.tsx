import React, { useState } from 'react';

export type OfficialInstitutionCode = 
    | 'kemenkumham'
    | 'kemensos'
    | 'pemprov-dki'
    | 'djp'
    | 'kemenkeu'
    | 'notaris'
    | 'baznas'
    | string;

interface OfficialBadgeProps {
    institution: OfficialInstitutionCode;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'hero';
    variant?: 'default' | 'monochrome' | 'pill';
    showLabel?: boolean;
    className?: string;
    containerClassName?: string;
}

const INSTITUTION_CONFIG: Record<string, {
    name: string;
    shortLabel: string;
    src: string;
    aspect: 'square' | 'wide';
}> = {
    kemenkumham: {
        name: 'Kementerian Hukum & HAM RI',
        shortLabel: 'Kemenkumham RI',
        src: '/images/legal/kemenkumham.svg',
        aspect: 'square',
    },
    kemensos: {
        name: 'Kementerian Sosial Republik Indonesia',
        shortLabel: 'Kemensos RI',
        src: '/images/legal/kemensos.svg',
        aspect: 'wide',
    },
    'pemprov-dki': {
        name: 'Pemerintah Provinsi DKI Jakarta',
        shortLabel: 'Pemprov DKI',
        src: '/images/legal/pemprov-dki.svg',
        aspect: 'square',
    },
    djp: {
        name: 'Direktorat Jenderal Pajak',
        shortLabel: 'DJP Pajak',
        src: '/images/legal/djp-pajak.svg',
        aspect: 'square',
    },
    kemenkeu: {
        name: 'Kementerian Keuangan Republik Indonesia',
        shortLabel: 'Kemenkeu RI',
        src: '/images/legal/kemenkeu.svg',
        aspect: 'square',
    },
    notaris: {
        name: 'Akta Otentik Notaris RI',
        shortLabel: 'Notaris RI',
        src: '/images/legal/garuda-notaris.svg',
        aspect: 'square',
    },
    baznas: {
        name: 'Badan Amil Zakat Nasional',
        shortLabel: 'BAZNAS',
        src: '/images/legal/baznas.svg',
        aspect: 'square',
    },
};

export default function OfficialBadge({
    institution,
    alt,
    size = 'md',
    variant = 'default',
    showLabel = false,
    className = '',
    containerClassName = '',
}: OfficialBadgeProps) {
    const [hasError, setHasError] = useState(false);
    const normalizedKey = (institution || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

    let resolvedKey = normalizedKey;
    if (normalizedKey.includes('kumham')) resolvedKey = 'kemenkumham';
    else if (normalizedKey.includes('sos')) resolvedKey = 'kemensos';
    else if (normalizedKey.includes('dki') || normalizedKey.includes('jakarta')) resolvedKey = 'pemprov-dki';
    else if (normalizedKey.includes('pajak') || normalizedKey.includes('djp')) resolvedKey = 'djp';
    else if (normalizedKey.includes('notaris')) resolvedKey = 'notaris';
    else if (normalizedKey.includes('baznas')) resolvedKey = 'baznas';

    const config = INSTITUTION_CONFIG[resolvedKey] || {
        name: institution,
        shortLabel: institution,
        src: '/images/legal/garuda-notaris.svg',
        aspect: 'square',
    };

    const sizeStyles = {
        sm: {
            container: 'h-8 px-2 py-1 gap-1.5',
            image: 'max-h-5 max-w-[28px]',
            text: 'text-[11px]',
        },
        md: {
            container: 'h-10 sm:h-11 px-2.5 sm:px-3 py-1.5 gap-2',
            image: 'max-h-7 sm:max-h-8 max-w-[40px]',
            text: 'text-xs',
        },
        lg: {
            container: 'h-14 sm:h-16 px-3.5 sm:px-4 py-2 gap-3',
            image: 'max-h-10 sm:max-h-11 max-w-[56px]',
            text: 'text-sm font-semibold',
        },
        hero: {
            container: 'h-20 sm:h-24 px-5 py-3 gap-3.5',
            image: 'max-h-16 sm:max-h-18 max-w-[80px]',
            text: 'text-base font-bold',
        }
    }[size];

    const imageElement = (
        <img
            src={config.src}
            alt={alt || config.name}
            className={`w-auto object-contain transition-all duration-300 ${sizeStyles.image} ${
                variant === 'monochrome' ? 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105' : ''
            } ${className}`}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );

    if (hasError) {
        return (
            <div className={`inline-flex items-center text-slate-500 font-medium ${sizeStyles.text} ${containerClassName}`}>
                <span>{config.shortLabel}</span>
            </div>
        );
    }

    if (variant === 'pill') {
        return (
            <div 
                className={`inline-flex items-center bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-full shadow-2xs select-none ${sizeStyles.container} ${containerClassName}`}
                title={config.name}
            >
                {imageElement}
                {showLabel && (
                    <span className={`text-slate-800 font-medium ${sizeStyles.text}`}>
                        {config.shortLabel}
                    </span>
                )}
            </div>
        );
    }

    if (showLabel) {
        return (
            <div 
                className={`inline-flex items-center select-none ${sizeStyles.container} ${containerClassName}`}
                title={config.name}
            >
                {imageElement}
                <span className={`text-slate-700 font-medium ${sizeStyles.text}`}>
                    {config.shortLabel}
                </span>
            </div>
        );
    }

    return imageElement;
}
