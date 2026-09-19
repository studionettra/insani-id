<x-mail::message>
# Donasi Baru Diterima!

Kabar gembira! Program galang dana Anda telah menerima donasi baru.

### Rincian Donasi:
- **Program:** {{ $donation->program?->title }}
- **Donatur:** {{ $donation->is_anonymous ? 'Hamba Allah' : $donation->donor_name }}
- **Jumlah:** Rp {{ number_format($donation->amount, 0, ',', '.') }}
- **Tanggal:** {{ $donation->paid_at ? $donation->paid_at->format('d M Y H:i') : now()->format('d M Y H:i') }}

@if ($donation->message)
**Pesan / Doa dari Donatur:**
> "{{ $donation->message }}"
@endif

Pantau perkembangan dan rincian donatur melalui dashboard campaigner Anda.

<x-mail::button :url="url('/akun/programs/' . $donation->program_id)">
Lihat Rincian Program
</x-mail::button>

Terima kasih atas perjuangan dan amanah yang terus Anda jalankan.

Salam hangat,<br>
**{{ config('app.name') }}**
</x-mail::message>
