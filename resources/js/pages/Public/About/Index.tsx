import { Head, usePage, Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp, FileText, ExternalLink, ShieldCheck, Scale, Building2, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';

const staticFaqs = [
    {
        id: 1,
        question: "Apa itu Insani Indonesia?",
        answer: "Insani Indonesia atau Yayasan Peduli Insani Indonesia merupakan Lembaga yang bergerak dalam bidang sosial dan kemanusiaan. Insani lahir dari semangat cita-cita kemerdekaan Indonesia yang ingin memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa serta mewujudkan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi, dan keadilan sosial.\n\nInsani diinisiasi oleh sekelompok anak muda yang prihatin akan tiada berkahirnya krisis kemanusian di dunia. Merekapun bertekad turut berkontribusi dalam mengentaskan dunia dari krisis kemanusiaan.\n\nTanggal 13 Februari 2019 merupakan hari bersejarah dimana Insani secara resmi didirikan. Sebagai Lembaga yang terhitung masih muda serta dimotori oleh sekelompok anak muda, Insani memposisikan dirinya sebagai wadah bagi siapapun putra bangsa yang bertekad serta berkomitmen untuk terus menebarkan kebaikan."
    },
    {
        id: 2,
        question: "Apakah Insani Indonesia Memiliki Badan Hukum?",
        answer: "Insani Indonesia telah terdaftar di Kementerian Hukum dan Hak Asasi Manusia dengan Surat Keputusan Menteri Hukum dan Hak Asasi Manusia Republik Indonesia No. SK-KUMHAM : AHU-0002557.AH.01.04.Tahun 2019."
    },
    {
        id: 3,
        question: "Dimana Saja Bantuan Insani Indonesia di Salurkan?",
        answer: "Insani menyalurkan bantuan ke seluruh Indonesia dan juga luar negeri khususnya negara yang mengalami krisis.\n\nSaat ini Insani telah menyalurkan bantuan ke negara Palestina, Suriah, Yaman, dan untuk Indonesia ke daerah Jabodetabek, Banten, Jawa Tengah, Jawa Timur, Sumatera, Kalimantan, Sulawesi, dan Bali."
    },
    {
        id: 4,
        question: "Bagaimana cara Insani menyalurkan bantuan?",
        answer: "Untuk bantuan lokal di Indonesia, Insani langsung menurunkan tim ke lapangan. Adapun bantuan ke luar negeri, Insani bekerjasama dengan mitra lembaga terpercaya di negara terkait untuk penyaluran bantuan sehingga lebih aman, amanah, dan jelas secara laporan dan dokumentasi. Semua lembaga yang menjadi mitra Insani telah resmi dan berbadan hukum sesuai peraturan negara masing-masing."
    },
    {
        id: 5,
        question: "Apa manfaat berdonasi di Insani?",
        answer: "Donasi yang diterima Insani akan disalurkan secara amanah, profesional, dan efektif tepat sasaran. Selain itu, berdonasi di Insani juga sangat mudah. Kami bekerja menyalurkan bantuan yang Anda titipkan kepada mereka yang betul-betul membutuhkan sehingga Anda tidak perlu bingung mencari penerima bantuan yang tepat.\n\nInsani senantiasa mengadakan program bantuan berdasarkan prioritas kebutuhan yang paling penting dan mendesak."
    },
    {
        id: 6,
        question: "Bagaimana cara berdonasi di Insani?",
        answer: (
            <div className="space-y-4">
                <p>Berdonasi di Insani sangatlah mudah. Kami menyediakan beberapa cara berdonasi berikut:</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">Bank Syariah Indonesia (451)</p>
                    <p className="font-mono text-insani-blue text-lg my-1">7132195026</p>
                    <p className="text-sm text-slate-500">A.n Insani Indonesia</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">Bank Rakyat Indonesia (002)</p>
                    <p className="font-mono text-insani-blue text-lg my-1">034501001366304</p>
                    <p className="text-sm text-slate-500">A.n Insani Indonesia</p>
                </div>
                <p>
                    Kemudian kirimkan foto/screenshot bukti transfer ke WhatsApp Insani di <a href="https://wa.me/6282123998593" target="_blank" rel="noopener noreferrer" className="text-insani-blue hover:underline">082123998593</a> atau dengan cara menghubungi kami langsung di 082123998593 atau (021) 27871199.
                </p>
                <p>
                    Anda juga dapat berdonasi via website dengan berbagai metode yang tersedia, cukup klik tautan berikut: <Link href="/galang-dana" className="text-insani-blue hover:underline font-medium">https://insani.id/galang-dana</Link>
                </p>
                <p>
                    Donasi via Gopay/Ovo/DANA/LinkAja/ShopeePay/Qris, caranya cukup scan QR Code pada halaman website kami melalui aplikasi e-wallet Anda.
                </p>
            </div>
        )
    },
    {
        id: 7,
        question: "Di mana kami dapat melihat update kegiatan dan penyaluran bantuan Insani?",
        answer: (
            <div className="space-y-4">
                <p>Update kegiatan serta penyaluran INSANI dapat dilihat di media sosial kami. Ikuti kami dan dapatkan update-update tentang bantuan kemanusiaan lainnya.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Facebook: <a href="https://www.facebook.com/insaniindonesia" target="_blank" rel="noopener noreferrer" className="text-insani-blue hover:underline">insaniindonesia</a></li>
                    <li>Instagram: <a href="https://www.instagram.com/insaniindonesia" target="_blank" rel="noopener noreferrer" className="text-insani-blue hover:underline">@insaniindonesia</a></li>
                    <li>Twitter: <a href="https://twitter.com/officialinsani" target="_blank" rel="noopener noreferrer" className="text-insani-blue hover:underline">@officialinsani</a></li>
                    <li>Youtube: <a href="https://www.youtube.com/@insaniindonesia" target="_blank" rel="noopener noreferrer" className="text-insani-blue hover:underline">Official Insani</a></li>
                </ul>
                <p>Bagi donatur khusus akan mendapatkan update khusus melalui email.</p>
            </div>
        )
    },
    {
        id: 8,
        question: "Bagaimana cara menjadi relawan Insani?",
        answer: "Kami membuka kesempatan bagi siapa saja untuk menjadi inisiator kebaikan dalam hal menyebarkan info program kami maupun relawan dalam kegiatan kami. Silakan hubungi 082123998593 untuk info lebih lanjut."
    },
    {
        id: 9,
        question: "Bagaimana cara mengirimkan penawaran kerjasama dengan Insani?",
        answer: (
            <div className="space-y-4">
                <p>Anda dapat mengirimkan penawaran kerjasama dalam hal berikut:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Kerjasama CSR perusahaan</li>
                    <li>Kerjasama NGO</li>
                    <li>Kerjasama menjadi donatur tetap</li>
                    <li>Kerjasama komunitas</li>
                </ul>
                <p>Silakan kirim email ke <a href="mailto:sapa@insani.id" className="text-insani-blue hover:underline font-medium">sapa@insani.id</a> atau menghubungi CS INSANI di 081319456675 atau (021) 27871199.</p>
            </div>
        )
    }
];

export default function AboutIndex({ faqs, aboutPage }: any) {
    const { locale } = usePage().props as any;
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        if (openFaq === index) {
            setOpenFaq(null);
        } else {
            setOpenFaq(index);
        }
    };

    const legalDocuments = [
        {
            id: 1,
            title: "Akta Pendirian",
            url: "https://drive.google.com/file/d/1npzpQZGq1MuGERZ9H8EdxmdV0vzgkIze/view",
            icon: <Scale className="w-6 h-6 text-insani-blue" />,
            image: "/images/about/Logo-Notaris-HD.webp"
        },
        {
            id: 2,
            title: "Akta Perubahan",
            url: "https://drive.google.com/file/d/1SJP9zp-gMofWmQcCHwMCyfjj8Y_v-k7F/view",
            icon: <Scale className="w-6 h-6 text-insani-blue" />,
            image: "/images/about/Logo-Notaris-HD.webp"
        },
        {
            id: 3,
            title: "SK Kemenkumham Pendirian",
            url: "https://drive.google.com/file/d/1_7BOWiP9SK-Me0GE178RAqx3g82_-5jh/view",
            icon: <ShieldCheck className="w-6 h-6 text-insani-blue" />,
            image: "/images/about/Logo-Kumham.webp"
        },
        {
            id: 4,
            title: "SK Kemenkumham Perubahan",
            url: "https://drive.google.com/file/d/1qH6vEQBTO3ofYd0hY-8RSk090uR7I04C/view",
            icon: <ShieldCheck className="w-6 h-6 text-insani-blue" />,
            image: "/images/about/Logo-Kumham.webp"
        },
        {
            id: 5,
            title: "Surat Tanda Daftar Yayasan & Izin Kegiatan",
            url: "https://drive.google.com/file/d/1qftGsDO7gkN3u_MgnWuLsHmpsHFAsyfa/view",
            icon: <Building2 className="w-6 h-6 text-insani-blue" />,
            image: "/images/about/logo-Pmeprov-DKI.webp"
        },
        {
            id: 6,
            title: "Surat Keterangan Domisili",
            url: "https://drive.google.com/file/d/1ebtt5z05du7B-EqYCbEddzDTwT8HY5wE/view",
            icon: <MapPin className="w-6 h-6 text-insani-blue" />,
            image: "/images/about/logo-Pmeprov-DKI.webp"
        }
    ];

    return (
        <PublicLayout title="Tentang Kami">
            <Head title="Tentang Kami | Insani Indonesia" />

            {/* 1. Hero Section (Split Layout) */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-2xl"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-insani-blue/10 text-insani-blue text-sm font-semibold mb-6">
                                <span className="w-2 h-2 rounded-full bg-insani-blue animate-pulse"></span>
                                Tentang Kami
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                                Merajut Kebaikan,<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-insani-blue to-cyan-500">
                                    Membangun Kemanusiaan
                                </span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Insani Indonesia atau Yayasan Peduli Insani Indonesia merupakan lembaga yang bergerak dalam bidang sosial dan kemanusiaan. Kami lahir dari semangat cita-cita kemerdekaan Indonesia yang ingin memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, serta mewujudkan ketertiban dunia.
                            </p>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative lg:ml-auto"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-insani-blue/20 to-cyan-400/20 rounded-[2.5rem] blur-2xl opacity-60"></div>
                            <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-[2rem] shadow-2xl">
                                <img 
                                    src="/images/about/Logo-About.webp" 
                                    alt="Tentang Insani Indonesia" 
                                    className="w-full h-auto rounded-xl max-w-md mx-auto object-contain"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Visi, Misi & Values (Bento Grid) */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Landasan Gerak Kami</h2>
                        <p className="text-slate-600 text-lg">Kompas yang menuntun setiap langkah dan program kemanusiaan Insani Indonesia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Visi Misi Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="md:col-span-7 bg-slate-50 rounded-3xl p-8 lg:p-12 border border-slate-100 overflow-hidden relative group"
                        >

                            <div className="relative z-10">
                                <div className="mb-10">
                                    <h3 className="text-2xl font-bold text-insani-darkblue mb-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-insani-blue/10 flex items-center justify-center text-insani-blue">
                                            <span className="font-serif text-xl italic">V</span>
                                        </div>
                                        Visi
                                    </h3>
                                    <p className="text-slate-700 leading-relaxed text-lg">
                                        Menjadi pelopor kolaborasi kebaikan lintas batas demi mewujudkan masyarakat yang berdaya, mandiri, dan sejahtera dalam naungan nilai-nilai kemanusiaan yang universal.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-bold text-insani-darkblue mb-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                                            <span className="font-serif text-xl italic">M</span>
                                        </div>
                                        Misi
                                    </h3>
                                    <ul className="space-y-4 text-slate-700">
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-insani-blue mt-2.5 flex-shrink-0"></div>
                                            <p>Menggalang kepedulian masyarakat untuk turut serta dalam program pengentasan krisis kemanusiaan.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-insani-blue mt-2.5 flex-shrink-0"></div>
                                            <p>Memberikan bantuan tepat sasaran dan terukur melalui kolaborasi dengan berbagai mitra terpercaya.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-insani-blue mt-2.5 flex-shrink-0"></div>
                                            <p>Mengedukasi masyarakat mengenai isu-isu kemanusiaan di dalam dan luar negeri.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Values Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="md:col-span-5 bg-insani-darkblue text-white rounded-3xl p-8 lg:p-12 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-insani-blue/20 to-transparent"></div>
                            
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-8">Nilai-Nilai<br/>Perjuangan</h3>
                                    <div className="space-y-6">
                                        <div className="border-l-2 border-insani-blue/50 pl-5 hover:border-insani-blue transition-colors">
                                            <h4 className="font-semibold text-lg mb-1">Integritas</h4>
                                            <p className="text-slate-300 text-sm">Transparan dan akuntabel dalam pengelolaan amanah donatur.</p>
                                        </div>
                                        <div className="border-l-2 border-insani-blue/50 pl-5 hover:border-insani-blue transition-colors">
                                            <h4 className="font-semibold text-lg mb-1">Kolaborasi</h4>
                                            <p className="text-slate-300 text-sm">Bersinergi dengan semua pihak untuk dampak yang lebih luas.</p>
                                        </div>
                                        <div className="border-l-2 border-insani-blue/50 pl-5 hover:border-insani-blue transition-colors">
                                            <h4 className="font-semibold text-lg mb-1">Empati</h4>
                                            <p className="text-slate-300 text-sm">Bergerak dari panggilan hati nurani untuk meringankan beban sesama.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. Legalitas & Kredibilitas */}
            <section id="legalitas" className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Legalitas Resmi</h2>
                            <p className="text-slate-600 text-lg">
                                Insani Indonesia beroperasi secara legal dan diakui oleh negara. Kami berkomitmen pada transparansi dan kepatuhan hukum sebagai bentuk tanggung jawab publik.
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {legalDocuments.map((doc, index) => (
                            <motion.a 
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={doc.id}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="group flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-insani-blue/30 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent -z-0 rounded-bl-3xl group-hover:from-insani-blue/5 transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-insani-blue/10 group-hover:border-insani-blue/20 transition-colors">
                                        {doc.icon}
                                    </div>
                                    {doc.image && (
                                        <img src={doc.image} alt={doc.title} className="h-10 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                                    )}
                                </div>
                                
                                <div className="mt-auto relative z-10">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-insani-blue transition-colors line-clamp-2">
                                        {doc.title}
                                    </h3>
                                    <div className="flex items-center text-sm font-medium text-insani-blue mt-4 opacity-80 group-hover:opacity-100">
                                        Lihat Dokumen
                                        <ExternalLink className="w-4 h-4 ml-1.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FAQ Section Baru (Statis dari faq-insani.md) */}
            <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight"
                        >
                            Tanya Jawab (FAQ)
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-600 text-lg max-w-2xl mx-auto"
                        >
                            Pelajari lebih lanjut tentang profil Insani Indonesia, program-program kami, serta bagaimana Anda dapat berkolaborasi bersama kami.
                        </motion.p>
                    </div>
                    
                    <div className="space-y-4">
                        {staticFaqs.map((faq: any, index: number) => (
                            <motion.div 
                                key={faq.id} 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                                className={`rounded-2xl transition-all duration-300 ${openFaq === index ? 'bg-white shadow-md ring-1 ring-insani-blue/20 transform scale-[1.01]' : 'bg-white shadow-sm hover:shadow-md border border-slate-100 hover:border-slate-200'}`}
                            >
                                <button 
                                    className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={openFaq === index}
                                >
                                    <span className={`font-semibold pr-8 text-lg ${openFaq === index ? 'text-insani-blue' : 'text-slate-900'}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${openFaq === index ? 'bg-insani-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                
                                <div 
                                    className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}

