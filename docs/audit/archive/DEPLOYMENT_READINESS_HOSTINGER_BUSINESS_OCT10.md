# Audit Kesiapan Deploy ke Hostinger Business Shared Hosting

**Tanggal pemeriksaan:** 10 Oktober 2026  
**Jenis pemeriksaan:** Analisis statis, baca-saja  
**Kesimpulan:** **GO bersyarat; belum direkomendasikan untuk menerima donasi produksi sebelum gerbang kesiapan di laporan ini ditutup.**

## Ringkasan eksekutif

Aplikasi ini secara arsitektur dapat dijalankan pada shared hosting Hostinger Business. Proyek menggunakan Laravel 13, PHP `^8.3`, Inertia v3 dengan React, Vite, MySQL, antrean database, dan Inertia SSR yang dapat dinonaktifkan. Repo juga sudah memiliki contoh environment produksi, panduan Hostinger, dan workflow deploy manual yang membangun aset, memasang dependensi produksi, menjalankan tes, melakukan migrasi, serta mengoptimalkan cache.

Kesiapan aktual belum dapat dipastikan karena konfigurasi akun hPanel dan kredensial produksi tidak tersedia untuk pemeriksaan. Beberapa langkah penting juga bergantung pada konfigurasi server: document root, ekstensi PHP, cron, izin tulis, dan symlink penyimpanan. Risiko pemulihan data perlu ditangani sebelum operasi donasi karena jadwal backup hanya mengambil basis data dan menyimpannya pada disk lokal akun yang sama.

**Penilaian akhir:** Hostinger Business Shared Hosting layak sebagai sasaran awal untuk beban rendah hingga menengah yang masih sesuai dengan batas sumber daya akun. Sebelum menerima transaksi nyata, verifikasi konfigurasi server, selesaikan gerbang operasional dan data, lalu uji alur pembayaran secara menyeluruh.

## Cakupan dan batas pemeriksaan

Pemeriksaan mencakup `composer.json`, `package.json`, contoh environment produksi, konfigurasi Laravel, routing console, migrasi, penyimpanan berkas, controller webhook Midtrans, workflow GitHub Actions, panduan deployment, dan keadaan Git saat pemeriksaan.

File `.env` lokal sengaja tidak dibaca. Pemeriksaan ini tidak mengakses hPanel, tidak memverifikasi kredensial produksi, tidak menghubungi gateway pembayaran, dan tidak menjalankan tes atau build. Karena itu, hasil ini menilai kesiapan yang tampak dari repo, bukan sertifikasi runtime atau konfirmasi bahwa server produksi telah dikonfigurasi dengan benar.

## Kecocokan teknis dengan hosting

| Area | Penilaian | Bukti dan implikasi |
|---|---|---|
| Runtime PHP | Sesuai dengan syarat minimum yang didokumentasikan | `composer.json` mensyaratkan PHP `^8.3`. Dokumentasi Hostinger saat ini menyebut PHP 8.3 sebagai versi bawaan situs baru dan menyediakan versi hingga 8.5. Verifikasi versi PHP situs dan CLI di akun yang akan dipakai. |
| Dependensi PHP | Dapat dipasang melalui SSH/Composer | `composer.lock` tersedia; workflow melakukan `composer install --no-dev`. Hostinger menyediakan Composer 2 pada paket Web Business dan SSH untuk pemasangan dependensi. Tetap cocokkan dependensi platform dengan runtime server. |
| Frontend | Tidak memerlukan Node.js yang selalu berjalan | Workflow menjalankan `npm ci` dan `npm run build`; `public/build/manifest.json` tersedia lokal saat audit. SSR Inertia dinonaktifkan secara default di konfigurasi. Jika deploy manual, aset produksi tetap harus dibangun dan ikut diunggah. |
| Database | Sesuai untuk MySQL/MariaDB Hostinger | Contoh produksi memilih MySQL. Migrasi untuk tabel aplikasi, cache, sesi, dan antrean tersedia di repo. Nama database, pengguna, host, kata sandi, dan kapasitas basis data aktual belum diverifikasi. |
| Antrean | Bisa dijalankan tanpa worker menetap, dengan ketergantungan pada cron | Contoh produksi memilih antrean database. `routes/console.php` menjalankan `queue:work --stop-when-empty --max-time=50 --tries=2` setiap menit melalui scheduler. Jika cron tidak dibuat atau gagal, email dan job antrean dapat tertunda atau menumpuk. |
| Penyimpanan | Dapat berjalan pada disk lokal akun | Disk `public` menyimpan aset yang memang ditujukan untuk publik; disk `local` menyimpan dokumen privat yang dilayani melalui aplikasi. `storage:link` diperlukan untuk berkas publik. Izin tulis dan keberhasilan symlink belum diverifikasi pada server. |
| Sumber daya | Perlu dipantau pada beban nyata | Hosting bersama memakai batas CPU, RAM, I/O, proses, dan pekerja PHP yang ditentukan paket. Pekerja cron, resize gambar, backup, dan lonjakan trafik donasi memakai sumber daya akun yang sama. Angka pasti bergantung pada produk dan akun; cek bagian penggunaan sumber daya di hPanel. |

Dokumentasi Hostinger menyatakan dukungan versi PHP dan pengelolaan ekstensi melalui konfigurasi PHP. Ekstensi yang perlu diperiksa untuk kebutuhan repo mencakup `pdo_mysql`, `fileinfo`, `gd` dengan dukungan WebP, `intl`, `bcmath`, `zip`, `curl`, `mbstring`, `openssl`, dan `xml`. Daftar final harus dibandingkan dengan persyaratan Composer serta fitur yang benar-benar dipakai.

## Temuan utama sebelum peluncuran

### 1. Document root dan batas keamanan berkas — prioritas tinggi

Workflow mengirim repo ke direktori `laravel_app`, bukan langsung ke `public_html`. Domain harus mengarah ke `laravel_app/public`, atau isi `public/` perlu disajikan lewat struktur document root yang terpisah dan path `index.php` disesuaikan. Panduan proyek juga menyarankan salah satu konfigurasi tersebut.

Repo menyertakan `.htaccess` root yang menulis ulang permintaan ke `public/` dan memblokir beberapa nama berkas. Ini berguna sebagai pengaman tambahan, tetapi tidak menggantikan document root yang benar. Jangan menganggapnya sebagai satu-satunya perlindungan untuk `.env`, `storage`, `vendor`, dan berkas konfigurasi apabila struktur hosting berbeda dari asumsi.

**Syarat penutupan:** pastikan document root domain benar-benar menunjuk ke direktori publik Laravel; pastikan berkas aplikasi, environment, dan penyimpanan privat tidak dapat diakses melalui URL.

### 2. Environment dan layanan produksi — prioritas tinggi

`.env.production.example` menetapkan `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://insani.id`, koneksi MySQL, SMTP, Turnstile, Midtrans, dan Xendit. Nilai penting seperti `APP_KEY`, kredensial database, kata sandi SMTP, kunci Turnstile, dan kunci gateway masih berupa nilai kosong atau placeholder. Tidak ada bukti bahwa nilai pada server sudah diisi atau diuji.

**Syarat penutupan:** isi `.env` produksi secara aman di server, buat `APP_KEY` satu kali, pastikan `APP_DEBUG=false`, gunakan kredensial produksi yang benar, dan verifikasi koneksi email serta gateway tanpa menaruh rahasia di Git.

### 3. Webhook dan alur pembayaran — prioritas tertinggi untuk donasi nyata

Controller webhook Midtrans yang diperiksa memverifikasi tanda tangan SHA-512, mencari transaksi gateway, memakai transaksi basis data dan `lockForUpdate()`, serta membandingkan nominal settlement dengan nominal donasi tersimpan. Ini adalah kontrol yang baik pada jalur yang diperiksa. Kode saja tidak membuktikan konfigurasi callback di dashboard gateway, pengiriman callback ke domain produksi, penanganan retry, atau hasil alur transaksi secara langsung.

**Syarat penutupan:** uji donasi uji dari pembuatan pembayaran, callback sukses/gagal/kedaluwarsa, pembaruan status dan agregat donasi, sampai notifikasi. Pastikan URL callback menggunakan HTTPS, kunci produksi tepat, dan log tidak mencatat rahasia.

### 4. Cron dan antrean — prioritas tinggi

`routes/console.php` menjadwalkan pemeriksaan status program, pengingat pencairan, kedaluwarsa donasi, backup, pembersihan data, dan worker antrean. Semuanya bergantung pada satu cron Hostinger yang menjalankan `php artisan schedule:run` setiap menit. Pengaturan cron aktual belum diperiksa.

**Syarat penutupan:** buat cron dengan path PHP dan path aplikasi yang tepat; periksa keluaran cron; pastikan pekerjaan antrean selesai, gagal tercatat, dan tidak menumpuk. Pantau penggunaan CPU dan proses akun setelah situs berjalan.

### 5. Backup dan pemulihan — prioritas tinggi

Jadwal saat ini menjalankan `backup:run --only-db` dan `backup:clean`. Konfigurasi Spatie menyimpan backup ke disk `local`; contoh produksi tidak menetapkan `BACKUP_ARCHIVE_PASSWORD`. Dampaknya:

- backup terjadwal tidak mencakup gambar, dokumen, dan unggahan di `storage`;
- salinan di akun hosting yang sama tidak cukup untuk pemulihan dari kehilangan atau gangguan akun/server;
- tidak tampak konfigurasi enkripsi arsip backup;
- keberhasilan `mysqldump` di shared hosting belum dibuktikan; panduan dan template juga memberi bentuk `DUMP_BINARY_PATH` yang berbeda.

**Syarat penutupan:** tentukan backup basis data dan berkas ke lokasi terpisah, perlindungan dan retensi arsip, verifikasi ketersediaan binary dump, lalu lakukan uji pemulihan sebelum menyimpan data transaksi produksi.

### 6. Batas ukuran unggahan — prioritas menengah

`FinancialReportController` menerima PDF sampai 25 MB (`max:25600`). Panduan deployment menyarankan `upload_max_filesize=20M` dan `post_max_size=25M`. Dengan nilai itu, unggahan 25 MB dapat ditolak atau gagal karena batas PHP dan overhead permintaan.

**Syarat penutupan:** sesuaikan nilai PHP berdasarkan batas akun dan ukuran unggahan yang didukung aplikasi; uji ukuran berkas maksimum melalui formulir produksi.

### 7. Workflow deploy dan rilis — prioritas menengah

Workflow `.github/workflows/deploy.yml` hanya berjalan manual. Ia menjalankan tes dan Pint, memasang dependensi produksi, membangun frontend, mengirim berkas, melakukan migrasi, membersihkan serta membangun cache, lalu memeriksa `/up`.

Hal yang perlu diperhatikan:

- sinkronisasi `rsync` terjadi sebelum mode pemeliharaan diaktifkan; selama sinkronisasi, server dapat melihat campuran berkas versi lama dan baru;
- pemeriksaan `/up` hanya memberi peringatan dan tidak menggagalkan workflow saat respons buruk;
- kegagalan `storage:link` disembunyikan dengan `|| true`;
- nilai cadangan kunci bypass pemeliharaan berupa string tetap di workflow; tetapkan rahasia unik dan jangan mengandalkan nilai bawaan tersebut;
- `optimize:clear` dijalankan setelah migrasi, sehingga cache konfigurasi lama berpotensi masih dipakai pada saat migrasi jika environment berubah;
- `npm ci || npm install` dapat beralih ke pemasangan yang tidak sepenuhnya terkunci oleh lockfile.

Workflow ini sudah menyediakan quality gate yang bermanfaat, tetapi belum membuktikan bahwa jalur deploy berhasil di akun Hostinger sebenarnya. Lakukan deploy percobaan di staging atau pada domain uji sebelum mengandalkannya untuk rilis produksi.

## Status Git pada saat audit

Branch `main` berada pada `origin/main`, dengan perubahan lokal yang belum di-commit pada:

- `app/Http/Controllers/Admin/ProgramController.php`
- `resources/js/pages/Admin/Programs/Index.tsx`

Deploy melalui workflow mengambil commit dari GitHub; perubahan lokal ini tidak ikut sampai masuk ke commit yang dirilis. Deploy manual dari working tree dapat membawa perubahan tersebut meskipun belum melewati quality gate. Tentukan versi rilis dan status perubahan sebelum memulai deploy.

## Daftar gerbang kesiapan

Sebelum go-live donasi, pastikan seluruh butir berikut sudah diverifikasi:

- [ ] Versi PHP situs dan CLI sesuai dengan `^8.3`; ekstensi PHP yang diperlukan aktif.
- [ ] Document root menyajikan `public/` Laravel dan direktori privat tidak dapat diakses melalui web.
- [ ] `.env` produksi lengkap, `APP_KEY` tersedia, `APP_DEBUG=false`, dan rahasia tidak tersimpan di repo.
- [ ] Database produksi dapat diakses; migrasi berjalan; seeding awal dilakukan hanya sesuai prosedur dan sekali jika diperlukan.
- [ ] Aset produksi tersedia, `storage:link` berhasil, serta izin `storage/` dan `bootstrap/cache/` benar.
- [ ] Cron `schedule:run` setiap menit aktif; antrean, tugas rutin, dan email terpantau.
- [ ] Backup basis data dan berkas tersedia di lokasi terpisah; uji restore berhasil.
- [ ] SMTP, Turnstile, gateway produksi, URL webhook, serta alur donasi ujung ke ujung telah diverifikasi.
- [ ] Batas unggahan sesuai dengan validasi aplikasi dan nilai PHP hosting.
- [ ] Versi kode yang dirilis jelas; perubahan lokal yang belum di-commit telah ditinjau dan dimasukkan atau sengaja ditinggalkan.
- [ ] Deploy percobaan dan pemeriksaan kesehatan berhasil; kegagalan rilis dapat diketahui dan dipulihkan.

## Sumber internal yang diperiksa

- [`composer.json`](../../composer.json) dan `composer.lock`
- [`.env.production.example`](../../.env.production.example)
- [`config/filesystems.php`](../../config/filesystems.php), [`config/backup.php`](../../config/backup.php), [`config/queue.php`](../../config/queue.php)
- [`routes/console.php`](../../routes/console.php)
- [`MidtransWebhookController.php`](../../app/Http/Controllers/Webhook/MidtransWebhookController.php)
- [`FinancialReportController.php`](../../app/Http/Controllers/Admin/FinancialReportController.php)
- [Workflow deploy](../../.github/workflows/deploy.yml)
- [Panduan deployment Hostinger proyek](../deployment/HOSTINGER_DEPLOYMENT_GUIDE.md)

## Referensi Hostinger

- [Mengubah versi PHP di paket Hostinger](https://www.hostinger.com/support/1575755-how-to-change-the-php-version-of-your-hostinger-hosting-plan/) — versi yang tersedia dan versi bawaan situs baru.
- [Batas paket hosting Hostinger](https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans-in-hostinger/) — batas sumber daya berbeda menurut paket dan produk; periksa nilai akun di hPanel.
- [Menggunakan Composer di Hostinger](https://www.hostinger.com/support/5792078-how-to-use-composer-at-hostinger/) — Composer 2 dan akses SSH pada Web Business dan paket terkait.
- [Kemampuan server dan proses latar Hostinger](https://www.hostinger.com/support/which-server-capabilities-are-supported-at-hostinger/) — tugas terjadwal tersedia di paket Web/Cloud dan memakai sumber daya akun.
- [Pengelolaan ekstensi dan opsi PHP Hostinger](https://www.hostinger.com/support/php/php-extensions-and-options/) — cara memeriksa ekstensi serta opsi PHP.
