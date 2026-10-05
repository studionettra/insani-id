

<!-- MERGED FROM 09_company_profile_phase_2_plan.md -->

# Implementation Plan — Company Profile Phase 2

## 1. Pendahuluan
Dokumen ini merupakan penjabaran teknis implementasi **Phase 2: Perluasan RBAC & Master Data**. Pada fase ini, kita akan memperluas fungsionalitas Role-Based Access Control (RBAC) yang ada untuk mengakomodasi role baru, serta menambahkan fitur "Fokus Program" pada modul Kategori.

## 2. Module 2.1: Role Content Editor
- **Tujuan:** Menambahkan role khusus pengelola konten (`Content Editor`) agar staf redaksi bisa mengelola halaman website tanpa perlu memiliki akses ke transaksi Donasi/Program Galang Dana.
- **Seeder Role & Permission:** 
  - Akan diperbarui file `RoleAndPermissionSeeder` untuk mendaftarkan role `Content Editor`.
  - Mendaftarkan *permissions* spesifik: `page.*`, `faq.*`, `management.*`, `partner.*`, `impact-stat.*`, `blog.view`, `blog.sync-manual`.
- **Sidebar AdminLayout:** 
  - Menyesuaikan `resources/js/Layouts/AdminLayout.jsx` (atau file navigasi yang relevan) agar menu terkait Company Profile hanya muncul jika user memiliki *permission* yang sesuai.

## 3. Module 2.2: Perluasan Kategori (Fokus Program)
- **Tujuan:** Memperluas tabel `categories` (yang sudah ada untuk Galang Dana) agar mendukung fitur "Fokus Program / Pilar" (contoh: Pendidikan, Kesehatan, dll).
- **Migration Baru:** 
  - Membuat `ALTER TABLE` menggunakan migration Laravel (`add_focus_program_fields_to_categories_table`).
  - Menambahkan kolom `is_focus_program` (boolean, default false) dan `pillar_image` (string, nullable).
- **Model Category:**
  - Menambahkan local scope `scopeFocusProgram($query)` untuk mengambil kategori yang berstatus `is_focus_program = true`.
- **API & Policy:**
  - Menambahkan fungsi `CategoryPolicy::updatePillar()` yang mengizinkan `Administrator` dan `Content Editor` melakukan update pada fokus program. (Catatan: fungsi `update()` standar tetap dikunci hanya untuk `Administrator`).
  - Membuat endpoint `PATCH /admin/categories/{category}/pillar` yang di-handle oleh `CategoryController` (atau fungsi khusus) untuk update image dan status pilar tanpa menyentuh field sensitif lainnya (seperti nama atau *platform fee*).
- **Frontend (React/Inertia):**
  - Mengupdate halaman `Admin/Categories/Index.jsx` dan Form Kategori (misal: Edit.jsx) untuk menampilkan *toggle* "Fokus Program" dan unggah gambar *Pillar Image*. Tampilan ini hanya muncul/bisa diubah jika pengguna berhak (`can('updatePillar', category)`).

## 4. Keamanan & Testing
- Memastikan `Content Editor` tidak dapat secara paksa mengakses endpoint galang dana atau mengubah `platform_fee_percent` sebuah kategori (hanya pilar).
- Menambahkan Feature Test untuk Policy ini.


<!-- MERGED FROM 09_company_profile_phase_2_task.md -->

# Tasks - Company Profile Phase 2

## Module 2.1: Role Content Editor
- [x] Tambahkan role `Content Editor` ke `Database\Seeders\RolesAndPermissionsSeeder.php` atau seeder terkait.
- [x] Tambahkan permission baru: `page.*`, `faq.*`, `management.*`, `partner.*`, `impact-stat.*`, `blog.view`, `blog.sync-manual`.
- [x] Assign permission baru tersebut ke role `Content Editor` dan `Administrator`.
- [x] Jalankan seeder atau buat seeder terpisah agar mudah dieksekusi di server (misal `ContentEditorRoleSeeder`).
- [x] Perbarui `resources/js/Layouts/AdminLayout.jsx` untuk menampilkan menu Company Profile secara dinamis berdasarkan permission (menggunakan `$page.props.auth.permissions`).

## Module 2.2: Perluasan `categories` (Fokus Program)
- [x] Buat migration baru untuk tabel `categories` (tambah field `is_focus_program` dan `pillar_image`).
- [x] Update Model `Category` dengan menambahkan `$fillable` (jika menggunakan fillable) atau field yang sesuai, serta `scopeFocusProgram($query)`.
- [x] Buat `CategoryPolicy::updatePillar()` yang mengizinkan Administrator dan Content Editor. Pastikan metode `update()` biasa hanya untuk Administrator.
- [x] Buat Form Request `UpdateCategoryPillarRequest` untuk validasi tipe boolean pada `is_focus_program` dan validasi gambar `pillar_image`.
- [x] Tambahkan endpoint route baru `PATCH /admin/categories/{category}/pillar` di `routes/web.php` dan buat metodenya di `CategoryController`.
- [x] Update frontend `Admin/Categories/Index.jsx` & Form Modalnya (atau Edit.jsx) untuk menyertakan toggle Focus Program dan File Input untuk Pillar Image.

## Security & Testing
- [x] Tulis Feature Test (Pest) memastikan user `Content Editor` dapat mengupdate pilar kategori (`PATCH /admin/categories/{category}/pillar`).
- [x] Tulis Feature Test memastikan user `Content Editor` **TIDAK DAPAT** mengupdate nama/fee kategori (`PUT /admin/categories/{category}`).
- [x] Jalankan pest dan pastikan semuanya sukses.


<!-- MERGED FROM 09_company_profile_phase_2_walkthrough.md -->

# Walkthrough - Company Profile Phase 2

## Overview
Phase 2 dari modul **Company Profile** (Perluasan RBAC & Master Data Fokus Program) telah berhasil diselesaikan dengan baik! Pada tahap ini, platform telah dilengkapi dengan sistem keamanan Role-Based Access Control yang lebih baik serta pengayaan tabel Kategori untuk mendukung program utama lembaga.

## Changes Made

### 1. Role "Content Editor" (RBAC)
- Menggunakan `ContentEditorRoleSeeder` yang menyuntikkan Role baru yaitu `Content Editor`.
- Role ini telah diberikan hak (*permissions*) untuk mengelola komponen-komponen statis website seperti Page, FAQ, Banner, dsb. dengan ditandainya permission `category.view` namun **tanpa** akses untuk mengedit fee potongan uang (`category.update`).
- Integrasi *sidebar menu* (`app-sidebar.tsx`) di panel admin sudah mengecek `permissions` dengan tepat.

### 2. Perluasan Kategori (Pilar / Fokus Program)
- **Database & Model:** Penambahan field `is_focus_program` (boolean) dan `pillar_image` (string/file path) pada `Category` (sebelumnya sudah dimigrasi pada batch 10). Model juga mendapatkan local scope baru `Category::focusProgram()`.
- **Keamanan (Policies):** Membuat `App\Policies\CategoryPolicy`. Hanya Administrator yang bisa mengakses `update()`, tetapi Content Editor diizinkan mengakses metode `updatePillar()` yang secara spesifik hanya mengubah flag fokus program & gambar.
- **Form Request:** Membuat `UpdateCategoryPillarRequest` untuk memvalidasi unggahan gambar (maksimal 2MB, format gambar).
- **Controller & Routes:** Penambahan endpoint `PATCH /admin/categories/{category}/pillar` di `routes/web.php` untuk memisahkan domain keamanan pembaruan kategori.

### 3. Frontend & UI (Inertia React)
- Memperbarui komponen `resources/js/Pages/Admin/Categories/Index.tsx`.
- Sistem cerdas ditambahkan pada form modal: jika user *bukan* Administrator, sistem akan menyembunyikan konfigurasi sensitif seperti Biaya Platform (*Platform Fee*), Nama Kategori, dan Urutan.
- User *Content Editor* hanya akan melihat toggle "Pilar (Fokus Program)", unggah Gambar Pilar, dan Kategori Aktif, dan form secara cerdas otomatis diarahkan ke metode `PATCH` ke URL baru `/admin/categories/{id}/pillar`!
- Build ulang aset telah berhasil dijalankan (`npm run build`).

### 4. Pengujian Keamanan & Otomasi (Pest PHP)
- Membuat kelas `CategoryPillarTest`.
- Lulus tes pengujian `PATCH`: Memastikan Content Editor berhasil mengubah status pilar & upload gambar pilar.
- Lulus tes pengujian `PUT`: Mencegah insiden keamanan, jika Content Editor mencoba memaksa tembak endpoint edit reguler (`admin.categories.update`), sistem akan menolaknya (*403 Forbidden*).
- Lulus tes pengujian Administrator melakukan edit penuh.
- Hasil: 3 Tests, 5 Assertions sukses!

## Next Steps
Infrastruktur backend, database, middleware, perizinan (RBAC), serta frontend manajemen telah siap. Selanjutnya kita dapat beralih ke **Phase 3 (Pengembangan Controller API Data Publik & Landing Page React)** untuk menampilkan data-data yang telah kita kumpulkan tersebut di beranda dan halaman profil.
