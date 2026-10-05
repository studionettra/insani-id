

<!-- MERGED FROM 09_company_profile_phase_1_plan.md -->

# Implementation Plan — Company Profile Phase 1

## 1. Pendahuluan
Dokumen ini adalah rencana implementasi teknis untuk **Phase 1: WordPress Headless Setup & Blog Sync Service** pada modul Company Profile.
Tujuannya adalah menghubungkan WordPress (sebagai CMS berita) dengan aplikasi Laravel Insani menggunakan sistem webhook dan background sync, sehingga artikel WordPress tersimpan lokal di database Laravel untuk performa maksimal.

## 2. Persiapan Environment
- **Aksi:** Menambahkan variabel environment di `.env` dan `config/services.php` (berdasarkan dokumen `wordpress-integration.md`).
```env
WORDPRESS_URL=https://berita.insani.id
WORDPRESS_WEBHOOK_SECRET=your_secret_token
```

## 3. Database & Migrations
- **Tabel:** `blog_post_cache`
- **Migration:** Membuat tabel dengan kolom `wp_post_id` (PK bayangan), `title`, `slug`, `excerpt`, `content_html`, `featured_image_url`, `wp_category`, `published_at`, `synced_at`. Kolom `wp_post_id` dan `slug` diset `UNIQUE`.

## 4. Package Baru
- **Install Package:** `mews/purifier` (HTML Purifier)
- **Tujuan:** Untuk melakukan sanitasi terhadap string HTML yang datang dari WordPress REST API agar aman saat dirender di Inertia/React nantinya (mencegah potensi celah XSS).

## 5. Model & Service
- **Model:** `BlogPostCache` (Tabel: `blog_post_cache`). Model ini berfokus pada data statis artikel, tidak memerlukan relasi yang kompleks ke tabel sistem.
- **Service:** `BlogSyncService` 
  - Fungsi `syncFromWordPress(int $wpPostId)` yang melakukan HTTP GET ke `WORDPRESS_URL` dengan path `/wp-json/wp/v2/posts/{wpPostId}?_embed`.
  - Ekstraksi gambar utama (*featured image*) dan kategori dari payload JSON.
  - Sanitasi field `content.rendered` (menjadi `content_html`) menggunakan `Purifier::clean()`.
  - Menggunakan metode `updateOrCreate` pada tabel `blog_post_cache` berdasarkan kunci `wp_post_id`.

## 6. Webhook Endpoint
- **Route:** `POST /webhooks/wordpress` (akan diletakkan pada `routes/web.php` atau dedicated webhook routes).
- **Middleware Baru:** `VerifyWordPressWebhookToken` (membandingkan token rahasia dari Header, misal: `X-WP-Webhook-Token`, dengan `WORDPRESS_WEBHOOK_SECRET`).
- **Pengecualian CSRF:** Route endpoint `webhooks/wordpress` wajib dikecualikan dari `VerifyCsrfToken` di konfigurasi `bootstrap/app.php`.
- **Controller:** `WordPressWebhookController`, bertugas menerima payload, mengambil `post_id`, dan mendelegasikan perintah sinkronisasi ke job/queue agar respons webhook instan ke WordPress.

## 7. Scheduled Fallback
- **Job:** `FullSyncBlogPostsJob`
- **Tujuan:** Sinkronisasi penuh berkala. Job ini akan:
  1. Melakukan fetch seluruh artikel terbaru (misal: 100 terakhir).
  2. Melakukan upsert ke `blog_post_cache`.
  3. Mengidentifikasi artikel yang ada di database lokal, namun tidak dikembalikan dari WordPress, lalu menghapusnya (menangani kasus artikel di-Trash/Delete dari WordPress tanpa webhook).
- **Scheduling:** Didaftarkan menggunakan Schedule di `routes/console.php` untuk berjalan misal setiap jam (`hourly()`).

## 8. Testing & Quality Assurance
- Uji cobakan Webhook middleware: pastikan melempar 401/403 jika token tidak dikirim atau tidak sesuai.
- Feature test untuk `BlogSyncService` dengan melakukan *Mock* pada HTTP client (`Http::fake()`) untuk mensimulasikan format *response* WP REST API.
- Test spesifik untuk HTML Purifier: mengirimkan payload yang memuat tag `<script>` berbahaya dan memastikan tersanitasi di database.


<!-- MERGED FROM 09_company_profile_phase_1_task.md -->

# Tasks - Company Profile Phase 1

## Module 1.1: Konfigurasi Environment & WordPress
- [x] Tambahkan konfigurasi `WORDPRESS_URL` dan `WORDPRESS_WEBHOOK_SECRET` di `config/services.php` dan `.env.example`.

## Module 1.2: Blog Sync Service (Laravel)
- [x] Buat migration untuk tabel `blog_post_cache` sesuai Database Dictionary v1.1.
- [x] Buat model `BlogPostCache` dengan array `$guarded = []`.
- [x] Install dan publish konfigurasi package `mews/purifier` untuk sanitasi HTML.
- [x] Buat `BlogSyncService` dengan metode `syncFromWordPress($wpPostId)` menggunakan HTTP facade Laravel.
- [x] Buat middleware `VerifyWordPressWebhookToken` untuk memeriksa validitas request (memastikan datang dari WordPress kita).
- [x] Daftarkan middleware tersebut.
- [x] Daftarkan route `POST /webhooks/wordpress` di `routes/web.php` atau file routing terkait.
- [x] Kecualikan route webhook dari perlindungan CSRF di `bootstrap/app.php`.
- [x] Buat Controller yang menerima request webhook, memvalidasi, dan memanggil `BlogSyncService`.
- [x] Buat background job `FullSyncBlogPostsJob` untuk melakukan sinkronisasi otomatis seluruh artikel (sebagai fallback).
- [x] Daftarkan job tersebut untuk berjalan terjadwal (`hourly()`) di `routes/console.php`.

## Security & Testing
- [x] Tulis Feature Test untuk Webhook Endpoint (pastikan middleware menolak request tanpa token yang benar).
- [x] Tulis Feature Test untuk Mock HTTP Client di `BlogSyncService` (pastikan insert data berhasil ke database).
- [x] Tulis Feature Test memastikan sanitasi script berbahaya bekerja.
- [x] Tulis Feature Test untuk `FullSyncBlogPostsJob` (pastikan menghapus artikel yang sudah tidak ada di WP).
- [x] Jalankan Pest (`php artisan test`) dan pastikan semuanya _pass_.


<!-- MERGED FROM 09_company_profile_phase_1_walkthrough.md -->

# Walkthrough - Company Profile Phase 1

## Overview
Phase 1 dari modul **Company Profile** (WordPress Headless Setup & Blog Sync Service) telah berhasil diselesaikan. Aplikasi Laravel saat ini sudah siap untuk menerima *webhook* dari WordPress serta melakukan sinkronisasi otomatis artikel blog.

## Changes Made

### 1. Environment & Configuration
- Menambahkan variabel `WORDPRESS_URL` dan `WORDPRESS_WEBHOOK_SECRET` pada `.env.example` untuk memastikan dokumentasi environment yang benar.
- Konfigurasi telah teregistrasi pada `config/services.php` (grup `wordpress`).

### 2. Database
- Membuat dan mengeksekusi *migration* tabel `blog_post_caches` dengan struktur yang sesuai berdasarkan Database Dictionary v1.1.
- Tabel ini berfungsi sebagai *cache* lokal untuk artikel dari WordPress API, menghindari *load* yang lambat dan *rate limit*.

### 3. Service Layer & HTML Sanitizer
- Menginstall package `mews/purifier` untuk melakukan sanitasi script berbahaya dari HTML WordPress (XSS Protection).
- Membuat kelas `App\Services\BlogSyncService` dengan dua fungsi utama:
  - `syncPost(int $wpPostId)`: Untuk melakukan upsert satu artikel spesifik saat trigger webhook dipanggil.
  - `syncAllPosts()`: Untuk sinkronisasi massal seluruh 100 artikel terbaru, sekaligus membersihkan cache lokal untuk artikel yang sudah dihapus/Trash di WordPress.

### 4. Webhook & Middleware
- Membuat middleware `VerifyWordPressWebhookToken` untuk memeriksa validitas header `X-WP-Webhook-Token`.
- Mengecualikan rute `webhooks/wordpress` dari *CSRF Protection* di `bootstrap/app.php`.
- Memperbarui `WordPressWebhookController` agar mendukung webhook *single post* atau mendelegasikan *full sync job*.

### 5. Scheduled Background Job
- Membuat antrean Job `FullSyncBlogPostsJob`.
- Menjadwalkan Job tersebut untuk berjalan setiap jam (`->hourly()`) melalui `routes/console.php` sebagai mekanisme *fallback* atau penyelarasan data.

## Verification
Semua pengujian fungsional dan keamanan berhasil lolos menggunakan **Pest PHP**.

### Automated Tests Passed:
1. `WordPressWebhookTest` 
   - Memastikan request tanpa/salah token ditolak dengan *403 Unauthorized*.
   - Memastikan request valid berhasil dieksekusi.
2. `BlogSyncServiceTest`
   - Memastikan simulasi Fetch REST API berhasil dimasukkan ke tabel `blog_post_caches`.
   - **XSS Check**: Memastikan tag `<script>` berbahaya terfilter sebelum masuk database.
3. `FullSyncBlogPostsJobTest`
   - Memastikan job berjalan dan artikel usang di cache lokal berhasil dihapus jika sudah tidak ada di data terbaru.

## Next Steps
Infrastruktur artikel/kabar dari sisi *backend* sudah berjalan sempurna. Fase selanjutnya (Phase 2) akan difokuskan pada perluasan **RBAC (Role Based Access Control)** untuk *Content Editor* dan penambahan flag **Fokus Program** di dalam tabel `categories`.
