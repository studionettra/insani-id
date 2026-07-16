# PRD — Company Profile Insani Indonesia

**Version:** 1.1 (Rekonsiliasi pasca-review Antigravity — Headless WordPress dipertahankan, tambah Homepage Banner & Contact Message)
**Status:** Draft — Menunggu Review
**Architecture:** Laravel Monolith + Inertia.js (**ekstensi dari aplikasi yang sama dengan Galang Dana Insani Indonesia**, bukan proyek/codebase terpisah)
**Benchmarking:** Struktur insani.id saat ini (WordPress), npc.id/digital.npc.id/blog.npc.id
**Last Updated:** Juli 2026

---

# 1. Executive Summary

## Product Name
Company Profile Insani Indonesia — **nama proyek internal**. Brand yang tampil di UI tetap **"Insani Indonesia"**, konsisten dengan konvensi penamaan di PRD Galang Dana v1.0 Section 11.1.

## Project Goal

Membangun ulang sisi **company profile** `insani.id` (Beranda, Tentang, Fokus Program, Kontak, Statistik Dampak, Mitra) menggantikan situs WordPress + Elementor yang sekarang dinilai tidak proper, **sambil tetap mempertahankan WordPress khusus sebagai backend penulisan blog ("Kabar")** dalam mode **headless** — staff tetap menulis di editor WordPress yang familiar, tapi pembaca melihatnya 100% dalam desain aplikasi Laravel kita, tanpa jejak visual WordPress sama sekali.

## Hubungan dengan Proyek Galang Dana

**Ini bukan aplikasi baru.** Proyek ini adalah **fase kedua dari aplikasi Laravel yang sama** dengan Galang Dana Insani Indonesia (lihat PRD Galang Dana v1.0 Section 11.1 — keduanya memang direncanakan hidup di 1 domain `insani.id`, path-based). Konsekuensinya:

- **Reuse penuh**, tidak dibangun ulang: tabel `users`, sistem RBAC (Spatie Permission), `app_settings`, infrastruktur i18n (`spatie/laravel-translatable`, `mcamara/laravel-localization`), `AdminLayout` (TailAdmin v2.3), `PublicLayout` (shell yang sama)
- **Folder `Components/Public/Profile/`** yang sudah dialokasikan sebagai placeholder di PRD Galang Dana Section 11 kini diisi penuh di proyek ini
- **Tabel `categories`** yang sudah ada di skema Galang Dana **diperluas** (bukan dibuat tabel baru) untuk merangkap fungsi "Fokus Program" — lihat Section 5 untuk detail keputusan ini
- Dokumen ini (PRD, ERD, Database Dictionary, API Spec, Module Breakdown) ditulis **terpisah** dari dokumen Galang Dana murni untuk kerapian dokumentasi per-fase, **bukan** karena ini sistem yang berbeda

## Urutan Rilis

Sesuai keputusan di PRD Galang Dana v1.0 Section 11.1: **modul Galang Dana dirilis lebih dulu**. Company Profile menyusul sebagai fase pembangunan berikutnya di aplikasi yang sama, dengan strategi cutover DNS yang sudah didefinisikan di MODULE_BREAKDOWN Galang Dana v1.0 Module 9.4.

---

# 2. Architecture Decision

## Reuse Arsitektur dari Galang Dana (Tidak Diulang di Sini)

Seluruh keputusan arsitektur dasar berikut **berlaku identik**, lihat PRD Galang Dana v1.0 untuk detail lengkap:
- Laravel 13 Monolith + Inertia.js + React 18
- TailAdmin v2.3 (internal) + Tailwind CSS custom (publik)
- Multi-bahasa ID/AR/EN + RTL (`spatie/laravel-translatable`, `mcamara/laravel-localization`)
- Domain `insani.id`, path-based, 1 `PublicLayout` untuk seluruh halaman publik
- Backup database harian (`spatie/laravel-backup`)

## Keputusan Arsitektur BARU Khusus Proyek Ini: WordPress Headless untuk Blog

Setelah didiskusikan, dipilih pendekatan **headless CMS**, bukan WordPress berdiri sendiri dengan tema sendiri. Rasionalisasi:

| Pertimbangan | Alasan Pilih Headless |
|---|---|
| Konsistensi visual | Menghindari masalah yang ditemukan di benchmark `blog.npc.id` — tampilan & struktur (mis. halaman Legalitas/Kontak) yang tidak sinkron dengan situs utama karena sistem terpisah |
| Pengalaman staff penulis | Tetap pakai editor WordPress (Gutenberg) yang sudah familiar — tidak perlu membangun CMS blog custom dari nol di Laravel |
| SEO & performa | Konten di-cache lokal di tabel Laravel (`blog_post_cache`), tidak bergantung pada uptime/kecepatan server WordPress saat halaman diakses publik |

**Instalasi WordPress:** **Baru, bersih** — bukan reuse instalasi lama. Cakupan WordPress baru ini **hanya** WP Core + REST API bawaan + plugin **ACF (Advanced Custom Fields)** untuk field terstruktur. Tidak perlu tema/Elementor/plugin frontend apapun karena WordPress ini tidak pernah dilihat publik secara langsung.

**Autentikasi:** **Tidak ada SSO** antara Laravel dan WP-Admin (keputusan dikonfirmasi) — WP-Admin memakai login WordPress standar, terpisah dari sistem auth `insani.id`. Cakupan penulis dibatasi tim kecil (marketing/konten).

**Bahasa Konten Blog:** **Bahasa Indonesia saja untuk MVP** — tidak ikut aturan trilingual (ID/AR/EN) yang berlaku untuk konten Galang Dana & halaman company profile lain. Artikel blog murni informasi publik domestik, prioritas lebih rendah untuk terjemahan dibanding konten transaksional/legalitas.

**Mekanisme Sinkronisasi:**
1. Staff publish/update artikel di WP-Admin
2. Plugin/functionality kecil di WordPress mengirim **webhook** ke Laravel (`POST /webhooks/wordpress`) berisi ID post yang berubah
3. Laravel memvalidasi token webhook, lalu memanggil **WP REST API** (`GET /wp-json/wp/v2/posts/{id}?_embed`) untuk mengambil data lengkap (judul, konten, excerpt, featured image, kategori)
4. Data di-*upsert* ke tabel `blog_post_cache` di database Laravel
5. **Fallback:** scheduled job (mis. tiap jam) melakukan full-sync sebagai jaring pengaman jika webhook gagal terkirim

**Sanitasi Konten:** Karena `content_html` dari WordPress disimpan & dirender langsung sebagai HTML di halaman publik, wajib melalui **HTML sanitizer** (allow-list tag aman) sebelum disimpan ke `blog_post_cache` — mencegah risiko stored XSS meski penulisnya staff internal terpercaya (defense in depth).

---

# 3. Reuse & Perluasan Tech Stack

Seluruh stack dari PRD Galang Dana v1.0 Section 3 berlaku sama. Tambahan khusus proyek ini:

| Component | Technology |
|---|---|
| Blog CMS Backend | WordPress (instalasi baru, headless — WP Core + REST API + ACF) |
| Blog Sync | Custom webhook handler + WP REST API client (Laravel HTTP Client) |
| HTML Sanitization | `mews/purifier` (wrapper HTMLPurifier untuk Laravel) — membersihkan `content_html` dari WordPress sebelum disimpan/dirender |

---

# 4. RBAC — Peran & Permission Baru

Reuse role `Administrator` (akses penuh, termasuk seluruh modul di dokumen ini). Ditambah 1 role baru:

| Role Baru | Deskripsi |
|---|---|
| **Content Editor** | Mengelola konten company profile: halaman statis, FAQ, profil manajemen, mitra, statistik dampak, dan field tampilan pilar di kategori. **Tidak** mengelola konten blog (itu domain WordPress-Admin, di luar sistem permission Laravel) |

### Permission Baru (Granular Dot-Notation, konsisten pola Galang Dana)

```text
page.view          page.update
faq.view           faq.create        faq.update        faq.delete
management.view    management.create management.update management.delete
partner.view       partner.create    partner.update    partner.delete
impact-stat.view   impact-stat.create impact-stat.update impact-stat.delete
homepage-banner.view homepage-banner.create homepage-banner.update homepage-banner.delete
contact-message.view contact-message.reply
blog.view          blog.sync-manual
```

### Role → Permission Mapping

| Role | Permission Set |
|---|---|
| **Administrator** | Seluruh permission di atas + seluruh permission Galang Dana yang sudah ada |
| **Content Editor** | `dashboard.view`, `page.*`, `faq.*`, `management.*`, `partner.*`, `impact-stat.*`, `homepage-banner.*`, `contact-message.*`, `blog.view`, `blog.sync-manual`, `category.update` (khusus field tampilan pilar, lihat Section 5) |

> `category.view`/`category.create`/`category.delete` **tetap** eksklusif Administrator (konsisten kebijakan Galang Dana) — Content Editor hanya diberi `category.update` supaya bisa mengatur field pilar tanpa bisa menghapus/membuat kategori baru yang berdampak ke sistem donasi.

---

# 5. Keputusan Kunci: Penyatuan "Fokus Program" dengan `categories`

**Dikonfirmasi:** `categories` (tabel yang sudah ada di skema Galang Dana) **diperluas**, bukan membuat tabel `focus_programs` baru terpisah.

**Field baru ditambahkan ke `categories`:**
- `is_focus_program` (boolean, default `false`) — menandai kategori mana yang tampil sebagai pilar strategis di homepage/`Fokus Program`. Tidak semua kategori otomatis jadi pilar (Administrator/Content Editor yang mengaktifkan)
- `pillar_image` (varchar, nullable) — gambar banner besar untuk tampilan pilar (beda dari `icon` yang cuma simbol kecil untuk chip kategori di listing program)

**Manfaat keputusan ini:**
- 1 sumber data — tidak ada risiko "Ketahanan Pangan" di halaman Fokus Program berbeda datanya dari kategori "Ketahanan Pangan" di listing program Galang Dana
- Halaman `/fokus-program` bisa link langsung ke `/program?category={slug}`, menampilkan seluruh campaign aktif di pilar tersebut — mengintegrasikan company profile dengan mesin donasi secara mulus
- Menghindari duplikasi konten multi-bahasa (kalau dipisah, `name`/`description` harus diterjemahkan 2x untuk konsep yang sama)

**Migrasi data:** 6 kategori existing di seed Galang Dana (Bencana Alam, Kesehatan, Pendidikan, Pemberdayaan, Yatim, Kemanusiaan) di-mapping manual oleh Administrator ke 6 pilar `insani.id` yang sekarang (Ketahanan Pangan, Ketersediaan Air, Kesehatan Bersama, Pendidikan Berkualitas, Pemberdayaan Ekonomi, Tanggap Bencana) — kemungkinan ada penyesuaian nama/jumlah kategori saat proses ini (di luar scope teknis, keputusan konten oleh tim Insani).

---

# 6. Core Modules

## 6.1 Halaman Beranda (Home)

- **Hero Banner Slider** — dikelola Content Editor via tabel `homepage_banners`: gambar desktop & mobile terpisah (fallback ke desktop jika mobile kosong), judul internal, link CTA, urutan tampil, toggle aktif/nonaktif
- Seksi Fokus Program — pilar dari `categories WHERE is_focus_program = true`, link ke listing program per kategori
- Seksi Statistik Dampak ("Insani Dalam Angka") — dikelompokkan Dalam Negeri/Luar Negeri, dari tabel `impact_stats` (9 metrik, input manual — lihat Section 7.4)
- Seksi Program/Campaign unggulan (cross-link ke modul Galang Dana — reuse komponen `Components/Public/Program/Card.jsx` yang sudah ada)
- Seksi Artikel Kabar terbaru (dari `blog_post_cache`)
- Seksi Mitra (logo grid, dari tabel `partners`)
- **Tombol "Donasi"/"Galang Dana" menonjol di header** (konsisten pola benchmark npc.id/digital.npc.id/blog.npc.id — CTA ini muncul di SETIAP halaman, bukan cuma beranda)

## 6.2 Halaman Tentang (Dropdown/Sub-halaman)

Menggantikan halaman "Tentang Kami" sederhana yang sempat dibuat minimal di PRD Galang Dana Section 7.9 (berbasis `app_settings`) — **digantikan** oleh struktur halaman penuh berbasis tabel `pages`:

- `/tentang/insani` — Profil lembaga, sejarah, narasi lengkap
- `/tentang/legal` — Legalitas (nomor SK Kemenkumham — tetap ambil dari `about.nomor_legalitas` & `about.nama_legal` di `app_settings`, tidak dipindah ke `pages`)
- `/tentang/visi-misi` — Visi, Misi, Values (bisa tetap ambil dari `app_settings` grup `about`, ATAU dipindah ke `pages` jika kontennya berkembang jadi lebih dari sekadar teks pendek — keputusan implementasi, tidak mengubah data donatur)
- `/tentang/faq` — dari tabel `faqs`
- `/tentang/logo` — Logo Kit (unduhan aset logo resmi, dari tabel `pages` dengan file attachment)
- `/tentang/manajemen` — Profil pengurus/manajemen, dari tabel `management_members`

## 6.3 Halaman Fokus Program

- Listing pilar dari `categories WHERE is_focus_program = true`
- Setiap pilar linking ke `/program?category={slug}` (halaman listing Galang Dana yang sudah ada)

## 6.4 Halaman Kabar (Blog, Headless WordPress)

- `/kabar` — listing artikel dari `blog_post_cache`, filter kategori (dari `wp_category` hasil sync), pencarian judul/excerpt
- `/kabar/{slug}` — detail artikel, render `content_html` (sudah disanitasi)
- **Bahasa Indonesia saja** (tidak ada language switcher di halaman ini untuk MVP, atau tetap tampil tapi menampilkan pesan "belum tersedia dalam bahasa ini" untuk AR/EN — keputusan UI, default: sembunyikan switcher di halaman blog)
- **Tombol share** (WhatsApp, Facebook, Twitter/X) di halaman detail — konsisten dengan tombol share yang sudah ada di halaman program Galang Dana (PRD Galang Dana v1.1 Section 9)
- **Tidak ada fitur komentar** pada artikel — keputusan sadar untuk mencegah moderasi spam; interaksi donatur difokuskan ke Galang Dana (komentar/doa di halaman program), bukan blog
- **Sidebar kanan (opsional, disiapkan strukturnya)** di halaman detail — area kosong yang bisa diisi embed campaign Galang Dana terkait atau ruang iklan/promosi di masa depan (placeholder layout, tidak perlu tabel database baru untuk MVP)
- **SEO wajib**: meta title/description per artikel (dari WordPress via `_embed`), Open Graph tags, canonical URL — mengikuti pola SEO yang sama dengan halaman program (PRD Galang Dana v1.1 Section 9.1)

## 6.5 Halaman Kontak

- Form "Hubungi Kami" publik (`/kontak`): Nama Lengkap, Email, Subjek, Pesan — dilindungi **Honeypot** atau **Cloudflare Turnstile** untuk mencegah spam bot
- Info statis pendukung: alamat kantor, telepon, email, peta (reuse `app_settings` grup `about`: `alamat_kantor`, `google_maps_url`, `contact_email`) — data ini **sudah ada** dari PRD Galang Dana, tidak perlu tabel baru
- **Sisi internal**: Inbox pesan masuk di dashboard (role CS atau Content Editor), notifikasi email otomatis ke admin saat ada pesan baru, tandai sudah dibaca (`is_read`, `read_by`, `read_at`)

## 6.6 Manajemen Konten (Internal — Content Editor)

- CRUD Halaman Statis (`pages`) dengan tab bahasa ID/AR/EN
- CRUD FAQ dengan tab bahasa
- CRUD Profil Manajemen/Pengurus dengan tab bahasa (nama & foto tidak perlu terjemahan, jabatan & bio perlu), termasuk tautan opsional LinkedIn/Instagram
- CRUD Mitra (logo, nama, tautan website)
- CRUD Statistik Dampak — **9 metrik** input manual (**tidak dihitung otomatis dari data donasi**), karena metrik seperti "jumlah negara"/"penerima manfaat" adalah data lapangan yang tidak bisa di-derive dari `donations`
- CRUD Hero Banner Beranda (`homepage_banners`) — upload gambar desktop/mobile, link CTA, urutan, toggle aktif
- CRUD/Inbox Pesan Kontak (`contact_messages`) — lihat daftar, tandai dibaca, notifikasi email otomatis saat pesan baru masuk
- Toggle `is_focus_program` + upload `pillar_image` per kategori (bagian dari modul Category yang sudah ada, bukan modul baru)
- Monitor status sinkronisasi blog (`blog.view`) + tombol resync manual (`blog.sync-manual`) untuk troubleshooting jika webhook WordPress gagal

---

# 7. Business Rules (Klarifikasi Penting)

## 7.1 Sanitasi Konten Blog

`content_html` dari WordPress **wajib** melalui `mews/purifier` sebelum disimpan ke `blog_post_cache`. Tag berbahaya (`<script>`, event handler inline, dll) dihapus otomatis, meski sumbernya staff internal terpercaya — prinsip defense in depth untuk konten yang dirender langsung sebagai HTML.

## 7.2 Keandalan Sinkronisasi Blog

Webhook adalah mekanisme utama sync (real-time), **tapi tidak diandalkan 100%** — scheduled job full-sync (interval disarankan tiap 1 jam) berjalan sebagai fallback, mengambil seluruh post dari WP REST API dan meng-upsert ke `blog_post_cache`, menghapus entri yang sudah tidak ada di WordPress (post di-unpublish/dihapus).

## 7.3 Kepemilikan Field `categories`

Field asli (`name`, `description`, `icon`, `platform_fee_percent`, `is_disaster_category`, `slug`) tetap dikelola sesuai kebijakan Galang Dana (Administrator only, CRUD penuh). Field baru (`is_focus_program`, `pillar_image`) bisa diubah oleh **Administrator maupun Content Editor** — pemisahan permission ini di level field, bukan di level tabel, sehingga tetap 1 form Category tapi hak akses granular per kelompok field (diimplementasikan di Form Request/Policy, bukan constraint database).

## 7.4 Statistik Dampak Tidak Real-Time

`impact_stats` murni **input manual** oleh Content Editor/Administrator — bukan hasil query otomatis dari data Galang Dana. Ini keputusan sadar karena cakupan metrik (jumlah negara, penerima manfaat lapangan) melampaui apa yang bisa dilacak sistem donasi online.

## 7.5 Anti-Spam Form Kontak

Form `/kontak` **wajib** dilindungi salah satu dari: **Honeypot** (field tersembunyi yang hanya diisi bot) atau **Cloudflare Turnstile** (challenge tanpa CAPTCHA visual mengganggu). Submission yang terdeteksi bot ditolak sebelum masuk ke `contact_messages` — tidak perlu tercatat sebagai data sampah di database.

---

# 8. UI Standards — Halaman Company Profile

Berbeda dari halaman Galang Dana yang app-like/transaksional, halaman company profile lebih **editorial & showcase-oriented** — tapi tetap 1 `PublicLayout`, 1 sistem token Tailwind:

| Elemen | Standar |
|---|---|
| Breakpoint | Tetap mobile-first (Tailwind default), tapi penambahan signifikan di breakpoint desktop (grid multi-kolom untuk statistik, mitra, artikel) — lebih kaya visual di desktop dibanding halaman Galang Dana |
| Hero | Banner besar dengan CTA ganda ("Donasi Sekarang" + "Pelajari Lebih Lanjut") |
| Statistik Dampak | Grid angka besar dengan counter animation (opsional, nice-to-have) |
| Grid Mitra | Logo grayscale yang berubah warna saat hover (pola umum showcase partner) |
| Artikel Kabar | Card dengan featured image, judul, excerpt, tanggal publish |
| Navigasi | Tetap bottom nav di mobile (konsisten Galang Dana), tapi ditambah top nav dropdown "Tentang" khusus desktop (submenu tidak muat di bottom nav mobile — pakai halaman `/tentang` sebagai landing dengan link ke sub-halaman di mobile) |

---

# 9. Development Phases

| Phase | Deliverables |
|---|---|
| **Phase 1 (MVP)** | Setup WordPress headless (instalasi baru + ACF + webhook), `blog_post_cache` + sync mechanism, Halaman Beranda, Halaman Tentang (seluruh sub-halaman), Halaman Fokus Program (extend `categories`), Halaman Kabar, Halaman Kontak, Manajemen Konten Internal (Content Editor role) |
| **Phase 2** | Counter animation statistik, filter kategori artikel Kabar, pencarian artikel |
| **Phase 3** | Terjemahan blog (jika kebutuhan AR/EN berkembang), integrasi newsletter/subscribe |

---

# 10. Success Criteria

- Halaman company profile (Beranda, Tentang + sub-halaman, Fokus Program, Kontak) tayang penuh di `insani.id`, menggantikan WordPress+Elementor lama
- Staff bisa menulis & publish artikel di WP-Admin, dan dalam <5 menit (via webhook) artikel tersebut tayang di `insani.id/kabar` dengan tampilan 100% konsisten desain Laravel kita
- Tidak ada downtime blog jika WordPress backend sedang maintenance (karena publik membaca dari cache lokal `blog_post_cache`, bukan live dari WordPress)
- Klik pilar "Fokus Program" di homepage mengarah ke listing program Galang Dana yang benar & konsisten datanya
- Tombol "Donasi"/"Galang Dana" tampil menonjol & konsisten di header setiap halaman company profile
- Seluruh halaman company profile (kecuali Kabar) mendukung 3 bahasa ID/AR/EN dengan RTL yang benar untuk Arab
- Content Editor bisa mengelola seluruh konten (halaman statis, FAQ, manajemen, mitra, statistik, pilar) tanpa butuh akses Administrator penuh
