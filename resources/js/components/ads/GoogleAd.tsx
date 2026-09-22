import { usePage } from '@inertiajs/react';
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle?: any[];
    }
}

interface GoogleAdProps {
    slot?: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    responsive?: boolean;
    layoutKey?: string;
    className?: string;
    style?: React.CSSProperties;
    showLabel?: boolean;
}

export default function GoogleAd({
    slot,
    format = 'auto',
    responsive = true,
    layoutKey,
    className = '',
    style = {},
    showLabel = true,
}: GoogleAdProps) {
    const { siteSettings } = usePage().props as any;
    const adRef = useRef<HTMLModElement | null>(null);
    const isPushed = useRef(false);

    const isEnabled = siteSettings?.adsense_enabled === '1';
    const clientId = siteSettings?.google_adsense_client_id;

    // Load Google AdSense library dynamically only if enabled and ad slot exists
    useEffect(() => {
        if (!isEnabled || !clientId || !slot) {
            return;
        }

        const scriptId = 'google-adsense-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }

        // Push ad to adsbygoogle queue once per mount
        if (!isPushed.current && adRef.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                isPushed.current = true;
            } catch (err) {
                // Ignore duplicate pushes or ad blocker blocks
                if (process.env.NODE_ENV === 'development') {
                    console.debug('AdSense push error (usually harmless or blocked):', err);
                }
            }
        }
    }, [isEnabled, clientId, slot]);

    // Do not render anything if AdSense is disabled or misconfigured
    if (!isEnabled || !clientId || !slot) {
        return null;
    }

    return (
        <div className={`google-ad-container my-6 overflow-hidden clear-both ${className}`}>
            {showLabel && (
                <div className="text-[10px] uppercase font-medium tracking-widest text-slate-400 dark:text-slate-500 text-center mb-1.5 select-none">
                    Iklan
                </div>
            )}
            <div className="w-full flex justify-center items-center bg-slate-50/50 dark:bg-slate-900/20 rounded-xl overflow-hidden min-h-[90px]">
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{ display: 'block', minWidth: '250px', ...style }}
                    data-ad-client={clientId}
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive={responsive ? 'true' : 'false'}
                    {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
                />
            </div>
        </div>
    );
}
