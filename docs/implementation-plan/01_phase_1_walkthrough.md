# Walkthrough: Phase 1 (Foundation)

Phase 1 telah berhasil diimplementasikan! Sistem kini memiliki fondasi Authentication (Fortify) dan Authorization (Spatie Permission) yang siap digunakan oleh berbagai _role_ pengguna.

## Apa yang telah dilakukan?

### 1. Pembaruan Skema Tabel `users`
Tabel `users` bawaan Laravel telah dimodifikasi untuk mendukung spesifikasi proyek:
- Menambahkan kolom `phone` (opsional, unik).
- Menambahkan kolom `is_active` (boolean, *default* aktif) untuk keperluan *suspend* akun.
- Menambahkan kolom `last_login_at` untuk pelacakan jejak aktivitas.
- Menambahkan kapabilitas `SoftDeletes` (kolom `deleted_at`) agar histori transaksi dari akun lama tetap terjaga.

### 2. Integrasi Laravel Fortify (Backend Auth)
- Paket `laravel/fortify` telah dipasang untuk menangani seluruh *routing* otentikasi tanpa menyentuh *view* bawaan.
- Memperbarui `App\Concerns\ProfileValidationRules` dan `CreateNewUser` agar dapat menerima dan memvalidasi input `phone` saat registrasi.
- Menghubungkan *routing* Fortify dengan Inertia React (*view* diarahkan ke direktori `Pages/Public/Auth/...`).

### 3. Implementasi RBAC (Role-Based Access Control)
- Memasang paket `spatie/laravel-permission`.
- Membuat `PermissionSeeder` yang mengeksekusi registrasi 40 _permission_ unik yang telah diuraikan pada dokumen spesifikasi.
- Membuat `RoleSeeder` yang memetakan seluruh _permission_ tersebut ke dalam 8 _Role_ utama:
  - Administrator
  - Program Officer
  - Verifikator
  - Keuangan
  - Customer Service
  - Campaigner Individu
  - Campaigner Lembaga
  - Donatur
- Di dalam `DatabaseSeeder`, sistem otomatis membuat satu akun **Super Administrator** (`admin@insani.id` / `password`).

### 4. Halaman Login Frontend (React + Tailwind)
- Halaman `Login.jsx` khusus untuk domain Publik telah dibuat menggunakan pendekatan *Mobile-first* dan kelas utilitas murni Tailwind, menjauhi template *admin* yang generik sesuai mandat spesifikasi perusahaan (PRD Section 4).

## Hasil Validasi
Perintah `php artisan migrate:fresh --seed` telah dieksekusi dengan sukses. Kesalahan *caching* bawaan dari library Spatie saat eksekusi *seeder* beruntun telah berhasil diatasi (*fix* lewat `forgetCachedPermissions()`). Database lokal Anda kini sepenuhnya bersih dan telah dimuat dengan skema _user_ beserta _roles_ yang paling mutakhir.

## Langkah Selanjutnya
Kita dapat berlanjut ke **Phase 2: Master Data & Campaigner Profiles** di mana kita akan membuat tabel Kategori Donasi dan Profil Lembaga/Individu.
