# Phase 8: Reports, Language Widget & SEO Finalization

Phase 8 berfokus pada penyelesaian fitur administratif terakhir (Laporan) dan penyempurnaan fitur publik (Widget Bahasa Otomatis, SEO, dan elemen Footer).

## User Review Required

> [!IMPORTANT]  
> **Widget Terjemahan (Google Translate / GTranslate)**
> Untuk fitur alih bahasa, saya berencana menggunakan *snippet script* gratis dari layanan seperti **GTranslate** atau **Google Website Translator**. Skrip ini akan secara otomatis memunculkan pilihan ikon bendera di *Navbar* dan menerjemahkan seluruh teks di halaman publik tanpa perlu memodifikasi *database* backend. Apakah Anda memiliki preferensi spesifik untuk penyedia *widget* ini, atau saya gunakan GTranslate standar?

> [!NOTE]  
> **Format Laporan (Export)**
> Untuk Laporan Donasi dan Pencairan, apakah Anda cukup membutuhkan tombol *Export to CSV* standar (yang bisa dibuka di Excel), atau apakah ada kebutuhan mutlak untuk menggunakan format `.xlsx` (yang biasanya membutuhkan instalasi ekstensi tambahan seperti `maatwebsite/excel`)? Format **CSV** lebih direkomendasikan untuk beban *server* yang ringan.

## Proposed Changes

---

### 1. Modul Laporan (Internal)

#### [NEW] `app/Http/Controllers/Admin/ReportController.php`
- Membuat metode `index` untuk menampilkan halaman dasbor laporan (grafik ringan/ringkasan angka).
- Membuat metode `exportDonations` (Unduh CSV Donasi sukses berdasarkan rentang tanggal).
- Membuat metode `exportDisbursements` (Unduh CSV Pencairan).

#### [MODIFY] `routes/web.php`
- Menambahkan rute `/admin/reports` yang dilindungi dengan izin `report.view`.

#### [NEW] `resources/js/pages/Admin/Reports/Index.tsx`
- Halaman antarmuka untuk staf (Keuangan/Admin) memfilter dan mengunduh laporan.

#### [MODIFY] `resources/js/components/app-sidebar.tsx`
- Menambahkan menu "Laporan" di *sidebar* panel admin.

---

### 2. Integrasi Alih Bahasa (Navbar)

#### [MODIFY] `resources/js/layouts/PublicLayout.tsx`
- Memasukkan *script* GTranslate (atau Google Translate) ke dalam bagian `<head>` halaman atau menggunakan injeksi DOM.
- Menempatkan kontainer/ikon *dropdown* bahasa di bagian kanan `Navbar` (sebelah tombol Login/Akun).

---

### 3. Finalisasi SEO & Footer (Publik)

#### [MODIFY] `resources/js/pages/Public/Program/Show.tsx`
- Memperkaya tag `<Head>` bawaan Inertia.js untuk menambahkan:
  - `<meta name="description" ...>`
  - `<meta property="og:title" ...>`
  - `<meta property="og:description" ...>`
  - `<meta property="og:image" content={program.cover_image_url} />`
  - URL *canonical*.

#### [MODIFY] `resources/js/layouts/PublicLayout.tsx` (Footer)
- Merapikan struktur *Footer*, menambahkan tautan media sosial statis, tautan statis ke "Tentang Kami", "Syarat & Ketentuan" (bisa diisi *placeholder* jika halamannya belum dibuat).

---

## Verification Plan

### Automated Tests
- `php artisan test --filter ReportTest` untuk memastikan fitur unduh CSV dan otorisasi berjalan lancar.

### Manual Verification
- Melakukan klik pada *widget* bendera di *Navbar* publik dan memastikan seluruh halaman (termasuk deskripsi program) otomatis diterjemahkan.
- Membuka halaman detail program, *View Source* atau *Inspect Element* untuk memastikan *tag* `<meta>` (Open Graph/SEO) tampil dengan data yang benar (judul program, *cover image*).
- Masuk sebagai Admin Keuangan dan mencoba mengekspor laporan donasi ke format CSV, lalu membukanya.
