# Panduan Deployment: Insani Indonesia di Hostinger Business Shared Hosting

Panduan ini berisi petunjuk komprehensif langkah demi langkah untuk mengunggah, mengonfigurasi, dan menjalankan aplikasi **Laravel 13 + Inertia v3 React (Insani Indonesia)** di paket **Business Shared Hosting Hostinger** dengan aman, cepat, dan stabil.

> **Terakhir diperbarui:** 24 September 2026

---

## 1. Spesifikasi & Karakteristik Hostinger Shared Hosting

* **Web Server:** LiteSpeed Web Server (LSWS)
* **OS:** CloudLinux dengan LVE Manager (batasan RAM ~1.5 - 3 GB, CPU 1-2 core, I/O 10-20 MB/s).
* **Document Root Default:** `/home/uXXXXXXX/domains/domainanda.com/public_html`
* **Catatan Penting:** Shared hosting **TIDAK memiliki daemon process manager (Supervisor)**. Oleh karena itu, background queue worker dijalankan melalui **Laravel Scheduler (Cron Job)** yang telah dikonfigurasikan dengan `--stop-when-empty --max-time=50`.
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
> Project ini sudah menyertakan file `.htaccess` di root proyek sebagai safety net. Jika document root tidak mengarah ke `public/`, file ini akan secara otomatis me-redirect request ke subfolder `public/`.

---

## 3. Konfigurasi PHP di hPanel Hostinger

Buka **hPanel** -> **Advanced** -> **PHP Configuration**:

### A. Versi PHP
* Pilih: **PHP 8.3** (sesuai spesifikasi `composer.json`: `"php": "^8.3"`).

### B. Ekstensi PHP Wajib Dicentang / Diaktifkan
* `fileinfo` (Wajib untuk validasi MIME upload gambar & dokumen)
* `gd` (Wajib dengan dukungan WebP untuk resize gambar via Intervention Image — lihat `ImageUploadController`)
* `intl` (Wajib untuk format angka/mata uang Rupiah & tanggal multi-bahasa via `mcamara/laravel-localization`)
* `bcmath` (Wajib untuk kalkulasi presisi nominal donasi & invoice Xendit)
* `pdo_mysql` (Koneksi database MariaDB/MySQL)
* `zip` (Untuk backup zip via `spatie/laravel-backup` dan export laporan)
* `curl`, `mbstring`, `openssl`, `tokenizer`, `xml`

### C. PHP Options / Resource Limits
Buka tab **PHP Options** dan sesuaikan nilai berikut:
* `memory_limit` = `256M` (mencegah out-of-memory saat resize gambar atau generate laporan)
* `upload_max_filesize` = `20M`
* `post_max_size` = `25M`
* `max_execution_time` = `120`
* `max_input_time` = `120`

---

## 4. Build Frontend Aset Sebelum Upload

Karena shared hosting tidak memiliki Node.js runtime untuk menjalankan Vite dev server, Anda wajib meng-compile aset React terlebih dahulu di komputer lokal:

```bash
# Di komputer lokal:
npm run build
```

Pastikan folder `public/build/` telah terisi manifest dan file javascript/css yang sudah ter-bundle.

> [!IMPORTANT]
> **SSR Inertia** sudah dinonaktifkan secara default di production melalui `config/inertia.php` (`INERTIA_SSR_ENABLED=false`). Shared hosting tidak dapat menjalankan Node.js SSR server. Jika Anda ingin mengaktifkan SSR di environment lokal, set `INERTIA_SSR_ENABLED=true` di file `.env` lokal.

---

## 5. Konfigurasi Environment Produksi (`.env`)

> [!TIP]
> Project ini menyertakan file **`.env.production.example`** yang sudah disesuaikan untuk Hostinger Business Shared Hosting. Gunakan file ini sebagai template:
> ```bash
> cp .env.production.example .env
> ```
> Lalu isi semua value yang masih kosong.

Pastikan konfigurasi berikut sudah benar:

```dotenv
APP_NAME="Insani Indonesia"
APP_ENV=production
APP_KEY=                          # Generate dengan: php artisan key:generate
APP_DEBUG=false
APP_URL=https://insani.id

APP_LOCALE=id
APP_FALLBACK_LOCALE=id

# --- Logging ---
# Rotasi harian agar log tidak membengkak di shared hosting (retensi 7 hari)
LOG_CHANNEL=daily
LOG_LEVEL=error

# --- Database (dari hPanel -> Databases -> Management) ---
DB_CONNECTION=mysql
DB_HOST=localhost                 # Biasanya localhost di Hostinger shared
DB_PORT=3306
DB_DATABASE=uXXXXXXX_insani
DB_USERNAME=uXXXXXXX_insani_user
DB_PASSWORD=PasswordDatabaseAndaYangKuat

# --- Session & Keamanan Cookie ---
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_DOMAIN=insani.id

# --- Queue Database (Diproses via Scheduler Cron) ---
QUEUE_CONNECTION=database
CACHE_STORE=database

# --- SSR Inertia (wajib false di shared hosting) ---
INERTIA_SSR_ENABLED=false

# --- Mail SMTP Hostinger Business ---
MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=sapa@insani.id
MAIL_PASSWORD=PasswordEmailHostingerAnda
MAIL_FROM_ADDRESS="sapa@insani.id"
MAIL_FROM_NAME="Insani Indonesia"

# --- Cloudflare Turnstile Captcha PRODUKSI ---
VITE_TURNSTILE_SITE_KEY=SiteKeyAsliCloudflareAnda
TURNSTILE_SECRET_KEY=SecretKeyAsliCloudflareAnda

# --- Xendit Payment Gateway PRODUKSI ---
XENDIT_API_KEY=xnd_production_...
XENDIT_WEBHOOK_TOKEN=TokenWebhookXenditAsli
```

> [!CAUTION]
> **JANGAN** menyalin file `.env` dari komputer lokal ke server! File `.env` lokal berisi credential development (Xendit development key, Turnstile test key, dll.). Selalu buat `.env` baru di server dari template `.env.production.example`.

---

## 6. Setup SSL & HTTPS

1. Buka **hPanel** -> **Security** -> **SSL**.
2. Install **Free SSL** (Let's Encrypt) untuk domain `insani.id`.
3. Aktifkan **Force HTTPS** agar semua request di-redirect ke HTTPS.
4. Pastikan `APP_URL` di `.env` menggunakan `https://`.

---

## 7. Setup Symbolic Link Storage (`storage:link`)

Untuk menampilkan gambar banner, avatar, foto program, dan dokumen publik:
1. Aktifkan akses SSH di **hPanel** -> **Advanced** -> **SSH Access**.
2. Hubungkan terminal SSH Anda (menggunakan PuTTY atau terminal biasa).
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

Cron job ini adalah **jantung otomatisasi** di Hostinger Shared Hosting. Satu entry cron menjalankan semua tugas terjadwal berikut:

| Tugas | Jadwal | Keterangan |
|:---|:---|:---|
| `queue:work --stop-when-empty --max-time=50 --tries=2` | Setiap menit | Drain antrean email, notifikasi donasi |
| `programs:check-status` | 00:01 | Cek status & deadline program |
| `disbursements:send-update-reminders` | 09:00 | Reminder update pencairan dana |
| `donations:expire-stale --hours=48` | 02:00 | Expire donasi manual kedaluwarsa |
| `backup:run --only-db` | 01:00 | Backup database otomatis |
| `backup:clean` | 01:30 | Bersihkan backup lama |
| `notifications:prune-read` | 03:30 | Hapus notifikasi terbaca >60 hari |

### Langkah Pengaturan:
1. Buka **hPanel** -> **Advanced** -> **Cron Jobs**.
2. Pilih tipe: **Custom**.
3. Pada jadwal, pilih opsi **Every Minute** (`* * * * *`).
4. Pada kolom **Command**, masukkan:
   ```bash
   /usr/bin/php /home/uXXXXXXX/domains/domainanda.com/laravel_app/artisan schedule:run >> /dev/null 2>&1
   ```
   *(Sesuaikan path absolut `/home/uXXXXXXX/...` sesuai dengan path home directory yang tertera di sidebar hPanel Anda).*
5. Klik **Save**.

> [!NOTE]
> Queue worker menggunakan `--max-time=50` (50 detik) dan `--stop-when-empty` agar tidak melebihi batas waktu cron 1 menit. Flag `withoutOverlapping()` mencegah duplikasi proses.

---

## 9. Migrasi Database & Optimasi Produksi

Setelah menghubungkan SSH atau melalui terminal hPanel, jalankan perintah berikut secara berurutan:

```bash
cd /home/uXXXXXXX/domains/domainanda.com/laravel_app

# 1. Generate APP_KEY baru (hanya sekali, saat deploy pertama)
php artisan key:generate

# 2. Jalankan migrasi database
php artisan migrate --force

# 3. Optimasi produksi (cache config, routes, views)
php artisan optimize

# 4. Buat symlink storage (jika belum)
php artisan storage:link
```

> [!WARNING]
> **Jangan** menjalankan `php artisan queue:table` dan `php artisan session:table` — migrasi untuk tabel `jobs`, `job_batches`, `failed_jobs`, `sessions`, dan `cache` sudah terdefinisi di file migrasi bawaan project (`0001_01_01_000001_create_cache_table.php` dan `0001_01_01_000002_create_jobs_table.php`). Cukup jalankan `php artisan migrate --force`.

---

## 10. Konfigurasi Webhook di Dashboard Xendit

1. Buka [Dashboard Xendit](https://dashboard.xendit.co/) -> **Settings** -> **Developers** -> **Webhooks**.
2. Pada URL Callback Invoices, masukkan:
   ```text
   https://insani.id/webhooks/xendit
   ```
3. Salin **Verification Token (Callback Token)** dari dashboard Xendit.
4. Tempelkan nilai tersebut ke dalam file `.env` di baris:
   ```dotenv
   XENDIT_WEBHOOK_TOKEN=TokenYangDisalinTadi
   ```
5. Klik **Test and Save** di Xendit. Anda harus menerima status HTTP `200 OK`.

> [!IMPORTANT]
> Pastikan Anda menggunakan **Xendit Production API Key** (`xnd_production_...`), bukan Development Key (`xnd_development_...`). Switch mode di dashboard Xendit ke **Live Mode** sebelum menyalin API key.

---

## 11. Konfigurasi Cloudflare Turnstile (Captcha)

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Turnstile**.
2. Buat site baru dengan domain `insani.id`.
3. Salin **Site Key** dan **Secret Key** ke `.env`:
   ```dotenv
   VITE_TURNSTILE_SITE_KEY=SiteKeyDariCloudflare
   TURNSTILE_SECRET_KEY=SecretKeyDariCloudflare
   ```

> [!CAUTION]
> Key testing (`1x00000000000000000000AA`) **tidak boleh** digunakan di production! Selalu ganti dengan key production dari dashboard Cloudflare.

---

## 12. Verifikasi Post-Deploy

Setelah semua langkah di atas selesai, lakukan verifikasi berikut:

### Checklist Verifikasi
- [ ] Website dapat diakses di `https://insani.id`
- [ ] HTTPS redirect berfungsi (akses `http://insani.id` harus redirect ke `https://`)
- [ ] Halaman publik (beranda, program, blog) tampil dengan benar
- [ ] Gambar banner, avatar, dan foto program tampil (symlink storage OK)
- [ ] Form donasi berfungsi — test dengan Xendit production
- [ ] Email notifikasi terkirim (cek via donasi test)
- [ ] Captcha Turnstile muncul di form login/register/kontak
- [ ] Login admin berfungsi di `/login`
- [ ] Dashboard admin dapat diakses
- [ ] Cron job berjalan — cek log: `tail -f storage/logs/laravel.log`
- [ ] Backup database berjalan: `php artisan backup:list`
- [ ] Submit sitemap ke [Google Search Console](https://search.google.com/search-console): `https://insani.id/sitemap.xml`

### Troubleshooting Umum

| Masalah | Solusi |
|:---|:---|
| Error 500 tanpa detail | Cek `APP_DEBUG=false` sudah benar, baca `storage/logs/laravel.log` |
| Gambar tidak tampil | Jalankan `php artisan storage:link` via SSH |
| "Vite manifest not found" | Pastikan `public/build/` sudah diupload (jalankan `npm run build` lokal) |
| Email tidak terkirim | Verifikasi `MAIL_SCHEME=tls` dan password di `.env` |
| Queue job tidak diproses | Cek cron job aktif di hPanel dan path artisan benar |
| Backup gagal | Cek `mysqldump` tersedia; set `DUMP_BINARY_PATH` di `.env` jika path berbeda |

---

Aplikasi Insani Indonesia kini siap melayani donatur dan beroperasi penuh di Hostinger Business Shared Hosting! 🚀
