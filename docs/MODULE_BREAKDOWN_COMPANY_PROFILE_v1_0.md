# MODULE BREAKDOWN — Company Profile Insani Indonesia

**Development Roadmap & Module Breakdown**
**Version:** 1.1 (Sinkron dengan PRD v1.1)
**Mengacu pada:** PRD_COMPANY_PROFILE_v1_0.md, ERD_COMPANY_PROFILE_v1_0.md, DATABASE_DICTIONARY_COMPANY_PROFILE_v1_0.md, API_SPEC_COMPANY_PROFILE_v1_0.md
**Stack:** Laravel 13 (aplikasi yang sama dengan Galang Dana), Inertia.js, React 18, Tailwind CSS (TailAdmin v2.3), WordPress (headless)

---

# Prasyarat

> **Modul ini dibangun DI ATAS aplikasi Laravel Galang Dana yang sudah ada** (lihat MODULE_BREAKDOWN Galang Dana v1.0). Foundation berikut **wajib sudah selesai** sebelum memulai phase di dokumen ini: Module 1.1 (Authentication), 1.2 (RBAC), 1.3 (i18n Foundation), 1.4 (Layout). Tidak diulang di sini.

---

# Development Strategy

```text
WordPress Headless Setup
    ↓
Perluasan RBAC (role Content Editor)
    ↓
Perluasan categories (Fokus Program)
    ↓
Static Content (Pages, FAQ, Management, Partners, Impact Stats)
    ↓
Halaman Publik (Home, Tentang, Fokus Program, Kontak)
    ↓
Blog Sync & Halaman Kabar
    ↓
Hardening & Testing
    ↓
Deployment (Cutover DNS — dieksekusi bersama Module 9.4 Galang Dana)
```

---

# PHASE 1 — WORDPRESS HEADLESS SETUP

## Module 1.1 Instalasi & Konfigurasi WordPress

**Deliverables:**
- Provisioning server terpisah untuk WordPress (instalasi baru, bersih)
- Install WP Core + plugin ACF (Advanced Custom Fields)
- **Tidak install** tema custom/Elementor/plugin frontend apapun — WordPress ini tidak pernah diakses publik langsung
- Buat custom mu-plugin/functionality kecil untuk mengirim webhook ke Laravel saat post di-publish/update/trash
- Setup token webhook di kedua sisi (`.env` Laravel & konstanta di WordPress)

**Acceptance Criteria:**
- WP-Admin bisa diakses staff penulis, terpisah dari sistem auth Laravel (tidak SSO)
- Publish artikel test berhasil mengirim webhook ke endpoint Laravel (bisa dicek di log, meski endpoint Laravel belum selesai di module ini)

---

## Module 1.2 Blog Sync Service (Laravel)

**Database:** `blog_post_cache`

**Deliverables:**
- `BlogSyncService` — client WP REST API (`GET /wp-json/wp/v2/posts/{id}?_embed`)
- Integrasi `mews/purifier` untuk sanitasi `content_html`
- Endpoint `/webhooks/wordpress` + middleware `verify.wordpress-webhook-token`
- **Dikecualikan dari CSRF protection**
- `FullSyncBlogPostsJob` — job scheduled (hourly) sebagai fallback

**Acceptance Criteria:**
- Webhook dari WordPress berhasil memicu sync satu artikel spesifik ke `blog_post_cache`
- Artikel dengan HTML berbahaya (mis. `<script>`) tersimpan dalam bentuk tersanitasi
- Job scheduled berhasil full-sync seluruh artikel dan menghapus entri yang sudah tidak ada di WordPress
- Webhook tanpa token valid ditolak (403)

**Dependency:** Module 1.1 harus selesai dulu (butuh WordPress hidup untuk testing).

---

# PHASE 2 — PERLUASAN RBAC & MASTER DATA

## Module 2.1 Role Content Editor

**Deliverables:**
- Tambah role `Content Editor` ke Role Seeder
- Tambah permission baru ke Permission Seeder (`page.*`, `faq.*`, `management.*`, `partner.*`, `impact-stat.*`, `blog.view`, `blog.sync-manual`)
- Update sidebar `AdminLayout` — menu baru muncul kondisional untuk role ini

**Acceptance Criteria:**
- User dengan role Content Editor hanya melihat menu yang relevan, tidak bisa akses modul Galang Dana yang bukan wewenangnya (mis. `disbursement.*`)

---

## Module 2.2 Perluasan `categories` (Fokus Program)

**Database:** `categories` (migration tambahan: `is_focus_program`, `pillar_image`)

**Deliverables:**
- Migration `ALTER TABLE categories`
- Update Form Category di `Admin/Categories/*.jsx` — tambah field toggle `is_focus_program` + upload `pillar_image`
- **Policy terpisah**: `CategoryPolicy::updatePillar()` (Administrator + Content Editor) vs `CategoryPolicy::update()` (Administrator only untuk field lain)
- Endpoint `PATCH /admin/categories/{category}/pillar`

**Acceptance Criteria:**
- Content Editor bisa toggle `is_focus_program` & upload `pillar_image` tanpa bisa mengubah `platform_fee_percent`/`name`
- Data mapping 6 kategori existing ke 6 pilar `insani.id` sudah dilakukan (kerja konten oleh tim Insani, bukan kerja development)

**Dependency:** Tabel `categories` dari Galang Dana harus sudah ada (given, karena ini extension).

---

# PHASE 3 — STATIC CONTENT MANAGEMENT

## Module 3.1 Halaman Statis (Pages)

**Database:** `pages`

**Deliverables:** CRUD dengan tab bahasa ID/AR/EN, upload attachment (khusus Logo Kit), seed data awal (`tentang-insani`, `logo-kit`)

**Pages:** `Admin/Pages/Index.jsx`, `Admin/Pages/Edit.jsx`

---

## Module 3.2 FAQ

**Database:** `faqs`

**Deliverables:** CRUD dengan tab bahasa, drag-to-reorder (`sort_order`)

**Pages:** `Admin/Faqs/Index.jsx`

---

## Module 3.3 Manajemen/Pengurus

**Database:** `management_members`

**Deliverables:** CRUD dengan tab bahasa (khusus `position`/`bio`), upload foto

**Pages:** `Admin/Management/Index.jsx`

---

## Module 3.4 Mitra

**Database:** `partners`

**Deliverables:** CRUD logo mitra, upload gambar, tautan website opsional

**Pages:** `Admin/Partners/Index.jsx`

---

## Module 3.5 Statistik Dampak

**Database:** `impact_stats`

**Deliverables:** CRUD dengan tab bahasa untuk `label`, grouping tampilan (Dalam Negeri/Luar Negeri/Umum), seed data awal (9 metrik)

**Pages:** `Admin/ImpactStats/Index.jsx`

**Dependency:** Module 2.1 (Content Editor role harus ada dulu untuk permission testing).

---

## Module 3.6 Homepage Banner

**Database:** `homepage_banners`

**Deliverables:** CRUD banner dengan upload gambar desktop/mobile terpisah (accessor fallback ke desktop jika mobile kosong), link CTA, toggle aktif, drag-to-reorder

**Pages:** `Admin/Banners/Index.jsx`

---

## Module 3.7 Form Kontak & Inbox Pesan

**Database:** `contact_messages`

**Deliverables:**
- Form publik `/kontak` dengan validasi anti-spam (Honeypot atau Cloudflare Turnstile)
- Notifikasi email otomatis ke Administrator/CS saat pesan baru masuk
- Halaman Inbox internal (list, filter belum/sudah dibaca, tandai dibaca)

**Pages:** `Public/Contact/Create.jsx`, `Admin/ContactMessages/Index.jsx`

**Acceptance Criteria:**
- Submission dengan honeypot terisi (bot) ditolak diam-diam, tidak masuk database
- Email notifikasi terkirim ke Administrator dalam <1 menit setelah submission valid
- Staff bisa menandai pesan sebagai dibaca, tercatat siapa & kapan

---

# PHASE 4 — HALAMAN PUBLIK

## Module 4.1 Halaman Beranda

**Deliverables:**
- Hero banner (carousel)
- Seksi Fokus Program (dari `categories::focusProgram()`)
- Seksi Statistik Dampak
- Seksi Program unggulan (reuse `Components/Public/Program/Card.jsx` dari Galang Dana)
- Seksi Artikel Kabar terbaru (dari `blog_post_cache`, butuh Module 1.2 selesai)
- Seksi Mitra
- Tombol "Donasi" menonjol di header

**Pages:** `Public/Home/Index.jsx`

**Dependency:** Module 2.2, 3.1–3.6, dan Module 1.2 (blog cache) untuk seksi artikel.

---

## Module 4.2 Halaman Tentang (Sub-halaman)

**Deliverables:** 6 sub-halaman (`/tentang/insani`, `/tentang/legal`, `/tentang/visi-misi`, `/tentang/faq`, `/tentang/logo`, `/tentang/manajemen`), landing `/tentang` dengan navigasi ke masing-masing

**Pages:** `Public/About/Index.jsx`, `Public/Page/Show.jsx`, `Public/Faq/Index.jsx`, `Public/Management/Index.jsx`

**Dependency:** Module 3.1, 3.2, 3.3.

---

## Module 4.3 Halaman Fokus Program

**Deliverables:** Listing pilar, link ke `/program?category={slug}` (halaman Galang Dana yang sudah ada)

**Pages:** `Public/FocusProgram/Index.jsx`

**Dependency:** Module 2.2.

---

## Module 4.4 Halaman Kontak

**Deliverables:** Info statis (alamat, telepon, email, peta — reuse `app_settings` grup `about`) **digabung** dengan form "Hubungi Kami" dari Module 3.7 (`contact_messages`) dalam 1 halaman publik

**Pages:** `Public/Contact/Create.jsx` (menyatukan info statis + form, bukan 2 halaman terpisah)

**Dependency:** Module 3.7 harus selesai dulu (backend form & anti-spam).

---

# PHASE 5 — HALAMAN KABAR (BLOG PUBLIK)

## Module 5.1 Listing & Detail Artikel

**Deliverables:**
- `/kabar` — listing dengan filter kategori, search sederhana
- `/kabar/{slug}` — detail, render `content_html` (sudah tersanitasi)
- **Tidak** ada language switcher penuh (Bahasa Indonesia saja), tapi tetap mewarisi `PublicLayout`

**Pages:** `Public/Blog/Index.jsx`, `Public/Blog/Show.jsx`

**Business Rule:** Selalu baca dari `blog_post_cache` lokal, **tidak pernah** live call ke WordPress saat request publik.

**Dependency:** Module 1.2 (Blog Sync Service) harus selesai & sudah ada data tersinkronisasi untuk testing.

---

## Module 5.2 Monitoring Sinkronisasi (Internal)

**Deliverables:** Halaman status sync (`lastSyncedAt`, jumlah artikel), tombol resync manual

**Pages:** `Admin/BlogSync/Index.jsx`

**Dependency:** Module 1.2.

---

# PHASE 6 — HARDENING & TESTING

## Module 6.1 Security

**Deliverables:**
- Policy `CategoryPolicy::updatePillar()` vs `update()` teruji benar
- Validasi token webhook WordPress
- Audit `mews/purifier` config — pastikan allow-list tag cukup untuk kebutuhan konten (embed video, gambar) tapi tetap aman

## Module 6.2 Testing

**Coverage Target:** Minimum 80% untuk modul baru di proyek ini

**Test wajib mencakup:**
- Sync artikel dari WordPress (mock WP REST API response) — data tersimpan benar & tersanitasi
- Fallback scheduled sync menghapus artikel yang sudah tidak ada di WordPress
- Permission Content Editor tidak bisa akses modul Galang Dana yang bukan wewenangnya
- Field pilar `categories` bisa diubah Content Editor, field lain tidak bisa
- Fallback locale untuk konten `pages`/`faqs`/dst yang belum diterjemahkan ke AR/EN

---

# PHASE 7 — DEPLOYMENT

## Module 7.1 Cutover Bersama Galang Dana

> Dieksekusi **bersamaan** dengan Module 9.4 di MODULE_BREAKDOWN Galang Dana v1.0 (Strategi Deployment & Cutover Domain) — bukan proses terpisah, karena keduanya 1 aplikasi yang sama.

**Deliverables Tambahan Khusus Proyek Ini:**
- Update 301 redirect map: URL WordPress lama untuk halaman Tentang/Fokus Program/Kabar (`/tentang/`, `/fokus-program/`, `/kabar/`, dst di WordPress lama) → struktur URL baru
- Migrasi konten dari WordPress lama ke instalasi WordPress headless baru (export/import artikel blog existing)
- Pastikan `blog_post_cache` sudah terisi penuh (full-sync manual) sebelum cutover, supaya tidak ada halaman kosong saat DNS berpindah

**Acceptance Criteria:**
- Seluruh halaman company profile & blog tayang penuh di `insani.id` produksi
- Tidak ada broken link dari URL WordPress lama yang sudah ter-index Google

---

# DEVELOPMENT ORDER (FINAL)

```text
(Prasyarat: Foundation Galang Dana Module 1.1-1.4 sudah selesai)

01 Instalasi & Konfigurasi WordPress Headless
02 Blog Sync Service (webhook + fallback scheduled)

03 Role Content Editor (RBAC)
04 Perluasan categories (Fokus Program)

05 Halaman Statis (Pages)
06 FAQ
07 Manajemen/Pengurus
08 Mitra
09 Statistik Dampak
10 Homepage Banner
11 Form Kontak & Inbox Pesan

12 Halaman Beranda
13 Halaman Tentang (sub-halaman)
14 Halaman Fokus Program
15 Halaman Kontak (info statis + form)

16 Listing & Detail Artikel Kabar
17 Monitoring Sinkronisasi Blog (Internal)

18 Security
19 Testing

20 Cutover Deployment (bersama Galang Dana)
```

---

# Definition of Done (DoD)

Sebuah module dianggap selesai apabila:

- [ ] Migration selesai dan sesuai DATABASE_DICTIONARY_COMPANY_PROFILE v1.0
- [ ] Model selesai, termasuk trait `HasTranslations` untuk field JSON translatable
- [ ] Seeder selesai (Role Content Editor, Permission baru, seed data Pages/Impact Stats awal)
- [ ] Controller selesai (dipisah `Admin/` dan `Public/`)
- [ ] Untuk modul blog: sinkronisasi teruji dengan mock WP REST API, sanitasi HTML terverifikasi
- [ ] Permission middleware & Policy terpasang sesuai PRD_COMPANY_PROFILE v1.0 Section 4
- [ ] Inertia Page selesai, memakai `AdminLayout` atau `PublicLayout` (folder `Components/Public/Profile/`)
- [ ] Untuk halaman publik (kecuali Kabar): berfungsi benar di 3 locale (ID/AR/EN + RTL)
- [ ] Testing berhasil
- [ ] Tidak ada error pada build

```bash
php artisan test
npm run build
```

Harus sukses tanpa error sebelum lanjut ke module berikutnya.
