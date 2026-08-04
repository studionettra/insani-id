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
