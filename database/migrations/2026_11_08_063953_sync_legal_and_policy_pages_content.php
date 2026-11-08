<?php

use App\Models\Page;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations to synchronize legal and policy pages content.
     */
    public function up(): void
    {
        // 1. Run PageSeeder to synchronize all 5 policy pages from docs/policy
        $seeder = new PageSeeder();
        $seeder->run();

        // 2. Fail-safe fallback: Ensure syarat-ketentuan contains full legal content
        $syarat = Page::where('slug', 'syarat-ketentuan')->first();
        if ($syarat && (empty($syarat->getTranslation('content_html', 'id', false)) || $syarat->getTranslation('content_html', 'id', false) === '<p>Konten halaman sedang diperbarui.</p>')) {
            $syarat->setTranslation('content_html', 'id', $this->getSyaratKetentuanHtml());
            $syarat->is_active = true;
            $syarat->save();
        }

        // 3. Fail-safe fallback: Ensure kebijakan-privasi contains full legal content
        $privasi = Page::where('slug', 'kebijakan-privasi')->first();
        if ($privasi && (empty($privasi->getTranslation('content_html', 'id', false)) || $privasi->getTranslation('content_html', 'id', false) === '<p>Konten halaman sedang diperbarui.</p>')) {
            $privasi->setTranslation('content_html', 'id', $this->getKebijakanPrivasiHtml());
            $privasi->is_active = true;
            $privasi->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No destructive reverse needed for static CMS legal pages
    }

    private function getSyaratKetentuanHtml(): string
    {
        return <<<'HTML'
<h2>1. Pendahuluan</h2>
<p>Selamat datang di platform <strong>Insani Indonesia</strong>. Syarat dan Ketentuan ini ("Perjanjian") mengatur penggunaan Anda atas situs web dan layanan donasi yang disediakan oleh Yayasan Peduli Insani Indonesia ("Kami", "Insani Indonesia", atau "Platform"). Dengan mengakses, mendaftar, atau menggunakan layanan Kami, Anda ("Pengguna", "Donatur", "Campaigner", atau "Fundraiser") setuju untuk tunduk pada seluruh syarat dan ketentuan yang tercantum di bawah ini.</p>

<h2>2. Dasar Hukum</h2>
<p>Syarat dan Ketentuan ini disusun dengan merujuk pada ketentuan hukum yang berlaku di Republik Indonesia, antara lain namun tidak terbatas pada:</p>
<ul>
    <li>Undang-Undang Nomor 9 Tahun 1961 tentang Pengumpulan Uang atau Barang.</li>
    <li>Peraturan Pemerintah Nomor 29 Tahun 1980 tentang Pelaksanaan Pengumpulan Sumbangan.</li>
    <li>Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE) beserta perubahannya (UU No. 19 Tahun 2016 dan UU No. 1 Tahun 2024).</li>
    <li>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).</li>
    <li>Peraturan Menteri Sosial Republik Indonesia terkait Pengumpulan Uang dan Barang (PUB) dan perizinan yayasan sosial.</li>
</ul>

<h2>3. Definisi</h2>
<ul>
    <li><strong>Platform:</strong> Situs web dan sistem aplikasi milik Insani Indonesia yang memfasilitasi penggalangan dana secara elektronik.</li>
    <li><strong>Donatur:</strong> Individu, komunitas, atau badan hukum yang menyalurkan donasi secara sukarela melalui Platform.</li>
    <li><strong>Campaigner (Penggalang Dana):</strong> Pihak individu atau lembaga terverifikasi yang menginisiasi, mengelola, dan bertanggung jawab atas program penggalangan dana di Platform.</li>
    <li><strong>Fundraiser (Relawan Kampanye):</strong> Pengguna terdaftar yang membantu menyebarluaskan program donasi melalui tautan rujukan (referral) tanpa memungut imbalan komisi materi.</li>
    <li><strong>Program Donasi:</strong> Kampanye sosial, kemanusiaan, medis, pendidikan, atau keagamaan yang diselenggarakan melalui Platform.</li>
    <li><strong>Pencairan Dana:</strong> Proses penarikan saldo donasi bersih yang terkumpul oleh Campaigner ke rekening bank terdaftar yang telah lolos verifikasi.</li>
    <li><strong>Rincian Penggunaan Dana:</strong> Fitur transparansi publik pada halaman program yang menyajikan informasi alokasi dana masuk, potongan biaya transaksi pembayaran digital, biaya operasional platform, riwayat pencairan, dan sisa saldo belum dicairkan.</li>
</ul>

<h2>4. Ketentuan Penggunaan Layanan</h2>
<p>Dalam menggunakan Platform, Pengguna diwajibkan untuk:</p>
<ol>
    <li>Memberikan informasi yang akurat, jujur, dan sah pada saat pendaftaran, proses verifikasi akun (KYC), maupun pengajuan program.</li>
    <li>Tidak menggunakan Platform untuk kegiatan yang melanggar hukum, penipuan (<em>fraud</em>), pencucian uang (<em>money laundering</em>), pendanaan terorisme, atau kegiatan yang bertentangan dengan norma kesusilaan dan ketertiban umum.</li>
    <li>Menjaga kerahasiaan kredensial akun, kata sandi, dan kode OTP masing-masing. Seluruh aktivitas yang terjadi pada akun Anda sepenuhnya menjadi tanggung jawab Anda pribadi.</li>
</ol>

<h2>5. Ketentuan Donasi & Transparansi Finansial</h2>
<ol>
    <li>Setiap donasi yang disalurkan bersifat sukarela, tanpa paksaan, dan final. Donasi yang telah berhasil terkonfirmasi lunas tidak dapat ditarik kembali, kecuali terjadi kekeliruan sistem perbankan fatal (seperti pendebetan ganda) yang dapat dibuktikan secara sah mutasi rekeningnya.</li>
    <li id="biaya-transaksi">Platform menyediakan metode pembayaran resmi melalui gerbang pembayaran (<em>payment gateway</em>) berlisensi Bank Indonesia (seperti QRIS, Virtual Account, E-Wallet) serta transfer manual perbankan. Donasi melalui <em>payment gateway</em> dikenakan <strong>Biaya Transaksi Pembayaran Digital</strong> oleh pihak ketiga penyedia sistem pembayaran berlisensi yang dipotong langsung dari nominal bruto donasi.</li>
    <li id="biaya-operasional">Insani Indonesia mengenakan biaya operasional platform (maksimal 10% sesuai ketentuan UU No. 9 Tahun 1961 dan Kemensos RI, umumnya sebesar 5% pada platform Kami) yang <strong>dipotong pada saat pencairan dana</strong> oleh Campaigner, bukan dipotong di depan saat donatur menyalurkan dana. Program tanggap bencana alam darurat tertentu serta program inisiatif internal yayasan bebas potongan platform (0%).</li>
    <li>Donatur dan publik dapat memantau keterbukaan alokasi dana secara <em>real-time</em> melalui fitur <strong>Rincian Penggunaan Dana</strong> pada halaman masing-masing program.</li>
    <li>Apabila target dana sebuah program telah tercapai atau kebutuhan penerima manfaat telah terpenuhi sebelum seluruh dana terserap (misal pasien telah sembuh atau wafat), maka sisa saldo donasi akan dialihkan kepada penerima manfaat program serupa yang membutuhkan, dengan persetujuan yayasan dan pencatatan terbuka pada laporan penyaluran.</li>
</ol>

<h2 id="ketentuan-pencairan">6. Ketentuan Penggalang Dana &amp; Pencairan Dana</h2>
<ol>
    <li>Campaigner wajib melalui proses verifikasi identitas ketat (KYC) yang ditinjau oleh tim kepatuhan Insani Indonesia sebelum program dapat diterbitkan atau sebelum dana dapat dicairkan.</li>
    <li>Campaigner bertanggung jawab mutlak atas kebenaran cerita, keabsahan foto, kewajaran target donasi, dan legalitas dokumen medis/perizinan yang diunggah.</li>
    <li>Pencairan dana hanya dapat diajukan ke rekening bank resmi yang telah terverifikasi sesuai data KYC (rekening pribadi sesuai e-KTP untuk individu, atau rekening resmi lembaga untuk yayasan/organisasi).</li>
    <li>Campaigner wajib mencantumkan <strong>Rencana Alokasi Penggunaan Dana</strong> pada setiap pengajuan pencairan dana dan menggunakannya sesuai amanah yang disepakati.</li>
    <li>Campaigner <strong>wajib mengunggah Laporan Pertanggungjawaban (LPJ)</strong> dan bukti dokumentasi penyaluran nyata (kuitansi, nota, foto penyerahan) melalui menu <em>Kabar Terbaru</em> secara berkala (maksimal 14–30 hari kerja setelah pencairan dana berhasil).</li>
    <li>Kelalaian dalam memposting kabar terbaru pertanggungjawaban memberikan hak kepada Insani Indonesia untuk membekukan (<em>hold</em>) permohonan pencairan dana berikutnya sampai kewajiban laporan dipenuhi.</li>
    <li><strong>Sifat Permanen &amp; Integritas Kabar Penyaluran:</strong> Setiap laporan pertanggungjawaban atau Kabar Terbaru yang telah disetujui (<em>approved</em>) dan dipublikasikan (<em>published</em>) bersifat final, permanen, dan <strong>tidak dapat diubah (diedit) maupun dihapus</strong> oleh pihak mana pun secara sepihak. Ketentuan ini diberlakukan demi menjamin keaslian data historis, mencegah manipulasi laporan penyaluran donasi, serta melindungi hak transparansi para donatur.</li>
    <li><strong>Mekanisme Koreksi &amp; Pembaruan Informasi:</strong> Apabila terdapat kekeliruan penulisan atau informasi tambahan setelah kabar dipublikasikan, Campaigner dilarang meminta pengubahan pada postingan lama, melainkan diwajibkan menerbitkan postingan <em>Kabar Terbaru</em> susulan sebagai bentuk klarifikasi atau laporan revisi terbuka kepada publik dan donatur.</li>
</ol>

<h2>7. Mekanisme Pengaduan & Pelaporan Pelanggaran Kampanye</h2>
<ol>
    <li><strong>Hak Partisipasi Masyarakat:</strong> Setiap donatur, pengguna, maupun masyarakat berhak melaporkan indikasi kecurangan, rekayasa informasi medis, pemalsuan identitas, atau penyalahgunaan dana melalui tautan resmi <em>"Apakah penggalangan dana ini mencurigakan? Laporkan"</em> pada halaman kampanye yang bersangkutan.</li>
    <li><strong>Kewajiban Itikad Baik & Bukti Permulaan:</strong> Pelapor wajib mengisi identitas pelapor yang sah, memilih kategori pelanggaran yang relevan, menjelaskan kronologi secara jelas, dan melampirkan bukti permulaan yang dapat dipertanggungjawabkan (foto, tangkapan layar chat, kuitansi, atau dokumen pendukung).</li>
    <li><strong>Larangan Laporan Fitnah / Palsu:</strong> Dilarang keras menyampaikan laporan palsu yang didasari itikad buruk, motif persaingan tidak sehat, atau pencemaran nama baik. Penyalahgunaan fitur pelaporan secara melawan hukum dapat dikenakan sanksi penutupan akun serta konsekuensi hukum sesuai UU ITE dan KUHP.</li>
    <li><strong>Kewenangan & Penindakan oleh Platform:</strong>
        <ul>
            <li>Tim kepatuhan Insani Indonesia akan meninjau setiap laporan yang masuk dan berhak meminta klarifikasi serta dokumen asli dari Campaigner dalam waktu maksimal 2 x 24 jam kerja.</li>
            <li>Platform berhak membekukan sementara hak pencairan dana selama masa investigasi berlangsung.</li>
            <li>Apabila terbukti terjadi pelanggaran berat, penipuan, atau pemalsuan data, Platform berhak menurunkan kampanye dari penayangan publik, memblokir permanen akun Campaigner, serta mengalihkan sisa dana kepada penerima manfaat yang berhak.</li>
            <li>Jika ditemukan unsur tindak pidana penipuan atau penggelapan dana publik, Insani Indonesia akan meneruskan temuan dan bukti kepada Aparat Penegak Hukum (Kepolisian RI) dan instansi pembina (Kementerian Sosial RI).</li>
        </ul>
    </li>
</ol>

<h2>8. Ketentuan Konten Pengguna (UGC: Doa, Komentar & Pesan Dukungan)</h2>
<ol>
    <li>Donatur dapat menuliskan pesan doa dan kalimat dukungan kebaikan saat melakukan donasi pada program yang didukung.</li>
    <li>Pengguna dilarang keras mempublikasikan komentar atau doa yang mengandung unsur:
        <ul>
            <li>SARA, ujaran kebencian, pencemaran nama baik, pelecehan, atau ancaman kekerasan.</li>
            <li>Promosi komersial, tautan afiliasi ilegal, judi online, pornografi, atau penipuan digital.</li>
            <li>Informasi palsu, hoaks, atau materi yang melanggar hak cipta pihak lain.</li>
        </ul>
    </li>
    <li>Insani Indonesia memiliki hak penuh untuk memoderasi, menyembunyikan (*hide*), atau menghapus komentar dan doa pengguna yang melanggar ketentuan tanpa pemberitahuan sebelumnya demi menjaga kenyamanan ekosistem kebaikan bersama.</li>
</ol>

<h2>9. Pelindungan Data Pribadi</h2>
<p>Sejalan dengan Undang-Undang Nomor 27 Tahun 2022 (UU PDP), Kami berkomitmen penuh untuk melindungi kerahasiaan data pribadi Pengguna, Donatur, Campaigner, dan Pelapor pengaduan. Informasi identitas dan data sensitif dikelola dengan standar keamanan perbankan terenkripsi. Rincian hak akses, pemrosesan, dan perlindungan privasi dapat dibaca secara lengkap pada halaman <strong>Kebijakan Privasi</strong> Kami.</p>

<h2>10. Pembatasan Tanggung Jawab</h2>
<ol>
    <li>Insani Indonesia bertindak sebagai penyedia platform teknologi perantara yang memfasilitasi pertemuan antara Donatur yang berkeinginan membantu dengan Campaigner yang membutuhkan dukungan sosial.</li>
    <li>Meskipun Kami menjalankan verifikasi identitas (KYC) dan kurasi ketat, Insani Indonesia tidak dapat menjamin secara mutlak 100% ketiadaan niat buruk dari pihak ketiga. Donatur diimbau untuk membaca, meneliti, dan mempertimbangkan secara bijak sebelum menyalurkan donasi.</li>
    <li>Insani Indonesia dibebaskan dari segala tuntutan hukum perdata maupun pidana atas sengketa yang timbul di antara pihak Donatur dan Campaigner akibat tindakan melanggar hukum yang dilakukan oleh pihak Campaigner di luar batas pengawasan wajar sistem Platform, dengan tetap mengupayakan mediasi dan tindakan kooperatif bersama aparat penegak hukum.</li>
</ol>

<h2>11. Perubahan Syarat dan Ketentuan</h2>
<p>Insani Indonesia berhak untuk mengubah, memodifikasi, atau memperbarui Syarat dan Ketentuan ini sewaktu-waktu guna menyesuaikan dengan perkembangan teknologi, regulasi pemerintah, dan tata kelola yayasan. Setiap pembaruan material akan diumumkan melalui Platform. Penggunaan berkelanjutan atas layanan Platform setelah tanggal perubahan menandakan persetujuan Anda atas Syarat dan Ketentuan yang telah diperbarui.</p>

<h2>12. Penyelesaian Sengketa</h2>
<p>Setiap perselisihan atau sengketa yang timbul dari penafsiran maupun pelaksanaan Syarat dan Ketentuan ini akan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat. Apabila dalam waktu 30 (tiga puluh) hari kalender tidak tercapai kata mufakat, maka para pihak sepakat untuk menyelesaikan perselisihan tersebut melalui yurisdiksi Pengadilan Negeri di wilayah domisili hukum kantor pusat Yayasan Peduli Insani Indonesia.</p>

<hr />
<p><em>Terakhir diperbarui: 27 September 2026</em></p>
HTML;
    }

    private function getKebijakanPrivasiHtml(): string
    {
        return <<<'HTML'
<h2>1. Pendahuluan</h2>
<p>Yayasan Peduli Insani Indonesia ("Kami", "Insani Indonesia", atau "Platform") menyadari bahwa privasi dan keamanan data pribadi Anda adalah hal yang sangat berharga. Dokumen <strong>Kebijakan Privasi</strong> ini disusun untuk menjelaskan secara transparan bagaimana Kami mengumpulkan, menggunakan, menyimpan, membagikan, dan melindungi informasi pribadi milik Anda ("Pengguna", "Donatur", "Campaigner", "Fundraiser", maupun "Pelapor") ketika Anda mengakses dan menggunakan layanan Kami.</p>
<p>Kebijakan ini disusun dengan mematuhi ketentuan hukum yang berlaku di Republik Indonesia, khususnya <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.</p>

<h2>2. Informasi yang Kami Kumpulkan</h2>
<p>Dalam menyelenggarakan layanan penggalangan donasi publik yang transparan dan akuntabel, Kami mengumpulkan beberapa kelompok data:</p>
<ul>
    <li><strong>Data Identitas Pribadi:</strong> Nama lengkap, alamat email, nomor telepon/WhatsApp, dan kata sandi (tersimpan dalam bentuk <em>hash</em> terenkripsi satu arah).</li>
    <li><strong>Data Transaksi &amp; Donasi:</strong> Riwayat donasi, nominal bantuan, metode pembayaran yang dipilih, serta pesan doa dan dukungan kebaikan (kecuali jika Anda memilih opsi <em>"Sembunyikan Nama Saya (Anonim)"</em> di mana identitas publik Anda diganti sebagai "Inisiator Kebaikan").</li>
    <li><strong>Data Verifikasi (Khusus Campaigner):</strong> Salinan e-KTP asli, foto diri memegang e-KTP (<em>selfie verification</em>), dokumen legalitas yayasan/lembaga (SK Kemenkumham, NPWP lembaga), serta data rekening bank resmi yang dituju untuk keperluan pencairan dana.</li>
    <li><strong>Data Pelaporan &amp; Pengaduan Pelanggaran (Whistleblower):</strong> Nama lengkap, alamat email, nomor WhatsApp pelapor, kategori pelanggaran, deskripsi kronologi laporan, serta file dokumen/foto bukti dugaan penyalahgunaan dana yang diunggah secara sukarela melalui formulir pengaduan.</li>
    <li><strong>Data Teknis &amp; Keamanan:</strong> Alamat Protokol Internet (IP Address), jenis perangkat, jenis peramban (<em>browser</em>), <em>cookies</em> sesi, serta token validasi keamanan anti-bot (Cloudflare Turnstile).</li>
</ul>

<h2>3. Penggunaan Data Pribadi</h2>
<p>Data pribadi yang Kami kumpulkan dipergunakan secara bertanggung jawab untuk tujuan-tujuan berikut:</p>
<ol>
    <li>Memproses dan memfasilitasi transaksi penyaluran donasi Anda secara aman ke program yang Anda pilih.</li>
    <li>Melakukan verifikasi identitas (KYC) dan penilaian kelayakan akun Campaigner guna melindungi publik dari potensi penggalangan dana fiktif.</li>
    <li>Mengirimkan kuitansi donasi elektronik resmi, notifikasi perkembangan penyaluran (<em>Kabar Terbaru</em>), serta pemberitahuan operasional lainnya ke email atau WhatsApp Anda.</li>
    <li>Menerima, memverifikasi, menginvestigasi, dan menindaklanjuti laporan pengaduan masyarakat atas dugaan penyalahgunaan dana atau kampanye mencurigakan.</li>
    <li>Mencegah, mendeteksi, dan menindak aktivitas ilegal, manipulasi data, penipuan (<em>fraud</em>), pendanaan terorisme, atau pencucian uang di dalam platform.</li>
    <li>Meningkatkan kualitas antarmuka dan pengalaman pengguna (UI/UX) pada seluruh layanan Insani Indonesia.</li>
</ol>

<h2>4. Pembagian Data dengan Pihak Ketiga & Perlindungan Pelapor</h2>
<p>Insani Indonesia memegang komitmen teguh untuk <strong>tidak pernah memperjualbelikan atau menyewakan</strong> data pribadi Anda kepada pihak mana pun untuk keperluan komersial atau periklanan pihak ketiga.</p>
<p>Data Anda hanya dapat dibagikan secara terbatas dalam koridor berikut:</p>
<ul>
    <li><strong>Penyedia Layanan Pembayaran Digital (Payment Gateway):</strong> Informasi nomor transaksi diteruskan melalui saluran terenkripsi standar Bank Indonesia kepada mitra gerbang pembayaran resmi berlisensi (seperti Xendit) untuk validasi donasi dan pemrosesan biaya transaksi pembayaran digital (QRIS, VA Bank, E-Wallet).</li>
    <li><strong>Campaigner (Penggalang Dana):</strong> Kami dapat meneruskan nama dan pesan doa donatur kepada pihak Campaigner untuk kebutuhan apresiasi penyaluran, <strong>kecuali</strong> jika Donatur mencentang opsi "Anonim (Inisiator Kebaikan)".</li>
    <li><strong>Kerahasiaan Mutlak Identitas Pelapor (Whistleblower Protection):</strong> Data identitas, nomor telepon, dan email Pelapor dugaan pelanggaran kampanye <strong>dijamin kerahasiaannya dan TIDAK AKAN PERNAH diungkapkan atau diberikan kepada pihak Campaigner yang dilaporkan</strong>. Data ini semata-mata digunakan oleh Tim Kepatuhan Insani Indonesia guna keperluan investigasi internal dan konfirmasi tindak lanjut.</li>
    <li><strong>Otoritas Hukum &amp; Pemerintah:</strong> Jika diwajibkan oleh peraturan perundang-undangan yang sah, surat perintah pengadilan, atau permintaan resmi dari aparat penegak hukum (Kepolisian RI, Kejaksaan, PPATK, Kementerian Sosial RI) dalam rangka penyidikan tindak pidana.</li>
</ul>

<h2>5. Penyamaran Data Finansial Publik</h2>
<p>Demi menjaga asas transparansi publik sekaligus melindungi privasi dan keamanan data finansial penggalang dana, pada fitur publik <strong>Rincian Penggunaan Dana</strong> (yang menyajikan donasi masuk, biaya transaksi pembayaran digital, biaya operasional platform, dan riwayat penyaluran) serta riwayat pencairan dana di halaman kampanye:</p>
<ul>
    <li>Nomor rekening bank Campaigner akan disamarkan (*masking*) sebagian (contoh: <code>****5678</code>).</li>
    <li>Informasi yang ditampilkan kepada publik terbatas pada nama bank, tanggal pencairan, nominal dana yang dicairkan, serta rencana alokasi penggunaan dana demi akuntabilitas penyaluran.</li>
</ul>

<h2>6. Retensi dan Keamanan Penyimpanan Data</h2>
<ol>
    <li>Seluruh transmisi data antara perangkat Anda dan server Kami dienkripsi menggunakan sertifikat keamanan SSL/HTTPS 256-bit standar industri perbankan internasional.</li>
    <li>File dokumen sensitif (seperti e-KTP verifikasi dan dokumen bukti laporan kecurangan) disimpan di dalam penyimpanan server tertutup (<em>private cloud storage</em>) dengan pembatasan hak akses ketat yang hanya dapat diakses oleh personil kepatuhan berwenang.</li>
    <li>Sesuai dengan ketentuan regulasi pembukuan keuangan dan perpajakan di Indonesia, riwayat data transaksi donasi dan pencairan dana wajib disimpan sekurang-kurangnya selama <strong>5 (lima) tahun</strong>.</li>
</ol>

<h2>7. Hak Anda atas Data Pribadi</h2>
<p>Sesuai dengan hak-hak subjek data dalam UU No. 27 Tahun 2022 (UU PDP), Anda memiliki hak untuk:</p>
<ul>
    <li><strong>Hak Akses dan Perbaikan:</strong> Memeriksa dan memperbarui data profil, nama, serta kontak Anda secara mandiri melalui pengaturan akun Anda.</li>
    <li><strong>Hak Penarikan Persetujuan dan Penghapusan Data Pribadi:</strong> Mengajukan permohonan penutupan akun dan penghapusan data pribadi Anda dengan menghubungi Layanan Pelanggan Kami (dikecualikan untuk data riwayat transaksi finansial sesuai batas retensi hukum perbankan serta dokumen laporan pertanggungjawaban penyaluran donasi publik / Kabar Terbaru yang bersifat permanen demi kepentingan audit hukum, transparansi publik, dan perlindungan donatur).</li>
    <li><strong>Hak Pembatasan Pemrosesan:</strong> Meminta pembatasan pemrosesan data tertentu jika terjadi sengketa keabsahan data.</li>
</ul>

<h2>8. Penggunaan oleh Anak di Bawah Umur</h2>
<p>Layanan Platform Insani Indonesia tidak diperuntukkan bagi anak di bawah usia 18 tahun tanpa pengawasan dan persetujuan dari orang tua atau wali hukum yang sah. Apabila Kami mengetahui bahwa data pribadi anak di bawah umur telah terkumpul tanpa persetujuan wali, Kami akan segera mengambil tindakan untuk menghapus data tersebut.</p>

<h2>9. Perubahan Kebijakan Privasi</h2>
<p>Insani Indonesia berhak untuk meninjau dan memperbarui Kebijakan Privasi ini secara berkala demi menjamin kepatuhan terhadap perkembangan teknologi dan hukum yang berlaku. Kami menyarankan Anda untuk memeriksa halaman ini secara berkala. Tanggal pembaruan terakhir akan selalu Kami cantumkan pada bagian akhir dokumen ini.</p>

<h2>10. Hubungi Kami</h2>
<p>Apabila Anda memiliki pertanyaan, keberatan, atau ingin menggunakan hak-hak perlindungan data pribadi Anda sehubungan dengan Kebijakan Privasi ini, silakan hubungi Tim Perlindungan Data dan Pusat Bantuan Kami melalui email <strong>sapa@insani.id</strong> atau melalui saluran komunikasi resmi di halaman <a href="/kontak"><strong>Kontak Insani Indonesia</strong></a>.</p>

<hr />
<p><em>Terakhir diperbarui: 27 September 2026</em></p>
HTML;
    }
};
