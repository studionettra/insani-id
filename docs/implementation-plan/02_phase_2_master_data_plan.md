# Implementation Plan: Phase 2 (i18n, Layout & Master Data)

Tujuan fase ini adalah menyelesaikan sisa modul fondasi (i18n, Layout, SEO) sekaligus merampungkan Master Data (Pengguna dan Kategori Donasi) sebagai prasyarat pembuatan Program Galang Dana di fase berikutnya.

## Proposed Changes

### 1. Internationalization (i18n) Foundation
Modul 1.3 sesuai spesifikasi PRD untuk mendukung 3 bahasa (ID, EN, AR) dan mode RTL.
#### [NEW] Instalasi Package
- `mcamara/laravel-localization` (untuk deteksi locale URL `/{locale}/...`).
- `spatie/laravel-translatable` (untuk translasi JSON pada model `Category`).
#### [MODIFY] Konfigurasi
- Set fallback locale ke `id`.
- Buat logic RTL pada layout utama jika locale saat ini adalah `ar`.

---

### 2. Layout, SEO & Color Palette
Modul 1.4 & 1.5 untuk memisahkan area publik dan internal secara tegas, dengan identitas visual merek Insani.
#### [NEW] Konfigurasi Warna (Tailwind)
- Menginjeksi warna dari logo `insani.id` ke dalam konfigurasi Tailwind:
  - **Insani Turquoise** (`#00D1B4`): Untuk *primary action* publik.
  - **Insani Blue** (`#0080FF` / `#054BAD`): Untuk *secondary action* atau elemen *trust*.
#### [NEW] `resources/js/Layouts/AdminLayout.jsx`
- *Wrapper* yang menghubungkan `TailAdmin/AppLayout` bawaan dengan data pengguna login dari Inertia.
- Menyesuaikan menu navigasi *sidebar* berdasarkan *Permission* pengguna, dengan penyesuaian nuansa warna Insani.
#### [NEW] `resources/js/Layouts/PublicLayout.jsx`
- Layout *mobile-first* (navbar responsif, bottom nav khusus *mobile*, footer).
- Mengintegrasikan *Language Switcher* untuk ganti bahasa (ID/EN/AR).
- Memanfaatkan gradasi dan perpaduan warna Biru dan Turquoise khas Insani untuk membangun _brand identity_ yang kuat tanpa terjebak kesan kaku.
#### [NEW] `resources/js/Components/SeoHead.jsx`
- Komponen pembungkus `<Head>` Inertia untuk men-generate tag *Open Graph* dan *Canonical/Hreflang* otomatis.

---

### 3. User Management (Internal Staff)
Modul 2.1: CRUD Pengguna oleh Administrator.
#### [NEW] `app/Http/Controllers/Admin/UserController.php`
- Logic Create, Read, Update, Delete untuk model `User`.
- Menyertakan validasi email unik dan sinkronisasi *Role*.
#### [NEW] `resources/js/Pages/Admin/Users/Index.jsx` (dan Form)
- Tabel manajemen pengguna menggunakan desain tabel TailAdmin.

---

### 4. Category Management
Modul 2.2: Kategori Donasi (Bencana, Kesehatan, Yatim, dll).
#### [NEW] `database/migrations/..._create_categories_table.php`
- Kolom: `name` (JSON), `slug`, `description` (JSON), `icon`, `platform_fee_percent` (decimal), `is_disaster_category`, `is_active`, `sort_order`.
#### [NEW] `app/Models/Category.php`
- Menggunakan trait `HasTranslations` dari Spatie untuk kolom `name` dan `description`.
#### [NEW] `app/Http/Controllers/Admin/CategoryController.php`
- Logic CRUD kategori dengan dukungan *platform fee* dan tab tiga bahasa.
#### [NEW] `resources/js/Pages/Admin/Categories/Index.jsx`
- Antarmuka manajemen kategori.

## Verification Plan

### Automated & Manual Verification
- Menjalankan `php artisan migrate` untuk memastikan tabel `categories` terbuat dengan baik.
- Login sebagai **Administrator** dan memastikan halaman `/admin/users` dan `/admin/categories` bisa diakses dan form CRUD bekerja dengan lancar.
- Memastikan halaman `/login` atau publik dapat diakses dengan prefix `/ar/login` dan merender tata letak dari kanan-ke-kiri (RTL).
