<x-mail::message>
# Pesan Kontak Baru dari {{ $messageData->name }}

Anda menerima pesan baru melalui formulir Hubungi Kami di website Insani Indonesia.

**Detail Pesan:**
- **Nama:** {{ $messageData->name }}
- **Email:** {{ $messageData->email }}
- **Telepon:** {{ $messageData->phone ?? '-' }}
- **Subjek:** {{ $messageData->subject }}

**Isi Pesan:**
<x-mail::panel>
{{ $messageData->message }}
</x-mail::panel>

<x-mail::button :url="url('/admin/contact-messages/' . $messageData->id)">
Lihat di Dashboard Admin
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
