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
                'question' => [
                    'id' => 'Bagaimana cara berdonasi di Insani Indonesia?',
                    'en' => 'How to donate on Insani Indonesia?',
                ],
                'answer_html' => [
                    'id' => '<p>Berdonasi di Insani Indonesia sangat praktis dan aman:</p><ol><li>Buka katalog <strong>Program Donasi</strong> dan pilih kampanye yang ingin Anda bantu.</li><li>Klik tombol <strong>"Donasi Sekarang"</strong> pada halaman kampanye.</li><li>Tentukan nominal donasi (minimal Rp 10.000).</li><li>Masukkan nama, email, dan nomor WhatsApp, atau centang <em>"Sembunyikan Nama Saya (Anonim)"</em> jika ingin berdonasi sebagai Hamba Allah. Anda juga dapat menuliskan pesan doa dan dukungan.</li><li>Pilih metode pembayaran otomatis (QRIS, VA Bank, E-Wallet) atau transfer manual bank (BSI / BRI).</li><li>Selesaikan pembayaran sesuai instruksi.</li></ol>',
                    'en' => '<p>Donating on Insani Indonesia is practical and secure:</p><ol><li>Browse the <strong>Donation Programs</strong> catalog and select a campaign you wish to support.</li><li>Click the <strong>"Donate Now"</strong> button on the campaign page.</li><li>Specify your donation amount (minimum Rp 10,000).</li><li>Enter your name, email, and WhatsApp number, or check <em>"Hide My Name (Anonymous)"</em> to donate anonymously. You can also write a prayer or message of support.</li><li>Select an automated payment method (QRIS, Bank Virtual Account, E-Wallet) or manual bank transfer (BSI / BRI).</li><li>Complete the payment according to the instructions.</li></ol>',
                ],
                'category' => 'donatur',
                'keywords' => 'cara donasi, langkah donasi, metode pembayaran, qris, transfer, virtual account',
                'sort_order' => 1,
            ],
            [
                'question' => [
                    'id' => 'Apakah saya bisa berdonasi tanpa mendaftar akun terlebih dahulu (Guest Donatur)?',
                    'en' => 'Can I donate without creating an account first (Guest Donor)?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Ya, tentu saja!</strong> Anda dapat langsung berdonasi sebagai donatur tamu (guest) tanpa perlu registrasi atau login akun.</p><p>Cukup cantumkan alamat email dan nomor WhatsApp aktif Anda. Sistem kami akan secara otomatis mengirimkan rincian pembayaran, notifikasi penerimaan donasi, serta tautan kuitansi resmi ke kontak Anda.</p>',
                    'en' => '<p><strong>Yes, absolutely!</strong> You can donate directly as a guest donor without registering or logging in.</p><p>Simply provide an active email address and WhatsApp number. Our system will automatically send transaction details, donation confirmation notices, and official electronic receipts to your contacts.</p>',
                ],
                'category' => 'donatur',
                'keywords' => 'guest, tanpa akun, tanpa login, tamu, langsung donasi',
                'sort_order' => 2,
            ],
            [
                'question' => [
                    'id' => 'Apa fungsi opsi "Sembunyikan Nama Saya (Anonim)"?',
                    'en' => 'What is the purpose of "Hide My Name (Anonymous)" option?',
                ],
                'answer_html' => [
                    'id' => '<p>Jika Anda mencentang opsi anonim saat melakukan donasi, nama Anda tidak akan pernah ditampilkan di daftar donatur publik halaman program. Sistem akan menampilkan donasi Anda sebagai <strong>"Hamba Allah"</strong>.</p><p>Identitas asli Anda tetap tersimpan secara aman dan terenkripsi di sistem internal kami hanya untuk keperluan verifikasi pembayaran dan audit keuangan resmi sesuai ketentuan perbankan.</p>',
                    'en' => '<p>If you check the anonymous option when donating, your name will never be displayed in the public donor list on the campaign page. The system will display your donation as <strong>"Hamba Allah (Servant of God)"</strong>.</p><p>Your real identity remains safely stored and encrypted in our internal database strictly for payment verification and statutory financial audits.</p>',
                ],
                'category' => 'donatur',
                'keywords' => 'anonim, sembunyikan nama, hamba allah, privasi nama, rahasia',
                'sort_order' => 3,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana cara mengecek status donasi dan mengunduh kuitansi resmi jika saya donatur tamu?',
                    'en' => 'How can I check donation status and download official receipts as a guest donor?',
                ],
                'answer_html' => [
                    'id' => '<p>Setiap transaksi donasi akan memiliki <strong>Kode Donasi Unik</strong> (contoh: <code>DON-XXXXXXXXXX</code>) yang dikirimkan ke email atau layar sukses donasi Anda:</p><ul><li>Kunjungi halaman <strong>Cek Status Donasi</strong> (/cek-donasi).</li><li>Masukkan kode donasi atau alamat email Anda.</li><li>Jika donasi telah berstatus <strong>Lunas (Paid)</strong>, Anda dapat langsung mengunduh dan mencetak <strong>Kuitansi Resmi Elektronik (E-Receipt)</strong> resmi ber-QR Code validasi keabsahan yayasan.</li></ul>',
                    'en' => '<p>Every donation transaction has a <strong>Unique Donation Code</strong> (e.g., <code>DON-XXXXXXXXXX</code>) sent to your email or success screen:</p><ul><li>Visit the <strong>Check Donation Status</strong> page (/cek-donasi).</li><li>Enter your donation code or email address.</li><li>Once marked as <strong>Paid</strong>, you can download and print an <strong>Official Electronic Receipt (E-Receipt)</strong> featuring a cryptographic QR code verifying foundation authenticity.</li></ul>',
                ],
                'category' => 'donatur',
                'keywords' => 'cek status, kuitansi, receipt, kode donasi, bukti donasi, download kuitansi',
                'sort_order' => 4,
            ],
            [
                'question' => [
                    'id' => 'Apa perbedaan metode pembayaran otomatis dan transfer manual bank?',
                    'en' => 'What is the difference between automated payment methods and manual bank transfer?',
                    'ar' => 'ما هو الفرق بين طرق الدفع التلقائي والتحويل المصرفي اليدوي؟',
                ],
                'answer_html' => [
                    'id' => '<ul><li><strong>Pembayaran Otomatis (QRIS, Virtual Account, E-Wallet):</strong> Donasi diverifikasi secara <em>real-time</em> oleh payment gateway berlisensi Bank Indonesia (Xendit). Donasi terkonfirmasi lunas dalam beberapa detik tanpa perlu mengirimkan bukti transfer.</li><li><strong>Transfer Manual Bank (BSI & BRI Giro):</strong> Anda mentransfer dana langsung ke rekening giro resmi yayasan. Setelah transfer, Anda <strong>wajib mengonfirmasi</strong> dengan mengirimkan foto/screenshot bukti transfer ke WhatsApp Customer Service kami agar admin keuangan memverifikasinya.</li></ul>',
                    'en' => '<ul><li><strong>Automated Payments (QRIS, Virtual Account, E-Wallets):</strong> Donations are verified in real time by licensed Bank Indonesia payment gateways (Xendit). The transaction is confirmed within seconds without uploading proof of transfer.</li><li><strong>Manual Bank Transfer (BSI & BRI):</strong> You transfer funds directly to the foundation official corporate giro account. Afterward, you <strong>must confirm</strong> by sending a transfer receipt screenshot to our WhatsApp Customer Service for finance manual reconciliation.</li></ul>',
                    'ar' => '<ul><li><strong>الدفع التلقائي (QRIS، الحساب الافتراضي، المحفظة الإلكترونية):</strong> يتم التحقق من التبرع فورياً بواسطة بوابة دفع مرخصة من بنك إندونيسيا (Xendit). يتم تأكيد اكتمال التبرع في غضون ثوانٍ دون الحاجة إلى إرسال إيصال التحويل.</li><li><strong>التحويل المصرفي اليدوي (حساب BSI و BRI الجاري):</strong> تقوم بتحويل الأموال مباشرة إلى الحساب الجاري الرسمي للمؤسسة. بعد التحويل، <strong>يتعين عليك تأكيد التبرع</strong> بإرسال صورة/لقطة شاشة لإيصال التحويل إلى خدمة العملاء عبر واتساب لتقوم الإدارة المالية بمطابقتها.</li></ul>',
                ],
                'category' => 'donatur',
                'keywords' => 'otomatis, manual, verifikasi otomatis, konfirmasi manual, xendit, qris',
                'sort_order' => 5,
            ],
            [
                'question' => [
                    'id' => 'Jika saat ini saya berdonasi sebagai tamu, apakah riwayatnya tersimpan jika kelak saya membuat akun?',
                    'en' => 'If I donate as a guest now, will my history be preserved if I create an account later?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Ya, otomatis tersinkronisasi!</strong></p><p>Sistem Insani Indonesia melacak donasi berdasarkan alamat email Anda. Begitu Anda mendaftar akun dengan alamat email yang sama dengan yang pernah Anda gunakan saat berdonasi sebagai tamu, seluruh riwayat donasi terdahulu akan langsung muncul di halaman <strong>Riwayat Donasi Saya</strong> di dasbor akun Anda.</p>',
                    'en' => '<p><strong>Yes, automatically synchronized!</strong></p><p>Insani Indonesia links donation histories using your verified email address. As soon as you register an account with the same email used during guest donations, your complete historical contribution record will appear in <strong>My Donations</strong> on your personal dashboard.</p>',
                ],
                'category' => 'donatur',
                'keywords' => 'sinkronisasi, riwayat donasi, daftar akun, email sama, history',
                'sort_order' => 6,
            ],
            [
                'question' => [
                    'id' => 'Apa keuntungan membuat akun dan login sebagai Donatur di Insani Indonesia?',
                    'en' => 'What are the benefits of registering and logging in as a Donor on Insani Indonesia?',
                ],
                'answer_html' => [
                    'id' => '<p>Dengan memiliki akun donatur terdaftar, Anda dapat:</p><ul><li>Memantau akumulasi total donasi kebaikan yang telah Anda salurkan di dasbor pribadi.</li><li>Mengunduh kembali seluruh arsip kuitansi resmi kapan saja (sangat berguna untuk pelaporan zakat atau pajak).</li><li>Mendapatkan notifikasi laporan penyaluran (<em>Kabar Terbaru</em>) langsung dari program yang Anda dukung.</li><li>Dapat langsung mendaftar sebagai <strong>Fundraiser (Relawan Kampanye)</strong> untuk melipatgandakan dampak kebaikan.</li></ul>',
                    'en' => '<p>With a registered donor account, you can:</p><ul><li>Track your cumulative charitable contributions on your personalized dashboard.</li><li>Re-download your complete archive of official receipts anytime (useful for zakat or tax deductible records).</li><li>Receive direct email notifications whenever program updates (<em>Recent Updates</em>) are posted.</li><li>Quickly register as a <strong>Fundraiser (Campaign Volunteer)</strong> to multiply charitable impact.</li></ul>',
                ],
                'category' => 'donatur',
                'keywords' => 'keuntungan akun, member, manfaat akun, dasbor donatur, sertifikat',
                'sort_order' => 7,
            ],
            [
                'question' => [
                    'id' => 'Apa itu fitur Rincian Penggunaan Dana pada halaman program?',
                    'en' => 'What is the Fund Usage Details feature on the campaign page?',
                    'ar' => 'ما هي ميزة تفاصيل استخدام الأموال في صفحة البرنامج؟',
                ],
                'answer_html' => [
                    'id' => '<p>Fitur <strong>Rincian Penggunaan Dana</strong> adalah wujud transparansi finansial terbuka platform Insani Indonesia kepada para donatur dan masyarakat. Melalui modal rincian ini, Anda dapat memantau secara terbuka:</p><ul><li><strong>Total Donasi Masuk (Gross):</strong> Akumulasi donasi yang disalurkan donatur.</li><li><strong>Biaya Transaksi Pembayaran Digital:</strong> Biaya transaksi resmi payment gateway (Xendit) untuk pemrosesan QRIS, VA, dan E-Wallet.</li><li><strong>Biaya Operasional Platform (5% saat pencairan):</strong> Biaya operasional dan verifikasi yayasan yang hanya dipotong ketika penggalang dana mencairkan dana.</li><li><strong>Total Dana Telah Dicairkan:</strong> Akumulasi dana yang sudah ditransfer ke campaigner beserta rencana penggunaannya.</li><li><strong>Sisa Saldo Belum Dicairkan:</strong> Dana bersih donasi yang masih tersimpan aman dan siap dicairkan pada tahapan berikutnya.</li></ul>',
                    'en' => '<p>The <strong>Fund Usage Details</strong> feature represents Insani Indonesia\'s commitment to financial transparency. Through this modal, donors and the public can view:</p><ul><li><strong>Total Gross Donations:</strong> Accumulated donations contributed by donors.</li><li><strong>Digital Payment Transaction Fee:</strong> Official payment gateway transaction fees (Xendit) for QRIS, VA, and E-Wallet processing.</li><li><strong>Platform Operational Fee (5% upon disbursement):</strong> Foundation operational and verification fees deducted only when funds are disbursed.</li><li><strong>Total Disbursed Funds:</strong> Accumulated funds already transferred to the campaigner along with allocation plans.</li><li><strong>Remaining Undisbursed Balance:</strong> Net donation balance safely held and ready for subsequent disbursement milestones.</li></ul>',
                    'ar' => '<p>تُعد ميزة <strong>تفاصيل استخدام الأموال</strong> تجسيداً للشفافية المالية المفتوحة لمنصة إنساني إندونيسيا تجاه المتبرعين والمجتمع. ومن خلال هذه النافذة، يمكنك المتابعة بكل شفافية:</p><ul><li><strong>إجمالي التبرعات المستلمة (الإجمالي):</strong> التبرعات المتراكمة المقدمة من المتبرعين.</li><li><strong>رسوم معاملات الدفع الرقمي:</strong> الرسوم الرسمية لبوابة الدفع (Xendit) لمعالجة QRIS، والحسابات الافتراضية، والمحافظ الإلكترونية.</li><li><strong>رسوم تشغيل المنصة (5% عند الصرف):</strong> رسوم تشغيل وتحقق المؤسسة والتي تُخصم فقط عندما يقوم صاحب الحملة بصرف الأموال.</li><li><strong>إجمالي الأموال المصروفة:</strong> إجمالي الأموال المحولة بالفعل إلى منظم الحملة مع خطة الاستخدام.</li><li><strong>الرصيد المتبقي غير المصروف:</strong> صافي أموال التبرعات المحفوظة بأمان والجاهزة للصرف في المراحل اللاحقة.</li></ul>',
                ],
                'category' => 'donatur',
                'keywords' => 'rincian dana, penggunaan dana, transparansi, potongan donasi, biaya platform, sisa saldo',
                'sort_order' => 8,
            ],
            [
                'question' => [
                    'id' => 'Apa perbedaan program Donasi Fleksibel dengan program bertarget donasi & batas waktu?',
                    'en' => 'What is the difference between Flexible Donation and target-based programs with deadlines?',
                ],
                'answer_html' => [
                    'id' => '<ul><li><strong>Program Bertarget &amp; Berbatas Waktu:</strong> Diterapkan pada program yang membutuhkan kepastian nominal dan tenggat waktu darurat (contoh: biaya operasi medis segera atau rekonstruksi darurat bencana).</li><li><strong>Program Donasi Fleksibel:</strong> Diterapkan pada inisiatif sosial berkelanjutan (contoh: santunan yatim piatu, biaya operasional santri dhuafa, atau dakwah rutin) di mana setiap donasi yang terkumpul dapat langsung disalurkan secara berkala tanpa harus menunggu target nominal terpenuhi.</li></ul>',
                    'en' => '<ul><li><strong>Targeted &amp; Time-Limited Programs:</strong> Applied to campaigns requiring exact funds and emergency deadlines (e.g., urgent medical surgeries or disaster relief).</li><li><strong>Flexible Donation Programs:</strong> Applied to ongoing sustainable social causes (e.g., orphan care, student sponsorships, regular dakwah) where every donation collected can be disbursed periodically without waiting for a fixed target amount.</li></ul>',
                ],
                'category' => 'donatur',
                'keywords' => 'donasi fleksibel, target donasi, batas waktu, open ended, jenis kampanye',
                'sort_order' => 9,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana ketentuan menulis doa saat donasi? Mengapa komentar/doa saya tidak muncul?',
                    'en' => 'What are the rules for writing prayers and support? Why is my comment not showing?',
                ],
                'answer_html' => [
                    'id' => '<p>Donatur dapat menuliskan doa dan kata-kata penyemangat saat melakukan donasi, yang akan ditampilkan pada tab <em>Doa &amp; Dukungan</em> di halaman program.</p><p>Demi menjaga ketertiban, kenyamanan, dan kesucian ruang kebaikan bersama, platform menerapkan moderasi berkala. Komentar atau doa yang mengandung unsur <strong>ujaran kebencian, SARA, promosi komersial, tautan mencurigakan, atau judi online</strong> akan otomatis disembunyikan atau dihapus oleh sistem moderator.</p>',
                    'en' => '<p>Donors can submit prayers and supportive messages during checkout, which appear on the <em>Prayers &amp; Support</em> tab of the campaign page.</p><p>To maintain a safe and respectful environment, the platform moderates user submissions. Comments containing <strong>hate speech, harassment, commercial promotions, suspicious links, or gambling spam</strong> will be automatically hidden or removed by moderators.</p>',
                ],
                'category' => 'donatur',
                'keywords' => 'doa donatur, komentar, moderasi, pesan dukungan, komentar disembunyikan',
                'sort_order' => 10,
            ],
            [
                'question' => [
                    'id' => 'Apakah saya akan menerima laporan penyaluran (Kabar Terbaru) atas donasi yang saya salurkan?',
                    'en' => 'Will I receive disbursement and update reports for the campaigns I donated to?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Ya, tentu saja!</strong> Setiap kali Campaigner mencairkan dana dan mengunggah dokumentasi realisasi penyaluran melalui fitur <strong>Kabar Terbaru</strong>, sistem kami akan secara otomatis mengirimkan notifikasi laporan tersebut ke alamat email yang Anda gunakan saat berdonasi.</p><p>Anda juga dapat membuka halaman kampanye kapan saja dan memeriksa tab <em>Kabar Terbaru</em> untuk melihat foto dokumentasi, kuitansi, dan cerita penyerahan manfaat.</p>',
                    'en' => '<p><strong>Yes, absolutely!</strong> Whenever a Campaigner disburses funds and posts milestone implementation updates via <strong>Recent Updates</strong>, our system automatically emails the update report to the email address you used when donating.</p><p>You can also visit the campaign page at any time and check the <em>Recent Updates</em> tab to inspect photos, receipts, and field reports.</p>',
                ],
                'category' => 'donatur',
                'keywords' => 'laporan penyaluran, kabar terbaru, email donatur, perkembangan program, transparansi donasi',
                'sort_order' => 11,
            ],

            // ==================== CAMPAIGNER ====================
            [
                'question' => [
                    'id' => 'Apa itu Campaigner di Insani Indonesia?',
                    'en' => 'What is a Campaigner on Insani Indonesia?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Campaigner</strong> adalah individu, komunitas, lembaga sosial, atau yayasan terverifikasi yang dipercaya untuk menginisiasi dan mengelola kampanye penggalangan dana di platform Insani Indonesia.</p><p>Campaigner bertanggung jawab penuh atas kebenaran informasi program dan penyaluran amanah dana donasi kepada para penerima manfaat.</p>',
                    'en' => '<p>A <strong>Campaigner</strong> is a verified individual, community, social institution, or foundation entrusted with creating and managing fundraising campaigns on Insani Indonesia.</p><p>The Campaigner holds full accountability for the veracity of the campaign narrative and the lawful distribution of donated funds to the designated beneficiaries.</p>',
                ],
                'category' => 'campaigner',
                'keywords' => 'campaigner, penggalang dana, buat kampanye, inisiasi program',
                'sort_order' => 12,
            ],
            [
                'question' => [
                    'id' => 'Apa perbedaan syarat verifikasi Campaigner Individu vs Lembaga/Yayasan?',
                    'en' => 'What are the verification differences between Individual vs Institutional Campaigners?',
                ],
                'answer_html' => [
                    'id' => '<p>Untuk melindungi donatur dari potensi penipuan, seluruh calon campaigner wajib lolos verifikasi identitas:</p><p><strong>Campaigner Individu:</strong> Foto e-KTP asli, foto selfie memegang e-KTP, rekening bank atas nama pribadi sesuai e-KTP, dan domisili jelas.</p><p><strong>Campaigner Lembaga / Yayasan:</strong> SK Kemenkumham / Izin Lembaga resmi, NPWP Lembaga, rekening koran/bank atas nama Lembaga (bukan pribadi), dan KTP penanggung jawab resmi.</p>',
                    'en' => '<p>To safeguard donors against fraud, all prospective campaigners must complete rigorous identity verification:</p><p><strong>Individual Campaigners:</strong> Valid original national ID (e-KTP), selfie holding the ID card, personal bank account matching the ID name, and confirmed domicile address.</p><p><strong>Institutional Campaigners / Foundations:</strong> Official Legal Ratification Decree (SK Kemenkumham), Institutional Tax ID (NPWP), institutional corporate bank account statement (personal accounts are strictly prohibited), and ID of the authorized representative.</p>',
                ],
                'category' => 'campaigner',
                'keywords' => 'verifikasi akun, verifikasi, syarat campaigner, dokumen verifikasi, ktp, sk kemenkumham, npwp',
                'sort_order' => 13,
            ],
            [
                'question' => [
                    'id' => 'Berapa lama proses verifikasi akun Campaigner?',
                    'en' => 'How long does Campaigner verification take?',
                ],
                'answer_html' => [
                    'id' => '<p>Tim verifikasi Insani Indonesia memeriksa keabsahan dokumen verifikasi dalam waktu <strong>1 x 24 jam hingga maksimal 2 x 24 jam kerja</strong> (Senin - Jumat).</p><p>Pemberitahuan hasil verifikasi (Disetujui / Butuh Revisi / Ditolak) akan dikirimkan via email dan dapat dicek langsung pada menu status akun Anda.</p>',
                    'en' => '<p>The Insani Indonesia verification team reviews identity and legal documents within <strong>1 to 2 business days</strong> (Monday to Friday).</p><p>Notifications regarding verification results (Approved / Needs Revision / Rejected) are dispatched via email and can be checked directly on your account status page.</p>',
                ],
                'category' => 'campaigner',
                'keywords' => 'lama verifikasi, durasi verifikasi, review verifikasi, berapa hari',
                'sort_order' => 14,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana alur pengajuan program baru hingga tayang di website?',
                    'en' => 'What is the workflow for submitting a campaign until it is published?',
                ],
                'answer_html' => [
                    'id' => '<p>Alur penerbitan program donasi terdiri dari 4 langkah:</p><ol><li><strong>Buat Program (Draft):</strong> Isi data kampanye, target donasi, batas waktu, foto utama, dan narasi cerita.</li><li><strong>Kirim untuk Kurasi (Pending Review):</strong> Program masuk ke tim kurator Insani Indonesia untuk verifikasi kelayakan.</li><li><strong>Persetujuan (Approved):</strong> Jika dokumen dan cerita valid, admin akan menyetujui program.</li><li><strong>Tayang (Published):</strong> Program mulai aktif menerima donasi dari publik luas.</li></ol>',
                    'en' => '<p>Publishing a campaign involves 4 steps:</p><ol><li><strong>Draft Creation:</strong> Fill in campaign details, target amount, duration, cover photo, and verified narrative.</li><li><strong>Submit for Review:</strong> The campaign enters the curation queue for factual and ethical vetting.</li><li><strong>Approval:</strong> Once validated, our compliance team approves the campaign.</li><li><strong>Published:</strong> The campaign goes live and begins receiving contributions from the public.</li></ol>',
                ],
                'category' => 'campaigner',
                'keywords' => 'buat program, alur kurasi, pending review, published, approval',
                'sort_order' => 15,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana mekanisme dan syarat pencairan dana (Disbursement)?',
                    'en' => 'What are the mechanisms and requirements for fund disbursement?',
                ],
                'answer_html' => [
                    'id' => '<p>Campaigner dapat mengajukan pencairan donasi yang telah terkumpul melalui menu Pencairan Dana di dasbor program dengan ketentuan:</p><ul><li>Nominal pencairan minimal adalah <strong>Rp 10.000</strong> dan tidak melebihi sisa saldo bersih donasi yang tersedia.</li><li>Pencairan hanya ditransfer ke <strong>rekening bank terdaftar yang telah lolos verifikasi akun</strong>.</li><li>Campaigner <strong>wajib mengisi rincian rencana alokasi penggunaan dana</strong> agar dipublikasikan di modal transparansi publik.</li><li>Proses transfer perbankan memerlukan waktu 1–3 hari kerja setelah permohonan disetujui tim finance.</li></ul>',
                    'en' => '<p>Campaigners can request disbursement of collected donations through the program dashboard under the following rules:</p><ul><li>Minimum disbursement amount is <strong>Rp 10,000</strong> up to the available net balance.</li><li>Disbursements are transferred exclusively to the <strong>verified bank account on record</strong>.</li><li>Campaigners <strong>must specify the fund allocation plan</strong> for public transparency in the campaign modal.</li><li>Bank transfers take 1–3 business days following financial team approval.</li></ul>',
                ],
                'category' => 'campaigner',
                'keywords' => 'pencairan dana, disbursement, tarik dana, syarat pencairan, minimal pencairan',
                'sort_order' => 16,
            ],
            [
                'question' => [
                    'id' => 'Berapa biaya operasional platform yang dikenakan pada program?',
                    'en' => 'What platform operational fees are charged on campaigns?',
                    'ar' => 'كم تبلغ رسوم تشغيل المنصة المفروضة على البرامج؟',
                ],
                'answer_html' => [
                    'id' => '<p>Insani Indonesia beroperasi secara transparan sesuai UU No. 9 Tahun 1961 dan ketentuan Kementerian Sosial RI:</p><ul><li>Sebesar <strong>5%</strong> (maksimal 10% sesuai undang-undang) untuk program sosial, kemanusiaan umum, dan kesehatan sebagai biaya operasional platform dan verifikasi, yang <strong>dipotong saat pencairan dana (disbursement)</strong>.</li><li><strong>0% (bebas potongan platform)</strong> untuk program tanggap bencana alam darurat tertentu.</li><li>Biaya transaksi pembayaran digital pihak ketiga (payment gateway perbankan/QRIS) dipotong sesuai tarif standar resmi Bank Indonesia.</li></ul>',
                    'en' => '<p>Insani Indonesia operates transparently in compliance with Indonesian Law No. 9/1961 and Social Ministry regulations:</p><ul><li><strong>5%</strong> (up to the legal ceiling of 10%) for social, humanitarian, and healthcare campaigns for platform operations, field verification, and maintenance, <strong>deducted only upon disbursement</strong>.</li><li><strong>0% (zero platform fee)</strong> for designated emergency disaster relief programs.</li><li>Third-party digital payment transaction fees (banking/QRIS payment gateways) are deducted at Bank Indonesia official standard rates.</li></ul>',
                    'ar' => '<p>تعمل إنساني إندونيسيا بشفافية تامة وفقاً للقانون رقم 9 لسنة 1961 ولوائح وزارة الشؤون الاجتماعية الإندونيسية:</p><ul><li>نسبة <strong>5%</strong> (بحد أقصى 10% وفقاً للقانون) للبرامج الاجتماعية والإنسانية العامة والصحية كرسوم لتشغيل المنصة والتحقق الميداني، والتي <strong>تُخصم عند صرف الأموال (Disbursement)</strong>.</li><li><strong>0% (معفاة تماماً من رسوم المنصة)</strong> لبرامج الإغاثة الطارئة المحددة للكوارث الطبيعية.</li><li>تُخصم رسوم معاملات الدفع الرقمي لأطراف خارجية (بوابات الدفع المصرفية وQRIS) وفقاً للأسعار الرسمية القياسية لبنك إندونيسيا.</li></ul>',
                ],
                'category' => 'campaigner',
                'keywords' => 'biaya operasional, potongan platform, fee, persentase potongan, uu 9 1961',
                'sort_order' => 17,
            ],
            [
                'question' => [
                    'id' => 'Mengapa Campaigner wajib memposting "Kabar Terbaru" secara berkala?',
                    'en' => 'Why are Campaigners required to post "Recent Updates" regularly?',
                ],
                'answer_html' => [
                    'id' => '<p>Setiap Campaigner memegang amanah dari para donatur. Oleh karena itu, Campaigner <strong>wajib mengunggah dokumentasi dan cerita realisasi penyaluran dana</strong> (kuitansi, nota, foto kegiatan) melalui fitur "Kabar Terbaru" maksimal 14–30 hari setelah dana dicairkan.</p><p>Pembaruan ini akan langsung dikirimkan ke email seluruh donatur program tersebut. Akun campaigner yang lalai membuat laporan pertanggungjawaban dapat ditangguhkan pencairan dananya demi menjaga integritas platform.</p>',
                    'en' => '<p>Campaigners hold a solemn trust from donors. Therefore, they <strong>must upload receipts, implementation documentation, and field photos</strong> via "Recent Updates" within 14–30 business days following each disbursement.</p><p>These updates are automatically emailed to all campaign contributors. Campaigners failing to submit milestone reports will face disbursement holds to preserve community trust.</p>',
                ],
                'category' => 'campaigner',
                'keywords' => 'kabar terbaru, update program, laporan penyaluran, transparansi, tanggung jawab',
                'sort_order' => 18,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana jika batas kuota program aktif (slot kampanye) saya sudah habis?',
                    'en' => 'What should I do if my active campaign quota (slot limit) has been reached?',
                ],
                'answer_html' => [
                    'id' => '<p>Untuk menjaga akuntabilitas penyaluran dan kualitas pendampingan, sistem memberikan batasan kuota program aktif bagi setiap Campaigner.</p><p>Jika kuota Anda telah penuh dan Anda ingin membuat program baru, Anda dapat mengajukan permohonan penambahan kuota melalui menu <strong>"Ajukan Tambahan Slot Program"</strong> pada dasbor akun Anda. Tim verifikator Insani Indonesia akan meninjau rekam jejak penyaluran, kelengkapan laporan Kabar Terbaru, dan kepatuhan program-program Anda sebelumnya sebelum menyetujui slot tambahan.</p>',
                    'en' => '<p>To ensure accountability and quality oversight, the platform limits the number of active campaigns each Campaigner can publish simultaneously.</p><p>If your quota is full and you need to launch a new campaign, you can submit a quota expansion request via <strong>"Request Additional Program Slots"</strong> in your Campaigner dashboard. Our verification team will review your track record, milestone reporting completeness, and compliance before approving additional slots.</p>',
                ],
                'category' => 'campaigner',
                'keywords' => 'slot program, batas program, kuota kampanye, ajukan slot, tambah kampanye',
                'sort_order' => 19,
            ],

            // ==================== FUNDRAISER ====================
            [
                'question' => [
                    'id' => 'Apa itu fitur Fundraiser di Insani Indonesia?',
                    'en' => 'What is the Fundraiser feature on Insani Indonesia?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Fundraiser</strong> adalah relawan kebaikan yang membantu menyebarluaskan sebuah program donasi yang sudah tayang di Insani Indonesia kepada keluarga, teman, atau komunitasnya.</p><p>Anda tidak perlu mengunggah dokumen lembaga atau membuat program sendiri; cukup pilih program yang Anda pedulikan, buat tautan referral khusus, dan ajak orang lain berdonasi melalui link Anda.</p>',
                    'en' => '<p>A <strong>Fundraiser</strong> is a volunteer ambassador who helps spread the word about published campaigns on Insani Indonesia to their family, friends, and networks.</p><p>You do not need legal documents or your own campaign; simply pick a cause you care about, generate a custom referral link, and inspire others to donate through your link.</p>',
                ],
                'category' => 'fundraiser',
                'keywords' => 'fundraiser, relawan kampanye, ajak donasi, link referral, duta kebaikan',
                'sort_order' => 20,
            ],
            [
                'question' => [
                    'id' => 'Siapa saja yang bisa menjadi Fundraiser?',
                    'en' => 'Who is eligible to become a Fundraiser?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Semua pengguna terdaftar di Insani Indonesia</strong> dapat menjadi Fundraiser secara gratis! Cukup buat akun dan login, lalu buka program donasi apa pun yang ingin Anda dukung.</p>',
                    'en' => '<p><strong>All registered users on Insani Indonesia</strong> can become Fundraisers for free! Simply register, sign in, and visit any active campaign you want to champion.</p>',
                ],
                'category' => 'fundraiser',
                'keywords' => 'siapa fundraiser, syarat fundraiser, daftar fundraiser',
                'sort_order' => 21,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana cara mendaftar dan menyebarkan program sebagai Fundraiser?',
                    'en' => 'How do I register and share campaigns as a Fundraiser?',
                ],
                'answer_html' => [
                    'id' => '<ol><li>Buka halaman program donasi di katalog <strong>Program Insani</strong>.</li><li>Pastikan Anda sudah login, lalu klik tombol <strong>"Jadi Fundraiser"</strong>.</li><li>Tentukan target donasi yang ingin Anda bantu himpun serta tuliskan pesan ajakan kebaikan Anda.</li><li>Sistem akan membuat <strong>Link Referral Khusus</strong> (contoh: <code>https://insani.id/program/bantu-yatim?ref=nama-anda-1234</code>).</li><li>Bagikan link tersebut ke WhatsApp, Instagram, Telegram, atau media sosial lainnya.</li></ol>',
                    'en' => '<ol><li>Visit any campaign page in our catalog.</li><li>Ensure you are logged in, then click the <strong>"Become a Fundraiser"</strong> button.</li><li>Set your personal fundraising target and customize your invitation message.</li><li>The system generates your <strong>Unique Referral Link</strong> (e.g., <code>https://insani.id/program/slug?ref=your-name-1234</code>).</li><li>Copy and share the link on WhatsApp, Instagram, Telegram, or other social platforms.</li></ol>',
                ],
                'category' => 'fundraiser',
                'keywords' => 'cara jadi fundraiser, buat link referral, bagikan program, ref code',
                'sort_order' => 22,
            ],
            [
                'question' => [
                    'id' => 'Di mana saya bisa memantau perolehan donasi yang berhasil saya himpun?',
                    'en' => 'Where can I track the donations I helped raise?',
                ],
                'answer_html' => [
                    'id' => '<p>Setiap donasi yang masuk melalui tautan referral Anda akan terlacak otomatis secara <em>real-time</em>. Anda dapat memantau total dana terkumpul, jumlah donatur yang tergerak, serta daftar kampanye aktif melalui halaman <strong>Dasbor Fundraiser Saya</strong>.</p>',
                    'en' => '<p>Every contribution made through your referral link is tracked automatically in real time. You can monitor your total funds raised, donor count, and active initiatives on your <strong>My Fundraiser Dashboard</strong>.</p>',
                ],
                'category' => 'fundraiser',
                'keywords' => 'pantau donasi, statistik fundraiser, dasbor fundraiser, akun fundraiser',
                'sort_order' => 23,
            ],
            [
                'question' => [
                    'id' => 'Apakah Fundraiser mendapatkan komisi atau imbalan uang?',
                    'en' => 'Do Fundraisers receive commissions or monetary compensation?',
                ],
                'answer_html' => [
                    'id' => '<p>Program Fundraiser di Insani Indonesia adalah <strong>gerakan kerelawanan sosial murni (non-profit)</strong>. 100% dana yang terkumpul disalurkan untuk program sosial yang Anda bantu.</p><p>Insani Indonesia memberikan apresiasi dalam bentuk lencana relawan profil serta sertifikat digital apresiasi kebaikan di dasbor akun Anda.</p>',
                    'en' => '<p>The Fundraiser program on Insani Indonesia is a <strong>purely non-profit philanthropic volunteer initiative</strong>. 100% of funds raised are allocated directly to the assisted beneficiaries.</p><p>Insani Indonesia honors your commitment by granting volunteer digital badges and downloadable appreciation certificates on your dashboard.</p>',
                ],
                'category' => 'fundraiser',
                'keywords' => 'komisi, gaji, insentif, uang fundraiser, sukarela',
                'sort_order' => 24,
            ],

            // ==================== KEAMANAN & LEGALITAS ====================
            [
                'question' => [
                    'id' => 'Apakah Yayasan Peduli Insani Indonesia memiliki izin resmi dan berbadan hukum?',
                    'en' => 'Does Insani Indonesia Foundation hold official legal entity status and permits?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Ya, resmi dan berbadan hukum sah.</strong></p><p>Yayasan Peduli Insani Indonesia didirikan pada 13 Februari 2019 dan telah disahkan oleh Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia melalui Surat Keputusan: <strong>SK-KUMHAM : AHU-0002557.AH.01.04.Tahun 2019</strong>.</p><p>Aktivitas penggalangan donasi dan penyaluran bantuan berpedoman pada UU Nomor 9 Tahun 1961 dan Peraturan Pemerintah Nomor 29 Tahun 1980.</p>',
                    'en' => '<p><strong>Yes, fully legal and officially registered.</strong></p><p>Yayasan Peduli Insani Indonesia was established on February 13, 2019, and ratified by the Ministry of Law and Human Rights of the Republic of Indonesia via Decree: <strong>SK-KUMHAM : AHU-0002557.AH.01.04.Tahun 2019</strong>.</p><p>Fundraising and charitable distributions comply with Law No. 9/1961 and Government Regulation No. 29/1980.</p>',
                ],
                'category' => 'keamanan',
                'keywords' => 'legalitas, badan hukum, sk kemenkumham, izin resmi, ahu, kemenkumham',
                'sort_order' => 25,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana Insani Indonesia melindungi privasi dan data pribadi pengguna?',
                    'en' => 'How does Insani Indonesia protect users privacy and personal data?',
                    'ar' => 'كيف تحمي إنساني إندونيسيا خصوصية المستخدمين وبياناتهم الشخصية؟',
                ],
                'answer_html' => [
                    'id' => '<p>Kami mematuhi <strong>UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>:</p><ul><li>Seluruh data dienkripsi dengan protokol SSL/HTTPS 256-bit standar industri perbankan.</li><li>Kami <strong>tidak pernah memperjualbelikan</strong> data nomor kontak, email, atau identitas donatur kepada pihak mana pun.</li><li>Data sensitif perbankan diproses langsung oleh payment gateway resmi Bank Indonesia tanpa disimpan di server kami.</li><li>Baca ketentuan lengkapnya di halaman Kebijakan Privasi.</li></ul>',
                    'en' => '<p>We strictly adhere to <strong>Law No. 27/2022 on Personal Data Protection (UU PDP)</strong>:</p><ul><li>All data transmissions are encrypted using banking-grade 256-bit SSL/HTTPS protocols.</li><li>We <strong>never sell or monetize</strong> contact phone numbers, emails, or personal identities to third parties.</li><li>Sensitive banking details are processed directly by Bank Indonesia-licensed gateways without touching our servers.</li><li>Read our complete terms on the Privacy Policy page.</li></ul>',
                    'ar' => '<p>نحن نلتزم بشكل صارم بـ <strong>القانون رقم 27 لسنة 2022 بشأن حماية البيانات الشخصية (UU PDP)</strong>:</p><ul><li>يتم تشفير جميع البيانات باستخدام بروتوكول SSL/HTTPS بتشفير 256 بت وفقاً لأعلى المعايير المصرفية.</li><li>نحن <strong>لا نبيع ولا نتاجر أبداً</strong> بأرقام الهواتف أو البريد الإلكتروني أو بيانات الهوية لأي طرف آخر.</li><li>تتم معالجة البيانات المصرفية الحساسة مباشرة عبر بوابات الدفع الرسمية المرخصة من بنك إندونيسيا دون حفظها على خوادمنا.</li><li>يمكنكم الاطلاع على الشروط الكاملة في صفحة سياسة الخصوصية.</li></ul>',
                ],
                'category' => 'keamanan',
                'keywords' => 'keamanan data, uu pdp, privasi, enkripsi, ssl, bocor data',
                'sort_order' => 26,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana jika saya menemukan program donasi yang mencurigakan atau indikasi penipuan?',
                    'en' => 'What should I do if I find a suspicious campaign or indication of fraud?',
                ],
                'answer_html' => [
                    'id' => '<p>Insani Indonesia menerapkan kebijakan <strong>zero tolerance</strong> terhadap pemalsuan informasi dan penipuan donasi.</p><p>Jika Anda menemukan kampanye fiktif, manipulasi kondisi medis, atau indikasi penyalahgunaan dana, Anda dapat langsung melapor melalui tautan resmi <strong>"Apakah penggalangan dana ini mencurigakan? Laporkan"</strong> di bagian bawah halaman kampanye yang bersangkutan.</p><p>Pilih kategori pelanggaran, tuliskan kronologi kecurigaan Anda, dan lampirkan bukti otentik (foto, tangkapan layar, kuitansi, atau dokumen medis). Laporan Anda akan menerima <strong>Nomor Tiket Pengaduan</strong> resmi untuk diproses secara prioritas oleh Tim Kepatuhan kami.</p>',
                    'en' => '<p>Insani Indonesia maintains a strict <strong>zero tolerance</strong> policy against fraudulent campaigns and misuse of donations.</p><p>If you encounter a suspicious campaign, fabricated medical condition, or misuse of funds, you can report it directly using the <strong>"Is this fundraising suspicious? Report"</strong> link on that campaign page.</p><p>Select the violation category, describe the timeline and reasons for suspicion, and attach authentic evidence (photos, screenshots, receipts, or medical records). You will receive an official <strong>Report Ticket Number</strong> for priority investigation by our Compliance Team.</p>',
                ],
                'category' => 'keamanan',
                'keywords' => 'lapor penipuan, fraud, mencurigakan, pengaduan, whistleblower, tiket laporan, laporkan kampanye',
                'sort_order' => 27,
            ],
            [
                'question' => [
                    'id' => 'Apakah identitas saya terlindungi jika melaporkan kampanye mencurigakan?',
                    'en' => 'Is my identity protected when reporting a suspicious campaign?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Sangat aman dan terjamin kerahasiaannya (Whistleblower Protection).</strong></p><p>Sesuai dengan Kebijakan Privasi dan UU Perlindungan Data Pribadi (UU PDP), identitas pelapor (nama, email, nomor WhatsApp) dan dokumen bukti yang Anda lampirkan <strong>tidak akan pernah dibagikan atau diberitahukan kepada Campaigner yang dilaporkan</strong>. Data Anda hanya dapat diakses secara terbatas oleh Tim Kepatuhan Insani Indonesia untuk keperluan verifikasi dan konfirmasi hasil tindak lanjut.</p>',
                    'en' => '<p><strong>Completely safe and confidential (Whistleblower Protection).</strong></p><p>In accordance with our Privacy Policy and Personal Data Protection laws, the reporter\'s identity (name, email, phone number) and evidence submitted <strong>will never be shared with or disclosed to the reported Campaigner</strong>. Your data is strictly accessible only by Insani Indonesia\'s Compliance Team for investigation and update purposes.</p>',
                ],
                'category' => 'keamanan',
                'keywords' => 'whistleblower, privasi pelapor, rahasia pelapor, keamanan pelapor, lindungi identitas',
                'sort_order' => 28,
            ],
            [
                'question' => [
                    'id' => 'Apa tindakan yang diambil Insani Indonesia terhadap kampanye yang dilaporkan melanggar?',
                    'en' => 'What action does Insani Indonesia take against reported campaigns?',
                ],
                'answer_html' => [
                    'id' => '<p>Setiap laporan pengaduan yang memenuhi bukti permulaan akan ditindaklanjuti secara tegas:</p><ol><li><strong>Investigasi &amp; Klarifikasi:</strong> Tim kepatuhan meminta klarifikasi tertulis dan bukti dokumen asli kepada Campaigner dalam waktu 2 x 24 jam kerja.</li><li><strong>Pembekuan Dana (Freeze):</strong> Hak pencairan dana kampanye dibekukan sementara selama proses investigasi berlangsung demi mengamankan dana publik.</li><li><strong>Penurunan Kampanye (Take Down):</strong> Jika terbukti terjadi manipulasi data atau penipuan, kampanye akan diturunkan secara permanen dari website, akun campaigner diblokir, dan temuan pidana akan diteruskan ke aparat penegak hukum (Kepolisian &amp; Kemensos RI).</li></ol>',
                    'en' => '<p>Every report with initial supporting evidence is handled decisively:</p><ol><li><strong>Investigation &amp; Clarification:</strong> The compliance team requests written clarification and original evidence from the Campaigner within 2 business days.</li><li><strong>Fund Freeze:</strong> Campaign disbursement privileges are temporarily frozen during the investigation to safeguard public donations.</li><li><strong>Campaign Takedown:</strong> If fraud or data manipulation is proven, the campaign is permanently taken down, the campaigner account is banned, and criminal findings are referred to law enforcement (Police &amp; Ministry of Social Affairs).</li></ol>',
                ],
                'category' => 'keamanan',
                'keywords' => 'sanksi kampanye, takedown, freeze dana, pembekuan saldo, investigasi kecurangan, penindakan hukum',
                'sort_order' => 29,
            ],
            [
                'question' => [
                    'id' => 'Apakah donasi yang sudah dibayarkan dapat dibatalkan atau dikembalikan (Refund)?',
                    'en' => 'Can donations already made be canceled or refunded?',
                ],
                'answer_html' => [
                    'id' => '<p>Sesuai dengan Syarat dan Ketentuan, setiap donasi yang telah sukses bersifat <strong>sukarela, final, dan tidak dapat dibatalkan (non-refundable)</strong> karena dana langsung dialokasikan untuk kebutuhan penerima manfaat.</p><p>Pengembalian dana hanya dipertimbangkan jika terjadi kekeliruan sistem perbankan seperti pendebetan ganda yang disertai bukti sah mutasi rekening.</p>',
                    'en' => '<p>Per our Terms &amp; Conditions, all successfully confirmed donations are <strong>voluntary, final, and non-refundable</strong> as funds are immediately allocated to beneficiaries.</p><p>Refunds are considered solely in cases of verified banking technical anomalies (such as duplicate debiting) corroborated by official bank statements.</p>',
                ],
                'category' => 'keamanan',
                'keywords' => 'refund, batal donasi, tarik uang donasi, pengembalian dana',
                'sort_order' => 30,
            ],

            // ==================== LEMBAGA (TENTANG KAMI) ====================
            [
                'question' => [
                    'id' => 'Apa visi dan fokus pergerakan kemanusiaan Insani Indonesia?',
                    'en' => 'What is the vision and humanitarian focus of Insani Indonesia?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Insani Indonesia</strong> (Yayasan Peduli Insani Indonesia) merupakan lembaga nirlaba independen yang berfokus pada penanganan krisis kemanusiaan, pemberdayaan masyarakat, pendidikan generasi bangsa, dan bantuan kebencanaan.</p><p>Visi utama kami adalah menjadi pelopor kolaborasi kebaikan lintas batas demi mewujudkan masyarakat yang berdaya, mandiri, dan sejahtera dalam naungan nilai-nilai kemanusiaan yang universal.</p>',
                    'en' => '<p><strong>Insani Indonesia</strong> (Yayasan Peduli Insani Indonesia) is an independent non-profit organization dedicated to humanitarian relief, community empowerment, educational advancement, and emergency disaster assistance.</p><p>Our vision is to pioneer borderless compassionate collaboration to build empowered, self-reliant, and thriving communities under universal humanitarian values.</p>',
                ],
                'category' => 'lembaga',
                'keywords' => 'visi, profil, latar belakang, fokus gerakan, kemanusiaan',
                'sort_order' => 31,
            ],
            [
                'question' => [
                    'id' => 'Apakah Insani Indonesia memiliki legalitas dan izin resmi dari pemerintah?',
                    'en' => 'Does Insani Indonesia have official government legality and operating licenses?',
                ],
                'answer_html' => [
                    'id' => '<p><strong>Ya, sah dan berizin resmi.</strong></p><p>Insani Indonesia didirikan pada 13 Februari 2019 dan telah mengantongi pengesahan badan hukum dari Kementerian Hukum dan HAM Republik Indonesia No. <strong>AHU-0002557.AH.01.04.Tahun 2019</strong>, izin operasional kegiatan sosial terdaftar, serta NPWP resmi lembaga.</p>',
                    'en' => '<p><strong>Yes, fully licensed and recognized.</strong></p><p>Insani Indonesia was established on February 13, 2019, with legal entity ratification from the Ministry of Law and Human Rights No. <strong>AHU-0002557.AH.01.04.Tahun 2019</strong>, valid social operational permits, and corporate tax registration.</p>',
                ],
                'category' => 'lembaga',
                'keywords' => 'legalitas, sk kemenkumham, izin resmi, badan hukum, akta yayasan',
                'sort_order' => 32,
            ],
            [
                'question' => [
                    'id' => 'Ke mana saja jangkauan wilayah penyaluran bantuan Insani Indonesia?',
                    'en' => 'What regions are covered by Insani Indonesia humanitarian aid?',
                ],
                'answer_html' => [
                    'id' => '<p>Insani Indonesia menyalurkan bantuan kemanusiaan ke berbagai pelosok Indonesia (Jabodetabek, Jawa, Banten, Sumatera, Kalimantan, Sulawesi, hingga kawasan 3T di Indonesia Timur) serta respons solidaritas darurat internasional untuk negara-negara yang dilanda krisis kemanusiaan seperti Palestina, Suriah, dan Yaman melalui jejaring mitra kemanusiaan terpercaya.</p>',
                    'en' => '<p>Insani Indonesia delivers aid throughout remote regions of Indonesia (Java, Sumatra, Kalimantan, Sulawesi, and outermost 3T regions in Eastern Indonesia) as well as emergency relief for international crisis zones including Palestine, Syria, and Yemen via verified humanitarian coalitions.</p>',
                ],
                'category' => 'lembaga',
                'keywords' => 'wilayah penyaluran, jangkauan bantuan, palestina, darurat bencana, daerah 3t',
                'sort_order' => 33,
            ],
            [
                'question' => [
                    'id' => 'Bagaimana prinsip transparansi dan akuntabilitas pengelolaan dana yayasan?',
                    'en' => 'What are the principles of transparency and financial accountability practiced by the foundation?',
                ],
                'answer_html' => [
                    'id' => '<p>Setiap amanah donasi dikelola dengan prinsip tata kelola yang baik (<em>Good Governance</em>):</p><ul><li>Donasi diverifikasi secara sistemik dengan pencatatan pembukuan digital.</li><li>Laporan berkala penyaluran program dipublikasikan secara terbuka melalui menu <strong>Kabar Terbaru</strong> di halaman masing-masing program.</li><li>Donatur dapat mengunduh <strong>Kuitansi Resmi Elektronik</strong> sah yang dilengkapi kode verifikasi unik.</li><li>Laporan keuangan yayasan diaudit secara berkala untuk menjamin integritas penggunaan dana.</li></ul>',
                    'en' => '<p>Every public donation is governed under strict Good Governance standards:</p><ul><li>Systemic verification with digital bookkeeping reconciliation.</li><li>Periodic milestone updates published openly under the <strong>Recent Updates</strong> tab on each campaign page.</li><li>Donors can download official electronic receipts with cryptographic verification.</li><li>Foundation financial statements are audited independently by certified public accountants.</li></ul>',
                ],
                'category' => 'lembaga',
                'keywords' => 'transparansi, akuntabilitas, audit, laporan penyaluran, amanah',
                'sort_order' => 34,
            ],
            [
                'question' => [
                    'id' => 'Di mana saya bisa melihat dan mengunduh laporan keuangan resmi yayasan yang telah diaudit?',
                    'en' => 'Where can I view and download the official audited financial reports of the foundation?',
                ],
                'answer_html' => [
                    'id' => '<p>Sebagai wujud pertanggungjawaban publik dan prinsip keterbukaan tata kelola (<em>Good Governance</em>), Insani Indonesia mempublikasikan laporan keuangan tahunan yang telah diaudit secara independen oleh Kantor Akuntan Publik (KAP).</p><p>Anda dapat mengakses, meninjau, dan mengunduh seluruh dokumen laporan keuangan tahunan tersebut secara bebas dalam format PDF melalui halaman <a href="/laporan-keuangan" class="text-insani-blue font-semibold hover:underline"><strong>Laporan Keuangan Resmi</strong></a>.</p>',
                    'en' => '<p>As part of our commitment to public transparency and good corporate governance, Insani Indonesia publishes annual financial statements audited independently by Certified Public Accountants (KAP).</p><p>You can freely view and download all annual financial audit reports in PDF format from our official <a href="/laporan-keuangan" class="text-insani-blue font-semibold hover:underline"><strong>Financial Reports Page</strong></a>.</p>',
                ],
                'category' => 'lembaga',
                'keywords' => 'laporan keuangan, audit kap, akuntabilitas, transparansi yayasan, download laporan keuangan',
                'sort_order' => 35,
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
                'sort_order' => 36,
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
                'sort_order' => 37,
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
                'sort_order' => 38,
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
                'sort_order' => 39,
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

            if ($existing) {
                if (! isset($questionData['ar']) && $existing->getTranslation('question', 'ar', false)) {
                    $questionData['ar'] = $existing->getTranslation('question', 'ar', false);
                }
                if (! isset($answerData['ar']) && $existing->getTranslation('answer_html', 'ar', false)) {
                    $answerData['ar'] = $existing->getTranslation('answer_html', 'ar', false);
                }
            }

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
