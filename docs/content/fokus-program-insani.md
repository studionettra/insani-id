# 6 Fokus Program Insani.id — Revisi: Realita Lapangan vs. Capaian Program
### Dua Blok Konten Terpisah untuk Seeder CMS (menyesuaikan tab "Narasi Realitas" & "Metrik Dampak")

> **Kenapa direvisi:** Draf sebelumnya mencampur narasi capaian internal ke dalam tab "Narasi Realitas & Urgensi Lapangan" — padahal tab itu semestinya membangun empati calon donatur lewat **kondisi krisis nyata di lapangan** (data eksternal: IPC, UNICEF, UNRWA, BPS, BNPB, dll.), bukan capaian Insani sendiri. Dokumen ini memisahkan keduanya secara tegas menjadi:
>
> - **BLOK A — Realita & Urgensi Lapangan**: judul + narasi krisis + statistik krisis (sumber eksternal, tercantum per angka). Ini yang mengisi tab "2. Narasi Realitas".
> - **BLOK B — Capaian Program Insani**: judul + narasi capaian + statistik capaian (dari data internal, sama seperti pada dokumen sebelumnya). Ini mengisi tab "4. Metrik Dampak" yang sudah ada.
>
> **Rekomendasi field baru:** Karena tab "4. Metrik Dampak" saat ini sudah terpakai untuk statistik **capaian**, statistik **krisis** pada Blok A butuh wadah field tersendiri di tab "2. Narasi Realitas" — sarannya sebuah repeater kecil di bawah kolom narasi, misalnya "Statistik Realita Lapangan" (nilai + label + sumber), terpisah dari repeater "Metrik Capaian & Dampak" yang sudah ada. Lihat catatan implementasi di bagian akhir.
>
> **Penting — data ini bersifat dinamis:** Angka krisis kemanusiaan (Gaza, Yaman, Somalia, dll.) berubah cepat dan sering direvisi oleh lembaga sumber. Setiap angka di bawah ini dicantumkan sumber dan bulan rilisnya — sebaiknya dijadwalkan pengecekan ulang berkala (mis. tiap 1–3 bulan), bukan ditulis permanen sebagai teks statis di kode.

---

## 1. Ketahanan Pangan

### BLOK A — Realita & Urgensi Lapangan

**Judul Section:** *Kelaparan yang Tak Pernah Reda: Jutaan Jiwa di Ambang Krisis Pangan*

**Narasi:**
Kelaparan hari ini bukan lagi risiko masa depan — ia sedang terjadi, di banyak tempat sekaligus. Di Gaza, gencatan senjata memang meredakan kondisi kelaparan massal, tetapi krisis pangan jauh dari selesai: mayoritas penduduk masih terjebak dalam kerawanan pangan akut, dengan ratusan ribu anak menghadapi malnutrisi. Di Yaman, lebih dari satu dekade konflik dan anjloknya pendanaan kemanusiaan membuat separuh populasi berjuang mendapatkan makanan yang layak. Di Somalia, kekeringan berulang terus mendorong jutaan warga — terutama balita — ke ambang malnutrisi akut. Ketiganya menunjukkan pola yang sama: kelaparan bukan bencana alam semata, melainkan akumulasi dari konflik berkepanjangan, runtuhnya ekonomi rumah tangga, dan terputusnya bantuan kemanusiaan tepat saat dibutuhkan paling mendesak.

**Statistik Realita Lapangan:**
| Angka | Konteks | Sumber |
|---|---|---|
| ~1,2 juta jiwa (59% populasi) | Warga Gaza masih menghadapi kerawanan pangan Fase Krisis atau lebih buruk | IPC, Juli 2026 |
| ~100.000–132.000 anak | Balita di Gaza diperkirakan mengalami malnutrisi akut hingga pertengahan 2026 | IPC, Snapshot 2025–2026 |
| ±18 juta jiwa | Warga Yaman diproyeksikan menghadapi memburuknya kerawanan pangan awal 2026 | IRC, Jan 2026 |
| 49% populasi | Warga Yaman menghadapi kerawanan pangan akut per awal 2026 | UNICEF, 2026 |
| ~6,5 juta jiwa | Warga Somalia menghadapi tingkat kelaparan tinggi awal 2026, termasuk 1,8 juta anak berisiko malnutrisi akut | PBB/Pemerintah Somalia, Agu 2026 |

---

### BLOK B — Capaian Program Insani
**152 Program · 40.096 Penerima Manfaat** *(data internal Insani)*

**Judul Section:** *Hadir di Tengah Krisis: Ikhtiar Insani Menjawab Kelaparan*

**Narasi:**
Di tengah realita di atas, Insani hadir dengan dua pendekatan: penyediaan pangan langsung bagi yang membutuhkan hari ini, dan pembangunan infrastruktur pangan yang menopang ketahanan jangka panjang. Cakupan program membentang dari pelosok Nusantara hingga kantong-kantong krisis kemanusiaan dunia — Palestina, Suriah, Yaman, Rohingya, dan Somalia.

- **Bantuan Sembako — 123 Program · 33.269 Penerima Manfaat**: distribusi bahan pangan pokok sebagai lini pertama pertahanan melawan kerawanan pangan.
- **Bantuan Pangan Siap Santap — 29 Program · 6.827 Penerima Manfaat**: makanan siap konsumsi untuk kondisi darurat dan momentum ibadah.
- **Inovasi Agrikultur**: program rintisan pemberdayaan kemandirian produksi pangan tepat guna di lahan terbatas.

---

## 2. Ketersediaan Air

### BLOK A — Realita & Urgensi Lapangan

**Judul Section:** *Air yang Semakin Sulit Dijangkau*

**Narasi:**
Krisis air paling ekstrem hari ini terjadi di Gaza: hampir seluruh infrastruktur air dan sanitasi rusak atau hancur, memaksa mayoritas penduduk bergantung pada air kiriman truk yang pasokannya sendiri terancam terhenti. Sebagian keluarga bahkan hanya mendapat beberapa liter air per hari — jauh di bawah standar minimum kemanusiaan untuk minum dan memasak. Di Indonesia, meski akses air minum layak terus membaik secara nasional, kesenjangan antarwilayah masih tajam — rumah tangga di kawasan 3T (Tertinggal, Terdepan, Terluar) dan sejumlah provinsi seperti Papua masih jauh tertinggal dari rata-rata nasional dalam mengakses air bersih dan layak.

**Statistik Realita Lapangan:**
| Angka | Konteks | Sumber |
|---|---|---|
| ~90% | Infrastruktur air & sanitasi di Gaza rusak atau hancur | UNRWA, April 2026 |
| 4,5–6 liter/orang/hari | Rata-rata ketersediaan air di Gaza akhir Maret 2026 (standar darurat minimum WHO: 15 liter/orang/hari) | OCHA, Maret 2026 |
| >70% populasi | Warga Gaza bergantung pada air kiriman truk | OCHA, Juni 2026 |
| 93,71% | Rumah tangga Indonesia dengan akses air minum layak (nasional) | BPS, Statistik Perumahan 2026 |
| 66,49% | Akses air minum layak di Papua — provinsi dengan angka terendah se-Indonesia | BPS, Indikator Perumahan 2023 |

---

### BLOK B — Capaian Program Insani
**9 Program · 2.874 Penerima Manfaat** *(data internal Insani)*

**Judul Section:** *Menjembatani Kebutuhan Air, dari Sumur hingga Tangki*

**Narasi:**
Insani menyediakan akses air bersih melalui dua jalur: pembangunan infrastruktur permanen dan distribusi langsung untuk kebutuhan mendesak, menjangkau Gaza, Yaman, Afrika, Suriah, hingga wilayah krisis air di Nusantara.

- **Bantuan Infrastruktur Air — 1 Program · 100 Penerima Manfaat**: mesin penyulingan air, sumur, mobil tangki air, dan tempat wudhu di fasilitas keagamaan.
- **Distribusi Air — 8 Program · 2.774 Penerima Manfaat**: penyaluran air layak konsumsi ke wilayah krisis akut.

---

## 3. Kesehatan Bersama

### BLOK A — Realita & Urgensi Lapangan

**Judul Section:** *Sistem Kesehatan yang Nyaris Lumpuh*

**Narasi:**
Layanan kesehatan di sejumlah wilayah krisis kini berada di titik nyaris kolaps. Di Gaza, mayoritas fasilitas medis rusak atau hancur, hanya sebagian kecil rumah sakit yang masih bisa beroperasi — itu pun dengan kekurangan obat, alat, dan tenaga medis yang parah. Ribuan pasien yang butuh perawatan lanjutan tidak bisa dievakuasi ke luar Gaza, dan sebagian di antaranya meninggal saat menunggu. Di Yaman, hampir separuh fasilitas kesehatan hanya berfungsi sebagian atau sudah tidak beroperasi sama sekali — memutus akses layanan dasar bagi jutaan warga yang justru paling membutuhkannya di tengah krisis kemanusiaan yang berkepanjangan.

**Statistik Realita Lapangan:**
| Angka | Konteks | Sumber |
|---|---|---|
| 94% | Fasilitas medis di Gaza rusak atau mengalami kerusakan berat | PCBS, Maret 2026 |
| 26 dari 38 | Rumah sakit di Gaza tidak lagi beroperasi | Jaringan LSM Gaza, Sep 2026 |
| >18.500 pasien | Menunggu evakuasi medis dari Gaza, termasuk >4.000 anak; >1.000 meninggal saat menunggu | Parlemen Inggris (data WHO), Feb 2026 |
| 40% | Fasilitas kesehatan Yaman hanya berfungsi sebagian atau tidak beroperasi | UNICEF, awal 2026 |

---

### BLOK B — Capaian Program Insani
**16 Program · 750 Penerima Manfaat** *(data internal Insani)*

**Judul Section:** *Menjaga Denyut Layanan Kesehatan di Titik Krisis*

**Narasi:**
Insani mengupayakan pemenuhan hak sehat melalui tiga pilar: layanan kesehatan yang menjangkau langsung masyarakat, bantuan pengobatan dan alat kesehatan, serta infrastruktur kesehatan — menjangkau Nusantara hingga Gaza, Yaman, Suriah, Afrika, dan Rohingya.

- **Layanan Kesehatan — 6 Program · 206 Penerima Manfaat**: ambulans gratis, donor darah, medical check up, fogging, dan penyemprotan disinfektan.
- **Bantuan Kesehatan — 10 Program · 544 Penerima Manfaat**: pengobatan dan alat kesehatan bagi yang tidak memiliki akses memadai.
- **Infrastruktur Kesehatan**: pembangunan sarana kesehatan permanen, termasuk armada ambulans.

---

## 4. Pendidikan Berkualitas

### BLOK A — Realita & Urgensi Lapangan

**Judul Section:** *Generasi yang Kehilangan Ruang Kelas*

**Narasi:**
Bagi ratusan ribu anak di Gaza, tahun ajaran baru kini identik dengan tenda, bukan ruang kelas. Hampir seluruh bangunan sekolah rusak atau hancur setelah bertahun-tahun konflik, memaksa proses belajar berpindah ke tenda darurat, pusat belajar sementara, atau berhenti sama sekali bagi sebagian anak. Ini bukan sekadar kehilangan satu tahun ajaran — ini adalah generasi yang kehilangan jalur normal menuju masa depan: dari sekolah ke perguruan tinggi, pelatihan kerja, atau dunia kerja. Semakin lama gangguan pendidikan berlangsung, semakin besar pula dampaknya yang sulit dipulihkan pada perkembangan dan peluang hidup anak-anak tersebut.

**Statistik Realita Lapangan:**
| Angka | Konteks | Sumber |
|---|---|---|
| 97,5% | Sekolah di Gaza rusak atau hancur | UNICEF, 2026 |
| ~658.000–700.000 anak | Usia sekolah di Gaza kehilangan akses pendidikan formal | UNICEF/Save the Children, 2026 |
| Hanya ~39% | Anak usia sekolah & TK di Gaza yang tercatat di ruang belajar sementara (Maret 2026) | OCHA, 2026 |
| >834.000 anak | Usia sekolah di Tepi Barat tanpa akses pendidikan aman & berkualitas | Education Cluster, Sep 2026 |

---

### BLOK B — Capaian Program Insani
**333 Program · 17.333 Penerima Manfaat** *(data internal Insani)*

**Judul Section:** *Menjaga Nyala Harapan Lewat Pendidikan*

**Narasi:**
Insani meyakini pendidikan sebagai jalan paling berkelanjutan keluar dari kemiskinan — pendekatannya menyeluruh: bantuan langsung bagi siswa dan pendidik, penyelenggaraan pendidikan bagi kelompok yang terpinggirkan dari sistem formal, serta pembangunan infrastruktur belajar.

- **Bantuan Pendidikan — 24 Program · 991 Penerima Manfaat**: beasiswa anak yatim, santri, penghafal Qur'an, siswa berprestasi, hingga insentif guru honorer dan guru ngaji.
- **Penyelenggaraan Program Pendidikan — 299 Program · 14.947 Penerima Manfaat**: pendidikan anak jalanan usia dini, anak di area lokalisasi, dan gerakan relawan mengajar.
- **Infrastruktur Pendidikan — 10 Program · 1.395 Penerima Manfaat**: masjid, rumah tahfidz, bangunan sekolah, dan pesantren.

---

## 5. Pemberdayaan Ekonomi

### BLOK A — Realita & Urgensi Lapangan

**Judul Section:** *Jurang Ekonomi yang Masih Menganga*

**Narasi:**
Di Nusantara, kemiskinan bukan sekadar angka di atas kertas — ia menentukan siapa yang bisa menyekolahkan anak, berobat, atau sekadar makan layak hari ini. Meski angka kemiskinan versi pemerintah menunjukkan tren membaik, standar kemiskinan internasional yang disesuaikan untuk negara berpendapatan menengah-atas menunjukkan potret yang jauh lebih luas: mayoritas penduduk Indonesia masih berada dalam rentang rentan secara ekonomi. Di wilayah krisis kemanusiaan seperti Gaza, kehancuran ekonomi bahkan lebih ekstrem — nyaris seluruh angkatan kerja kehilangan mata pencaharian akibat konflik berkepanjangan, membuat pemberdayaan ekonomi bukan sekadar program bantuan, melainkan syarat mutlak pemulihan jangka panjang.

**Statistik Realita Lapangan:**
| Angka | Konteks | Sumber |
|---|---|---|
| 8,07% | Tingkat kemiskinan nasional Indonesia (garis kemiskinan BPS) | BPS, Maret 2026 |
| 64,1% | Penduduk Indonesia di bawah garis kemiskinan standar internasional (US$8,30/hari, utk negara berpendapatan menengah-atas) | BPS & Bank Dunia, Sep 2026 |
| ~80% | Tingkat pengangguran di Gaza pasca-konflik berkepanjangan | PCBS, 2026 |

---

### BLOK B — Capaian Program Insani
**4 Program · 32 Penerima Manfaat** *(data internal Insani)*

**Judul Section:** *Dari Bergantung Menjadi Berdaya*

**Narasi:**
Insani mengangkat sosio-ekonomi masyarakat lapisan bawah melalui tiga tahap yang saling menyambung: pelatihan keterampilan, permodalan usaha, dan pendampingan berkelanjutan.

- **Program Pelatihan**: pembekalan keterampilan usaha mikro, menjahit, desain, dan sablon.
- **Bantuan Pemodalan — 3 Program · 17 Penerima Manfaat**: modal usaha gerobak, warung kelontong, hingga ternak.
- **Program Pendampingan — 1 Program · 15 Penerima Manfaat**: pendampingan pasca-pemodalan agar usaha benar-benar naik kelas.

---

## 6. Tanggap Bencana

### BLOK A — Realita & Urgensi Lapangan

**Judul Section:** *Negeri Rawan Bencana, Dunia yang Terus Bergejolak*

**Narasi:**
Indonesia adalah salah satu negara paling rawan bencana di dunia — bukan isu sesekali, melainkan realita yang berulang setiap tahun: ribuan kejadian banjir, tanah longsor, cuaca ekstrem, kebakaran hutan dan lahan, hingga gempa bumi, dengan ratusan ribu jiwa terdampak dan mengungsi setiap tahunnya. Pada saat yang sama, krisis kemanusiaan akibat konflik di Gaza dan Yaman terus memproduksi gelombang pengungsian baru — puluhan hingga ratusan ribu orang, termasuk anak-anak, terpaksa meninggalkan rumah mereka hanya dalam hitungan minggu. Dua wajah bencana ini — alam dan kemanusiaan — sama-sama menuntut kesiapan merespons cepat sekaligus komitmen jangka panjang untuk memulihkan kehidupan korban.

**Statistik Realita Lapangan:**
| Angka | Konteks | Sumber |
|---|---|---|
| 2.606 kejadian | Bencana alam di Indonesia (1 Jan–19 Okt 2025), didominasi banjir, cuaca ekstrem, karhutla | BNPB, Okt 2025 |
| 1.134 kejadian | Bencana di Indonesia sepanjang Semester I 2026 | BNPB, Jul 2026 |
| 253.601 jiwa | Korban terdampak & mengungsi akibat bencana di Indonesia dalam satu bulan (Mei 2026) | BNPB, Buletin Info Bencana Mei 2026 |
| 71.000 anak | Anak-anak di Yaman mengungsi akibat eskalasi konflik | UNICEF, Sep 2026 |
| 104.000 jiwa | Warga Yaman mengungsi hanya dalam 2 minggu akibat pertempuran (termasuk >57.000 anak) | UNICEF, Sep 2026 |

---

### BLOK B — Capaian Program Insani
**37 Program · 13.862 Penerima Manfaat** *(data internal Insani)*

**Judul Section:** *Siaga, Hadir, dan Tak Berhenti di Titik Darurat*

**Narasi:**
Insani membangun fokus Tanggap Bencana sebagai satu siklus utuh: siaga sebelum bencana datang, darurat saat bencana terjadi, dan pemulihan jauh setelah sorotan publik meredup.

- **Siaga Bencana**: penguatan kapasitas relawan, kesiapan peralatan tanggap darurat, dan mitigasi lingkungan jangka panjang — investasi kesiapsiagaan yang menentukan seberapa besar dampak bencana di kemudian hari.
- **Darurat Bencana — 27 Program · 12.955 Penerima Manfaat**: SAR, dapur darurat, bantuan logistik korban, posko bencana, bantuan musim dingin bagi pengungsi.
- **Pemulihan Bencana — 10 Program · 907 Penerima Manfaat**: trauma healing, HUNTARA, shelter pengungsian, pemulihan ekonomi pasca-bencana.

---

## Catatan Implementasi CMS

1. **Struktur field yang disarankan** pada tab "2. Narasi Realitas":
   - Judul Section Realitas/Krisis *(sudah ada)*
   - Narasi Kondisi Lapangan *(sudah ada — isi dengan Blok A di atas, bukan Blok B)*
   - **[BARU]** Repeater "Statistik Realita Lapangan": Nilai/Angka, Label/Konteks, Sumber, Bulan/Tahun Data — terpisah dari repeater "Metrik Capaian & Dampak" di tab 4 yang tetap dipakai untuk Blok B.
2. **Tab "4. Metrik Dampak"** tidak berubah — tetap diisi statistik capaian internal Insani (Blok B), seperti sebelumnya.
3. **Frekuensi update data krisis**: berbeda dari statistik capaian (yang diperbarui dari sistem internal), statistik Blok A bersumber dari lembaga eksternal (IPC, UNICEF, UNRWA, BNPB, BPS, dll.) yang merilis data secara berkala — disarankan ada pengingat/jadwal review konten (mis. triwulanan) agar angka tidak basi, plus kolom "Sumber" ditampilkan kecil di UI publik untuk kredibilitas dan transparansi data.
4. **Rohingya**: pada draf ini belum ada statistik krisis spesifik dan terverifikasi untuk Rohingya per fokus (khususnya pangan) — perlu riset tambahan sebelum dipublikasikan jika fokus tersebut ingin menonjolkan angka spesifik Rohingya.
5. **Keterkaitan ke CTA campaign**: setiap Blok A di atas dirancang agar bisa langsung "diturunkan" jadi campaign galang dana spesifik — misalnya statistik krisis pangan Gaza/Yaman bisa jadi pembuka narasi campaign "Bantuan Sembako Yaman", statistik sekolah rusak Gaza untuk campaign pendidikan, dst.
