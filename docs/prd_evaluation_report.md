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
