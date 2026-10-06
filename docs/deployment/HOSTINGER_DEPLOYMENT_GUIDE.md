# Panduan Deployment: Insani Indonesia di Hostinger Business Shared Hosting

Panduan ini berisi petunjuk komprehensif langkah demi langkah untuk mengunggah, mengonfigurasi, dan menjalankan aplikasi **Laravel 13 + Inertia v3 React (Insani Indonesia)** di paket **Business Shared Hosting Hostinger** dengan aman, cepat, dan stabil.

> **Terakhir diperbarui:** 6 Oktober 2026

---

## 1. Spesifikasi & Karakteristik Hostinger Shared Hosting

* **Web Server:** LiteSpeed Web Server (LSWS)
* **OS:** CloudLinux dengan LVE Manager (batasan RAM ~1.5 - 3 GB, CPU 1-2 core, I/O 10-20 MB/s).
* **Document Root Default:** `/home/uXXXXXXX/domains/domainanda.com/public_html`
* **Catatan Penting:** Shared hosting **TIDAK memiliki daemon process manager (Supervisor)**. Oleh karena itu, background queue worker dijalankan melalui **Laravel Scheduler (Cron Job)** yang telah dikonfigurasikan dengan `--stop-when-empty --max-time=50` dan `withoutOverlapping()`.
* **SSR Inertia:** Shared hosting **TIDAK mendukung persistent Node.js process**. SSR sudah dikontrol via environment variable `INERTIA_SSR_ENABLED` (default `false` di production).

---

## 2. Struktur Folder yang Aman (Wajib)

> [!CAUTION]
> **JANGAN PERNAH** mengunggah seluruh folder proyek Laravel langsung ke dalam `public_html`!
> Jika diunggah langsung ke `public_html`, file sensitif seperti `.env`, `.git`, dan folder `storage/` bisa terekspos ke publik jika terjadi kebocoran file rewrite `.htaccess`.

### Struktur yang Direkomendasikan:
Letakkan folder proyek di luar atau sejajar dengan `public_html`:
```text
/home/uXXXXXXX/domains/domainanda.com/
├── laravel_app/             <-- Seluruh folder project Laravel diletakkan di sini
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── lang/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env                 <-- Terlindungi 100% dari akses web
│   ├── .htaccess            <-- Safety net: redirect ke public/ jika document root salah
│   └── ...
└── public_html/             <-- Document root domain
```

### Opsi A (Terbaik): Mengubah Document Root di hPanel
1. Buka **hPanel Hostinger** -> **Websites** -> pilih domain Anda.
2. Buka **Advanced** -> **Change Document Root** (atau di pengaturan Website).
3. Arahkan Document Root dari `public_html` ke:
   ```text
   laravel_app/public
   ```
4. Simpan perubahan. Dengan cara ini, Anda tidak perlu mengubah path apapun di dalam file `index.php`.

### Opsi B: Memindahkan Isi Folder `public/` ke `public_html`
Jika hPanel akun Anda tidak mengizinkan pengubahan document root domain utama:
1. Pindahkan seluruh isi folder `laravel_app/public/*` (termasuk `.htaccess` dan folder `build/`) ke dalam `public_html/`.
2. Edit file `public_html/index.php` untuk menyesuaikan path autoloader dan bootstrap:
   ```php
   // Ubah dari:
   require __DIR__.'/../vendor/autoload.php';
   $app = require_once __DIR__.'/../bootstrap/app.php';

   // Menjadi:
   require __DIR__.'/../laravel_app/vendor/autoload.php';
   $app = require_once __DIR__.'/../laravel_app/bootstrap/app.php';
   ```

> [!NOTE]
> Project ini sudah menyertakan file `.htaccess` di root proyek sebagai safety net. Jika document root tidak mengarah ke `public/`, file ini akan secara otomatis me-redirect request ke subfolder `public/` serta memblokir akses ke file sensitif (`.env`, `artisan`, `.git`, dll.).

---

## 3. Konfigurasi PHP di hPanel Hostinger

Buka **hPanel** -> **Advanced** -> **PHP Configuration**:

### A. Versi PHP
* Pilih: **PHP 8.3** (sesuai spesifikasi `composer.json`: `"php": "^8.3"`).

### B. Ekstensi PHP Wajib Dicentang / Diaktifkan
* `fileinfo` (Wajib untuk validasi MIME upload gambar & dokumen program/verifikasi)
* `gd` (Wajib dengan dukungan WebP untuk resize gambar via Intervention Image v4 — lihat `ImageUploadController`)
* `intl` (Wajib untuk format angka/mata uang Rupiah & tanggal multi-bahasa via `mcamara/laravel-localization`)
* `bcmath` (Wajib untuk kalkulasi presisi nominal donasi, gateway fee, dan pencairan dana)
* `pdo_mysql` (Koneksi database MariaDB/MySQL)
* `zip` (Untuk backup zip via `spatie/laravel-backup` dan export dokumen)
* `curl`, `mbstring`, `openssl`, `tokenizer`, `xml`

### C. PHP Options / Resource Limits
Buka tab **PHP Options** dan sesuaikan nilai berikut:
* `memory_limit` = `256M` (mencegah out-of-memory saat resize gambar atau backup database)
* `upload_max_filesize` = `20M`
* `post_max_size` = `25M`
* `max_execution_time` = `120`
* `max_input_time` = `120`

---

## 4. Build Frontend Aset Sebelum Upload

Karena shared hosting tidak memiliki Node.js runtime untuk menjalankan Vite dev server, Anda wajib meng-compile aset React (React 19 + Tailwind CSS v4 + Wayfinder) di komputer lokal:

```bash
# Di komputer lokal:
npm run build
```

Pastikan folder `public/build/` telah terisi file manifest dan bundle JS/CSS.

> [!IMPORTANT]
> **SSR Inertia** dinonaktifkan secara default di production melalui `config/inertia.php` (`INERTIA_SSR_ENABLED=false`). Shared hosting tidak dapat menjalankan Node.js SSR background process. Biarkan `INERTIA_SSR_ENABLED=false` di file `.env` produksi.

---

## 5. Konfigurasi Environment Produksi (`.env`)

> [!TIP]
> Project ini menyertakan file **`.env.production.example`** yang sudah disesuaikan secara presisi untuk Hostinger Business Shared Hosting. Gunakan file ini sebagai template:
> ```bash
> cp .env.production.example .env
> ```
> Lalu isi semua nilai credential produksi Anda.

Pastikan konfigurasi utama berikut terisi dengan benar:

```dotenv
# ==============================================================
# Insani Indonesia — Production Environment (Hostinger Business)
# ==============================================================
APP_NAME="Insani Indonesia"
APP_ENV=production
APP_KEY=                          # Generate dengan: php artisan key:generate
APP_DEBUG=false
APP_URL=https://insani.id

APP_LOCALE=id
APP_FALLBACK_LOCALE=id
APP_FAKER_LOCALE=id_ID

APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12

# --- Logging ---
# Rotasi harian agar file log tidak membengkak di shared hosting
LOG_CHANNEL=daily
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# --- Database (dari hPanel -> Databases -> Management) ---
DB_CONNECTION=mysql
DB_HOST=localhost                 # Biasanya localhost di Hostinger shared
DB_PORT=3306
DB_DATABASE=uXXXXXXX_insani
DB_USERNAME=uXXXXXXX_insani_user
DB_PASSWORD=PasswordDatabaseAndaYangKuat

# Path mysqldump jika backup spatie gagal mendeteksi binary (opsional)
# DUMP_BINARY_PATH=/usr/bin/mysqldump

# --- Session & Keamanan Cookie ---
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=insani.id
SESSION_SECURE_COOKIE=true

# --- Services, Queue, & Cache ---
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database

# --- SSR Inertia (wajib false di shared hosting) ---
INERTIA_SSR_ENABLED=false

# --- Mail SMTP Hostinger Business ---
# Catatan Hostinger:
# Opsi 1 (Port 465 - SSL): MAIL_SCHEME=smtps, MAIL_PORT=465 (Rekomendasi)
# Opsi 2 (Port 587 - TLS): MAIL_SCHEME=tls, MAIL_PORT=587
MAIL_MAILER=smtp
MAIL_SCHEME=smtps
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=notifikasi@insani.id
MAIL_PASSWORD=PasswordEmailHostingerAnda
MAIL_FROM_ADDRESS="notifikasi@insani.id"
MAIL_FROM_NAME="Insani Indonesia"
MAIL_REPLY_TO_ADDRESS="sapa@insani.id"
MAIL_REPLY_TO_NAME="Layanan Sahabat Insani"

# --- Cloudflare Turnstile Captcha (PRODUKSI) ---
VITE_TURNSTILE_SITE_KEY=ProductionSiteKeyDariCloudflare
TURNSTILE_SECRET_KEY=ProductionSecretKeyDariCloudflare

# --- Midtrans Payment Gateway PRODUKSI (Gateway Utama - Core API) ---
MIDTRANS_MERCHANT_ID=ProductionMerchantID
MIDTRANS_CLIENT_KEY=Mid-client-ProductionClientKey
MIDTRANS_SERVER_KEY=Mid-server-ProductionServerKey
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_EXPIRY_QRIS_MINUTES=30
MIDTRANS_EXPIRY_VA_HOURS=24

# --- Xendit Payment Gateway (Cadangan / Legacy) ---
XENDIT_API_KEY=xnd_production_...
XENDIT_WEBHOOK_TOKEN=TokenWebhookXenditAsli

# --- WhatsApp Gateway (Fonnte - Notifikasi WA Donatur Opsional) ---
WHATSAPP_PROVIDER=fonnte
WHATSAPP_ENDPOINT=https://api.fonnte.com/send
WHATSAPP_TOKEN=TokenAkunFonnteAnda
```

> [!CAUTION]
> **JANGAN** menyalin file `.env` dari komputer lokal ke server! File `.env` lokal berisi credential development (Midtrans sandbox, Turnstile test key, database lokal). Selalu buat `.env` baru di server dari template `.env.production.example`.

---

## 6. Setup SSL & HTTPS

1. Buka **hPanel** -> **Security** -> **SSL**.
2. Install **Free SSL** (Let's Encrypt) untuk domain `insani.id` (termasuk `www.insani.id`).
3. Aktifkan fitur **Force HTTPS** agar semua request otomatis dialihkan ke HTTPS.
4. Pastikan `APP_URL` di `.env` menggunakan prefix `https://`.

---

## 7. Setup Symbolic Link Storage (`storage:link`)

Untuk menampilkan gambar banner, avatar, foto program, dan dokumen publik:
1. Aktifkan akses SSH di **hPanel** -> **Advanced** -> **SSH Access**.
2. Hubungkan terminal SSH Anda (menggunakan PuTTY atau terminal SSH bawaan OS).
3. Masuk ke direktori Laravel dan jalankan:
   ```bash
   cd /home/uXXXXXXX/domains/domainanda.com/laravel_app
   php artisan storage:link
   ```

*(Jika Document Root menggunakan Opsi B di mana `public_html` terpisah, buat symlink manual via SSH):*
```bash
ln -s /home/uXXXXXXX/domains/domainanda.com/laravel_app/storage/app/public /home/uXXXXXXX/domains/domainanda.com/public_html/storage
```

---

## 8. Setup Cron Job di hPanel Hostinger

Cron job ini adalah **jantung otomatisasi** di Hostinger Shared Hosting. Satu cron entry menjalankan seluruh tugas terjadwal aplikasi:

| Tugas | Jadwal | Keterangan |
|:---|:---|:---|
| `queue:work --stop-when-empty --max-time=50 --tries=2` | Setiap menit | Memproses antrean email, notifikasi, dan dispatch job |
| `programs:check-status` | 00:01 | Evaluasi status target donasi dan deadline program |
| `disbursements:send-update-reminders` | 09:00 | Kirim pengingat pelaporan pencairan dana ke campaigner |
| `donations:expire-stale --hours=48` | 02:00 | Menandai kedaluwarsa donasi manual/VA yang belum dibayar |
| `backup:run --only-db` | 01:00 | Backup otomatis database MySQL via Spatie Backup |
| `backup:clean` | 01:30 | Membersihkan file backup lama sesuai aturan retensi |
| `notifications:prune-read` | 03:30 | Hapus notifikasi sistem yang telah dibaca >60 hari |
| `model:prune` | 04:00 | Prune data first-party analytics (sessions, pageviews, events) |

### Langkah Pengaturan:
1. Buka **hPanel** -> **Advanced** -> **Cron Jobs**.
2. Pilih tipe: **Custom**.
3. Pada jadwal, pilih opsi **Every Minute** (`* * * * *`).
4. Pada kolom **Command**, masukkan:
   ```bash
   /usr/bin/php /home/uXXXXXXX/domains/domainanda.com/laravel_app/artisan schedule:run >> /dev/null 2>&1
   ```
   *(Sesuaikan path `/home/uXXXXXXX/...` sesuai dengan path direktori akun hPanel Anda).*
5. Klik **Save**.

> [!NOTE]
> Queue worker menggunakan `--max-time=50` (50 detik) dan `--stop-when-empty` agar selesai sebelum cron menit berikutnya dijalankan. Flag `withoutOverlapping()` memastikan tidak ada proses worker yang tumpang tindih.

---

## 9. Migrasi Database, Seeding Awal, & Optimasi Produksi

Setelah menghubungkan SSH atau terminal hPanel, jalankan perintah berikut secara berurutan:

```bash
cd /home/uXXXXXXX/domains/domainanda.com/laravel_app

# 1. Generate APP_KEY baru (hanya sekali, saat instalasi pertama)
php artisan key:generate

# 2. Jalankan migrasi seluruh tabel database
php artisan migrate --force

# 3. Jalankan seeding data master, peran Spatie, dan akun superadmin awal
#    (PENTING: Hanya dijalankan saat instalasi pertama kali!)
php artisan db:seed --force

# 4. Optimasi produksi (caching konfigurasi, routing, dan blade views)
php artisan optimize

# 5. Buat symbolic link storage (jika belum dibuat)
php artisan storage:link
```

> [!IMPORTANT]
> **Keamanan Akun Superadmin Awal:**
> Perintah `db:seed` akan membuat akun superadmin default:
> * Email: `admin@insani.id`
> * Password: `password`
> 
> Aplikasi Insani Indonesia telah dilengkapi proteksi **Force Password Change** (`must_change_password`). Begitu Anda login pertama kali ke `/login`, sistem akan mewajibkan Anda mengganti password baru melalui halaman `/force-password-change`. Segera login dan perbarui kata sandi tersebut dengan sandi yang kuat dan aman!

> [!WARNING]
> **Jangan** menjalankan `php artisan queue:table` dan `php artisan session:table` — tabel `jobs`, `job_batches`, `failed_jobs`, `sessions`, dan `cache` sudah memiliki file migrasi resmi bawaan proyek. Cukup jalankan `php artisan migrate --force`.

---

## 10. Konfigurasi Payment Gateway & Webhook (Midtrans & Xendit)

Aplikasi Insani Indonesia menggunakan arsitektur pembayaran hybrid: **Midtrans Core API** sebagai gateway utama (100% native QRIS & Virtual Account tanpa Snap popup), serta **Xendit** sebagai gateway cadangan (legacy fallback).

### A. Konfigurasi Midtrans (Gateway Utama)
1. Buka [Midtrans Dashboard (MAP)](https://dashboard.midtrans.com/) dan login.
2. Pastikan mode diubah ke **Production Mode**.
3. Buka menu **Settings** -> **Configuration**:
   * Pada kolom **Payment Notification URL**, masukkan:
     ```text
     https://insani.id/webhooks/midtrans
     ```
   * Simpan pengaturan.
4. Buka menu **Settings** -> **Access Keys**:
   * Salin **Merchant ID**, **Client Key**, dan **Server Key**.
   * Tempelkan ke file `.env` di server:
     ```dotenv
     MIDTRANS_MERCHANT_ID=G123456789
     MIDTRANS_CLIENT_KEY=Mid-client-XXXXX
     MIDTRANS_SERVER_KEY=Mid-server-XXXXX
     MIDTRANS_IS_PRODUCTION=true
     ```
5. Buka menu **Settings** -> **Payment Method** untuk memastikan metode QRIS (GoPay/ShopeePay) dan Bank Transfer Virtual Account (BCA, Mandiri, BNI, BRI, Permata) telah aktif.

> [!NOTE]
> Webhook Midtrans di `MidtransWebhookController` diverifikasi otomatis menggunakan algoritma kriptografi SHA-512 Signature Key (`order_id + status_code + gross_amount + server_key`). Tidak memerlukan verifikasi token statis manual.

### B. Konfigurasi Xendit (Gateway Cadangan / Legacy)
1. Buka [Dashboard Xendit](https://dashboard.xendit.co/) -> **Settings** -> **Developers** -> **Webhooks**.
2. Pada URL Callback Invoices, masukkan:
   ```text
   https://insani.id/webhooks/xendit
   ```
3. Salin **Verification Token (Callback Token)** dari dashboard Xendit.
4. Tempelkan nilai tersebut ke dalam file `.env`:
   ```dotenv
   XENDIT_API_KEY=xnd_production_...
   XENDIT_WEBHOOK_TOKEN=TokenYangDisalinTadi
   ```
5. Klik **Test and Save** di dashboard Xendit (harus mengembalikan status HTTP `200 OK`).

---

## 11. Konfigurasi Cloudflare Turnstile (Captcha)

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Turnstile**.
2. Tambahkan widget site baru dengan domain `insani.id`.
3. Salin **Site Key** dan **Secret Key** ke `.env`:
   ```dotenv
   VITE_TURNSTILE_SITE_KEY=SiteKeyDariCloudflare
   TURNSTILE_SECRET_KEY=SecretKeyDariCloudflare
   ```

> [!CAUTION]
> Key testing bawaan Cloudflare (`1x00000000000000000000AA`) **tidak boleh** digunakan di server produksi! Selalu gunakan key produksi resmi dari dashboard Cloudflare.

---

## 12. Verifikasi Post-Deploy & Troubleshooting

Setelah seluruh tahapan selesai, jalankan checklist verifikasi berikut:

### Checklist Verifikasi
- [ ] Website dapat diakses di `https://insani.id`
- [ ] Redireksi HTTPS aktif (akses `http://insani.id` otomatis dialihkan ke `https://`)
- [ ] Halaman publik (beranda, daftar program, blog, kontak, laporan) tampil normal
- [ ] Gambar banner, avatar, dan galeri program tampil utuh (symlink storage berfungsi)
- [ ] Form donasi online berfungsi (uji coba QRIS / VA Midtrans dan cek halaman status donasi native `/donasi/status/{donationCode}`)
- [ ] Webhook Midtrans terverifikasi dan update status pembayaran donasi secara real-time
- [ ] Email notifikasi donasi terkirim (cek antrean queue job di tabel `jobs`)
- [ ] Widget Cloudflare Turnstile muncul di form donasi, login, kontak, dan laporan program
- [ ] Login admin berfungsi di `/login` dengan akun default `admin@insani.id`
- [ ] Alur paksa ubah password (`/force-password-change`) berhasil dijalankan pada login pertama
- [ ] Dashboard manajemen admin dapat diakses lancar
- [ ] First-party Analytics aktif mencatat kunjungan (endpoint `/analytics/collect` dan `/analytics/heartbeat` merespon 200 OK)
- [ ] Cron job berjalan di server — cek log: `tail -f storage/logs/laravel.log`
- [ ] Database backup berfungsi: jalankan manual `php artisan backup:run --only-db` lalu cek dengan `php artisan backup:list`
- [ ] Submit sitemap XML ke [Google Search Console](https://search.google.com/search-console): `https://insani.id/sitemap.xml`

### Troubleshooting Umum

| Masalah | Solusi |
|:---|:---|
| **Error 500 tanpa detail** | Pastikan `APP_DEBUG=false`, periksa detail error pada file `storage/logs/laravel-YYYY-MM-DD.log`. |
| **Gambar/Avatar tidak tampil (404)** | Jalankan `php artisan storage:link` via SSH. Jika menggunakan Opsi B, pastikan symlink manual mengarah ke direktori `storage/app/public` yang benar. |
| **"Vite manifest not found"** | Folder `public/build/` belum diupload. Jalankan `npm run build` di lokal dan unggah kembali folder `public/build/`. |
| **Email SMTP gagal terkirim** | Pada Hostinger port 465 wajib menggunakan `MAIL_SCHEME=smtps`. Jika menggunakan port 587, gunakan `MAIL_SCHEME=tls`. Pastikan password email di hPanel sudah benar. |
| **Midtrans Webhook 403 (Invalid Signature)** | Pastikan `MIDTRANS_SERVER_KEY` di file `.env` sudah sesuai dengan production Server Key di dashboard Midtrans, dan `MIDTRANS_IS_PRODUCTION=true`. |
| **Queue job tidak kunjung diproses** | Pastikan Cron Job di hPanel berstatus aktif dengan interval `* * * * *` dan path biner `/usr/bin/php` serta `artisan` sudah valid. |
| **Backup Spatie gagal saat dump DB** | Buka `.env` dan tambahkan `DUMP_BINARY_PATH=/usr/bin/mysqldump` (sesuaikan lokasi `mysqldump` pada server Hostinger jika berbeda). |
| **Admin tidak bisa masuk setelah seed** | Pastikan Anda menyelesaikan form `/force-password-change` setelah login dengan kata sandi bawaan `password`. |

---

Aplikasi Insani Indonesia kini siap melayani donatur dan beroperasi penuh di Hostinger Business Shared Hosting! 🚀

