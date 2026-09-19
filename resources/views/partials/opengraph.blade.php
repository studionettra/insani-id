@php
    $seo = \App\Services\SeoService::resolve($page ?? []);
@endphp

@if (! empty($seo['is_private']))
    <meta name="robots" content="noindex, nofollow">
    <title inertia>{{ $seo['title'] }}</title>
@else
    <title inertia>{{ $seo['title'] }}</title>
    <meta name="description" content="{{ $seo['description'] }}">
    <link rel="canonical" href="{{ $seo['url'] }}">

    {{-- Open Graph / Facebook / WhatsApp / Telegram / LinkedIn --}}
    <meta property="og:type" content="{{ $seo['type'] }}">
    <meta property="og:url" content="{{ $seo['url'] }}">
    <meta property="og:title" content="{{ $seo['title'] }}">
    <meta property="og:description" content="{{ $seo['description'] }}">
    <meta property="og:image" content="{{ $seo['image'] }}">
    <meta property="og:site_name" content="{{ $seo['site_name'] }}">

    {{-- Twitter Cards --}}
    <meta name="twitter:card" content="{{ $seo['card'] }}">
    <meta name="twitter:url" content="{{ $seo['url'] }}">
    <meta name="twitter:title" content="{{ $seo['title'] }}">
    <meta name="twitter:description" content="{{ $seo['description'] }}">
    <meta name="twitter:image" content="{{ $seo['image'] }}">
@endif
