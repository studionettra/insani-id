# Rencana Implementasi Migrasi Payment Gateway: Xendit ke Midtrans Core API (100% Custom End-to-End)
**Dokumen Spesifikasi Teknis & Rencana Eksekusi Menyeluruh**  
**Aplikasi:** Insani Indonesia (`insani.id`)  
**Versi Dokumen:** 1.0 (Final & Approved)  
**Tanggal:** Oktober 2026  
**Status:** Siap Eksekusi  

---

## Daftar Isi
1. [Latar Belakang & Tujuan Strategis](#1-latar-belakang--tujuan-strategis)
2. [Prinsip Arsitektur Utama (Strict Constraints)](#2-prinsip-arsitektur-utama-strict-constraints)
3. [Peta Saluran Pembayaran (Payment Channels Matrix)](#3-peta-saluran-pembayaran-payment-channels-matrix)
4. [Arsitektur Teknis Midtrans Core API](#4-arsitektur-teknis-midtrans-core-api)
5. [Fitur Manajemen Pembayaran di Dashboard Admin](#5-fitur-manajemen-pembayaran-di-dashboard-admin)
6. [Blueprint Antarmuka Frontend (UI/UX)](#6-blueprint-antarmuka-frontend-uiux)
7. [Arsitektur Webhook & Keamanan Signature SHA-512](#7-arsitektur-webhook--keamanan-signature-sha-512)
8. [Audit & Rencana Penanganan Xendit (Deprecation Plan)](#8-audit--rencana-penanganan-xendit-deprecation-plan)
9. [Fase Pengujian Sandbox & Rollout Produksi](#9-fase-pengujian-sandbox--rollout-produksi)
10. [Rencana Kerja Langkah Demi Langkah (Step-by-Step Execution Tasks)](#10-rencana-kerja-langkah-demi-langkah-step-by-step-execution-tasks)

---

## 1. Latar Belakang & Tujuan Strategis

### 1.1 Masalah pada Gateway Eksisting (Xendit)
Berdasarkan kebijakan tarif baru Xendit per 1 Oktober 2026:
- **Biaya Percobaan Gagal:** Dikenakan Rp 4.000 + PPN untuk setiap percobaan transaksi yang gagal/expired/dibatalkan. Pada platform donasi publik dengan ribuan pengunjung, hal ini menimbulkan risiko lonjakan beban biaya operasional yang tidak terprediksi.
- **Biaya API Legacy:** Dikenakan USD 250/bulan jika menggunakan integrasi invoice legacy.
- **Biaya Dormant:** Dikenakan USD 50/bulan jika akun tidak aktif.

### 1.2 Keuntungan Beralih ke Midtrans
- **Biaya Transaksi Transparan:**
  - QRIS: 0,7% (All-in).
  - Virtual Account: Flat Rp 4.000 / transaksi sukses.
  - E-Wallet (ShopeePay & GoPay): 2% / transaksi sukses.
- **Tanpa Biaya Transaksi Gagal:** Transaksi yang dibatalkan atau kedaluwarsa dikenakan biaya Rp 0.
- **Tanpa Biaya Bulanan / Maintenance:** Tidak ada beban fixed cost bulanan.
- **Akun Live Production Insani Sudah Siap:** Akun Midtrans Insani Indonesia telah memegang akses Production aktif.

---

## 2. Prinsip Arsitektur Utama (Strict Constraints)

1. **NO MIDTRANS SNAP (Strict Rule):**
   - Tidak menggunakan antarmuka bawaan Midtrans Snap sama sekali, baik dalam bentuk **Snap Popup Modal (`snap.pay()`)** maupun **Snap Hosted Checkout Redirect (`app.midtrans.com/snap/v2/vtweb/...`)**.
   - Donatur **100% tetap berada di dalam ekosistem domain `insani.id`**.
2. **Midtrans Core API (`/v2/charge`):**
   - Seluruh inisiasi pembayaran diproses murni secara *Server-to-Server* (backend Laravel berkomunikasi langsung dengan REST API Midtrans).
   - Midtrans hanya bertindak sebagai *transaction engine* dan mengembalikan data raw (string QRIS, Deeplink aplikasi, atau nomor rekening VA).
3. **White-Label & Native UI:**
   - Semua elemen pembayaran (QR Code, tombol Deeplink aplikasi e-wallet, kartu nomor Virtual Account, dan hitung mundur kedaluwarsa) dirender secara native menggunakan **Tailwind CSS + React (Inertia.js)** di halaman internal [`resources/js/pages/Public/Donation/Status.tsx`](file:///c:/laragon/www/insani-id/resources/js/pages/Public/Donation/Status.tsx).
4. **Dynamic & Admin-Controlled (Zero Hardcoding):**
   - Ketersediaan saluran pembayaran tidak di-hardcode di kode program, melainkan dikendalikan secara visual melalui **Dashboard Admin Insani.id** (`AppSetting`).
   - Penambahan bank atau metode baru di kemudian hari tidak memerlukan perubahan kodingan frontend.

---

## 3. Peta Saluran Pembayaran (Payment Channels Matrix)

### 3.1 Status Kesiapan Saluran di Midtrans Insani

| Kategori | Saluran (Channel) | Status di Midtrans | Penanganan di Insani.id | Biaya Transaksi |
| :--- | :--- | :--- | :--- | :--- |
| **QRIS** | GoPay Dynamic QRIS | **AKTIF (Live)** | **Pilihan Utama (Hero Channel)** — Menerima semua M-Banking (BCA, Mandiri, BRI, BNI, BSI) & E-Wallet (OVO, DANA, GoPay, ShopeePay) | 0,7% |
| **E-Wallet** | ShopeePay | **AKTIF (Live)** | **Aktif** — Deeplink otomatis ke aplikasi Shopee di HP / QR di desktop | 2,0% |
| **E-Wallet** | GoPay | **AKTIF (Live)** | **Aktif** — Deeplink otomatis ke aplikasi Gojek di HP / QR di desktop | 2,0% |
| **E-Wallet** | OVO & DANA | In Progress | **Diarahkan ke QRIS** dengan kartu edukasi instan di UI | - |
| **Virtual Account** | BSI VA | In Progress (SLA 4 Hari) | **Disiapkan di Admin & Backend** — Aktif seketika via toggle admin saat SLA selesai | Rp 4.000 |
| **Virtual Account** | BRI VA | In Progress (SLA 4 Hari) | **Disiapkan di Admin & Backend** — Aktif seketika via toggle admin saat SLA selesai | Rp 4.000 |
| **Virtual Account** | BNI VA | In Progress (SLA 4 Hari) | **Disiapkan di Admin & Backend** — Aktif seketika via toggle admin saat SLA selesai | Rp 4.000 |
| **Virtual Account** | Bank Mandiri Bill | In Progress (SLA 4 Hari) | **Disiapkan di Admin & Backend** — Aktif seketika via toggle admin saat SLA selesai | Rp 4.000 |
| **Virtual Account** | BCA VA | Belum Diajukan (Kebutuhan Rekening Bisnis BCA) | **Tidak Diaktifkan Langsung** — Donatur BCA difasilitasi via QRIS BCA Mobile / myBCA & Transfer Manual BI-FAST | - |
| **Virtual Account** | CIMB Niaga & Danamon | Dilewati | **Nonaktif** (Sesuai preferensi yayasan) | - |
| **Transfer Manual** | Rekening BSI Yayasan | **AKTIF (Internal)** | **Aktif 100%** (713 219 5026 a.n Insani Indonesia) | **Rp 0 (Gratis)** |
| **Transfer Manual** | Rekening BRI Yayasan | **AKTIF (Internal)** | **Aktif 100%** (0345 0100 1366 304 a.n Insani Indonesia) | **Rp 0 (Gratis)** |
| **Masa Depan** | Kartu Kredit (Visa/Mastercard/JCB/Amex) & Google Pay | Rencana Lanjutan | **Struktur Backend & DB Sudah Mengantisipasi** (`payment_method = 'credit_card'`) | 2,9% + Rp 2.000 |

---

## 4. Arsitektur Teknis Midtrans Core API

Integrasi menggunakan endpoint resmi Midtrans Core API via `Illuminate\Support\Facades\Http`:
- **Sandbox URL:** `https://api.sandbox.midtrans.com/v2/charge`
- **Production URL:** `https://api.midtrans.com/v2/charge`
- **Header Autentikasi:** `Authorization: Basic base64(MIDTRANS_SERVER_KEY + ":")`
- **Content-Type:** `application/json`

### 4.1 Spesifikasi Payload Request per Metode

#### A. GoPay Dynamic QRIS
```json
{
  "payment_type": "qris",
  "transaction_details": {
    "order_id": "DON-XXXXXXXXXX",
    "gross_amount": 50000
  },
  "qris": {
    "acquirer": "gopay"
  },
  "custom_expiry": {
    "order_time": "2026-10-03 05:00:00 +0700",
    "expiry_duration": 30,
    "unit": "minute"
  }
}
```
**Respon Kunci dari Midtrans:**
- `actions[0].url`: URL gambar QR Code PNG resmi dari Midtrans/GoPay.
- `qr_string`: String EMVCo QRIS murni untuk di-render via komponen canvas/SVG jika diperlukan.

#### B. ShopeePay & GoPay (E-Wallet)
```json
{
  "payment_type": "shopeepay",
  "transaction_details": {
    "order_id": "DON-XXXXXXXXXX",
    "gross_amount": 50000
  },
  "shopeepay": {
    "callback_url": "https://insani.id/donasi/status/DON-XXXXXXXXXX"
  },
  "custom_expiry": {
    "expiry_duration": 15,
    "unit": "minute"
  }
}
```
**Respon Kunci dari Midtrans (`actions` array):**
- `deeplink-redirect`: URL skema aplikasi langsung (misal: `https://wsa.wallet.airpay.co.id/...` atau `gojek://gopay/...`).
- `qr-code`: URL gambar QR Code untuk donatur yang mengakses melalui laptop/desktop.

#### C. Virtual Account (BSI, BRI, BNI, Mandiri, BCA)
```json
{
  "payment_type": "bank_transfer",
  "transaction_details": {
    "order_id": "DON-XXXXXXXXXX",
    "gross_amount": 50000
  },
  "bank_transfer": {
    "bank": "bsi"
  },
  "custom_expiry": {
    "expiry_duration": 24,
    "unit": "hour"
  }
}
```
*(Khusus Mandiri menggunakan `payment_type: "echannel"` dengan parameter `bill_info1` dan `bill_info2`).*  
**Respon Kunci dari Midtrans:**
- `va_numbers[0].va_number`: Nomor Virtual Account unik donatur.
- `biller_code` & `bill_key`: Khusus Bank Mandiri.

---

## 5. Fitur Manajemen Pembayaran di Dashboard Admin

Untuk memberikan kendali penuh kepada pengurus yayasan tanpa perlu menyentuh kodingan atau file `.env`, kita membangun antarmuka visual di:  
👉 **Admin Panel > Pengaturan Situs > Pembayaran & Gateway**

### 5.1 Skema Data di Database (`app_settings`)
Konfigurasi disimpan dalam format key-value yang reaktif dan di-cache:
- `payment_gateway_active`: `'midtrans'` (atau `'manual'`)
- `midtrans_environment`: `'sandbox'` / `'production'`
- `midtrans_channel_qris_active`: `'1'` / `'0'`
- `midtrans_channel_shopeepay_active`: `'1'` / `'0'`
- `midtrans_channel_gopay_active`: `'1'` / `'0'`
- `midtrans_channel_bsi_va_active`: `'0'` *(Tinggal diubah ke '1' saat disetujui)*
- `midtrans_channel_bri_va_active`: `'0'` *(Tinggal diubah ke '1' saat disetujui)*
- `midtrans_channel_bni_va_active`: `'0'` *(Tinggal diubah ke '1' saat disetujui)*
- `midtrans_channel_mandiri_va_active`: `'0'` *(Tinggal diubah ke '1' saat disetujui)*
- `midtrans_channel_bca_va_active`: `'0'`
- `midtrans_channel_cimb_va_active`: `'0'`
- `midtrans_channel_danamon_va_active`: `'0'`
- `midtrans_channel_credit_card_active`: `'0'`
- `midtrans_va_maintenance_notice`: `"Layanan Virtual Account otomatis sedang dalam integrasi perbankan berkala. Anda dapat berdonasi secara instan menggunakan QRIS (mendukung semua M-Banking: BCA, Mandiri, BRI, BNI, BSI) atau melalui Transfer Manual BSI & BRI."`

### 5.2 Fitur Pengujian Koneksi (Test Connection)
Disediakan tombol **"Uji Koneksi Midtrans"** di halaman admin untuk memvalidasi kredensial (Merchant ID, Client Key, Server Key) secara langsung sebelum dialihkan ke mode live.

---

## 6. Blueprint Antarmuka Frontend (UI/UX)

### 6.1 Halaman Form Donasi ([`Donate.tsx`](file:///c:/laragon/www/insani-id/resources/js/pages/Public/Program/Donate.tsx))

#### A. Logika Tab Dinamis
Array `paymentChannels` yang dikirim controller hanya berisi saluran yang aktif di Admin:
1. **Tab QRIS:** Selalu aktif. Menampilkan kartu QRIS dengan label "Paling Populer & Praktis" serta daftar bank/wallet pendukung.
2. **Tab E-Wallet:** Menampilkan kartu ShopeePay dan GoPay yang aktif. Di bawahnya terdapat kartu informatif: *"Untuk pengguna OVO & DANA, gunakan Tab QRIS untuk pembayaran instan tanpa biaya"*.
3. **Tab Virtual Account (Kondisi Otomatis):**
   - **Saat `vaChannels.length === 0` (Kondisi Sekarang):**  
     Menampilkan kartu notice ramah menggunakan isi dari `midtrans_va_maintenance_notice`. Terdapat tombol pintas: `[ Donasi via QRIS ]` dan `[ Transfer Manual ]`.
   - **Saat `vaChannels.length > 0` (Kondisi Saat Bank Aktif):**  
     Teks notice otomatis lenyap. Grid kartu bank Virtual Account (BSI, BRI, dll) langsung tampil lengkap dengan logo dan badge verifikasi otomatis 24/7.
4. **Tab Transfer Manual:** Selalu aktif menampilkan Rekening BSI dan BRI Yayasan.

---

### 6.2 Halaman Status & Instruksi Pembayaran ([`Status.tsx`](file:///c:/laragon/www/insani-id/resources/js/pages/Public/Donation/Status.tsx))

Halaman ini menggantikan seluruh kebutuhan UI Snap:

#### A. Tampilan QRIS Native
- Gambar QRIS beresolusi tajam di dalam kartu berbingkai khas Insani.
- **Timer Hitung Mundur (Countdown):** Menghitung mundur batas 30 menit.
- **Tombol "Unduh Gambar QR":** Mengunduh file QR code ke galeri ponsel donatur.
- **Instruksi Visual:** Langkah pembayaran untuk BCA Mobile, Livin by Mandiri, BRImo, BSI Mobile, DANA, OVO, ShopeePay, GoPay.
- **Auto-Detection Polling:** Setiap 5 detik, script memeriksa status pembayaran ke backend. Begitu donatur selesai scan dan bayar di HP mereka, halaman seketika berubah hijau menjadi **"Donasi Berhasil!"** tanpa perlu reload manual.

#### B. Tampilan ShopeePay & GoPay
- **Jika dibuka di Smartphone (Mobile):**  
  Menampilkan tombol aksi mencolok:  
  👉 **[ Buka Aplikasi ShopeePay ]** / **[ Buka Aplikasi Gojek ]**  
  Menggunakan deeplink resmi Midtrans yang langsung membuka aplikasi bersangkutan dengan nominal donasi yang sudah terkunci.
- **Jika dibuka di Laptop/Desktop:**  
  Menampilkan QR Code ShopeePay/GoPay untuk di-scan dari kamera ponsel.

#### C. Tampilan Virtual Account (Saat Aktif)
- Tampilan nomor VA dengan ukuran font besar dan mudah dibaca.
- Tombol satu-klik **"Salin Nomor VA"** dengan notifikasi toast.
- Accordion panduan pembayaran lengkap: ATM, Mobile Banking, dan Internet Banking untuk masing-masing bank.

---

## 7. Arsitektur Webhook & Keamanan Signature SHA-512

### 7.1 Endpoint & Handler
- **URL Endpoint:** `POST https://insani.id/webhooks/midtrans`
- **Controller:** `App\Http\Controllers\Webhook\MidtransWebhookController`
- **Route:** Dikecualikan dari verifikasi CSRF token (didaftarkan di middleware exception).

### 7.2 Verifikasi Tanda Tangan Kriptografi (Security Signature)
Setiap payload notifikasi dari Midtrans diverifikasi keabsahannya dengan rumus:
$$\text{Signature} = \text{hash}(\text{"sha512"}, \text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{ServerKey})$$

Jika `signature_key` dari Midtrans tidak cocok dengan hasil perhitungan lokal server Insani, request langsung ditolak dengan status `403 Forbidden`. Ini menjamin keamanan dari upaya pemalsuan pembayaran oleh pihak luar.

### 7.3 State Machine Transaksi Donasi
```
[ Notifikasi Midtrans: transaction_status ]
         │
         ├── 'settlement' / 'capture' (fraud_status == 'accept')
         │     └── Status Donasi: 'paid'
         │     └── Catat: paid_at = now(), paid_amount, gateway_status = 'PAID'
         │     └── Trigger: Kirim Email Kuitansi Resmi (DonationReceiptNotification)
         │     └── Update: Akumulasi dana terkumpul di tabel programs
         │
         ├── 'pending'
         │     └── Status Donasi: 'pending' (Menunggu pembayaran)
         │
         ├── 'expire'
         │     └── Status Donasi: 'expired'
         │
         └── 'cancel' / 'deny'
               └── Status Donasi: 'failed'
```

---

## 8. Audit & Rencana Penanganan Xendit (Deprecation Plan)

### 8.1 Evaluasi & Penanganan Komponen Xendit

| Komponen | Lokasi File | Tindakan & Rekomendasi |
| :--- | :--- | :--- |
| **Database Migrations** | `database/migrations/` | **TIDAK DIUBAH.** Kolom `gateway` sudah `string(30)` dan kompatibel menyimpan `'midtrans'`. Riwayat donasi masa lalu tetap utuh. |
| **Model Payment** | `app/Models/Payment.php` | Kompatibel penuh, raw payload Midtrans disimpan dalam kolom JSON. |
| **Service Lama** | `app/Services/XenditPaymentService.php` | Dibiarkan sebagai arsip (tidak dihapus langsung) agar tidak merusak dependensi pengujian lama. |
| **Webhook Lama** | `routes/web.php` (`/webhooks/xendit`) | Dibiarkan tetap aktif selama masa transisi sebagai pendengar transaksi tertunda lama. |
| **Email Template** | `resources/views/emails/donations/pending.blade.php` | Diperbarui agar tombol pembayaran mengarah ke `route('donation.status', $code)`. |
| **Teks Halaman Bantuan** | `HelpCenterView.tsx` & `HowToDonateView.tsx` | Kata "(Xendit)" diubah menjadi rujukan resmi: *"Payment Gateway berlisensi Bank Indonesia (Midtrans)"*. |
| **Status Page Text** | `Status.tsx` | Pesan toast diubah menjadi netral: *"Memeriksa status pembayaran..."*. |
| **Composer Dependencies** | `composer.json` | Package `xendit/xendit-php` dipertahankan sementara, lalu dihapus pada fase pembersihan pasca-transisi stabil. |

---

## 9. Fase Pengujian Sandbox & Rollout Produksi

### Fase 1: Konfigurasi Sandbox
1. Masukkan kredensial Sandbox Midtrans ke `.env`:
   - `MIDTRANS_SERVER_KEY=SB-Mid-server-...`
   - `MIDTRANS_CLIENT_KEY=SB-Mid-client-...`
   - `MIDTRANS_IS_PRODUCTION=false`
2. Uji skenario transaksi menggunakan Simulator Midtrans:
   - Tes pembayaran QRIS (scan via Midtrans QR Simulator).
   - Tes pembayaran ShopeePay / GoPay.
   - Tes webhook lokal (menggunakan payload simulator).
   - Pastikan status donasi otomatis berubah menjadi `paid` dan email kuitansi terkirim.

### Fase 2: Pengujian UI & Edge Cases
1. Tes tampilan fallback Tab Virtual Account saat belum ada bank aktif.
2. Tes aktivasi switch BSI VA di Dashboard Admin dan pastikan form kartu bank langsung muncul di frontend.
3. Tes masa kedaluwarsa (QRIS 30 menit, VA 24 jam).

### Fase 3: Transisi ke Production (Live Cutover)
1. Ganti kredensial di `.env` dengan kredensial Production resmi dari akun Insani:
   - `MIDTRANS_SERVER_KEY=Mid-server-...`
   - `MIDTRANS_CLIENT_KEY=Mid-client-...`
   - `MIDTRANS_IS_PRODUCTION=true`
2. Simpan **Payment Notification URL** di Dashboard Midtrans Live:  
   `https://insani.id/webhooks/midtrans`
3. Simpan **Finish Redirect URL** di Dashboard Midtrans Live:  
   `https://insani.id`
4. Lakukan 1 kali uji coba donasi riil nominal Rp 10.000 via QRIS dari smartphone.
5. Verifikasi dana masuk di Dashboard Midtrans dan donasi tercatat lunas di dashboard admin Insani.

---

## 10. Rencana Kerja Langkah Demi Langkah (Step-by-Step Execution Tasks)

```
[ TAHAPAN EKSEKUSI ]
├── Task 1: Konfigurasi Environment & Services Config
├── Task 2: Pembuatan MidtransCorePaymentService (Backend Engine)
├── Task 3: Pembuatan MidtransWebhookController & Route Notifikasi
├── Task 4: Pembuatan Antarmuka Pengaturan Channel di Dashboard Admin
├── Task 5: Refactoring DonationController (Integrasi Core API)
├── Task 6: Penyempurnaan Frontend Donate.tsx (Smart Fallback & Tabs)
├── Task 7: Penyempurnaan Frontend Status.tsx (Native QR, Deeplink & VA)
├── Task 8: Pembaruan Teks Publik, FAQ, dan Template Email
├── Task 9: Pengujian Komprehensif Sandbox (Pest Feature Tests)
└── Task 10: Persiapan Deployment Live & Dokumentasi Serah Terima
```

---
*Dokumen ini merupakan panduan implementasi resmi teknis migrasi payment gateway Insani Indonesia.*
