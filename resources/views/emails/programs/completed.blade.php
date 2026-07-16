<x-mail::message>
# Selamat! Program Galang Dana Anda Telah Selesai

Halo {{ $program->creator->name }},

Kami ingin memberitahukan bahwa program donasi Anda yang berjudul **"{{ is_array($program->title) ? $program->title['id'] : $program->title }}"** telah berhasil diselesaikan.

Hal ini mungkin terjadi karena:
- Target dana sebesar Rp {{ number_format($program->target_amount, 0, ',', '.') }} telah tercapai, ATAU
- Batas waktu program telah berakhir pada {{ \Carbon\Carbon::parse($program->deadline)->translatedFormat('d F Y') }}.

Total donasi yang berhasil dikumpulkan adalah:
### Rp {{ number_format($program->collected_amount, 0, ',', '.') }}

<x-mail::button :url="$url">
Lihat Halaman Program
</x-mail::button>

Silakan masuk ke dashboard akun Anda untuk melihat detail laporan atau mengajukan proses pencairan dana (jika fitur tersedia).

Terima kasih telah mempercayakan Insani Indonesia sebagai platform kebaikan Anda.

Salam hangat,<br>
Tim {{ config('app.name') }}
</x-mail::message>
