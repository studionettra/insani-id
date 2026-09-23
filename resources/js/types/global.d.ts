import type { Auth } from '@/types/auth';
import type { NotificationPayload } from '@/types/notification';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            notifications?: NotificationPayload | null;
            sidebarOpen: boolean;
            locale?: string;
            translations?: Record<string, string>;
            [key: string]: unknown;
        };
    }
}
