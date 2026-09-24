@component('mail::message')
# Halo {{ $donation->donor_name }},

Terima kasih atas niat baik Anda untuk berdonasi pada program **{{ is_array($donation->program->title) ? ($donation->program->title[app()->getLocale()] ?? $donation->program->title['id'] ?? collect($donation->program->title)->first()) : $donation->program->title }}**.

Pesan donasi Anda telah kami terima dan saat ini berstatus **MENUNGGU PEMBAYARAN**.

**Detail Donasi:**
- **Kode Donasi:** {{ $donation->donation_code }}
- **Jumlah Donasi:** Rp {{ number_format($donation->amount, 0, ',', '.') }}
- **Metode Pembayaran:** {{ $donation->payments->first()?->payment_method == 'bank_transfer_manual' ? 'Transfer Bank Manual' : 'Pembayaran Online' }}

@if($donation->payments->first()?->gateway == 'xendit' && $donation->payments->first()?->checkout_url)
Silakan klik tombol di bawah ini untuk melihat instruksi pembayaran dan menyelesaikan donasi Anda.

@component('mail::button', ['url' => $donation->payments->first()->checkout_url, 'color' => 'success'])
Bayar Sekarang
@endcomponent

*(Jika tombol tidak berfungsi, salin dan buka tautan berikut di browser Anda: {{ $donation->payments->first()->checkout_url }})*
@else
Silakan lakukan transfer ke rekening berikut sejumlah **Rp {{ number_format($donation->amount, 0, ',', '.') }}**:

**{{ $donation->payments->first()?->payment_destination }}**

*Pastikan nominal transfer sesuai agar donasi dapat segera diverifikasi.*

@component('mail::button', ['url' => route('donation.status', ['donationCode' => $donation->donation_code]), 'color' => 'primary'])
Cek Status Donasi
@endcomponent
@endif

Terima kasih atas kepedulian dan partisipasi Anda. Semoga pahala terus mengalir bagi Anda dan keluarga.

Salam hangat,<br>
Tim {{ config('app.name') }}
@endcomponent
