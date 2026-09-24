# 📖 Panduan Pengisian Data Manual (Pasca-Deployment)

Dokumen ini merupakan panduan bagi Administrator untuk melakukan pengisian data-data krusial secara manual setelah aplikasi berhasil di-deploy ke server dan *database* awal di-seed. Hal ini ditujukan agar tidak mengotori *database* production dengan *dummy data* dari seeder, melainkan diisi dengan data asli via halaman Admin.

Pastikan Anda sudah login menggunakan akun `Super Administrator` (`admin@insani.id` / `password`).

---

## 1. Pengaturan Data Tim (Management Members)
Pada bagian Company Profile, struktur anggota manajemen belum diisi. 
- **Aksi:** Masuk ke menu **Dashboard Admin > Company Profile > Tim Manajemen**.
- **Langkah Pengisian:** 
  1. Klik "Tambah Anggota Tim".
  2. Isi Nama, Jabatan (misal: Direktur Utama, Kepala Keuangan, dll).
  3. Upload pas foto anggota.
  4. Simpan.

## 2. Pendaftaran Mitra (Partners)
Logo mitra atau instansi yang bekerjasama akan ditampilkan di frontend.
- **Aksi:** Masuk ke menu **Dashboard Admin > Company Profile > Mitra/Partner**.
- **Langkah Pengisian:**
  1. Klik "Tambah Mitra".
  2. Isi Nama Mitra.
  3. Upload logo resmi mitra bersangkutan.
  4. Simpan.

## 3. Konfigurasi Homepage Banner (Carousel)
Banner utama yang akan tampil secara bergeser di halaman beranda.
- **Aksi:** Masuk ke menu **Dashboard Admin > Pengaturan Tampilan > Homepage Banners**.
- **Langkah Pengisian:**
  1. Buat beberapa banner utama.
  2. Masukkan URL gambar (landscape), Judul Banner, dan Deskripsi singkat.
  3. Arahkan *Call to Action* (URL Tujuan) misal ke halaman Program Donasi tertentu.
  4. Atur urutan tayangnya dan pastikan statusnya `Aktif`.

## 4. Pengaturan Impact Stats (Statistik Dampak)
Statistik capaian yayasan yang ditampilkan secara dinamis di *homepage* (misal: "1M+ Dana Tersalurkan", "5000+ Penerima Manfaat").
- **Aksi:** Masuk ke menu **Dashboard Admin > Pengaturan Tampilan > Statistik Dampak**.
- **Langkah Pengisian:**
  1. Tambahkan statistik baru.
  2. Isi Label (contoh: "Penerima Manfaat").
  3. Isi Angka/Value (contoh: "15.000").
  4. Pilih ikon (jika didukung oleh UI).

## 5. Pengumuman Popup (Popup Message)
Jika Anda memiliki *event* atau peringatan penting.
- **Aksi:** Masuk ke menu **Dashboard Admin > Pengaturan Tampilan > Pesan Popup**.
- **Langkah Pengisian:**
  1. Buat popup baru, isi konten (bisa berupa teks/gambar kampanye terkini).
  2. Atur durasi penayangan (Mulai - Selesai).
  3. Aktifkan agar pengunjung baru akan melihat popup ini saat membuka web.

---

## 6. Persiapan Pembuatan Program Donasi
Sebelum membuat Program Donasi, pastikan data penunjang berikut sudah diverifikasi dan diisi dengan benar.

### A. Registrasi User Tambahan (Opsional)
- Arahkan staf Anda untuk mendaftar akun, lalu assign *Role* yang sesuai (Program Officer, Verifikator, Keuangan, Customer Service) melalui menu **Admin > Manajemen Pengguna**.

### B. Registrasi Campaigner (Lembaga/Individu)
- Jika Program Donasi tidak dipegang oleh *Internal*, daftarkan *Campaigner* baru.
- Arahkan campaigner untuk memverifikasi profil mereka dengan mengunggah KTP/Legalitas Lembaga, dan kemudian Anda mem-verifikasinya via menu **Admin > Verifikasi Campaigner**.

### C. Pembuatan Program Donasi Asli
- **Aksi:** Masuk ke menu **Dashboard Admin > Manajemen Program**.
- **Langkah Pengisian:**
  1. Klik "Tambah Program".
  2. Pilih Kategori.
  3. Tentukan Target Dana & Batas Waktu.
  4. Tulis kisah penggalangan dana (*Story*).
  5. Upload gambar sampul program yang menarik.
  6. Publish program tersebut agar dapat menerima donasi secara live.

### D. Pengetesan Transaksi (Opsional)
- Lakukan **Donasi sebesar nominal minimal** pada program yang telah diterbitkan menggunakan *Payment Gateway* yang ada. Pastikan notifikasi WhatsApp/Email terkirim, dan status di Dashboard Admin berubah menjadi "Berhasil/Paid". 

---
_Panduan ini dapat dihapus atau diperbarui sesuai dengan kebijakan internal Insani-ID di masa mendatang._
