# 📋 Laporan Audit Mendalam & QA Pra-Deployment — Hostinger Business Shared Hosting
**Proyek:** Insani Indonesia (`insani.id`)  
**Target Infrastruktur:** Hostinger Business Shared Hosting (CloudLinux / LiteSpeed, PHP 8.3, MySQL)  
**Tanggal Audit:** 4 Oktober 2026  
**Status QA Pest Testing:** 482 Tests (477 Passed, 5 Skipped, 0 Failed, 2.779 Assertions)  
**Penyusun:** Antigravity Senior Security & Full-Stack Architect  

---

## 📑 Daftar Isi

1. [Ringkasan Eksekutif & Verdict Kesiapan](#1-ringkasan-eksekutif--verdict-kesiapan)
2. [QA Testing Fitur & Form Input](#2-qa-testing-fitur--form-input)
   - 2.1 [Hasil Uji Otomatisasi (Pest Suite)](#21-hasil-uji-otomatisasi-pest-suite)
   - 2.2 [Audit Fitur Inti (Feature-by-Feature)](#22-audit-fitur-inti-feature-by-feature)
   - 2.3 [Audit Keamanan Form Input & Sanitasi](#23-audit-keamanan-form-input--sanitasi)
3. [Analisis Seluruh Route & Potensi Error](#3-analisis-seluruh-route--potensi-error)
   - 3.1 [Hasil Verifikasi 233 Routes](#31-hasil-verifikasi-233-routes)
   - 3.2 [Temuan Bug Route: `/settings/appearance` (Dead Route)](#32-temuan-bug-route-settingsappearance-dead-route)
   - 3.3 [Pencegahan Masalah Casing Linux (Case-Sensitivity)](#33-pencegahan-masalah-casing-linux-case-sensitivity)
   - 3.4 [Penanganan Error Page Kustom (403, 404, 419, 500, 503)](#34-penanganan-error-page-kustom-403-404-419-500-503)
4. [Analisis Seluruh Query Database & Kinerja](#4-analisis-seluruh-query-database--kinerja)
   - 4.1 [Bottleneck Query: Detail Program Publik](#41-bottleneck-query-detail-program-publik)
   - 4.2 [Bottleneck Query: Dashboard Multi-Role](#42-bottleneck-query-dashboard-multi-role)
   - 4.3 [Audit Database Indexing (Missing Indexes)](#43-audit-database-indexing-missing-indexes)
   - 4.4 [Risiko Memory Exhaustion pada Ekspor CSV Laporan](#44-risiko-memory-exhaustion-pada-ekspor-csv-laporan)
5. [Analisis Penempatan Direktori & Ekspos Kredensial Publik](#5-analisis-penempatan-direktori--ekspos-kredensial-publik)
   - 5.1 [🔴 KRITIS: Kebocoran Meta CAPI Token via Inertia Shared Props](#51--kritis-kebocoran-meta-capi-token-via-inertia-shared-props)
   - 5.2 [Arsitektur Direktori Shared Hosting & Celah Root `.htaccess`](#52-arsitektur-direktori-shared-hosting--celah-root-htaccess)
   - 5.3 [Audit File Publik & Dokumen Privat (KTP & Bukti Transfer)](#53-audit-file-publik--dokumen-privat-ktp--bukti-transfer)
   - 5.4 [Audit File Dev Tercecer (`public/hot`)](#54-audit-file-dev-tercecer-publichot)
6. [Daftar File yang Tidak Berkaitan & Rekomendasi Pembersihan (Dead Files)](#6-daftar-file-yang-tidak-berkaitan--rekomendasi-pembersihan-dead-files)
7. [Faktor Kesiapan Khusus Hostinger Shared Hosting (Unmentioned Factors)](#7-faktor-kesiapan-khusus-hostinger-shared-hosting-unmentioned-factors)
   - 7.1 [Konfigurasi Trusted Proxies (Cloudflare & Reverse Proxy Hostinger)](#71-konfigurasi-trusted-proxies-cloudflare--reverse-proxy-hostinger)
   - 7.2 [Queue Worker Tanpa Supervisor (Drain via Cron)](#72-queue-worker-tanpa-supervisor-drain-via-cron)
   - 7.3 [Versi PHP CLI vs Web pada Cron Job Hostinger](#73-versi-php-cli-vs-web-pada-cron-job-hostinger)
   - 7.4 [Inkonsistensi Port & Skema SMTP Hostinger (Port 465 vs 587)](#74-inkonsistensi-port--skema-smtp-hostinger-port-465-vs-587)
   - 7.5 [Siklus Penyimpanan Backup DB di Shared Disk](#75-siklus-penyimpanan-backup-db-di-shared-disk)
   - 7.6 [Bundling Frontend (Vite & Git Deployment Trap)](#76-bundling-frontend-vite--git-deployment-trap)
8. [Panduan Langkah Demi Langkah & Checklist Pra-Deployment](#8-panduan-langkah-demi-langkah--checklist-pra-deployment)

---

## 1. Ringkasan Eksekutif & Verdict Kesiapan

Berdasarkan audit menyeluruh terhadap kode sumber, arsitektur database, konfigurasi server, alur bisnis donasi, dan pengujian QA pada aplikasi **Insani Indonesia**, berikut adalah rangkuman kesiapannya untuk dideploy ke **Hostinger Business Shared Hosting**:

| Area Audit | Status | Tingkat Risiko | Catatan Kunci |
|---|:---:|:---:|---|
| **Fitur & Alur Bisnis** | ✅ Siap | Rendah | Alur donasi, pembayaran Midtrans, fundraiser, dan campaigner berjalan mulus. |
| **Form Input & Sanitasi** | ✅ Sangat Baik | Rendah | Turnstile bot protection, HTMLPurifier, dan anti-scam regex aktif. |
| **Koleksi Route (233 Routes)** | ⚠️ Minor Fix | Rendah | 1 dead route (`/settings/appearance`) memanggil view yang tidak ada. |
| **Optimasi Query & Indexing** | ⚠️ Butuh Tuning | Sedang | Agregasi detail program & dashboard belum di-cache; ada missing index. |
| **Ekspos Kredensial Publik** | 🔴 KRITIS | **TINGGI** | Token Meta CAPI terkirim ke browser publik via `HandleInertiaRequests`. |
| **Keamanan Direktori Hosting** | ⚠️ Perhatian | Sedang | Root `.htaccess` perlu rule proteksi ketat file rahasia jika pakai `public_html`. |
| **Pembersihan File Sampah** | 🟡 Teridentifikasi | Rendah | Ditemukan file `welcome.tsx`, `public/hot`, dan aset gambar debug di `docs/`. |
| **Shared Hosting Constraints** | ⚠️ Perlu Penyesuaian | Sedang | Trusted proxy belum diset; Queue worker harus bergantung pada cron master. |

### 🎯 Verdict Akhir:
Aplikasi **SIAP DIDEPLOY KE HOSTINGER BUSINESS SHARED HOSTING** dengan syarat **4 Perbaikan Kritis (Hotfix Wajib)** diselesaikan sebelum go-live:
1. **Perbaikan Privasi Props Inertia:** Hentikan `AppSetting::pluck('value', 'key')` tanpa filter di `HandleInertiaRequests.php` agar token Meta CAPI tidak bocor ke publik.
2. **Hapus Dead Route:** Hapus route `/settings/appearance` dari `routes/settings.php`.
3. **Konfigurasi Trusted Proxy:** Daftarkan `$middleware->trustProxies(at: '*')` di `bootstrap/app.php` agar IP pengunjung asli, Cloudflare, dan SSL Hostinger tidak error.
4. **Pembersihan Aset Build:** Hapus `public/hot` dan jalankan `npm run build` sebelum file dipaketkan ke server.

---

## 2. QA Testing Fitur & Form Input

### 2.1 Hasil Uji Otomatisasi (Pest Suite)
Uji coba otomatis dilakukan langsung terhadap seluruh test suite aplikasi menggunakan Pest v4:
```text
Tool: Pest PHP | Tests: 482 | Passed: 477 | Assertions: 2,779 | Duration: ~76s | Skipped: 5 | Failed: 0
```
- **0 Failures:** Seluruh logika bisnis inti, kalkulasi nominal, verifikasi signature Midtrans, autentikasi Fortify, dan autorisasi role lolos 100%.
- **5 Skipped Tests:**
  - `SmtpConnectionTest.php`: Sengaja di-skip di lingkungan lokal/testing karena memerlukan koneksi langsung ke socket SMTP produksi.
  - `SecurityTest.php` & `AuthenticationTest.php`: 4 test di-skip karena fitur **Two-Factor Authentication (2FA)** saat ini dinonaktifkan di `config/fortify.php`. Ini adalah perilaku normal dan bukan bug.

---

### 2.2 Audit Fitur Inti (Feature-by-Feature)

#### A. Alur Donasi & Pembayaran (Donation Lifecycle)
1. **Pilihan Nominal & Program:**
   - Mendukung nominal kustom dan pilihan nominal cepat (preset).
   - Validasi minimum donasi berjalan dinamis dari database setting (`min_donation_amount`, default Rp 10.000).
   - Fitur "Inisiator Kebaikan" (anonim) berfungsi menyembunyikan identitas donatur di riwayat publik.
2. **Kanal Pembayaran Online (Midtrans Core API):**
   - Transaksi diproses melalui API native tanpa popup Snap eksternal (pengalaman donor mulus di dalam situs).
   - Mendukung QRIS (Gopay, ShopeePay, m-Banking BCA/Mandiri/BRI/BNI/BSI) dengan expiry otomatis 30 menit.
   - Virtual Account otomatis (Bank Transfer) dengan expiry 24 jam.
   - Webhook callback terproteksi timing-safe hash SHA-512 signature verification.
3. **Kanal Transfer Bank Manual (Offline):**
   - Generator kode unik 3-digit (101 - 999) memastikan tidak ada duplikasi kode unik untuk program yang sama pada hari yang sama.
   - Halaman status pembayaran `/donasi/status/{donationCode}` menyediakan instruksi rekening tujuan dan fitur unggah bukti transfer.
   - Bukti transfer manual diverifikasi staff dengan role Keuangan atau Admin melalui `/admin/donations`.
4. **Pembatalan & Penggantian Donasi Pending:**
   - Donatur dapat membatalkan donasi pending secara mandiri (`/donasi/{donationCode}/batal`).
   - Jika donatur mengulang donasi dengan memilih metode baru, kode donasi lama otomatis dibatalkan (`replace_donation_code`), mencegah penumpukan tagihan ganda di Midtrans.
5. **Kwitansi Resmi Donasi:**
   - Kwitansi resmi dapat diunduh/dilihat publik melalui `/donasi/kwitansi/{donationCode}` dengan QR verifikasi dan stempel digital yayasan.

#### B. Ekosistem Fundraiser
- Pendaftaran fundraiser instan untuk program apa pun yang berstatus `published`.
- Auto-generate kode rujukan (`referral_code`) yang unik.
- Pelacakan parameter URL `?ref={code}` otomatis disimpan ke session dan cookie selama 30 hari.
- Atribusi donasi berhasil meningkatkan metrik perolehan donasi di dashboard fundraiser pribadi (`/akun/fundraiser`).

#### C. Siklus Hidup Campaigner & Program
- **Registrasi Campaigner:** Pembagian tegas tipe Individu dan Lembaga. Mewajibkan upload KTP, selfie KTP, buku rekening, serta SK & NPWP (khusus lembaga).
- **Slot Kuota Campaign:** Pembatasan kuota aktif (`max_campaign_slots`) mencegah campaigner membuat program berlebihan tanpa persetujuan penambahan slot oleh Verifikator.
- **Pengajuan Program:**
   - Program reguler (dengan target nominal dan tenggat waktu).
   - Program abadi / berkelanjutan (`is_continuous = true`) tanpa batas waktu.
   - Status awal otomatis `pending_verification` untuk ditinjau oleh Program Officer.
- **Kabar Terbaru (Program Updates):** Dilengkapi sistem moderasi admin sebelum dipublikasikan ke halaman detail program.
- **Pencairan Dana (Disbursements):**
   - Validasi ketat nominal: minimal Rp 150.000 dan tidak boleh melebihi `available_balance` (donasi terkumpul dikurangi potongan platform 5%, fee gateway, dan pencairan yang sudah disetujui sebelumnya).
   - Alur persetujuan dua pintu: Disetujui Keuangan/Admin -> Ditransfer dengan melampirkan bukti transfer bank.

#### D. Manajemen Administrator & Staf
- Seluruh 8 peran Spatie Role (`Administrator`, `Program Officer`, `Verifikator`, `Keuangan`, `Customer Service`, `Content Editor`, `Eksekutif`, `Relawan Lapangan`) memiliki batas otorisasi yang ketat.
- Fitur auto-translate artikel dan program ke bahasa Inggris dan Arab berfungsi dengan baik.
- Laporan pelanggaran program (`/program/{slug}/lapor`) dapat langsung ditindaklanjuti dengan investigasi atau tindakan *takedown* program oleh tim admin.

---

### 2.3 Audit Keamanan Form Input & Sanitasi

| Form Input | Proteksi Keamanan | Status | Detail Teknis |
|---|---|:---:|---|
| **Donasi Checkout** | Turnstile + Honeypot + Regex Filter | ✅ Sangat Kuat | Input nama dan doa dibersihkan dari tag HTML dan dicek terhadap kamus kata kasar / URL spam. Field tersembunyi `website_url` memblokir bot spam. |
| **Login & Register** | Turnstile + Rate Limiter Fortify | ✅ Sangat Kuat | Dibatasi 5 kali percobaan gagal per menit per IP/username. Turnstile captcha memblokir *credential stuffing*. |
| **Cerita Program (WYSIWYG)** | HTMLPurifier + Anti-Scam Rekening | ✅ Sangat Kuat | Menggunakan `mews/purifier` untuk memfilter script jahat. Dilengkapi regex deteksi 10-16 digit angka rekening pribadi untuk mencegah penipuan. |
| **Form Kontak Publik** | Turnstile + Throttling 5/menit | ✅ Kuat | Mencegah email spamming ke mailbox yayasan. |
| **Lapor Program Publik** | Throttling 5/menit + File Mime | ✅ Kuat | Bukti laporan dibatasi tipe gambar/PDF dan ukuran maksimal. |
| **Upload Dokumen KYC** | Mime Check + Local Disk Storage | ✅ Sangat Aman | File KTP dan dokumen legal tidak disimpan di storage publik, melainkan di storage lokal privat. |
| **Upload Gambar Konten** | Intervention Image Re-encoding | ✅ Sangat Aman | File gambar yang diunggah diproses ulang via Intervention Image ke format WebP 80% quality (menghancurkan payload polyglot/webshell). |

---

## 3. Analisis Seluruh Route & Potensi Error

### 3.1 Hasil Verifikasi 233 Routes
Pemeriksaan dilakukan terhadap seluruh 233 rute yang terdaftar pada Laravel routing engine:
- Seluruh Class Controller yang dipanggil rute benar-benar ada dan ter-autoload dengan benar.
- Seluruh method target controller valid dan dapat dieksekusi.
- Middleware keamanan (`auth`, `verified`, `permission`, `throttle`, `no-cache`, `signed`) terpasang dengan tepat pada endpoint sensitif.

---

### 3.2 Temuan Bug Route: `/settings/appearance` (Dead Route)
- **Lokasi Kode:** [routes/settings.php](file:///c:/laragon/www/insani-id/routes/settings.php#L27)
  ```php
  Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
  ```
- **Masalah:**
  File view `resources/js/pages/settings/appearance.tsx` **TIDAK DITEMUKAN** di dalam proyek. Halaman ini merupakan artefak bawaan template starter kit yang komponennya sudah dihapus karena fitur toggle tema telah dipindahkan langsung ke tombol navbar atas (`ThemeToggleButton`).
- **Dampak:** Jika pengguna yang sudah login mengklik atau menavigasi ke URL `/settings/appearance`, sistem akan mengalami error Inertia component missing (HTTP 404 / 500).
- **Rekomendasi Perbaikan:** Hapus baris 27 pada `routes/settings.php`.

---

### 3.3 Pencegahan Masalah Casing Linux (Case-Sensitivity)
- **Konteks:** Sistem operasi development menggunakan Windows (case-insensitive), sedangkan Hostinger Shared Hosting menggunakan CloudLinux/Ubuntu (case-sensitive).
- **Hasil Pemeriksaan:**
  - Route dashboard memanggil `Inertia::render('dashboard')` dan nama file di disk adalah `resources/js/pages/dashboard.tsx` (keduanya konsisten huruf kecil).
  - Seluruh pemanggilan `Inertia::render` di folder `Public/` dan `Admin/` konsisten menggunakan PascalCase sesuai struktur direktori.
- **Rekomendasi:** Tidak diperlukan perubahan nama file, namun pastikan saat packaging/git deploy tidak ada perubahan casing yang terabaikan.

---

### 3.4 Penanganan Error Page Kustom (403, 404, 419, 500, 503)
Di [bootstrap/app.php](file:///c:/laragon/www/insani-id/bootstrap/app.php#L65-L89), penanganan exception sudah diimplementasikan dengan sangat baik:
- **Error 419 (CSRF Token Expired):** Tidak menampilkan layar "Page Expired" putih polos, melainkan otomatis me-redirect pengunjung ke form login dengan pesan flash ramah: *"Sesi Anda telah berakhir. Silakan masuk kembali."*
- **Error 403, 404, 500, 503:** Me-render komponen Inertia terpadu `resources/js/pages/Error.tsx` dengan UI resmi Insani Indonesia.

---

## 4. Analisis Seluruh Query Database & Kinerja

### 4.1 Bottleneck Query: Detail Program Publik
- **Lokasi Kode:** [app/Http/Controllers/Public/ProgramListingController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Public/ProgramListingController.php#L117-L122)
  ```php
  $totalCollected = (float) $program->donations()->where('status', 'paid')->sum('amount');
  $totalGatewayFees = (float) DB::table('donations')
      ->join('payments', 'donations.id', '=', 'payments.donation_id')
      ->where('donations.program_id', $program->id)
      ->where('donations.status', 'paid')
      ->sum('payments.gateway_fee');
  ```
- **Analisis Masalah:**
  Setiap kali seorang pengunjung membuka halaman detail program (`/program/{slug}`), database mengeksekusi kalkulasi `SUM(amount)` dari tabel `donations` dan `SUM(payments.gateway_fee)` melalui operasi `JOIN`.
  Pada kampanye yang menerima ribuan donasi, query ini melakukan scanning ribuan baris pada setiap HTTP request. Jika sebuah program viral di media sosial dan menerima 100 hit bersamaan di shared hosting, prosesor MySQL Hostinger akan melonjak ke 100% CPU dan menimbulkan error koneksi database.
- **Rekomendasi Optimasi:**
  1. Manfaatkan kolom `collected_amount` yang sudah tersimpan di tabel `programs` (yang otomatis diperbarui oleh observer saat donasi lunas).
  2. Cache blok data transparansi keuangan program selama 60 detik:
     ```php
     $transparency = Cache::remember("program_transparency_{$program->id}", 60, function () use ($program) {
         // Kalkulasi agregat di sini
     });
     ```

---

### 4.2 Bottleneck Query: Dashboard Multi-Role
- **Lokasi Kode:** [app/Http/Controllers/DashboardController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/DashboardController.php#L42-L60)
- **Analisis Masalah:**
  Pada method `DashboardController@index`, terdapat 11 query agregasi platform global:
  ```php
  $totalDonations = (float) Donation::where('status', 'paid')->sum('amount');
  $donationsThisMonth = (float) Donation::where('status', 'paid')->whereMonth(...)->sum('amount');
  $activePrograms = Program::where('status', 'published')->count();
  $pendingPrograms = Program::where('status', 'pending_verification')->count();
  $pendingCampaigners = CampaignerProfile::where('verification_status', 'pending')->count();
  $totalDonors = Donation::where('status', 'paid')->distinct('donor_email')->count('donor_email');
  $totalDisbursed = (float) Disbursement::where('status', 'transferred')->sum('requested_amount');
  $disbursedThisMonth = (float) Disbursement::where('status', 'transferred')->whereMonth(...)->sum('requested_amount');
  $pendingDisbursements = (float) Disbursement::where('status', 'pending')->sum('requested_amount');
  $pendingDisbursementsCount = Disbursement::where('status', 'pending')->count();
  $pendingOfflineDonations = Donation::where('channel', 'offline')->where('status', 'pending')->count();
  ```
  **Temuan Kritis:** Query-query ini dijalankan untuk **SEMUA pengguna**, termasuk Donatur biasa yang login hanya untuk melihat donasi pribadinya. Selain itu, perhitungan `COUNT(DISTINCT donor_email)` pada tabel donasi yang besar adalah salah satu query terlambat di MySQL tanpa index.
- **Rekomendasi Optimasi:**
  1. Jalankan 11 query di atas **hanya jika** `$isStaff` bernilai `true`.
  2. Bungkus query statistik platform dengan cache berdurasi 3–5 menit:
     ```php
     $platformStats = Cache::remember('dashboard_platform_stats', 300, function () { ... });
     ```

---

### 4.3 Audit Database Indexing (Missing Indexes)
Pemeriksaan skema migration menemukan beberapa kolom sering digunakan dalam klausa `WHERE`, `ORDER BY`, dan `JOIN`, namun belum memiliki index:

| Tabel | Kolom / Kombinasi | Jenis Kueri yang Menggunakan | Rekomendasi Index |
|---|---|---|---|
| `donations` | `status` | Agregasi dashboard & filter status admin | `INDEX idx_donations_status (status)` |
| `donations` | `paid_at` | Filter rentang tanggal laporan & grafik tren | `INDEX idx_donations_paid_at (paid_at)` |
| `donations` | `donor_email` | Pencarian donatur & riwayat donatur non-login | `INDEX idx_donations_donor_email (donor_email)` |
| `donations` | `donor_user_id` | Riwayat donasi user di dashboard | `INDEX idx_donations_donor_user (donor_user_id)` |
| `payments` | `gateway_status` | Polling transaksi pending & webhook update | `INDEX idx_payments_gateway_status (gateway_status)` |
| `disbursements`| `status` | Filter status pencairan dana admin | `INDEX idx_disbursements_status (status)` |

*Catatan: Migration baru dapat dibuat untuk menambahkan index ini sebelum data donasi di server produksi membesar.*

---

### 4.4 Risiko Memory Exhaustion pada Ekspor CSV Laporan
- **Lokasi Kode:** [app/Http/Controllers/Admin/ReportController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Admin/ReportController.php#L64) dan [baris 125](file:///c:/laragon/www/insani-id/app/Http/Controllers/Admin/ReportController.php#L125)
  ```php
  $donations = $query->get();
  // ... kemudian di-stream via callback
  ```
- **Analisis Masalah:**
  Penggunaan `$query->get()` memuat seluruh record donasi sekaligus ke memori RAM PHP sebagai Eloquent Collection sebelum callback `response()->stream()` dijalankan. Di Hostinger Shared Hosting dengan batas `memory_limit = 512M`, jika staff mengekspor laporan tahunan berisi puluhan ribu baris transaksi, PHP akan mengalami fatal error `Allowed memory size exhausted`.
- **Rekomendasi Perbaikan:**
  Ubah pemanggilan `$donations = $query->get();` menjadi cursor streaming di dalam callback:
  ```php
  $callback = function () use ($query, $columns) {
      $file = fopen('php://output', 'w');
      fputcsv($file, $columns);
      foreach ($query->cursor() as $donation) {
          // Tulis baris CSV satu per satu tanpa membebani RAM
      }
      fclose($file);
  };
  ```

---

## 5. Analisis Penempatan Direktori & Ekspos Kredensial Publik

### 5.1 🔴 KRITIS: Kebocoran Meta CAPI Token via Inertia Shared Props
- **Lokasi Masalah:** [app/Http/Middleware/HandleInertiaRequests.php](file:///c:/laragon/www/insani-id/app/Http/Middleware/HandleInertiaRequests.php#L106-L108)
  ```php
  'siteSettings' => Cache::remember('site_settings_public', 3600, function () {
      return AppSetting::pluck('value', 'key')->toArray();
  }),
  ```
- **Tingkat Bahaya:** **KRITIS (High Severity Data Leak)**
- **Penjelasan Kerentanan:**
  Middleware ini mengambil **SELURUH baris data** dari tabel `app_settings` dan membagikannya ke props Inertia publik di setiap respon halaman HTML.
  Di dalam [SiteSettingController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Admin/SiteSettingController.php#L61), terdapat field:
  - `meta_capi_access_token` (Access Token Meta Conversions API)
  - `meta_capi_test_event_code`
  Jika admin memasukkan token Meta CAPI di menu Pengaturan Situs, token rahasia ini **OTOMATIS TERKIRIM KE BROWSER CLIENT** dalam atribut HTML:
  ```html
  <div id="app" data-page="{...siteSettings: {meta_capi_access_token: 'EAAOx...'}}"></div>
  ```
  Setiap pengunjung biasa dapat membuka *View Page Source* dan mencuri token API server-to-server Meta milik yayasan!
- **Solusi Wajib (Hotfix):**
  Lakukan filtering (whitelist) hanya untuk setting publik yang benar-benar dibutuhkan oleh frontend, atau blacklist key sensitif sebelum data dibagikan ke Inertia:
  ```php
  'siteSettings' => Cache::remember('site_settings_public', 3600, function () {
      $sensitiveKeys = ['meta_capi_access_token'];
      return AppSetting::whereNotIn('key', $sensitiveKeys)->pluck('value', 'key')->toArray();
  }),
  ```

---

### 5.2 Arsitektur Direktori Shared Hosting & Celah Root `.htaccess`
- **Tantangan Struktur Hostinger:**
  Secara default pada akun cPanel/hPanel Hostinger, folder dokumen web adalah `public_html/`. Banyak pengembang mengunggah seluruh folder proyek Laravel langsung ke dalam `public_html/`.
- **Celah Root `.htaccess` Bawaan Proyek:**
  File [.htaccess](file:///c:/laragon/www/insani-id/.htaccess) di root proyek saat ini hanya berisi:
  ```apache
  <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteRule ^(.*)$ public/$1 [L]
  </IfModule>
  ```
  Jika seluruh proyek ditaruh di `public_html/` dan Apache server mengalami kegagalan rewrite atau konfigurasi alias tertentu, file `.env`, folder `.git/`, file log `storage/logs/laravel.log`, dan konfigurasi `composer.json` berpotensi dapat diakses via browser (`https://insani.id/.env`).
- **Rekomendasi Arsitektur Terbaik di Hostinger:**
  1. **Opsi Rekomendasi 1 (Teraman):**
     Ubah direktori root domain di hPanel Hostinger:
     - Masuk ke **hPanel -> Websites -> Manage -> Dashboard -> General Settings / Advanced**.
     - Ubah **Document Root** domain dari `public_html` menjadi `public_html/public`.
     Dengan cara ini, file `.env`, `storage/`, dan `app/` berada di luar jangkauan web server secara fisik.
  2. **Opsi Rekomendasi 2 (Jika Document Root tidak bisa diubah):**
     Letakkan folder Laravel inti di luar `public_html` (misal: `/home/u123456789/insani-core/`), lalu salin seluruh isi folder `public/` ke dalam `public_html/`. Ubah path di `public_html/index.php` agar mengarah ke `../insani-core/`.
  3. **Opsi Rekomendasi 3 (Jika terpaksa menaruh semua di `public_html`):**
     Perbarui root `.htaccess` dengan aturan blokir absolut terhadap file dotfiles, log, git, dan environment (lihat bagian panduan di bawah).

---

### 5.3 Audit File Publik & Dokumen Privat (KTP & Bukti Transfer)
- **Status Audit Dokumen Privat:** **SANGAT AMAN ✅**
  - Berkas KTP dan dokumen legalitas campaigner (`verification_documents/`) disimpan pada disk `'local'` (`storage/app/private`).
  - Dokumen bukti pencairan dana (`disbursements/proofs`) disimpan pada disk `'local'`.
  - Berkas laporan pelanggaran program publik (`reports/`) disimpan pada disk `'local'`.
  - Dokumen-dokumen ini **TIDAK BISA** diakses langsung melalui URL publik `/storage/...`. File hanya bisa diunduh oleh pengguna terotorisasi melalui route bertanda tangan (*temporary signed URL*) atau controller yang dilindungi izin Spatie (`campaigner.verify` / `disbursement.view`).
- **Status Media Publik:**
  - Cover program (`programs/covers`), logo lembaga (`partners/`), dan banner publik disimpan di disk `'public'` yang memang ditujukan untuk konsumsi umum.

---

### 5.4 Audit File Dev Tercecer (`public/hot`)
- **Temuan:** Di dalam direktori `public/`, ditemukan file bernama `hot` berukuran 17 bytes yang berisi:
  ```text
  http://[::1]:5173
  ```
- **Tingkat Bahaya:** **Situs Akan Blank di Produksi jika Terunggah**
- **Penjelasan:**
  File ini dibuat secara otomatis oleh Vite saat perintah `npm run dev` berjalan di komputer lokal. Jika file `public/hot` ini ikut terunggah ke Hostinger, Laravel akan mengira server sedang dalam mode Vite Development dan mencoba memuat aset CSS/JS dari `http://[::1]:5173`. Akibatnya, tampilan situs produksi akan rusak total atau blank putih.
- **Tindakan Wajib:** Hapus file `public/hot` sebelum proses deployment ke Hostinger.

---

## 6. Daftar File yang Tidak Berkaitan & Rekomendasi Pembersihan (Dead Files)

Pemeriksaan mendalam menemukan beberapa file sisa pengembangan masa lalu yang tidak lagi digunakan dan sebaiknya dihapus dari repositori atau tidak disertakan dalam paket deployment:

| File / Folder | Ukuran | Alasan & Status | Tindakan |
|---|---|---|---|
| `resources/js/pages/welcome.tsx` | 42 KB | File landing page template bawaan starter kit. Homepage aktual menggunakan `Public/Home/Index.tsx`. | Hapus |
| `public/hot` | 17 bytes | Penanda Vite dev server lokal. Merusak produksi jika terbawa. | Hapus |
| `public/content/faq/faq-insani.md` | 4,2 KB | Draft FAQ statis lama tak terpakai (FAQ kini dikelola via database). | Hapus |
| `docs/bug-layout/` (6 file PNG) | ~410 KB | Screenshot debug tata letak visual lama (`bug-comment.png`, dll). | Hapus / Jangan upload |
| `docs/analisis-biaya-xendit-vs-midtrans.html` | 86 KB | Dokumen analisis biaya internal masa riset. | Jangan upload |
| `.claude/` & `.agents/` | Variatif | Folder internal asisten agent / AI coding lokal. | Jangan upload |
| `.env.backup`, `.phpunit.result.cache` | Variatif | File cache / backup lokal. | Masukkan `.gitignore` / Hapus |

---

## 7. Faktor Kesiapan Khusus Hostinger Shared Hosting (Unmentioned Factors)

### 7.1 Konfigurasi Trusted Proxies (Cloudflare & Reverse Proxy Hostinger)
- **Masalah:**
  Di [bootstrap/app.php](file:///c:/laragon/www/insani-id/bootstrap/app.php), belum terdapat konfigurasi `trustProxies`.
  Hostinger menggunakan web server bertingkat (Nginx Reverse Proxy / CloudLinux LiteSpeed Web ADC) dan umumnya situs menggunakan CDN Cloudflare. Tanpa konfigurasi ini:
  - `$request->ip()` akan mendeteksi IP internal proxy Hostinger (misal `172.x.x.x`), bukan IP asli donatur.
  - Rate limiting login dan Turnstile bot protection akan memblokir semua user karena dianggap berasal dari 1 IP yang sama.
  - Pembangkitan URL HTTPS bisa berantakan (*Mixed Content* atau *Too Many Redirects*).
- **Solusi di `bootstrap/app.php`:**
  ```php
  $middleware->trustProxies(at: '*');
  ```

---

### 7.2 Queue Worker Tanpa Supervisor (Drain via Cron)
- **Tantangan Shared Hosting:**
  Hostinger Shared Hosting tidak mengizinkan process manager seperti Supervisor / PM2 untuk menjalankan `php artisan queue:work` secara terus-menerus. CloudLinux LVE akan membunuh proses background yang berjalan lama.
- **Solusi yang Sudah Disiapkan Aplikasi:**
  Aplikasi Insani Indonesia sudah memiliki penanganan cerdas di [routes/console.php](file:///c:/laragon/www/insani-id/routes/console.php#L30-L32):
  ```php
  Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=2')
      ->everyMinute()
      ->withoutOverlapping();
  ```
- **Kunci Keberhasilan di Hostinger:**
  Mekanisme di atas **HANYA AKAN BERJALAN** jika satu Cron Job Master didaftarkan di menu **hPanel -> Advanced -> Cron Jobs**:
  ```bash
  * * * * * cd /home/u123456789/domains/insani.id/public_html && php artisan schedule:run >> /dev/null 2>&1
  ```
  Jika cron job ini lupa dipasang di hPanel, maka seluruh email kwitansi, notifikasi donasi, dan pembaruan berkala **TIDAK AKAN PERNAH TERKIRIM**.

---

### 7.3 Versi PHP CLI vs Web pada Cron Job Hostinger
- **Perangkap Umum:**
  Di Hostinger, meskipun versi PHP website telah diset ke **PHP 8.3** di hPanel, perintah CLI default `/usr/bin/php` pada cron job terkadang masih mengarah ke PHP 8.1 atau 8.2 server bawaan. Hal ini akan menyebabkan cron job gagal mengeksekusi Laravel 13 yang mensyaratkan PHP ^8.3.
- **Solusi Perintah Cron di Hostinger:**
  Gunakan path biner PHP 8.3 eksplisit dari Hostinger:
  ```bash
  * * * * * /usr/bin/php8.3 /home/u123456789/domains/insani.id/public_html/artisan schedule:run >> /dev/null 2>&1
  ```
  *(Atau `/opt/alt/php83/usr/bin/php` sesuai informasi path PHP di menu Advanced -> PHP Configuration).*

---

### 7.4 Inkonsistensi Port & Skema SMTP Hostinger (Port 465 vs 587)
- **Periksa `.env.production.example` baris 56-58:**
  ```env
  MAIL_SCHEME=tls
  MAIL_HOST=smtp.hostinger.com
  MAIL_PORT=465
  ```
- **Masalah:**
  Pada protokol email standar dan Symfony Mailer:
  - **Port 465** mewajibkan enkripsi **SSL/SMTPS** langsung saat koneksi dibuka.
  - **Port 587** menggunakan **STARTTLS**.
  Jika `MAIL_PORT=465` dipasangkan dengan `MAIL_SCHEME=tls`, koneksi email ke `smtp.hostinger.com` akan mengalami handshake mismatch dan berujung pada error *Connection timed out*.
- **Konfigurasi yang Benar untuk Hostinger SMTP:**
  **Opsi A (Port 465 - SSL):**
  ```env
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.hostinger.com
  MAIL_PORT=465
  MAIL_SCHEME=smtps
  ```
  **Opsi B (Port 587 - TLS):**
  ```env
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.hostinger.com
  MAIL_PORT=587
  MAIL_SCHEME=tls
  ```

---

### 7.5 Siklus Penyimpanan Backup DB di Shared Disk
- Di [routes/console.php](file:///c:/laragon/www/insani-id/routes/console.php#L15), terjadwal:
  ```php
  Schedule::command('backup:run --only-db')->dailyAt('01:00');
  Schedule::command('backup:clean')->dailyAt('01:30');
  ```
- **Catatan Penting di Hostinger:**
  1. Paket `spatie/laravel-backup` membutuhkan binary `mysqldump`. Pastikan Hostinger mengizinkan eksekusi `mysqldump` dari CLI.
  2. Backup disimpan di disk `'local'` (`storage/app/laravel-backup`). Pastikan ruang penyimpanan (disk quota) Hostinger diperiksa berkala agar tidak penuh oleh file arsip backup zip.

---

### 7.6 Bundling Frontend (Vite & Git Deployment Trap)
- **Perangkap Auto-Deploy Git Hostinger:**
  Hostinger Shared Hosting memiliki fitur Git Deployment via hPanel. Namun, container shared hosting **TIDAK MEMILIKI NODE.JS / NPM**.
  Di [.gitignore](file:///c:/laragon/www/insani-id/.gitignore#L4), direktori `/public/build` diabaikan oleh git.
  Jika developer melakukan `git push` lalu menekan `Deploy` di hPanel, folder `public/build` tidak akan ada di server! Situs akan melempar fatal error:
  `ViteException: Unable to locate file in Vite manifest: resources/js/app.tsx`.
- **Solusi Operasional:**
  - Sebelum deploy, jalankan `npm run build` di komputer lokal.
  - Unggah folder `public/build` secara manual via Hostinger File Manager / FTP, ATAU buat workflow GitHub Actions yang melakukan build aset dan mengunggahnya ke server via SSH/SFTP.

---

## 8. Panduan Langkah Demi Langkah & Checklist Pra-Deployment

### Checklist Tindakan Segera (Sebelum Upload)

- [ ] **Langkah 1: Perbaiki Kebocoran Meta CAPI Token di `HandleInertiaRequests.php`**
  Filter setting publik agar token rahasia tidak terkirim ke browser.
- [ ] **Langkah 2: Hapus Dead Route di `routes/settings.php`**
  Hapus baris `Route::inertia('settings/appearance', ...);`.
- [ ] **Langkah 3: Tambahkan Trusted Proxies di `bootstrap/app.php`**
  Tambahkan `$middleware->trustProxies(at: '*');`.
- [ ] **Langkah 4: Hapus File yang Tidak Berkaitan**
  - Hapus `resources/js/pages/welcome.tsx`
  - Hapus `public/hot`
  - Hapus `public/content/faq/faq-insani.md`
- [ ] **Langkah 5: Build Aset Frontend Produksi**
  Matikan dev server (`npm run dev`), lalu jalankan:
  ```bash
  npm run build
  ```
  Pastikan folder `public/build/manifest.json` dan file aset `.js` / `.css` tercipta.

---

### Checklist Konfigurasi di Hostinger hPanel

- [ ] **Langkah 6: Siapkan Database MySQL di hPanel**
  - Buat Database, Database User, dan Password baru di menu **Databases**.
  - Catat Database Name, Username, dan Password tersebut.
- [ ] **Langkah 7: Konfigurasi File `.env` Produksi**
  Salin template `.env.production.example` menjadi `.env` di server dan sesuaikan:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_URL=https://insani.id`
  - `DB_DATABASE=...`
  - `DB_USERNAME=...`
  - `DB_PASSWORD=...`
  - `SESSION_SECURE_COOKIE=true`
  - `MAIL_SCHEME=smtps` dan `MAIL_PORT=465` (atau `tls` / `587`)
  - Masukkan kredensial produksi Midtrans (`MIDTRANS_SERVER_KEY`, dll)
  - Masukkan kunci produksi Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`, dll)
- [ ] **Langkah 8: Jalankan Perintah Artisan Awal (via SSH Terminal Hostinger)**
  ```bash
  php artisan key:generate --force
  php artisan migrate --force
  php artisan db:seed --class=AppSettingSeeder --force
  php artisan storage:link
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```
- [ ] **Langkah 9: Pasang Cron Job Master di hPanel**
  Masuk ke menu **Advanced -> Cron Jobs**, pilih interval **Every Minute (`* * * * *`)**, dan masukkan perintah:
  ```bash
  /usr/bin/php8.3 /home/u123456789/domains/insani.id/public_html/artisan schedule:run >> /dev/null 2>&1
  ```
- [ ] **Langkah 10: Pengujian Verifikasi Pasca-Deploy (Smoke Test Live)**
  - Uji akses homepage (`https://insani.id/`) dan navigasi halaman program.
  - Lakukan 1 transaksi donasi donatur anonim menggunakan QRIS Midtrans produksi nominal Rp 10.000 (cek webhook & update status otomatis).
  - Lakukan 1 donasi transfer manual bank BSI/BRI (cek generator kode unik & notifikasi).
  - Buka Inspect Element / View Page Source pada homepage, pastikan tidak ada teks token Meta CAPI atau kunci rahasia yang bocor.
  - Periksa file log di `storage/logs/laravel-*.log`, pastikan tidak ada error exception yang muncul.

---
*Laporan ini disimpan di folder `docs/AUDIT_DAN_QA_PRE_DEPLOYMENT_HOSTINGER.md` sebagai acuan resmi standar deployment Insani Indonesia ke Hostinger Shared Hosting.*
