# 🎨 Panduan Standar Desain Banner Beranda & Spesifikasi Responsif
### Standar Teknis Resolusi, Aspek Rasio, Safe Zone, dan Optimasi Visual Insani Indonesia (`insani.id`)

> **Kategori:** Naskah Acuan Konten & Desain Visual (`docs/content/`)  
> **Target Pengguna:** Tim Desain Grafis, Content Editor, Administrator Kampanye, dan Tim Komunikasi Publik  
> **Versi Dokumen:** 1.0 — Oktober 2026  
> **Kompatibilitas Sistem:** Laravel 11 + Inertia React (Hero Slider `Home/Index.tsx`)

---

## 📌 Ringkasan Eksekutif & Mengapa Panduan Ini Krusial

Platform Galang Dana Insani Indonesia (`insani.id`) menyajikan **Hero Banner Slider** di halaman beranda sebagai titik kontak visual pertama (*first visual impression*) bagi calon donatur, mitra lembaga, dan publik.

Di era multi-perangkat (*multi-device*), lebih dari **75% donatur mengakses situs melalui perangkat mobile (smartphone)**, sementara donatur korporat, mitra CSR, dan pemangku kepentingan yayasan sering membuka situs melalui desktop atau laptop. 

Sistem beranda Insani menggunakan **CSS `object-cover`** dengan ketinggian dinamis viewport (`85dvh` dengan `min-h-[600px]`). Mekanisme ini memastikan banner selalu memenuhi layar tanpa meninggalkan celah kosong (*letterboxing/pillarboxing*), namun memiliki efek samping: **gambar akan terpotong secara otomatis (*auto-cropped*) dari sisi tengah (*center-origin*) menyesuaikan rasio layar pengguna.**

Jika desainer grafis atau content editor membuat banner tanpa memperhitungkan **Aspek Rasio terpisah (Desktop vs Mobile)** dan **Safe Zone (Zona Aman)**:
1. **Wajah subjek manusia terpotong** oleh tepi layar atau tertutup elemen tombol.
2. **Teks grafis tidak terbaca** karena tertutup oleh gradien hitam pekat atau teks judul HTML sistem.
3. **Tombol CTA dan navigasi bertabrakan** dengan elemen visual penting di dalam gambar.
4. **Kecepatan muat halaman (Core Web Vitals / LCP) anjlok** jika file gambar terlalu berat atau tidak teroptimasi.

Panduan ini menetapkan standar matematis, tata letak, safe zone, dan etika visual agar setiap banner yang dipublikasikan tampil sempurna, tajam, dan menyentuh hati di segala ukuran layar.

---

## 🏗️ 1. Bedah Arsitektur Tampilan Banner Beranda (Frontend Analysis)

Berdasarkan implementasi kode pada [`resources/js/pages/Public/Home/Index.tsx`](file:///c:/laragon/www/insani-id/resources/js/pages/Public/Home/Index.tsx) dan [`resources/js/layouts/PublicLayout.jsx`](file:///c:/laragon/www/insani-id/resources/js/layouts/PublicLayout.jsx), banner beranda terdiri atas **4 lapisan (layers)** yang bertumpuk:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [LAYER 4] Floating Controls: Tombol Navigasi Panah & Progress Bar       │
├────────────────────────────────────────────────────────────────────────┤
│ [LAYER 3] Dynamic Typography & Action: Judul, Deskripsi & Tombol CTA   │
├────────────────────────────────────────────────────────────────────────┤
│ [LAYER 2] Gradient Overlay: Hitam Pekat Bawah (from-zinc-950/80)       │
├────────────────────────────────────────────────────────────────────────┤
│ [LAYER 1] Base Image: Desktop / Mobile Asset (object-cover)            │
└────────────────────────────────────────────────────────────────────────┘
```

### Rincian Perilaku Tiap Lapisan:

1. **Lapisan 1 — Base Image (`object-cover`):**
   * **Desktop (`md:block`):** Menampilkan `desktop_image_url`.
   * **Mobile (`md:hidden`):** Menampilkan `mobile_image_url`. Jika gambar mobile tidak diunggah, sistem fallback menggunakan `desktop_image_url`. *(Catatan: Fallback ini harus dihindari karena rasio lanskap akan terpotong ekstrem di layar potret).*
2. **Lapisan 2 — Gradient Overlay:**
   * CSS: `bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent`.
   * **Karakteristik:** Area 35%–40% terbawah gambar akan digelapkan oleh gradien transparan menuju hitam pekat 80%. Tujuannya agar teks putih di atasnya selalu terbaca dengan kontras tinggi (sesuai standar aksesibilitas WCAG AA).
3. **Lapisan 3 — Tipografi Dinamis & Tombol CTA:**
   * Diletakkan di bagian bawah: `absolute inset-0 flex flex-col justify-end pb-16 md:pb-24`.
   * **Desktop:** Judul teks berukuran `text-3xl` s.d. `text-5xl` (font bold), paragraf deskripsi hingga 200 karakter, dan tombol bulat putih *"Lihat Selengkapnya / Donasi Sekarang"*.
   * **Mobile:** Menempati hingga **45% tinggi layar bawah**.
4. **Lapisan 4 — Elemen UI Mengambang (Floating Controls & Navigation):**
   * **Tombol Panah Slider (Next/Prev):** Berada di pojok kanan bawah (`bottom-12 right-6 md:right-12`).
   * **Indikator Slider:** Berada di sisi kanan tengah layar (vertikal rotasi -90°).
   * **Mobile Bottom Navbar:** Pada tampilan mobile, terdapat bottom bar aplikasi (`z-50`) dengan tinggi ~70px dan tombol tengah *"Donasi"* yang melayang di atas batas bawah layar.

---

## 📐 2. Matriks Aspek Rasio & Ukuran Kanvas Rekomendasi

Untuk menghasilkan ketajaman optimal di layar biasa maupun layar retina (High-DPI / AMOLED) tanpa membebani performa browser, wajib digunakan dua aset kanvas terpisah:

| Dimensi Parameter | Versi Desktop (Lanskap) | Versi Mobile (Potret) |
|---|---|---|
| **Aspek Rasio Target** | **21:9** s.d. **16:7** (~`2.35:1`) | **9:16** s.d. **2:3** (`1:1.77`) |
| **Ukuran Kanvas Ideal (Figma/Canva)** | **1920 × 820 px** *(Standard Full HD)* | **1080 × 1920 px** *(Standard Full HD Mobile)* |
| **Ukuran Alternatif (Ultra Sharp / 2K)** | **2560 × 1090 px** | **1080 × 1620 px** *(Rasio 2:3)* |
| **Ukuran Minimum Mutlak** | **1440 × 615 px** | **750 × 1334 px** |
| **Karakteristik Tampilan** | Melebar horizontal, fokus subjek di kanan | Memanjang vertikal, fokus subjek di atas |
| **Batas Ukuran File Maksimal** | **Maks. 3 MB** *(Rekomendasi: < 350 KB)* | **Maks. 2 MB** *(Rekomendasi: < 180 KB)* |
| **Format File Diutamakan** | **WebP** *(Prioritas 1)* / **JPEG Progressive** | **WebP** *(Prioritas 1)* / **JPEG Progressive** |

---

## 🎯 3. Safe Zone (Zona Aman) Desktop: Analisis & Diagram Koordinat

### Diagram Layout Kanvas Desktop (`1920 × 820 px`)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────┐ 0px
│                                  TOP SAFE MARGIN (Padding 60px)                                │
├──────────────────────────────────┬─────────────────────────────────────────────────────────────┤ 60px
│                                  │                                                             │
│                                  │                   GOLDEN VISUAL ZONE                        │
│                                  │             (Area Utama Foto / Subjek Manusia)              │
│                                  │                                                             │
│         AREA LAPANG /            │   • Letakkan mata/wajah relawan, penerima manfaat,          │
│       BACKGROUND NETRAL          │     atau aksi lapangan di sini.                             │
│                                  │   • Koordinat: X: 900px s.d. 1820px, Y: 80px s.d. 650px    │ 500px
│                                  │                                                             │
├──────────────────────────────────┤                               ┌─────────────────────────────┤
│ SYSTEM OVERLAY ZONE              │                               │   SLIDER CHEVRON BUTTONS    │
│ (Judul, Deskripsi & Tombol CTA)  │                               │   (Tombol Panah Kiri-Kanan) │
│ • Terisi teks sistem HTML        │                               │   X: 1720px - 1860px        │
│ • Jangan letakkan wajah/teks di  │                               │   Y: 700px - 780px          │
│   area ini (X: 60 - 1100px,      │                               └─────────────────────────────┤ 700px
│   Y: 500 - 760px)                │             BOTTOM BLEED MARGIN (Padding 60px)              │
└──────────────────────────────────┴─────────────────────────────────────────────────────────────┘ 820px
0px                               1100px                                                       1920px
```

### Penjelasan Zona Desktop:
1. **Golden Visual Zone (Kanan: X 900px – 1820px, Y 80px – 650px):**
   * Ini adalah **area paling aman** untuk menempatkan wajah anak yatim, relawan tanggap bencana, armada ambulans, atau subjek utama program.
   * Di area ini, subjek tidak akan tertutup teks HTML, tidak tertutup gradien pekat, dan tidak terpotong pada layar laptop 13 inch maupun monitor ultrawide 34 inch.
2. **System Overlay Zone (Kiri Bawah: X 60px – 1100px, Y 500px – 760px):**
   * Di area ini, browser merender:
     * Judul Banner (`text-3xl` s.d. `text-5xl`)
     * Deskripsi Banner (hingga 2 baris teks putih)
     * Tombol Putih (*"Lihat Selengkapnya"*)
   * **Aturan Desain:** Area gambar di sisi kiri ini harus dibiarkan berupa latar belakang lapang (*negative space*), misalnya langit, pemandangan terbuka, atau bayangan gelap netral agar keterbacaan teks sistem tetap kontras dan jernih.
3. **Controls Danger Zone (Kanan Bawah: X 1720px – 1860px, Y 700px – 780px):**
   * Area bersemayamnya tombol panah navigasi slider. Jangan letakkan logo mitra penting atau informasi teks di sudut kanan bawah ini.

---

## 📱 4. Safe Zone (Zona Aman) Mobile: Analisis & Diagram Koordinat

Tampilan mobile adalah titik paling krusial karena layar smartphone memiliki rasio yang sempit dan tinggi, serta dijejali oleh elemen UI aplikasi.

### Diagram Layout Kanvas Mobile (`1080 × 1920 px`)

```text
┌────────────────────────────────────────────────────────────┐ 0px
│           TOP DANGER ZONE (Margin Header 0 - 160px)        │ -> Dekat Top Header
├────────────────────────────────────────────────────────────┤ 160px
│                                                            │
│                  GOLDEN SAFE VISUAL ZONE                   │
│             (Wajah, Subjek Utama, Focal Point)             │
│                                                            │
│  • Area paling aman 100% terlihat di SEMUA jenis HP        │
│    (iPhone SE, iPhone 15 Pro, Samsung S24 Ultra).          │
│  • Koordinat Vertikal: Y: 180px s.d. 950px                │
│  • Margin Horizontal: X: 80px s.d. 1000px                 │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤ 950px
│                                                            │
│             BOTTOM SYSTEM OVERLAY ZONE (BAHAYA)            │
│                 (Tinggi ~970px dari Bawah)                 │
│                                                            │
│  ▼ GRADIENT HITAM PEKAT (from-zinc-950/80)                 │
│  ▼ JUDUL BANNER HTML SISTEM (text-3xl)                     │
│  ▼ DESKRIPSI LENGKAP BANNER (text-base)                    │
│  ▼ TOMBOL CTA BULAT PUTIH (h-12)                           │
│  ▼ FLOATING BOTTOM NAVBAR & HEART ICON DONASI              │
│                                                            │
│  ⚠️ DILARANG MENARUH:                                      │
│     - Wajah manusia / ekspresi mata                        │
│     - Teks grafis bawaan poster                            │
│     - Logo institusi/legalitas                             │
│                                                            │
└────────────────────────────────────────────────────────────┘ 1920px
0px                                                        1080px
```

### Penjelasan Zona Mobile:
1. **Golden Safe Visual Zone (Y: 180px – 950px / Bagian Atas-Tengah):**
   * Seluruh daya tarik visual banner wajib dipusatkan di **setengah bagian atas kanvas**.
   * Jika menampilkan foto dokumentasi lapangan, posisikan kepala dan tubuh subjek pada rentang tinggi ini.
2. **Bottom Danger Zone (Y: 950px – 1920px / 50% Bagian Bawah):**
   * Di layar HP (terutama smartphone berlayar pendek seperti iPhone SE / resolusi 375x667), teks judul dan tombol CTA akan memakan hampir **setengah dari total tinggi layar**.
   * Bagian terbawah juga tertutup oleh **Floating Mobile Navigation Bar** yayasan setinggi ~70px.
   * Setiap elemen grafis atau wajah yang berada di bawah garis 950px akan tenggelam ke dalam kegelapan gradien dan tertimpa tombol.

---

## 🎨 5. Dua Mode Desain Banner & Strategi Produksi

Tergantung pada kebutuhan divisi komunikasi yayasan, ada dua metode pembuatan banner:

### Mode A: Banner Fotografi Dinamis (Metode Standar & Sangat Direkomendasikan)
Pada mode ini, banner hanya berisi **foto dokumentasi asli (high-res photography)** tanpa teks judul yang ditempel manual pada gambar.
* **Mekanisme:** Judul, deskripsi, dan tombol diisi langsung melalui formulir CMS Admin.
* **Keunggulan:**
  * **Otomatis Multibahasa:** Judul dan deskripsi otomatis diterjemahkan ke Bahasa Indonesia, Inggris, dan Arab sesuai bahasa yang dipilih pengunjung.
  * **SEO Friendly:** Teks judul terbaca oleh mesin pencari Google sebagai elemen `<h2>` yang sah.
  * **Responsif Sempurna:** Teks HTML otomatis mengatur ukuran font (*fluid typography*) di smartphone maupun desktop.
* **Panduan untuk Desainer:**
  * Cukup sediakan foto berkualitas tinggi dengan komposisi yang tepat:
    * File Desktop: Foto dengan ruang kosong (*negative space*) di kiri, subjek di kanan.
    * File Mobile: Foto dengan ruang kosong di bawah, subjek di tengah-atas.

### Mode B: Banner Grafis Komprehensif (Poster Campaign / Acara Tertentu)
Digunakan saat yayasan merilis kampanye khusus bertema tematik (misal: *Ramadan 1448 H*, *Kurban Berkah Nusantara*, *Darurat Bencana Gempa*), di mana tim kreatif mendesain poster khusus dengan tipografi dan ilustrasi terintegrasi.
* **Mekanisme CMS:** Field Judul & Deskripsi di Admin dikosongkan (atau hanya diisi judul ringkas untuk alt-text), tombol CTA diisi link program.
* **Aturan Wajib:**
  1. Teks poster tidak boleh diletakkan di tepi kanvas (terapkan margin minimal 100px di semua sisi).
  2. Pada versi mobile, seluruh tipografi grafis (misal *"SEDEKAH AIR BERSIH"*) **wajib berada di dalam Golden Safe Zone (Y: 200px – 900px)**.
  3. Gunakan kontras warna yang tegas terhadap gradien gelap bawaan sistem.

---

## 📜 6. Etika Visual, Brand Guidelines & Larangan Desain

Dalam mendesain aset visual yayasan filantropi resmi Insani Indonesia, seluruh tim wajib mematuhi panduan etika dan aturan desain yang berlaku:

### 1. Larangan Ikon Sparkles & AI Cliché (Strict Rule)
> Sesuai ketentuan resmi dalam [AGENTS.md](file:///c:/laragon/www/insani-id/AGENTS.md):
> **DILARANG KERAS** menggunakan icon `Sparkles`, bintang kilau, atau grafis kilauan artificial di seluruh banner dan materi promosi Insani. Simbol ini berkonotasi gimmick kecerdasan buatan (*AI slop*) dan bertentangan dengan marwah lembaga kemanusiaan resmi. Gunakan elemen visual humanis, geometris minimalis, atau ikon resmi dari katalog Lucide seperti `Heart`, `ShieldCheck`, `CheckCircle2`, `Landmark`, atau `Compass`.

### 2. Prinsip Memuliakan Penerima Manfaat (*Dignity First*)
* **Hindari Pornografi Kemiskinan (*Poverty Porn*):** Jangan menampilkan subjek penerima manfaat dalam kondisi yang merendahkan martabat (misal: menangis histeris dengan zoom ekstrem, pakaian kotor yang dieksploitasi, atau ekspresi tanpa harapan).
* **Fokus pada Harapan & Solusi (*Hope & Impact*):** Tampilkan senyuman ketabahan, interaksi hangat relawan dengan warga, transparansi penyaluran bantuan pangan, atau optimisme anak-anak di ruang belajar.

### 3. Aset Logo Resmi
* Jika banner mencantumkan logo mitra perbankan (BSI, Mandiri, BCA), e-wallet (QRIS, GoPay), atau kementerian (Kemensos, Kemenkumham), wajib menggunakan aset **vektor resmi (SVG) atau PNG transparan beresolusi tinggi** tanpa distorsi (*stretching* aspek rasio).

---

## ⚙️ 7. Spesifikasi Teknis File & Checklist Optimasi Performa

Setiap banner yang diunggah ke sistem akan diproses oleh server dan disimpan di penyimpanan publik. Ikuti spesifikasi teknis berikut:

### Format File & Kompresi
1. **Format Utama:** Gunakan format **`.webp`** (lossy dengan kualitas 80–85%). Format WebP memberikan rasio kompresi hingga 35% lebih kecil dibandingkan JPEG pada ketajaman visual yang setara.
2. **Format Alternatif:** **`.jpg` / `.jpeg`** progressive (kualitas 82–85%). Hindari format `.png` untuk foto dokumentasi riil karena ukurannya bisa 5–8 kali lebih besar.
3. **Color Profile:** Wajib **sRGB**. Jangan gunakan profile warna *CMYK* (khusus cetak) atau *Display P3* (tanpa konversi) karena akan menyebabkan warna pudar atau tidak konsisten pada peramban non-Apple.

### Batasan Ukuran File (File Size Budget)
* **Desktop Banner:** Target ideal **< 350 KB** (Server Limit: 3.072 KB / 3 MB).
* **Mobile Banner:** Target ideal **< 180 KB** (Server Limit: 2.048 KB / 2 MB).
* **Alasan:** Banner berada di *Largest Contentful Paint (LCP)*. Jika ukuran file banner di atas 1 MB, skor kecepatan Google PageSpeed Insights akan turun drastis di jaringan seluler 4G.

---

## 🛠️ 8. Panduan Praktis untuk Software Desain (Figma / Canva / Photoshop)

### Panduan Setup di Figma:
1. Buat **Frame 1 (Desktop)**: `Width: 1920`, `Height: 820`.
   * Beri Guide Horizontal pada `Y: 60px` dan `Y: 760px`.
   * Beri Guide Vertikal pada `X: 900px` (batas aman antara teks sistem di kiri dan subjek di kanan).
2. Buat **Frame 2 (Mobile)**: `Width: 1080`, `Height: 1920`.
   * Beri Guide Horizontal pada `Y: 180px` (batas atas) dan `Y: 950px` (batas bawah safezone).
   * Seluruh elemen penting (wajah/teks) wajib berada di dalam area `Y: 180px – 950px`.
3. Buat komponen **Preview Overlay**:
   * Simulasikan gradien hitam bawah (`linear-gradient(to top, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.2) 40%, transparent 100%)`) untuk memastikan keterbacaan.

### Panduan Setup di Canva:
1. Gunakan opsi **Custom Size**:
   * Desain 1: `1920 x 820 px`
   * Desain 2: `1080 x 1920 px`
2. Aktifkan **File > View settings > Show rulers and guides**.
3. Tarik garis pemandu sesuai koordinat di atas sebelum mengatur posisi foto.

---

## 📋 9. Cheatsheet Ringkas Sebelum Upload ke CMS

Sebelum menekan tombol simpan di menu **Dashboard Admin > Banner Beranda**, lakukan checklist berikut:

```text
[ ] Apakah Anda sudah menyiapkan 2 file terpisah (Desktop & Mobile)?
    -> JANGAN hanya upload 1 file desktop jika tidak ingin tampilan mobile hancur!
[ ] Apakah wajah subjek di versi Desktop berada di sisi kanan (X: 900px - 1800px)?
[ ] Apakah subjek di versi Mobile berada di area 15% - 50% dari atas (Y: 180px - 950px)?
[ ] Apakah tidak ada teks/logo di area 40% terbawah gambar mobile?
[ ] Apakah format gambar sudah .webp atau .jpg dengan sRGB?
[ ] Apakah ukuran file di bawah 350 KB (Desktop) dan 180 KB (Mobile)?
[ ] Apakah teks judul dan deskripsi di form admin sudah diisi dengan baik?
```

---

## 🔗 Referensi Dokumen Terkait
* [SOP Pengisian Data Live Yayasan (`docs/deployment/MANUAL_DATA_ENTRY_GUIDE.md`)](file:///c:/laragon/www/insani-id/docs/deployment/MANUAL_DATA_ENTRY_GUIDE.md)
* [Naskah Acuan Narasi Fokus Program (`docs/content/fokus-program-insani.md`)](file:///c:/laragon/www/insani-id/docs/content/fokus-program-insani.md)
* [Kode Komponen Hero Slider Beranda (`resources/js/pages/Public/Home/Index.tsx`)](file:///c:/laragon/www/insani-id/resources/js/pages/Public/Home/Index.tsx)
* [Form Manajemen Banner Admin (`resources/js/pages/Admin/HomepageBanners/Index.tsx`)](file:///c:/laragon/www/insani-id/resources/js/pages/Admin/HomepageBanners/Index.tsx)
