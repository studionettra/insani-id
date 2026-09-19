<x-mail::message>
# Status Verifikasi Akun Campaigner

Halo, **{{ $campaigner->type === 'lembaga' ? $campaigner->institution_name : ($campaigner->user->name ?? 'Sahabat Insani') }}**

@if ($status === 'verified')
Selamat! Pengajuan verifikasi akun Campaigner Anda di **{{ config('app.name') }}** telah **DISETUJUI**.

Sekarang Anda memiliki akses penuh untuk membuat, mengelola, dan mempublikasikan program galang dana kebaikan di platform Insani Indonesia.

<x-mail::button :url="url('/buat-program')">
Mulai Buat Program
</x-mail::button>
@else
Mohon maaf, pengajuan verifikasi akun Campaigner Anda saat ini **BELUM DAPAT DISETUJUI**.

**Catatan Verifikator:**
> {{ $notes ?: 'Dokumen pendukung yang diunggah belum memenuhi syarat kelengkapan verifikasi.' }}

Anda dapat memperbarui dokumen dan informasi Anda melalui menu profil akun.

<x-mail::button :url="url('/campaigner/status')">
Lihat Status & Perbarui Dokumen
</x-mail::button>
@endif

Terima kasih atas dedikasi dan kepedulian Anda.

Salam hangat,<br>
**Tim Verifikasi {{ config('app.name') }}**
</x-mail::message>
