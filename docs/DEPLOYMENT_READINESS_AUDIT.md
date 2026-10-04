# 🔍 Laporan Audit Kesiapan Deployment — Insani Indonesia

**Platform Target:** Hostinger Business Shared Hosting
**Tanggal Audit:** 3 Oktober 2026
**Versi Aplikasi:** Laravel 13 + Inertia.js v3 + React
**PHP:** ^8.3 | **Database:** MySQL

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Keamanan Autentikasi (Auth)](#2-keamanan-autentikasi-auth)
3. [Alur Donasi & Payment Gateway](#3-alur-donasi--payment-gateway)
4. [Lokasi Penyimpanan Kredensial](#4-lokasi-penyimpanan-kredensial)
5. [Fitur Analitik](#5-fitur-analitik)
6. [Analisis Error (403, 404, 500, 503)](#6-analisis-error-403-404-500-503)
7. [Analisis Query & Beban Server](#7-analisis-query--beban-server)
8. [Simulasi Beban Donasi (5K, 10K, 50K)](#8-simulasi-beban-donasi-5k-10k-50k)
9. [Audit Fitur Lainnya](#9-audit-fitur-lainnya)
10. [Checklist Deployment Hostinger](#10-checklist-deployment-hostinger)
11. [Rekomendasi Prioritas Perbaikan](#11-rekomendasi-prioritas-perbaikan)

---

## 1. Ringkasan Eksekutif

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Arsitektur & Struktur | ✅ Baik | Mengikuti konvensi Laravel, role-based, observer pattern |
| Keamanan Auth | ⚠️ Perlu Perbaikan Kecil | Fortify + Turnstile bagus, namun 2FA tidak aktif |
| Payment Gateway (Midtrans) | ✅ Siap | SHA-512 signature verification, error handling lengkap |
| Payment Gateway (Xendit) | ⚠️ Legacy | Sudah deprecated di konfigurasi, masih ada kode fallback |
| Kredensial | 🔴 KRITIS | `.env` development berisi password email plaintext |
| Analytics | ⚠️ Risiko Performa | Tabel analytics tumbuh cepat tanpa pruning otomatis yang terjadwal |
| Error Handling | ⚠️ Parsial | 419 handled, tapi 403/404/500/503 custom pages belum tervalidasi |
| Query Performance | ⚠️ Perlu Optimasi | Dashboard controller 20+ query tanpa caching |
| Load 50K Donasi | 🔴 Tidak Memadai | Shared hosting tidak mampu menangani spike 50K concurrent |
| Deployment Config | ✅ Disiapkan | `.env.production.example` dan `.htaccess` sudah ada |

**Verdict:** Aplikasi **siap deploy untuk skala kecil-menengah** (100-500 donasi/hari) dengan catatan perbaikan kritis pada beberapa area di bawah.

---

## 2. Keamanan Autentikasi (Auth)

### 2.1 Yang Sudah Baik ✅

| Fitur | Detail |
|-------|--------|
| **Laravel Fortify** | Backend auth lengkap: login, register, reset password, email verification |
| **Cloudflare Turnstile** | Captcha di login (`CustomLoginRequest`) dan register (`CreateNewUser`) — anti bot |
| **Bcrypt Rounds 12** | Standar industri, cukup kuat untuk brute-force resistance |
| **Password Hashing** | `'password' => 'hashed'` cast otomatis di User model |
| **Email Verification** | `MustVerifyEmail` interface di User model |
| **Forced Password Change** | Middleware `force.password.change` + route `/force-password-change` |
| **Role-Based Access** | Spatie Permission: 8+ roles (Administrator, Program Officer, Verifikator, Keuangan, dll) |
| **Permission-Based Routes** | Semua admin routes dilindungi middleware `permission:xxx` |
| **Account Deactivation** | `is_active` field — deactivated user tidak bisa reset password / verifikasi email |
| **CSRF Protection** | Global, kecuali webhook & analytics endpoints (benar) |
| **Session Security** | Database driver, JSON serialization (aman dari gadget chain attack) |
| **Security Headers** | `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` |
| **Soft Delete** | User model menggunakan SoftDeletes |
| **Activity Logging** | Spatie ActivityLog di User, Donation, Payment, Program |

### 2.2 Temuan & Risiko ⚠️

| # | Temuan | Severity | Dampak |
|---|--------|----------|--------|
| A1 | **2FA (Two-Factor Auth) tidak diaktifkan** — `Features::twoFactorAuthentication()` tidak ada di `config/fortify.php` | MEDIUM | Admin/staff account rentan jika password bocor |
| A2 | **Session `SESSION_ENCRYPT=false`** di development — production example sudah `true` ✅ | LOW | Sudah ditangani di `.env.production.example` |
| A3 | **Login throttle menggunakan default Fortify** (5 attempts/minute) | LOW | Sudah cukup, tapi bisa diperketat untuk admin |
| A4 | **Tidak ada IP whitelist untuk admin panel** | LOW | Admin panel hanya dilindungi role, bukan IP |
| A5 | **Cookie `utm_*` tidak dienkripsi** (di `encryptCookies except`) | LOW | Data UTM bukan sensitif, tapi bisa dimanipulasi |
| A6 | **Password reset tanpa Turnstile** — `CustomSendPasswordResetLinkRequest` belum diverifikasi apakah ada Turnstile | MEDIUM | Bisa digunakan untuk email flooding |

### 2.3 Rekomendasi Auth

```
PRIORITAS TINGGI:
1. Aktifkan 2FA minimal untuk role Administrator & Keuangan
2. Tambahkan Turnstile ke form forgot password

PRIORITAS MENENGAH:
3. Pertimbangkan IP rate limiting yang lebih agresif untuk /login
4. Tambahkan audit log untuk login failures
```

---

## 3. Alur Donasi & Payment Gateway

### 3.1 Arsitektur Alur Donasi

```
┌──────────────────────────────────────────────────────────────────────┐
│                        ALUR DONASI LENGKAP                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Halaman Program] ──→ [Form Donasi] ──→ [StoreDonationRequest]     │
│        │                     │                    │                   │
│        │               (Validasi)          (Turnstile? NO ⚠️)        │
│        │                     │                    │                   │
│        │                     ▼                    │                   │
│        │           ┌──────────────────┐           │                   │
│        │           │ DonationController│           │                   │
│        │           │    ::store()     │           │                   │
│        │           └────────┬─────────┘           │                   │
│        │                    │                     │                   │
│        │         ┌──────────┴──────────┐          │                   │
│        │         ▼                     ▼          │                   │
│        │   [Online Channel]     [Offline Channel] │                   │
│        │         │                     │          │                   │
│        │    ┌────┴────┐          [Manual Bank]    │                   │
│        │    ▼         ▼               │          │                   │
│        │ [Midtrans] [Xendit*]    [Payment row]   │                   │
│        │    │      (fallback)         │          │                   │
│        │    ▼                         ▼          │                   │
│        │ [Charge API] ──→ [Payment row created]  │                   │
│        │    │                         │          │                   │
│        │    ▼                         │          │                   │
│        │ [Status Page] ◄──────────────┘          │                   │
│        │    │                                    │                   │
│        │    ▼                                    │                   │
│        │ [Webhook] ──→ [PaymentObserver::updated]│                   │
│        │                   │                     │                   │
│        │    ┌──────────────┼──────────────┐      │                   │
│        │    ▼              ▼              ▼      │                   │
│        │ [Donation    [Comment       [Program     │                   │
│        │  → paid]     Tab Donatur]   collected    │                   │
│        │    │                        amount++]    │                   │
│        │    ▼                                    │                   │
│        │ [SendDonationPaidNotification Job]       │                   │
│        │    │                                    │                   │
│        │    ├── Email Donatur (Kwitansi)          │                   │
│        │    ├── WhatsApp Donatur                 │                   │
│        │    ├── Email Campaigner                 │                   │
│        │    ├── WA Campaigner                    │                   │
│        │    └── DB Notification Staff            │                   │
│        │                                         │                   │
│  * Xendit = legacy/deprecated fallback           │                   │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Keamanan Payment — Yang Sudah Baik ✅

| Aspek | Implementasi |
|-------|-------------|
| **Midtrans Signature** | SHA-512 hash `(order_id + status_code + gross_amount + server_key)` — verifikasi kriptografis ✅ |
| **Xendit Callback Token** | Middleware `VerifyXenditCallbackToken` dengan `hash_equals()` — timing-safe ✅ |
| **CSRF exclusion tepat** | Hanya `webhooks/*` dan `analytics/*` yang di-exclude |
| **Rate limiting webhook** | `throttle:120,1` — 120 req/menit per IP ✅ |
| **Rate limiting donasi** | `throttle:15,1` — 15 donasi/menit per IP ✅ |
| **Input sanitization** | `prepareForValidation()` strip tags, script removal |
| **Honeypot field** | `website_url` prohibited — anti-spam sederhana tapi efektif |
| **Profanity filter** | `NoProfanityRule` dan `NoUrlRule` di donor_name dan message |
| **Min/max amount validation** | Per-channel basis dari konfigurasi channel |
| **DB Transaction** | `lockForUpdate()` di `PaymentObserver` mencegah race condition |
| **Idempotent webhook** | `firstOrCreate` untuk Comment, dan cek `$donation->status !== 'paid'` |
| **Signed URL** | Bukti transfer hanya bisa diakses via `URL::temporarySignedRoute()` (60 menit) |

### 3.3 Temuan & Risiko Payment ⚠️

| # | Temuan | Severity | Dampak |
|---|--------|----------|--------|
| P1 | **Form donasi TIDAK ada Turnstile/Captcha** — `StoreDonationRequest` tidak memvalidasi `cf-turnstile-response` | 🔴 HIGH | Bot bisa membuat ribuan donasi pending, flooding database & email |
| P2 | **Email pending notification dikirim langsung** (`Mail::to()->queue()`) — jika queue gagal, notifikasi lost | MEDIUM | Donatur tidak dapat instruksi bayar |
| P3 | **Unique code collision** — `rand(101, 999)` hanya 899 kemungkinan per hari per program | LOW | Jika program populer dengan >899 donasi offline/hari, infinite loop |
| P4 | **Raw Midtrans payload disimpan di DB** — `raw_payload` berisi data lengkap termasuk info sensitif | LOW | Data breach jika DB diakses, tapi umum di industri payment |
| P5 | **Fallback Xendit masih aktif di kode** — walaupun key kosong di `.env`, class masih di-instantiate | LOW | Bisa menyebabkan error jika xendit package bermasalah |
| P6 | **Midtrans sandbox key committed di `.env`** — `[REDACTED_MIDTRANS_SANDBOX_KEY]` | 🔴 HIGH | Key sandbox bocor di repository (walau sandbox, bad practice) |
| P7 | **Fee calculation hardcoded** — Jika Midtrans ubah tarif, fee display akan salah | LOW | Selisih kecil di laporan keuangan |
| P8 | **Donation `status` page tidak ada rate limit** — `/donasi/status/{code}` bisa di-brute force | MEDIUM | Enumeration donasi orang lain |

### 3.4 Rekomendasi Payment

```
KRITIS:
1. Tambahkan Turnstile captcha di form donasi (StoreDonationRequest)
2. Hapus semua credential dari .env yang tercommit (rotate keys)
3. Tambahkan rate limit di route donation.status

PENTING:
4. Gunakan try-catch wrapper untuk Mail::queue() di DonationController::store()
5. Tambahkan index pada `donations.donation_code` lookup (sudah unique ✅)
6. Pertimbangkan remove Xendit fallback code jika sudah full Midtrans
```

---

## 4. Lokasi Penyimpanan Kredensial

### 4.1 Peta Kredensial

| File | Credential | Apa | Status |
|------|-----------|-----|--------|
| `.env` | `APP_KEY` | Encryption key aplikasi | ⚠️ Committed to repo |
| `.env` | `MAIL_PASSWORD` | `[REDACTED_MAIL_PASSWORD]` | 🔴 BOCOR di repo |
| `.env` | `MIDTRANS_SERVER_KEY` | `[REDACTED_MIDTRANS_SERVER_KEY]` (sandbox) | 🔴 BOCOR di repo |
| `.env` | `MIDTRANS_CLIENT_KEY` | `[REDACTED_MIDTRANS_CLIENT_KEY]` (sandbox) | 🔴 BOCOR di repo |
| `.env` | `MIDTRANS_MERCHANT_ID` | `[REDACTED_MERCHANT_ID]` | ⚠️ Committed |
| `.env` | `TURNSTILE_SECRET_KEY` | Testing key (valid) | LOW — test key |
| `.env.production.example` | Semua credential | Placeholder kosong | ✅ Aman |
| `.env.example` | Semua credential | Placeholder default | ✅ Aman |
| `config/services.php` | Semua credential | Via `env()` helper | ✅ Best practice |
| `storage/app/private/` | Transfer proof images | File donatur | ✅ Private disk |
| `storage/app/private/` | Verification documents | KTP/SIUP campaigner | ✅ Private disk |
| Database `app_settings` | `meta_capi_access_token` | Meta Conversions API token | ⚠️ Plaintext di DB |
| Database `payments.raw_payload` | Gateway response | Midtrans/Xendit API response | ⚠️ Berisi detail transaksi |

### 4.2 Checklist Keamanan Kredensial

```
🔴 TINDAKAN SEGERA:
1. JANGAN commit .env ke git — cek git history dan clean
2. ROTATE semua credential yang pernah ter-commit:
   - Password email Hostinger (sapa@insani.id)
   - Midtrans API keys (walau sandbox)
   - APP_KEY
3. Pastikan .gitignore sudah ada .env (sudah ✅)

⚠️ PENTING:
4. Encrypt meta_capi_access_token di database (gunakan Crypt facade)
5. Pertimbangkan purge raw_payload setelah 90 hari
6. Set permission file .env = 600 di server
```

### 4.3 Lokasi Penyimpanan Dokumen

| Jenis Dokumen | Disk | Path | Aksesibilitas |
|---------------|------|------|---------------|
| Cover Image Program | `public` | `storage/app/public/programs/` | Public via symlink |
| Gallery Program | `public` | `storage/app/public/programs/gallery/` | Public via symlink |
| Program Documents | `local` (private) | `storage/app/private/programs/docs/` | Auth-only via controller |
| Verification Docs (KTP/SIUP) | `local` (private) | `storage/app/private/campaigner/` | Auth-only via controller |
| Transfer Proof | `local` (private) | `storage/app/private/donations/proof/` | Signed URL only |
| Disbursement Docs | `local` (private) | `storage/app/private/disbursements/` | Auth + permission only |
| Financial Reports PDF | `public` | `storage/app/public/financial-reports/` | Public download |
| Blog Images | `public` | `storage/app/public/blog/` | Public |
| Legal Documents PDF | `public` | `storage/app/public/legal-documents/` | Public |
| Database Backup | `local` | `storage/app/backups/` (spatie/backup) | Server-only |

> **Catatan penting untuk Hostinger:** Pastikan `php artisan storage:link` dijalankan setelah deployment untuk membuat symlink `public/storage` → `storage/app/public`.

---

## 5. Fitur Analitik

### 5.1 Arsitektur Analytics

Aplikasi menggunakan **first-party analytics** (bukan GA4/Pixel sebagai primary) yang terdiri dari:

| Komponen | Tabel | Fungsi |
|----------|-------|--------|
| `AnalyticsSession` | `analytics_sessions` | Sesi pengunjung dengan UTM, device, geo |
| `AnalyticsPageView` | `analytics_page_views` | Page views per halaman + durasi |
| `AnalyticsEvent` | `analytics_events` | Custom events (InitiateCheckout, Purchase, dll) |
| `AnalyticsService` | - | Agregasi data realtime, acquisition, engagement |
| `AnalyticsCollectorController` | - | API endpoint collect & heartbeat |
| Meta CAPI | - | Server-side event ke Meta Pixel |

### 5.2 Yang Sudah Baik ✅

- **Bot filtering** — `UserAgentParser::parse()` mendeteksi dan mengabaikan bot
- **Proper indexing** — `session_id`, `created_at`, `path`, `event_name` semua terindex
- **Composite indexes** — `(created_at, last_activity_at)`, `(path, created_at)`, `(event_name, created_at)`
- **Rate limiting** — `throttle:60,1` pada endpoint analytics
- **CSRF excluded** — Analytics endpoints benar di-exclude dari CSRF
- **Prunable trait** — `AnalyticsSession` auto-prune setelah 90 hari
- **Heartbeat duration cap** — `min($durationIncrement, 60)` mencegah abuse

### 5.3 Temuan & Risiko Analytics ⚠️

| # | Temuan | Severity | Dampak |
|---|--------|----------|--------|
| AN1 | **Prunable belum dijadwalkan** — `AnalyticsSession` punya `Prunable` trait tapi `model:prune` tidak ada di `console.php` schedule | 🔴 HIGH | Tabel analytics membengkak tanpa batas, disk & query makin lambat |
| AN2 | **`getAcquisitionData()` memuat SEMUA session ke memory** — `$sessions = AnalyticsSession::where(...)->get()` | 🔴 HIGH | Jika 100K sessions dalam 30 hari = OOM pada shared hosting |
| AN3 | **Realtime analytics query setiap request** — tidak ada caching | MEDIUM | Query berat setiap kali halaman analytics dibuka |
| AN4 | **`AnalyticsPageView` tidak punya pruning** — hanya session yang prunable | MEDIUM | Page views table tumbuh tanpa batas |
| AN5 | **Heartbeat 15 detik** — setiap tab aktif mengirim POST setiap 15 detik | MEDIUM | Traffic tinggi pada jam sibuk |
| AN6 | **IP address disimpan tanpa hashing** — GDPR/privacy concern | LOW | Opsional untuk Indonesia, tapi best practice hash |

### 5.4 Rekomendasi Analytics

```
KRITIS:
1. Tambahkan Schedule::command('model:prune')->daily() di console.php
2. Tambahkan Prunable trait ke AnalyticsPageView dan AnalyticsEvent
3. Refactor getAcquisitionData() untuk menggunakan DB query aggregation
   bukan load semua ke memory

PENTING:
4. Cache realtime data 30-60 detik: Cache::remember('analytics_realtime', 30, ...)
5. Pertimbangkan naikkan heartbeat interval ke 30 detik
```

---

## 6. Analisis Error (403, 404, 500, 503)

### 6.1 Skenario Error 403 (Forbidden)

| Skenario | Trigger | Handling | Status |
|----------|---------|----------|--------|
| Webhook Midtrans signature invalid | Signature mismatch | Return JSON 403 + log warning ✅ | ✅ Baik |
| Webhook Xendit token invalid | Token mismatch | Return JSON 403 + log warning ✅ | ✅ Baik |
| Bukti transfer tanpa signed URL | `$request->hasValidSignature()` false | `abort(403)` ✅ | ✅ Baik |
| User tanpa permission akses admin route | Role/permission middleware | Redirect / 403 default ✅ | ⚠️ Custom page? |
| CSRF token expired | Stale form | Redirect ke login + flash message ✅ (419→redirect) | ✅ Baik |
| Deactivated user login | `is_active = false` | ❓ Tidak terlihat explicit check | 🔴 RISIKO |

**Risiko 403:**
- **Deactivated user masih bisa login** — Tidak ada middleware/check yang mencegah login jika `is_active = false`. Hanya reset password dan email verification yang di-block.

### 6.2 Skenario Error 404 (Not Found)

| Skenario | Trigger | Handling | Status |
|----------|---------|----------|--------|
| Program slug tidak ditemukan | Route model binding | Auto 404 ✅ | ✅ |
| Program bukan published diakses | `$program->status !== 'published'` | `abort(404)` ✅ | ✅ |
| Donation code tidak valid | `firstOrFail()` | Auto 404 ✅ | ✅ |
| Blog slug tidak ditemukan | `findOrFail()` | Auto 404 ✅ | ✅ |
| Halaman dinamis slug invalid | Controller lookup | Auto 404 ✅ | ✅ |
| Payment not found di webhook | Payment query empty | Return JSON 404 ✅ | ✅ |
| ads.txt tanpa AdSense config | `abort(404)` | ✅ | ✅ |
| Locale prefix tidak valid | Localization middleware | Redirect ke default locale ✅ | ✅ |

**Risiko 404:**
- **Custom 404 page perlu di-test** — Pastikan Inertia 404 error page exists dan ter-render dengan benar.

### 6.3 Skenario Error 500 (Internal Server Error)

| Skenario | Kemungkinan Trigger | Pencegahan | Status |
|----------|-------------------|------------|--------|
| Database down | MySQL tidak bisa diakses | ❌ Tidak ada health check endpoint selain `/up` | ⚠️ |
| Midtrans API timeout | Network issue ke Midtrans | try-catch di `executeCharge()` ✅ | ✅ |
| Xendit API error | Network/auth issue | try-catch di `createInvoice()` ✅ | ✅ |
| Mail server down | SMTP Hostinger gagal | Queue retry (`--tries=2`) tapi error masih bisa terjadi | ⚠️ |
| Storage penuh | Shared hosting disk limit | ❌ Tidak ada monitoring disk usage | 🔴 |
| Memory limit | PHP memory exhaustion | ❌ Khususnya di `getAcquisitionData()` | 🔴 |
| Session table full | Database bloat | Session GC via lottery [2, 100] ✅ tapi lambat | ⚠️ |
| Queue job failure | Job throw exception | `--tries=2` dan `failed_jobs` table ✅ | ✅ |

**Risiko 500 terbesar:**
1. **`DashboardController::index()`** — 20+ query tanpa caching, bisa timeout di shared hosting
2. **`AnalyticsService::getAcquisitionData()`** — Load semua session ke memory = OOM
3. **`XenditPaymentService::getAvailableChannels()`** — Query `BankAccount` di dalam static method yang dipanggil setiap halaman donasi

### 6.4 Skenario Error 503 (Service Unavailable)

| Skenario | Trigger | Handling | Status |
|----------|---------|----------|--------|
| Maintenance mode | `php artisan down` | `APP_MAINTENANCE_DRIVER=file` ✅ | ✅ |
| Server overload | Hostinger resource limit | ❌ Tidak ada graceful degradation | ⚠️ |
| Queue worker crash | Cron-based worker gagal | `--withoutOverlapping` mencegah parallel ✅ | ✅ |

**Risiko 503:**
- **Hostinger shared hosting** bisa mengembalikan 503 jika CPU/memory limit terlampaui. Pastikan cron job `queue:work` menggunakan `--max-time=50` (sudah ✅).

---

## 7. Analisis Query & Beban Server

### 7.1 Query Hotspot — Halaman Publik

| Halaman | Controller | Jumlah Query (estimasi) | Masalah |
|---------|-----------|------------------------|---------|
| **Homepage** | `HomeController::index` | ~7 query | ❌ Tidak di-cache, 7 tabel berbeda |
| **Program Listing** | `ProgramListingController::index` | 3-5 query | ✅ Wajar dengan pagination |
| **Program Detail** | `ProgramListingController::show` | 5-8 query (program + donations + comments + updates) | ⚠️ Bisa N+1 jika relasi tidak eager-loaded |
| **Form Donasi** | `DonationController::create` | 3-5 query (program + channels + AppSetting) | ⚠️ `getAvailableChannels()` query `AppSetting` ~10x |
| **Status Donasi** | `DonationController::status` | 3-6 query + API call Midtrans | ⚠️ Sync API call blocking |
| **Search** | `SearchController::search` | 5-8 query (programs, blogs, pages, faqs, categories) | `throttle:30,1` ✅ |
| **Analytics Collect** | `AnalyticsCollectorController` | 2-3 query (upsert session + create page view) | Per-request overhead |

### 7.2 Query Hotspot — Admin Panel

| Halaman | Controller | Jumlah Query (estimasi) | Masalah |
|---------|-----------|------------------------|---------|
| **Dashboard** | `DashboardController::index` | **20-30+ query** | 🔴 KRITIS — tidak ada caching |
| **Analytics Realtime** | `AnalyticsController::realtime` | 5-8 query | ⚠️ Pooling setiap 10 detik? |
| **Analytics Events** | `AnalyticsController::events` | 6-10 query | ⚠️ Aggregation berat |
| **Reports Export** | `ReportController::exportDonations` | 2-3 query | ⚠️ Bisa timeout jika data banyak |

### 7.3 AppSetting — N+1 Tersembunyi

`AppSetting::get()` melakukan query database setiap dipanggil:

```php
public static function get(string $key, mixed $default = null): mixed
{
    $setting = static::where('key', $key)->first();  // 1 query per call
    return $setting ? $setting->value : $default;
}
```

**Kalkulasi di `MidtransCorePaymentService::getAvailableChannels()`:**
- `midtrans_channel_qris` → 1 query
- `midtrans_channel_bsi_va` → 1 query
- `midtrans_channel_bri_va` → 1 query
- ... (8 VA channels) → 8 query
- `midtrans_channel_shopeepay` → 1 query
- `midtrans_channel_gopay` → 1 query
- `midtrans_channel_credit_card` → 1 query
- `manual_transfer_bsi_active` → 1 query
- `manual_transfer_bri_active` → 1 query
- **Total: ~15 query SETIAP kali halaman donasi dibuka**

### 7.4 Rekomendasi Query Optimization

```
KRITIS:
1. Cache AppSetting::get() dengan Cache::remember()
   → Bisa mengurangi 15+ query per halaman donasi

2. Cache DashboardController data per 5 menit
   → Dari 20+ query menjadi 0 (hit cache)

3. Tambahkan Cache pada HomeController::index
   → 7 query menjadi 0 untuk homepage (cache 5-10 menit)

PENTING:
4. Eager-load relasi di ProgramListingController::show
5. Gunakan database aggregation di AnalyticsService::getAcquisitionData()
   → Ganti ->get() + foreach dengan ->selectRaw() + GROUP BY
6. Pertimbangkan materialized view untuk dashboard stats
```

---

## 8. Simulasi Beban Donasi (5K, 10K, 50K)

### 8.1 Profil Beban Per Donasi

Setiap donasi online memicu:

| Step | Operasi | Estimasi Waktu | Resources |
|------|---------|----------------|-----------|
| 1 | Form validation + sanitization | 5ms | CPU |
| 2 | `StoreDonationRequest` validation (AppSetting query) | 15ms | 2 DB query |
| 3 | `Donation::create()` | 10ms | 1 DB write |
| 4 | `MidtransCorePaymentService::charge()` | **500-2000ms** | HTTP call ke Midtrans |
| 5 | `Payment::create()` | 10ms | 1 DB write |
| 6 | `Mail::queue()` (pending notification) | 5ms | 1 DB write (queue) |
| 7 | Redirect ke status page | 5ms | - |
| **Total per donasi** | | **~600-2100ms** | **5 DB ops + 1 HTTP** |

Setiap webhook callback memicu:

| Step | Operasi | Estimasi Waktu | Resources |
|------|---------|----------------|-----------|
| 1 | Signature verification | 1ms | CPU |
| 2 | Payment lookup | 5ms | 1-2 DB query |
| 3 | Status mapping + fee calculation | 1ms | CPU |
| 4 | `Payment::update()` → PaymentObserver | 15ms | DB transaction with lock |
| 5 | `Donation::update()` | 5ms | 1 DB write |
| 6 | `Comment::firstOrCreate()` | 5ms | 1 DB write |
| 7 | `Program::lockForUpdate()` + recalculate | 20ms | **Row lock + SUM query** |
| 8 | `Fundraiser::lockForUpdate()` (optional) | 20ms | Row lock + SUM + COUNT |
| 9 | `SendDonationPaidNotification::dispatch()` | 5ms | 1 DB write (queue) |
| **Total per webhook** | | **~80ms** | **8-10 DB ops** |

### 8.2 Simulasi Skenario

#### Skenario A: 5.000 donasi dalam 1 jam

| Metrik | Nilai | Status |
|--------|-------|--------|
| Requests/detik (donasi form) | ~1.4 req/s | ✅ Mampu |
| Total DB writes | ~25.000 | ✅ Mampu |
| Concurrent HTTP ke Midtrans | ~1-3 | ✅ Aman |
| Queue jobs generated | ~10.000 (email+WA) | ⚠️ Backlog tapi OK |
| **Database size growth** | ~50MB | ✅ Aman |
| **Hostinger verdict** | **BISA DITANGANI** | ✅ |

**Catatan:** Ini setara 83 donasi/menit — sangat tinggi untuk yayasan tapi masih feasible.

#### Skenario B: 10.000 donasi dalam 1 jam

| Metrik | Nilai | Status |
|--------|-------|--------|
| Requests/detik (donasi form) | ~2.8 req/s | ⚠️ Mendekati batas |
| Total DB writes | ~50.000 | ⚠️ DB bisa lambat |
| Concurrent connections | ~5-10 | ⚠️ Hostinger limit |
| Queue backlog | ~20.000 jobs | 🔴 Backlog besar |
| Email delivery delay | 2-6 jam | 🔴 Hostinger SMTP rate limit |
| **Row lock contention** | Program `lockForUpdate()` | 🔴 **Bottleneck utama** |
| **Hostinger verdict** | **RISIKO TINGGI** | ⚠️ |

**Bottleneck utama:** `PaymentObserver` menggunakan `lockForUpdate()` pada program row. Jika 100+ donasi masuk untuk 1 program secara bersamaan, row lock akan menyebabkan timeout cascade.

#### Skenario C: 50.000 donasi dalam 1 jam

| Metrik | Nilai | Status |
|--------|-------|--------|
| Requests/detik | ~14 req/s | 🔴 **Melebihi kapasitas** |
| Total DB writes | ~250.000 | 🔴 DB overload |
| Concurrent connections | ~20-50 | 🔴 **Hostinger akan kill process** |
| Queue backlog | ~100.000 jobs | 🔴 Jobs table penuh |
| Memory usage | >256MB | 🔴 **OOM kill** |
| Midtrans rate limit | Mungkin terkena | 🔴 |
| **Hostinger verdict** | **TIDAK MAMPU** | 🔴 |

### 8.3 Bottleneck Analysis

```
┌────────────────────────────────────────────────────────┐
│           BOTTLENECK PRIORITY (dari terberat)          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. 🔴 Hostinger CPU/Memory Limit                     │
│     Shared hosting = 256MB RAM, 1-2 CPU core shared   │
│     → Solusi: VPS atau dedicated (bukan shared)        │
│                                                        │
│  2. 🔴 Database Row Lock Contention                   │
│     lockForUpdate() di program row per-donasi          │
│     → Solusi: Deferred aggregation (cron recalc)       │
│                                                        │
│  3. 🔴 Queue Worker Single-Threaded                   │
│     Cron-based queue:work --stop-when-empty            │
│     → Max 1 worker, proses 1 job/detik                 │
│     → 100K jobs = 28+ jam backlog                      │
│                                                        │
│  4. ⚠️ SMTP Rate Limit                                │
│     Hostinger SMTP: ~100-300 email/jam                 │
│     → 50K donasi = 100K+ email = 300+ jam delay        │
│                                                        │
│  5. ⚠️ Midtrans Concurrent Connection                 │
│     Setiap donasi online = 1 HTTP call ke Midtrans     │
│     → Blocking I/O, tidak async                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 8.4 Rekomendasi Skalabilitas

```
UNTUK SKALA 5K (segera):
- Implementasi caching AppSetting (mengurangi 15 query/donasi)
- Pastikan database indexes sudah optimal (sudah cukup baik ✅)

UNTUK SKALA 10K (perlu upgrade):
- Ganti collected_amount recalculation dari SUM ke INCREMENT
  → $program->increment('collected_amount', $donation->amount)
  → Kurangi row lock contention secara drastis
- Upgrade ke VPS atau Cloud hosting (bukan shared)
- Gunakan Redis untuk queue (bukan database)

UNTUK SKALA 50K (perlu re-architecture):
- Dedicated server / VPS minimal 4GB RAM
- Redis queue + Horizon
- Email via transactional service (Mailgun/SES), bukan SMTP
- Database read replica untuk analytics
- Async Midtrans charge via queue
- CDN (Cloudflare) untuk semua static assets
```

---

## 9. Audit Fitur Lainnya

### 9.1 Campaigner & Fundraiser

| Aspek | Status | Catatan |
|-------|--------|---------|
| Registrasi campaigner | ✅ | Throttle `6/menit`, verifikasi dokumen |
| Verifikasi multi-step | ✅ | Status: pending → verified/rejected |
| Campaign slot management | ✅ | `max_campaign_slots` + slot request system |
| Fundraiser referral system | ✅ | Referral code, attribution, collected tracking |
| EnsureCampaignerVerified middleware | ✅ | Mencegah akses sebelum verified |
| Disbursement workflow | ✅ | Request → review → approve → transfer |

### 9.2 Content Management

| Aspek | Status | Catatan |
|-------|--------|---------|
| Blog (native cache) | ✅ | `BlogPostCache` model dengan translations |
| Multi-language (id/en) | ✅ | Spatie Translatable + mcamara/localization |
| Auto-translate | ✅ | `TranslateProgramJob` untuk terjemahan otomatis |
| Pages CMS | ✅ | Halaman dinamis + slug catch-all |
| FAQ management | ✅ | Kategori + keywords |
| Popup Messages | ✅ | Schedulable, translatable, per-page targeting |
| Homepage Banners | ✅ | Sortable, active toggle |
| Testimonials | ✅ | Translatable, sortable |
| Impact Stats | ✅ | Dynamic counters untuk homepage |
| Partner logos | ✅ | Active toggle, sortable |
| Legal Documents | ✅ | Upload PDF, public access |
| Financial Reports | ✅ | Upload, periode fiscal, public download |

### 9.3 SEO & Marketing

| Aspek | Status | Catatan |
|-------|--------|---------|
| Dynamic Sitemap XML | ✅ | Programs, blogs, pages, categories |
| SeoService | ✅ | Meta tags, OG data, structured data |
| UTM tracking | ✅ | Session + cookie capture, stored per donation |
| Meta CAPI (server-side) | ✅ | `SendMetaCapiPurchaseEvent` job |
| Google AdSense ads.txt | ✅ | Dynamic dari AppSetting |
| Referrer tracking | ✅ | First-party analytics |

### 9.4 Notifications

| Channel | Status | Catatan |
|---------|--------|---------|
| Email (SMTP) | ✅ | Hostinger SMTP, queued |
| WhatsApp (Fonnte) | ✅ | `NotificationGatewayService` |
| Database Notification | ✅ | Bell icon di dashboard |
| Notification pruning | ✅ | Read notifications >60 hari di-prune |

### 9.5 Reporting & Export

| Aspek | Status | Catatan |
|-------|--------|---------|
| Donation report | ✅ | Filter + export |
| Disbursement report | ✅ | Filter + export |
| Program report (laporan) | ✅ | Community reporting + moderation |
| Donation receipt/kwitansi | ✅ | PDF-style receipt page |
| Comment moderation | ✅ | Hide/unhide per comment |

### 9.6 Backup & Maintenance

| Aspek | Status | Catatan |
|-------|--------|---------|
| Database backup | ✅ | `spatie/laravel-backup` daily at 01:00 |
| Backup cleanup | ✅ | Daily at 01:30 |
| Stale donation expiry | ✅ | `donations:expire-stale --hours=48` daily |
| Program status check | ✅ | `programs:check-status` daily |
| Queue worker (cron) | ✅ | `queue:work --stop-when-empty --max-time=50` every minute |
| Notification pruning | ✅ | Scheduled daily at 03:30 |
| Analytics pruning | ⚠️ | `Prunable` trait tapi `model:prune` TIDAK dijadwalkan |

---

## 10. Checklist Deployment Hostinger

### Pre-Deployment

- [ ] **Build frontend:** `npm run build` pada mesin lokal, upload folder `public/build/`
- [ ] **Copy `.env.production.example` ke `.env` di server** dan isi semua credential
- [ ] **Generate APP_KEY:** `php artisan key:generate`
- [ ] **Set `APP_DEBUG=false`** dan `APP_ENV=production`
- [ ] **Set `INERTIA_SSR_ENABLED=false`** (shared hosting tidak support SSR)
- [ ] **Set `SESSION_ENCRYPT=true`** dan `SESSION_DOMAIN=insani.id`
- [ ] **Set `LOG_CHANNEL=daily`** dan `LOG_LEVEL=error`
- [ ] **Set `MIDTRANS_IS_PRODUCTION=true`** dengan production keys
- [ ] **Set Turnstile production keys** (bukan testing keys)
- [ ] **Verify Midtrans webhook URL** di dashboard.midtrans.com → `https://insani.id/webhooks/midtrans`

### Deployment Steps

```bash
# 1. Upload semua file (kecuali node_modules, vendor, .env)
# 2. Di server Hostinger SSH:

cd ~/public_html    # atau ~/domains/insani.id/public_html

composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 3. Set file permissions
chmod 600 .env
chmod -R 775 storage bootstrap/cache

# 4. Setup Cron Job di hPanel:
# * * * * * cd ~/public_html && php artisan schedule:run >> /dev/null 2>&1
```

### Post-Deployment Verification

- [ ] Homepage loads correctly (no Vite manifest error)
- [ ] Login/Register works with Turnstile
- [ ] Donasi flow: form → Midtrans charge → status page
- [ ] Webhook: test via Midtrans sandbox dashboard
- [ ] Email: cek inbox apakah email pending/success terkirim
- [ ] Admin dashboard loads (test sebagai Administrator)
- [ ] `storage/` symlink accessible (cek gambar program)
- [ ] Cron job running: cek `storage/logs/` ada file log
- [ ] Queue worker: cek tabel `jobs` tidak menumpuk
- [ ] HTTPS redirect bekerja
- [ ] `/sitemap.xml` accessible

---

## 11. Rekomendasi Prioritas Perbaikan

### 🔴 KRITIS (Sebelum Deploy)

| # | Item | File | Estimasi |
|---|------|------|----------|
| 1 | Tambahkan Turnstile captcha ke form donasi | `StoreDonationRequest.php` + `Donate.tsx` | 1-2 jam |
| 2 | Rotate semua kredensial yang bocor di `.env` | Hostinger hPanel + Midtrans Dashboard | 30 menit |
| 3 | Jadwalkan `model:prune` di schedule | `routes/console.php` | 5 menit |
| 4 | Block login untuk user `is_active = false` | `FortifyServiceProvider` / `CustomLoginRequest` | 30 menit |

### ⚠️ PENTING (Minggu Pertama)

| # | Item | File | Estimasi |
|---|------|------|----------|
| 5 | Cache `AppSetting::get()` | `app/Models/AppSetting.php` | 30 menit |
| 6 | Cache `DashboardController` data | `DashboardController.php` | 1-2 jam |
| 7 | Cache `HomeController` data | `HomeController.php` | 30 menit |
| 8 | Refactor `getAcquisitionData()` ke DB aggregation | `AnalyticsService.php` | 2 jam |
| 9 | Rate limit `/donasi/status/{code}` | `routes/web.php` | 5 menit |
| 10 | Tambahkan Prunable ke `AnalyticsPageView` & `AnalyticsEvent` | Models | 15 menit |

### 💡 IMPROVEMENT (Bulan Pertama)

| # | Item | Estimasi |
|---|------|----------|
| 11 | Aktifkan 2FA untuk role admin/keuangan | 2-4 jam |
| 12 | Ganti `lockForUpdate()` + SUM ke `increment()` di PaymentObserver | 2 jam |
| 13 | Tambahkan custom error pages (403, 404, 500, 503) Inertia | 2-3 jam |
| 14 | Monitoring: setup uptime check dan email alert | 1 jam |
| 15 | Pertimbangkan upgrade ke VPS jika traffic >500 donasi/hari | - |

---

> **Dokumen ini dihasilkan melalui audit kode mendalam pada seluruh codebase. Untuk pertanyaan atau klarifikasi, hubungi tim teknis.**
