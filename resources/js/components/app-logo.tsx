import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { siteSettings } = usePage<{ siteSettings?: Record<string, string> }>().props;
    const logoSrc = siteSettings?.site_logo 
        ? `/storage/${siteSettings.site_logo}` 
        : '/images/logo/logo-portrait-color.png';
    const siteName = siteSettings?.site_name || 'Dashboard Insani';

    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-transparent">
                <img src={logoSrc} alt={siteName} className="w-full h-full object-contain" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-sidebar-foreground">
                    {siteName}
                </span>
            </div>
        </>
    );
}
