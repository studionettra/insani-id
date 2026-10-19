import { usePage } from '@inertiajs/react';

/**
 * Returns the Cloudflare Turnstile site key.
 * 
 * Strict Single Source of Truth:
 * When loaded within an Inertia page, the server's runtime `turnstileSiteKey`
 * prop is authoritative (even if null or empty string).
 * 
 * It will NEVER fall back to compile-time Vite environment variables when
 * running within Inertia, preventing accidental key mismatch between server secrets
 * and stale build assets from CI/CD.
 */
export function useTurnstileSiteKey(): string {
    const props = usePage().props as { turnstileSiteKey?: string | null };

    // If turnstileSiteKey prop is provided by Laravel Inertia runtime (even if null or empty),
    // strictly respect the server's runtime environment configuration.
    if (props && 'turnstileSiteKey' in props && props.turnstileSiteKey !== undefined) {
        return (props.turnstileSiteKey || '').trim();
    }

    // Fallback to compile-time Vite environment variable only if outside of Inertia context
    return (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
}
