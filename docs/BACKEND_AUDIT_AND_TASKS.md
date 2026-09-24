

<!-- MERGED FROM backend-analysis-2026-08-04.md -->

# 🔍 Analisis Backend Project Insani-ID

Hasil audit menyeluruh terhadap backend Laravel project **insani-id** — platform crowdfunding/donasi.

---

## Ringkasan

Project ini secara keseluruhan sudah memiliki fondasi yang baik: observer-based payment flow, permission system via Spatie, activity logging, dan webhook handling. Namun ada sejumlah **kekurangan kritis** dan **area perbaikan** yang perlu ditangani sebelum production-ready.

---

## 🔴 Kekurangan Kritis (Security & Data Integrity)

### 1. Route Comment Tanpa Auth Middleware
**File:** [web.php](file:///c:/laragon/www/insani-id/routes/web.php#L153)

```php
Route::post('/programs/{program}/comments', [...CommentController::class, 'store'])
    ->name('programs.comments.store');
```

Route ini **berada di luar** group `auth` middleware. Siapapun (termasuk bot) bisa spam komentar tanpa login. Tidak ada rate limiting juga.

> [!CAUTION]
> **Risiko**: Spam komentar massal, injeksi konten berbahaya, abuse endpoint publik.

---

### 2. Admin Routes Tanpa Role/Permission Check
**File:** [web.php](file:///c:/laragon/www/insani-id/routes/web.php#L71-L138)

Seluruh route admin hanya dilindungi `auth` + `verified`, **tapi tidak ada middleware role check** di level group. Beberapa sub-route punya `permission:...`, tapi yang lain tidak:

| Route | Permission Check |
|---|---|
| `admin.users.*` | ❌ **Tidak ada** |
| `admin.categories.*` | ❌ **Tidak ada** (hanya CategoryPolicy di controller) |
| `admin.donations.*` | ❌ **Tidak ada** |
| `admin.pages.*` | ✅ `permission:manage_pages` |
| `admin.faqs.*` | ✅ `permission:manage_faqs` |
| `admin.programs.*` | ✅ `permission:program.view` |

> [!CAUTION]
> User biasa yang login bisa mengakses **User management**, **Donation management**, dan **Category management**.

---

### 3. Admin Donation Search — SQL Logic Bug (orWhere tanpa scope)
**File:** [Admin/DonationController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Admin/DonationController.php#L22-L29)

```php
$query->where('donation_code', 'like', "%{$search}%")
      ->orWhere('donor_name', 'like', "%{$search}%")  // ← BUG
      ->orWhereHas('program', function($q) use ($search) { ... });
```

`orWhere` tanpa grouping akan **mengabaikan filter `status`** dan filter campaigner sebelumnya. Campaigner bisa melihat donasi milik orang lain lewat search.

> [!WARNING]
> Harus dibungkus dalam `$query->where(function($q) use ($search) { ... })`.

---

### 4. Tidak Ada CSRF Exclusion untuk Webhook
**File:** [web.php](file:///c:/laragon/www/insani-id/routes/web.php#L48-L53)

Webhook route menggunakan `web.php` yang otomatis mendapat CSRF middleware. Xendit dan WordPress tidak mengirim CSRF token, sehingga webhook kemungkinan **akan gagal** dengan 419 error.

> [!IMPORTANT]
> Webhook harus di-exclude dari `VerifyCsrfToken` middleware, atau dipindah ke route file terpisah tanpa CSRF.

---

### 5. Xendit Webhook — Tidak Handle EXPIRED/FAILED
**File:** [XenditWebhookController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Webhook/XenditWebhookController.php#L33-L40)

Webhook hanya update `gateway_status`, tapi PaymentObserver hanya handle status `PAID`. Status `EXPIRED` dan `FAILED` **tidak pernah di-propagate** ke donation:

```php
// XenditWebhookController hanya update payment...
$payment->update(['gateway_status' => $status, ...]);

// PaymentObserver hanya check PAID
if (strtoupper($payment->gateway_status) === 'PAID') { ... }
// ← EXPIRED donation tetap "pending" selamanya
```

> [!WARNING]
> Donasi expired akan tetap berstatus "pending" dan tidak pernah dibersihkan.

---

### 6. `setTranslation()` pada Model Tanpa HasTranslations Trait
**File:** [CampaignerProgramController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Public/CampaignerProgramController.php#L136-L137)

```php
$program->setTranslation('title', 'id', $request->title);
$program->setTranslation('story', 'id', $request->story);
```

Model `Program` **tidak menggunakan `HasTranslations` trait** dari Spatie. Ini akan throw `BadMethodCallException` saat campaigner mencoba update program.

> [!CAUTION]
> Runtime error — campaigner tidak bisa edit program mereka.

---

### 7. `env()` Digunakan Langsung di Controller
**File:** [ContactController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Public/ContactController.php#L28)

```php
'secret' => env('TURNSTILE_SECRET_KEY', '...'),
```

`env()` **tidak bekerja setelah `config:cache`**. Harus menggunakan `config('services.turnstile.secret')`.

> [!WARNING]
> Turnstile verification akan gagal di production jika config di-cache.

---

## 🟡 Kekurangan Signifikan (Architecture & Reliability)

### 8. Factory Kosong — Test Tidak Bisa Berjalan
**Files:**
- [ProgramFactory.php](file:///c:/laragon/www/insani-id/database/factories/ProgramFactory.php) — `return []`
- [DonationFactory.php](file:///c:/laragon/www/insani-id/database/factories/DonationFactory.php) — `return []`
- [DisbursementFactory.php](file:///c:/laragon/www/insani-id/database/factories/DisbursementFactory.php)
- [CommentFactory.php](file:///c:/laragon/www/insani-id/database/factories/CommentFactory.php)
- [PaymentFactory.php](file:///c:/laragon/www/insani-id/database/factories/PaymentFactory.php)
- [ProgramUpdateFactory.php](file:///c:/laragon/www/insani-id/database/factories/ProgramUpdateFactory.php)

6 dari 7 factory **benar-benar kosong**. Testing coverage sangat terbatas karena tidak bisa generate model.

---

### 9. Tidak Ada Form Request untuk Operasi Penting
Hanya ada **2 custom Form Request**: `CustomLoginRequest` dan `UpdateCategoryPillarRequest`. Semua validasi lainnya dilakukan inline di controller.

**Yang seharusnya punya Form Request:**
- Donation creation (sensitive financial data)
- Program creation/update (admin + campaigner)
- Campaigner registration (file uploads + complex validation)
- Disbursement creation
- User creation/update (admin)

---

### 10. Policy Hanya Ada untuk Category
**File:** [Policies/](file:///c:/laragon/www/insani-id/app/Policies)

Hanya `CategoryPolicy` yang dibuat. Model-model kritis **tidak ada Policy**:

| Model | Policy | Risiko |
|---|---|---|
| Program | ❌ | Admin bisa edit program siapapun tanpa check ownership |
| Donation | ❌ | Tidak ada authorization check pada operasi |
| Disbursement | ❌ | Manual check di controller, rawan miss |
| User | ❌ | Admin bisa delete admin lain, hanya check self-delete |

---

### 11. `collected_amount` — Race Condition pada Concurrent Payments
**File:** [PaymentObserver.php](file:///c:/laragon/www/insani-id/app/Observers/PaymentObserver.php#L40-L48)

```php
$totalCollected = Donation::where('program_id', $program->id)
    ->where('status', 'paid')
    ->sum('amount');
$program->update(['collected_amount' => $totalCollected]);
```

Dua webhook yang masuk bersamaan bisa menyebabkan **race condition** — satu payment bisa overwrite yang lain. Harus menggunakan `DB::transaction` + lock, atau atomic increment.

---

### 12. PaymentObserver Terlalu Berat (God Observer)
**File:** [PaymentObserver.php](file:///c:/laragon/www/insani-id/app/Observers/PaymentObserver.php)

Satu observer melakukan **6 operasi** sekaligus:
1. Update donation status
2. Create comment dari message
3. Recalculate collected_amount
4. Send email
5. Send WhatsApp
6. Create 2 NotificationLog entries

Semua ini berjalan **synchronous** di dalam request webhook. Jika email/WA lambat, webhook bisa timeout.

> [!IMPORTANT]
> Email dan notifikasi harus dipindah ke **queued Job** agar webhook cepat respond.

---

### 13. Duplikasi Route: `admin.pages`
**File:** [web.php](file:///c:/laragon/www/insani-id/routes/web.php#L76-L86)

```php
Route::middleware('permission:manage_pages')->group(function () {
    Route::resource('pages', PageController::class)->except(['show']);
});
// ... beberapa baris kemudian, route yang SAMA persis di-register lagi ...
Route::middleware('permission:manage_pages')->group(function () {
    Route::resource('pages', PageController::class)->except(['show']);
});
```

Route `admin.pages.*` didaftarkan **dua kali** (line 76-78 dan 84-86).

---

### 14. Disbursement Route Name Double Prefix
**File:** [web.php](file:///c:/laragon/www/insani-id/routes/web.php#L125)

```php
->name('admin.disbursements.update-status');
```

Karena sudah di dalam prefix `admin.`, route name final menjadi `admin.admin.disbursements.update-status`.

---

### 15. Custom GET Logout — Tidak Aman
**File:** [web.php](file:///c:/laragon/www/insani-id/routes/web.php#L59-L64)

```php
Route::get('/logout', function () {
    auth()->logout();
    ...
});
```

Logout via GET rentan terhadap **CSRF via image tag** (`<img src="/logout">`). State-changing action harus menggunakan POST.

---

## 🟢 Area Perbaikan (Best Practice)

### 16. Tidak Ada Rate Limiting
Endpoint sensitif berikut **tidak di-rate limit**:
- `/kontak` (contact form)
- `/program/{slug}/donasi` (donation submission)
- `/campaigner/register` (file upload)
- `/programs/{program}/comments` (comment posting)

---

### 17. File Upload Tanpa Virus Scan / Type Validation yang Ketat
**File:** [ImageUploadController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Api/ImageUploadController.php)

Rich text image upload menerima file hingga **10MB** tanpa:
- Rate limiting
- Total storage quota per user
- Image dimension limit yang memadai

---

### 18. Missing Model Attribute: `$donation->payment_method`
**File:** [ReportController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Admin/ReportController.php#L62)

```php
$row['Metode Pembayaran'] = $donation->payment_method;
```

`Donation` model **tidak memiliki** kolom `payment_method` — itu ada di `Payment` model. Export CSV akan selalu menampilkan null/empty.

---

### 19. Program Delete Tanpa Check Donasi
**File:** [CampaignerProgramController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Public/CampaignerProgramController.php#L158-L170)

Campaigner bisa delete program yang berstatus `pending_verification` atau `rejected` meskipun **sudah ada donasi**. Hanya status `published` yang dicegah.

---

### 20. Disbursement Show — Wrong Relation Name
**File:** [Admin/DisbursementController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Admin/DisbursementController.php#L35)

```php
$disbursement->load('program.campaigner');
```

Model `Program` tidak memiliki relasi `campaigner` — yang ada adalah `campaignerProfile`. Ini akan **silently return null**.

---

### 21. Donor Status Page — Tidak Ada Auth Check
**File:** [Public/DonationController.php](file:///c:/laragon/www/insani-id/app/Http/Controllers/Public/DonationController.php#L108-L115)

```php
public function status($donationCode) {
    $donation = Donation::where('donation_code', $donationCode)->firstOrFail();
}
```

Siapapun yang tahu/brute-force donation code bisa melihat detail donasi termasuk nama, email, dan phone donatur.

---

### 22. Missing `HasFactory` Trait pada Beberapa Model
Model berikut tidak menggunakan `HasFactory`:
- `CampaignerProfile`
- `Payment`
- `Donation`

Namun beberapa memiliki factory file. Ini membuat `Model::factory()` tidak bisa dipanggil.

---

## 📊 Rangkuman Prioritas

| Prioritas | # | Item | Impact |
|---|---|---|---|
| 🔴 P0 | 1 | Comment route tanpa auth | Spam/abuse |
| 🔴 P0 | 2 | Admin routes tanpa role check | Privilege escalation |
| 🔴 P0 | 4 | Webhook CSRF problem | Webhook gagal total |
| 🔴 P0 | 6 | `setTranslation()` error | Campaigner tidak bisa edit |
| 🔴 P0 | 3 | Search SQL bug `orWhere` | Data leak cross-user |
| 🟡 P1 | 5 | Webhook tidak handle EXPIRED | Donasi "pending" selamanya |
| 🟡 P1 | 7 | `env()` di controller | Turnstile gagal di production |
| 🟡 P1 | 11 | Race condition collected_amount | Data keuangan salah |
| 🟡 P1 | 12 | Sync email di observer | Webhook timeout |
| 🟡 P1 | 18 | Wrong attribute di report | Export data salah |
| 🟡 P1 | 20 | Wrong relation name | Disbursement detail blank |
| 🟢 P2 | 8 | Factory kosong | Test coverage rendah |
| 🟢 P2 | 9 | No Form Requests | Maintainability |
| 🟢 P2 | 10 | No Policies | Authorization inconsistent |
| 🟢 P2 | 13-15 | Route bugs (duplikat, prefix, GET logout) | Minor issues |
| 🟢 P2 | 16-17 | Rate limiting & upload quota | Abuse protection |
| 🟢 P2 | 21 | Donor status tanpa auth | Privacy concern |

---

## ✅ Hal yang Sudah Baik

- ✅ Spatie Permission + Role system terintegrasi
- ✅ Activity logging di semua model kritis
- ✅ SoftDeletes di User & Program
- ✅ Webhook token verification middleware
- ✅ Xendit payment gateway integration
- ✅ Observer pattern untuk payment → donation flow
- ✅ Database indexing pada tabel kritis
- ✅ Foreign key constraints + cascade/restrict
- ✅ CarbonImmutable + prohibitDestructiveCommands
- ✅ Password policy yang kuat
- ✅ Turnstile CAPTCHA pada login & contact form


<!-- MERGED FROM Task-Perbaikan 7 Poin Kritis Backend.md -->

# Task: Perbaikan 7 Poin Kritis Backend

- [x] **Poin 6** — Fix `setTranslation()` di CampaignerProgramController
- [x] **Poin 7** — Fix `env()` → `config()` (config/services.php, ContactController, TurnstileRule)
- [x] **Poin 3** — Fix SQL `orWhere` bug di Admin DonationController
- [x] **Poin 1** — Pindahkan comment route ke dalam auth middleware + throttle
- [x] **Poin 2+4** — Admin role middleware + permission seeder + role seeder + fix route bugs
- [x] **Poin 5** — Handle EXPIRED/FAILED di PaymentObserver
- [x] Run `vendor/bin/pint --dirty --format agent`
- [x] Run tests
- [x] Re-seed permissions


<!-- MERGED FROM rencana-perbaikan-poin-8-15.md -->

# Rencana Perbaikan Poin 8–15 — Kekurangan Signifikan (Architecture & Reliability)

Berdasarkan `docs/backend-analysis-2026-08-04.md` bagian **Kekurangan Signifikan**. Analisis dilakukan terhadap kondisi kode pada commit `9f9e429`.

## Status cepat

| Poin | Status |
|---|---|
| 8. Factory kosong | 🔴 Belum — 6/6 factory masih `return []`; `Donation` & `Payment` belum pakai `HasFactory` |
| 9. Form Request | 🔴 Belum — hanya `CustomLoginRequest` & `UpdateCategoryPillarRequest` |
| 10. Policy | 🔴 Belum — hanya `CategoryPolicy` |
| 11. Race condition `collected_amount` | 🔴 Belum |
| 12. God Observer | 🔴 Belum — email/WA/2× NotificationLog masih sync |
| 13. Duplikasi route `admin.pages` | ✅ Sudah selesai (`routes/web.php:104-106` hanya didaftarkan 1×) |
| 14. Double prefix `admin.admin.disbursements` | ✅ Sudah selesai (`routes/web.php:150` → `admin.disbursements.update-status`) |
| 15. GET logout | 🔴 Belum — closure GET `/logout` masih ada (`routes/web.php:81-87`) |

---

## Poin 8 — Isi 6 factory + tambah `HasFactory`

### Perubahan model
- `app/Models/Donation.php` — tambah `use HasFactory`.
- `app/Models/Payment.php` — tambah `use HasFactory`.
- (Model lain sudah memakai `HasFactory`: `Program`, `Disbursement`, `Comment`, `ProgramUpdate`, `Category`, `User`.)

### Perubahan factory (`database/factories/`)
Semua factory mengisi kolom sesuai migration + enum yang berlaku.

- **`ProgramFactory`** — `program_code` unik, `title`, `slug` unik, `category_id`, `campaigner_type` (`individu`/`lembaga`/`internal`), `created_by`, `target_amount`, `collected_amount=0`, `story`, `cover_image`, `video_url`, `status`, `published_at`. State: `published()`, `pending()`.
- **`DonationFactory`** — `donation_code` unik, `program_id`, `donor_user_id`, `donor_name`, `donor_email`, `donor_phone`, `is_anonymous`, `message`, `amount`, `unique_code`, `channel` (`online`/`offline`), `status` (`pending`/`paid`/`expired`/`failed`/`refunded`), `paid_at`. State: `paid()`.
- **`PaymentFactory`** — `donation_id`, `payment_method` (`virtual_account`/`ewallet`/`qris`/`credit_card`/`bank_transfer_manual`), `gateway`, `gateway_reference_id`, `gateway_status`, `paid_amount`, `paid_at`. State: `paid()`.
- **`DisbursementFactory`** — `program_id`, `requested_amount`, `bank_name`, `bank_account_number`, `bank_account_name`, `platform_fee_percent`, `platform_fee_amount`, `nett_amount`, `status` (`pending`/`approved`/`rejected`/`transferred`), `notes`.
- **`CommentFactory`** — `program_id`, `user_id`, `name`, `body`, `is_hidden`.
- **`ProgramUpdateFactory`** — `program_id`, `title`, `content`, `created_by`, `is_published`.
- **Bonus `CategoryFactory`** — Category sudah memakai `HasFactory` tetapi tidak ada factory file. Dibutuhkan agar `ProgramFactory` bisa mandiri (kolom `name` translatable JSON + `slug`).

### Test
- 1 unit test (`tests/Unit/FactoriesTest.php`) yang membuat 1 instance tiap factory **tanpa override** untuk memastikan constraint/enum terpenuhi.

---

## Poin 9 — Form Request untuk operasi penting

Buat di `app/Http/Requests/` lalu wire ke controller (hapus validasi inline):

1. **`StoreDonationRequest`** → `Public/DonationController::store`
   - `amount` (min 10000), `donor_name`, `donor_email`, `donor_phone`, `is_anonymous`, `message`, `channel` (online/offline).
2. **`StoreProgramRequest`** + **`UpdateProgramRequest`** → dipakai bersama `Admin/ProgramController::store/update` & `Public/CampaignerProgramController::store/update`
   - `title`, `category_id`, `target_amount`, `deadline`, `story`, `cover_image`, `video_url`.
3. **`UpdateProgramStatusRequest`** → `Admin/ProgramController::updateStatus`
   - `status` (published/rejected/closed_manual) + `rejection_notes` required_if rejected.
4. **`StoreCampaignerRegistrationRequest`** → `Public/CampaignerRegistrationController::store`
   - `type`, `required_if:lembaga` untuk dokumen lembaga, upload file `ktp`/`selfie_ktp`/`buku_rekening`/`sk_lembaga`/`npwp_lembaga`.
5. **`StoreDisbursementRequest`** → `Public/CampaignerDisbursementController::store`
   - `requested_amount` dengan batas dinamis `max:` saldo tersedia via `withValidator`.
6. **`UpdateDisbursementStatusRequest`** → `Admin/DisbursementController::updateStatus`
   - `status` + `rejection_reason` required_if rejected + `transfer_proof` required_if transferred.
7. **`StoreUserRequest`** + **`UpdateUserRequest`** → `Admin/UserController::store/update`
   - `name`, `email` (unique, ignore saat update), `password` (store), `role` exists roles.

---

## Poin 10 — Policy untuk model kritis

### Policy baru (`app/Policies/`)
- **`ProgramPolicy`**
  - `viewAny` → permission `program.view`.
  - `view` → admin `program.view`, campaigner hanya program milik sendiri.
  - `update` → admin `program.update`, campaigner pemilik + `program.update-own`.
  - `delete` → admin `program.delete`, campaigner pemilik (syarat status dipertahankan).
  - `updateStatus`/`publish`/`reject`/`close` → permission terkait.
- **`DonationPolicy`**
  - `viewAny`/`view` → `donation.view`, campaigner hanya donasi pada program miliknya.
  - `confirm` → `donation.confirm-manual` atau campaigner pemilik program donasi.
- **`DisbursementPolicy`**
  - `viewAny`, `view`, `updateStatus` → permission `disbursement.*`/`disbursement.approve`.
  - `create` → campaigner pemilik program (non-internal).
- **`UserPolicy`**
  - `viewAny`, `create`, `update`, `delete` → `user.*`.
  - `delete`/`update` → cegah menghapus diri sendiri & cegah admin non-Administrator menyentuh admin lain.

### Wiring
- Tambahkan `use AuthorizesRequests;` ke base `app/Http/Controllers/Controller.php`.
- `CampaignerProgramController` — pindahkan cek ownership inline ke policy (`update`, `destroy`).
- `Admin/ProgramController` — `authorizeResource` atau `authorize()` per method + validasi transisi status.
- `Admin/UserController` — `authorize()` untuk store/update/destroy.
- `Admin/DisbursementController` & `Public/CampaignerDisbursementController` — ownership program + role approval via policy.
- `Admin/DonationController::confirm` — ganti `hasRole('campaigner')` yang tidak pernah match (role aktual: `Campaigner Individu`/`Campaigner Lembaga`) dengan policy/permission atau `hasAnyRole(...)`.

### Seeder
- Tambah permission `program.delete` ke `PermissionSeeder` + role relevan di `RoleSeeder` (saat ini tidak ada).
- Re-seed idempotent: `PermissionSeeder`, `RoleSeeder`, `ContentEditorRoleSeeder` + `php artisan permission:cache-reset`.

---

## Poin 11 — Race condition `collected_amount`

Refactor blok rekalkulasi di `app/Observers/PaymentObserver.php`:

```php
DB::transaction(function () use ($donation, $payment) {
    $program = Program::whereKey($donation->program_id)->lockForUpdate()->first();
    // update donation -> paid
    // recalc sum('amount') di dalam lock
    $program->update(['collected_amount' => $totalCollected]);
});
```

Row lock `lockForUpdate()` men-serialisasi dua webhook paralel untuk program yang sama — lebih robust daripada `increment` (tidak rentan drift/refund).

---

## Poin 12 — Pindahkan notifikasi ke queued Job

- Buat `app/Jobs/SendDonationPaidNotification implements ShouldQueue` berisi:
  1. Kirim email `DonationSuccessNotification`.
  2. Kirim WhatsApp via `NotificationGatewayService`.
  3. Buat 2× entri `NotificationLog` (email + whatsapp).
  - Semua try/catch dipindah dari observer ke job.
- `PaymentObserver::updated` menjadi ramping:
  - `PAID` → transaction (donation paid + `collected_amount` + comment) lalu `SendDonationPaidNotification::dispatch($donation)` dengan `afterCommit`.
  - `EXPIRED`/`FAILED` → update status donation (tetap, dari Poin 5).
- Queue sudah `database` (`.env:30`), tabel `jobs` sudah ada.
- **Catatan deployment:** wajib ada worker `php artisan queue:work`.

---

## Poin 15 — Ganti GET logout → POST

- Hapus closure `Route::get('/logout', ...)` di `routes/web.php:81-87`.
  - Fortify sudah menyediakan `POST /logout` bernama `logout` (terkonfirmasi via `php artisan route:list --name=logout`).
- Frontend (butuh `npm run build`):
  - `resources/js/components/user-menu-content.tsx:64-70` — `<Link href={logout()} as="button">` → tambah `method="post"`.
  - `resources/js/components/header/UserDropdown.tsx:94-96` — `<a href="/logout">` → ganti `<Link href="/logout" method="post" as="button">`.
  - `resources/js/pages/Public/Auth/VerifyEmail.tsx` — sudah memakai `method="post"`, tidak perlu diubah.
- Test `users can logout` (POST `route('logout')`) tetap hijau.

---

## Verifikasi akhir

1. `vendor/bin/pint --dirty --format agent`
2. `php artisan test --compact`
3. `npm run build` (perubahan frontend Poin 15)

---

## Catatan tambahan

- Poin 13 & 14 sudah diselesaikan pada commit `20bfeba` (fix 7 poin kritis) — tidak perlu tindakan.
- Poin 16–22 (Area Perbaikan) **tidak** termasuk dalam lingkup rencana ini.
- Bug terkait yang ditemukan saat analisis & akan dirapikan bersamaan:
  - `Admin/DonationController::index` & `confirm` memakai `hasRole('campaigner')` yang tidak pernah cocok dengan role aktual.
  - `Admin/DisbursementController::show` memuat `program.campaigner` (relasi tidak ada; seharusnya `campaignerProfile`) — terkait Poin 20, dicatat untuk disertakan jika masih relevan.


<!-- MERGED FROM rencana-perbaikan-poin-8-15-analisis.md -->

# Analisis & Rencana Implementasi Poin 8–15

**Commit referensi:** `f300695` (fix issue backend), setelah `20bfeba` (fix 7 backend issue)
**Tanggal analisis:** 2026-08-04

---

## Verifikasi Status Aktual

| Poin | Klaim Dokumen | Kondisi Aktual (Diverifikasi) |
|---|---|---|
| 8 | 6 factory kosong | ✅ Benar — semua `return []`; `Donation`/`Payment` tanpa `HasFactory`; `Category` memakai `HasFactory` tanpa factory file |
| 9 | Hanya 2 Form Request | ✅ Benar — `CustomLoginRequest` & `UpdateCategoryPillarRequest` |
| 10 | Hanya `CategoryPolicy` | ✅ Benar; base `Controller` kosong (tanpa `AuthorizesRequests`); `PermissionSeeder` tidak punya `program.delete` |
| 11 | Recalc tanpa lock | ✅ Benar — `PaymentObserver.php:56-63` |
| 12 | Notifikasi sync | ✅ Benar — `PaymentObserver.php:65-100` |
| 13 & 14 | Selesai | ✅ Terkonfirmasi (`web.php` hanya 1× `admin.pages`; route `admin.disbursements.update-status`) |
| 15 | GET `/logout` masih ada | ✅ Benar — `web.php:81-87`; Fortify `POST logout` ada (`route:list` terkonfirmasi) |

---

## Temuan Tambahan Penting

1. **`programs.title` & `story` sudah diubah jadi string/varchar** oleh migration `2026_07_15_133227` (bukan JSON) — factory cukup pakai string.
2. **`Admin/DonationController:16,48`** pakai `hasRole('campaigner')` yang tidak pernah cocok (role aktual: `Campaigner Individu`/`Campaigner Lembaga`). Jalur campaigner pada route `admin.donations.confirm` sebenarnya terblokir middleware `permission:donation.view`.
3. **`Admin/DisbursementController::show:35`** load `program.campaigner` (relasi tidak ada → harus `campaignerProfile`).
4. **phpunit.xml memakai `QUEUE_CONNECTION=sync` + `RefreshDatabase` (transaksi per-test)** → job yang di-dispatch dengan `afterCommit()` **tidak akan jalan** di test, sehingga `Mail::assertSent` di `AdminDonationTest:108` akan gagal. Perlu penyesuaian test.

---

## Keputusan Implementasi (Dikonfirmasi User)

- **Poin 12 dispatch:** `afterCommit()` + update `AdminDonationTest` (assert job dispatched via `Queue::fake`), plus test unit terpisah untuk job.
- **Bug bonus:** Sertakan keduanya — fix `program.campaigner` → `campaignerProfile` dan hapus `hasRole('campaigner')` mati.

---

## Rencana Eksekusi Berurutan

### Langkah 1 — Poin 8: Factory & HasFactory
- Tambah `use HasFactory` ke `Donation` & `Payment`.
- Isi 6 factory kosong + buat `CategoryFactory`.
- State methods: `published()`/`pending()` di `ProgramFactory`, `paid()` di `DonationFactory`/`PaymentFactory`.
- Buat `tests/Unit/FactoriesTest.php` (1 instance/factory tanpa override).

### Langkah 2 — Poin 9: Form Request (8 file)
1. `StoreDonationRequest`
2. `StoreProgramRequest`
3. `UpdateProgramRequest`
4. `UpdateProgramStatusRequest`
5. `StoreCampaignerRegistrationRequest`
6. `StoreDisbursementRequest` (+ `withValidator` saldo dinamis)
7. `UpdateDisbursementStatusRequest`
8. `StoreUserRequest` / `UpdateUserRequest`
- Ganti `$request->validate([...])` inline di 6 controller terkait.
- `authorize()` = `true` (otorisasi via policy).

### Langkah 3 — Poin 10: Policy & Wiring
1. Tambah `AuthorizesRequests` ke `Controller.php`.
2. Buat 4 policy: `ProgramPolicy`, `DonationPolicy`, `DisbursementPolicy`, `UserPolicy`.
3. Wire `$this->authorize()` di:
   - `Admin/ProgramController` (`store/update/destroy/updateStatus`)
   - `CampaignerProgramController` (`update`/`destroy` ganti ownership query)
   - `Admin/UserController` (`store/update/destroy`)
   - `Admin/DonationController` (`confirm` + hapus `hasRole('campaigner')`)
   - `Admin/DisbursementController` (`updateStatus`)
4. Seeder: tambah `program.delete` ke `PermissionSeeder` + assign ke `Administrator`/`Program Officer` di `RoleSeeder`.

### Langkah 4 — Poin 11 & 12: Observer + Queued Job
1. Buat `app/Jobs/SendDonationPaidNotification implements ShouldQueue`.
2. Refactor `PaymentObserver::updated`:
   - `PAID` → `DB::transaction` + `lockForUpdate()` pada program, update donasi + comment + recalc, lalu `dispatch()->afterCommit()`.
   - `EXPIRED`/`FAILED` → update status donasi (tetap).
3. Update `AdminDonationTest` → `Queue::fake()`, asersi job ter-dispatch.
4. Buat `tests/Unit/SendDonationPaidNotificationTest.php` (jalankan job sync, asersi email + 2 log).

### Langkah 5 — Poin 15: Logout POST
1. Hapus closure GET `/logout` di `routes/web.php:81-87`.
2. `user-menu-content.tsx:66` tambah `method="post"`.
3. `UserDropdown.tsx:94-96` ganti `<a>` → `<Link method="post" as="button">`.
4. Tambah test `GET /logout` → 404/405 di `AuthenticationTest`.
5. `npm run build`.

### Langkah 6 — Bug Bonus
1. `Admin/DisbursementController::show` → `program.campaignerProfile`.
2. `Admin/DonationController::index` → hapus branch `hasRole('campaigner')`.

---

## Verifikasi Akhir
1. `vendor/bin/pint --dirty --format agent`
2. `php artisan test --compact`
3. `npm run build`
4. Re-seed (`PermissionSeeder`, `RoleSeeder`, `ContentEditorRoleSeeder`) + `permission:cache-reset`
5. Produksi Poin 12 wajib worker `php artisan queue:work`

<!-- MERGED FROM prd_evaluation_report.md -->

# Laporan Evaluasi Kesesuaian Sistem dengan PRD

Berdasarkan analisa codebase saat ini terhadap dokumen `docs/PRD_v1_0.md` (khususnya Section 16 "Success Criteria") dan `docs/PRD_COMPANY_PROFILE_v1_0.md`, berikut adalah status implementasi dari fitur-fitur yang didefinisikan:

## ✅ Kriteria yang Telah Terpenuhi (Sesuai)

1. **Role Internal & Permission**
   - **Status:** ✅ Selesai
   - **Bukti:** Penggunaan `spatie/laravel-permission`, adanya `RoleSeeder` dan `PermissionSeeder`. Struktur controller `Admin/` sudah memfasilitasi akses internal.
2. **Pendaftaran & Verifikasi Campaigner**
   - **Status:** ✅ Selesai
   - **Bukti:** Terdapat `Public\CampaignerRegistrationController`, `Admin\CampaignerVerificationController`, serta tabel `campaigner_profiles` dan `verification_documents`.
3. **Manajemen Program (Internal & Eksternal)**
   - **Status:** ✅ Selesai
   - **Bukti:** `Admin\ProgramController` dan `Public\CampaignerProgramController` telah diimplementasikan beserta tabel `programs`. Terdapat mekanisme `updateStatus` untuk approval.
4. **Donasi & Payment Gateway**
   - **Status:** ✅ Selesai
   - **Bukti:** Implementasi `Public\DonationController`, `Admin\DonationController`, `XenditPaymentService`, dan `Webhook\XenditWebhookController`.
5. **Kabar Terbaru / Update Program**
   - **Status:** ✅ Selesai
   - **Bukti:** Terdapat `Public\CampaignerProgramUpdateController` dan tabel `program_updates`.
6. **Pencairan Dana (Disbursement)**
   - **Status:** ✅ Selesai
   - **Bukti:** Terdapat `Admin\DisbursementController`, `Public\CampaignerDisbursementController`, dan tabel `disbursements`.
7. **Inertia & Layouting**
   - **Status:** ✅ Selesai
   - **Bukti:** Penggunaan Inertia (`resources/js/pages`), ketiadaan React Router. Layout dipisah untuk Admin dan Publik.
8. **Multi-Bahasa (i18n)**
   - **Status:** ✅ Selesai
   - **Bukti:** Model-model telah menggunakan trait `Spatie\Translatable\HasTranslations`.
9. **Integrasi WordPress Headless**
   - **Status:** ✅ Selesai
   - **Bukti:** Terdapat `Webhook\WordPressWebhookController`, `BlogSyncService.php`, dan tabel `blog_post_caches`.

---

## ❌ Kriteria yang Belum Terpenuhi / Deviasi (Error Tersembunyi)

Berdasarkan hasil pemindaian codebase, ditemukan beberapa hal yang belum sesuai atau sama sekali belum diimplementasikan berdasarkan PRD:

> [!WARNING]
> **1. Activity Log Belum Diimplementasikan (Module 9.1)**
> Syarat PRD: "Seluruh aktivitas penting tercatat di Activity Log".
> **Temuan:** Package `spatie/laravel-activitylog` belum ada di `composer.json` dan tidak ditemukan trait `LogsActivity` pada model manapun.

> [!WARNING]
> **2. Notifikasi WhatsApp & Email Belum Ada (Module 5.4)**
> Syarat PRD: "Notifikasi WhatsApp (Fonnte/Wablas) untuk konfirmasi donasi & status verifikasi".
> **Temuan:** Tidak ada service `NotificationGatewayService` maupun pemanggilan API Fonnte/Wablas di dalam codebase.

> [!WARNING]
> **3. Tabel `app_settings` Tidak Ditemukan**
> Syarat PRD: Pengaturan platform seperti `min_donation_amount` dan pengaturan Company Profile disimpan di `app_settings`.
> **Temuan:** Migration untuk `app_settings` tidak ada di folder `database/migrations`. Form Settings untuk Admin (`Settings\ProfileController` dan `SecurityController`) tampaknya bukan untuk pengaturan global platform.

> [!CAUTION]
> **4. Pelanggaran Aturan REST API Internal**
> Syarat PRD Section 16: "Tidak ada REST API internal (kecuali AJAX/webhook payment gateway)".
> **Temuan:** Terdapat banyak controller di dalam direktori `app/Http/Controllers/Api/` (seperti `Api\ContactMessageController`, `Api\FaqController`, dll). Menggunakan Inertia seharusnya tidak memerlukan folder/namespace `Api` terpisah untuk interaksi data sendiri, melainkan langsung via Controller biasa.

> [!NOTE]
> **5. Backup Database Belum Disiapkan (Module 9.0)**
> Syarat PRD: "Backup Database Harian".
> **Temuan:** Package `spatie/laravel-backup` belum terpasang.

## Kesimpulan & Saran Tindakan Selanjutnya

Proyek **Galang Dana** inti dan integrasi **Company Profile (WordPress)** telah mencapai tahap 80% (fitur utama berjalan). Namun, sistem belum bisa dikatakan selesai (MVP ready) karena fitur krusial pendukung operasional masih hilang.

**Rekomendasi Tindakan (Gunakan `rtk`):**
1. Hapus/refactor direktori `app/Http/Controllers/Api/` agar sesuai dengan arsitektur Inertia murni (tanpa REST API).
2. Install `spatie/laravel-activitylog` dan terapkan pada model-model transaksional (`Donation`, `Payment`, `Disbursement`, `Program`, `User`).
3. Buat migration dan logika untuk tabel `app_settings` (Setting Global).
4. Implementasikan `NotificationGatewayService` untuk integrasi WA (Fonnte/Wablas).
5. Pasang `spatie/laravel-backup`.
