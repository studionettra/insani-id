import React from 'react';
import { Head, usePage } from '@inertiajs/react';

interface SupportedLocaleData {
    name: string;
    url: string;
}

interface SeoHeadProps {
    title?: string;
    description?: string;
    image?: string;
}

interface SharedPageProps {
    supportedLocales?: Record<string, SupportedLocaleData>;
    locale?: string;
    siteSettings?: {
        site_name?: string;
        site_logo?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export default function SeoHead({
    title,
    description = 'Insani Indonesia - Lembaga filantropi terpercaya untuk berbagi dan memberdayakan sesama.',
    image,
}: SeoHeadProps) {
    const { supportedLocales, locale = 'id', siteSettings } = usePage<SharedPageProps>().props;
    const resolvedImage = image || (siteSettings?.site_logo ? `/storage/${siteSettings.site_logo}` : '/images/logo/logo-landscape-color.png');
    const siteName = (siteSettings?.site_name as string) || 'Insani Indonesia';
    const fullTitle = title ? `${title} - ${siteName}` : siteName;

    // Get current URL from supportedLocales if available, else fallback
    const currentUrl = supportedLocales && locale && supportedLocales[locale] ? supportedLocales[locale].url : (typeof window !== 'undefined' ? window.location.href : '');

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
            <meta property="og:image" content={resolvedImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={resolvedImage} />
        </Head>
    );
}
