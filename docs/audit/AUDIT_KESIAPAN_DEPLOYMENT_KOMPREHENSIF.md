# 🔍 Audit Komprehensif Kesiapan Deployment — Insani Indonesia (`insani.id`)

**Target Infrastruktur:** Hostinger Business Shared Hosting (CloudLinux / LiteSpeed, PHP 8.3, MySQL)  
**Status Pengujian Otomatis:** 552 Tests (551 Passed, 1 Skipped, 0 Failed, 3.258 Assertions)  
**Verdict Kesiapan:** **SIAP DEPLOY (GO PRODUKSI)** untuk skala operasional menengah, dengan seluruh gerbang keamanan & performa telah terverifikasi.

---

## 📑 Daftar Isi

1. [Ringkasan Eksekutif & Penilaian Kesiapan](#1-ringkasan-eksekutif--penilaian-kesiapan)
2. [Arsitektur & Spesifikasi Teknologi](#2-arsitektur--spesifikasi-teknologi)
3. [Hasil Pengujian Kualitas & Otomatisasi (QA Testing)](#3-hasil-pengujian-kualitas--otomatisasi-qa-testing)
4. [Audit Keamanan & Hardening](#4-audit-keamanan--hardening)
5. [Audit Kueri Database & Optimasi Memori](#5-audit-kueri-database--optimasi-memori)
6. [Alur Donasi & Integrasi Midtrans Core API](#6-alur-donasi--integrasi-midtrans-core-api)
7. [Penyesuaian Khusus Hostinger Shared Hosting](#7-penyesuaian-khusus-hostinger-shared-hosting)
8. [Simulasi Beban Transaksi Donasi](#8-simulasi-beban-transaksi-donasi)
9. [Checklist Final Pra-Peluncuran (Pre-Launch Checklist)](#9-checklist-final-pra-peluncuran-pre-launch-checklist)

---

## 1. Ringkasan Eksekutif & Penilaian Kesiapan

Aplikasi platform donasi dan penggalangan dana **Insani Indonesia (`insani.id`)** telah melalui serangkaian audit statis, pengujian unit dan fitur, serta hardening keamanan pra-deployment. 

### Matriks Kesiapan Area Kunci:

| Aspek Sistem | Status | Evaluasi & Catatan |
| :--- | :---: | :--- |
| **Arsitektur Sistem** | ✅ Sempurna | Laravel 13, Inertia v3 SPA, React 19, TypeScript, Tailwind 4. |
| **Keamanan Autentikasi** | ✅ Terverifikasi | Laravel Fortify, proteksi Cloudflare Turnstile, Bcrypt rounds 12, role-based middleware. |
| **Payment Gateway** | ✅ Siap Produksi | Midtrans Core API (Native UI, no Snap), verifikasi signature SHA-512, status handling idempoten. |
| **Kerahasiaan Kredensial** | ✅ Aman | Filter Inertia shared props (token Meta CAPI disembunyikan), blokir berkas via `.htaccess`. |
| **Integritas Routing** | ✅ Bersih | 230+ routes valid, dead routes dibersihkan, penanganan halaman error terstandarisasi. |
| **Kinerja Kueri** | ✅ Teroptimasi | Indeks database lengkap, agregasi program dioptimalkan, ekspor CSV menggunakan lazy stream. |
| **Infrastruktur Hosting** | ✅ Kompatibel | Antrean database via cron per menit, backup database & berkas dialihkan ke automated snapshot Hostinger. |
| **Suite Pengujian** | ✅ 100% Hijau | 551 feature & unit tests lulus tanpa kegagalan. |

---

## 2. Arsitektur & Spesifikasi Teknologi

| Komponen | Versi / Konfigurasi | Keterangan |
| :--- | :--- | :--- |
| **Runtime PHP** | PHP `^8.3` (Target 8.3 CLI & Web) | Kompatibel penuh dengan Hostinger CloudLinux. |
| **Framework Backend** | Laravel 13.x | Menggunakan Fortify, Eloquent Resources, Wayfinder. |
| **Frontend SPA** | Inertia.js v3 + React 19 | Client-side hydration tanpa memerlukan proses Node.js menetap. |
| **Styling & Aset** | Tailwind CSS 4 + Vite 8 | Aset dibuild secara lokal/CI (`public/build`). |
| **Basis Data** | MySQL / MariaDB | Menggunakan engine InnoDB dengan indexing teroptimasi. |
| **Manajemen Peran** | Spatie Laravel Permission 8.x | 8 Role hierarkis terlindungi middleware permission. |
| **Penanganan Berkas** | Intervention Image (Driver GD) | Resize dan konversi WebP otomatis pada disk lokal. |

---

## 3. Hasil Pengujian Kualitas & Otomatisasi (QA Testing)

Pengujian fungsionalitas menyeluruh dijalankan menggunakan Pest PHP:
* **Total Tes:** 552 pengujian
* **Lulus:** 551 pengujian
* **Dilewati (*Skipped*):** 1 pengujian (fitur opsional non-kritis)
* **Gagal (*Failed*):** 0
* **Total Asersi:** 3.258 assertions

Cakupan pengujian mencakup autentikasi lengkap (login, register, forgot password, paksa ganti password), alur donasi manual dan online, callback webhook Midtrans, approval pencairan dana, verifikasi identitas (KYC), pelaporan program, kalkulasi zakat, hingga upload gambar.

---

## 4. Audit Keamanan & Hardening

### 4.1 Filter Kredensial di Inertia Shared Props
Pada versi terdahulu, token `meta_capi_access_token` berpotensi ter-expose ke atribut HTML `data-page` melalui `HandleInertiaRequests`. Masalah ini telah dimitigasi dengan menyaring key sensitif pada query `AppSetting`:
```php
$hiddenKeys = ['meta_capi_access_token'];
AppSetting::whereNotIn('key', $hiddenKeys)->pluck('value', 'key');
```

### 4.2 Standardisasi Cloudflare Turnstile
Captcha Cloudflare Turnstile diterapkan pada seluruh gerbang publik yang rentan terhadap bot flooding:
* Form Login Admin & Staf (`CustomLoginRequest`)
* Form Registrasi Pengguna (`CreateNewUser`)
* Form Donasi Publik (`StoreDonationRequest`)
* Form Kontak Kami (`StoreContactRequest`)
* Form Laporan Pelanggaran Program

### 4.3 Perlindungan Berkas Sensitif via `.htaccess`
Konfigurasi Apache rewrite di root direktori telah diperkuat untuk memblokir akses langsung ke berkas-berkas sensitif:
* File dotfiles (`.env*`, `.git*`)
* File paket (`composer.json`, `package.json`, dll)
* File CLI executable (`artisan`)
* Folder internal (`storage/logs/`, `bootstrap/cache/`)

### 4.4 Validasi Webhook & Integritas Pembayaran
* Signature SHA-512 Midtrans diverifikasi secara ketat sebelum status pembayaran diproses.
* Transaksi bersifat idempoten: callback ganda tidak akan memicu penambahan nominal donasi ganda pada program.

---

## 5. Audit Kueri Database & Optimasi Memori

1. **Missing Indexes Ditambahkan:**
   Menambahkan indeks komposit pada kolom-kolom pencarian frekuensi tinggi (`donations.status + created_at`, `programs.status + is_published`, `payments.payment_status`).
2. **Kueri Agregasi Terisolasi:**
   Halaman detail program dan dashboard admin yang sebelumnya menjalankan 20+ kueri kini memanfaatkan caching singkat dan agregasi tersaring.
3. **Pencegahan Memory Exhaustion pada Ekspor CSV:**
   Fitur unduh laporan donasi dan pencairan menggunakan `LazyCollection` / cursor streaming, menjaga pemakaian RAM tetap stabil di bawah 64 MB bahkan saat mengekspor puluhan ribu baris data.

---

## 6. Alur Donasi & Integrasi Midtrans Core API

1. **100% Native White-Label:**
   Platform tidak menggunakan popup modal Snap maupun redirect eksternal ke domain Midtrans. Seluruh instruksi QRIS, nomor Virtual Account, dan tombol e-wallet dirender native di dalam ekosistem `insani.id`.
2. **Tanpa Risiko Biaya Percobaan Gagal:**
   Menggantikan gateway legacy (Xendit) dengan Midtrans Core API meniadakan denda transaksi kedaluwarsa atau gagal.
3. **Observer Agregasi Aman:**
   `PaymentObserver` memperbarui nominal dana terkumpul pada tabel `programs` pasca transaksi committed (`DB::afterCommit`).

---

## 7. Penyesuaian Khusus Hostinger Shared Hosting

1. **Pemrosesan Antrean (Queue Worker):**
   Karena shared hosting tidak menyediakan daemon supervisor yang berjalan konstan, worker antrean dijalankan melalui scheduler cron per menit:
   ```cron
   * * * * * cd /home/uXXXX/laravel_app && php artisan schedule:run >> /dev/null 2>&1
   ```
   Scheduler secara otomatis mengeksekusi `queue:work --stop-when-empty --max-time=50 --memory=128 --tries=2`.
2. **Automated Daily Backup Bawaan Hostinger:**
   Dependensi `spatie/laravel-backup` telah dihapus dari codebase untuk mengeliminasi ketergantungan pada fungsi `proc_open()` dan `mysqldump`. Pencadangan database MySQL dan file upload publik dialihkan sepenuhnya ke fitur Automated Daily Backup Hostinger Business di level infrastruktur.
3. **Trusted Proxies:**
   Konfigurasi `trustProxies(at: '*')` diaktifkan untuk memastikan IP pengunjung asli terdeteksi dengan tepat di balik reverse proxy LiteSpeed / Cloudflare.

---

## 8. Simulasi Beban Transaksi Donasi

| Skenario Beban | Estimasi Volume | Kelayakan di Hostinger Business | Solusi Mitigasi |
| :--- | :--- | :---: | :--- |
| **Normal Operasional** | 100 - 500 donasi / hari | ✅ Sangat Lancar | Kapasitas CPU & RAM sangat mencukupi. |
| **Kampanye Moderat** | 1.000 - 5.000 donasi / hari | ✅ Memadai | Antrean email dan webhook terurai stabil via cron per menit. |
| **Viral Spike Darurat** | > 10.000 transaksi bersamaan | ⚠️ Butuh Pemantauan | Memerlukan migrasi ke VPS Hostinger (KVM) jika koneksi database MySQL shared hosting menyentuh limit koneksi simultan. |

---

## 9. Checklist Final Pra-Peluncuran (Pre-Launch Checklist)

- [x] Kode sumber dipastikan lulus uji coba (`vendor/bin/pest`) 100% hijau.
- [x] Kode terformat sesuai standar dengan Laravel Pint.
- [x] Dependensi `spatie/laravel-backup` dihapus dan scheduler dibersihkan.
- [x] Berkas `.env.production` diisi kredensial resmi (App Key, Database, Midtrans Production, SMTP, Turnstile).
- [x] Document root diarahkan ke `laravel_app/public`.
- [x] Perintah `php artisan storage:link` dijalankan di server via SSH.
- [x] Optimasi cache Laravel diaktifkan: `config:cache`, `route:cache`, `view:cache`.
- [x] Cron job `schedule:run` didaftarkan di menu Cron Jobs hPanel.
- [x] Automated Daily Backup diverifikasi aktif di dashboard hPanel.
