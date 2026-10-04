import React, { useState } from 'react';

export type PaymentBrandCode = 
    | 'bsi' 
    | 'bri' 
    | 'mandiri' 
    | 'bca' 
    | 'bni' 
    | 'permata' 
    | 'cimb' 
    | 'danamon' 
    | 'qris' 
    | 'gopay' 
    | 'shopeepay' 
    | 'ovo' 
    | 'dana' 
    | 'bi'
    | string;

interface BankLogoProps {
    code: PaymentBrandCode;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto';
    className?: string;
    containerClassName?: string;
    showContainer?: boolean;
}

const BRAND_CONFIG: Record<string, { name: string; src: string; fallbackText: string; bgTone: string }> = {
    // Banks
    bsi: { name: 'Bank Syariah Indonesia', src: '/images/banks/bsi.svg', fallbackText: 'BSI', bgTone: 'border-teal-200' },
    bri: { name: 'Bank Rakyat Indonesia', src: '/images/banks/bri.svg', fallbackText: 'BRI', bgTone: 'border-blue-200' },
    mandiri: { name: 'Bank Mandiri', src: '/images/banks/mandiri.svg', fallbackText: 'MDR', bgTone: 'border-indigo-200' },
    bca: { name: 'Bank Central Asia', src: '/images/banks/bca.svg', fallbackText: 'BCA', bgTone: 'border-sky-200' },
    bni: { name: 'Bank Negara Indonesia', src: '/images/banks/bni.svg', fallbackText: 'BNI', bgTone: 'border-orange-200' },
    permata: { name: 'PermataBank', src: '/images/banks/permata.svg', fallbackText: 'PRM', bgTone: 'border-emerald-200' },
    cimb: { name: 'CIMB Niaga', src: '/images/banks/cimb.svg', fallbackText: 'CIMB', bgTone: 'border-red-200' },
    danamon: { name: 'Bank Danamon', src: '/images/banks/danamon.svg', fallbackText: 'DNM', bgTone: 'border-amber-200' },

    // Payments & E-Wallets
    qris: { name: 'QRIS', src: '/images/payments/qris.svg', fallbackText: 'QRIS', bgTone: 'border-rose-200' },
    gopay: { name: 'GoPay', src: '/images/payments/gopay.svg', fallbackText: 'GoPay', bgTone: 'border-emerald-200' },
    shopeepay: { name: 'ShopeePay', src: '/images/payments/shopeepay.svg', fallbackText: 'Shopee', bgTone: 'border-orange-200' },
    ovo: { name: 'OVO', src: '/images/payments/ovo.svg', fallbackText: 'OVO', bgTone: 'border-purple-200' },
    dana: { name: 'DANA', src: '/images/payments/dana.svg', fallbackText: 'DANA', bgTone: 'border-sky-200' },
    bi: { name: 'Bank Indonesia', src: '/images/payments/bi.svg', fallbackText: 'BI', bgTone: 'border-blue-200' },
};

export default function BankLogo({
    code,
    alt,
    size = 'md',
    className = '',
    containerClassName = '',
    showContainer = true,
}: BankLogoProps) {
    const [hasError, setHasError] = useState(false);
    const normalizedKey = (code || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Map common aliases (e.g. 'manual_bsi' -> 'bsi', 'midtrans_bsi' -> 'bsi', 'shopee' -> 'shopeepay')
    let resolvedKey = normalizedKey;
    if (normalizedKey.includes('bsi')) resolvedKey = 'bsi';
    else if (normalizedKey.includes('bri')) resolvedKey = 'bri';
    else if (normalizedKey.includes('mandiri')) resolvedKey = 'mandiri';
    else if (normalizedKey.includes('bca')) resolvedKey = 'bca';
    else if (normalizedKey.includes('bni')) resolvedKey = 'bni';
    else if (normalizedKey.includes('permata')) resolvedKey = 'permata';
    else if (normalizedKey.includes('cimb')) resolvedKey = 'cimb';
    else if (normalizedKey.includes('danamon')) resolvedKey = 'danamon';
    else if (normalizedKey.includes('qris')) resolvedKey = 'qris';
    else if (normalizedKey.includes('gopay') || normalizedKey.includes('gojek')) resolvedKey = 'gopay';
    else if (normalizedKey.includes('shopee')) resolvedKey = 'shopeepay';
    else if (normalizedKey.includes('ovo')) resolvedKey = 'ovo';
    else if (normalizedKey.includes('dana')) resolvedKey = 'dana';

    const config = BRAND_CONFIG[resolvedKey];

    // Dimension profiles for clean optic proportions
    const sizeConfig = {
        xs: {
            container: 'w-10 h-6 p-0.5 rounded-md',
            image: 'max-h-3.5 max-w-[34px]',
            text: 'text-[9px]',
        },
        sm: {
            container: 'w-12 h-8 sm:w-13 sm:h-8.5 p-1 rounded-lg',
            image: 'max-h-4.5 sm:max-h-5 max-w-[40px] sm:max-w-[44px]',
            text: 'text-[10px]',
        },
        md: {
            container: 'w-14 h-9 sm:w-15 sm:h-9.5 p-1 rounded-xl',
            image: 'max-h-5 sm:max-h-5.5 max-w-[48px] sm:max-w-[52px]',
            text: 'text-xs',
        },
        lg: {
            container: 'w-24 h-12 sm:w-28 sm:h-14 p-2 rounded-2xl',
            image: 'max-h-8 sm:max-h-9 max-w-[85px] sm:max-w-[100px]',
            text: 'text-sm',
        },
        auto: {
            container: 'p-1 rounded-lg',
            image: 'max-h-full max-w-full',
            text: 'text-xs',
        }
    }[size];

    if (!config || hasError) {
        const fallbackText = config?.fallbackText || (code ? code.slice(0, 4).toUpperCase() : 'BANK');
        if (!showContainer) {
            return <span className={`font-mono font-bold text-slate-700 ${sizeConfig.text} ${className}`}>{fallbackText}</span>;
        }
        return (
            <div 
                className={`inline-flex items-center justify-center font-bold text-slate-700 bg-slate-100 border border-slate-200 shrink-0 select-none ${sizeConfig.container} ${sizeConfig.text} ${containerClassName}`}
                title={alt || code}
            >
                {fallbackText}
            </div>
        );
    }

    const imageElement = (
        <img
            src={config.src}
            alt={alt || config.name}
            className={`w-auto object-contain transition-transform duration-200 ${sizeConfig.image} ${className}`}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );

    if (!showContainer) {
        return imageElement;
    }

    return (
        <div
            className={`inline-flex items-center justify-center bg-white border border-slate-200/90 shadow-2xs shrink-0 select-none overflow-hidden ${sizeConfig.container} ${containerClassName}`}
            title={alt || config.name}
        >
            {imageElement}
        </div>
    );
}
