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
