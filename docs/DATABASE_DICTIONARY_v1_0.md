# DATABASE DICTIONARY — Galang Dana Insani Indonesia (GDII)

**Version:** 1.1 (Synced with PRD v1.1 & ERD v1.1)
**Mengacu pada:** PRD_v1_0.md (v1.1), ERD_v1_0.md (v1.1)
**Stack:** Laravel 13, MySQL 8, Inertia.js, React, Tailwind CSS (TailAdmin v2.3), Spatie Permission, Spatie Activitylog, Spatie Translatable, Xendit

---

# Database Standards

## Primary Key

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
```

## Timestamps

```php
$table->timestamps(); // created_at, updated_at
```

## Soft Delete

Digunakan pada tabel yang riwayatnya harus tetap bisa diaudit meski "dihapus" dari tampilan aktif: `users`, `campaigner_profiles`, `programs`.

```php
$table->softDeletes();
```

## Internationalization (i18n)

Field yang butuh terjemahan (ID/AR/EN) disimpan sebagai kolom **JSON** di tabel yang sama (bukan tabel `_translations` terpisah), memakai package:

```bash
composer require spatie/laravel-translatable
composer require mcamara/laravel-localization
```

```php
use Spatie\Translatable\HasTranslations;

class Program extends Model
{
    use HasTranslations;
    public $translatable = ['title', 'story'];
}
```

Tabel dengan kolom translatable: `categories` (`name`, `description`), `programs` (`title`, `story`), `program_updates` (`title`, `content`). Tabel `app_settings` memakai pendekatan berbeda (kolom `locale` terpisah, bukan JSON) karena strukturnya sudah key-value.

---

## Audit Fields

Mengikuti pola FK bernama eksplisit sesuai konteks bisnis (bukan generic `created_by`/`updated_by` di semua tabel) — misalnya `requested_by`, `approved_by`, `verified_by`, `posted_by`, `confirmed_by`, `hidden_by`. Setiap FK ini nullable jika aktor bisa jadi sistem otomatis (mis. webhook Xendit), dan wajib diisi jika aksi dilakukan manual oleh staff.

---

# 1. AUTHENTICATION

## 1.1 `users`

Satu tabel untuk seluruh tipe pengguna (staff internal, donatur, campaigner). Tipe & hak akses dikelola sepenuhnya oleh `spatie/laravel-permission` — **tidak ada kolom `role` atau `type` di tabel ini**.

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| name | varchar(255) | No | | Nama lengkap |
| email | varchar(255) | No | UNIQUE | |
| phone | varchar(30) | Yes | UNIQUE | Wajib diisi untuk pengguna yang perlu notifikasi WhatsApp |
| password | varchar(255) | No | | Bcrypt hash |
| email_verified_at | datetime | Yes | | |
| is_active | boolean | No | | |
| last_login_at | datetime | Yes | | |
| remember_token | varchar(100) | Yes | | Laravel default |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |
| deleted_at | timestamp | | | Soft delete |

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NULL,
    password VARCHAR(255) NOT NULL,
    email_verified_at DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_phone (phone)
);
```

```php
User::hasOne(CampaignerProfile::class);
User::hasMany(Program::class, 'created_by');
User::hasMany(Program::class, 'verified_by');
User::hasMany(ProgramUpdate::class, 'posted_by');
User::hasMany(Donation::class, 'donor_user_id');
User::hasMany(Disbursement::class, 'requested_by');
User::hasMany(Disbursement::class, 'approved_by');
User::hasMany(Comment::class);
User::hasMany(Comment::class, 'hidden_by');
User::hasMany(Payment::class, 'confirmed_by');
User::hasMany(CampaignerProfile::class, 'verified_by');
```

### Authorization Tables (Spatie Permission — auto-generated, jangan dibuat manual)

```text
roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
```

### Audit Table (Spatie Activitylog — auto-generated)

```bash
composer require spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
```

Tabel `activity_log` dihasilkan otomatis dengan kolom: `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `properties` (JSON), `created_at`, `updated_at`.

### Framework Tables (Laravel — auto-generated)

**`password_reset_tokens`** — fitur Lupa Password (PRD Section 13):

```sql
-- Migration: sudah termasuk di default Laravel
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    PRIMARY KEY (email)
);
```

**`jobs`** dan **`failed_jobs`** — Database Queue driver (PRD Section 10.10). Wajib ada karena hosting Hostinger tidak mendukung Redis:

```bash
php artisan queue:table
php artisan queue:failed-table
php artisan migrate
```

```sql
CREATE TABLE jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    KEY idx_jobs_queue (queue)
);

CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_failed_jobs_uuid (uuid)
);
```

Tabel ini digunakan oleh: webhook Xendit, pengiriman notifikasi WhatsApp (Fonnte/Wablas), pengiriman email transaksional (SMTP), recalculate `programs.collected_amount`, dan reminder update program.

---

# 2. CAMPAIGNER & VERIFICATION

## 2.1 `campaigner_profiles`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| user_id | bigint | No | UNIQUE, FK → users.id | 1 user hanya punya 1 profil campaigner |
| type | enum | No | | `individu`, `lembaga` |
| ktp_number | varchar(50) | Yes | | Wajib untuk `individu`; untuk `lembaga` diisi milik PIC |
| institution_name | varchar(255) | Yes | | Wajib untuk `lembaga` |
| institution_type | varchar(100) | Yes | | mis. `yayasan`, `organisasi`, `komunitas` |
| pic_name | varchar(255) | Yes | | Wajib untuk `lembaga` |
| npwp_number | varchar(50) | Yes | | Wajib untuk `lembaga` |
| sk_legalitas_number | varchar(100) | Yes | | Wajib untuk `lembaga` |
| bank_name | varchar(100) | No | | |
| bank_account_number | varchar(50) | No | | |
| bank_account_name | varchar(255) | No | | **Wajib atas nama lembaga** untuk tipe `lembaga` — divalidasi manual oleh Verifikator, bukan constraint database |
| verification_status | enum | No | | `pending`, `verified`, `rejected`, `suspended` |
| verification_notes | text | Yes | | Wajib diisi saat `rejected`/`suspended` |
| verified_by | bigint | Yes | FK → users.id | |
| verified_at | datetime | Yes | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |
| deleted_at | timestamp | | | Soft delete |

```sql
CREATE TABLE campaigner_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('individu','lembaga') NOT NULL,
    ktp_number VARCHAR(50) NULL,
    institution_name VARCHAR(255) NULL,
    institution_type VARCHAR(100) NULL,
    pic_name VARCHAR(255) NULL,
    npwp_number VARCHAR(50) NULL,
    sk_legalitas_number VARCHAR(100) NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_account_number VARCHAR(50) NOT NULL,
    bank_account_name VARCHAR(255) NOT NULL,
    verification_status ENUM('pending','verified','rejected','suspended') NOT NULL DEFAULT 'pending',
    verification_notes TEXT NULL,
    verified_by BIGINT UNSIGNED NULL,
    verified_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uq_campaigner_profiles_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

```php
CampaignerProfile::belongsTo(User::class);
CampaignerProfile::belongsTo(User::class, 'verified_by');
CampaignerProfile::hasMany(VerificationDocument::class);
CampaignerProfile::hasMany(Program::class);
```

## 2.2 `verification_documents`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| campaigner_profile_id | bigint | No | FK → campaigner_profiles.id | |
| document_type | enum | No | | `ktp`, `selfie`, `sk_yayasan`, `npwp`, `buku_rekening`, `lainnya` |
| file_path | varchar(255) | No | | |
| uploaded_at | datetime | No | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE verification_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campaigner_profile_id BIGINT UNSIGNED NOT NULL,
    document_type ENUM('ktp','selfie','sk_yayasan','npwp','buku_rekening','lainnya') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (campaigner_profile_id) REFERENCES campaigner_profiles(id)
);
```

```php
VerificationDocument::belongsTo(CampaignerProfile::class);
```

**Validation Rules (wajib di Form Request, bukan constraint database):**
- Tipe `individu`: minimal dokumen `ktp` + `selfie` ter-upload sebelum status bisa diajukan berubah ke `verified`
- Tipe `lembaga`: minimal dokumen `ktp`, `selfie`, `sk_yayasan`, `npwp`, `buku_rekening` ter-upload sebelum status bisa diajukan berubah ke `verified`

---

# 3. MASTER DATA

## 3.1 `categories`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| name | json | No | | Translatable via `spatie/laravel-translatable`: `{"id":"...","ar":"...","en":"..."}` |
| slug | varchar(120) | No | UNIQUE | Language-neutral |
| description | json | Yes | | Translatable |
| icon | varchar(100) | Yes | | Nama ikon (Lucide/Bootstrap Icons) untuk tampilan simbol di homepage |
| platform_fee_percent | decimal(5,2) | No | | Default `5.00` |
| is_disaster_category | boolean | No | | Default `false`; kategori Bencana Alam di-seed `true` dengan fee `0.00` |
| is_active | boolean | No | | |
| sort_order | integer | No | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name JSON NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description JSON NULL,
    icon VARCHAR(100) NULL,
    platform_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    is_disaster_category BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_categories_slug (slug)
);
```

```php
// Model Category
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasTranslations;
    public $translatable = ['name', 'description'];
}
```

Contoh seed data (nilai `name` disederhanakan, aktualnya JSON 3 bahasa):

```text
name=Bencana Alam,  slug=bencana-alam,  platform_fee_percent=0.00, is_disaster_category=true
name=Kesehatan,      slug=kesehatan,      platform_fee_percent=5.00, is_disaster_category=false
name=Pendidikan,     slug=pendidikan,     platform_fee_percent=5.00, is_disaster_category=false
name=Pemberdayaan,   slug=pemberdayaan,   platform_fee_percent=5.00, is_disaster_category=false
name=Yatim,          slug=yatim,          platform_fee_percent=5.00, is_disaster_category=false
name=Kemanusiaan,    slug=kemanusiaan,    platform_fee_percent=5.00, is_disaster_category=false
```

```php
Category::hasMany(Program::class);
```

---

# 4. PROGRAM (CAMPAIGN)

## 4.1 `programs`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| program_code | varchar(30) | No | UNIQUE | |
| title | json | No | | Translatable — hanya locale `id` wajib untuk `campaigner_type` selain `internal` |
| slug | varchar(255) | No | UNIQUE | Language-neutral |
| category_id | bigint | No | FK → categories.id | |
| campaigner_type | enum | No | | `individu`, `lembaga`, `internal` |
| campaigner_profile_id | bigint | Yes | FK → campaigner_profiles.id | NULL jika `campaigner_type = internal` |
| created_by | bigint | No | FK → users.id | |
| verified_by | bigint | Yes | FK → users.id | NULL jika `campaigner_type = internal` (skip verifikasi) |
| target_amount | decimal(15,2) | Yes | | Boleh NULL (program tanpa target nominal spesifik) |
| collected_amount | decimal(15,2) | No | | **Cached** — default `0.00`, diupdate via Observer |
| deadline | date | Yes | | NULL = program tanpa batas waktu |
| story | json | No | | Translatable — rich text per bahasa |
| cover_image | varchar(255) | No | | |
| video_url | varchar(255) | Yes | | |
| status | enum | No | | Lihat lifecycle di ERD Section 8 |
| rejection_notes | text | Yes | | Wajib diisi saat `status = rejected` |
| published_at | datetime | Yes | | |
| closed_at | datetime | Yes | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |
| deleted_at | timestamp | | | Soft delete |

```sql
CREATE TABLE programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_code VARCHAR(30) NOT NULL,
    title JSON NOT NULL,
    slug VARCHAR(255) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    campaigner_type ENUM('individu','lembaga','internal') NOT NULL,
    campaigner_profile_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    verified_by BIGINT UNSIGNED NULL,
    target_amount DECIMAL(15,2) NULL,
    collected_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    deadline DATE NULL,
    story JSON NOT NULL,
    cover_image VARCHAR(255) NOT NULL,
    video_url VARCHAR(255) NULL,
    status ENUM('draft','pending_verification','published','rejected','completed','closed_manual') NOT NULL DEFAULT 'draft',
    rejection_notes TEXT NULL,
    published_at DATETIME NULL,
    closed_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uq_programs_code (program_code),
    UNIQUE KEY uq_programs_slug (slug),
    KEY idx_programs_status (status),
    KEY idx_programs_category (category_id),
    KEY idx_programs_listing (status, category_id, created_at),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (campaigner_profile_id) REFERENCES campaigner_profiles(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

> **Catatan penting:** `campaigner_profile_id` NULLABLE by design — bukan celah bug. Divalidasi di Form Request: jika `campaigner_type != internal`, maka `campaigner_profile_id` **wajib** diisi dan harus berstatus `verified`.

```php
// Model Program
use Spatie\Translatable\HasTranslations;

class Program extends Model
{
    use HasTranslations;
    public $translatable = ['title', 'story'];
    // Aturan aplikasi: untuk campaigner_type != 'internal', hanya locale 'id' yang divalidasi wajib diisi.
    // Fallback locale diatur di config/translatable.php (fallback_locale => 'id').
}
```

```php
Program::belongsTo(Category::class);
Program::belongsTo(CampaignerProfile::class);
Program::belongsTo(User::class, 'created_by');
Program::belongsTo(User::class, 'verified_by');
Program::hasMany(ProgramGallery::class);
Program::hasMany(ProgramDocument::class);
Program::hasMany(ProgramUpdate::class);
Program::hasMany(Donation::class);
Program::hasMany(Disbursement::class);
Program::hasMany(Comment::class);
```

## 4.2 `program_galleries`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| program_id | bigint | No | FK → programs.id | |
| file_path | varchar(255) | No | | |
| type | enum | No | | `image`, `video` |
| sort_order | integer | No | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE program_galleries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    type ENUM('image','video') NOT NULL DEFAULT 'image',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

```php
ProgramGallery::belongsTo(Program::class);
```

## 4.3 `program_documents`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| program_id | bigint | No | FK → programs.id | |
| file_path | varchar(255) | No | | |
| description | varchar(255) | Yes | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE program_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

```php
ProgramDocument::belongsTo(Program::class);
```

## 4.4 `program_updates`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| program_id | bigint | No | FK → programs.id | |
| title | json | No | | Translatable |
| content | json | No | | Translatable |
| image_path | varchar(255) | Yes | | |
| posted_by | bigint | No | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE program_updates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    title JSON NOT NULL,
    content JSON NOT NULL,
    image_path VARCHAR(255) NULL,
    posted_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (posted_by) REFERENCES users(id)
);
```

```php
ProgramUpdate::belongsTo(Program::class);
ProgramUpdate::belongsTo(User::class, 'posted_by');

// use Spatie\Translatable\HasTranslations; public $translatable = ['title', 'content'];
```

---

# 5. DONATION & PAYMENT

## 5.1 `donations`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| donation_code | varchar(30) | No | UNIQUE | |
| program_id | bigint | No | FK → programs.id | |
| donor_user_id | bigint | Yes | FK → users.id | NULL jika guest checkout |
| donor_name | varchar(255) | No | | Snapshot, tidak bergantung ke akun |
| donor_email | varchar(255) | No | | |
| donor_phone | varchar(30) | No | | Untuk notifikasi WhatsApp |
| is_anonymous | boolean | No | | Default `false` |
| message | text | Yes | | Pesan/doa |
| amount | decimal(15,2) | No | | Nominal murni, belum termasuk kode unik |
| unique_code | smallint unsigned | Yes | | 3 digit acak (100–999), khusus channel transfer manual. Validasi unik **per program per hari** (bukan global) — lihat PRD Section 10.3 |
| channel | enum | No | | `online`, `offline` |
| status | enum | No | | `pending`, `paid`, `expired`, `failed`, `refunded` |
| paid_at | datetime | Yes | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    donation_code VARCHAR(30) NOT NULL,
    program_id BIGINT UNSIGNED NOT NULL,
    donor_user_id BIGINT UNSIGNED NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(30) NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT NULL,
    amount DECIMAL(15,2) NOT NULL,
    unique_code SMALLINT UNSIGNED NULL,
    channel ENUM('online','offline') NOT NULL DEFAULT 'online',
    status ENUM('pending','paid','expired','failed','refunded') NOT NULL DEFAULT 'pending',
    paid_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_donations_code (donation_code),
    KEY idx_donations_program_status (program_id, status),
    KEY idx_donations_unique_code (program_id, unique_code, created_at),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (donor_user_id) REFERENCES users(id)
);
```

**Validation Rules (wajib di Form Request):**
- `amount` ≥ nilai minimum donasi yang dikonfigurasi di `app_settings` (default Rp 10.000)
- Jika `channel = offline`: tidak boleh ada baris `payments` terkait dengan `gateway = xendit`; `status` diset langsung `paid` oleh staff yang menginput

```php
Donation::belongsTo(Program::class);
Donation::belongsTo(User::class, 'donor_user_id');
Donation::hasMany(Payment::class);
Donation::hasMany(Comment::class);
```

## 5.2 `payments`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| donation_id | bigint | No | FK → donations.id | |
| payment_method | enum | No | | `virtual_account`, `ewallet`, `qris`, `credit_card`, `bank_transfer_manual` |
| gateway | varchar(30) | No | | `xendit` atau `manual` |
| gateway_reference_id | varchar(100) | Yes | | `external_id`/Invoice ID Xendit |
| gateway_status | varchar(50) | Yes | | Status mentah dari webhook (`PAID`, `EXPIRED`, dst.) |
| paid_amount | decimal(15,2) | Yes | | |
| paid_at | datetime | Yes | | |
| confirmed_by | bigint | Yes | FK → users.id | Diisi jika `gateway = manual` |
| raw_payload | json | Yes | | Payload webhook mentah, untuk audit |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT UNSIGNED NOT NULL,
    payment_method ENUM('virtual_account','ewallet','qris','credit_card','bank_transfer_manual') NOT NULL,
    gateway VARCHAR(30) NOT NULL,
    gateway_reference_id VARCHAR(100) NULL,
    gateway_status VARCHAR(50) NULL,
    paid_amount DECIMAL(15,2) NULL,
    paid_at DATETIME NULL,
    confirmed_by BIGINT UNSIGNED NULL,
    raw_payload JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    KEY idx_payments_gateway_ref (gateway_reference_id),
    FOREIGN KEY (donation_id) REFERENCES donations(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id)
);
```

**Implementation note:** Gunakan Model Observer pada `Payment` (created/updated) untuk:
1. Update `donations.status` & `donations.paid_at` saat `gateway_status = PAID`
2. Recalculate `programs.collected_amount` dari `SUM` seluruh `donations.amount WHERE status = paid` pada program terkait
3. Trigger pengiriman notifikasi WhatsApp + email (insert baris baru ke `notification_logs` — channel `whatsapp` dan `email`)

```php
Payment::belongsTo(Donation::class);
Payment::belongsTo(User::class, 'confirmed_by');
```

---

# 6. DISBURSEMENT

## 6.1 `disbursements`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| disbursement_code | varchar(30) | No | UNIQUE | |
| program_id | bigint | No | FK → programs.id | |
| requested_amount | decimal(15,2) | No | | |
| platform_fee_percent | decimal(5,2) | No | | **Snapshot** dari `categories.platform_fee_percent` saat pencairan diproses |
| platform_fee_amount | decimal(15,2) | No | | `requested_amount * platform_fee_percent / 100` |
| net_amount | decimal(15,2) | No | | `requested_amount - platform_fee_amount` |
| bank_account_snapshot | varchar(255) | No | | Snapshot rekening campaigner saat pencairan |
| status | enum | No | | `requested`, `approved`, `processed`, `rejected` |
| requested_by | bigint | No | FK → users.id | |
| approved_by | bigint | Yes | FK → users.id | |
| processed_at | datetime | Yes | | |
| notes | text | Yes | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE disbursements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    disbursement_code VARCHAR(30) NOT NULL,
    program_id BIGINT UNSIGNED NOT NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    platform_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    platform_fee_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    bank_account_snapshot VARCHAR(255) NOT NULL,
    status ENUM('requested','approved','processed','rejected') NOT NULL DEFAULT 'requested',
    requested_by BIGINT UNSIGNED NOT NULL,
    approved_by BIGINT UNSIGNED NULL,
    processed_at DATETIME NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_disbursements_code (disbursement_code),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

**Business Rules:**
```text
Program campaigner_type = internal  → platform_fee_percent = 0.00 (di-set otomatis, tidak mengambil dari kategori)
Program kategori is_disaster_category = true → platform_fee_percent = 0.00
Program lainnya → platform_fee_percent = categories.platform_fee_percent (saat ini 5.00)
```

```php
Disbursement::belongsTo(Program::class);
Disbursement::belongsTo(User::class, 'requested_by');
Disbursement::belongsTo(User::class, 'approved_by');
```

---

# 7. ENGAGEMENT

## 7.1 `comments`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| program_id | bigint | No | FK → programs.id | |
| donation_id | bigint | Yes | FK → donations.id | |
| user_id | bigint | Yes | FK → users.id | |
| content | text | No | | |
| is_hidden | boolean | No | | Default `false` |
| hidden_by | bigint | Yes | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    donation_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NULL,
    content TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    hidden_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (donation_id) REFERENCES donations(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hidden_by) REFERENCES users(id)
);
```

```php
Comment::belongsTo(Program::class);
Comment::belongsTo(Donation::class);
Comment::belongsTo(User::class);
Comment::belongsTo(User::class, 'hidden_by');
```

---

# 8. SYSTEM

## 8.1 `notification_logs`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| notifiable_type | varchar(100) | No | | Polymorphic: `Donation`, `CampaignerProfile`, `Program` |
| notifiable_id | bigint | No | | |
| channel | enum | No | | `whatsapp`, `email` |
| recipient | varchar(100) | No | | |
| message | text | No | | Snapshot isi pesan |
| status | enum | No | | `queued`, `sent`, `failed` |
| provider | varchar(30) | No | | `fonnte`, `wablas`, `smtp` |
| provider_response | text | Yes | | |
| sent_at | datetime | Yes | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE notification_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notifiable_type VARCHAR(100) NOT NULL,
    notifiable_id BIGINT UNSIGNED NOT NULL,
    channel ENUM('whatsapp','email') NOT NULL,
    recipient VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
    provider VARCHAR(30) NOT NULL,
    provider_response TEXT NULL,
    sent_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    KEY idx_notification_logs_notifiable (notifiable_type, notifiable_id)
);
```

```php
NotificationLog::morphTo('notifiable');
```

## 8.2 `app_settings`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| group | varchar(50) | No | | |
| key | varchar(100) | No | | |
| value | text | Yes | | |
| type | enum | No | | `string`, `number`, `boolean`, `json` |
| locale | varchar(5) | Yes | | `id`/`ar`/`en`; NULL untuk konfigurasi teknis yang tidak butuh terjemahan |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE app_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group` VARCHAR(50) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT,
    `type` ENUM('string','number','boolean','json') NOT NULL DEFAULT 'string',
    `locale` VARCHAR(5) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_group_key_locale (`group`, `key`, `locale`)
);
```

Contoh isi:

```text
group=platform, key=nama_platform,               value=Insani Indonesia, locale=NULL
group=platform, key=min_donation_amount,          value=10000, locale=NULL
group=platform, key=default_platform_fee_percent, value=5, locale=NULL
group=xendit,   key=api_key,                      value=(encrypted, disimpan via .env bukan di sini)
group=whatsapp, key=provider,                     value=fonnte, locale=NULL
group=about,    key=visi,                         value=..., locale=id
group=about,    key=visi,                         value=..., locale=ar
group=about,    key=visi,                         value=..., locale=en
group=about,    key=misi,                         value=..., locale=id
group=about,    key=alamat_kantor,                value=..., locale=NULL
group=about,    key=google_maps_url,               value=..., locale=NULL
group=about,    key=nomor_legalitas,               value=..., locale=NULL
group=about,    key=nama_legal,                    value=Yayasan Peduli Insani Indonesia, locale=NULL
```

> **Catatan branding:** `platform.nama_platform` (brand "Insani Indonesia") dipakai di seluruh UI publik, e-kuitansi, dan notifikasi WhatsApp/email. `about.nama_legal` (nama badan hukum lengkap) **hanya** dipakai di halaman Tentang Kami/Legalitas — kedua field ini sengaja dipisah supaya tidak tertukar.

> **Catatan keamanan:** Kredensial sensitif (API key Xendit, token Fonnte/Wablas) **sebaiknya tetap disimpan di `.env`**, bukan di `app_settings`, meskipun secara skema tabel ini bisa menampungnya. `app_settings` khusus untuk konfigurasi non-rahasia yang perlu diubah Administrator via UI tanpa deploy ulang.

## 8.3 `activity_log` (Spatie Package — jangan dibuat manual)

Tabel `activity_log` dihasilkan otomatis oleh package, kolom standar: `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `properties` (JSON), `created_at`, `updated_at`.

Model yang wajib memakai trait `LogsActivity`: `Program`, `Donation`, `Payment`, `Disbursement`, `CampaignerProfile` (khusus perubahan `verification_status`), `User`.

---

# 9. FUTURE TABLES (Phase 2+, Belum Masuk MVP)

```text
bank_mutation_logs      -- untuk integrasi Moota/rekonsiliasi otomatis
refund_requests          -- jika refund butuh alur approval terpisah dari payments
donor_badges              -- gamifikasi donatur (leaderboard, badge)
program_faqs              -- FAQ per program, jika dibutuhkan
```

---

# 10. Estimated Database Size

## Business Tables (14)

```text
users
campaigner_profiles
verification_documents
categories
programs
program_galleries
program_documents
program_updates
donations
payments
disbursements
comments
notification_logs
app_settings
```

## Package Tables (6)

```text
roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
activity_log
```

## Framework Tables (3 — Laravel, auto-generated)

```text
password_reset_tokens    (fitur Lupa Password)
jobs                     (Database Queue driver)
failed_jobs              (Dead letter queue)
```

## Grand Total: **23 Tables** (14 Business + 6 Package + 3 Framework)
