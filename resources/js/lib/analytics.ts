/**
 * Analytics and Conversion Tracking Helper
 * Supports Google Tag Manager (dataLayer), Google Analytics 4 (gtag),
 * Meta Pixel (fbq), TikTok Pixel (ttq), and First-Party Internal Analytics Hub.
 */

export interface InitiateDonationParams {
    programId?: number;
    programTitle: string;
    category?: string;
    amount: number;
    paymentChannel?: string;
    paymentMethod?: string;
}

export interface DonationSuccessParams {
    donationCode: string;
    programTitle: string;
    amount: number;
    paymentChannel?: string;
    paymentMethod?: string;
}

export interface ShareProgramParams {
    programTitle: string;
    shareChannel: string;
    url?: string;
}

/**
 * Generate or retrieve visitor session ID for internal tracking
 */
export function getVisitorSessionId(): string {
    if (typeof window === 'undefined') {
        return '';
    }
    try {
        let sid = sessionStorage.getItem('insani_visitor_sid');
        if (!sid) {
            sid = 'sid_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            sessionStorage.setItem('insani_visitor_sid', sid);
        }
        return sid;
    } catch {
        return '';
    }
}

/**
 * Send event or pageview to internal first-party collector via sendBeacon or keepalive fetch
 */
function sendInternalAnalytics(payload: Record<string, unknown>): void {
    if (typeof window === 'undefined') {
        return;
    }

    const path = window.location.pathname;
    // Skip tracking for internal admin and settings routes
    if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/settings')) {
        return;
    }

    const data = {
        session_id: getVisitorSessionId(),
        ...payload,
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/analytics/collect', blob);
    } else {
        fetch('/analytics/collect', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
        }).catch(() => {});
    }
}

let heartbeatInitialized = false;

/**
 * Initialize active session heartbeat for live visitors and duration tracking
 */
export function initAnalyticsHeartbeat(): void {
    if (typeof window === 'undefined' || heartbeatInitialized) {
        return;
    }
    heartbeatInitialized = true;

    setInterval(() => {
        if (document.visibilityState !== 'visible') {
            return;
        }

        const path = window.location.pathname;
        if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/settings')) {
            return;
        }

        const sid = getVisitorSessionId();
        if (!sid) {
            return;
        }

        const data = {
            session_id: sid,
            url: window.location.href,
            increment: 15,
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon('/analytics/heartbeat', blob);
        } else {
            fetch('/analytics/heartbeat', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
            }).catch(() => {});
        }
    }, 15000);
}

/**
 * Track virtual pageviews across SPA route changes in Inertia
 */
export function trackPageView(url: string, title?: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    const pageTitle = title || document.title;
    const pageLocation = window.location.href;

    // 1. Google Tag Manager dataLayer
    if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
            event: 'page_view',
            page_path: url,
            page_title: pageTitle,
            page_location: pageLocation,
        });
    }

    // 2. Direct Google Analytics 4 (gtag.js)
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_path: url,
            page_title: pageTitle,
            page_location: pageLocation,
        });
    }

    // 3. Meta Pixel (Facebook/Instagram)
    if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
    }

    // 4. TikTok Pixel
    if (window.ttq && typeof window.ttq.page === 'function') {
        window.ttq.page();
    }

    // 5. Internal First-Party Analytics
    sendInternalAnalytics({
        type: 'page_view',
        url: pageLocation,
        title: pageTitle,
        referrer: document.referrer,
    });

    initAnalyticsHeartbeat();
}

/**
 * Track when a user views a specific program detail (ViewContent)
 */
export function trackViewContent(programTitle: string, programId?: number, category?: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Meta Pixel
    if (typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
            content_name: programTitle,
            content_ids: programId ? [String(programId)] : undefined,
            content_category: category,
            content_type: 'product',
        });
    }

    // GA4
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'view_item', {
            items: [
                {
                    item_id: programId ? String(programId) : undefined,
                    item_name: programTitle,
                    item_category: category,
                },
            ],
        });
    }

    // Internal First-Party Analytics
    sendInternalAnalytics({
        type: 'event',
        event_name: 'ViewContent',
        url: window.location.href,
        meta_status: typeof window.fbq === 'function' ? 'sent' : 'dispatched',
        ga4_status: typeof window.gtag === 'function' ? 'sent' : 'dispatched',
        payload: {
            program_title: programTitle,
            program_id: programId,
            category,
        },
    });
}

/**
 * Track when a user initiates the checkout/donation process
 */
export function trackInitiateDonation(params: InitiateDonationParams): void {
    if (typeof window === 'undefined') {
        return;
    }

    // 1. GTM dataLayer
    if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
            event: 'begin_checkout',
            ecommerce: {
                currency: 'IDR',
                value: params.amount,
                items: [
                    {
                        item_id: params.programId ? String(params.programId) : undefined,
                        item_name: params.programTitle,
                        item_category: params.category,
                        price: params.amount,
                        quantity: 1,
                    },
                ],
            },
            payment_channel: params.paymentChannel,
            payment_method: params.paymentMethod,
        });
    }

    // 2. Direct GA4
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'begin_checkout', {
            currency: 'IDR',
            value: params.amount,
            items: [
                {
                    item_id: params.programId ? String(params.programId) : undefined,
                    item_name: params.programTitle,
                    item_category: params.category,
                    price: params.amount,
                    quantity: 1,
                },
            ],
            payment_channel: params.paymentChannel,
        });
    }

    // 3. Meta Pixel
    if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
            content_name: params.programTitle,
            content_category: params.category,
            value: params.amount,
            currency: 'IDR',
            num_items: 1,
        });
    }

    // 4. TikTok Pixel
    if (window.ttq && typeof window.ttq.track === 'function') {
        window.ttq.track('InitiateCheckout', {
            content_name: params.programTitle,
            content_category: params.category,
            value: params.amount,
            currency: 'IDR',
        });
    }

    // 5. Internal First-Party Analytics
    sendInternalAnalytics({
        type: 'event',
        event_name: 'InitiateCheckout',
        url: window.location.href,
        meta_status: typeof window.fbq === 'function' ? 'sent' : 'dispatched',
        ga4_status: typeof window.gtag === 'function' ? 'sent' : 'dispatched',
        payload: {
            amount: params.amount,
            program_title: params.programTitle,
            program_id: params.programId,
            category: params.category,
            payment_channel: params.paymentChannel,
            payment_method: params.paymentMethod,
        },
    });
}

/**
 * Track when a donation is successfully paid / completed
 */
export function trackDonationSuccess(params: DonationSuccessParams): void {
    if (typeof window === 'undefined') {
        return;
    }

    // 1. GTM dataLayer
    if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
            event: 'purchase',
            ecommerce: {
                transaction_id: params.donationCode,
                currency: 'IDR',
                value: params.amount,
                items: [
                    {
                        item_id: params.donationCode,
                        item_name: params.programTitle,
                        price: params.amount,
                        quantity: 1,
                    },
                ],
            },
            payment_channel: params.paymentChannel,
            payment_method: params.paymentMethod,
        });
    }

    // 2. Direct GA4
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'purchase', {
            transaction_id: params.donationCode,
            currency: 'IDR',
            value: params.amount,
            items: [
                {
                    item_id: params.donationCode,
                    item_name: params.programTitle,
                    price: params.amount,
                    quantity: 1,
                },
            ],
        });
    }

    // 3. Meta Pixel (Standard Purchase event + Custom Donate event)
    if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', {
            content_name: params.programTitle,
            value: params.amount,
            currency: 'IDR',
            content_type: 'product',
        });
        window.fbq('trackCustom', 'Donate', {
            donation_code: params.donationCode,
            program_title: params.programTitle,
            value: params.amount,
            currency: 'IDR',
            payment_channel: params.paymentChannel,
        });
    }

    // 4. TikTok Pixel
    if (window.ttq && typeof window.ttq.track === 'function') {
        window.ttq.track('CompletePayment', {
            content_name: params.programTitle,
            value: params.amount,
            currency: 'IDR',
        });
    }

    // 5. Internal First-Party Analytics
    sendInternalAnalytics({
        type: 'event',
        event_name: 'Purchase',
        url: window.location.href,
        meta_status: typeof window.fbq === 'function' ? 'sent' : 'dispatched',
        ga4_status: typeof window.gtag === 'function' ? 'sent' : 'dispatched',
        payload: {
            donation_code: params.donationCode,
            amount: params.amount,
            program_title: params.programTitle,
            payment_channel: params.paymentChannel,
            payment_method: params.paymentMethod,
        },
    });
}

/**
 * Track social sharing of programs
 */
export function trackShareProgram(params: ShareProgramParams): void {
    if (typeof window === 'undefined') {
        return;
    }

    // 1. GTM dataLayer
    if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
            event: 'share',
            method: params.shareChannel,
            content_type: 'program',
            item_id: params.programTitle,
        });
    }

    // 2. Direct GA4
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'share', {
            method: params.shareChannel,
            content_type: 'program',
            item_id: params.programTitle,
        });
    }

    // 3. Internal First-Party Analytics
    sendInternalAnalytics({
        type: 'event',
        event_name: 'Share',
        url: window.location.href,
        meta_status: 'dispatched',
        ga4_status: 'dispatched',
        payload: {
            share_channel: params.shareChannel,
            program_title: params.programTitle,
            url: params.url,
        },
    });
}
