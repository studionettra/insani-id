

<!-- MERGED FROM 08_phase_8_plan.md -->

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


<!-- MERGED FROM 08_phase_8_task.md -->

# Phase 8: Reports, Language Widget & SEO Finalization

- [x] 1. Modul Laporan (Internal)
  - [x] Buat `ReportController` dengan metode `index`, `exportDonations`, `exportDisbursements`.
  - [x] Tambahkan rute `/admin/reports` di `routes/web.php`.
  - [x] Buat UI React `resources/js/pages/Admin/Reports/Index.tsx`.
  - [x] Tambahkan menu "Laporan" di `app-sidebar.tsx`.
- [x] 2. Integrasi Alih Bahasa (Navbar)
  - [x] Pasang script *GTranslate* di halaman publik.
  - [x] Tambahkan dropdown bahasa di *Navbar*.
- [x] 3. Finalisasi SEO & Footer (Publik)
  - [x] Tambahkan meta tag (description, og:title, og:image) di `Show.tsx` (Detail Program).
  - [x] Rapikan elemen `Footer` (sosial media, tautan statis) di `PublicLayout.tsx`.


<!-- MERGED FROM 08_phase_8_walkthrough.md -->

# Walkthrough: Phase 8 Selesai (Laporan, Widget Bahasa, SEO)

Selamat! Phase 8 telah berhasil diimplementasikan secara penuh. Ini adalah fase terakhir dari pengembangan aplikasi berdasarkan dokumen PRD.

Berikut adalah ringkasan fitur yang telah selesai dibangun:

## 1. Modul Laporan & Ekspor CSV (Internal)
Administrator dan staf keuangan kini dapat melihat ringkasan donasi dan pencairan dana, serta mengekspor laporannya ke format CSV.

- **Lokasi:** Dasbor Admin > Menu **Laporan**.
- **Fitur:**
  - Tampilan *Card* untuk total donasi lunas dan total dana dicairkan.
  - Filter rentang tanggal (Dari Tanggal - Sampai Tanggal) untuk laporan donasi dan pencairan.
  - Tombol **Export ke CSV** yang akan langsung mengunduh file `.csv` ringan dan ramah server.

## 2. Widget Alih Bahasa Otomatis (GTranslate)
Sesuai kesepakatan, fitur alih bahasa telah menggunakan widget gratis dari **GTranslate**.
- **Lokasi:** Terpasang di sudut *Navbar* pada seluruh halaman publik (`PublicLayout`).
- **Fitur:** 
  - Pengunjung dapat mengganti bahasa antarmuka secara *on-the-fly* (misalnya dari Indonesia ke Inggris atau Arab).
  - Skrip dimuat secara asinkron (*defer*) sehingga tidak memperlambat beban sistem.
  - Tanpa modifikasi berat di database!

## 3. Optimasi SEO & Footer
Halaman publik telah dioptimasi untuk mesin pencari dan ketika tautan dibagikan ke sosial media.
- **Lokasi:** Halaman Detail Program (`/program/{slug}`).
- **Fitur:**
  - **Open Graph Meta Tags:** Telah ditambahkan `<meta property="og:title">`, `og:description`, dan `og:image` sehingga bila pengguna membagikan tautan program ke WhatsApp/Facebook, akan memunculkan gambar kover dan judul yang sesuai.
  - **Footer:** Struktur *footer* telah disempurnakan dengan penambahan *placeholder* tautan statis seperti "Tentang Kami", "Kebijakan Privasi", dan Sosial Media.

---

> [!NOTE]
> **Status Proyek Keseluruhan**
> Dengan rampungnya Phase 8, maka secara teknis **seluruh modul pada PRD (Phase 1 s/d Phase 8) telah diselesaikan dengan status 100% Tercapai**. 

Anda bebas melakukan eksplorasi fitur dan *testing* secara menyeluruh di *browser* Anda sekarang!
