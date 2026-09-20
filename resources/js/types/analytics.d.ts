export {};

declare global {
    interface Window {
        dataLayer?: Array<Record<string, any>>;
        gtag?: (...args: any[]) => void;
        fbq?: (...args: any[]) => void;
        ttq?: {
            page: () => void;
            track: (event: string, params?: Record<string, any>) => void;
            [key: string]: any;
        };
    }
}
