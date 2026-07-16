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
