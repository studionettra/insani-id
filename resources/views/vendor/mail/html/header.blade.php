@props(['url'])
<tr>
    <td class="header" style="text-align: center; padding: 25px 0;">
        <a href="{{ $url }}" style="display: inline-block;">
            @php
                $logoPath = public_path('images/logo/logo-landscape-color.png');
                $hasLogo = file_exists($logoPath);
                $embedder = $mailMessage ?? ($message ?? null);
            @endphp
            @if ($hasLogo)
                <img src="{{ !empty($embedder) ? $embedder->embed($logoPath) : asset('images/logo/logo-landscape-color.png') }}"
                    alt="{{ config('app.name') }}"
                    style="height: 72px; max-height: 72px; width: auto; max-width: 360px; display: block; margin: 0 auto; border: 0;">
            @else
                {!! $slot !!}
            @endif
        </a>
    </td>
</tr>
