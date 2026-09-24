<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            // ==================== DONATUR ====================
            [
                'question' => 'Bagaimana cara berdonasi di Insani Indonesia?',
                'answer_html' => '<p>Berdonasi di Insani Indonesia sangat praktis dan aman:</p><ol><li>Buka katalog <strong>Program Donasi</strong> dan pilih kampanye yang ingin Anda bantu.</li><li>Klik tombol <strong>"Donasi Sekarang"</strong> pada halaman kampanye.</li><li>Tentukan nominal donasi (minimal Rp 10.000).</li><li>Masukkan nama, email, dan nomor WhatsApp, atau centang <em>"Sembunyikan Nama Saya (Anonim)"</em> jika ingin berdonasi sebagai Hamba Allah.</li><li>Pilih metode pembayaran otomatis (QRIS, VA Bank, E-Wallet) atau transfer manual bank (BSI / BRI).</li><li>Selesaikan pembayaran sesuai instruksi.</li></ol>',
                'category' => 'donatur',
                'keywords' => 'cara donasi, langkah donasi, metode pembayaran, qris, transfer, virtual account',
                'sort_order' => 1,
            ],
            [
                'question' => 'Apakah saya bisa berdonasi tanpa mendaftar akun terlebih dahulu (Guest Donatur)?',
                'answer_html' => '<p><strong>Ya, tentu saja!</strong> Anda dapat langsung berdonasi sebagai donatur tamu (guest) tanpa perlu registrasi atau login akun.</p><p>Cukup cantumkan alamat email dan nomor WhatsApp aktif Anda. Sistem kami akan secara otomatis mengirimkan rincian pembayaran, notifikasi penerimaan donasi, serta tautan kuitansi resmi ke kontak Anda.</p>',
                'category' => 'donatur',
                'keywords' => 'guest, tanpa akun, tanpa login, tamu, langsung donasi',
                'sort_order' => 2,
            ],
            [
                'question' => 'Apa fungsi opsi "Sembunyikan Nama Saya (Anonim)"?',
                'answer_html' => '<p>Jika Anda mencentang opsi anonim saat melakukan donasi, nama Anda tidak akan pernah ditampilkan di daftar donatur publik halaman program. Sistem akan menampilkan donasi Anda sebagai <strong>"Hamba Allah"</strong>.</p><p>Identitas asli Anda tetap tersimpan secara aman dan terenkripsi di sistem internal kami hanya untuk keperluan verifikasi pembayaran dan audit keuangan resmi sesuai ketentuan perbankan.</p>',
                'category' => 'donatur',
                'keywords' => 'anonim, sembunyikan nama, hamba allah, privasi nama, rahasia',
                'sort_order' => 3,
            ],
            [
                'question' => 'Bagaimana cara mengecek status donasi dan mengunduh kuitansi resmi jika saya donatur tamu?',
                'answer_html' => '<p>Setiap transaksi donasi akan memiliki <strong>Kode Donasi Unik</strong> (contoh: <code>DON-XXXXXXXXXX</code>) yang dikirimkan ke email atau layar sukses donasi Anda:</p><ul><li>Kunjungi halaman <strong>Cek Status Donasi</strong> (/cek-donasi).</li><li>Masukkan kode donasi atau alamat email Anda.</li><li>Jika donasi telah berstatus <strong>Lunas (Paid)</strong>, Anda dapat langsung mengunduh dan mencetak <strong>Kuitansi Resmi Elektronik (E-Receipt)</strong> resmi ber-QR Code validasi keabsahan yayasan.</li></ul>',
                'category' => 'donatur',
                'keywords' => 'cek status, kuitansi, receipt, kode donasi, bukti donasi, download kuitansi',
                'sort_order' => 4,
            ],
            [
                'question' => 'Apa perbedaan metode pembayaran otomatis dan transfer manual bank?',
                'answer_html' => '<ul><li><strong>Pembayaran Otomatis (QRIS, Virtual Account, E-Wallet):</strong> Donasi diverifikasi secara <em>real-time</em> oleh payment gateway berlisensi Bank Indonesia (Xendit). Donasi terkonfirmasi lunas dalam beberapa detik tanpa perlu mengirimkan bukti transfer.</li><li><strong>Transfer Manual Bank (BSI & BRI Giro):</strong> Anda mentransfer dana langsung ke rekening giro resmi yayasan. Setelah transfer, Anda <strong>wajib mengonfirmasi</strong> dengan mengirimkan foto/screenshot bukti transfer ke WhatsApp Customer Service kami agar admin keuangan memverifikasinya.</li></ul>',
                'category' => 'donatur',
                'keywords' => 'otomatis, manual, verifikasi otomatis, konfirmasi manual, xendit, qris',
                'sort_order' => 5,
            ],
            [
                'question' => 'Jika saat ini saya berdonasi sebagai tamu, apakah riwayatnya tersimpan jika kelak saya membuat akun?',
                'answer_html' => '<p><strong>Ya, otomatis tersinkronisasi!</strong></p><p>Sistem Insani Indonesia melacak donasi berdasarkan alamat email Anda. Begitu Anda mendaftar akun dengan alamat email yang sama dengan yang pernah Anda gunakan saat berdonasi sebagai tamu, seluruh riwayat donasi terdahulu akan langsung muncul di halaman <strong>Riwayat Donasi Saya</strong> di dasbor akun Anda.</p>',
                'category' => 'donatur',
                'keywords' => 'sinkronisasi, riwayat donasi, daftar akun, email sama, history',
                'sort_order' => 6,
            ],
            [
                'question' => 'Apa keuntungan membuat akun dan login sebagai Donatur di Insani Indonesia?',
                'answer_html' => '<p>Dengan memiliki akun donatur terdaftar, Anda dapat:</p><ul><li>Memantau akumulasi total donasi kebaikan yang telah Anda salurkan di dasbor pribadi.</li><li>Mengunduh kembali seluruh arsip kuitansi resmi kapan saja (sangat berguna untuk pelaporan zakat atau pajak).</li><li>Mendapatkan notifikasi laporan penyaluran (<em>Kabar Terbaru</em>) langsung dari program yang Anda dukung.</li><li>Dapat langsung mendaftar sebagai <strong>Fundraiser (Relawan Kampanye)</strong> untuk melipatgandakan dampak kebaikan.</li></ul>',
                'category' => 'donatur',
                'keywords' => 'keuntungan akun, member, manfaat akun, dasbor donatur, sertifikat',
                'sort_order' => 7,
            ],

            // ==================== CAMPAIGNER ====================
            [
                'question' => 'Apa itu Campaigner di Insani Indonesia?',
                'answer_html' => '<p><strong>Campaigner</strong> adalah individu, komunitas, lembaga sosial, atau yayasan terverifikasi yang dipercaya untuk menginisiasi dan mengelola kampanye penggalangan dana di platform Insani Indonesia.</p><p>Campaigner bertanggung jawab penuh atas kebenaran informasi program dan penyaluran amanah dana donasi kepada para penerima manfaat.</p>',
                'category' => 'campaigner',
                'keywords' => 'campaigner, penggalang dana, buat kampanye, inisiasi program',
                'sort_order' => 8,
            ],
            [
                'question' => 'Apa perbedaan syarat verifikasi Campaigner Individu vs Lembaga/Yayasan (KYC)?',
                'answer_html' => '<p>Untuk melindungi donatur dari potensi penipuan, seluruh calon campaigner wajib lolos verifikasi identitas (KYC):</p><p><strong>Campaigner Individu:</strong> Foto e-KTP asli, foto selfie memegang e-KTP, rekening bank atas nama pribadi sesuai e-KTP, dan domisili jelas.</p><p><strong>Campaigner Lembaga / Yayasan:</strong> SK Kemenkumham / Izin Lembaga resmi, NPWP Lembaga, rekening koran/bank atas nama Lembaga (bukan pribadi), dan KTP penanggung jawab resmi.</p>',
                'category' => 'campaigner',
                'keywords' => 'kyc, verifikasi, syarat campaigner, dokumen kyc, ktp, sk kemenkumham, npwp',
                'sort_order' => 9,
            ],
            [
                'question' => 'Berapa lama proses verifikasi akun Campaigner (KYC)?',
                'answer_html' => '<p>Tim verifikasi Insani Indonesia memeriksa keabsahan dokumen KYC dalam waktu <strong>1 x 24 jam hingga maksimal 2 x 24 jam kerja</strong> (Senin - Jumat).</p><p>Pemberitahuan hasil verifikasi (Disetujui / Butuh Revisi / Ditolak) akan dikirimkan via email dan dapat dicek langsung pada menu status akun Anda.</p>',
                'category' => 'campaigner',
                'keywords' => 'lama verifikasi, durasi kyc, review kyc, berapa hari',
                'sort_order' => 10,
            ],
            [
                'question' => 'Bagaimana alur pengajuan program baru hingga tayang di website?',
                'answer_html' => '<p>Alur penerbitan program donasi terdiri dari 4 langkah:</p><ol><li><strong>Buat Program (Draft):</strong> Isi data kampanye, target donasi, batas waktu, foto utama, dan narasi cerita.</li><li><strong>Kirim untuk Kurasi (Pending Review):</strong> Program masuk ke tim kurator Insani Indonesia untuk verifikasi kelayakan.</li><li><strong>Persetujuan (Approved):</strong> Jika dokumen dan cerita valid, admin akan menyetujui program.</li><li><strong>Tayang (Published):</strong> Program mulai aktif menerima donasi dari publik luas.</li></ol>',
                'category' => 'campaigner',
                'keywords' => 'buat program, alur kurasi, pending review, published, approval',
                'sort_order' => 11,
            ],
            [
                'question' => 'Bagaimana mekanisme dan syarat pencairan dana (Disbursement)?',
                'answer_html' => '<p>Campaigner dapat mengajukan pencairan donasi yang telah terkumpul melalui menu Pencairan Dana di dasbor program dengan ketentuan:</p><ul><li>Nominal pencairan minimal adalah <strong>Rp 10.000</strong> dan tidak melebihi sisa saldo bersih donasi yang tersedia.</li><li>Pencairan hanya ditransfer ke <strong>rekening bank terdaftar yang telah lolos verifikasi KYC</strong>.</li><li>Proses transfer perbankan memerlukan waktu 1–3 hari kerja setelah permohonan disetujui tim finance.</li></ul>',
                'category' => 'campaigner',
                'keywords' => 'pencairan dana, disbursement, tarik dana, syarat pencairan, minimal pencairan',
                'sort_order' => 12,
            ],
            [
                'question' => 'Berapa biaya operasional platform yang dikenakan pada program?',
                'answer_html' => '<p>Insani Indonesia beroperasi secara transparan sesuai UU No. 9 Tahun 1961 dan ketentuan Kementerian Sosial RI:</p><ul><li>Maksimal <strong>10%</strong> untuk program sosial, kemanusiaan umum, dan kesehatan sebagai biaya operasional platform dan pemeliharaan teknologi.</li><li><strong>0% (bebas potongan platform)</strong> untuk program tanggap bencana alam darurat tertentu.</li><li>Biaya administrasi pihak ketiga (payment gateway seperti perbankan/QRIS) dipotong sesuai tarif standar resmi Bank Indonesia.</li></ul>',
                'category' => 'campaigner',
                'keywords' => 'biaya operasional, potongan platform, fee, persentase potongan, uu 9 1961',
                'sort_order' => 13,
            ],
            [
                'question' => 'Mengapa Campaigner wajib memposting "Kabar Terbaru" secara berkala?',
                'answer_html' => '<p>Setiap Campaigner memegang amanah dari para donatur. Oleh karena itu, Campaigner <strong>wajib mengunggah dokumentasi dan cerita realisasi penyaluran dana</strong> melalui fitur "Kabar Terbaru".</p><p>Pembaruan ini akan langsung dikirimkan ke email seluruh donatur program tersebut. Akun campaigner yang lalai membuat laporan pertanggungjawaban dapat ditangguhkan pencairan dananya demi menjaga integritas platform.</p>',
                'category' => 'campaigner',
                'keywords' => 'kabar terbaru, update program, laporan penyaluran, transparansi, tanggung jawab',
                'sort_order' => 14,
            ],

            // ==================== FUNDRAISER ====================
            [
                'question' => 'Apa itu fitur Fundraiser di Insani Indonesia?',
                'answer_html' => '<p><strong>Fundraiser</strong> adalah relawan kebaikan yang membantu menyebarluaskan sebuah program donasi yang sudah tayang di Insani Indonesia kepada keluarga, teman, atau komunitasnya.</p><p>Anda tidak perlu mengunggah dokumen lembaga atau membuat program sendiri; cukup pilih program yang Anda pedulikan, buat tautan referral khusus, dan ajak orang lain berdonasi melalui link Anda.</p>',
                'category' => 'fundraiser',
                'keywords' => 'fundraiser, relawan kampanye, ajak donasi, link referral, duta kebaikan',
                'sort_order' => 15,
            ],
            [
                'question' => 'Siapa saja yang bisa menjadi Fundraiser?',
                'answer_html' => '<p><strong>Semua pengguna terdaftar di Insani Indonesia</strong> dapat menjadi Fundraiser secara gratis! Cukup buat akun dan login, lalu buka program donasi apa pun yang ingin Anda dukung.</p>',
                'category' => 'fundraiser',
                'keywords' => 'siapa fundraiser, syarat fundraiser, daftar fundraiser',
                'sort_order' => 16,
            ],
            [
                'question' => 'Bagaimana cara mendaftar dan menyebarkan program sebagai Fundraiser?',
                'answer_html' => '<ol><li>Buka halaman program donasi di katalog <strong>Program Insani</strong>.</li><li>Pastikan Anda sudah login, lalu klik tombol <strong>"Jadi Fundraiser"</strong>.</li><li>Tentukan target donasi yang ingin Anda bantu himpun serta tuliskan pesan ajakan kebaikan Anda.</li><li>Sistem akan membuat <strong>Link Referral Khusus</strong> (contoh: <code>https://insani.id/program/bantu-yatim?ref=nama-anda-1234</code>).</li><li>Bagikan link tersebut ke WhatsApp, Instagram, Telegram, atau media sosial lainnya.</li></ol>',
                'category' => 'fundraiser',
                'keywords' => 'cara jadi fundraiser, buat link referral, bagikan program, ref code',
                'sort_order' => 17,
            ],
            [
                'question' => 'Di mana saya bisa memantau perolehan donasi yang berhasil saya himpun?',
                'answer_html' => '<p>Setiap donasi yang masuk melalui tautan referral Anda akan terlacak otomatis secara <em>real-time</em>. Anda dapat memantau total dana terkumpul, jumlah donatur yang tergerak, serta daftar kampanye aktif melalui halaman <strong>Dasbor Fundraiser Saya</strong>.</p>',
                'category' => 'fundraiser',
                'keywords' => 'pantau donasi, statistik fundraiser, dasbor fundraiser, akun fundraiser',
                'sort_order' => 18,
            ],
            [
                'question' => 'Apakah Fundraiser mendapatkan komisi atau imbalan uang?',
                'answer_html' => '<p>Program Fundraiser di Insani Indonesia adalah <strong>gerakan kerelawanan sosial murni (non-profit)</strong>. 100% dana yang terkumpul disalurkan untuk program sosial yang Anda bantu.</p><p>Insani Indonesia memberikan apresiasi dalam bentuk lencana relawan profil serta sertifikat digital apresiasi kebaikan di dasbor akun Anda.</p>',
                'category' => 'fundraiser',
                'keywords' => 'komisi, gaji, insentif, uang fundraiser, sukarela',
                'sort_order' => 19,
            ],

            // ==================== KEAMANAN & LEGALITAS ====================
            [
                'question' => 'Apakah Yayasan Peduli Insani Indonesia memiliki izin resmi dan berbadan hukum?',
                'answer_html' => '<p><strong>Ya, resmi dan berbadan hukum sah.</strong></p><p>Yayasan Peduli Insani Indonesia didirikan pada 13 Februari 2019 dan telah disahkan oleh Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia melalui Surat Keputusan: <strong>SK-KUMHAM : AHU-0002557.AH.01.04.Tahun 2019</strong>.</p><p>Aktivitas penggalangan donasi dan penyaluran bantuan berpedoman pada UU Nomor 9 Tahun 1961 dan Peraturan Pemerintah Nomor 29 Tahun 1980.</p>',
                'category' => 'keamanan',
                'keywords' => 'legalitas, badan hukum, sk kemenkumham, izin resmi, ahu, kemenkumham',
                'sort_order' => 20,
            ],
            [
                'question' => 'Bagaimana Insani Indonesia melindungi privasi dan data pribadi pengguna?',
                'answer_html' => '<p>Kami mematuhi <strong>UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>:</p><ul><li>Seluruh data dienkripsi dengan protokol SSL/HTTPS 256-bit standar industri perbankan.</li><li>Kami <strong>tidak pernah memperjualbelikan</strong> data nomor kontak, email, atau identitas donatur kepada pihak mana pun.</li><li>Data sensitif perbankan diproses langsung oleh payment gateway resmi Bank Indonesia tanpa disimpan di server kami.</li><li>Baca ketentuan lengkapnya di halaman Kebijakan Privasi.</li></ul>',
                'category' => 'keamanan',
                'keywords' => 'keamanan data, uu pdp, privasi, enkripsi, ssl, bocor data',
                'sort_order' => 21,
            ],
            [
                'question' => 'Bagaimana jika saya menemukan program donasi yang mencurigakan atau indikasi penipuan?',
                'answer_html' => '<p>Insani Indonesia menerapkan <strong>zero tolerance</strong> terhadap rekayasa informasi dan penipuan donasi.</p><p>Jika Anda mencurigai adanya program fiktif atau penyalahgunaan dana, segera kirimkan bukti tangkapan layar dan rincian ke email <strong>sapa@insani.id</strong> atau WhatsApp Layanan Pengaduan Resmi kami. Tim kepatuhan kami akan segera menginvestigasi dan membekukan kampanye tersebut bila terbukti melanggar.</p>',
                'category' => 'keamanan',
                'keywords' => 'lapor penipuan, fraud, mencurigakan, pengaduan, whistleblower',
                'sort_order' => 22,
            ],
            [
                'question' => 'Apakah donasi yang sudah dibayarkan dapat dibatalkan atau dikembalikan (Refund)?',
                'answer_html' => '<p>Sesuai dengan Syarat dan Ketentuan, setiap donasi yang telah sukses bersifat <strong>sukarela, final, dan tidak dapat dibatalkan (non-refundable)</strong> karena dana langsung dialokasikan untuk kebutuhan penerima manfaat.</p><p>Pengembalian dana hanya dipertimbangkan jika terjadi kekeliruan sistem perbankan seperti pendebetan ganda yang disertai bukti sah mutasi rekening.</p>',
                'category' => 'keamanan',
                'keywords' => 'refund, batal donasi, tarik uang donasi, pengembalian dana',
                'sort_order' => 23,
            ],

            // ==================== LEMBAGA (TENTANG KAMI) ====================
            [
                'question' => 'Apa visi dan fokus pergerakan kemanusiaan Insani Indonesia?',
                'answer_html' => '<p><strong>Insani Indonesia</strong> (Yayasan Peduli Insani Indonesia) merupakan lembaga nirlaba independen yang berfokus pada penanganan krisis kemanusiaan, pemberdayaan masyarakat, pendidikan generasi bangsa, dan bantuan kebencanaan.</p><p>Visi utama kami adalah menjadi pelopor kolaborasi kebaikan lintas batas demi mewujudkan masyarakat yang berdaya, mandiri, dan sejahtera dalam naungan nilai-nilai kemanusiaan yang universal.</p>',
                'category' => 'lembaga',
                'keywords' => 'visi, profil, latar belakang, fokus gerakan, kemanusiaan',
                'sort_order' => 1,
            ],
            [
                'question' => 'Apakah Insani Indonesia memiliki legalitas dan izin resmi dari pemerintah?',
                'answer_html' => '<p><strong>Ya, sah dan berizin resmi.</strong></p><p>Insani Indonesia didirikan pada 13 Februari 2019 dan telah mengantongi pengesahan badan hukum dari Kementerian Hukum dan HAM Republik Indonesia No. <strong>AHU-0002557.AH.01.04.Tahun 2019</strong>, izin operasional kegiatan sosial terdaftar, serta NPWP resmi lembaga.</p>',
                'category' => 'lembaga',
                'keywords' => 'legalitas, sk kemenkumham, izin resmi, badan hukum, akta yayasan',
                'sort_order' => 2,
            ],
            [
                'question' => 'Ke mana saja jangkauan wilayah penyaluran bantuan Insani Indonesia?',
                'answer_html' => '<p>Insani Indonesia menyalurkan bantuan kemanusiaan ke berbagai pelosok Indonesia (Jabodetabek, Jawa, Banten, Sumatera, Kalimantan, Sulawesi, hingga kawasan 3T di Indonesia Timur) serta respons solidaritas darurat internasional untuk negara-negara yang dilanda krisis kemanusiaan seperti Palestina, Suriah, dan Yaman melalui jejaring mitra kemanusiaan terpercaya.</p>',
                'category' => 'lembaga',
                'keywords' => 'wilayah penyaluran, jangkauan bantuan, palestina, darurat bencana, daerah 3t',
                'sort_order' => 3,
            ],
            [
                'question' => 'Bagaimana prinsip transparansi dan akuntabilitas pengelolaan dana yayasan?',
                'answer_html' => '<p>Setiap amanah donasi dikelola dengan prinsip tata kelola yang baik (<em>Good Governance</em>):</p><ul><li>Donasi diverifikasi secara sistemik dengan pencatatan pembukuan digital.</li><li>Laporan berkala penyaluran program dipublikasikan secara terbuka melalui menu <strong>Kabar Terbaru</strong> di halaman masing-masing program.</li><li>Donatur dapat mengunduh <strong>Kuitansi Resmi Elektronik</strong> sah yang dilengkapi kode verifikasi unik.</li><li>Laporan keuangan yayasan diaudit secara berkala untuk menjamin integritas penggunaan dana.</li></ul>',
                'category' => 'lembaga',
                'keywords' => 'transparansi, akuntabilitas, audit, laporan penyaluran, amanah',
                'sort_order' => 4,
            ],

            // ==================== KONTAK (LAYANAN & NARAHUBUNG) ====================
            [
                'question' => [
                    'id' => 'Berapa lama estimasi waktu respon layanan customer service Insani Indonesia?',
                    'en' => 'How long is the estimated response time for Insani Indonesia customer service?',
                    'ar' => 'ما هو الوقت المتوقع للرد على استفسارات خدمة العملاء في إنساني إندونيسيا؟',
                ],
                'answer_html' => [
                    'id' => '<p>Layanan komunikasi dan customer service kami merespons pesan WhatsApp dan email pada jam operasional kantor: <strong>Senin s.d. Jum\'at, pukul 10.00 – 18.00 WIB</strong>.</p><p>Pesan yang masuk pada jam kerja umumnya dibalas dalam waktu <strong>15–30 menit</strong>. Pesan yang dikirimkan di luar jam kerja, tanggal merah, atau hari libur nasional akan direspons pada hari kerja berikutnya.</p>',
                    'en' => '<p>Our communication and customer service team responds to WhatsApp messages and emails during office hours: <strong>Monday to Friday, 10:00 – 18:00 WIB</strong>.</p><p>Messages received during business hours are generally replied to within <strong>15–30 minutes</strong>. Messages sent outside office hours, on public holidays, or collective leave will be answered on the next business day.</p>',
                    'ar' => '<p>يقوم فريق التواصل وخدمة العملاء بالرد على رسائل الواتساب والبريد الإلكتروني خلال ساعات العمل الرسمية: <strong>من الإثنين إلى الجمعة، 10:00 – 18:00 بتوقيت إندونيسيا</strong>.</p><p>عادةً ما يتم الرد على الرسائل الواردة خلال ساعات العمل خلال <strong>15–30 دقيقة</strong>. أما الرسائل المرسلة خارج أوقات العمل أو في العطلات الرسمية فسيتم الرد عليها في يوم العمل التالي.</p>',
                ],
                'category' => 'kontak',
                'keywords' => 'respon cs, jam kerja, respon whatsapp, waktu operasional, hari libur',
                'sort_order' => 1,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana cara mengonfirmasi donasi jika saya transfer melalui rekening bank manual?',
                    'en' => 'How do I confirm my donation if I transfer via manual bank transfer?',
                    'ar' => 'كيف يمكنني تأكيد التبرع في حال التحويل المصرفي اليدوي؟',
                ],
                'answer_html' => [
                    'id' => '<p>Jika Anda memilih metode <strong>Transfer Manual Bank (BSI / BRI)</strong> saat berdonasi, silakan kirimkan foto atau screenshot bukti mutasi transfer ke nomor WhatsApp <strong>Konfirmasi Donasi</strong> kami dengan mencantumkan <strong>Kode Donasi</strong> Anda. Tim admin keuangan kami akan segera memverifikasi dan mengubah status donasi menjadi <em>Lunas</em> sehingga kuitansi resmi Anda terbit.</p>',
                    'en' => '<p>If you choose the <strong>Manual Bank Transfer (BSI / BRI)</strong> method when donating, please send a photo or screenshot of your transfer proof to our <strong>Donation Confirmation</strong> WhatsApp number along with your <strong>Donation Code</strong>. Our finance admin team will promptly verify and update the donation status to <em>Paid</em> so your official electronic receipt can be issued.</p>',
                    'ar' => '<p>إذا اخترت طريقة <strong>التحويل البنكي اليدوي (BSI / BRI)</strong> عند التبرع، يُرجى إرسال صورة أو لقطة شاشة لإشعار التحويل إلى رقم واتساب <strong>تأكيد التبرع</strong> مع إرفاق <strong>رمز التبرع</strong> الخاص بك. سيقوم فريق الإدارة المالية بالتحقق وتحديث حالة التبرع إلى <em>مدفوع</em> حتى يتم إصدار إيصالك الرسمي.</p>',
                ],
                'category' => 'kontak',
                'keywords' => 'konfirmasi donasi, transfer manual, bukti transfer, whatsapp finance, verifikasi donasi',
                'sort_order' => 2,
            ],
            [
                'question' => [
                    'id' => 'Apakah kami dapat berkunjung atau beraudiensi langsung ke kantor yayasan?',
                    'en' => 'Can we visit or have a direct audience at the foundation office?',
                    'ar' => 'هل يمكننا زيارة مقر المؤسسة أو عقد جلسة تواصل مباشرة؟',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Tentu, kami menyambut hangat silaturahmi Anda.</strong></p><p>Untuk memastikan tim pimpinan atau divisi terkait berada di tempat, mohon untuk mengajukan janji temu (audiensi) terlebih dahulu minimal <strong>2 hari kerja sebelum jadwal kunjungan</strong> dengan menghubungi narahubung kami atau mengirimkan surat permohonan ke alamat email kantor.</p>',
                    'en' => '<p><strong>Certainly, we warmly welcome your visit.</strong></p><p>To ensure that the leadership team or relevant department is available, please request an appointment at least <strong>2 business days prior to your visit</strong> by contacting our liaison or sending a request letter to our office email address.</p>',
                    'ar' => '<p><strong>بالتأكيد، نرحب بزيارتكم الكريمة بكل سرور.</strong></p><p>لضمان تواجد فريق الإدارة أو القسم المعني، يُرجى تحديد موعد مسبق قبل <strong>يومي عمل على الأقل من موعد الزيارة</strong> من خلال التواصل مع مسؤول الاتصال أو إرسال طلب إلى البريد الإلكتروني للمكتب.</p>',
                ],
                'category' => 'kontak',
                'keywords' => 'kunjungan kantor, audiensi, janji temu, alamat kantor, silaturahmi',
                'sort_order' => 3,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana prosedur pengajuan proposal kemitraan atau program CSR dengan Insani?',
                    'en' => 'What is the procedure for submitting a partnership or CSR program proposal with Insani?',
                    'ar' => 'ما هي إجراءات تقديم مقترحات الشراكة أو برامج المسؤولية المجتمعية مع إنساني؟',
                ],
                'answer_html' => [
                    'id' => '<p>Bagi korporasi, komunitas, institusi pendidikan, maupun lembaga sosial yang ingin berkolaborasi dalam program CSR, penyaluran zakat institusi, atau kampanye bersama, Anda dapat mengirimkan surat dan proposal kerjasama ke email <strong>kemitraan resmi kami</strong> atau menghubungi WhatsApp divisi Kemitraan Lembaga. Tim sinergi kami akan menghubungi Anda untuk tahap koordinasi lebih lanjut.</p>',
                    'en' => '<p>For corporations, communities, educational institutions, or social organizations wishing to collaborate on CSR programs, corporate zakat distribution, or joint campaigns, you can send a formal letter and partnership proposal to our <strong>official partnership email</strong> or contact our Institutional Partnership WhatsApp. Our partnership team will contact you for further coordination.</p>',
                    'ar' => '<p>للشركات، والمجتمعات، والمؤسسات التعليمية، أو المنظمات الأهلية الراغبة في التعاون ضمن برامج المسؤولية المجتمعية (CSR)، أو توجيه زكاة الشركات، أو الحملات المشتركة، يمكنكم إرسال خطاب ومقترح التعاون إلى <strong>بريد الشراكات الرسمي</strong> أو عبر واتساب قسم شراكات المؤسسات. سيتواصل معكم فريقنا للتنسيق والخطوات التالية.</p>',
                ],
                'category' => 'kontak',
                'keywords' => 'csr, kemitraan, proposal, kerjasama korporasi, sponsorship, kolaborasi',
                'sort_order' => 4,
            ],
        ];

        foreach ($faqs as $item) {
            $questionId = is_array($item['question']) ? $item['question']['id'] : $item['question'];
            $existing = Faq::where('question->id', $questionId)->first();

            $questionData = is_array($item['question']) ? $item['question'] : [
                'id' => $item['question'],
                'en' => $item['question'],
            ];

            $answerData = is_array($item['answer_html']) ? $item['answer_html'] : [
                'id' => $item['answer_html'],
                'en' => $item['answer_html'],
            ];

            if (! $existing) {
                Faq::create([
                    'question' => $questionData,
                    'answer_html' => $answerData,
                    'category' => $item['category'],
                    'keywords' => $item['keywords'],
                    'is_active' => true,
                    'sort_order' => $item['sort_order'],
                ]);
            } else {
                $existing->setTranslations('question', $questionData);
                $existing->setTranslations('answer_html', $answerData);
                $existing->category = $item['category'];
                $existing->keywords = $item['keywords'];
                $existing->sort_order = $item['sort_order'];
                $existing->save();
            }
        }
    }
}
