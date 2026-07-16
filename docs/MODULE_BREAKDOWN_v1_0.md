# MODULE BREAKDOWN — Galang Dana Insani Indonesia (GDII)

**Development Roadmap & Module Breakdown**
**Version:** 1.1 (Synced with PRD v1.1, ERD v1.1, DB Dict v1.1)
**Mengacu pada:** PRD_v1_0.md (v1.1), ERD_v1_0.md (v1.1), DATABASE_DICTIONARY_v1_0.md (v1.1), API_SPEC_v1_0.md
**Stack:** Laravel 13, Inertia.js, React 18, Tailwind CSS (TailAdmin v2.3), Spatie Permission, Spatie Activitylog, Spatie Translatable, MySQL 8, Xendit

---

# Development Strategy

```text
Foundation (Auth, RBAC, i18n, Layout)
    ↓
Master Data (Category)
    ↓
Campaigner & Verification (Individu, Lembaga)
    ↓
Program Management (internal & eksternal)
    ↓
Donation & Payment (Xendit)
    ↓
Disbursement (Pencairan Dana)
    ↓
Engagement (Program Update, Comment)
    ↓
Reports
    ↓
Settings & Halaman Profil Lembaga
    ↓
Hardening (Audit Log, Security, Testing)
    ↓
Deployment & Cutover DNS
```

Setiap phase harus selesai dan lolos testing sebelum melanjutkan ke phase berikutnya. Berbeda dari proyek lain, phase terakhir di sini bukan cuma "hardening" tapi juga **strategi cutover domain**, karena `insani.id` saat ini masih dilayani WordPress dan harus dipindah-tangankan dengan hati-hati (lihat Phase 9).

---

# PHASE 0 — PRA-DEVELOPMENT (Persiapan Infrastruktur)

## Module 0.1 Environment & Domain Sementara

**Deliverables:**
- Provisioning server (staging) — **bukan** langsung di `insani.id`, karena domain tersebut masih dilayani WordPress untuk halaman company profile
- Domain staging sementara (mis. subdomain internal/testing) untuk seluruh siklus development sampai siap cutover
- Setup CI/CD dasar, `.env` terpisah untuk staging vs production
- Registrasi akun **Xendit** (sandbox dulu, produksi menyusul), akun **Fonnte/Wablas**

**Acceptance Criteria:**
- Aplikasi Laravel kosong bisa diakses di domain staging
- Xendit sandbox bisa membuat Invoice test

---

# PHASE 1 — FOUNDATION

## Module 1.1 Authentication

**Deliverables:** Login Page (satu sistem untuk semua tipe user), Logout, Session Authentication, Remember Me, Middleware Auth, Redirect kondisional (`/admin/dashboard` vs `/akun`), **Lupa Password (Reset via Email token)**

**Database:** `users`

**Pages:** `Public/Auth/Login.jsx`

**Controllers:** `AuthController`

**Routes:**
```php
GET  /login
POST /login
POST /logout
GET  /register
POST /register
```

**Acceptance Criteria:**
- User dapat login dan logout
- Redirect setelah login sesuai role (staff internal → `/admin/dashboard`, lainnya → `/akun`)
- Guest tidak bisa mengakses `/admin/*`

---

## Module 1.2 RBAC (Spatie Permission)

**Roles:** Administrator, Program Officer, Verifikator, Keuangan, CS (internal) — Campaigner Individu, Campaigner Lembaga, Donatur (eksternal, implisit lewat kepemilikan data, bukan permission dashboard)

**Deliverables:**
- Permission Seeder (daftar lengkap — lihat PRD v1.0 Section 6.2)
- Role Seeder (mapping role → permission sesuai PRD v1.0 Section 6.2)
- Permission Middleware (`permission:module.action`)
- Middleware custom `campaigner.verified` (cek `campaigner_profiles.verification_status`)

**Acceptance Criteria:**
- Menu sesuai permission user yang login
- Route ditolak (403) jika user tidak punya permission terkait
- User dengan `campaigner_profiles.verification_status != verified` tidak bisa akses `/buat-program`

---

## Module 1.3 Internationalization (i18n) Foundation

> **Modul baru, tidak ada padanan langsung di proyek lain** — karena keputusan multi-bahasa (ID/AR/EN + RTL) masuk MVP sejak awal.

**Deliverables:**
- Install & konfigurasi `spatie/laravel-translatable` + `mcamara/laravel-localization`
- Middleware locale (`localeSessionRedirect`, `localizationRedirect`, `localeViewPath`)
- Komponen `LanguageSwitcher.jsx` di `PublicLayout`
- Setup `dir="rtl"` otomatis saat locale `ar` + integrasi font Arab (Noto Naskh Arabic/Cairo)
- `config/translatable.php` — set `fallback_locale => 'id'`

**Acceptance Criteria:**
- URL `/id/...`, `/ar/...`, `/en/...` menghasilkan halaman dengan locale benar
- Locale `ar` menghasilkan layout RTL penuh (teks, ikon navigasi, padding terbalik)
- Field translatable yang kosong di `ar`/`en` fallback otomatis ke `id`

---

## Module 1.4 Layout (AdminLayout & PublicLayout)

**Deliverables:**
- `AdminLayout.jsx` — TailAdmin v2.3, sidebar dinamis berdasarkan permission
- `PublicLayout.jsx` — 1 shell dipakai kedua "keluarga" komponen (Program & Profile, lihat PRD v1.0 Section 11), header/footer/nav/language switcher konsisten, mobile-first dengan bottom navigation bar
- Placeholder folder `Components/Public/Profile/` (disiapkan untuk phase CMS company profile, tidak diisi penuh di modul ini)

**Pages:**
```text
Layouts/AdminLayout.jsx
Layouts/PublicLayout.jsx
```

**Acceptance Criteria:**
- Seluruh halaman internal menggunakan `AdminLayout`, seluruh halaman publik menggunakan `PublicLayout`
- `PublicLayout` responsif dari 360px sampai desktop, dengan bottom nav hanya muncul di breakpoint mobile
- Tidak ada custom layout di luar `AdminLayout`/`PublicLayout`

---

## Module 1.5 SEO & Open Graph Foundation

**Deliverables:**
- Setup komponen `<Head>` (Inertia/React) yang reusable untuk dynamic meta tags per halaman publik
- Integrasi meta tags Open Graph (Facebook/WA/Twitter)
- Setup canonical URL dan hreflang meta tags untuk multi-bahasa

**Acceptance Criteria:**
- Saat link halaman program disalin ke WhatsApp/Facebook, akan muncul preview judul, deskripsi, dan cover image yang benar.
- View source halaman publik memuat tag hreflang ID/AR/EN dengan benar.

---

# PHASE 2 — MASTER DATA

## Module 2.1 User Management (Staff Internal)

**Permissions:** `user.view`, `user.create`, `user.update`, `user.delete`

**Pages:** `Admin/Users/Index.jsx`, `Admin/Users/Create.jsx`, `Admin/Users/Edit.jsx`

**Deliverables:** CRUD User staff internal, Assign Role

---

## Module 2.2 Category Management

**Database:** `categories`

**Deliverables:** CRUD Kategori dengan tab bahasa (ID/AR/EN) untuk `name`/`description`, field `platform_fee_percent`, toggle `is_disaster_category`, upload ikon

**Pages:** `Admin/Categories/Index.jsx`

**Seed Data Wajib:** Bencana Alam (fee 0%), Kesehatan, Pendidikan, Pemberdayaan, Yatim, Kemanusiaan (fee 5%) — lihat DATABASE_DICTIONARY v1.0 Section 3.1

**Dependency:** Harus selesai sebelum Module 3.x (Program), karena `programs.category_id` adalah FK wajib.

---

# PHASE 3 — CAMPAIGNER & VERIFICATION

## Module 3.1 Pendaftaran Campaigner (Publik)

**Database:** `campaigner_profiles`, `verification_documents`

**Deliverables:**
- Form pendaftaran campaigner (pilih tipe Individu/Lembaga, field berbeda sesuai tipe)
- Upload dokumen verifikasi bertahap
- Validasi khusus lembaga: `bank_account_name` tidak boleh sama dengan nama pribadi PIC + checkbox pernyataan rekening atas nama lembaga

**Pages:** `Public/CampaignerRegistration/Create.jsx`, `Public/Verification/Index.jsx`

---

## Module 3.2 Verifikasi Campaigner (Internal)

**Permissions:** `campaigner.view`, `campaigner.verify`, `campaigner.reject`, `campaigner.suspend`

**Deliverables:** Review dokumen satu per satu, approve/reject dengan catatan wajib, suspend campaigner bermasalah

**Pages:** `Admin/Campaigners/Index.jsx`, `Admin/Campaigners/Show.jsx`

**Business Rule:** `verify` hanya bisa diproses jika dokumen wajib sesuai tipe (individu: KTP+Selfie; lembaga: KTP+Selfie+SK Yayasan+NPWP+Buku Rekening) sudah lengkap.

**Dependency:** Module 3.1 harus ada dulu (butuh data campaigner untuk direview).

---

# PHASE 4 — PROGRAM (CAMPAIGN) MANAGEMENT

## Module 4.1 Program Internal (Program Officer)

**Database:** `programs`, `program_galleries`, `program_documents`

**Deliverables:**
- Create/Edit Program dengan tab bahasa (ID/AR/EN) untuk `title`/`story` — wajib 3 bahasa untuk konten internal
- Upload galeri foto/video, dokumen pendukung
- Program langsung `published` tanpa antrian verifikasi (skip `pending_verification`)

**Pages:** `Admin/Programs/Create.jsx`, `Admin/Programs/Index.jsx`, `Admin/Programs/Show.jsx`

**Dependency:** Module 2.2 (Category) dan Module 1.3 (i18n Foundation) harus selesai dulu.

---

## Module 4.2 Program Eksternal (Campaigner Individu/Lembaga)

**Deliverables:**
- Form `/buat-program` — hanya bisa diakses campaigner `verified` (middleware `campaigner.verified`)
- Form hanya 1 field bahasa (Indonesia) untuk `title`/`story` — **tidak** ada tab 3 bahasa seperti form internal
- Submit otomatis set `status = pending_verification`
- Edit program milik sendiri (`program.update-own`), hanya saat status `draft`/`rejected`

**Pages:** `Public/Program/Create.jsx`, `Public/Akun/Program/Edit.jsx`

**Dependency:** Module 3.1 & 3.2 (campaigner harus `verified` dulu).

---

## Module 4.3 Verifikasi & Publikasi Program (Internal)

**Permissions:** `program.publish`, `program.reject`, `program.close`

**Deliverables:** Review konten program eksternal, approve (publish)/reject dengan catatan wajib, deteksi otomatis + manual review larangan rekening pribadi di deskripsi

**Pages:** `Admin/Programs/Index.jsx` (tab: Semua / Menunggu Verifikasi / Aktif / Ditolak / Selesai)

**Dependency:** Module 4.2 harus ada dulu (butuh data program untuk direview).

---

## Module 4.4 Listing & Pencarian Program (Publik)

**Deliverables:**
- Listing program dengan filter kategori (ikon simbol) + sorting Terbaru/Terlama/Terbanyak Terkumpul
- Card program: foto besar, progress bar, badge kategori, indikator "∞" untuk tanpa batas waktu, avatar cluster donatur
- Pagination "Load More"

**Pages:** `Public/Program/Index.jsx`, `Public/Program/Show.jsx` (tab: Cerita/Kabar Terbaru/Donatur, tombol donasi sticky di mobile)

**Dependency:** Module 4.1 & 4.3 (butuh program yang sudah `published` untuk ditampilkan).

---

## Module 4.5 Automasi Status Program

**Database:** `programs`, `donations`, `payments`

**Deliverables:**
- **Model Observer** pada `Payment`: otomatis update `programs.status = completed` jika `collected_amount >= target_amount` dan program memiliki target.
- **Laravel Scheduler** (Console Command): cron job harian untuk mengecek semua program yang `status = published` dan `deadline` sudah lewat (sekarang > deadline). Ubah status menjadi `completed`.

**Dependency:** Module 4.x & 5.x.

---

# PHASE 5 — DONATION & PAYMENT

## Module 5.1 Integrasi Xendit

**Deliverables:**
- Setup Xendit Invoice API (sandbox → production)
- Service class `XenditPaymentService` (create invoice, handle response)
- Webhook endpoint `/webhooks/xendit` + middleware `verify.xendit-callback-token`
- **Dikecualikan dari CSRF protection** (lihat API_SPEC v1.0 Section 18)

**Database:** `donations`, `payments`

**Acceptance Criteria:**
- Invoice test berhasil dibuat & status ter-update otomatis via webhook sandbox
- Webhook tanpa token valid ditolak (403)

---

## Module 5.2 Alur Donasi (Publik)

**Deliverables:**
- Form donasi (nominal preset + custom, minimal Rp 10.000, pesan/doa, opsi anonim, guest checkout)
- Redirect ke halaman pembayaran hosted Xendit
- Halaman polling status donasi (`/donasi/{donationCode}/status`)
- Alur transfer manual: generate kode unik 3 digit, halaman instruksi

**Pages:** `Public/Program/Donate.jsx` (bagian dari `Program/Show.jsx`), `Public/Donation/Status.jsx`

**Dependency:** Module 5.1 (Xendit) dan Module 4.4 (program harus sudah bisa ditampilkan).

---

## Module 5.3 Manajemen Donasi (Internal)

**Permissions:** `donation.view`, `donation.create`, `donation.confirm-manual`, `donation.refund`

**Deliverables:**
- Input donasi offline manual (status langsung `paid`, tidak lewat Xendit)
- Konfirmasi manual transfer bank (cek mutasi + kode unik, ubah status `pending` → `paid`)
- Refund (hanya bisa jika belum ada `disbursements.status = processed` terkait)

**Pages:** `Admin/Donations/Index.jsx`

**Implementation note:** Observer pada `Payment` untuk update `donations.status` dan recalculate `programs.collected_amount` otomatis.

---

## Module 5.4 Notifikasi WhatsApp & Email

**Database:** `notification_logs`

**Deliverables:**
- Setup SMTP Mail driver (konfigurasi Hostinger)
- Setup Fonnte/Wablas API + Laravel package
- Service interface `NotificationGatewayService` (menangani WhatsApp & Email)
- Trigger 7 jenis email transaksional (e-kuitansi, welcome, verifikasi, reset password, status update, dll.) sesuai PRD v1.1 Section 7.5
- Trigger WhatsApp untuk notifikasi kunci: konfirmasi donasi berhasil, reminder Update Program pasca-pencairan

**Dependency:** Module 5.2 (butuh event donasi `paid` sebagai trigger pertama).

---

# PHASE 6 — DISBURSEMENT

## Module 6.1 Pengajuan Pencairan (Campaigner)

**Database:** `disbursements`

**Deliverables:** Form pengajuan pencairan dari dashboard campaigner (`/akun/program/{program}/disbursements`)

**Pages:** `Public/Akun/Disbursement/Create.jsx`

---

## Module 6.2 Approval & Proses Pencairan (Internal — Keuangan)

**Permissions:** `disbursement.view`, `disbursement.approve`, `disbursement.create` (proses)

**Deliverables:**
- Snapshot otomatis `platform_fee_percent` (dari kategori, atau `0.00` untuk internal/bencana alam) dan `bank_account_snapshot`
- Single approval oleh role Keuangan
- Setup logic Scheduler untuk **Reminder otomatis** (dikirim hari ke-7, 14, 21 pasca-pencairan) ke campaigner untuk posting Update Program

**Pages:** `Admin/Disbursements/Index.jsx`

**Dependency:** Module 6.1, dan Module 5.x (butuh `programs.collected_amount` akurat).

---

# PHASE 7 — ENGAGEMENT

## Module 7.1 Program Update ("Kabar Terbaru")

**Database:** `program_updates`

**Deliverables:** Posting update dari campaigner (dashboard sendiri) maupun Program Officer (program internal), tampil di tab "Kabar Terbaru" halaman program

**Pages:** `Public/Akun/Program/Updates.jsx`, `Admin/Programs/Updates.jsx`

---

## Module 7.2 Komentar & Doa

**Database:** `comments`

**Deliverables:** Form komentar di halaman program (guest boleh, jika terhubung donasi), moderasi (hide) oleh CS

**Pages:** Terintegrasi di `Public/Program/Show.jsx` (tab Donatur), `Admin/Comments` (moderasi)

---

# PHASE 8 — REPORTS & SETTINGS

## Module 8.1 Laporan (Internal Only)

**Permission:** `report.view`

**Deliverables:** Laporan Donasi, Pencairan, Campaigner — export PDF & Excel

**Pages:** `Admin/Reports/*.jsx`

---

## Module 8.2 Settings & Halaman Profil Lembaga

**Database:** `app_settings`

**Deliverables:**
- Form pengaturan platform (`nama_platform` = brand "Insani Indonesia", `min_donation_amount`, dll)
- Form konten Tentang Kami dengan tab bahasa (Visi, Misi, Legalitas — termasuk `nama_legal` = "Yayasan Peduli Insani Indonesia", khusus ditampilkan di halaman ini)
- Halaman publik `/tentang-kami`

**Pages:** `Admin/Settings/Index.jsx`, `Public/About/Index.jsx`

**Business Rule:** `platform.nama_platform` (brand) tidak boleh tertukar dengan `about.nama_legal` (nama badan hukum) — lihat PRD v1.0 Section 11.1.

---

# PHASE 9 — HARDENING & DEPLOYMENT

## Module 9.0 Backup Database

**Package:** `spatie/laravel-backup`

**Deliverables:**
```bash
composer require spatie/laravel-backup
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```
- Konfigurasi `config/backup.php`: cakupan **database saja** (exclude file storage untuk MVP), destinasi disk sesuai infrastruktur hosting final (lokal/S3/Google Drive)
- Jadwal harian via Laravel Scheduler (`php artisan schedule:run` terpasang di cron server)
- Retensi 7–30 hari (`retention_policy` di config, dikonfirmasi jumlah pasti saat setup hosting)
- Notifikasi email ke Administrator saat backup gagal (fitur bawaan package)
- Halaman `Admin/Settings/Backups.jsx` — daftar riwayat backup + tombol download manual (Administrator only)

**Acceptance Criteria:**
- Backup harian berjalan otomatis tanpa intervensi manual
- Simulasi kegagalan backup (mis. disk penuh) memicu notifikasi email ke Administrator
- File backup lebih lama dari retensi terhapus otomatis
- Administrator bisa melihat riwayat & download backup manual dari `/admin/settings/backups`

**Dependency:** Sebaiknya disiapkan **di awal** (idealnya sejak Phase 0/1), bukan ditunda sampai akhir — supaya data yang di-input sejak awal development/testing produksi sudah terlindungi. Ditempatkan di Phase 9 di sini hanya karena mengikuti pola dokumentasi "hardening", bukan berarti implementasinya harus menunggu phase lain selesai.

---

## Module 9.1 Audit Log

**Package:** `spatie/laravel-activitylog`

**Deliverables:**
```bash
composer require spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
php artisan migrate
```
- Trait `LogsActivity` pada: `Program`, `Donation`, `Payment`, `Disbursement`, `CampaignerProfile`, `User`
- Halaman viewer Activity Log (Administrator only)

---

## Module 9.2 Security

**Deliverables:**
- Authorization Policy per model (terutama `program.update-own`, kepemilikan campaigner)
- Form Request Validation lengkap (verifikasi dokumen, larangan rekening pribadi, capacity donasi minimum)
- Webhook signature verification (`X-CALLBACK-TOKEN` Xendit)
- Rate limiting: `/donasi`, `/program/{slug}/comments`, `/daftar-campaigner`
- CSRF Protection (dikecualikan khusus route webhook)

---

## Module 9.3 Testing

**Deliverables:** Feature Test, Unit Test

**Coverage Target:** Minimum 80%

**Test wajib mencakup:**
- Validasi verifikasi bertingkat (dokumen wajib per tipe campaigner)
- Validasi larangan rekening pribadi untuk lembaga
- Auto-create folio charge (`program_updates` wajib pasca-pencairan) — reminder logic
- Auto-update `programs.collected_amount` saat payment baru dibuat
- Fallback locale (konten kosong di `ar`/`en` jatuh ke `id`)
- Permission gate per role
- Webhook Xendit — token invalid ditolak, token valid diproses benar

---

## Module 9.4 Strategi Deployment & Cutover Domain

> **Modul unik proyek ini** — karena `insani.id` saat ini masih dilayani WordPress, dan modul Galang Dana dirilis **lebih dulu** dari rebuild CMS company profile (lihat PRD v1.0 Section 11.1).

**Deliverables:**
- Finalisasi seluruh route path-based (`insani.id/galang-dana`, `insani.id/program/{slug}`, dst.) sesuai API_SPEC v1.0
- Rencana coexistence sementara: halaman company profile (Tentang, Fokus Program, Kabar) **tetap dilayani WordPress** selama masa transisi — didefinisikan mekanismenya (reverse proxy path-based di level webserver/DNS, atau link keluar sementara ke domain WordPress lama) sebelum cutover
- Migrasi DNS `insani.id` ke server Laravel baru, dengan rollback plan jika terjadi masalah kritis
- Setup 301 redirect dari URL lama WordPress Galang Dana (`/galang-dana-id/`, `/galang-dana/{slug}/`) ke struktur URL baru, untuk menjaga SEO/tautan yang sudah beredar
- Update webhook Xendit ke URL produksi final (`https://insani.id/webhooks/xendit`)

**Acceptance Criteria:**
- Halaman Galang Dana bisa diakses penuh di `insani.id` produksi
- Halaman company profile lama (WordPress) tetap bisa diakses selama masa transisi tanpa downtime
- Tidak ada broken link dari URL lama yang sudah ter-index Google

---

## Module 9.5 Setup Queue Worker & Scheduler (Hostinger)

**Konteks:** Hosting Hostinger shared tidak support Redis dan daemon supervisor.

**Deliverables:**
- Siapkan script/command khusus untuk dijalankan di Cron Job Hostinger setiap menit (Scheduler):
  `* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1`
- Siapkan script/command untuk Queue worker (yang akan memproses antrian database):
  `* * * * * cd /path/to/project && php artisan queue:work --stop-when-empty >> /dev/null 2>&1`
- Ini memastikan bahwa proses background seperti webhook Xendit, pengiriman email/WA, dan recalculation tetap berjalan.

---

# DEVELOPMENT ORDER (FINAL)

Claude Code / developer **HARUS** mengikuti urutan berikut:

```text
00 Environment & Domain Sementara (staging, akun Xendit/Fonnte)

01 Authentication (+ Lupa Password)
02 RBAC (Permission Seeder + Role Seeder)
03 Internationalization Foundation (ID/AR/EN + RTL)
04 Layout (AdminLayout TailAdmin + PublicLayout mobile-first)
05 SEO & Open Graph Foundation

06 User Management (staff internal)
07 Category Management (+ platform_fee_percent, seed Bencana Alam 0%)

08 Pendaftaran Campaigner (Individu/Lembaga)
09 Verifikasi Campaigner (Internal)

10 Program Internal (Program Officer, 3 bahasa, skip verifikasi)
11 Program Eksternal (Campaigner, 1 bahasa, wajib verifikasi)
12 Verifikasi & Publikasi Program (Internal)
13 Listing & Pencarian Program (Publik)
14 Automasi Status Program (Observer & Scheduler)

15 Integrasi Xendit (sandbox → production)
16 Alur Donasi (online + transfer manual)
17 Manajemen Donasi (Internal — konfirmasi manual, refund)
18 Notifikasi WhatsApp & Email (SMTP)

19 Pengajuan Pencairan (Campaigner)
20 Approval & Proses Pencairan (Keuangan) + Scheduler Reminder

21 Program Update ("Kabar Terbaru")
22 Komentar & Doa

23 Laporan (Internal)
24 Settings & Halaman Profil Lembaga

25 Backup Database Harian (sebaiknya disiapkan lebih awal, lihat catatan Module 9.0)
26 Audit Log (package, bukan tabel manual)
27 Security
28 Setup Queue Worker & Scheduler (Hostinger)
29 Testing

30 Strategi Deployment & Cutover Domain (staging → insani.id produksi)
```

---

# Definition of Done (DoD)

Sebuah module dianggap selesai apabila:

- [ ] Migration selesai dan sesuai DATABASE_DICTIONARY v1.0 (nama tabel & kolom persis, termasuk kolom JSON translatable, `locale` di `app_settings`)
- [ ] Model selesai, termasuk relasi yang benar dan trait `HasTranslations` untuk model translatable
- [ ] Seeder selesai (termasuk Permission & Role Seeder, seed kategori dengan fee yang benar)
- [ ] Controller selesai (dipisah `Admin/` dan `Public/` sesuai API_SPEC v1.0)
- [ ] Service selesai (terutama business rule: validasi bentrok verifikasi, auto-charge, auto-update cache, integrasi Xendit/WhatsApp)
- [ ] Form Request validation selesai (termasuk validasi khusus per-locale untuk konten internal)
- [ ] Permission middleware terpasang sesuai PRD v1.0 Section 6.2
- [ ] Inertia Page selesai, memakai `AdminLayout` atau `PublicLayout` yang sesuai
- [ ] UI mengikuti standar TailAdmin v2.3 (internal) atau mobile-first custom (publik) sesuai PRD v1.0 Section 4 & 9
- [ ] Untuk halaman publik: berfungsi benar di ketiga locale (ID/AR/EN), termasuk RTL untuk Arab
- [ ] Testing berhasil
- [ ] Tidak ada error pada build

```bash
php artisan test
npm run build
```

Harus sukses tanpa error sebelum lanjut ke module berikutnya.
