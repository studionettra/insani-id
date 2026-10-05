# 📚 Direktori Dokumentasi Proyek — Insani Indonesia (`insani.id`)

Selamat datang di repositori dokumentasi resmi platform **Insani Indonesia**. Seluruh dokumen teknis, spesifikasi arsitektur, laporan audit keamanan & performa, panduan operasional server, dan naskah konten dikelompokkan ke dalam kategori direktori berikut:

---

## 🗂️ Struktur Direktori

```text
docs/
├── specifications/          # Spesifikasi Cetak Biru & Desain Sistem Inti (v1.0)
├── audit/                   # Laporan Audit Keamanan, Performa, QA, dan Analisis Beban
│   └── archive/             # Arsip catatan audit internal historis
├── deployment/              # Panduan Operasional Server, LiteSpeed, dan SOP Admin
├── implementation-plan/     # Rencana Kerja Teknis & Migrasi (Aktif)
│   └── archive/             # Rencana fase implementasi MVP yang telah selesai (shipped)
├── content/                 # Naskah Konten CMS, Narasi Program, dan Riset Bisnis
│   └── archive/             # Arsip riset komparasi finansial masa lalu
└── policy/                  # Dokumen Kebijakan & Regulasi Publik (Terikat PageSeeder)
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

### 2. 🔍 [Laporan Audit & QA (`docs/audit/`)](file:///c:/laragon/www/insani-id/docs/audit)
Laporan evaluasi teknis, audit keamanan, optimasi kueri, dan hasil pengujian otomatis pra-rilis:
* [**`AUDIT_DAN_QA_PRE_DEPLOYMENT_HOSTINGER.md`**](file:///c:/laragon/www/insani-id/docs/audit/AUDIT_DAN_QA_PRE_DEPLOYMENT_HOSTINGER.md) — Audit mendalam & QA Hostinger Business Shared Hosting (LiteSpeed, 482 Pest Tests, 233 Routes, CAPI security hardening).
* [**`DEPLOYMENT_READINESS_AUDIT.md`**](file:///c:/laragon/www/insani-id/docs/audit/DEPLOYMENT_READINESS_AUDIT.md) — Audit kesiapan infrastruktur dan simulasi beban donasi (5K, 10K, 50K concurrent).
* [**`archive/BACKEND_AUDIT_AND_TASKS.md`**](file:///c:/laragon/www/insani-id/docs/audit/archive/BACKEND_AUDIT_AND_TASKS.md) — Catatan temuan audit backend internal versi awal (Agustus 2026).

---

### 3. 🚀 [Panduan Deployment & Operasional (`docs/deployment/`)](file:///c:/laragon/www/insani-id/docs/deployment)
Instruksi langkah demi langkah konfigurasi lingkungan produksi dan operasional administrator:
* [**`HOSTINGER_DEPLOYMENT_GUIDE.md`**](file:///c:/laragon/www/insani-id/docs/deployment/HOSTINGER_DEPLOYMENT_GUIDE.md) — Prosedur deployment ke LiteSpeed / CloudLinux Hostinger, setup document root, dan cron queue worker.
* [**`MANUAL_DATA_ENTRY_GUIDE.md`**](file:///c:/laragon/www/insani-id/docs/deployment/MANUAL_DATA_ENTRY_GUIDE.md) — SOP pengisian data live yayasan (mitra, tim manajemen, banner homepage) pasca-seeding.

---

### 4. 🛠️ [Rencana Implementasi Teknis (`docs/implementation-plan/`)](file:///c:/laragon/www/insani-id/docs/implementation-plan)
Dokumen rencana kerja teknis yang terstruktur untuk migrasi dan pembenahan sistem:
* [**`PRE_DEPLOYMENT_FIXES_PLAN.md`**](file:///c:/laragon/www/insani-id/docs/implementation-plan/PRE_DEPLOYMENT_FIXES_PLAN.md) — Rencana aksi perbaikan temuan kritis pra-deployment.
* [**`MIDTRANS_CORE_API_IMPLEMENTATION_PLAN.md`**](file:///c:/laragon/www/insani-id/docs/implementation-plan/MIDTRANS_CORE_API_IMPLEMENTATION_PLAN.md) — Blueprint migrasi Payment Gateway dari Xendit ke Midtrans Core API (Native UI).
* [**`DOCS_RESTRUCTURE_PLAN.md`**](file:///c:/laragon/www/insani-id/docs/implementation-plan/DOCS_RESTRUCTURE_PLAN.md) — Rencana penataan direktori dokumentasi project.
* [**`archive/`**](file:///c:/laragon/www/insani-id/docs/implementation-plan/archive) — Arsip rencana fase MVP yang telah rampung (`PHASE_1`, `PHASE_2`, `PHASE_8`, `COMPANY_PROFILE_PHASE_1`, `COMPANY_PROFILE_PHASE_2`).

---

### 5. ✍️ [Naskah Konten & Seeder CMS (`docs/content/`)](file:///c:/laragon/www/insani-id/docs/content)
Naskah acuan resmi konten publik dan narasi program yayasan:
* [**`fokus-program-insani.md`**](file:///c:/laragon/www/insani-id/docs/content/fokus-program-insani.md) — Naskah definitif 6 Fokus Program Yayasan (BLOK A Narasi Realitas Lapangan + BLOK B Narasi Capaian Program). Menjadi *source of truth* untuk `CategorySeeder.php`.
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
