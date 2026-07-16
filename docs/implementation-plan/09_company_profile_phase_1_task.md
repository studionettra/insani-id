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
