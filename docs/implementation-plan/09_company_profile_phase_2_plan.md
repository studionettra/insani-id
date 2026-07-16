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
