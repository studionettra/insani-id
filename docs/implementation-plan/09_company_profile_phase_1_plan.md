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
