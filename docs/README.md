# 📚 Direktori Dokumentasi Proyek — Insani Indonesia (`insani.id`)

Selamat datang di repositori dokumentasi resmi platform **Insani Indonesia**. Seluruh dokumen teknis, spesifikasi arsitektur, laporan audit keamanan & performa, panduan operasional server, dan naskah konten dikelompokkan secara terstruktur ke dalam kategori direktori berikut:

---

## 🗂️ Struktur Direktori

```text
docs/
├── specifications/          # Cetak Biru Perancangan & Spesifikasi Sistem Inti (v1.0)
├── audit/                   # Laporan Audit Kesiapan Deployment, Keamanan, QA, & Performa
│   └── archive/             # Arsip laporan audit historis & catatan teknis masa lalu
├── deployment/              # Panduan Operasional Server, LiteSpeed, dan SOP Admin
├── implementation-plan/     # Rencana Kerja Teknis & Migrasi (Aktif)
│   └── archive/             # Arsip rencana fase implementasi MVP yang telah rampung (shipped)
├── content/                 # Naskah Konten CMS, Narasi Program, dan Standar Desain
│   └── archive/             # Arsip riset komparasi finansial masa lalu
└── policy/                  # Dokumen Regulasi Publik (Terikat langsung ke PageSeeder)
```

---

## 📖 Katalog Dokumen

### 1. 📐 [Spesifikasi Arsitektur (`docs/specifications/`)](file:///c:/laragon/www/insani-id/docs/specifications)
Cetak biru perancangan awal sistem platform Galang Dana Insani Indonesia (GDII) versi 1.0:
* [**`PRD_v1_0.md`**](file:///c:/laragon/www/insani-id/docs/specifications/PRD_v1_0.md) — *Product Requirements Document* resmi (Fitur, user flow, matrik peran, & aturan bisnis).
* [**`ERD_v1_0.md`**](file:///c:/laragon/www/insani-id/docs/specifications/ERD_v1_0.md) — *Entity Relationship Diagram* relasi seluruh tabel database.
* [**`DATABASE_DICTIONARY_v1_0.md`**](file:///c:/laragon/www/insani-id/docs/specifications/DATABASE_DICTIONARY_v1_0.md) — Kamus data detail tipe, ukuran, index, dan constraint kolom tabel.
* [**`API_SPEC_v1_0.md`**](file:///c:/laragon/www/insani-id/docs/specifications/API_SPEC_v1_0.md) — Spesifikasi format endpoint request/response JSON.
* [**`MODULE_BREAKDOWN_v1_0.md`**](file:///c:/laragon/www/insani-id/docs/specifications/MODULE_BREAKDOWN_v1_0.md) — Rincian modul per fase dan matriks permission Spatie RBAC.

---

### 2. 🔍 [Laporan Audit & Kesiapan Sistem (`docs/audit/`)](file:///c:/laragon/www/insani-id/docs/audit)
Laporan evaluasi komprehensif keamanan, optimasi kueri, integrasi payment gateway, dan kesiapan hosting:
* [**`AUDIT_KESIAPAN_DEPLOYMENT_KOMPREHENSIF.md`**](file:///c:/laragon/www/insani-id/docs/audit/AUDIT_KESIAPAN_DEPLOYMENT_KOMPREHENSIF.md) — **★ DOKUMEN MASTER:** Audit lengkap pra-deployment Hostinger Business (Arsitektur, 551 Pest Tests, Hardening Keamanan, Optimasi Kueri, Midtrans Core API, dan Simulasi Beban).
* [**`archive/`**](file:///c:/laragon/www/insani-id/docs/audit/archive) — Arsip checkpoint audit masa lalu:
  * [`CODEBASE_REVIEW_2026_10_10.md`](file:///c:/laragon/www/insani-id/docs/audit/archive/CODEBASE_REVIEW_2026_10_10.md) — Audit statis kode sumber & mitigasi CR-001 s/d CR-006.
  * [`DEPLOYMENT_READINESS_HOSTINGER_BUSINESS_OCT10.md`](file:///c:/laragon/www/insani-id/docs/audit/archive/DEPLOYMENT_READINESS_HOSTINGER_BUSINESS_OCT10.md) — Evaluasi runtime 10 Oktober.
  * [`AUDIT_DAN_QA_PRE_DEPLOYMENT_HOSTINGER_OCT4.md`](file:///c:/laragon/www/insani-id/docs/audit/archive/AUDIT_DAN_QA_PRE_DEPLOYMENT_HOSTINGER_OCT4.md) — Audit QA & verifikasi 233 rute (4 Oktober).
  * [`DEPLOYMENT_READINESS_AUDIT_OCT3.md`](file:///c:/laragon/www/insani-id/docs/audit/archive/DEPLOYMENT_READINESS_AUDIT_OCT3.md) — Laporan awal kesiapan deployment (3 Oktober).
  * [`BACKEND_AUDIT_AND_TASKS.md`](file:///c:/laragon/www/insani-id/docs/audit/archive/BACKEND_AUDIT_AND_TASKS.md) — Catatan temuan audit backend internal (Agustus 2026).

---

### 3. 🚀 [Panduan Deployment & Operasional (`docs/deployment/`)](file:///c:/laragon/www/insani-id/docs/deployment)
Instruksi langkah demi langkah konfigurasi lingkungan produksi dan operasional administrator:
* [**`HOSTINGER_DEPLOYMENT_GUIDE.md`**](file:///c:/laragon/www/insani-id/docs/deployment/HOSTINGER_DEPLOYMENT_GUIDE.md) — Prosedur deployment ke LiteSpeed / CloudLinux Hostinger, setup document root, dan cron queue worker.
* [**`MANUAL_DATA_ENTRY_GUIDE.md`**](file:///c:/laragon/www/insani-id/docs/deployment/MANUAL_DATA_ENTRY_GUIDE.md) — SOP pengisian data live yayasan (mitra, tim manajemen, banner homepage) pasca-seeding.

---

### 4. 🛠️ [Rencana Implementasi Teknis (`docs/implementation-plan/`)](file:///c:/laragon/www/insani-id/docs/implementation-plan)
Dokumen rencana kerja teknis yang terstruktur untuk migrasi dan pembenahan sistem:
* [**`PRE_DEPLOYMENT_FIXES_PLAN.md`**](file:///c:/laragon/www/insani-id/docs/implementation-plan/PRE_DEPLOYMENT_FIXES_PLAN.md) — **Rencana Aktif:** Aksi perbaikan pra-deployment Hostinger.
* [**`archive/`**](file:///c:/laragon/www/insani-id/docs/implementation-plan/archive) — Arsip rencana fase implementasi yang telah selesai (*shipped*):
  * [**`MVP_PHASES_IMPLEMENTATION_ARCHIVE.md`**](file:///c:/laragon/www/insani-id/docs/implementation-plan/archive/MVP_PHASES_IMPLEMENTATION_ARCHIVE.md) — **★ KONSOLIDASI FASE MVP:** Rangkuman rencana kerja Phase 1 (Auth/RBAC), Phase 2 (i18n & Master Data), Phase 8 (Laporan & SEO), dan Company Profile Phase 1 & 2.
  * [`MIDTRANS_CORE_API_IMPLEMENTATION_PLAN.md`](file:///c:/laragon/www/insani-id/docs/implementation-plan/archive/MIDTRANS_CORE_API_IMPLEMENTATION_PLAN.md) — Blueprint migrasi Payment Gateway dari Xendit ke Midtrans Core API.
  * [`DOCS_RESTRUCTURE_PLAN.md`](file:///c:/laragon/www/insani-id/docs/implementation-plan/archive/DOCS_RESTRUCTURE_PLAN.md) — Rencana awal penataan folder dokumentasi.

---

### 5. ✍️ [Naskah Konten & Standar Desain (`docs/content/`)](file:///c:/laragon/www/insani-id/docs/content)
Naskah acuan resmi konten publik dan standar visual yayasan:
* [**`fokus-program-insani.md`**](file:///c:/laragon/www/insani-id/docs/content/fokus-program-insani.md) — Naskah definitif 6 Fokus Program Yayasan (Blok A Realitas Lapangan + Blok B Capaian Program). Menjadi *source of truth* untuk `CategorySeeder.php`.
* [**`PANDUAN_DESAIN_BANNER_BERANDA.md`**](file:///c:/laragon/www/insani-id/docs/content/PANDUAN_DESAIN_BANNER_BERANDA.md) — Panduan standar desain banner beranda, spesifikasi aspek rasio (Desktop 1920x820 vs Mobile 1080x1920), pemetaan safe zone, etika visual filantropi, dan optimasi LCP.
* [**`archive/analisis-biaya-xendit-vs-midtrans.html`**](file:///c:/laragon/www/insani-id/docs/content/archive/analisis-biaya-xendit-vs-midtrans.html) — Laporan komparasi kalkulasi biaya transaksi gateway Xendit vs Midtrans.

---

### 6. ⚖️ [Kebijakan & Regulasi Publik (`docs/policy/`)](file:///c:/laragon/www/insani-id/docs/policy)
File HTML statis kebijakan platform. 
> [!IMPORTANT]
> **Ketergantungan Kode Sistem:** Folder ini di-load langsung secara otomatis oleh [`database/seeders/PageSeeder.php`](file:///c:/laragon/www/insani-id/database/seeders/PageSeeder.php). Lokasi dan nama file di bawah ini tidak boleh diubah tanpa memperbarui kode seeder bersangkutan.

* [`cara-donasi.html`](file:///c:/laragon/www/insani-id/docs/policy/cara-donasi.html)
* [`kebijakan-privasi.html`](file:///c:/laragon/www/insani-id/docs/policy/kebijakan-privasi.html)
* [`panduan-logo.html`](file:///c:/laragon/www/insani-id/docs/policy/panduan-logo.html)
* [`pusat-bantuan.html`](file:///c:/laragon/www/insani-id/docs/policy/pusat-bantuan.html)
* [`syarat-ketentuan.html`](file:///c:/laragon/www/insani-id/docs/policy/syarat-ketentuan.html)
