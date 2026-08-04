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
