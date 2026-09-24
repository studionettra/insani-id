# API & ROUTE SPECIFICATION — Galang Dana Insani Indonesia (GDII)

**Version:** 1.1 (Synced with PRD v1.1, ERD v1.1, DB Dict v1.1, Module Breakdown v1.1)
**Mengacu pada:** PRD_v1_0.md (v1.1), ERD_v1_0.md (v1.1), DATABASE_DICTIONARY_v1_0.md (v1.1), MODULE_BREAKDOWN_v1_0.md (v1.1)
**Stack:** Laravel 13, Inertia.js, React 18, Tailwind CSS (TailAdmin v2.3), Spatie Permission, Spatie Activitylog, Spatie Translatable, MySQL 8, Xendit

---

# 1. Overview

Dokumen ini mendefinisikan seluruh route, controller action, permission, dan response contract.

Karena aplikasi menggunakan Inertia.js, mayoritas request mengembalikan **Inertia Page Response**, bukan REST JSON API.

JSON Endpoint hanya digunakan untuk: AJAX Search/Lookup, Dashboard Widget, Cek Status Donasi (polling), dan **Webhook** dari pihak ketiga (Xendit, penyedia WhatsApp Gateway).

**Format permission:** Granular dot-notation (`module.action`) — lihat PRD v1.0 Section 6.2 untuk daftar lengkap dan mapping ke role.

**Pemisahan Area:** Seluruh route internal berada di bawah prefix **`/admin/*`** (memakai `AdminLayout` + TailAdmin v2.3). Seluruh route di luar prefix tersebut adalah area publik (memakai `PublicLayout`, mobile-first).

**Locale Routing:** Seluruh route **publik** (bukan `/admin/*`) diprefix locale via `mcamara/laravel-localization`: `/id/...` (default), `/ar/...` (RTL), `/en/...`. Route `/admin/*` **tidak** diprefix locale — UI internal tetap 1 bahasa (Indonesia). Contoh: `/program/{slug}` pada tabel route di bawah secara aktual menjadi `/{locale}/program/{slug}` setelah middleware locale diterapkan.

**Domain:** Seluruh route di dokumen ini berjalan di 1 domain yang sama, **`insani.id`**, dengan pola path-based (bukan subdomain) — konsisten dengan struktur URL yang sudah dipakai `insani.id` saat ini. Selama masa development, aplikasi berjalan di domain staging sementara sebelum cutover DNS ke `insani.id` produksi (lihat PRD v1.0 Section 11.1 untuk strategi rilis & coexistence dengan WordPress lama).

---

# 2. Authentication Module

Satu sistem login untuk seluruh tipe pengguna (staff internal, campaigner, donatur terdaftar) — redirect tujuan berbeda tergantung role setelah login berhasil.

| Route | Method | Controller | Permission |
|---|---|---|---|
| `/login` | GET | `AuthController@create` | Public |
| `/login` | POST | `AuthController@store` | Public |
| `/logout` | POST | `AuthController@destroy` | Authenticated |
| `/register` | GET | `RegisterController@create` | Public |
| `/register` | POST | `RegisterController@store` | Public |
| `/forgot-password` | GET | `PasswordResetLinkController@create` | Public |
| `/forgot-password` | POST | `PasswordResetLinkController@store` | Public |
| `/reset-password/{token}` | GET | `NewPasswordController@create` | Public |
| `/reset-password` | POST | `NewPasswordController@store` | Public |

```php
// Login Request
{ "email": "user@email.com", "password": "password" }

// Redirect setelah login sukses:
if ($user->hasAnyRole(['Administrator','Program Officer','Verifikator','Keuangan','CS'])) {
    redirect()->route('admin.dashboard');
} else {
    redirect()->route('akun.index'); // dashboard ringkas campaigner/donatur
}

// Failure
back()->withErrors();
```

> **Catatan:** `/register` di sini adalah pendaftaran akun dasar (untuk donatur yang ingin riwayat donasi tersimpan). Pendaftaran **campaigner** (individu/lembaga) memakai alur terpisah di Section 8, karena butuh kelengkapan dokumen verifikasi.

---

# 3. Admin Dashboard Module (`/admin/*`)

**Permission:** `dashboard.view`

| Route | Method | Controller |
|---|---|---|
| `/admin/dashboard` | GET | `Admin\DashboardController@index` |
| `/admin/dashboard/stats` | GET (AJAX) | `Admin\DashboardController@stats` |

```php
Inertia::render('Admin/Dashboard/Index', [
    'totalDonasiTerkumpul', 'programAktif', 'programMenungguVerifikasi',
    'campaignerBaru', 'danaMenungguPencairan'
]);
```

Widget yang tampil disesuaikan kondisional per role (Administrator melihat semua, Program Officer hanya widget program internal, dst — lihat PRD v1.0 Section 7.1).

```json
{ "total_donasi": 50000000, "program_aktif": 12, "menunggu_verifikasi": 3 }
```

---

# 4. Public Home & Landing Module

| Route | Method | Controller |
|---|---|---|
| `/` | GET | `Public\HomeController@index` |
| `/tentang-kami` | GET | `Public\AboutController@index` |

```php
Inertia::render('Public/Home/Index', [
    'featuredPrograms', 'categories', 'stats' // total dana tersalurkan, dst.
]);

Inertia::render('Public/About/Index', [
    'profile', 'visiMisi', 'legalitas', 'alamatKantor', 'googleMapsUrl'
    // seluruhnya dibaca dari app_settings group 'about'
]);
```

---

# 5. User Management Module (Internal Staff — `/admin/*`)

| Permission | Route | Method | Controller |
|---|---|---|---|
| `user.view` | `/admin/users` | GET | `Admin\UserController@index` |
| `user.create` | `/admin/users/create` | GET | `Admin\UserController@create` |
| `user.create` | `/admin/users` | POST | `Admin\UserController@store` |
| `user.update` | `/admin/users/{user}/edit` | GET | `Admin\UserController@edit` |
| `user.update` | `/admin/users/{user}` | PUT | `Admin\UserController@update` |
| `user.delete` | `/admin/users/{user}` | DELETE | `Admin\UserController@destroy` |

Pages: `Admin/Users/Index.jsx`, `Admin/Users/Create.jsx`, `Admin/Users/Edit.jsx`

> Modul ini khusus mengelola akun **staff internal** (Administrator, Program Officer, Verifikator, Keuangan, CS). Akun campaigner/donatur dikelola lewat modul Campaigner (Section 8), bukan di sini.

---

# 6. Role & Permission Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `role.view` | `/admin/roles` | GET | `Admin\RoleController@index` |
| `role.create` | `/admin/roles` | POST | `Admin\RoleController@store` |
| `role.update` | `/admin/roles/{role}` | PUT | `Admin\RoleController@update` |
| `role.delete` | `/admin/roles/{role}` | DELETE | `Admin\RoleController@destroy` |

---

# 7. Category Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `category.view` | `/admin/categories` | GET | `Admin\CategoryController@index` |
| `category.create` | `/admin/categories` | POST | `Admin\CategoryController@store` |
| `category.update` | `/admin/categories/{category}` | PUT | `Admin\CategoryController@update` |
| `category.delete` | `/admin/categories/{category}` | DELETE | `Admin\CategoryController@destroy` |

Page: `Admin/Categories/Index.jsx`. Form kategori termasuk field `platform_fee_percent`, toggle `is_disaster_category`, dan tab bahasa (ID/AR/EN) untuk `name`/`description` (lihat DATABASE_DICTIONARY v1.0 Section 3.1).

---

# 8. Campaigner Registration & Verification Module

## 8.1 Publik — Pendaftaran Campaigner

| Route | Method | Controller |
|---|---|---|
| `/daftar-campaigner` | GET | `Public\CampaignerRegistrationController@create` |
| `/daftar-campaigner` | POST | `Public\CampaignerRegistrationController@store` |
| `/akun/verifikasi` | GET | `Public\VerificationController@index` |
| `/akun/verifikasi/dokumen` | POST | `Public\VerificationController@uploadDocument` |

```php
// store request — field berbeda tergantung type
{
  "type": "individu|lembaga",
  "ktp_number": "...",                 // wajib untuk individu
  "institution_name": "...",           // wajib untuk lembaga
  "institution_type": "yayasan|organisasi|komunitas",
  "pic_name": "...",
  "npwp_number": "...",
  "sk_legalitas_number": "...",
  "bank_name": "...",
  "bank_account_number": "...",
  "bank_account_name": "..."           // wajib atas nama lembaga untuk type=lembaga
}
```

**Validasi wajib di Form Request:**
- `bank_account_name` untuk `type = lembaga` **tidak boleh** sama dengan nama pribadi PIC (dicek string similarity + wajib centang pernyataan "rekening ini atas nama lembaga") — mencegah pelanggaran aturan larangan rekening pribadi (PRD Section 10.1)
- Setelah `store`, status `campaigner_profiles.verification_status = pending`, akun diarahkan ke `/akun/verifikasi` untuk upload dokumen

## 8.2 Internal — Verifikasi Campaigner

| Permission | Route | Method | Controller |
|---|---|---|---|
| `campaigner.view` | `/admin/campaigners` | GET | `Admin\CampaignerController@index` |
| `campaigner.view` | `/admin/campaigners/{campaigner}` | GET | `Admin\CampaignerController@show` |
| `campaigner.verify` | `/admin/campaigners/{campaigner}/verify` | PATCH | `Admin\CampaignerController@verify` |
| `campaigner.reject` | `/admin/campaigners/{campaigner}/reject` | PATCH | `Admin\CampaignerController@reject` |
| `campaigner.suspend` | `/admin/campaigners/{campaigner}/suspend` | PATCH | `Admin\CampaignerController@suspend` |

```php
// reject / suspend request
{ "verification_notes": "Dokumen SK Yayasan tidak terbaca, mohon upload ulang" }
```

Page: `Admin/Campaigners/Index.jsx`, `Admin/Campaigners/Show.jsx` (menampilkan seluruh dokumen dari `verification_documents` untuk direview satu per satu).

**Business Rule:** `verify` hanya bisa diproses jika seluruh dokumen wajib sesuai tipe sudah ter-upload (lihat DATABASE_DICTIONARY v1.0 Section 2.2 Validation Rules) — divalidasi di backend, bukan hanya di frontend.

---

# 9. Program Module

## 9.1 Publik — Listing, Detail, & Pembuatan Program

| Route | Method | Controller |
|---|---|---|
| `/program` | GET | `Public\ProgramController@index` |
| `/program/{slug}` | GET | `Public\ProgramController@show` |
| `/buat-program` | GET | `Public\ProgramController@create` |
| `/program` | POST | `Public\ProgramController@store` |
| `/akun/program/{program}/edit` | GET | `Public\ProgramController@edit` |
| `/akun/program/{program}` | PUT | `Public\ProgramController@update` |

```php
// GET /program — query params
{ "category": "bencana-alam", "sort": "terbaru|terlama|terbanyak", "search": "..." }

Inertia::render('Public/Program/Index', [
    'programs', 'categories', 'filters'
]);
```

**Business Rule:**
- `/buat-program` hanya dapat diakses user dengan `campaigner_profiles.verification_status = verified`. Jika belum, redirect ke `/daftar-campaigner` atau `/akun/verifikasi`
- `store` otomatis set `status = pending_verification` untuk campaigner eksternal, atau `status = published` langsung jika request berasal dari staff Program Officer melalui `/admin/programs` (lihat Section 9.2)
- `edit`/`update` hanya untuk program milik sendiri (`program.update-own`), dan hanya bisa dilakukan saat `status` masih `draft`/`rejected` (tidak bisa edit konten inti saat sudah `published`, kecuali lewat `program_updates`)
- **Form campaigner eksternal (individu/lembaga) hanya menampilkan 1 field bahasa (Indonesia)** untuk `title`/`story` — bukan tab 3 bahasa seperti form internal, karena tidak diwajibkan menerjemahkan sendiri (lihat PRD Section 2). Backend tetap menyimpan sebagai JSON `{"id": "..."}`, kompatibel dengan struktur translatable yang sama

## 9.2 Internal — Manajemen & Verifikasi Program

| Permission | Route | Method | Controller |
|---|---|---|---|
| `program.view` | `/admin/programs` | GET | `Admin\ProgramController@index` |
| `program.view` | `/admin/programs/{program}` | GET | `Admin\ProgramController@show` |
| `program.create` | `/admin/programs/create` | GET | `Admin\ProgramController@create` |
| `program.create` | `/admin/programs` | POST | `Admin\ProgramController@store` |
| `program.update` | `/admin/programs/{program}` | PUT | `Admin\ProgramController@update` |
| `program.publish` | `/admin/programs/{program}/publish` | PATCH | `Admin\ProgramController@publish` |
| `program.reject` | `/admin/programs/{program}/reject` | PATCH | `Admin\ProgramController@reject` |
| `program.close` | `/admin/programs/{program}/close` | PATCH | `Admin\ProgramController@close` |

```php
// POST /admin/programs — dibuat oleh Program Officer, campaigner_type otomatis 'internal'
// title & story wajib diisi minimal locale 'id'; 'ar'/'en' opsional saat draft, tapi
// direkomendasikan lengkap sebelum publish (validasi soft-warning, bukan hard block)
{
  "title": { "id": "...", "ar": "...", "en": "..." },
  "category_id": 1,
  "target_amount": 50000000,
  "deadline": null,
  "story": { "id": "...", "ar": "...", "en": "..." },
  "cover_image": "..."
}
// Response: status langsung 'published', tanpa antrian verifikasi (lihat PRD Section 8)
```

> **Form UI:** Halaman `Admin/Programs/Create.jsx` menampilkan field `title`/`story` sebagai **tab bahasa** (ID/AR/EN) dalam 1 form, bukan 3 form terpisah — pola umum untuk model translatable di Inertia+React.

```php
// PATCH /admin/programs/{program}/reject
{ "rejection_notes": "Foto pendukung kurang jelas, mohon revisi" }
```

Page: `Admin/Programs/Index.jsx` (filter tab: Semua / Menunggu Verifikasi / Aktif / Ditolak / Selesai), `Admin/Programs/Show.jsx`, `Admin/Programs/Create.jsx` (khusus program internal).

---

# 10. Program Gallery, Document & Update Module

| Route | Method | Controller | Konteks |
|---|---|---|---|
| `/akun/program/{program}/galleries` | POST | `Public\ProgramGalleryController@store` | Campaigner sendiri |
| `/akun/program/{program}/documents` | POST | `Public\ProgramDocumentController@store` | Campaigner sendiri |
| `/akun/program/{program}/updates` | POST | `Public\ProgramUpdateController@store` | Campaigner sendiri |
| `/admin/programs/{program}/updates` | POST | `Admin\ProgramUpdateController@store` | Program Officer (program internal) |

`update-post.create` permission berlaku untuk sisi internal; sisi campaigner memakai policy kepemilikan (`program.update-own`).

---

# 11. Donation & Payment Module

## 11.1 Publik — Alur Donasi

| Route | Method | Controller |
|---|---|---|
| `/program/{slug}/donasi` | GET | `Public\DonationController@create` |
| `/donasi` | POST | `Public\DonationController@store` |
| `/donasi/{donationCode}/status` | GET (AJAX, polling) | `Public\DonationController@status` |

```php
// POST /donasi
{
  "program_id": 10,
  "donor_name": "Budi",
  "donor_email": "budi@email.com",
  "donor_phone": "0812xxxxxxx",
  "is_anonymous": false,
  "message": "Semoga bermanfaat",
  "amount": 100000,
  "payment_method": "virtual_account|ewallet|qris|credit_card|bank_transfer_manual"
}
```

**Alur backend saat `store` (channel online, non `bank_transfer_manual`):**
1. Create baris `donations` (`status = pending`, `channel = online`)
2. Create Invoice via **Xendit Invoice API** → simpan `payments` (`gateway = xendit`, `gateway_reference_id = external_id`)
3. Redirect donatur ke halaman pembayaran hosted Xendit (Invoice URL)

**Alur khusus `bank_transfer_manual`:**
1. Create baris `donations` (`status = pending`, `channel = online`), generate `unique_code` 3 digit acak
2. Create baris `payments` (`gateway = manual`, `payment_method = bank_transfer_manual`)
3. Tampilkan halaman instruksi transfer (nomor rekening tujuan + nominal + kode unik)
4. Menunggu konfirmasi manual oleh CS/Keuangan (lihat Section 11.3)

```json
// GET /donasi/{donationCode}/status — response polling
{ "status": "pending|paid|expired|failed", "paid_at": null }
```

## 11.2 Webhook Xendit

| Route | Method | Controller |
|---|---|---|
| `/webhooks/xendit` | POST | `WebhookController@xendit` |

```php
// Payload contoh dari Xendit (ringkas)
{
  "id": "invoice_id_xendit",
  "external_id": "donation_code_kita",
  "status": "PAID",
  "paid_amount": 100000,
  "payment_method": "BANK_TRANSFER"
}
```

**Keamanan wajib:** Verifikasi header `X-CALLBACK-TOKEN` dari request terhadap token yang dikonfigurasi di `.env` **sebelum** memproses payload apapun — request tanpa token valid harus ditolak (`403`), untuk mencegah pemalsuan status pembayaran oleh pihak luar.

**Alur backend saat webhook diterima:**
1. Validasi `X-CALLBACK-TOKEN`
2. Cocokkan `external_id` dengan `donations.donation_code`
3. Update `payments.gateway_status`, `payments.raw_payload` (payload lengkap)
4. Jika `status = PAID` → trigger Observer (update `donations.status`, `programs.collected_amount`, kirim notifikasi WhatsApp & email kuitansi)

## 11.3 Internal — Manajemen Donasi

| Permission | Route | Method | Controller |
|---|---|---|---|
| `donation.view` | `/admin/donations` | GET | `Admin\DonationController@index` |
| `donation.create` | `/admin/donations/offline` | POST | `Admin\DonationController@storeOffline` |
| `donation.confirm-manual` | `/admin/donations/{donation}/confirm` | PATCH | `Admin\DonationController@confirmManual` |
| `donation.refund` | `/admin/donations/{donation}/refund` | PATCH | `Admin\DonationController@refund` |

```php
// POST /admin/donations/offline — input donasi tunai/manual di luar sistem
{
  "program_id": 10, "donor_name": "Hamba Allah", "amount": 500000,
  "channel": "offline"
  // status langsung 'paid', tidak melalui payments/Xendit
}
```

**Business Rule:** `refund` hanya bisa diproses jika **belum ada** `disbursements` berstatus `processed` untuk program terkait (lihat PRD Section 10.4).

---

# 12. Disbursement Module

## 12.1 Publik — Pengajuan Pencairan (Campaigner)

| Route | Method | Controller |
|---|---|---|
| `/akun/program/{program}/disbursements` | POST | `Public\DisbursementController@store` |

## 12.2 Internal — Approval & Proses Pencairan

| Permission | Route | Method | Controller |
|---|---|---|---|
| `disbursement.view` | `/admin/disbursements` | GET | `Admin\DisbursementController@index` |
| `disbursement.approve` | `/admin/disbursements/{disbursement}/approve` | PATCH | `Admin\DisbursementController@approve` |
| `disbursement.approve` | `/admin/disbursements/{disbursement}/reject` | PATCH | `Admin\DisbursementController@reject` |
| `disbursement.create` | `/admin/disbursements/{disbursement}/process` | PATCH | `Admin\DisbursementController@process` |

**Business Rules (dari DATABASE_DICTIONARY v1.0 Section 6.1):**
- Saat `store`/`approve`, sistem otomatis snapshot `platform_fee_percent` dari kategori program (atau `0.00` jika `campaigner_type = internal` atau kategori bencana alam) dan `bank_account_snapshot` dari `campaigner_profiles`
- `process` (single approval oleh role Keuangan) mengubah `status = processed`, `processed_at = now()`
- Sistem mengirim reminder (via `notification_logs`) ke campaigner untuk memposting `program_updates` jika belum ada laporan dalam periode tertentu pasca-`processed`

---

# 13. Comment Module

| Route | Method | Controller | Permission/Konteks |
|---|---|---|---|
| `/program/{slug}/comments` | POST | `Public\CommentController@store` | Publik (guest boleh, jika terhubung donasi) |
| `/admin/comments/{comment}/hide` | PATCH | `Admin\CommentController@hide` | `comment.moderate` |

---

# 14. Reports Module (Internal Only)

**Permission:** `report.view`

| Route | Method | Controller |
|---|---|---|
| `/admin/reports` | GET | `Admin\ReportController@index` |
| `/admin/reports/donation` | GET | `Admin\ReportController@donation` |
| `/admin/reports/disbursement` | GET | `Admin\ReportController@disbursement` |
| `/admin/reports/campaigner` | GET | `Admin\ReportController@campaigner` |

Export: PDF, Excel (query param `?export=pdf` / `?export=excel`)

---

# 15. Settings Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `settings.view` | `/admin/settings` | GET | `Admin\SettingController@index` |
| `settings.update` | `/admin/settings` | PUT | `Admin\SettingController@update` |
| `settings.view` | `/admin/settings/backups` | GET | `Admin\BackupController@index` |
| `settings.view` | `/admin/settings/backups/{backup}/download` | GET | `Admin\BackupController@download` |

```php
// update request — array key-value sesuai app_settings, termasuk grup 'about'
// Field grup 'about' berbentuk objek per-locale karena app_settings.locale
{
  "platform.nama_platform": "Insani Indonesia",
  "platform.min_donation_amount": 10000,
  "about.visi": { "id": "...", "ar": "...", "en": "..." },
  "about.misi": { "id": "...", "ar": "...", "en": "..." },
  "about.alamat_kantor": "...",
  "about.google_maps_url": "...",
  "about.nama_legal": "Yayasan Peduli Insani Indonesia"
}
```

> **Catatan:** `platform.nama_platform` (brand) tampil di seluruh UI publik & e-kuitansi. `about.nama_legal` (nama badan hukum) **hanya** ditampilkan di halaman Tentang Kami/Legalitas — jangan tertukar saat implementasi form Settings.

> **Halaman `/admin/settings/backups`:** Menampilkan daftar hasil backup (`spatie/laravel-backup`) — tanggal, ukuran file, status sukses/gagal — dan tombol download manual. Khusus **Administrator**. Data ini dibaca langsung dari disk/destinasi backup (bukan tabel database baru), memakai method bawaan package (`BackupDestination::status()`).

---

# 16. AJAX Lookup Endpoints

| Route | Response |
|---|---|
| `GET /ajax/categories` | `[{ "id": 1, "text": "Bencana Alam" }]` |
| `GET /ajax/programs` | Daftar program aktif (untuk search/autocomplete) |
| `GET /admin/ajax/users` | Daftar staff internal (untuk assignment, internal only) |
| `GET /admin/ajax/campaigners` | Daftar campaigner terverifikasi |

---

# 17. Route Naming Convention

```php
// Public
home.index
about.index
password.request password.email password.reset password.update
program.index program.show program.create program.store
program.edit program.update
donation.create donation.store donation.status
comment.store
campaigner-registration.create campaigner-registration.store
verification.index verification.upload-document
akun.index (dashboard ringkas campaigner/donatur)
akun.program.edit akun.program.update
akun.program.galleries.store akun.program.documents.store akun.program.updates.store
akun.disbursements.store

// Admin
admin.dashboard.index
admin.users.index admin.users.create admin.users.store admin.users.edit admin.users.update admin.users.destroy
admin.roles.index admin.roles.store admin.roles.update admin.roles.destroy
admin.categories.index admin.categories.store admin.categories.update admin.categories.destroy
admin.campaigners.index admin.campaigners.show admin.campaigners.verify admin.campaigners.reject admin.campaigners.suspend
admin.programs.index admin.programs.show admin.programs.create admin.programs.store
admin.programs.update admin.programs.publish admin.programs.reject admin.programs.close
admin.programs.updates.store
admin.donations.index admin.donations.store-offline admin.donations.confirm admin.donations.refund
admin.disbursements.index admin.disbursements.approve admin.disbursements.reject admin.disbursements.process
admin.comments.hide
admin.reports.index admin.reports.donation admin.reports.disbursement admin.reports.campaigner
admin.settings.index admin.settings.update
admin.settings.backups.index admin.settings.backups.download

// Webhook (tanpa auth session, verifikasi via token)
webhooks.xendit
```

---

# 18. Middleware Stack

```php
web
auth
verified

permission:user.view
permission:program.publish
permission:disbursement.approve
permission:campaigner.verify
permission:comment.moderate
// dst, sesuai daftar permission di PRD v1.0 Section 6.2

// Khusus area publik pembuatan program:
campaigner.verified   // middleware custom — cek campaigner_profiles.verification_status = verified

// Khusus seluruh route publik (bukan /admin/*):
localeSessionRedirect, localizationRedirect, localeViewPath   // bawaan mcamara/laravel-localization, set locale dari prefix URL + tentukan dir="rtl" saat locale=ar

// Khusus webhook (TIDAK memakai middleware auth/CSRF Laravel default):
verify.xendit-callback-token   // middleware custom — validasi header X-CALLBACK-TOKEN
```

> **Catatan:** Route webhook (`/webhooks/xendit`) **wajib dikecualikan dari CSRF protection** Laravel (`VerifyCsrfToken` middleware exception), karena request datang dari server Xendit, bukan dari form browser. Keamanannya digantikan oleh validasi `X-CALLBACK-TOKEN`.

---

# 19. Security Requirements

- CSRF Protection (dikecualikan khusus untuk route webhook, digantikan token verification)
- Laravel Session Authentication
- Password Hashing (Bcrypt)
- Authorization via Spatie Permission (granular, lihat Section 18)
- Form Request Validation (termasuk validasi dokumen wajib per tipe campaigner, larangan rekening pribadi untuk lembaga)
- Webhook Signature/Token Verification untuk seluruh callback pihak ketiga (Xendit; provider WhatsApp jika mendukung delivery callback)
- Audit Logging via `spatie/laravel-activitylog` — khusus mencakup perubahan status verifikasi, publish/reject program, status donasi, dan pencairan dana
- Soft Deletes pada: `users`, `campaigner_profiles`, `programs`
- Kredensial pihak ketiga (Xendit API Key, token Fonnte/Wablas, kredensial SMTP Email) disimpan di `.env`, **tidak** di tabel `app_settings` (lihat DATABASE_DICTIONARY v1.0 Section 8.2)
- Rate limiting pada endpoint publik yang rawan abuse: `/donasi` (POST), `/program/{slug}/comments` (POST), `/daftar-campaigner` (POST)
- **Backup database harian** via `spatie/laravel-backup`, retensi 7–30 hari, dijadwalkan lewat Laravel Scheduler — lihat PRD v1.0 Section 10.8
- **[CRITICAL] XSS Mitigation (CMS):** Wajib menggunakan *library* **HTML Purifier** (contoh: `mews/purifier`) untuk men-sanitize `content_html` yang ditarik dari WordPress (headless) sebelum disimpan ke `blog_post_cache.content_html` — lihat PRD_COMPANY_PROFILE v1.1 Section 2 & 7.1 untuk detail arsitektur integrasi blog.
- **[CRITICAL] Race Condition Mitigation:** Segala proses manipulasi saldo (Pencairan Dana/Disbursement) WAJIB dibungkus dalam `DB::transaction()` dengan `lockForUpdate()` (Pessimistic Locking).
- **[CRITICAL] RCE Mitigation (Uploads):** Validasi file upload (KTP, Dokumen) wajib mengecek MIME type sesungguhnya (bukan sekadar ekstensi). File disimpan dengan nama random (hash). Webserver (Nginx/Apache) dilarang mengeksekusi script `.php` di dalam folder `storage/app/public`.

---

# 20. Future Extensions

- Integrasi Moota (atau layanan sejenis) untuk rekonsiliasi transfer manual otomatis
- Migrasi WhatsApp Notification ke Official WhatsApp Cloud API (Meta, via BSP)
- Multi Payment Gateway (di luar Xendit)
- Dual-approval untuk pencairan dana nominal besar
- Donor Membership/Badge & Leaderboard
- Notifikasi real-time (mis. progress donasi live update tanpa refresh)




<!-- MERGED FROM API_SPEC_COMPANY_PROFILE_v1_0.md -->

# API & ROUTE SPECIFICATION — Company Profile Insani Indonesia

**Version:** 1.1 (Sinkron dengan PRD v1.1)
**Stack:** Laravel 13, Inertia.js, React 18, Tailwind CSS (TailAdmin v2.3), Spatie Permission, Spatie Activitylog, Spatie Translatable, MySQL 8, WordPress (headless)

---

# 1. Overview

Dokumen ini melanjutkan API_SPEC_v1_0.md (Galang Dana) — route baru di sini **ditambahkan** ke aplikasi Laravel yang sama, bukan aplikasi terpisah. Konvensi yang sama berlaku: Inertia Page Response untuk mayoritas route, JSON hanya untuk AJAX/webhook.

**Locale Routing:** Seluruh route publik di dokumen ini (kecuali `/kabar/*`, lihat catatan) mengikuti pola locale-prefix yang sama dari Galang Dana (`/id/...`, `/ar/...`, `/en/...`).

**Pengecualian Locale — Halaman Kabar:** `/kabar` dan `/kabar/{slug}` **tidak** memakai prefix locale penuh untuk konten (karena blog cuma Bahasa Indonesia di MVP), tapi tetap mewarisi `PublicLayout` yang locale-aware untuk elemen UI di sekitarnya (navbar, footer). Jika diakses dengan prefix `/ar/kabar` atau `/en/kabar`, halaman tetap render dengan pesan "Konten belum tersedia dalam bahasa ini" pada body artikel.

---

# 2. Halaman Beranda & Fokus Program

| Route | Method | Controller |
|---|---|---|
| `/` | GET | `Public\HomeController@index` |
| `/fokus-program` | GET | `Public\FocusProgramController@index` |

```php
Inertia::render('Public/Home/Index', [
    'heroBanners', 'focusPrograms', // categories::focusProgram()
    'impactStats', 'featuredPrograms', // reuse dari Program model, Galang Dana
    'latestArticles', // dari blog_post_cache, limit 3-4
    'partners'
]);

Inertia::render('Public/FocusProgram/Index', [
    'focusPrograms' // categories::focusProgram()->get()
]);
```

---

# 3. Halaman Tentang (Sub-halaman)

| Route | Method | Controller |
|---|---|---|
| `/tentang` | GET | `Public\AboutController@index` (landing, link ke sub-halaman) |
| `/tentang/insani` | GET | `Public\PageController@show` (`slug=tentang-insani`) |
| `/tentang/legal` | GET | `Public\AboutController@legal` (baca dari `app_settings` grup `about`) |
| `/tentang/visi-misi` | GET | `Public\AboutController@visiMisi` (baca dari `app_settings` grup `about`) |
| `/tentang/faq` | GET | `Public\FaqController@index` |
| `/tentang/logo` | GET | `Public\PageController@show` (`slug=logo-kit`) |
| `/tentang/manajemen` | GET | `Public\ManagementController@index` |

```php
Inertia::render('Public/Page/Show', [
    'page' => $page // title, content, attachment_path (untuk logo-kit)
]);

Inertia::render('Public/Faq/Index', [
    'faqs' // faqs::where('is_active', true)->orderBy('sort_order')->get()
]);

Inertia::render('Public/Management/Index', [
    'members' // management_members::where('is_active', true)->orderBy('sort_order')->get()
]);
```

---

# 4. Halaman Kabar (Blog — Headless WordPress)

| Route | Method | Controller |
|---|---|---|
| `/kabar` | GET | `Public\BlogController@index` |
| `/kabar/{slug}` | GET | `Public\BlogController@show` |

```php
// GET /kabar — query params
{ "category": "inspirasi|kabar-insani", "search": "..." }

Inertia::render('Public/Blog/Index', [
    'articles', // dari blog_post_cache, paginated
    'categories' // distinct wp_category dari blog_post_cache
]);

Inertia::render('Public/Blog/Show', [
    'article' // content_html sudah tersanitasi, langsung di-render (dangerouslySetInnerHTML dengan whitelist yang sudah dijamin dari sisi backend)
]);
```

**Business Rule:** Halaman `/kabar/{slug}` **selalu** membaca dari `blog_post_cache` lokal — **tidak pernah** melakukan live call ke WordPress REST API saat request publik masuk. Ini memastikan blog tetap tayang meski WordPress backend down/maintenance. Halaman ini juga tidak menyediakan endpoint komentar (fitur komentar sengaja ditiadakan, lihat PRD Section 6.4) — hanya tombol share statis (WA/FB/Twitter) dan area sidebar kosong yang disiapkan untuk embed campaign Galang Dana di masa depan.

---

# 4.1 Halaman Kontak (Publik)

| Route | Method | Controller |
|---|---|---|
| `/kontak` | GET | `Public\ContactController@create` |
| `/kontak` | POST | `Public\ContactController@store` |

```php
// POST /kontak
{
  "name": "...", "email": "...", "subject": "...", "message": "...",
  "honeypot_field": ""  // wajib kosong, kalau terisi = bot, request ditolak diam-diam (tidak error eksplisit ke bot)
}
```

**Business Rule:** Validasi anti-spam (Honeypot atau Turnstile token) dilakukan di Form Request **sebelum** insert ke `contact_messages`. Setelah insert sukses, trigger email notifikasi otomatis ke Administrator/CS.

---

# 5. Webhook & Sinkronisasi WordPress

## 5.1 Webhook Masuk (dari WordPress)

| Route | Method | Controller |
|---|---|---|
| `/webhooks/wordpress` | POST | `WebhookController@wordpress` |

```php
// Payload dari WordPress (dikirim oleh plugin/functionality kecil saat publish/update/trash)
{
  "post_id": 123,
  "action": "publish|update|trash"
}
```

**Keamanan wajib:** Validasi header custom (mis. `X-WP-WEBHOOK-TOKEN`) terhadap token yang dikonfigurasi di `.env` — pola yang sama dengan validasi webhook Xendit di proyek Galang Dana. Request tanpa token valid ditolak (`403`).

**Alur backend:**
1. Validasi token
2. Jika `action = publish` atau `update` → panggil `BlogSyncService::syncFromWordPress($post_id)` (fetch dari WP REST API, sanitasi, upsert ke `blog_post_cache`)
3. Jika `action = trash` → hapus entri terkait dari `blog_post_cache`

**Route ini dikecualikan dari CSRF protection**, sama seperti `/webhooks/xendit` di proyek Galang Dana.

## 5.2 Scheduled Fallback Sync (Internal, Bukan Route Publik)

```php
// app/Console/Kernel.php
$schedule->job(new FullSyncBlogPostsJob)->hourly();
```

Job ini memanggil `GET /wp-json/wp/v2/posts?per_page=100&page={n}` (paginated, ambil semua post), lalu upsert seluruhnya ke `blog_post_cache`, dan menghapus entri yang `wp_post_id`-nya sudah tidak ditemukan di response WordPress (artinya sudah dihapus/di-unpublish).

---

# 6. Manajemen Konten (Internal — Content Editor)

## 6.1 Halaman Statis

| Permission | Route | Method | Controller |
|---|---|---|---|
| `page.view` | `/admin/pages` | GET | `Admin\PageController@index` |
| `page.update` | `/admin/pages/{page}` | PUT | `Admin\PageController@update` |

## 6.2 FAQ

| Permission | Route | Method | Controller |
|---|---|---|---|
| `faq.view` | `/admin/faqs` | GET | `Admin\FaqController@index` |
| `faq.create` | `/admin/faqs` | POST | `Admin\FaqController@store` |
| `faq.update` | `/admin/faqs/{faq}` | PUT | `Admin\FaqController@update` |
| `faq.delete` | `/admin/faqs/{faq}` | DELETE | `Admin\FaqController@destroy` |

## 6.3 Manajemen/Pengurus

| Permission | Route | Method | Controller |
|---|---|---|---|
| `management.view` | `/admin/management` | GET | `Admin\ManagementController@index` |
| `management.create` | `/admin/management` | POST | `Admin\ManagementController@store` |
| `management.update` | `/admin/management/{member}` | PUT | `Admin\ManagementController@update` |
| `management.delete` | `/admin/management/{member}` | DELETE | `Admin\ManagementController@destroy` |

## 6.4 Mitra

| Permission | Route | Method | Controller |
|---|---|---|---|
| `partner.view` | `/admin/partners` | GET | `Admin\PartnerController@index` |
| `partner.create` | `/admin/partners` | POST | `Admin\PartnerController@store` |
| `partner.update` | `/admin/partners/{partner}` | PUT | `Admin\PartnerController@update` |
| `partner.delete` | `/admin/partners/{partner}` | DELETE | `Admin\PartnerController@destroy` |

## 6.5 Statistik Dampak

| Permission | Route | Method | Controller |
|---|---|---|---|
| `impact-stat.view` | `/admin/impact-stats` | GET | `Admin\ImpactStatController@index` |
| `impact-stat.create` | `/admin/impact-stats` | POST | `Admin\ImpactStatController@store` |
| `impact-stat.update` | `/admin/impact-stats/{stat}` | PUT | `Admin\ImpactStatController@update` |
| `impact-stat.delete` | `/admin/impact-stats/{stat}` | DELETE | `Admin\ImpactStatController@destroy` |

## 6.6 Fokus Program (Field Kategori)

| Permission | Route | Method | Controller |
|---|---|---|---|
| `category.update` | `/admin/categories/{category}/pillar` | PATCH | `Admin\CategoryController@updatePillar` |

```php
// PATCH request — hanya field pilar, bukan seluruh Category
{ "is_focus_program": true, "pillar_image": "..." }
```

> **Catatan:** Endpoint ini **terpisah** dari `PUT /admin/categories/{category}` (yang sudah ada di API_SPEC Galang Dana, eksklusif Administrator) — supaya Content Editor bisa diberi akses `category.update` **hanya** untuk field pilar via controller method berbeda, tanpa bisa mengubah `name`/`platform_fee_percent`/dst. Pemisahan ini dilakukan di level **Policy** (`CategoryPolicy::updatePillar()` vs `CategoryPolicy::update()`), bukan cuma di route.

## 6.7 Monitoring Sinkronisasi Blog

| Permission | Route | Method | Controller |
|---|---|---|---|
| `blog.view` | `/admin/blog-sync` | GET | `Admin\BlogSyncController@index` |
| `blog.sync-manual` | `/admin/blog-sync/resync` | POST | `Admin\BlogSyncController@resync` |

```php
Inertia::render('Admin/BlogSync/Index', [
    'lastSyncedAt', 'totalArticles', 'recentSyncLog'
]);
```

`resync` memicu `FullSyncBlogPostsJob` secara manual (dispatched ke queue, bukan sinkron langsung) — dipakai untuk troubleshooting jika webhook WordPress gagal terkirim.

## 6.8 Homepage Banner

| Permission | Route | Method | Controller |
|---|---|---|---|
| `homepage-banner.view` | `/admin/banners` | GET | `Admin\BannerController@index` |
| `homepage-banner.create` | `/admin/banners` | POST | `Admin\BannerController@store` |
| `homepage-banner.update` | `/admin/banners/{banner}` | PUT | `Admin\BannerController@update` |
| `homepage-banner.delete` | `/admin/banners/{banner}` | DELETE | `Admin\BannerController@destroy` |

```php
// POST /admin/banners
{
  "title": "Banner Ramadan 2027",
  "image_desktop": "...", "image_mobile": null,
  "link_url": "/program/santunan-ramadan",
  "sort_order": 1, "is_active": true
}
```

## 6.9 Inbox Pesan Kontak

| Permission | Route | Method | Controller |
|---|---|---|---|
| `contact-message.view` | `/admin/contact-messages` | GET | `Admin\ContactMessageController@index` |
| `contact-message.reply` | `/admin/contact-messages/{message}/read` | PATCH | `Admin\ContactMessageController@markAsRead` |

```php
Inertia::render('Admin/ContactMessages/Index', [
    'messages' // paginated, filter is_read
]);
```

`markAsRead` mengisi `is_read = true`, `read_by = auth()->id()`, `read_at = now()`.

---

# 7. AJAX Lookup Endpoints (Tambahan)

| Route | Response |
|---|---|
| `GET /ajax/focus-programs` | `[{ "id": 1, "text": "Ketahanan Pangan", "slug": "..." }]` — dari `categories::focusProgram()` |
| `GET /admin/ajax/blog-categories` | Daftar `wp_category` unik dari `blog_post_cache`, untuk filter |

---

# 8. Route Naming Convention (Tambahan)

```php
// Public
home.index
focus-program.index
about.index about.legal about.visi-misi
page.show
faq.index
management.index
blog.index blog.show
contact.create contact.store

// Webhook
webhooks.wordpress

// Admin
admin.pages.index admin.pages.update
admin.faqs.index admin.faqs.store admin.faqs.update admin.faqs.destroy
admin.management.index admin.management.store admin.management.update admin.management.destroy
admin.partners.index admin.partners.store admin.partners.update admin.partners.destroy
admin.impact-stats.index admin.impact-stats.store admin.impact-stats.update admin.impact-stats.destroy
admin.categories.update-pillar
admin.blog-sync.index admin.blog-sync.resync
admin.banners.index admin.banners.store admin.banners.update admin.banners.destroy
admin.contact-messages.index admin.contact-messages.read
```

---

# 9. Middleware Stack (Tambahan)

```php
permission:page.update
permission:faq.create
permission:management.create
permission:partner.create
permission:impact-stat.create
permission:blog.sync-manual
permission:homepage-banner.create
permission:contact-message.reply

// Khusus form kontak publik (bukan permission staff, validasi anti-spam):
verify.contact-anti-spam   // Form Request custom — cek Honeypot/Turnstile sebelum insert ke contact_messages

// Khusus webhook WordPress (dikecualikan dari CSRF, sama pola dengan Xendit):
verify.wordpress-webhook-token
```

---

# 10. Security Requirements (Tambahan)

- Webhook WordPress **wajib** validasi token custom, dikecualikan dari CSRF protection Laravel — sama prinsip dengan webhook Xendit di proyek Galang Dana
- `content_html` dari WordPress **wajib** melalui `mews/purifier` sebelum disimpan ke `blog_post_cache` — tidak pernah render HTML mentah dari sumber eksternal tanpa sanitasi, meski sumbernya staff internal terpercaya
- WP-Admin **tidak** terhubung SSO ke sistem auth Laravel — akses dibatasi tim kecil penulis konten, dikelola terpisah di sisi WordPress
- Endpoint `category.update` untuk field pilar dipisah secara **Policy-level** dari endpoint `category.update` penuh — mencegah Content Editor mengubah field sensitif (`platform_fee_percent`, dsb.) meski permission name-nya sama

---

# 11. Future Extensions

- Terjemahan konten blog (AR/EN) jika kebutuhan berkembang
- Pencarian full-text artikel Kabar (Laravel Scout, jika volume artikel besar)
- Newsletter/subscribe terintegrasi dengan `notification_logs` (reuse infrastruktur WhatsApp/email dari Galang Dana)
- Counter animation & micro-interaction untuk statistik dampak
