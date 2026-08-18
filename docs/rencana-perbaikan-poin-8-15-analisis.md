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