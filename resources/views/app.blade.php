<!DOCTYPE html>
@php
    $isAdminOrDashboard = request()->is('dashboard*', 'admin*', 'akun*', 'settings*');
    $gtmId = !$isAdminOrDashboard ? \App\Models\AppSetting::get('google_tag_manager_id') : null;
    $gaId = (!$isAdminOrDashboard && empty($gtmId)) ? \App\Models\AppSetting::get('google_analytics_id') : null;
    $metaPixelId = (!$isAdminOrDashboard && empty($gtmId)) ? \App\Models\AppSetting::get('meta_pixel_id') : null;
    $tiktokPixelId = (!$isAdminOrDashboard && empty($gtmId)) ? \App\Models\AppSetting::get('tiktok_pixel_id') : null;
@endphp
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() == 'ar' ? 'rtl' : 'ltr' }}"
    @class(['dark' => $isAdminOrDashboard && ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    @if ($gtmId)
        {{-- Google Tag Manager --}}
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ $gtmId }}');</script>
        {{-- End Google Tag Manager --}}
    @endif

    @if ($gaId)
        {{-- Google Analytics (gtag.js) --}}
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $gaId }}', { send_page_view: false });
        </script>
        {{-- End Google Analytics --}}
    @endif

    @if ($metaPixelId)
        {{-- Meta Pixel Code --}}
        <script>
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '{{ $metaPixelId }}');
        </script>
        <noscript><img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id={{ $metaPixelId }}&ev=PageView&noscript=1"
        /></noscript>
        {{-- End Meta Pixel Code --}}
    @endif

    @if ($tiktokPixelId)
        {{-- TikTok Pixel Code --}}
        <script>
            !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('{{ $tiktokPixelId }}');
            }(window, document, 'ttq');
        </script>
        {{-- End TikTok Pixel Code --}}
    @endif

    {{-- Inline script to detect system dark mode preference for admin/dashboard only --}}
    <script>
        (function() {
            const isAdmin = {{ $isAdminOrDashboard ? 'true' : 'false' }};
            if (!isAdmin) {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
                return;
            }

            const appearance = localStorage.getItem('appearance') || '{{ $appearance ?? 'system' }}';
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (appearance === 'dark' || (appearance === 'system' && prefersDark)) {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <link rel="icon" href="/favicon-insani.svg" type="image/svg+xml">

    @fonts

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @include('partials.opengraph')
    <x-inertia::head />
</head>

<body class="font-sans antialiased">
    @if ($gtmId)
        {{-- Google Tag Manager (noscript) --}}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtmId }}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        {{-- End Google Tag Manager (noscript) --}}
    @endif
    <x-inertia::app />
</body>

</html>
