# Panduan Integrasi WordPress REST API & Webhook

Dokumen ini menjelaskan langkah-langkah yang diperlukan untuk menghubungkan website WordPress Anda (sebagai CMS Berita/Kabar) dengan website Insani Indonesia.

Sistem Insani Indonesia menggunakan pendekatan **Webhook** untuk efisiensi tinggi. Artinya, setiap kali ada artikel yang dipublikasikan atau diperbarui di WordPress, WordPress akan mengirimkan pemberitahuan (Webhook) ke sistem Insani. Sistem Insani kemudian akan mengambil data artikel tersebut via REST API dan menyimpannya ke dalam *cache* database (`blog_post_caches`). 

Keuntungannya:
1. Akses halaman Berita di web Insani sangat cepat karena tidak memuat dari server eksternal saat halaman dibuka.
2. Sinkronisasi berjalan otomatis secara instan di belakang layar.

## 1. Konfigurasi `Environment` (Aplikasi Insani)

Tambahkan atau ubah dua baris konfigurasi berikut di dalam file `.env` aplikasi Anda (baik di server lokal maupun *production*):

```env
WORDPRESS_URL=https://berita.insani.id
WORDPRESS_WEBHOOK_SECRET=masukkan_secret_token_anda_disini
```

- **`WORDPRESS_URL`**: URL lengkap menuju website WordPress Anda. Jangan menaruh *slash* `/` di akhir (contoh: `https://berita.insani.id`).
- **`WORDPRESS_WEBHOOK_SECRET`**: Kunci rahasia bebas (acak) yang digunakan untuk mengotentikasi Webhook. Buatlah string yang kuat/acak dan catat string ini untuk dimasukkan ke WordPress nanti.

## 2. Pengaturan di Sisi WordPress

1. Buka Dashboard Admin WordPress Anda.
2. Instal dan aktifkan plugin **WP Webhooks** (gratis di direktori plugin WordPress), atau plugin webhook lain yang setara.
3. Masuk ke pengaturan Webhook plugin tersebut dan navigasikan ke bagian **Send Data (Kirim Data)**.
4. Buat *trigger* (pemicu) untuk:
   - **Post Created / Diterbitkan**
   - **Post Updated / Diperbarui**
5. Saat diminta memasukkan **Webhook URL**, masukkan URL berikut (sesuaikan domainnya dengan aplikasi utama Insani Anda):

   ```text
   https://insani.id/api/webhooks/wordpress?token=masukkan_secret_token_anda_disini
   ```
   *(Ganti `insani.id` dengan domain atau `http://localhost:8000` jika sedang testing lokal. Pastikan parameter `?token=` diisi sesuai dengan string di variabel `WORDPRESS_WEBHOOK_SECRET` pada langkah 1).*

## 3. Pengujian Singkat (Opsional)

Jika Anda belum menyiapkan WordPress tetapi ingin melihat bagaimana layout Berita/Blog bekerja, kami telah menyiapkan perintah bawaan untuk mengisi *mock data*:

```bash
php artisan blog:mock-sync
```

Perintah di atas akan menyuntikkan beberapa artikel palsu ke dalam tabel `blog_post_caches` agar halaman Berita dapat dilihat dan diuji di *browser*.
