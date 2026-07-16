<x-mail::message>
# Alhamdulillah, Donasi Berhasil Diterima!

Halo {{ $donation->is_anonymous ? 'Hamba Allah' : $donation->donor_name }},

Terima kasih atas kebaikan Anda. Kami telah menerima donasi Anda untuk program **"{{ is_array($donation->program->title) ? $donation->program->title['id'] : $donation->program->title }}"**.

Berikut adalah rincian donasi Anda:
- **ID Transaksi:** {{ $donation->donation_code }}
- **Nominal:** Rp {{ number_format($donation->amount, 0, ',', '.') }}
- **Tanggal Pembayaran:** {{ \Carbon\Carbon::parse($donation->paid_at)->translatedFormat('d F Y H:i') }}
- **Metode:** {{ strtoupper($donation->channel) }}

Semoga kebaikan Anda menjadi amal jariyah yang terus mengalir dan membawa keberkahan.

<x-mail::button :url="route('program.show', $donation->program->slug)">
Lihat Program
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
