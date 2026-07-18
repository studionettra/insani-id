import React from 'react';
import { Head, usePage } from '@inertiajs/react';

export default function SeoHead({ 
    title, 
    description = 'Insani Indonesia - Lembaga filantropi terpercaya untuk berbagi dan memberdayakan sesama.', 
    image = '/images/logo/logo-landscape-color.png',
}) {
    const { supportedLocales, locale } = usePage().props;
    const fullTitle = title ? `${title} - Insani Indonesia` : 'Insani Indonesia';
    
    // Get current URL from supportedLocales if available, else fallback
    const currentUrl = supportedLocales && supportedLocales[locale] ? supportedLocales[locale].url : (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            
            {/* Canonical and hreflang */}
            {currentUrl && <link rel="canonical" href={currentUrl} />}
            {supportedLocales && Object.entries(supportedLocales).map(([code, data]) => (
                <link key={code} rel="alternate" hrefLang={code} href={data.url} />
            ))}
            {supportedLocales && supportedLocales['id'] && (
                <link rel="alternate" hrefLang="x-default" href={supportedLocales['id'].url} />
            )}
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Head>
    );
}
