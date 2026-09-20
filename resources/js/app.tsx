import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import TailAdminLayout from '@/layouts/TailAdmin/AppLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('Public/Akun/') || name.startsWith('Public/CampaignerRegistration/'):
                return TailAdminLayout;
            case name === 'welcome' || name.startsWith('Public/'):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name === 'dashboard' || name.startsWith('Admin/') || name.startsWith('Akun/'):
                return TailAdminLayout;
            case name.startsWith('settings/'):
                return [TailAdminLayout, SettingsLayout];
            default:
                return TailAdminLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Prevent Back-Forward Cache (bfcache) from displaying stale authenticated pages after logout
if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            window.location.reload();
        }
    });

    router.on('navigate', () => {
        if (sessionStorage.getItem('logged_out') === 'true') {
            sessionStorage.removeItem('logged_out');
            window.location.replace('/login');
        }
    });
}
