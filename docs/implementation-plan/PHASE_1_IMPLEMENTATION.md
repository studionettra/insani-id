

<!-- MERGED FROM 01_phase_1_foundation_plan.md -->

# Phase 1: Foundation (Auth & RBAC)

This plan outlines the first steps to rebuild the Galang Dana Insani Indonesia (GDII) web platform, based on `MODULE_BREAKDOWN_v1_0.md` and `DATABASE_DICTIONARY_v1_0.md`. 

## Goal Description
We will establish the foundational layer of the application:
1. **Module 1.1 Authentication:** Modify the `users` table, set up Laravel Fortify for backend authentication (login, register, logout, password reset), and prepare Inertia React pages for Auth.
2. **Module 1.2 RBAC:** Install and configure `spatie/laravel-permission`, create Seeders for roles and permissions as defined in the PRD, and set up middlewares.

## Proposed Changes

### Database & Models

#### [MODIFY] `database/migrations/0001_01_01_000000_create_users_table.php`
- Add `phone` (varchar 30, nullable, unique)
- Add `is_active` (boolean, default true)
- Add `last_login_at` (datetime, nullable)
- Add `deleted_at` (timestamp, nullable) for soft deletes.

#### [MODIFY] `app/Models/User.php`
- Add `SoftDeletes` and `HasRoles` (Spatie) traits.
- Update `$fillable` to include `phone`, `is_active`, `last_login_at`.
- Setup hidden fields and casts.

### Authentication (Fortify)

#### [NEW] `config/fortify.php` & Actions
- Run `php artisan fortify:install` to publish Fortify assets and actions.
- Modify `CreateNewUser` action to handle `phone`.
- Modify `FortifyServiceProvider` to register Inertia views for Login, Register, Forgot Password, and Reset Password.

### RBAC (Spatie Permission)

#### [NEW] `database/seeders/PermissionSeeder.php` & `RoleSeeder.php`
- Install `spatie/laravel-permission` and publish its migration.
- Create seeders for the permissions defined in PRD v1.0 Section 6.2.
- Map permissions to roles: Administrator, Program Officer, Verifikator, Keuangan, CS.

#### [MODIFY] `database/seeders/DatabaseSeeder.php`
- Call `PermissionSeeder` and `RoleSeeder`.
- Create a default Super Admin user account.

### Frontend Auth Pages (React / Inertia)

#### [NEW] `resources/js/Pages/Public/Auth/Login.jsx`
- Create the Login UI using React and Tailwind CSS.
- Connect to Fortify's `POST /login` route.

#### [NEW] `resources/js/Pages/Public/Auth/Register.jsx` (if needed)
- Setup Registration UI.

## Verification Plan

### Automated Tests
- Run `php artisan test --filter=AuthenticationTest` (we will create basic feature tests for login/logout).
- Run `php artisan test --filter=RolePermissionTest`.

### Manual Verification
- Run `php artisan migrate --seed` to ensure the database schema and default roles/users are created without error.
- Serve the application and attempt to visit `/login`.
- Login with the seeded Admin credentials and verify redirect logic.


<!-- MERGED FROM 01_phase_1_task.md -->

# Task Checklist: Phase 1 (Foundation)

- `[x]` 1. **Database & Models**
  - `[x]` Update `create_users_table` migration with `phone`, `is_active`, `last_login_at`, `deleted_at`.
  - `[x]` Update `User.php` model with `SoftDeletes`, `HasRoles`, and new fillables.
- `[x]` 2. **Authentication (Fortify)**
  - `[x]` Install & configure Laravel Fortify.
  - `[x]` Modify `CreateNewUser` action to handle `phone`.
  - `[x]` Configure `FortifyServiceProvider` for Inertia views.
- `[x]` 3. **RBAC (Spatie Permission)**
  - `[x]` Install `spatie/laravel-permission` and publish migration.
  - `[x]` Create `PermissionSeeder` and `RoleSeeder`.
  - `[x]` Update `DatabaseSeeder` to call seeders and create Admin user.
- `[x]` 4. **Frontend Auth Pages (React)**
  - `[x]` Create `resources/js/Pages/Public/Auth/Login.jsx`.
- `[x]` 5. **Verification**
  - `[x]` Run migrations and seeders (`php artisan migrate:fresh --seed`).
  - `[x]` Test login manually or via automated test.


<!-- MERGED FROM 01_phase_1_walkthrough.md -->

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
