# PRD — Galang Dana Insani Indonesia (GDII)

**Version:** 1.1 (Open Questions Resolved)
**Status:** Draft Reviewed — Seluruh Open Questions Terjawab
**Architecture:** Laravel Monolith + Inertia.js
**Benchmarking:** Kitabisa.com, Amalsholeh.com, Adaradonation.com (di luar fitur Install Aplikasi & Zakat)
**Last Updated:** 13 Juli 2026

---

# 1. Executive Summary

## Product Name
Galang Dana Insani Indonesia (GDII) — **nama proyek internal untuk keperluan dokumentasi & development saja.** Brand yang tampil di seluruh UI publik, media sosial, dan komunikasi resmi tetap **"Insani Indonesia"** (nama badan hukum: Yayasan Peduli Insani Indonesia, dipakai terbatas hanya di halaman Legalitas). Lihat Section 11.1 untuk detail lengkap konvensi penamaan.

## Project Goal

Membangun platform crowdfunding/donasi online berbasis web yang:

1. **Dioptimalkan untuk operasional internal Insani Indonesia** — tim internal (Fundraising, Program, Keuangan, Admin) menjadikan platform ini sebagai alat utama untuk membuat, mengelola, memverifikasi, dan melaporkan program-program galang dana resmi lembaga.
2. **Terbuka untuk penggalang dana eksternal** — individu maupun lembaga/yayasan mitra lain dapat mendaftar, diverifikasi, dan membuat halaman program galang dana sendiri di platform ini, mengikuti model Kitabisa (individu + lembaga) dengan lapisan verifikasi bertingkat ala Amal Sholeh.

Dengan kata lain: GDII bukan sekadar situs donasi publik, tapi juga **sistem manajemen fundraising internal** yang kebetulan juga melayani publik sebagai donatur dan mitra campaigner.

## Prinsip Utama

> **Internal-first, public-facing second.** Setiap keputusan desain modul harus mempertimbangkan dulu: "Apakah ini memudahkan tim internal Insani mengelola & mengaudit program?" — baru kemudian: "Apakah ini nyaman untuk donatur/campaigner eksternal?"

---

# 2. Architecture Decision

## Chosen Architecture: Laravel Full Stack Monolith

```text
Laravel 13
│
├── Routes (web.php)
├── Controllers
├── Services
├── Models
├── Spatie Permission
├── Spatie Activitylog
│
└── Inertia.js
      │
      └── React Pages
             │
             └── TailAdmin v2.3 (Tailwind CSS)
```

## Kenapa Tetap Monolith?

- Tidak perlu REST API terpisah, tidak perlu token auth (Sanctum/Passport)
- Satu codebase untuk sisi internal (dashboard staff) dan sisi publik (donor-facing)
- Audit trail terpusat (Spatie Activitylog) penting karena ini platform yang menangani uang donasi

## ⚠️ Keputusan Arsitektur Penting: Dua Wajah UI

GDII punya **dua audiens dengan kebutuhan visual berbeda**, sehingga tidak bisa memakai satu UI Kit yang sama untuk semuanya:

| Sisi | Pengguna | UI Kit | Prinsip Desain |
|---|---|---|---|
| **Internal/Admin Panel** | Administrator, Fundraising Officer, Verifikator, Keuangan, CS | **TailAdmin v2.3** (Tailwind, dashboard-oriented) | Data-dense, efisien, desktop-first (tapi tetap responsive) |
| **Public/Donor-Facing** | Donatur, Calon Campaigner (individu/lembaga) | **Custom UI**, terinspirasi Kitabisa & Amal Sholeh | **Mobile-first**, storytelling, conversion-oriented (donasi cepat) |

> **Keputusan final:** TailAdmin v2.3 dipakai **khusus untuk area internal (`/admin/*`)** — tempat staff mengelola program, verifikasi, folio donasi, laporan. Halaman publik (`/`, `/program/{slug}`, `/donasi/...`, halaman buat program) **TIDAK** memakai komponen dashboard TailAdmin apa adanya, karena TailAdmin didesain untuk admin panel (tabel data, chart, form CRUD), bukan halaman marketing/campaign publik yang butuh hero image, progress bar donasi besar, tombol CTA donasi mengambang (sticky), dsb. Namun keduanya tetap satu design system: warna, tipografi, dan token Tailwind yang sama, hanya komponen/layout berbeda.

Baik area internal maupun publik dibangun di atas **TailwindCSS** (dasar dari TailAdmin) sebagai satu-satunya sistem styling di proyek ini — tidak ada percampuran dengan library CSS lain.

## ⚠️ Keputusan Arsitektur Penting: Multi-Bahasa (ID/AR/EN) & RTL

Platform ini **wajib mendukung 3 bahasa sejak MVP**: Bahasa Indonesia (default), Arab (RTL), dan Inggris.

**Package yang dipakai:**
- `spatie/laravel-translatable` — untuk field konten yang butuh terjemahan, disimpan sebagai kolom JSON per field di tabel yang sama (bukan tabel terjemahan terpisah)
- `mcamara/laravel-localization` — untuk routing berbasis prefix locale (`/id/...`, `/ar/...`, `/en/...`) dan middleware deteksi/switch bahasa

**Aturan cakupan terjemahan (penting, membatasi beban kerja campaigner eksternal):**

| Jenis Konten | Wajib 3 Bahasa? |
|---|---|
| Program resmi Insani (`campaigner_type = internal`) | **Ya** — staff Program Officer input via form dengan tab ID/AR/EN |
| Kategori program | **Ya** — dikelola Administrator |
| Halaman "Tentang Kami" | **Ya** |
| Program milik campaigner eksternal (individu/lembaga) | **Tidak** — tetap 1 bahasa sesuai yang ditulis campaigner. Saat situs dalam mode EN/AR, program ini tetap tampil apa adanya dengan badge kecil "Konten asli dalam Bahasa Indonesia" |
| Komentar/doa donatur, nama donatur | **Tidak** — user-generated content, tidak diterjemahkan |

**Aturan URL & Slug:**
- Slug program **tetap 1 per program** (language-neutral), locale menjadi prefix URL (`/id/program/{slug}`, `/en/program/{slug}`, `/ar/program/{slug}`) — bukan slug berbeda per bahasa
- Bahasa Indonesia sebagai default/fallback: field yang belum diterjemahkan ke AR/EN akan otomatis fallback menampilkan versi ID

**Aturan RTL:**
- `dir="rtl"` di-set pada level `PublicLayout` saat locale = `ar`, dikombinasikan dengan Tailwind `rtl:` variant untuk komponen yang butuh penyesuaian arah (padding, ikon panah navigasi, dsb.)
- Tambahan font web yang mendukung karakter Arab (mis. Noto Naskh Arabic/Cairo), digabung dengan font Latin untuk ID/EN
- **AdminLayout (TailAdmin) TIDAK ikut multi-bahasa** — UI chrome (menu, tombol, label) staff internal tetap Bahasa Indonesia saja, karena penggunanya adalah staff Insani. Yang multi-bahasa hanya **konten** yang mereka kelola (field form punya tab bahasa), bukan antarmuka dashboard itu sendiri.

---

# 3. Official Technology Stack

## Backend

| Component | Technology |
|---|---|
| Framework | Laravel 13 |
| PHP | PHP 8.3+ |
| Database | MySQL 8 |
| Authentication | Laravel Session |
| Authorization | Spatie Permission (`spatie/laravel-permission`) |
| Audit Trail | Spatie Activitylog (`spatie/laravel-activitylog`) |
| ORM | Eloquent |
| Validation | Form Request |
| Queue | Database Queue (untuk webhook payment gateway, notifikasi WhatsApp, generate laporan) |
| Cache | **File** (Redis tidak tersedia di shared hosting Hostinger) |
| Database Backup | `spatie/laravel-backup` — terjadwal harian, destinasi penyimpanan fleksibel (lokal/S3/Google Drive), disesuaikan infrastruktur hosting final |
| Email Transaksional | **SMTP** (bawaan hosting Hostinger) — via Laravel Mail, driver dikonfigurasi di `.env` (`MAIL_MAILER=smtp`) |
| File Storage | **Local disk** (`storage/app`) untuk MVP — menggunakan Laravel Filesystem abstraction agar mudah migrasi ke cloud storage tanpa ubah kode aplikasi |
| Hosting | **Shared Hosting Hostinger** (Business plan+) — migrasi ke VPS/Cloud jika volume transaksi meningkat |
| Payment Gateway | **Xendit** (final — Invoice API, Virtual Account, E-Wallet, QRIS) |
| WhatsApp Notification | **Fonnte** atau **Wablas** (Unofficial WA Gateway) — lihat Section 12.7 untuk rekomendasi & rasionalisasi |
| Translatable Content | `spatie/laravel-translatable` (kolom JSON per field) |
| Locale Routing | `mcamara/laravel-localization` (prefix `/id`, `/ar`, `/en` + middleware) |

## Frontend

| Component | Technology |
|---|---|
| UI Framework | React 18 |
| Bridge | Inertia.js |
| Build Tool | Vite |
| Styling | **Tailwind CSS** |
| Admin Template (internal) | **TailAdmin v2.3 (React version)** |
| Public-facing UI | Custom component library, dibangun di atas token Tailwind yang sama dengan TailAdmin |
| Icons | Bootstrap Icons / Lucide (mengikuti bawaan TailAdmin) |
| Forms | Inertia `useForm` |
| Alerts | SweetAlert2 (internal) / Toast custom (publik, lebih ringan) |
| Charts (internal) | ApexCharts (bawaan TailAdmin) |
| Date Picker | Flatpickr |
| Select Box | Tom Select |
| Image/Media Upload | Preview + crop client-side sebelum submit (untuk foto program & bukti diri) |
| Web Font | Font Latin (ID/EN) + font Arab (mis. Noto Naskh Arabic/Cairo) untuk mendukung locale `ar` |
| Language Switcher | Komponen dropdown ID/AR/EN di `PublicLayout`, terhubung ke `mcamara/laravel-localization` |

---

# 4. UI Framework Standard

**Mandatory Rule (Area Internal `/admin/*`):**

Seluruh halaman internal **WAJIB** menggunakan layout dan komponen bawaan TailAdmin v2.3.

Dilarang di area internal:
- Membuat design system dashboard baru dari nol
- Menggunakan Bootstrap atau library CSS berbasis komponen lain di area internal
- Menggunakan Material UI atau Ant Design

**Mandatory Rule (Area Publik `/`, `/program/*`, dst.):**

Wajib **mobile-first** (breakpoint dasar didesain untuk layar ≤ 480px terlebih dahulu, baru di-scale ke tablet/desktop). Komponen boleh custom, tapi **wajib** memakai token warna, spacing, dan tipografi Tailwind yang sama dengan konfigurasi TailAdmin agar brand konsisten antara dashboard internal dan halaman publik.

Dilarang di area publik:
- Meniru layout dashboard admin (sidebar + tabel data) untuk halaman donatur
- Pola UI yang mengharuskan tamu login sebelum bisa donasi (guest checkout harus tetap didukung, mengikuti pola kedua situs benchmark yang bisa donasi tanpa akun)

---

# 5. Layout Hierarchy (FINAL)

```text
PublicLayout.jsx  (untuk semua halaman publik/donor-facing)
│
├── Header (logo, menu kategori program, search, tombol "Buat Program", tombol login/akun)
├── Bottom Navigation Bar (mobile) — Home, Cari Program, Donasi Saya, Akun
├── Footer (lengkap, desktop only — di-collapse di mobile jadi accordion)
└── Halaman turunan:
      ├── Home / Landing
      ├── Daftar Program (kategori, pencarian)
      ├── Detail Program (+ Donasi)
      ├── Form Buat Program (Individu / Lembaga)
      ├── Halaman Donatur (riwayat donasi saya)
      └── Auth (Login/Register donatur & campaigner)

AdminLayout.jsx  (TailAdmin v2.3, untuk SEMUA role staff internal setelah login)
│
├── Sidebar dinamis — menu di-render berdasarkan permission user
├── Navbar (notifikasi, profil)
├── Breadcrumb
└── Halaman turunan: Dashboard, Manajemen Program, Verifikasi, Folio & Payment,
    Pencairan Dana, Laporan, Pengaturan, User & Role Management
```

**Alasan keputusan:** 1 layout untuk semua role internal (sidebar dinamis berbasis permission) menghindari duplikasi file yang isinya 90% sama (navbar, footer, breadcrumb) — sementara 1 layout terpisah untuk publik dibutuhkan karena kebutuhan visual & tujuan (konversi donasi) sangat berbeda dari kebutuhan dashboard staff (efisiensi data).

---

# 6. Role Based Access Control

Menggunakan package: `spatie/laravel-permission`

## 6.1 Roles

### Internal (Staff Insani — akses ke `/admin/*`)

| Role | Deskripsi |
|---|---|
| **Administrator** | Akses penuh seluruh sistem, termasuk keuangan & pengaturan |
| **Program Officer / Fundraising Internal** | Membuat & mengelola program resmi Insani, upload update/laporan program |
| **Verifikator** | Memverifikasi identitas campaigner (individu & lembaga) dan memvalidasi konten program sebelum tayang |
| **Keuangan** | Mengelola pencairan dana ke campaigner, rekonsiliasi pembayaran, laporan keuangan |
| **Customer Service (CS)** | Menangani komplain donatur, konfirmasi transfer manual, moderasi komentar/doa |

### Eksternal (akses ke area publik + dashboard ringkas milik sendiri)

| Role | Deskripsi |
|---|---|
| **Donatur** | Publik yang berdonasi; bisa guest (tanpa akun) atau daftar akun untuk riwayat |
| **Campaigner Individu** | Perorangan terverifikasi (KTP + Selfie) yang membuat program sendiri |
| **Campaigner Lembaga** | Yayasan/organisasi terverifikasi (KTP+Selfie PIC, SK Yayasan, NPWP, rekening resmi) |

## 6.2 Permission Structure (Granular Dot-Notation)

```text
dashboard.view

user.view  user.create  user.update  user.delete
role.view  role.create  role.update  role.delete

category.view  category.create  category.update  category.delete

campaigner.view  campaigner.verify  campaigner.reject  campaigner.suspend

program.view  program.create  program.update  program.publish  program.reject  program.close
program.update-own   (khusus campaigner: hanya bisa update program miliknya sendiri)

donation.view  donation.create  donation.refund  donation.confirm-manual

disbursement.view  disbursement.create  disbursement.approve

update-post.view  update-post.create  update-post.update  update-post.delete

comment.view  comment.moderate

report.view

settings.view  settings.update
```

### Role → Permission Mapping (Internal)

| Role | Permission Set |
|---|---|
| **Administrator** | Seluruh permission |
| **Program Officer** | `dashboard.view`, `program.*` (untuk program resmi Insani), `update-post.*`, `category.view` |
| **Verifikator** | `dashboard.view`, `campaigner.*`, `program.view`, `program.publish`, `program.reject` |
| **Keuangan** | `dashboard.view`, `disbursement.*`, `donation.view`, `donation.confirm-manual`, `report.view` |
| **CS** | `dashboard.view`, `donation.view`, `donation.confirm-manual`, `comment.moderate` |

### Role → Permission Mapping (Eksternal, dashboard ringkas milik sendiri, bukan `/admin/*`)

| Role | Akses |
|---|---|
| **Campaigner Individu/Lembaga** | `program.create`, `program.update-own`, `update-post.create` (untuk programnya sendiri), lihat statistik donasi program miliknya |
| **Donatur** | Lihat riwayat donasi pribadi, unduh e-kuitansi, follow program |

---

# 7. Core Modules

## 7.1 Dashboard

### Administrator Dashboard (Internal)
Widgets: Total Donasi Terkumpul (semua waktu/bulan ini), Program Aktif, Program Menunggu Verifikasi, Campaigner Baru, Dana Menunggu Pencairan
Charts: Trend Donasi Harian, Donasi per Kategori Program

### Program Officer Dashboard
Widgets: Program Resmi Insani Aktif, Progress per Program, Update Terakhir Diposting

### Verifikator Dashboard
Widgets: Antrian Verifikasi Campaigner, Antrian Verifikasi Program, SLA Verifikasi (rata-rata waktu proses)

### Keuangan Dashboard
Widgets: Dana Siap Dicairkan, Riwayat Pencairan, Rekonsiliasi Payment Gateway vs Transfer Manual

### Dashboard Campaigner (bukan admin panel, versi ringkas di area publik)
Widgets: Total Donasi Terkumpul, Jumlah Donatur, Sisa Waktu Program, Tombol "Posting Update"

## 7.2 Manajemen Kategori Program

Master kategori program (mis. Bencana Alam, Kesehatan, Pendidikan, Kemanusiaan, Lingkungan, Program Sosial Insani). CRUD oleh Administrator/Program Officer.

## 7.3 Manajemen Campaigner & Verifikasi (Terinspirasi kedua benchmark)

### Alur Pendaftaran Campaigner Individu
1. Registrasi akun (nama, email, no HP, password)
2. Lengkapi verifikasi: Upload KTP + Selfie
3. Status akun: `pending_verification` → **Verifikator** review → `verified` / `rejected`
4. Setelah `verified`, menu "Buat Program" aktif

### Alur Pendaftaran Campaigner Lembaga (lebih ketat, ala Amal Sholeh)
1. Registrasi akun lembaga (nama lembaga, PIC, email, no HP)
2. Lengkapi dokumen: KTP + Selfie PIC, **SK Yayasan/Legalitas**, **NPWP Lembaga**, **Rekening Bank atas nama Lembaga** (bukan rekening pribadi — replikasi aturan tegas Amal Sholeh)
3. Status: `pending_verification` → Verifikator review dokumen → `verified` / `rejected` (dengan catatan alasan penolakan)
4. Setelah `verified`, menu "Buat Program" aktif

### Verifikasi Program (Content Moderation)
Setiap program yang dibuat campaigner eksternal (individu/lembaga) **wajib** melalui review Verifikator sebelum status `published`, meliputi: kelayakan cerita/tujuan, kelengkapan foto/dokumen pendukung, larangan mencantumkan rekening pribadi di deskripsi (auto-flag + manual review).

> Program yang dibuat oleh Program Officer internal (role Insani) **tidak perlu** melalui antrian verifikasi Verifikator — langsung `published` begitu di-submit (trusted internal user), namun tetap tercatat di Activity Log.

## 7.4 Manajemen Program (Campaign)

- Buat Program (judul, kategori, target dana, deadline **opsional** — program tanpa batas waktu didukung dan ditandai indikator visual khusus di halaman publik, mis. simbol "∞", deskripsi rich text, foto/video, dokumen pendukung)
- Progress Program (dana terkumpul vs target, jumlah donatur, hari tersisa atau indikator "tanpa batas waktu" jika `deadline` kosong)
- Update Program ("Kabar Terbaru" — wajib diposting setelah dana dicairkan, mengikuti aturan transparansi kedua benchmark)
- Tutup Program (manual oleh campaigner/admin, atau otomatis saat deadline/target tercapai)
- Donasi Offline — dicatat manual oleh Program Officer/Admin agar tetap terhitung di total progress (tidak masuk hitungan payment gateway)
- Listing & Pencarian Program: filter kategori + sorting **Terbaru / Terlama / Terbanyak Terkumpul** (pola umum di platform crowdfunding sejenis), plus indikator status program (`aktif` / `sudah berakhir`)

## 7.5 Donasi & Pembayaran

- Form Donasi: nominal (custom atau preset), pesan/doa opsional, opsi anonim, data donatur (nama, email, no HP — atau guest checkout)
- Metode Pembayaran: Virtual Account (BCA/BNI/BRI/Mandiri/Permata, dst.), E-Wallet (OVO/Gopay/Dana/ShopeePay/LinkAja), QRIS, Kartu Kredit/Debit — seluruhnya via integrasi **Xendit** (Invoice API atau Payment Method API), bukan cek manual satu-satu
- Transfer Bank manual (di luar Xendit) tetap didukung sebagai opsi cadangan, direkonsiliasi manual oleh CS/Keuangan di MVP (lihat Section 10.3)
- Webhook Xendit → update status donasi otomatis (`pending` → `paid` / `expired` / `failed`)
- E-kuitansi otomatis (email/tampilan riwayat) setelah donasi `paid`
- Notifikasi WhatsApp otomatis (via Fonnte/Wablas) ke donatur saat donasi berhasil `paid`, dan ke campaigner saat program menerima donasi baru — lihat Section 12.7
- Refund donasi (khusus sebelum dana dicairkan ke campaigner, sesuai prinsip Amal Sholeh)

### Email Transaksional (SMTP)

Selain notifikasi WhatsApp, sistem juga mengirim email otomatis untuk event berikut:

| Event | Penerima | Keterangan |
|---|---|---|
| E-kuitansi donasi berhasil | Donatur | Dikirim saat status donasi `paid` |
| Welcome email setelah registrasi | User baru | Dikirim saat akun dibuat |
| Verifikasi alamat email | User baru | Link verifikasi, mengisi `email_verified_at` |
| Reset password (Lupa Password) | User yang request | Link reset via token, fitur bawaan Laravel |
| Status verifikasi campaigner (verified/rejected) | Campaigner | Selain via WhatsApp, juga via email sebagai backup |
| Notifikasi donasi baru | Campaigner pemilik program | Selain via WhatsApp, juga via email sebagai backup |
| Reminder Update Program pasca-pencairan | Campaigner | Dikirim hari ke-7, ke-14, ke-21 jika belum ada update |

Provider: **SMTP** (bawaan hosting Hostinger). Seluruh email memakai nama brand **"Insani Indonesia"** sebagai sender name. Driver dikonfigurasi via `.env` (`MAIL_MAILER=smtp`), sehingga bisa dimigrasikan ke Mailgun/SES tanpa ubah kode jika volume meningkat.

## 7.6 Pencairan Dana (Disbursement)

- Campaigner mengajukan pencairan (atau otomatis terjadwal untuk program resmi Insani)
- Keuangan approve pencairan → dicatat sebagai transaksi disbursement, dipotong biaya platform (lihat Section 12.6)
- Wajib ada laporan penggunaan dana (Update Program) pasca-pencairan

## 7.7 Komentar & Doa

- Donatur bisa meninggalkan pesan/doa saat berdonasi, tampil di halaman program (kecuali donatur pilih anonim/private)
- CS bisa moderasi (hapus) komentar yang tidak pantas

## 7.8 Laporan (Internal Only)

- Laporan Donasi (per program, per kategori, per periode)
- Laporan Pencairan Dana
- Laporan Campaigner (aktif, terverifikasi, ditolak)
- Export PDF & Excel

## 7.9 Halaman Profil Lembaga (Tentang Kami)

Halaman statis publik yang menampilkan profil Insani Indonesia sebagai lembaga pengelola platform — penting untuk membangun kepercayaan donatur terhadap program-program resmi internal, terlepas dari campaign campaigner eksternal yang juga tayang di platform yang sama.

- Profil Lembaga, Visi & Misi
- Legalitas lembaga (nomor SK, status badan hukum) — sebagai bentuk transparansi ke publik
- Lokasi Kantor (alamat + tautan peta) dan Kontak (email, WhatsApp, media sosial)
- Dikelola oleh Administrator via `settings.update` (konten semi-statis, disimpan di `app_settings` group `about`), tidak butuh tabel/CRUD terpisah karena isinya jarang berubah

---

# 8. Program (Campaign) Lifecycle

```text
draft → pending_verification → published → (aktif menerima donasi)
                                   │
                                   ├── rejected (kembali ke campaigner untuk revisi)
                                   │
published → completed (target/deadline tercapai) → dana dicairkan → ditutup
published → closed_manual (ditutup campaigner/admin sebelum target tercapai)
```

**Catatan:** Program dari internal Insani (Program Officer) skip status `pending_verification`, langsung `published` dari `draft`.

**Automasi Status `completed`:**
- **Deadline lewat** → otomatis berubah ke `completed` via Laravel Scheduler (cron harian), terlepas dari dana terkumpul
- **Target tercapai sebelum deadline** → otomatis berubah ke `completed` via Model Observer (saat `collected_amount >= target_amount`)
- **Program tanpa deadline + tanpa target** → hanya bisa ditutup manual (`closed_manual`) oleh campaigner atau admin

---

# 9. UI Standards — Area Publik (Mobile-First, Benchmark Kitabisa, Amal Sholeh & Adara Donation)

| Elemen | Standar |
|---|---|
| Breakpoint utama | Didesain dari 360–480px terlebih dahulu |
| Hero/Home | Kategori program sebagai **ikon simbol** (bukan chip teks panjang), banner program unggulan (carousel swipe) |
| Card Program | Foto besar, progress bar dana terkumpul vs target, badge kategori, hari tersisa **atau simbol "∞" jika program tanpa batas waktu**, avatar cluster kecil donatur + jumlah total (mis. "1K+") sebagai social proof |
| Halaman Detail Program | Foto/video di atas, tombol "Donasi Sekarang" **sticky di bawah layar** (mobile), tab: Cerita / Kabar Terbaru / Donatur |
| Listing Program | Filter kategori + sorting **Terbaru / Terlama / Terbanyak Terkumpul**, pagination "Load More" (bukan nomor halaman), lebih natural untuk pola scroll mobile |
| Form Donasi | Nominal preset (grid tombol cepat) + input custom, minimal transaksi sesuai keputusan PRD (default Rp 10.000) |
| Navigasi | Bottom navigation bar (mobile) — bukan sidebar seperti dashboard internal |
| Checkout | Guest checkout didukung penuh — tidak wajib login untuk donasi |
| Share Program | Tombol share **WhatsApp** (deep link `wa.me` + teks pre-filled), **Facebook**, **Twitter/X**, dan **"Salin Link"** — tampil prominent di halaman detail program, karena viral sharing adalah sumber traffic utama platform donasi |
| Image Optimization | Gambar di-serve dalam format WebP (fallback JPEG), lazy loading untuk listing/carousel, responsive image sizes (thumbnail card vs full detail) |
| Halaman Error | Halaman custom 404, 500, dan maintenance mode — tetap memakai `PublicLayout`, pesan ramah dengan link ke beranda |
| Halaman Tentang Kami | Profil, visi-misi, legalitas, kontak & lokasi kantor fisik (tautan peta) — elemen trust-building penting untuk lembaga riil seperti Insani (lihat Section 7.9) |

---

# 9.1 SEO & Social Sharing

Setiap halaman program (`/program/{slug}`) wajib meng-generate meta tags berikut agar preview menarik saat link di-share ke media sosial:

```html
<meta property="og:title" content="{judul program}" />
<meta property="og:description" content="{ringkasan cerita, maks 160 karakter}" />
<meta property="og:image" content="{cover_image program}" />
<meta property="og:url" content="https://insani.id/program/{slug}" />
<meta name="twitter:card" content="summary_large_image" />
```

**Multi-bahasa & Canonical URL:**
- `<link rel="canonical" href="https://insani.id/id/program/{slug}" />` — locale `id` sebagai canonical (default)
- `<link rel="alternate" hreflang="id" href="https://insani.id/id/program/{slug}" />`
- `<link rel="alternate" hreflang="ar" href="https://insani.id/ar/program/{slug}" />`
- `<link rel="alternate" hreflang="en" href="https://insani.id/en/program/{slug}" />`
- `<link rel="alternate" hreflang="x-default" href="https://insani.id/id/program/{slug}" />`

**Halaman lain** (Home, Tentang Kami, listing per kategori) juga wajib memiliki `<title>`, `<meta name="description">`, dan Open Graph tags yang sesuai — disesuaikan secara spesifik per halaman.

**Pencarian Program:**
- Implementasi search menggunakan **MySQL `LIKE` atau Full-Text Search** untuk MVP (cukup untuk ratusan program)
- Bisa diupgrade ke Meilisearch/Algolia Phase 2+ jika jumlah program sudah sangat banyak

**Aksesibilitas (a11y):**
- Semantic HTML5 (heading hierarchy, landmark elements)
- `alt` text pada seluruh gambar
- Kontras warna memenuhi **WCAG AA**
- Navigasi keyboard dasar (tab order, focus state)

**Performance Target:**
- Lighthouse Performance score ≥ **70** untuk halaman publik mobile

---

# 10. Business Rules (Klarifikasi Penting)

## 10.1 Verifikasi Bertingkat

- **Individu:** KTP + Selfie wajib sebelum bisa membuat program & sebelum dana bisa dicairkan
- **Lembaga:** KTP+Selfie PIC + SK Yayasan/Legalitas + NPWP + Rekening Bank atas nama lembaga wajib. **Dilarang** mencantumkan rekening pribadi di halaman program (validasi otomatis + manual review), replikasi langsung dari aturan tegas Amal Sholeh.
- **Internal (Program Officer):** Tidak perlu verifikasi dokumen (sudah staff terautentikasi via akun internal). **Dikonfirmasi:** tidak ada ambang batas nominal yang membutuhkan approval tambahan Administrator — Program Officer bisa langsung publish program resmi Insani berapapun target dananya. Tetap tercatat penuh di Activity Log untuk keperluan audit.

## 10.2 Donasi Offline vs Online

Donasi offline (transfer manual di luar sistem, donasi tunai ke kantor Insani) dicatat manual oleh Program Officer/Admin sebagai entri terpisah, tetap terhitung dalam progress bar program, namun **tidak** melalui payment gateway dan tidak dikenai biaya payment gateway.

## 10.3 Kode Unik untuk Transfer Manual

Untuk metode transfer bank manual (bukan Virtual Account Xendit), sistem menambahkan kode unik 3 digit di belakang nominal donasi agar mudah di-cross-check. **Dikonfirmasi:** kode unik 3 digit acak (100–999), validasi unik **per program per hari** (bukan global) — menghindari collision saat ada beberapa donasi manual dengan nominal sama ke 1 program dalam hari yang sama.

**Dikonfirmasi — MVP:** Rekonsiliasi transfer manual dilakukan **cek manual oleh CS/Keuangan** (lihat mutasi rekening, cocokkan dengan kode unik + nominal, lalu konfirmasi status donasi via `donation.confirm-manual` di panel internal). **Moota** (atau layanan agregator mutasi bank sejenis) masuk sebagai **fitur Phase 2** untuk otomatisasi penuh proses ini.

## 10.4 Refund

Refund donasi hanya bisa diproses **sebelum** dana program dicairkan ke campaigner (belum masuk status `disbursed`). Setelah dana dicairkan, refund tidak dapat diproses via sistem (harus penanganan kasus khusus oleh CS/Keuangan di luar sistem).

## 10.5 Biaya Platform

Dua kategori biaya (mengikuti model Amal Sholeh, dipisah dari biaya payment gateway):
- **Biaya Payment Gateway (Xendit)** — dibebankan sesuai tarif Xendit per metode pembayaran. **Dikonfirmasi: ditanggung platform untuk MVP** (donatur membayar persis nominal yang dimasukkan, tidak ada tambahan biaya layanan). Fee breakdown ke donatur bisa dipertimbangkan Phase 2 jika margin tertekan.
- **Biaya Platform/Pengembangan — Dikonfirmasi: 5%** dari dana terkumpul, dipotong saat pencairan ke campaigner eksternal (individu & lembaga). **Dikecualikan (0%)** untuk kategori **Bencana Alam**, mengikuti kebijakan Kitabisa. Program resmi Insani (dibuat Program Officer) juga **tidak dikenai** biaya platform ini karena dana sepenuhnya milik/dikelola lembaga sendiri, bukan pencairan ke pihak ketiga.

> **Catatan implementasi:** field `platform_fee_percent` sebaiknya disimpan per-kategori di tabel `categories` (bukan hardcode di kode), agar Administrator bisa mengubah persentase (misal menambah kategori darurat lain 0%) tanpa perlu deploy ulang. Default `5.00`, kategori Bencana Alam di-seed dengan `0.00`.

## 10.6 Update Program Wajib

Campaigner (individu/lembaga) **wajib** memposting minimal 1 Update Program setelah dana dicairkan, sebagai laporan penggunaan dana — direplikasi dari kewajiban transparansi di kedua situs benchmark.

**Dikonfirmasi — jadwal reminder otomatis:**
- Reminder ke-1: **7 hari** setelah pencairan
- Reminder ke-2: **14 hari** setelah pencairan
- Reminder ke-3: **21 hari** setelah pencairan

Reminder dikirim via **email + WhatsApp**. **Tidak ada sanksi otomatis** (suspend akun/blokir pencairan) jika campaigner tidak pernah posting update — hanya reminder berulang. Kebijakan sanksi manual bisa dipertimbangkan di Phase 2 jika diperlukan.

## 10.7 Audit Trail

Seluruh aktivitas penting (create/update program, verifikasi campaigner, donasi, pencairan dana, refund) dicatat otomatis melalui `spatie/laravel-activitylog`. Tidak ada tabel audit custom yang dibuat manual — cukup memakai skema standar dari package ini.

## 10.8 Kebijakan Backup Database

**Dikonfirmasi:**
- **Cakupan:** Database saja (MySQL dump terjadwal) — tidak termasuk file upload (dokumen KTP, foto program, dsb.) di MVP ini
- **Frekuensi:** Harian, dengan retensi 7–30 hari (jumlah pasti hari retensi dikonfigurasi sesuai kapasitas storage yang tersedia saat implementasi)
- **Mekanisme:** `spatie/laravel-backup`, dijadwalkan via Laravel Scheduler (`php artisan schedule:run` + cron). Destinasi penyimpanan (disk lokal, S3, Google Drive, dll) **fleksibel dan ditentukan saat konfigurasi hosting final** — package ini sengaja dipilih karena tidak mengunci keputusan ke satu provider tertentu
- Notifikasi kegagalan backup dikirim ke email Administrator (fitur bawaan package), supaya masalah backup terdeteksi cepat tanpa perlu membangun sistem monitoring custom

> **Catatan:** Karena platform ini menangani transaksi donasi riil (Xendit) dan data verifikasi KYC, backup database bukan sekadar "nice to have" — kegagalan tanpa backup berarti kehilangan riwayat donasi & pencairan dana yang secara hukum/akuntansi harus bisa dipertanggungjawabkan. Backup file upload (dokumen verifikasi, foto program) bisa dipertimbangkan masuk Phase 2 jika kapasitas storage memungkinkan.

## 10.9 Benefit Registrasi Donatur

Guest checkout didukung penuh, namun donatur yang mendaftar akun mendapatkan benefit tambahan:
- Riwayat donasi tersimpan dan bisa diakses kapanpun
- E-kuitansi bisa diunduh ulang
- Nama, email, dan nomor HP otomatis terisi saat donasi berikutnya (tidak perlu ketik ulang)
- Follow program untuk menerima notifikasi update/kabar terbaru

Guest checkout tetap tersedia tanpa benefit di atas — hanya menerima e-kuitansi sekali via email saat donasi berhasil.

## 10.10 Hosting & Keterbatasan Shared Hosting

**Dikonfirmasi: Shared Hosting Hostinger** untuk MVP.

Keterbatasan yang perlu diantisipasi:
- **Redis tidak tersedia** → Cache memakai driver `file`, Queue memakai driver `database`
- **Queue worker** tidak bisa berjalan sebagai daemon → dijalankan via cron: `php artisan queue:work --stop-when-empty` setiap beberapa menit (webhook Xendit mungkin delay beberapa menit, tapi tetap terproses)
- **PHP memory limit** terbatas → perlu dipantau saat generate laporan PDF/Excel besar
- **Cron job** membutuhkan Hostinger Business plan ke atas agar bisa dijalankan per menit (`* * * * *`) untuk Laravel Scheduler

Migrasi ke **VPS atau Hostinger Cloud** masuk roadmap jika volume transaksi meningkat atau keterbatasan di atas menjadi bottleneck operasional.

---

# 11. Project Structure

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/        (controller area internal, TailAdmin)
│   │   └── Public/       (controller area publik, mobile-first)
├── Models/
├── Services/
├── Policies/
├── Providers/

resources/
└── js/
    ├── Components/
    │   ├── Admin/        (komponen TailAdmin)
    │   └── Public/
    │       ├── Program/  (keluarga komponen Galang Dana — card, progress bar, tombol donasi sticky, dsb; gaya Kitabisa/Amal Sholeh)
    │       └── Profile/   (keluarga komponen Company Profile — hero, grid statistik, grid mitra, grid artikel; gaya insani.id/npc.id, disiapkan untuk phase CMS terpisah)
    ├── Layouts/
    │   ├── AdminLayout.jsx
    │   └── PublicLayout.jsx   (1 shell dipakai KEDUA keluarga komponen di atas — header, footer, nav, language switcher sama persis)
    ├── Pages/
    │   ├── Admin/
    │   └── Public/
    ├── Hooks/
    ├── Utils/
    └── app.jsx

resources/views/
└── app.blade.php

routes/
├── web.php      (dipisah prefix /admin/* vs publik, locale-prefixed untuk publik)
└── auth.php
```

> **Catatan:** `Components/Public/Profile/` disiapkan sebagai folder placeholder — implementasi penuhnya baru terjadi saat phase rebuild CMS company profile (di luar scope PRD ini), tapi strukturnya sudah dialokasikan dari awal supaya `PublicLayout` tidak perlu dirombak nanti.

## 11.1 Domain, Deployment & Branding

**Domain:** Seluruh aplikasi (Galang Dana + nanti CMS company profile) hidup di **1 domain yang sama, `insani.id`**, dengan pola **path-based** (bukan subdomain) — mis. `insani.id/galang-dana`, `insani.id/program/{slug}`, `insani.id/admin/*`. Ini konsisten dengan struktur URL yang sudah dipakai `insani.id` saat ini (`/galang-dana-id/`, `/galang-dana/{slug}/`), sehingga meminimalkan disrupsi SEO/tautan yang sudah beredar.

**Urutan rilis:** Modul **Galang Dana dibangun & dirilis lebih dulu**, mendahului rebuild CMS company profile (phase terpisah). Konsekuensi teknis:
- Selama development, aplikasi Laravel baru ini berjalan di **domain staging sementara** (mis. subdomain internal/testing), **bukan** langsung di `insani.id` — karena `insani.id` masih dilayani WordPress untuk halaman company profile yang belum di-rebuild
- **Cutover DNS** ke `insani.id` terjadi saat modul Galang Dana siap rilis produksi. Pada titik ini, halaman company profile (Tentang, Fokus Program, Kabar) **untuk sementara tetap dilayani WordPress lama** (di-embed/reverse-proxy, atau tautan luar sementara), sampai phase CMS rebuild menyusul dan mengambil alih penuh domain yang sama
- Detail teknis reverse-proxy/coexistence sementara ini didefinisikan lebih lanjut di **MODULE_BREAKDOWN v1.0** sebagai bagian dari deployment plan, bukan bagian dari skema database/API

**Branding — Brand vs Nama Badan Hukum:** Ada 3 lapis nama yang tidak boleh tertukar:

| Nama | Konteks Pemakaian |
|---|---|
| **Insani Indonesia** (brand) | Seluruh UI publik: navbar, logo, judul halaman, meta tag, subject email, template WhatsApp, `app_settings.nama_platform` |
| **Yayasan Peduli Insani Indonesia** (nama badan hukum) | **Hanya** di halaman Tentang Kami/Legalitas (nomor SK Kemenkumham) dan dokumen resmi (mis. perjanjian dengan campaigner lembaga). **Dikonfirmasi: e-kuitansi donasi cukup pakai nama brand**, tidak perlu nama badan hukum lengkap |
| **Galang Dana Insani Indonesia** (nama proyek) | **Hanya** judul dokumen internal (PRD, ERD, dst.) untuk keperluan tim development — **tidak pernah** tampil di UI atau kode aplikasi |

> **Implementasi:** `app_settings` grup `platform` menyimpan `nama_platform = Insani Indonesia`. `app_settings` grup `about` menyimpan field terpisah `nama_legal = Yayasan Peduli Insani Indonesia` khusus untuk halaman Legalitas — lihat DATABASE_DICTIONARY v1.0 Section 8.2.

---

# 12. Keputusan Konfirmasi

| Keputusan | Hasil Konfirmasi |
|---|---|
| Siapa yang boleh membuat program | Individu, Lembaga, & Admin platform (program resmi internal) |
| Metode pembayaran MVP | Semua metode via Payment Gateway pihak ketiga — **final: Xendit** |
| Level verifikasi | Bertingkat — Individu (KTP+Selfie), Lembaga (+SK Yayasan, NPWP, Rekening resmi) |
| UI Template | TailAdmin v2.3 (internal), custom mobile-first (publik) |
| Prioritas penggunaan | Internal Insani sebagai pengguna utama, eksternal sebagai pelengkap |
| Ambang batas approval program internal | **Tidak ada** — Program Officer bisa langsung publish tanpa approval nominal tambahan |
| Biaya platform campaigner eksternal | **5%**, dikecualikan **0%** untuk kategori Bencana Alam |
| Rekonsiliasi transfer manual (MVP) | Cek manual oleh CS/Keuangan; **Moota** (atau sejenis) masuk roadmap Phase 2 |
| Notifikasi WhatsApp | **Masuk MVP** — lihat Section 12.7 untuk rekomendasi teknologi |
| Multi-bahasa | **Masuk MVP** — ID (default), AR (RTL), EN. Lihat Section 2 untuk aturan cakupan terjemahan |
| Wakaf | **Di luar scope** — dikecualikan sama seperti Zakat |
| Modul CMS Organisasi (Fokus Program, Kabar/Blog, FAQ, Legal, Manajemen, Logo Kit) | **Di luar scope PRD ini** — akan jadi dokumen/phase terpisah untuk rebuild company profile `insani.id` |
| Tata letak domain | **Path-based di `insani.id`** (bukan subdomain) — `insani.id/galang-dana`, dst. Lihat Section 11.1 |
| Urutan rilis | **Galang Dana dibangun & dirilis lebih dulu**, CMS company profile menyusul di phase terpisah — lihat Section 11.1 untuk strategi staging & cutover DNS |
| Branding UI publik | **"Insani Indonesia"** (brand) — bukan nama proyek "Galang Dana Insani Indonesia" (internal saja) atau nama badan hukum (khusus Legalitas) — lihat Section 11.1 |
| E-kuitansi donasi | Cukup nama brand **"Insani Indonesia"**, tidak perlu nama badan hukum lengkap |
| Backup Database | **Database saja** (MySQL dump), **harian**, retensi 7–30 hari, via `spatie/laravel-backup` — destinasi penyimpanan menyesuaikan hosting final |
| Xendit API (MVP) | **Invoice API** (hosted checkout) — migrasi ke Direct API di Phase 2 jika konversi menunjukkan drop-off signifikan |
| Minimum donasi | **Rp 10.000** — disimpan di `app_settings` (`min_donation_amount`), bisa diubah tanpa deploy |
| Approval pencairan dana | **Single approval** oleh role Keuangan untuk MVP — dual approval (+ Administrator) untuk nominal besar bisa ditambahkan Phase 2 |
| Kode unik transfer manual | **3 digit acak (100–999)**, validasi unik **per program per hari** |
| Biaya payment gateway | **Ditanggung platform** untuk MVP — donatur bayar persis nominal yang dimasukkan |
| Share ke media sosial | **Masuk MVP** — WhatsApp, Facebook, Twitter/X, Salin Link di halaman detail program |
| SEO & Open Graph | **Masuk MVP** — meta tags per halaman program, canonical URL multi-bahasa, hreflang |
| Email transaksional | **SMTP** (bawaan Hostinger) — e-kuitansi, welcome, verifikasi email, reset password, notifikasi status |
| Lupa password | **Masuk MVP** — fitur bawaan Laravel (reset via email token) |
| Reminder Update Program | **3x reminder** (hari ke-7, ke-14, ke-21 pasca-pencairan), **tanpa sanksi otomatis** |
| Automasi status `completed` | **Otomatis** — deadline lewat (cron harian) atau target tercapai (Observer) |
| Hosting | **Shared Hosting Hostinger** — migrasi ke VPS/Cloud jika volume meningkat |
| File storage | **Local disk** untuk MVP — abstraksi Laravel Filesystem siap migrasi ke cloud |
| Search | **MySQL LIKE / Full-Text Search** untuk MVP |

## 12.7 Rekomendasi Teknologi WhatsApp Notification

Untuk kebutuhan notifikasi WA (konfirmasi donasi berhasil, status verifikasi campaigner, reminder posting Update Program, notifikasi donasi baru ke campaigner), ada dua jalur:

| Opsi | Kelebihan | Kekurangan | Cocok untuk |
|---|---|---|---|
| **Unofficial Gateway** — Fonnte / Wablas | Setup sangat cepat (scan QR, tanpa approval Meta), biaya murah (mulai puluhan ribu/bulan), banyak package Laravel siap pakai (`laravel-fonnte`, `laravel-wablas`), fleksibel format pesan bebas | Menggunakan otomasi WhatsApp Web (bukan API resmi Meta) → **berisiko nomor terkena ban** jika volume pesan tinggi/terindikasi spam; tidak ada centang biru/badge resmi | MVP — volume notifikasi transaksional rendah–menengah, budget terbatas, butuh cepat jalan |
| **Official WhatsApp Cloud API (Meta)** — via BSP (Business Solution Provider) seperti Qontak, atau penyedia harga kompetitif seperti api.co.id | Nomor terdaftar resmi, tidak akan di-ban, mendukung template message resmi & centang biru (verified badge) — meningkatkan kepercayaan donatur | Setup lebih kompleks (verifikasi bisnis ke Meta), template pesan di luar 24-jam window butuh approval Meta & ada biaya per pesan | Phase 2+ — setelah volume transaksi & kepercayaan brand jadi prioritas |

**Rekomendasi untuk MVP:** mulai dengan **Fonnte atau Wablas** (unofficial) karena kebutuhan awal murni notifikasi transaksional (bukan broadcast massal), volume masih terkendali, dan integrasi Laravel-nya sudah teruji lewat package open-source. Simpan logic pengiriman WA di balik satu `NotificationChannel`/`Service` interface (mis. `WhatsappGatewayService`) supaya **mudah migrasi ke Official WhatsApp Cloud API di Phase 2** tanpa merombak kode di banyak tempat — penting mengingat ini platform donasi yang mengelola kepercayaan publik, jadi migrasi ke jalur resmi sebaiknya tetap masuk roadmap, bukan keputusan permanen.

---

# 13. Authentication

**Method:** Laravel Session Authentication

```text
Login → Laravel Auth → Session Created → Redirect ke:
   - /admin/dashboard  (jika role internal staff)
   - /akun              (jika role campaigner/donatur)

Forgot Password → Email Reset Link → User klik link →
   - Form input password baru → Password updated → Redirect ke /login
```

**Tidak menggunakan:** JWT, Sanctum Token, Passport.

---

# 14. Database Overview

Skema lengkap akan didefinisikan di dokumen terpisah:
- **DATABASE_DICTIONARY_v1_0.md**
- **ERD_v1_0.md**
- **API_SPEC_v1_0.md**
- **MODULE_BREAKDOWN_v1_0.md**

Estimasi domain utama tabel (draft, detail final di Database Dictionary):

```text
users, roles, permissions (Spatie)
campaigner_profiles (individu & lembaga, polymorphic/tipe)
verification_documents
categories
programs (campaigns)
program_updates
donations
payments (payment gateway transaction log)
disbursements
comments
activity_log (Spatie)
app_settings
```

---

# 15. Development Phases

| Phase | Deliverables |
|---|---|
| **Phase 1 (MVP)** | Authentication, RBAC, AdminLayout (TailAdmin), PublicLayout (mobile-first, i18n ID/AR/EN + RTL), Halaman Profil Lembaga (Tentang Kami, 3 bahasa), Kategori Program (+ `platform_fee_percent`, 3 bahasa), Campaigner Registration & Verifikasi (Individu+Lembaga), Program CRUD + Listing/Sorting (internal 3 bahasa, eksternal 1 bahasa), Donasi + Xendit (VA/E-Wallet/QRIS), Rekonsiliasi Transfer Manual (cek manual CS/Keuangan), Program Update, Notifikasi WhatsApp (Fonnte/Wablas) untuk konfirmasi donasi & status verifikasi, Backup Database Harian |
| **Phase 2** | Pencairan Dana (dengan potongan biaya platform 5%/0%), Rekonsiliasi Otomatis via Moota (atau sejenis), Refund, Komentar/Doa, Reminder Update Program Otomatis |
| **Phase 3** | Laporan lengkap (Export PDF/Excel), Dashboard Campaigner mandiri, Migrasi opsional ke Official WhatsApp Cloud API |
| **Phase 4** | Multi Payment Gateway (tambahan di luar Xendit jika dibutuhkan), Donatur Membership lanjutan (badge, leaderboard donatur), Audit Log Viewer, Pengaturan lengkap |

Detail per-modul & urutan implementasi step-by-step akan dijabarkan di dokumen terpisah **MODULE_BREAKDOWN_v1_0.md** (menyusul).

---

# 16. Success Criteria

Sistem dianggap selesai (MVP) apabila:

- Semua role internal dapat login ke `/admin/*` dan hanya melihat menu sesuai permission
- Campaigner individu & lembaga dapat mendaftar, upload dokumen verifikasi, dan menunggu approval
- Verifikator dapat approve/reject campaigner & program dengan catatan alasan
- Donatur (termasuk guest) dapat menemukan program, berdonasi via minimal 1 metode payment gateway, dan menerima e-kuitansi
- Progress dana program (online + offline) akurat real-time
- Program Officer internal dapat membuat & publish program tanpa antrian verifikasi
- Update Program wajib tampil di halaman program sebagai bentuk transparansi
- Pencairan dana tercatat sebagai transaksi terpisah, dengan approval Keuangan
- Seluruh halaman internal memakai TailAdmin v2.3, seluruh halaman publik mobile-first
- Situs publik dapat diakses dalam 3 bahasa (ID/AR/EN) dengan layout RTL otomatis saat locale Arab; konten program internal & kategori tersedia penuh 3 bahasa, konten campaigner eksternal tampil apa adanya dengan fallback ke Bahasa Indonesia
- Tidak ada penggunaan React Router
- Tidak ada REST API internal (kecuali AJAX/webhook payment gateway)
- Seluruh aktivitas penting tercatat di Activity Log

---

# 17. Open Questions — RESOLVED ✅

Seluruh open questions dari versi 1.0 telah dikonfirmasi dan dijawab di versi 1.1 ini:

| No | Pertanyaan | Keputusan Final | Dirujuk di Section |
|---|---|---|---|
| 1 | Xendit — Invoice API atau Direct API? | **Invoice API** untuk MVP. Migrasi ke Direct API di Phase 2 jika konversi menunjukkan drop-off signifikan di redirect. | Section 3, 12 |
| 2 | Minimum nominal donasi | **Rp 10.000** — disimpan di `app_settings` (`min_donation_amount`), bisa diubah Administrator tanpa deploy ulang | Section 12 |
| 3 | Approval pencairan dana | **Single approval** oleh role Keuangan. Dual approval (+ Administrator) untuk nominal besar bisa ditambahkan Phase 2 | Section 12 |
| 4 | Format kode unik transfer manual | **3 digit acak (100–999)**, validasi unik **per program per hari** | Section 10.3, 12 |

Tidak ada open questions tersisa. Dokumen siap menjadi acuan untuk ERD, DATABASE_DICTIONARY, MODULE_BREAKDOWN, dan API_SPEC.
