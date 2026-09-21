# Panduan Deployment: Insani Indonesia di Hostinger Business Shared Hosting

Panduan ini berisi petunjuk komprehensif langkah demi langkah untuk mengunggah, mengonfigurasi, dan menjalankan aplikasi **Laravel 12 + Inertia React (Insani Indonesia)** di paket **Business Shared Hosting Hostinger** dengan aman, cepat, dan stabil.

---

## 1. Spesifikasi & Karakteristik Hostinger Shared Hosting
* **Web Server:** LiteSpeed Web Server (LSWS)
* **OS:** CloudLinux dengan LVE Manager (batasan RAM ~1.5 - 3 GB, CPU 1-2 core, I/O 10-20 MB/s).
* **Document Root Default:** `/home/uXXXXXXX/domains/domainanda.com/public_html`
* **Catatan Penting:** Shared hosting **TIDAK memiliki daemon process manager (Supervisor)**. Oleh karena itu, background queue worker dijalankan melalui **Laravel Scheduler (Cron Job)** yang telah kita konfigurasikan dengan `--stop-when-empty`.

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
│   ├── storage/
│   ├── vendor/
│   ├── .env                 <-- Terlindungi 100% dari akses web
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

---

## 3. Konfigurasi PHP di hPanel Hostinger

Buka **hPanel** -> **Advanced** -> **PHP Configuration**:

### A. Versi PHP
* Pilih: **PHP 8.3** (sesuai spesifikasi aplikasi).

### B. Ekstensi PHP Wajib Dicentang / Diaktifkan
* `fileinfo` (Wajib untuk validasi MIME upload gambar & dokumen)
* `gd` (Wajib dengan dukungan WebP untuk resize gambar Intervention Image)
* `intl` (Wajib untuk format angka/mata uang Rupiah & tanggal multi-bahasa)
* `bcmath` (Wajib untuk kalkulasi presisi nominal donasi & invoice)
* `pdo_mysql` (Koneksi database MariaDB/MySQL)
* `zip` (Untuk backup zip dan export laporan)
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

---

## 5. Konfigurasi Environment Produksi (`.env`)

Salin file `.env.example` menjadi `.env` di server, lalu sesuaikan konfigurasi penting berikut:

```dotenv
APP_NAME="Insani Indonesia"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domainanda.com

# Database Hostinger (dibuat di hPanel -> Databases -> Management)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=uXXXXXXX_insani
DB_USERNAME=uXXXXXXX_insani_user
DB_PASSWORD=PasswordDatabaseAndaYangKuat

# Sesi & Keamanan Cookie
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true

# Queue Database (Diproses via Scheduler Cron)
QUEUE_CONNECTION=database

# Mail SMTP Hostinger Business
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=sapa@domainanda.com
MAIL_PASSWORD=PasswordEmailHostingerAnda
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="sapa@domainanda.com"
MAIL_FROM_NAME="Insani Indonesia"

# Cloudflare Turnstile Captcha Produksi
VITE_TURNSTILE_SITE_KEY=SiteKeyAsliCloudflareAnda
TURNSTILE_SECRET_KEY=SecretKeyAsliCloudflareAnda

# Xendit Payment Gateway Produksi
XENDIT_API_KEY=xnd_production_...
XENDIT_WEBHOOK_TOKEN=TokenWebhookXenditAsli
```

---

## 6. Setup Symbolic Link Storage (`storage:link`)

Untuk menampilkan gambar banner, avatar, dan foto program:
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

## 7. Setup Cron Job di hPanel Hostinger

Cron job ini adalah **jantung otomatisasi** di Hostinger Shared Hosting. Ini akan menjalankan:
1. Pemrosesan antrean email & notifikasi donasi (`queue:work --stop-when-empty`) setiap menit.
2. Pengecekan status program & deadline (`programs:check-status`) setiap tengah malam.
3. Pembersihan donasi manual kedaluwarsa (`donations:expire-stale`) setiap malam.
4. Backup database otomatis (`backup:run --only-db`).

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

---

## 8. Migrasi Database & Caching Produksi

Setelah menghubungkan SSH atau melalui terminal hPanel, jalankan perintah final:

```bash
cd /home/uXXXXXXX/domains/domainanda.com/laravel_app

# 1. Jalankan migrasi database
php artisan migrate --force

# 2. Buat tabel queue dan sessions jika belum ada
php artisan queue:table
php artisan session:table
php artisan migrate --force

# 3. Cache konfigurasi dan routes untuk performa maksimal
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 9. Konfigurasi Webhook di Dashboard Xendit

1. Buka [Dashboard Xendit](https://dashboard.xendit.co/) -> **Settings** -> **Developers** -> **Webhooks**.
2. Pada URL Callback Invoices, masukkan:
   ```text
   https://domainanda.com/webhooks/xendit
   ```
3. Salin **Verification Token (Callback Token)** dari dashboard Xendit.
4. Tempelkan nilai tersebut ke dalam file `.env` di baris:
   ```dotenv
   XENDIT_WEBHOOK_TOKEN=TokenYangDisalinTadi
   ```
5. Klik **Test and Save** di Xendit. Anda harus menerima status HTTP `200 OK`.

Aplikasi Insani Indonesia kini siap melayani donatur dan beroperasi penuh di Hostinger Business Shared Hosting!
