<!DOCTYPE html>
@php
    $isAdminOrDashboard = request()->is('dashboard*', 'admin*', 'akun*', 'settings*');
@endphp
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() == 'ar' ? 'rtl' : 'ltr' }}"
    @class(['dark' => $isAdminOrDashboard && ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

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
    <x-inertia::app />
</body>

</html>
