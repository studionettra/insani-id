import React, { useState, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Search, 
    X, 
    ChevronDown, 
    Heart, 
    Rocket, 
    Users, 
    ShieldCheck, 
    Sparkles, 
    Receipt, 
    CreditCard, 
    MessageCircle, 
    Phone, 
    Mail, 
    Clock, 
    ExternalLink, 
    HelpCircle,
    ArrowRight,
    Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqItem {
    id: string;
    category: string;
    question: string;
    answer: React.ReactNode;
    keywords: string[];
}

const FAQ_DATA: FaqItem[] = [
    // ==================== DONATUR ====================
    {
        id: 'cara-donasi',
        category: 'donatur',
        question: 'Bagaimana cara berdonasi di Insani Indonesia?',
        keywords: ['cara donasi', 'langkah donasi', 'metode pembayaran', 'qris', 'transfer', 'virtual account'],
        answer: (
            <div className="space-y-3 text-slate-600">
                <p>Berdonasi di Insani Indonesia sangat praktis dan aman:</p>
                <ol className="list-decimal pl-5 space-y-1.5">
                    <li>Buka katalog <Link href="/program" className="text-insani-blue font-semibold hover:underline">Program Donasi</Link> dan pilih kampanye yang ingin Anda bantu.</li>
                    <li>Klik tombol <strong>"Donasi Sekarang"</strong> pada halaman kampanye.</li>
                    <li>Tentukan nominal donasi (minimal Rp 10.000).</li>
                    <li>Masukkan nama, email, dan nomor WhatsApp, atau centang <em>"Sembunyikan Nama Saya (Anonim)"</em> jika ingin berdonasi sebagai Hamba Allah.</li>
                    <li>Pilih metode pembayaran otomatis (QRIS, VA Bank, E-Wallet) atau transfer manual bank (BSI / BRI).</li>
                    <li>Selesaikan pembayaran sesuai instruksi. Pelajari panduan visual selengkapnya di <Link href="/cara-donasi" className="text-insani-blue font-semibold hover:underline">Halaman Cara Berdonasi</Link>.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'donasi-guest',
        category: 'donatur',
        question: 'Apakah saya bisa berdonasi tanpa mendaftar akun terlebih dahulu?',
        keywords: ['guest', 'tanpa akun', 'tanpa login', 'tamu', 'langsung donasi'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Ya, tentu saja!</strong> Anda dapat langsung berdonasi sebagai donatur tamu (guest) tanpa perlu registrasi atau login akun.</p>
                <p>Cukup cantumkan alamat email dan nomor WhatsApp aktif Anda. Sistem kami akan secara otomatis mengirimkan rincian pembayaran, notifikasi penerimaan donasi, serta tautan kuitansi resmi ke kontak Anda.</p>
            </div>
        )
    },
    {
        id: 'donasi-anonim',
        category: 'donatur',
        question: 'Apa fungsi opsi "Sembunyikan Nama Saya (Anonim)"?',
        keywords: ['anonim', 'sembunyikan nama', 'hamba allah', 'privasi nama', 'rahasia'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Jika Anda mencentang opsi anonim saat melakukan donasi, nama Anda tidak akan pernah ditampilkan di daftar donatur publik halaman program. Sistem akan menampilkan donasi Anda sebagai <strong>"Hamba Allah"</strong>.</p>
                <p>Identitas asli Anda tetap tersimpan secara aman dan terenkripsi di sistem internal kami hanya untuk keperluan verifikasi pembayaran dan audit keuangan resmi sesuai ketentuan perbankan.</p>
            </div>
        )
    },
    {
        id: 'cek-status-kuitansi',
        category: 'donatur',
        question: 'Bagaimana cara mengecek status donasi dan mengunduh kuitansi resmi jika saya donatur tamu?',
        keywords: ['cek status', 'kuitansi', 'receipt', 'kode donasi', 'bukti donasi', 'download kuitansi'],
        answer: (
            <div className="space-y-3 text-slate-600">
                <p>Setiap transaksi donasi akan memiliki <strong>Kode Donasi Unik</strong> (contoh: <code>DON-XXXXXXXXXX</code>) yang dikirimkan ke email atau layar sukses donasi Anda:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                    <li>Kunjungi halaman <Link href="/cek-donasi" className="text-insani-blue font-semibold hover:underline">Cek Status Donasi</Link>.</li>
                    <li>Masukkan kode donasi atau alamat email Anda.</li>
                    <li>Jika donasi telah berstatus <strong>Lunas</strong>, Anda dapat langsung mengunduh dan mencetak <strong>Kuitansi Resmi Elektronik</strong> resmi ber-QR Code validasi keabsahan yayasan.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'perbedaan-pembayaran',
        category: 'donatur',
        question: 'Apa perbedaan metode pembayaran otomatis dan transfer manual bank?',
        keywords: ['otomatis', 'manual', 'verifikasi otomatis', 'konfirmasi manual', 'xendit', 'qris'],
        answer: (
            <div className="space-y-3 text-slate-600">
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>Pembayaran Otomatis (QRIS, Virtual Account, E-Wallet):</strong> Donasi diverifikasi secara <em>real-time</em> oleh payment gateway berlisensi Bank Indonesia (Xendit). Donasi terkonfirmasi lunas dalam beberapa detik tanpa perlu mengirimkan bukti transfer.
                    </li>
                    <li>
                        <strong>Transfer Manual Bank (BSI & BRI Giro):</strong> Anda mentransfer dana langsung ke rekening giro resmi yayasan. Setelah transfer, Anda <strong>wajib mengonfirmasi</strong> dengan mengirimkan foto/screenshot bukti transfer ke WhatsApp Customer Service kami agar admin keuangan memverifikasinya.
                    </li>
                </ul>
            </div>
        )
    },
    {
        id: 'sinkronisasi-email',
        category: 'donatur',
        question: 'Jika saat ini saya berdonasi sebagai tamu, apakah riwayatnya tersimpan jika kelak saya membuat akun?',
        keywords: ['sinkronisasi', 'riwayat donasi', 'daftar akun', 'email sama', 'history'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Ya, otomatis tersinkronisasi!</strong></p>
                <p>Sistem Insani Indonesia melacak donasi berdasarkan alamat email Anda. Begitu Anda mendaftar akun dengan alamat email yang sama dengan yang pernah Anda gunakan saat berdonasi sebagai tamu, seluruh riwayat donasi terdahulu akan langsung muncul di halaman <strong>Riwayat Donasi Saya</strong> di dasbor akun Anda.</p>
            </div>
        )
    },
    {
        id: 'keuntungan-member',
        category: 'donatur',
        question: 'Apa keuntungan membuat akun dan login sebagai Donatur di Insani Indonesia?',
        keywords: ['keuntungan akun', 'member', 'manfaat akun', 'dasbor donatur', 'sertifikat'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Dengan memiliki akun donatur terdaftar, Anda dapat:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                    <li>Memantau akumulasi total donasi kebaikan yang telah Anda salurkan di dasbor pribadi.</li>
                    <li>Mengunduh kembali seluruh arsip kuitansi resmi kapan saja (sangat berguna untuk pelaporan zakat atau pajak).</li>
                    <li>Mendapatkan notifikasi laporan penyaluran (<em>Kabar Terbaru</em>) langsung dari program yang Anda dukung.</li>
                    <li>Dapat langsung mendaftar sebagai <strong>Relawan Kampanye</strong> untuk melipatgandakan dampak kebaikan.</li>
                </ul>
            </div>
        )
    },

    // ==================== CAMPAIGNER ====================
    {
        id: 'apa-itu-campaigner',
        category: 'campaigner',
        question: 'Apa itu Campaigner di Insani Indonesia?',
        keywords: ['campaigner', 'penggalang dana', 'buat kampanye', 'inisiasi program'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Campaigner</strong> adalah individu, komunitas, lembaga sosial, atau yayasan terverifikasi yang dipercaya untuk menginisiasi dan mengelola kampanye penggalangan dana di platform Insani Indonesia.</p>
                <p>Campaigner bertanggung jawab penuh atas kebenaran informasi program dan penyaluran amanah dana donasi kepada para penerima manfaat.</p>
            </div>
        )
    },
    {
        id: 'apa-itu-verifikasi',
        category: 'campaigner',
        question: 'Apa itu Verifikasi Akun dan mengapa saya perlu melakukannya sebelum bisa menggalang dana?',
        keywords: ['verifikasi akun', 'verifikasi identitas', 'kenapa verifikasi', 'wajib verifikasi'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Verifikasi Akun</strong> adalah proses pemeriksaan identitas yang wajib dijalani oleh calon campaigner sebelum diizinkan membuat program penggalangan dana dan menerima pencairan dana.</p>
                <p>Verifikasi Akun diterapkan oleh Insani Indonesia karena beberapa alasan penting:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Melindungi Donatur:</strong> Memastikan setiap program digalang oleh individu atau lembaga yang identitasnya sudah terverifikasi nyata, bukan fiktif.</li>
                    <li><strong>Kepatuhan Hukum:</strong> Proses ini diwajibkan oleh regulasi perbankan dan pemerintah (PPATK) untuk mencegah penyalahgunaan dana.</li>
                    <li><strong>Keamanan Pencairan Dana:</strong> Dana donasi hanya dapat dicairkan ke rekening bank atas nama yang sudah lolos verifikasi akun, sehingga amanah donatur terjaga.</li>
                </ul>
                <p className="text-xs bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-700">
                    <strong>Catatan:</strong> Verifikasi Akun hanya berlaku untuk Campaigner. Jika Anda hanya ingin membantu menyebarkan program orang lain tanpa membuat program sendiri, Anda cukup mendaftar akun biasa dan langsung bisa menjadi <strong>Fundraiser</strong> tanpa perlu verifikasi identitas.
                </p>
            </div>
        )
    },
    {
        id: 'beda-campaigner-fundraiser',
        category: 'campaigner',
        question: 'Apa perbedaan antara Campaigner dan Fundraiser?',
        keywords: ['beda campaigner fundraiser', 'campaigner vs fundraiser', 'perbedaan peran', 'fundraiser campaigner'],
        answer: (
            <div className="space-y-3 text-slate-600">
                <p>Keduanya adalah pilar gerakan kebaikan di Insani Indonesia, namun memiliki peran yang berbeda:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">🚀 Campaigner</p>
                        <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600">
                            <li><strong>Membuat & mengelola</strong> program penggalangan dana sendiri.</li>
                            <li>Wajib melewati proses <strong>verifikasi akun</strong> (upload dokumen identitas).</li>
                            <li>Bertanggung jawab atas <strong>penyaluran dana</strong> ke penerima manfaat.</li>
                            <li>Wajib posting <strong>Kabar Terbaru</strong> sebagai laporan pertanggungjawaban.</li>
                        </ul>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">✨ Fundraiser</p>
                        <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600">
                            <li><strong>Membantu menyebarkan</strong> program milik campaigner lain.</li>
                            <li><strong>Tidak perlu verifikasi akun</strong> — cukup daftar akun biasa.</li>
                            <li>Membuat <strong>tautan referral unik</strong> untuk dilacak kontribusinya.</li>
                            <li>Pantau statistik donasi yang berhasil dihimpun lewat dasbor pribadi.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'syarat-verifikasi-campaigner',
        category: 'campaigner',
        question: 'Apa perbedaan syarat verifikasi Campaigner Individu vs Lembaga/Yayasan?',
        keywords: ['verifikasi', 'syarat campaigner', 'dokumen verifikasi', 'ktp', 'sk kemenkumham', 'npwp'],
        answer: (
            <div className="space-y-3 text-slate-600">
                <p><strong>Verifikasi Akun</strong> adalah proses verifikasi identitas standar perbankan dan industri keuangan digital untuk memastikan keaslian data calon campaigner sebelum diizinkan membuat program dan menerima dana donasi.</p>
                <p>Seluruh calon campaigner wajib lolos verifikasi di halaman <Link href="/buat-program" className="text-insani-blue font-semibold hover:underline">Pendaftaran Campaigner</Link>. Dokumen yang dibutuhkan berbeda berdasarkan tipe campaigner:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-800 mb-1">Campaigner Individu:</p>
                        <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600">
                            <li>Foto e-KTP asli (jelas dan terbaca).</li>
                            <li>Foto selfie memegang e-KTP asli.</li>
                            <li>Buku tabungan / rekening atas nama pribadi sesuai e-KTP.</li>
                            <li>Alamat domisili & no. WhatsApp aktif.</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-800 mb-1">Campaigner Lembaga / Yayasan:</p>
                        <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600">
                            <li>SK Kemenkumham / Izin Lembaga resmi.</li>
                            <li>NPWP resmi atas nama Lembaga.</li>
                            <li>Buku rekening/rekening koran <strong>atas nama Lembaga</strong> (bukan nama pribadi).</li>
                            <li>KTP penanggung jawab resmi lembaga.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'lama-verifikasi-akun',
        category: 'campaigner',
        question: 'Berapa lama proses verifikasi akun Campaigner?',
        keywords: ['lama verifikasi', 'durasi verifikasi', 'review verifikasi', 'berapa hari'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Tim verifikasi Insani Indonesia memeriksa keabsahan dokumen verifikasi dalam waktu <strong>1 x 24 jam hingga maksimal 2 x 24 jam kerja</strong> (Senin - Jumat).</p>
                <p>Pemberitahuan hasil verifikasi (Disetujui / Butuh Revisi / Ditolak) akan dikirimkan via email dan dapat dicek langsung pada menu status akun Anda.</p>
            </div>
        )
    },
    {
        id: 'alur-buat-program',
        category: 'campaigner',
        question: 'Bagaimana alur pengajuan program baru hingga tayang di website?',
        keywords: ['buat program', 'alur kurasi', 'pending review', 'published', 'approval', 'daftar campaigner', 'dasbor campaigner'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Alur penerbitan program donasi terdiri dari 5 langkah:</p>
                <ol className="list-decimal pl-5 space-y-1.5">
                    <li><strong>Daftar & Verifikasi Akun:</strong> Kunjungi halaman <Link href="/buat-program" className="text-insani-blue font-semibold hover:underline">Pendaftaran Campaigner</Link>, lengkapi formulir verifikasi (data diri, rekening bank, dan dokumen pendukung), lalu kirimkan untuk ditinjau tim kami.</li>
                    <li><strong>Persetujuan Verifikasi:</strong> Tim Insani Indonesia memverifikasi dokumen dalam 1–2 hari kerja. Notifikasi hasil dikirim via email.</li>
                    <li><strong>Buat Draf Program:</strong> Setelah verifikasi disetujui, Anda dapat membuat program baru dari dasbor akun — isi data kampanye, target donasi, batas waktu, foto utama, dan narasi cerita.</li>
                    <li><strong>Kurasi oleh Tim:</strong> Program diperiksa oleh tim kurator Insani Indonesia untuk kepatuhan konten dan kelayakan penyaluran.</li>
                    <li><strong>Program Tayang:</strong> Setelah disetujui admin, program mulai aktif menerima donasi dari publik luas.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'mekanisme-disbursement',
        category: 'campaigner',
        question: 'Bagaimana mekanisme dan syarat pencairan dana?',
        keywords: ['pencairan dana', 'disbursement', 'tarik dana', 'syarat pencairan', 'minimal pencairan'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Campaigner dapat mengajukan pencairan donasi yang telah terkumpul melalui menu Pencairan Dana di dasbor program dengan ketentuan:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                    <li>Nominal pencairan minimal adalah <strong>Rp 10.000</strong> dan tidak melebihi sisa saldo bersih donasi yang tersedia.</li>
                    <li>Pencairan hanya ditransfer ke <strong>rekening bank terdaftar yang telah lolos verifikasi akun</strong>.</li>
                    <li>Proses transfer perbankan memerlukan waktu 1–3 hari kerja setelah permohonan disetujui tim finance.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'biaya-platform',
        category: 'campaigner',
        question: 'Berapa biaya operasional platform yang dikenakan pada program?',
        keywords: ['biaya operasional', 'potongan platform', 'fee', 'persentase potongan', 'uu 9 1961'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Insani Indonesia beroperasi secara transparan sesuai UU No. 9 Tahun 1961 dan ketentuan Kementerian Sosial RI:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                    <li>Maksimal <strong>10%</strong> untuk program sosial, kemanusiaan umum, dan kesehatan sebagai biaya operasional platform dan pemeliharaan teknologi.</li>
                    <li><strong>0% (bebas potongan platform)</strong> untuk program tanggap bencana alam darurat tertentu.</li>
                    <li>Biaya administrasi pihak ketiga (payment gateway seperti perbankan/QRIS) dipotong sesuai tarif standar resmi Bank Indonesia.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'kewajiban-kabar-terbaru',
        category: 'campaigner',
        question: 'Mengapa Campaigner wajib memposting "Kabar Terbaru" secara berkala?',
        keywords: ['kabar terbaru', 'update program', 'laporan penyaluran', 'transparansi', 'tanggung jawab'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Setiap Campaigner memegang amanah dari para donatur. Oleh karena itu, Campaigner <strong>wajib mengunggah dokumentasi dan cerita realisasi penyaluran dana</strong> melalui fitur "Kabar Terbaru".</p>
                <p>Pembaruan ini akan langsung dikirimkan ke email seluruh donatur program tersebut. Akun campaigner yang lalai membuat laporan pertanggungjawaban dapat ditangguhkan pencairan dananya demi menjaga integritas platform.</p>
            </div>
        )
    },
    {
        id: 'apa-itu-kabar-terbaru',
        category: 'campaigner',
        question: 'Apa itu fitur "Kabar Terbaru" dan di mana bisa dilihat?',
        keywords: ['kabar terbaru', 'tab kabar', 'update program', 'laporan penyaluran', 'notifikasi donatur'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Kabar Terbaru</strong> adalah fitur laporan perkembangan program yang wajib diposting oleh Campaigner secara berkala sebagai bentuk pertanggungjawaban kepada para donatur.</p>
                <p>Sebagai donatur atau pengunjung, Anda dapat melihat semua laporan ini di tab <strong>"Kabar"</strong> pada halaman detail setiap program. Tab ini menampilkan semua pembaruan yang telah diunggah campaigner, mulai dari foto penyaluran, narasi kegiatan, hingga dokumentasi penerima manfaat.</p>
                <ul className="list-disc pl-5 space-y-1.5">
                    <li>Setiap kali campaigner memposting kabar baru, seluruh donatur program tersebut akan mendapat <strong>notifikasi email otomatis</strong>.</li>
                    <li>Kabar Terbaru adalah indikator utama transparansi dan akuntabilitas sebuah program.</li>
                    <li>Program yang tidak memiliki kabar terbaru setelah menerima donasi dapat dilaporkan ke tim Insani Indonesia.</li>
                </ul>
            </div>
        )
    },

    // ==================== FUNDRAISER ====================
    {
        id: 'apa-itu-fundraiser',
        category: 'fundraiser',
        question: 'Apa itu fitur Fundraiser di Insani Indonesia?',
        keywords: ['fundraiser', 'relawan kampanye', 'ajak donasi', 'link referral', 'duta kebaikan'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Fundraiser</strong> adalah relawan kebaikan yang membantu menyebarluaskan sebuah program donasi yang sudah tayang di Insani Indonesia kepada keluarga, teman, atau komunitasnya.</p>
                <p>Anda tidak perlu mengunggah dokumen lembaga atau membuat program sendiri; cukup pilih program yang Anda pedulikan, buat tautan referral khusus, dan ajak orang lain berdonasi melalui link Anda.</p>
            </div>
        )
    },
    {
        id: 'siapa-bisa-jadi-fundraiser',
        category: 'fundraiser',
        question: 'Siapa saja yang bisa menjadi Fundraiser?',
        keywords: ['siapa fundraiser', 'syarat fundraiser', 'daftar fundraiser'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Semua pengguna terdaftar di Insani Indonesia</strong> dapat menjadi Fundraiser secara gratis! Cukup buat akun dan login, lalu buka program donasi apa pun yang ingin Anda dukung.</p>
            </div>
        )
    },
    {
        id: 'cara-daftar-fundraiser',
        category: 'fundraiser',
        question: 'Bagaimana cara mendaftar dan menyebarkan program sebagai Fundraiser?',
        keywords: ['cara jadi fundraiser', 'buat link referral', 'bagikan program', 'ref code', 'gabung fundraiser', 'pesan ajakan', 'target pribadi'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <ol className="list-decimal pl-5 space-y-1.5">
                    <li>Buka halaman program donasi di katalog <Link href="/program" className="text-insani-blue font-semibold hover:underline">Program Insani</Link>.</li>
                    <li>Pastikan Anda sudah login, lalu klik tombol <strong>"Gabung Jadi Fundraiser"</strong> (ada di tab Fundraiser atau di sidebar kanan halaman program).</li>
                    <li>Isi dua informasi opsional pada formulir yang muncul:
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                            <li><strong>Target Pribadi (opsional):</strong> Nominal donasi yang ingin Anda bantu kumpulkan dari jaringan Anda.</li>
                            <li><strong>Pesan Ajakan (opsional):</strong> Tulis kalimat motivasi personal yang akan ditampilkan di banner referral Anda kepada calon donatur.</li>
                        </ul>
                    </li>
                    <li>Sistem akan membuat <strong>Tautan Referral Unik</strong> khusus Anda (contoh: <code>insani.id/program/bantu-yatim?ref=kode-anda</code>).</li>
                    <li>Salin tautan tersebut dan bagikan ke WhatsApp, Instagram, Telegram, atau media sosial lainnya untuk mengajak kebaikan.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'pantau-statistik-fundraiser',
        category: 'fundraiser',
        question: 'Di mana saya bisa memantau perolehan donasi yang berhasil saya himpun?',
        keywords: ['pantau donasi', 'statistik fundraiser', 'dasbor fundraiser', 'akun fundraiser'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Setiap donasi yang masuk melalui tautan referral Anda akan terlacak otomatis secara <em>real-time</em>. Anda dapat memantau total dana terkumpul, jumlah donatur yang tergerak, serta daftar kampanye aktif melalui halaman <Link href="/akun/fundraiser" className="text-insani-blue font-semibold hover:underline">Dasbor Fundraiser Saya</Link>.</p>
                <p>Di dasbor tersebut, setiap program yang Anda dukung ditampilkan lengkap dengan tautan referral, tombol salin tautan, tombol bagikan ke WhatsApp, serta metrik: total terkumpul, jumlah donatur, dan target pribadi (jika Anda mengisinya).</p>
            </div>
        )
    },
    {
        id: 'fundraiser-referral-banner',
        category: 'fundraiser',
        question: 'Apa yang terjadi ketika seseorang membuka tautan referral saya?',
        keywords: ['link referral', 'banner referral', 'tautan fundraiser', 'ref', 'pengajak'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Ketika seseorang membuka tautan referral Anda (yang mengandung kode unik <code>?ref=kode-anda</code>), halaman program donasi yang dituju akan secara otomatis menampilkan sebuah <strong>banner khusus</strong> di bagian atas.</p>
                <p>Banner tersebut memuat:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Badge <em>"Relawan Fundraiser"</em> berwarna hijau.</li>
                    <li>Nama Anda sebagai orang yang mengajak berdonasi.</li>
                    <li>Pesan ajakan personal yang Anda tulis saat mendaftar fundraiser (jika ada).</li>
                </ul>
                <p>Fitur ini dirancang untuk membangun kepercayaan donatur — mereka tahu siapa yang mengajak mereka dan merasa lebih terhubung secara personal dengan gerakan kebaikan tersebut.</p>
            </div>
        )
    },
    {
        id: 'komisi-fundraiser',
        category: 'fundraiser',
        question: 'Apakah Fundraiser mendapatkan komisi atau imbalan uang?',
        keywords: ['komisi', 'gaji', 'insentif', 'uang fundraiser', 'sukarela'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Program Fundraiser di Insani Indonesia adalah <strong>gerakan kerelawanan sosial murni (non-profit)</strong>. 100% dana yang terkumpul melalui tautan referral Anda akan disalurkan sepenuhnya untuk program sosial yang Anda bantu — tidak ada potongan komisi.</p>
                <p>Imbalan terbesar menjadi Fundraiser adalah kontribusi nyata: Anda dapat melihat langsung di dasbor seberapa besar dampak yang berhasil Anda gerakan — total donasi terhimpun dan berapa banyak orang yang Anda ajak untuk berbuat kebaikan.</p>
            </div>
        )
    },

    // ==================== KEAMANAN & LEGALITAS ====================
    {
        id: 'legalitas-yayasan',
        category: 'keamanan',
        question: 'Apakah Yayasan Peduli Insani Indonesia memiliki izin resmi dan berbadan hukum?',
        keywords: ['legalitas', 'badan hukum', 'sk kemenkumham', 'izin resmi', 'ahu', 'kemenkumham'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p><strong>Ya, resmi dan berbadan hukum sah.</strong></p>
                <p>Yayasan Peduli Insani Indonesia didirikan pada 13 Februari 2019 dan telah disahkan oleh Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia melalui Surat Keputusan: <strong>SK-KUMHAM : AHU-0002557.AH.01.04.Tahun 2019</strong>.</p>
                <p>Aktivitas penggalangan donasi dan penyaluran bantuan berpedoman pada UU Nomor 9 Tahun 1961 dan Peraturan Pemerintah Nomor 29 Tahun 1980.</p>
            </div>
        )
    },
    {
        id: 'keamanan-data-pdp',
        category: 'keamanan',
        question: 'Bagaimana Insani Indonesia melindungi privasi dan data pribadi pengguna?',
        keywords: ['keamanan data', 'uu pdp', 'privasi', 'enkripsi', 'ssl', 'bocor data'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Kami mematuhi <strong>UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                    <li>Seluruh data dienkripsi dengan protokol SSL/HTTPS 256-bit standar industri perbankan.</li>
                    <li>Kami <strong>tidak pernah memperjualbelikan</strong> data nomor kontak, email, atau identitas donatur kepada pihak mana pun.</li>
                    <li>Data sensitif perbankan diproses langsung oleh payment gateway resmi Bank Indonesia tanpa disimpan di server kami.</li>
                    <li>Baca ketentuan lengkapnya di halaman <Link href="/kebijakan-privasi" className="text-insani-blue font-semibold hover:underline">Kebijakan Privasi</Link>.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'lapor-penipuan-fraud',
        category: 'keamanan',
        question: 'Bagaimana jika saya menemukan program donasi yang mencurigakan atau indikasi penipuan?',
        keywords: ['lapor penipuan', 'fraud', 'mencurigakan', 'pengaduan', 'whistleblower'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Insani Indonesia menerapkan <strong>zero tolerance</strong> terhadap rekayasa informasi dan penipuan donasi.</p>
                <p>Jika Anda mencurigai adanya program fiktif atau penyalahgunaan dana, segera kirimkan bukti tangkapan layar dan rincian ke email <strong>sapa@insani.id</strong> atau WhatsApp Layanan Pengaduan Resmi kami. Tim kepatuhan kami akan segera menginvestigasi dan membekukan kampanye tersebut bila terbukti melanggar.</p>
            </div>
        )
    },
    {
        id: 'kebijakan-refund',
        category: 'keamanan',
        question: 'Apakah donasi yang sudah dibayarkan dapat dibatalkan atau dikembalikan?',
        keywords: ['refund', 'batal donasi', 'tarik uang donasi', 'pengembalian dana'],
        answer: (
            <div className="space-y-2 text-slate-600">
                <p>Sesuai dengan <Link href="/syarat-ketentuan" className="text-insani-blue font-semibold hover:underline">Syarat dan Ketentuan</Link>, setiap donasi yang telah sukses bersifat <strong>sukarela, final, dan tidak dapat dibatalkan (non-refundable)</strong> karena dana langsung dialokasikan untuk kebutuhan penerima manfaat.</p>
                <p>Pengembalian dana hanya dipertimbangkan jika terjadi kekeliruan sistem perbankan seperti pendebetan ganda yang disertai bukti sah mutasi rekening.</p>
            </div>
        )
    }
];

const CATEGORIES = [
    { key: 'all', label: 'Semua Topik', icon: Sparkles },
    { key: 'donatur', label: 'Donatur & Pembayaran', icon: Heart },
    { key: 'campaigner', label: 'Penggalang Dana', icon: Rocket },
    { key: 'fundraiser', label: 'Relawan Fundraiser', icon: Users },
    { key: 'keamanan', label: 'Legalitas & Keamanan', icon: ShieldCheck },
    { key: 'lembaga', label: 'Profil & Lembaga', icon: Building2 },
    { key: 'kontak', label: 'Layanan & Kontak', icon: Phone },
] as const;

export default function HelpCenterView({ faqs }: { faqs?: any[] }) {
    const { siteSettings } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [openItem, setOpenItem] = useState<string | null>('cara-donasi');

    const whatsappNumber = siteSettings?.contact_donor_support_wa || siteSettings?.contact_whatsapp || '081319456675';
    const whatsappClean = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappClean.startsWith('0') ? '62' + whatsappClean.slice(1) : whatsappClean}`;
    const contactPhone = siteSettings?.contact_phone || '(021) 27871199';
    const contactEmail = siteSettings?.contact_email || 'sapa@insani.id';
    const legalSkNumber = siteSettings?.legal_sk_kemenkumham || 'AHU-0002557.AH.01.04.2019';
    const legalSkLabel = siteSettings?.legal_sk_label || 'SK Kemenkumham';
    const operatingHours = siteSettings?.contact_operating_hours || "Senin - Jum'at | 10:00 - 18.00 WIB";

    const activeFaqList: FaqItem[] = useMemo(() => {
        if (faqs && faqs.length > 0) {
            return faqs.map((f: any) => ({
                id: String(f.id),
                category: (f.category as any) || 'donatur',
                question: f.question,
                keywords: Array.isArray(f.keywords) ? f.keywords : [],
                answer: typeof f.answer === 'string' ? (
                    <div 
                        className="space-y-2 text-slate-600 prose prose-sm max-w-none leading-relaxed" 
                        dangerouslySetInnerHTML={{ __html: f.answer }} 
                    />
                ) : f.answer,
            }));
        }
        return FAQ_DATA;
    }, [faqs]);

    // Filter FAQs based on category and search query
    const filteredFaqs = useMemo(() => {
        return activeFaqList.filter((item) => {
            // Category filter
            if (activeCategory !== 'all' && item.category !== activeCategory) {
                return false;
            }

            // Search query filter
            if (!searchQuery.trim()) {
                return true;
            }

            const q = searchQuery.toLowerCase();
            const matchQuestion = item.question.toLowerCase().includes(q);
            const matchKeywords = (item.keywords || []).some((kw) => kw.toLowerCase().includes(q));

            return matchQuestion || matchKeywords;
        });
    }, [activeFaqList, activeCategory, searchQuery]);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    const handleTagClick = (tag: string) => {
        setSearchQuery(tag);
    };

    return (
        <div className="min-h-screen bg-slate-50/60 pb-20">
            {/* HERO SEARCH SECTION */}
            <div className="relative bg-insani-darkblue text-white py-16 md:py-24 px-4 overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-insani-blue/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-insani-blue/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-insani-blue/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative container mx-auto max-w-4xl text-center z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs md:text-sm font-medium text-blue-200 mb-6">
                        <HelpCircle className="w-4 h-4 text-blue-300" />
                        <span>Pusat Bantuan & Panduan Pengguna</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Ada yang bisa kami bantu?
                    </h1>
                    <p className="text-blue-100/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                        Temukan jawaban cepat seputar donasi, tata cara verifikasi penggalang dana, program relawan fundraiser, hingga keamanan sistem Insani Indonesia.
                    </p>

                    {/* Search Bar Input */}
                    <div className="relative max-w-2xl mx-auto">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ketik kata kunci (contoh: kuitansi, verifikasi, fundraiser, biaya)..."
                                className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl shadow-xl shadow-black/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/40 text-sm sm:text-base transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                    title="Hapus pencarian"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Quick filter tags */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-300">
                            <span className="text-slate-400 font-medium">Topik Cepat:</span>
                            {['Cara Donasi', 'Cek Status', 'Verifikasi', 'Fundraiser', 'Biaya Platform', 'Kuitansi'].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors cursor-pointer"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTION CARDS */}
            <div className="container mx-auto px-4 max-w-5xl -mt-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Link
                        href="/cek-donasi"
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-500/50 hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-600 transition-colors">
                            Cek Donasi
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            Lacak status donasi & unduh e-kuitansi resmi
                        </p>
                    </Link>

                    <Link
                        href="/cara-donasi"
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-500/50 hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-insani-blue flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-insani-blue transition-colors">
                            Panduan Donasi
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            Tata cara bayar QRIS, VA, dan transfer manual
                        </p>
                    </Link>

                    <Link
                        href="/buat-program"
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-500/50 hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors">
                            Jadi Campaigner
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            Daftar & verifikasi akun untuk buat kampanye baru
                        </p>
                    </Link>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-green-500/50 hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-green-600 transition-colors">
                            WhatsApp CS
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            Tanya kendala langsung ke Customer Service
                        </p>
                    </a>
                </div>
            </div>

            {/* MAIN FAQ CONTENT CONTAINER */}
            <div className="container mx-auto px-4 max-w-5xl mt-10">
                {/* AUDIENCE CATEGORY PILLS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.key;
                        const count = cat.key === 'all' 
                            ? activeFaqList.length 
                            : activeFaqList.filter(f => f.category === cat.key).length;

                        return (
                            <button
                                key={cat.key}
                                onClick={() => {
                                    setActiveCategory(cat.key);
                                }}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-insani-blue text-white shadow-md shadow-insani-blue/25 ring-2 ring-insani-blue/20'
                                        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{cat.label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* FAQ ACCORDION LIST */}
                <div className="mt-6 space-y-3.5">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => {
                            const isOpen = openItem === faq.id;

                            return (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                                        isOpen
                                            ? 'border-insani-blue/40 shadow-md ring-1 ring-insani-blue/20'
                                            : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleItem(faq.id)}
                                        className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-4 text-left focus:outline-none cursor-pointer"
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-insani-blue bg-insani-blue/10 px-2.5 py-0.5 rounded-md">
                                                    {faq.category}
                                                </span>
                                            </div>
                                            <h3 className={`font-bold text-sm sm:text-base md:text-lg transition-colors ${
                                                isOpen ? 'text-insani-blue' : 'text-slate-900 hover:text-insani-blue'
                                            }`}>
                                                {faq.question}
                                            </h3>
                                        </div>
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                            isOpen
                                                ? 'bg-insani-blue text-white rotate-180 shadow-sm'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                            >
                                                <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-slate-100 text-sm sm:text-base leading-relaxed">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    ) : (
                        /* EMPTY SEARCH STATE */
                        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm my-8">
                            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                                <Search className="w-7 h-7" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-1">
                                Tidak ada pertanyaan yang cocok
                            </h2>
                            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                                Kami tidak menemukan hasil untuk kata kunci <span className="font-semibold text-slate-700">"{searchQuery}"</span>. Coba gunakan kata kunci yang lebih umum atau hubungi Customer Service kami.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveCategory('all');
                                    }}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    Reset Pencarian
                                </button>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Tanya ke WhatsApp CS</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM CONTACT SUPPORT BANNER */}
                <div className="mt-12 bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-blue-950/10 border border-blue-800/40">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold mb-3">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>Jam Kerja: {operatingHours}</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-2">
                                Masih membutuhkan bantuan lebih lanjut?
                            </h2>
                            <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                                Tim Customer Service resmi Insani Indonesia selalu siap mendampingi Anda jika menemui kendala transaksi, verifikasi dokumen, atau kemitraan.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Chat WhatsApp CS</span>
                            </a>
                            <Link
                                href="/kontak"
                                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm border border-white/20 transition-all"
                            >
                                <span>Halaman Kontak</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-blue-200">
                        <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>Telepon: {contactPhone}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>Email: {contactEmail}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{legalSkLabel}: {legalSkNumber}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
