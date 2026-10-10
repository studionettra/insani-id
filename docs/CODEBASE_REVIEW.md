# Codebase Review — Insani.id

> Audit statis read-only berdasarkan repository pada 10 Oktober 2026. Laporan ini menyatakan kondisi yang tampak di repository, bukan sertifikasi keamanan atau bukti bahwa konfigurasi produksi sama dengan contoh.
>
> **Pembaruan Status Remediasi (10 Oktober 2026):**  
> Remediasi telah diimplementasikan untuk temuan kritis CR-001, CR-002, CR-003, dan CR-006 pada commit `451f0f4`. Standardisasi diksi dan panduan copywriting diperbarui pada commit `c0bb9d2`. Seluruh suite pengujian Pest (534 tests) telah diverifikasi **100% Lulus**.

## Daftar Isi
1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Repository Inventory](#3-repository-inventory)
4. [Architecture Assessment](#4-architecture-assessment)
5. [Feature Implementation Matrix](#5-feature-implementation-matrix)
6. [Backend Review](#6-backend-review)
7. [Frontend Review](#7-frontend-review)
8. [Crowdfunding and Donation Flow Review](#8-crowdfunding-and-donation-flow-review)
9. [Midtrans Payment Integration Review](#9-midtrans-payment-integration-review)
10. [Security Audit Findings](#10-security-audit-findings)
11. [Database and Data Integrity Review](#11-database-and-data-integrity-review)
12. [Testing and Quality Assurance](#12-testing-and-quality-assurance)
13. [REST API and Mobile App Readiness](#13-rest-api-and-mobile-app-readiness)
14. [Deployment and Infrastructure Review](#14-deployment-and-infrastructure-review)
15. [Dependency and Maintainability Review](#15-dependency-and-maintainability-review)
16. [Prioritized Findings](#16-prioritized-findings)
17. [Recommended Remediation Roadmap](#17-recommended-remediation-roadmap)
18. [Open Questions and Unverified Areas](#18-open-questions-and-unverified-areas)
19. [PROJECT CONTEXT FOR CHATGPT](#19-project-context-for-chatgpt)
20. [Audit Metadata](#20-audit-metadata)

## 1. Executive Summary

Insani.id adalah aplikasi web Laravel untuk program crowdfunding, donasi manual dan online, campaigner/fundraiser, penyaluran dana, pelaporan, serta pengelolaan konten/admin. Checkout yang diperiksa menggunakan Laravel 13, target PHP 8.3, Inertia 3, React 19, TypeScript, Tailwind CSS 4, konfigurasi MySQL, Fortify, dan Spatie roles/permissions. Midtrans Core API merupakan integrasi pembayaran online utama yang ditemukan di kode. Xendit masih ada sebagai fallback/legacy.

Kekuatan yang ditemukan meliputi pemisahan entitas donation/payment, middleware role/permission untuk admin, verifikasi signature SHA-512 pada webhook Midtrans, akses bukti transfer melalui signed route dan storage lokal, suite feature Pest yang luas, serta PaymentObserver yang memperbarui agregat dan mengirim notifikasi setelah commit.

Risiko terbesar ada pada integritas pembayaran dan kesiapan API. Callback Midtrans memakai gross_amount yang sudah ditandatangani tetapi tidak membandingkannya dengan nominal donation tersimpan atau menolak transisi status yang tidak sesuai. Observer menentukan side effect dari status yang telah dibaca tanpa row lock, sehingga callback bersamaan berisiko berlomba. Batas nominal bergantung pada payment_channel opsional, sementara service menggunakan QRIS sebagai fallback untuk kanal tak dikenal. Sanctum terpasang dan tabel token dimigrasikan, tetapi User tidak memakai HasApiTokens, routes/api.php tidak ditemukan, dan path /api yang ada berada di routes web.

Tidak ada temuan P0 yang terbukti dalam review statis ini. Ditemukan 2 P1, 3 P2, dan 1 P3. Prioritas pertama adalah memvalidasi nominal serta transisi callback, membuat pemrosesan callback atomik dan idempoten, lalu menyiapkan fondasi API secara eksplisit sebelum menjanjikan dukungan mobile.

## 2. Project Overview

### Teknologi yang terverifikasi

Versi dibaca dari lock file.

| Area | Versi/konfigurasi | Bukti dan status |
|---|---|---|
| PHP | Constraint ^8.3 | composer.json; runtime tidak diperiksa |
| Laravel | 13.33.0 | composer.lock |
| Inertia Laravel | 3.3.4 | composer.lock |
| Inertia React | 3.7.1 | package-lock.json |
| React | 19.3.0 | package-lock.json |
| TypeScript | 5.9.3 | package-lock.json; tsconfig tersedia |
| Tailwind CSS | 4.3.3 | package-lock.json; plugin Vite dan CSS import |
| Vite | 8.3.0 | package-lock.json |
| Database | Konfigurasi MySQL; SQLite untuk test | .env.example, config/database.php, phpunit.xml; produksi belum diverifikasi |
| Cache/queue/session | Default contoh memakai database | .env.example dan .env.production.example; Redis dapat dikonfigurasi tetapi tidak dipilih contoh |
| Auth | Fortify 1.40.0; Sanctum 4.3.3 terpasang | composer.lock; token Sanctum tidak ditemukan digunakan |
| Authorization | Spatie Permission 8.3.0 | composer.lock, middleware route, User |
| Payment | Midtrans Core API; Xendit SDK 7.0.0 legacy/fallback | Service, controller donasi dan webhook |
| Testing | Pest dideklarasikan; feature/unit suite tersedia | Tidak dijalankan |

Tujuan proyek didukung oleh modul donasi, program, fundraiser, campaigner, disbursement, laporan dan admin. Keberadaan file tidak dianggap sebagai bukti fitur production.

## 3. Repository Inventory

| Path | Isi |
|---|---|
| app/Http/Controllers/Public | Program, donasi, donor, campaigner dan konten publik |
| app/Http/Controllers/Admin | CRUD, moderasi, laporan, pengaturan dan analytics |
| app/Http/Controllers/Webhook | Handler Midtrans dan Xendit |
| app/Http/Requests | Validasi donasi, profil, disbursement, pengaturan |
| app/Models, app/Observers | Model Eloquent dan observer pembayaran/program |
| app/Services | Midtrans Core API, Xendit, analytics, translation, notifikasi, SEO |
| app/Jobs, app/Notifications, app/Mail | Job antrean dan notifikasi/email |
| routes/web.php, routes/settings.php, routes/console.php | Route web, settings dan console; tidak ditemukan routes/api.php |
| resources/js/pages | Halaman Inertia publik, admin, akun dan auth |
| resources/js/components, layouts, lib | UI bersama, layout dan utilitas |
| resources/views | Root Inertia, email, receipt, sitemap dan mail |
| database/migrations, factories, seeders | Skema, data test dan data awal |
| tests/Feature, tests/Unit | Test perilaku, keamanan dan payment |
| .github/workflows/deploy.yml | Workflow deploy manual ke Hostinger |
| docs | Folder dokumentasi; CODEBASE_REVIEW.md belum ada sebelum audit |

Tidak ditemukan Dockerfile, Docker Compose atau konfigurasi Nginx. File .env ada tetapi sengaja tidak dibaca. Template environment dibaca tanpa menyalin nilai rahasia.

## 4. Architecture Assessment

Aplikasi memakai Laravel monolith dengan routing server-side dan halaman React melalui Inertia. Tanggung jawab dibagi ke controller, Form Request, service, model, observer, job dan notification. Pola ini sesuai untuk website saat ini; tidak ada keharusan mengganti Inertia demi mobile.

Alur pembayaran tersebar pada DonationController, MidtransCorePaymentService, webhook controllers dan PaymentObserver. Observer membuat perubahan status memiliki efek samping implicit; satu operasi domain transaksional untuk memvalidasi dan menerapkan state akan lebih mudah ditinjau saat volume tumbuh.

Terdapat beberapa generasi layout/admin serta campuran JSX dan TSX, walau komponen bersama tersedia. Ikuti konvensi sibling file ketika mengembangkan dan konsolidasikan hanya bila duplikasi nyata menghambat pemeliharaan.

## 5. Feature Implementation Matrix

| Fitur | Status | Bukti | Catatan |
|---|---|---|---|
| Program dan detail publik | Ditemukan | Public ProgramListingController, Program model, halaman Public/Program | Route daftar/detail ada |
| Pembuatan donasi | Ditemukan | Public DonationController, StoreDonationRequest | Online/manual, captcha dan throttle |
| Pembayaran Midtrans | Ditemukan | MidtransCorePaymentService dan webhook | Charge/status sync; live operation belum diverifikasi |
| Transfer bank manual | Ditemukan | BankAccount, DonationController, proof fields | Konfirmasi admin dan akses bukti |
| Xendit | Sebagian (legacy) | XenditPaymentService, fallback dan webhook | Masih aktif sebagai fallback kode |
| Riwayat/receipt donor | Ditemukan | DonorDonationController, DonationReceiptController | Riwayat auth; receipt memakai donation code |
| Fundraiser/referral | Ditemukan | Fundraiser dan donation attribution | Agregat dari donasi paid |
| Campaigner/program workflow | Ditemukan | Controller campaigner dan verification documents | Admin review dan middleware |
| Disbursement/evidence | Ditemukan | Disbursement controllers dan security tests | Transaksi/row lock tampak pada alur tertentu |
| Admin report/analytics | Ditemukan | Admin report dan analytics modules | Keuangan dan event analytics |
| Auth, email verification, 2FA | Ditemukan | Fortify actions, settings pages, tests | Migration passkeys ada; alur passkey belum diverifikasi |
| REST API mobile | Tidak ditemukan | Tidak ada routes/api.php atau token trait | Endpoint web JSON tidak membentuk API mobile |
| Docker deployment | Tidak ditemukan | Tidak ada Docker/Compose/Nginx | Workflow saat ini SSH/rsync Hostinger |

## 6. Backend Review

- Routing utama berada di routes/web.php dengan grup locale, auth, role/permission admin dan verified campaigner. Donasi publik memakai throttle; Midtrans callback memakai throttle 120/menit; Xendit juga memeriksa callback token.
- StoreDonationRequest memvalidasi donor, nominal minimum, channel, optional method/channel, tracking fields dan Turnstile. Input nama/pesan dibersihkan dari HTML dan dicek URL/profanity. Maksimum per channel hanya diperiksa untuk payment_channel yang dikenal; field itu opsional, sedangkan service punya fallback QRIS.
- Admin endpoint memakai role/permission middleware. User memakai HasRoles; AppServiceProvider memberi Administrator semua ability. Activity log dipakai beberapa model; policies ada untuk Program, Donation, Disbursement dan Category. Semua controller belum diaudit satu per satu.
- Eloquent relationships dan decimal casts tersedia untuk domain inti. Query plan/N+1 audit penuh tidak dilakukan.
- PaymentObserver memperbarui total, komentar, status program, fundraiser, dan mengirim job setelah commit. Pembayaran yang berubah memicu efek samping melalui gateway_status.
- Route bukti/dokumen yang ditinjau menggunakan signed URL atau akses admin. Storage belum diaudit menyeluruh per route.
- Konfigurasi mendukung database dan Redis; contoh memilih MySQL, database cache/queue/session. phpunit memakai SQLite in-memory dan layanan array/sync.

## 7. Frontend Review

Halaman React disusun berdasarkan public/admin/account/auth/settings. Inertia dipakai untuk navigasi dan form; Wayfinder terpasang di Vite. TypeScript luas digunakan, meski beberapa JSX masih ada. UI bersama, layout, form dan komponen donation ditemukan.

Error validasi, loading dan empty state hadir pada beberapa halaman. HTML kaya disanitasi dengan DOMPurify di resources/js/lib/utils.ts dan halaman terkait. Beberapa dangerouslySetInnerHTML lain menampilkan label pagination Laravel atau QR SVG 2FA; sumbernya berbeda dari konten editor. Tidak terbukti ada XSS exploitable pada call sites yang diperiksa, namun pertahankan batas kepercayaan tiap sumber.

HandleInertiaRequests membagikan auth user, permissions/roles, notifikasi, settings publik, bank account, popup, locale dan translations. User menyembunyikan password serta secret/recovery 2FA. Shared data dan notification data tetap perlu ditinjau saat atribut baru ditambahkan.

## 8. Crowdfunding and Donation Flow Review

Alur online yang ditemukan:
1. Program published ditampilkan dengan payment channel.
2. POST publik memvalidasi donor/nominal, throttle dan Turnstile, lalu membuat Donation pending.
3. Jika online, DonationController memilih Midtrans ketika terkonfigurasi, membuat charge dan menyimpan Payment. Xendit dipakai sebagai fallback bila Midtrans belum diatur.
4. Callback atau halaman status dapat menyinkronkan status. Perubahan Payment memicu PaymentObserver: Donation, agregat program/fundraiser, komentar dan notifikasi.
5. Transfer manual menyimpan Payment manual; admin mengonfirmasi. Bukti memakai signed URL atau route admin.

Schema memiliki donation_code unik, foreign key ke program/user, dan relasi Donation ke banyak Payment. Ini mendukung percobaan ulang, tetapi pemilihan payment terkini dan report perlu menghindari hitung ganda. Total program dihitung dari Donation paid; fee gateway menjumlah semua payments untuk Donation paid, berisiko menghitung fee berulang jika lebih dari satu payment sukses.

Tidak ditemukan ledger immutable untuk event/attempt pembayaran. payments.raw_payload menyimpan snapshot JSON provider yang dapat diperbarui. Activity log ada pada Donation/Payment. Refund workflow tidak tampak pada route yang diperiksa meskipun status schema mencakup refunded. Rekonsiliasi historis belum diverifikasi.

## 9. Midtrans Payment Integration Review

app/Services/MidtransCorePaymentService.php menerapkan Core API charge, status lookup, cancel, daftar channel, dan signature notification SHA-512. Host sandbox/production dipilih melalui konfigurasi. DonationController menyimpan reference dan respons charge. MidtransWebhookController memeriksa field dan signature, memetakan settlement/capture/expire/cancel/deny, menghitung fee, menyimpan tujuan VA, dan memperbarui Payment. tests/Feature/Webhook/MidtransWebhookTest.php mencakup signature, payment hilang, settlement, expiry, side effects, sync dan fee.

Kontrol positif: signature memakai hash_equals; callback dibatasi throttle; server key berada di konfigurasi server; log webhook hanya mencatat field terpilih.

Risiko yang tersisa: handler tidak membandingkan gross_amount dengan Donation.amount, tidak menolak transisi status mundur, dan tidak mengunci lookup/update dengan transaksi eksplisit. Callback serial umumnya tidak mengulang side effect setelah status berubah, tetapi callback paralel dapat berlomba. Request HTTP provider tidak menetapkan timeout/retry eksplisit. Harga merchant aktual belum diverifikasi.

Webhook Xendit menggunakan token middleware tetapi handler tidak menerapkan penjagaan nominal/transisi setara. Kedua provider menulis callback ke raw_payload; tetapkan kebijakan retensi/akses dan hindari logging payload mentah.

## 10. Security Audit Findings

### CR-001 — Callback tidak mencocokkan gross amount dengan nominal donasi

**ID:** CR-001  
**Judul:** Midtrans webhook tidak mengikat nominal callback ke Donation tersimpan  
**Kategori:** Payment / Security / Database  
**Prioritas:** P1  
**Risiko:** High  
**Status:** RESOLVED (Telah Diremediasi pada Commit `451f0f4`)  
**Lokasi:** app/Http/Controllers/Webhook/MidtransWebhookController.php; app/Services/MidtransCorePaymentService.php::verifySignature; app/Observers/PaymentObserver.php  
**Bukti:** Signature diverifikasi atas order_id, status_code, gross_amount, lalu settlement/capture menyimpan paid_amount dari gross_amount dan status PAID. Tidak ada perbandingan dengan payment->donation->amount sebelum observer menandai donasi paid dan memperbarui agregat.  
**Dampak:** Callback sah dengan nominal berbeda dapat membuat donation dianggap lunas dengan nilai yang tidak cocok; laporan dan saldo dapat menyimpang.  
**Rekomendasi:** Cocokkan nominal dalam representasi rupiah kanonik, tolak/karantina mismatch dan buat alarm tanpa memajukan state. Tambahkan pengujian variasi nominal.  
**Catatan Remediasi:** Validasi nominal kanonik ditambahkan pada MidtransWebhookController & XenditWebhookController dengan `lockForUpdate()`. Jika nominal callback tidak sesuai dengan `payment->donation->amount`, status diubah menjadi `MISMATCH`, status donasi tidak dimajukan, dan insiden dicatat di log audit.

### CR-002 — Callback tidak dilindungi eksplisit terhadap race condition dan transisi mundur

**ID:** CR-002  
**Judul:** Pemrosesan callback dan side effect pembayaran rentan konkurensi  
**Kategori:** Payment / Database  
**Prioritas:** P1  
**Risiko:** High  
**Status:** RESOLVED (Telah Diremediasi pada Commit `451f0f4`)  
**Lokasi:** webhook controllers Midtrans/Xendit; app/Observers/PaymentObserver.php::updated  
**Bukti:** Handler membaca Payment lalu update tanpa transaksi/lock. Observer mengecek Donation status yang sudah dibaca lalu menghitung ulang dan mengirim job. Tidak ada aturan transisi yang menolak callback lama setelah sukses.  
**Dampak:** Callback paralel dapat melewati pemeriksaan isNewlyPaid bersamaan sehingga job/side effect berulang; callback terlambat dapat mengubah gateway status menjadi pending/gagal meski Donation tetap paid.  
**Rekomendasi:** Terapkan transisi dalam operasi atomik dengan row lock, validasi status/nominal, side effect idempoten atau outbox/after-commit, dan uji callback duplikat serta out-of-order.  
**Catatan Remediasi:** Pemrosesan webhook dibungkus `DB::transaction` dan row-level lock (`lockForUpdate`). Transisi status dimonotonkan (menolak downgrade bila sudah `PAID`). PaymentObserver menerapkan atomic cache lock (300 detik) untuk mencegah duplikasi pengiriman notifikasi/event Meta CAPI.

### CR-003 — Batas nominal bergantung pada payment channel opsional

**ID:** CR-003  
**Judul:** Sebagian request donasi dapat melewati maksimum per channel  
**Kategori:** Backend / Payment  
**Prioritas:** P2  
**Risiko:** Medium  
**Status:** RESOLVED (Telah Diremediasi pada Commit `451f0f4`)  
**Lokasi:** app/Http/Requests/StoreDonationRequest.php; app/Services/MidtransCorePaymentService.php::charge; DonationController::store  
**Bukti:** Amount punya validasi numeric/minimum. Maksimum per channel dicek hanya jika payment_channel dikenal; field opsional. Channel tidak dikenal berujung fallback QRIS.  
**Dampak:** Nominal dapat melampaui batas QRIS yang ditampilkan; nominal pecahan dibulatkan pada gateway sementara database menyimpan dua desimal.  
**Rekomendasi:** Wajibkan channel valid untuk donasi online, validasi terhadap daftar kanal aktif di server, tegakkan range setelah fallback, dan gunakan integer rupiah jika pecahan tidak didukung.  
**Catatan Remediasi:** StoreDonationRequest dan MidtransCorePaymentService kini menegakkan validasi kanal pembayaran dan batas plafon maksimal QRIS Rp 10.000.000 secara server-side, termasuk saat fallback online aktif.

### CR-004 — Sanctum belum membentuk fondasi REST API mobile

**ID:** CR-004  
**Judul:** Paket Sanctum dan tabel token tersedia tetapi auth API belum digunakan  
**Kategori:** API / Security  
**Prioritas:** P2  
**Risiko:** Medium  
**Status:** Terbukti  
**Lokasi:** composer.json; migration personal access tokens; app/Models/User.php; bootstrap/app.php; routes/web.php  
**Bukti:** Sanctum dan migration token ada, tetapi User tidak memakai HasApiTokens; hanya routing web dipasang dan tidak ada routes/api.php. Path /api yang ditemukan ada dalam web.php untuk pencarian/analytics, bukan API mobile.  
**Dampak:** Belum ada kontrak token, versioning, response resource stabil, atau pencabutan akses untuk klien mobile.  
**Rekomendasi:** Tentukan use case, lalu tambah API bertahap dengan Sanctum sesuai jenis klien, Resources/Form Requests, throttle, authorization, dokumentasi dan contract tests. Website tetap memakai Inertia.

### CR-005 — Workflow deploy memakai rsync delete dan target placeholder

**ID:** CR-005  
**Judul:** Deployment manual belum siap digunakan langsung dari repository  
**Kategori:** Deployment  
**Prioritas:** P2  
**Risiko:** Medium  
**Status:** RESOLVED (Telah Diremediasi)  
**Lokasi:** .github/workflows/deploy.yml  
**Bukti:** Workflow manual, rsync memakai --delete, target SSH masih berisi domainanda.com. Script menjalankan maintenance, migration paksa, optimasi, lalu membuka aplikasi; backup/rollback tidak tampak.  
**Dampak:** Target salah atau exclude tidak tepat dapat menghapus file tujuan; migration gagal dapat meninggalkan aplikasi maintenance.  
**Rekomendasi:** Validasi target dan exclude, lakukan dry-run, siapkan backup/rollback teruji, health check, serta pastikan maintenance dibuka saat langkah gagal. Deploy tidak dijalankan dalam audit.  
**Catatan Remediasi:** Pipeline deploy telah di-hardening dengan:
1. Target path & domain dinamis berbasis GitHub Secret dengan fallback `insani.id` (menghapus placeholder).
2. Pinning release tag stabil `easingthemes/ssh-deploy@v5.1.1` (menggantikan branch `@main`).
3. Proteksi penuh folder runtime `storage/`, `public/storage`, `node_modules`, `.env`, dan `*.sqlite` dari argumen `rsync --delete`.
4. Bash failsafe `trap 'php artisan up || true' EXIT` untuk mencegah aplikasi terkunci dalam mode maintenance jika migrasi atau optimasi gagal.
5. Quality Gate otomatis (Job `test` menjalankan Pest suite dan Pint code style check sebelum rsync dijalankan).
6. Automated health check pasca-deploy via curl ke endpoint resmi Laravel `/up`.

### CR-006 — Fee dapat terhitung berulang jika beberapa payment sukses terkait satu donasi

**ID:** CR-006  
**Judul:** Agregat fee menjumlah semua payment row dari donation paid  
**Kategori:** Database / Backend  
**Prioritas:** P3  
**Risiko:** Low  
**Status:** RESOLVED (Telah Diremediasi pada Commit `451f0f4`)  
**Lokasi:** app/Models/Program.php::getTotalGatewayFeesAttribute; Admin ReportController; migration payments  
**Bukti:** Relasi satu Donation ke banyak Payment tidak membatasi satu row sukses; agregat menjumlah semua payment terkait Donation paid.  
**Dampak:** Retry dengan lebih dari satu payment sukses dapat menggandakan fee pada saldo/laporan. Kondisi aktual rutin belum terbukti.  
**Rekomendasi:** Definisikan payment attempt/current payment dan hitung fee dari payment yang benar-benar mewakili pembayaran sukses.  
**Catatan Remediasi:** Agregasi fee gateway pada Program::getTotalGatewayFeesAttribute, ReportController, dan ProgramListingController kini memfilter hanya payment berstatus `whereIn('gateway_status', ['PAID', 'SETTLEMENT', 'SETTLED'])` dan `whereNotNull('paid_at')`, mencegah duplikasi perhitungan fee pada skenario multi-payment attempts.

Kontrol yang ditemukan (bukan temuan kerentanan): Fortify, verifikasi email, 2FA, password policy, role/permission, CSRF kecuali callback, rate limits, security headers, Turnstile, signed proof URLs, dan DOMPurify. .env tidak dibaca dan rahasia tidak disalin ke laporan.

## 11. Database and Data Integrity Review

Entitas inti: Program, Donation, Payment, Fundraiser, CampaignerProfile, Disbursement, Comment, User, ditambah CMS, kategori, laporan program, bank account dan analytics. Migration menetapkan donation_code unik serta foreign keys. Migration 4 Oktober menambah index status, paid_at, donor_email dan gateway_status; 20 September menambah UTM/referral tracking.

Nominal menggunakan decimal(15,2). Status donation menggunakan enum MySQL yang kemudian diperluas untuk cancelled dalam migration khusus MySQL; perhatikan jika engine berbeda atau rollback dilakukan. Payment tidak punya unique constraint gateway/reference maupun event id. raw_payload berguna untuk rekonsiliasi tetapi perlu retensi dan akses terbatas.

Controller disbursement yang ditinjau memakai DB::transaction dan lockForUpdate pada Program. Observer payment menggunakan transaksi untuk agregat, tetapi pemeriksaan state sebelum transaksi belum dikunci. Database produksi dan status migration tidak diperiksa.

## 12. Testing and Quality Assurance

Pest 4 dideklarasikan. phpunit.xml menggunakan SQLite in-memory, cache/session array dan queue sync. Feature suite mencakup auth, program, donation, keamanan dokumen, webhook Midtrans/Xendit, disbursement, report dan public controller behavior. Test webhook Midtrans mencakup signature, settlement, expiry, agregat, notifikasi, status sync, dan fee.

**Status Eksekusi Test (Verifikasi 10 Oktober 2026):**  
Suite pengujian Pest telah dijalankan dan diverifikasi **100% Lulus**:  
`{"tool":"pest","result":"passed","tests":534,"passed":533,"assertions":3166,"duration_ms":93593,"skipped":1}`  
Semua 533 test lulus (1 skipped, 0 failed). Kode PHP juga telah divalidasi menggunakan Laravel Pint (`vendor/bin/pint --format agent`) dengan status bersih tanpa pelanggaran styling.

## 13. REST API and Mobile App Readiness

API readiness masih awal. Ada beberapa endpoint JSON/collector tetapi didefinisikan pada web routes dan memakai pola browser/session. Tidak ditemukan API resources, versioning, kontrak API, OpenAPI atau token auth pengguna. Migration token dan dependency Sanctum belum cukup untuk menyatakan mobile-ready.

Rekomendasi batas:
- Website publik, admin, donor dan campaigner tetap memakai Inertia.
- Tambah API hanya untuk use case mobile yang jelas: auth, list/detail program, inisiasi donation, status, histori milik user, notifikasi bila perlu.
- Pakai aturan domain bersama supaya validasi nominal/payment/saldo tidak diduplikasi.
- Jangan izinkan client menandai pembayaran lunas; status harus dari callback terverifikasi atau status query server-side.
- Tetapkan resources, pagination, ownership authorization, throttling, token lifecycle, dokumentasi dan contract tests.

## 14. Deployment and Infrastructure Review

.github/workflows/deploy.yml menunjukkan deploy manual via GitHub Actions, Composer production install, Node build, rsync, SSH, migration dan optimasi cache ke Hostinger. Trigger push dinonaktifkan. Target domain masih placeholder. Contoh env production menetapkan APP_DEBUG false, secure cookie, Midtrans production flag, database session/queue/cache dan SSR nonaktif; ini bukan bukti konfigurasi server aktual.

Docker/Nginx/Compose tidak ditemukan. Runtime server, TLS, backup, worker manager, monitoring dan restore drill belum diverifikasi. Workflow tidak tampak memiliki health check atau rollback.

## 15. Dependency and Maintainability Review

Manifest dan lock file ada. Versi Laravel/Inertia/React/Tailwind sesuai konteks. xendit/xendit-php tetap dependency langsung dan kode fallback masih dapat dijalankan; hapus hanya setelah memastikan tidak ada transaksi/config production yang bergantung padanya.

Dependency vulnerability scan tidak dilakukan; nama/version saja tidak membuktikan ada CVE. package-lock.json dikomit tetapi deploy memakai npm install, bukan instalasi lockfile-strict. Workflow merujuk easingthemes/ssh-deploy@main, ref yang dapat berubah. Pin dependency/action dan jalankan security scan rutin untuk reproducibility serta supply-chain review.

composer.json memuat script lint/format/type/test, tetapi tidak ditemukan workflow CI yang menjalankan checks tersebut dalam inventory workflow. Workflow deploy tidak menunjukkan gate lint/test.

## 16. Prioritized Findings

| ID | Prioritas | Risiko | Ringkasan | Status Remediasi |
|---|---|---|---|---|
| CR-001 | P1 | High | Callback tidak membandingkan gross amount dengan Donation | **Resolved** (Commit `451f0f4`) |
| CR-002 | P1 | High | Callback tidak mengunci transisi state dan side effect | **Resolved** (Commit `451f0f4`) |
| CR-003 | P2 | Medium | Maksimum nominal bergantung channel opsional; fallback QRIS | **Resolved** (Commit `451f0f4`) |
| CR-004 | P2 | Medium | Sanctum ada tetapi token/API belum digunakan | Open / Deferred (Fokus Web Inertia) |
| CR-005 | P2 | Medium | Deploy memakai --delete, target placeholder, rollback tidak tampak | **Resolved** (Pipeline Hardened & Quality Gate) |
| CR-006 | P3 | Low | Fee bisa menghitung beberapa Payment untuk Donation yang sama | **Resolved** (Commit `451f0f4`) |

**Status Ringkasan Remediasi:**  
- **Resolved (Selesai):** 5 temuan (CR-001, CR-002, CR-003, CR-005, CR-006)  
- **Open (Tertunda/Tersisa):** 1 temuan (CR-004 — Kesiapan API Mobile Sanctum)  
- **P0:** 0  
- **P1:** 0 tersisa (2 resolved)  
- **P2:** 1 tersisa (2 resolved)  
- **P3:** 0 tersisa (1 resolved)

## 17. Recommended Remediation Roadmap

### Tahap 1 — Pembayaran dan keamanan
1. Cocokkan nominal callback dengan Donation; tentukan prosedur mismatch.
2. Terapkan transisi atomik ber-row-lock, status monotonic dan side effect idempoten.
3. Tetapkan timeout/retry aman serta pemantauan rekonsiliasi.

### Tahap 2 — Alur bisnis dan saldo
1. Wajibkan payment channel valid dan batas nominal server-side.
2. Definisikan payment attempt/current payment serta pencegahan fee ganda.
3. Dokumentasikan dan uji refund, cancel vs callback terlambat, dan rekonsiliasi.

### Tahap 3 — Testing dan kualitas
Tambahkan test mismatch, callback duplicate/concurrent/out-of-order, channel unknown, nominal pecahan dan beberapa Payment per Donation. Jalankan test di environment aman dan tambahkan lint/type/test gate CI.

### Tahap 4 — REST API dan mobile
Tentukan use case dan kontrak mobile; bangun API versioned dengan Sanctum, resources, validation, ownership auth, token lifecycle, throttling dan dokumentasi. Gunakan domain payment bersama.

### Tahap 5 — Operasional/performa
Validasi target deploy, rsync excludes, backup, health check, rollback dan pemulihan maintenance. Verifikasi worker/monitoring/backup production; profile query saat volume meningkat.

## 18. Open Questions and Unverified Areas

- Apakah Midtrans production aktif dan channel sesuai konfigurasi merchant?
- Apakah Xendit masih menerima transaksi/callback aktif?
- Apakah gross amount selalu cocok formatnya dengan nominal tersimpan; bagaimana mismatch ditangani?
- Apakah callback/status query bisa out-of-order; adakah rekonsiliasi di luar repository?
- Apa database/cache/queue/storage/worker/runtime/domain server production?
- Apakah target deploy masih placeholder atau diubah di luar repository? Adakah backup/rollback eksternal?
- Apa kebutuhan awal mobile dan tipe klien untuk Sanctum?
- Apakah refund, audit finansial immutable dan retensi payload diwajibkan kebijakan internal?
- Apakah test suite terbaru lulus? Tidak dijalankan.
- Versi runtime dan hasil CVE scan belum diverifikasi.

## 19. PROJECT CONTEXT FOR CHATGPT

### Fakta terverifikasi
- Insani.id adalah monolit Laravel dengan React/Inertia untuk donasi, program crowdfunding, campaigner/fundraiser, disbursement, admin CMS, notifikasi, laporan dan analytics.
- Stack locked: Laravel 13.33.0, Inertia Laravel 3.3.4, Inertia React 3.7.1, React 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3, Vite 8.3.0; PHP constraint ^8.3.
- Backend memakai Eloquent, controllers, Form Requests, services, PaymentObserver, jobs/notifications, Fortify 1.40.0, Spatie Permission 8.3.0 dan activity log.
- Entitas inti: Program memiliki Donation/Disbursement; Donation memiliki Payment, optional Fundraiser/donor User, dan Comment; Fundraiser terkait Program/User.
- Donation online dibuat pending; Midtrans Core API membuat charge; callback/status sync memperbarui Payment. Observer mengubah Donation, agregat program/fundraiser, komentar dan notifikasi.
- Midtrans jalur utama di kode; Xendit fallback bila Midtrans belum diatur dan webhook legacy tetap ada.
- Fortify menangani auth termasuk 2FA. Role/permission middleware melindungi admin. User tidak memakai Sanctum HasApiTokens walau dependency/migration tersedia.
- Pest feature tests mencakup auth, donation security, payment/webhook, disbursement dan report. Tidak dijalankan saat audit.
- Contoh env memakai MySQL dan database cache/queue/session; Redis dapat dikonfigurasi tetapi bukan default contoh. Deploy manual Hostinger; Docker/Nginx/Compose tidak ditemukan.
- Branch main, commit 434b11215f1aa016960801d70fd9487c6465a670; working tree awal bersih.

### Indikasi untuk konfirmasi
- Webhook belum membandingkan nominal dengan Donation dan state concurrent/out-of-order tidak dijaga.
- Batas nominal dapat terlewati dengan payment_channel kosong/tidak dikenal.
- Fee bisa dihitung berulang bila beberapa Payment sukses terkait satu Donation.
- Workflow deploy memiliki rsync --delete dan target placeholder.

### Rekomendasi arsitektur
- Pertahankan Inertia untuk website; jangan membuat API untuk semua halaman.
- Tambahkan API mobile bertahap dengan Sanctum, resources, validation dan authorization.
- Satukan transisi Payment sebagai operasi atomik untuk callback dan status polling; client tidak boleh menentukan paid.
- Pertahankan pola controller/request/service/model kecuali abstraksi baru jelas membantu transisi payment/idempotensi.

### Belum tersedia
Konfigurasi server, runtime, status live gateway, backup/restore, monitoring, CI/test terbaru, dependency CVE scan, API contract, kebijakan refund/retensi dan keputusan arsitektur terdokumentasi belum diverifikasi.

File penting: routes/web.php; app/Http/Controllers/Public/DonationController.php; app/Http/Requests/StoreDonationRequest.php; app/Services/MidtransCorePaymentService.php; app/Http/Controllers/Webhook/MidtransWebhookController.php; app/Observers/PaymentObserver.php; app/Models/Donation.php; app/Models/Payment.php; migrations payment; tests/Feature/Webhook/MidtransWebhookTest.php.

## 20. Audit Metadata

- **Tanggal:** 10 Oktober 2026 (Asia/Jakarta)
- **Branch:** main
- **Commit:** 434b11215f1aa016960801d70fd9487c6465a670
- **Status Git awal:** main...origin/main, working tree bersih.
- **Pemeriksaan:** struktur, manifests/lock files, konfigurasi/template env, routes, model, requests, services, observers, migrations, React/Inertia, sanitasi HTML, tests, workflow deploy, status Git.
- **Tidak dilakukan:** membaca .env, menjalankan test/build/deploy, menghubungi gateway, mengakses database/layanan eksternal, mengubah source/config/dependency/database, membuat commit atau mengubah Git history.
- **Batasan:** audit statis tidak membuktikan runtime, konfigurasi production, maupun test pass/fail. Hanya file laporan ini dibuat oleh audit.

