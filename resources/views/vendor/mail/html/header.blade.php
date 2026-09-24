@props(['url'])
<tr>
    <td class="header" style="text-align: center; padding: 25px 0;">
        <a href="{{ $url }}" style="display: inline-block;">
            @php
                $customLogo = \App\Models\AppSetting::get('site_logo');
                $customLogoPath = $customLogo ? storage_path('app/public/' . $customLogo) : null;
                $defaultLogoPath = public_path('images/logo/logo-landscape-color.png');
                
                if ($customLogoPath && file_exists($customLogoPath)) {
                    $logoPath = $customLogoPath;
                    $fallbackUrl = asset('storage/' . $customLogo);
                } elseif (file_exists($defaultLogoPath)) {
                    $logoPath = $defaultLogoPath;
                    $fallbackUrl = asset('images/logo/logo-landscape-color.png');
                } else {
                    $logoPath = null;
                    $fallbackUrl = null;
                }
                $embedder = $mailMessage ?? ($message ?? null);
            @endphp
            @if ($logoPath)
                <img src="{{ !empty($embedder) ? $embedder->embed($logoPath) : $fallbackUrl }}"
                    alt="{{ config('app.name') }}"
                    style="height: 42px; max-height: 42px; width: auto; max-width: 240px; display: block; margin: 0 auto; border: 0;">
            @else
                {!! $slot !!}
            @endif
        </a>
    </td>
</tr>
