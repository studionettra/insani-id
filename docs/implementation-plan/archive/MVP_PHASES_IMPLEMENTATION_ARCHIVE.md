# 🏛️ Arsip Rencana Implementasi Fase MVP — Insani Indonesia (GDII)

Dokumen ini merupakan konsolidasi arsip rencana kerja implementasi fondasi dan modul MVP (*Minimum Viable Product*) platform Insani Indonesia (`insani.id`) yang telah selesai dikerjakan (*shipped*).

---

## Daftar Isi
1. [Phase 1: Foundation (Auth & RBAC)](#phase-1-foundation-auth--rbac)
2. [Phase 2: i18n, Layout & Master Data](#phase-2-i18n-layout--master-data)
3. [Phase 8: Reports, Language Widget & SEO Finalization](#phase-8-reports-language-widget--seo-finalization)
4. [Company Profile Phase 1: WordPress Sync & Content Integration](#company-profile-phase-1-wordpress-sync--content-integration)
5. [Company Profile Phase 2: Perluasan RBAC & Master Data Pilar Program](#company-profile-phase-2-perluasan-rbac--master-data-pilar-program)

---

## Phase 1: Foundation (Auth & RBAC)

**Tujuan:** Membangun lapisan fondasi autentikasi dan kontrol akses berbasis peran (RBAC) sesuai `MODULE_BREAKDOWN_v1_0.md` dan `DATABASE_DICTIONARY_v1_0.md`.

### Rangkuman Implementasi:
1. **Autentikasi (Laravel Fortify):**
   - Modifikasi tabel `users`: penambahan kolom `phone`, `is_active`, `last_login_at`, dan trait `SoftDeletes`.
   - Setup Laravel Fortify untuk backend auth (login, register, logout, password reset, email verification).
   - Registrasi tampilan Inertia React untuk Login, Register, Forgot Password, dan Reset Password.
2. **RBAC (Spatie Laravel Permission):**
   - Instalasi dan migrasi tabel permission Spatie.
   - Pembuatan `PermissionSeeder` dan `RoleSeeder` untuk 8+ role (Administrator, Program Officer, Verifikator, Keuangan, Customer Service, dll).
   - Integrasi middleware permission pada rute administratif.

---

## Phase 2: i18n, Layout & Master Data

**Tujuan:** Menyelesaikan modul fondasi multibahasa (ID, EN, AR), tata letak antarmuka, dan master data (pengguna serta kategori donasi).

### Rangkuman Implementasi:
1. **Internasionalisasi (i18n):**
   - Integrasi `mcamara/laravel-localization` untuk deteksi bahasa pada URL (`/{locale}/...`).
   - Integrasi `spatie/laravel-translatable` untuk translasi JSON pada kolom nama dan deskripsi kategori.
   - Dukungan arah teks Right-to-Left (RTL) saat locale aktif adalah bahasa Arab (`ar`).
2. **Tata Letak & Identitas Visual:**
   - Standarisasi palet warna Insani pada Tailwind: Insani Turquoise (`#00D1B4`) dan Insani Blue (`#0080FF`).
   - Pembuatan wrapper layout admin (`AdminLayout.tsx`) dan publik (`PublicLayout.tsx`).
   - Komponen `SeoHead.tsx` untuk pembuatan meta tag Open Graph dan canonical dinamis.
3. **Master Data Management:**
   - CRUD Pengguna internal oleh Administrator (`UserController.php`).
   - CRUD Kategori Program Galang Dana (`CategoryController.php`) dengan dukungan translasi 3 bahasa dan pengaturan *platform fee*.

---

## Phase 8: Reports, Language Widget & SEO Finalization

**Tujuan:** Menyelesaikan modul administratif laporan dan penyempurnaan fitur publik (alih bahasa otomatis, SEO halaman program, dan footer).

### Rangkuman Implementasi:
1. **Modul Laporan Keuangan & Donasi:**
   - Pembuatan `ReportController.php` dengan fitur filter rentang tanggal.
   - Fitur ekspor CSV donasi dan pencairan dana (`exportDonations` dan `exportDisbursements`).
   - Halaman frontend pelaporan di panel admin (`resources/js/pages/Admin/Reports/Index.tsx`).
2. **Integrasi Alih Bahasa Navbar:**
   - Dropdown pemilihan bahasa pada navbar publik dengan dukungan translasi UI.
3. **Penyempurnaan SEO & Footer:**
   - Optimasi tag Open Graph dinamis pada halaman detail program (`/program/{slug}`).
   - Penataan footer publik mencakup legalitas yayasan, media sosial, dan tautan kebijakan.

---

## Company Profile Phase 1: WordPress Sync & Content Integration

**Tujuan:** Menghubungkan WordPress (sebagai CMS redaksi berita) dengan aplikasi Laravel Insani menggunakan sistem webhook dan background sync.

### Rangkuman Implementasi:
1. **Penyimpanan Lokal:**
   - Pembuatan tabel `blog_post_cache` untuk menyimpan cache artikel lokal demi kecepatan akses maksimal.
2. **Sanitasi HTML:**
   - Pemasangan `mews/purifier` untuk membersihkan konten HTML dari WordPress REST API guna mencegah serangan XSS.
3. **Sinkronisasi Otomatis:**
   - Pembuatan `BlogSyncService.php` untuk fetch artikel via WP REST API (`/wp-json/wp/v2/posts/...`).
   - Endpoint webhook `POST /webhooks/wordpress` yang diamankan token rahasia (`VerifyWordPressWebhookToken`).
   - Job terjadwal `FullSyncBlogPostsJob` untuk memastikan integritas artikel jika ada postingan yang dihapus langsung di WordPress.

---

## Company Profile Phase 2: Perluasan RBAC & Master Data Pilar Program

**Tujuan:** Memperluas kontrol akses untuk tim redaksi dan memperkaya kategori dengan fitur "Fokus Program / Pilar Yayasan".

### Rangkuman Implementasi:
1. **Role Content Editor:**
   - Pembuatan role `Content Editor` yang memiliki izin khusus untuk mengelola halaman statis, FAQ, manajemen tim, mitra, dan sinkronisasi artikel tanpa akses ke keuangan/donasi.
   - Penyesuaian navigasi sidebar admin agar menu konten tampil dinamis sesuai permission.
2. **Perluasan Kategori (Fokus Program):**
   - Migrasi penambahan kolom `is_focus_program` dan `pillar_image` pada tabel `categories`.
   - Local scope `scopeFocusProgram` pada model `Category`.
   - Kebijakan `CategoryPolicy::updatePillar()` yang mengizinkan `Administrator` dan `Content Editor` mengelola gambar pilar dan status fokus program.
