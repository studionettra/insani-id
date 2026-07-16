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
