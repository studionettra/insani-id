import { Head, usePage, Link } from '@inertiajs/react';
import { 
    ChevronDown, 
    ChevronUp, 
    FileText, 
    ExternalLink, 
    ShieldCheck, 
    Scale, 
    Building2, 
    MapPin, 
    Award, 
    Users,
    Download,
    Eye,
    FileSpreadsheet,
    Compass,
    Target,
    HeartHandshake,
    TrendingUp,
    Quote
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { getLocalizedValue } from '@/lib/utils';
import useTranslation from '@/hooks/use-translation';

export default function AboutIndex({ management = [], faqs = [], aboutPage, legalDocuments = [], financialReports = [] }: any) {
    const { locale, siteSettings } = usePage().props as any;
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const defaultVision = "Berkontribusi mewujudkan dunia tanpa krisis kemanusiaan yang menghadirkan keadilan sosial bagi segenap insan.";
    const localizedVision = getLocalizedValue(siteSettings?.about_vision, locale);
    const visionText = localizedVision || defaultVision;

    const defaultMissions = [
        "Membangun kapasitas dan kompetensi organisasi yang efektif, inovatif, dan akuntabel.",
        "Menjalin kemitraan dan kolaborasi dengan institusi, perusahaan, lembaga, komunitas, dan individu dalam kerja-kerja sosial dan kemanusiaan.",
        "Mengembangkan sumber daya yang ada, guna mendorong kemandirian dan kesejahteraan."
    ];
    const rawMission = getLocalizedValue(siteSettings?.about_mission, locale);
    const missions: string[] = rawMission
        ? rawMission.split('\n').map((m: string) => m.trim()).filter(Boolean)
        : defaultMissions;

    const defaultValues = [
        { title: "Initiative", desc: "Semangat untuk menjadi yang pertama dan terdepan dalam menghadirkan kebermanfaatan." },
        { title: "Nationalism", desc: "Kesadaran bahwa misi perjuangan kemanusiaan Insani didasarkan oleh cita-cita kemerdekaan Indonesia." },
        { title: "Sustainability", desc: "Kesadaran mendalam bahwa menghadirkan keadilan sosial merupakan perjuangan yang panjang dan berkelanjutan." },
        { title: "Accountability", desc: "Semangat untuk menghadirkan tata kelola organisasi yang terukur dan efektif." },
        { title: "Networking", desc: "Semangat berjejaring demi mewujudkan komitmen menjadi wadah kolaborasi bagi seluruh potensi kebaikan." },
        { title: "Inspire", desc: "Semangat untuk senantiasa bekerja secara optimal, sehingga perjuangan Insani dapat menginspirasi dunia." }
    ];
    const rawValues = getLocalizedValue(siteSettings?.about_values, locale);
    const values = rawValues
        ? rawValues.split('\n').map((line: string) => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
            }
            return { title: line.trim(), desc: '' };
        }).filter((v: any) => v.title)
        : defaultValues;

    const missionIcons = [ShieldCheck, HeartHandshake, TrendingUp];

    const displayedFaqs = faqs || [];

    const toggleFaq = (index: number) => {
        if (openFaq === index) {
            setOpenFaq(null);
        } else {
            setOpenFaq(index);
        }
    };

    const getDocIcon = (type: string) => {
        switch (type) {
            case 'shield':
                return <ShieldCheck className="w-6 h-6 text-insani-blue" />;
            case 'scale':
                return <Scale className="w-6 h-6 text-insani-blue" />;
            case 'building':
                return <Building2 className="w-6 h-6 text-insani-blue" />;
            case 'map-pin':
                return <MapPin className="w-6 h-6 text-insani-blue" />;
            case 'award':
                return <Award className="w-6 h-6 text-insani-blue" />;
            default:
                return <FileText className="w-6 h-6 text-insani-blue" />;
        }
    };

    const activeDocuments = (legalDocuments && legalDocuments.length > 0) ? legalDocuments : [
        {
            id: 1,
            title: "Akta Pendirian",
            url: "https://drive.google.com/file/d/1npzpQZGq1MuGERZ9H8EdxmdV0vzgkIze/view",
            icon_type: "scale",
            publisher_logo: "/images/legal/garuda-notaris.svg",
            issuer_name: "Notaris RI"
        },
        {
            id: 2,
            title: "Akta Perubahan",
            url: "https://drive.google.com/file/d/1SJP9zp-gMofWmQcCHwMCyfjj8Y_v-k7F/view",
            icon_type: "scale",
            publisher_logo: "/images/legal/garuda-notaris.svg",
            issuer_name: "Notaris RI"
        },
        {
            id: 3,
            title: "SK Kemenkumham Pendirian",
            document_number: "AHU-0002557.AH.01.04.Tahun 2019",
            url: "https://drive.google.com/file/d/1_7BOWiP9SK-Me0GE178RAqx3g82_-5jh/view",
            icon_type: "shield",
            publisher_logo: "/images/legal/kemenkumham.svg",
            issuer_name: "Kemenkumham RI"
        },
        {
            id: 4,
            title: "SK Kemenkumham Perubahan",
            url: "https://drive.google.com/file/d/1qH6vEQBTO3ofYd0hY-8RSk090uR7I04C/view",
            icon_type: "shield",
            publisher_logo: "/images/legal/kemenkumham.svg",
            issuer_name: "Kemenkumham RI"
        },
        {
            id: 5,
            title: "Surat Tanda Daftar Yayasan & Izin Kegiatan",
            url: "https://drive.google.com/file/d/1qftGsDO7gkN3u_MgnWuLsHmpsHFAsyfa/view",
            icon_type: "building",
            publisher_logo: "/images/legal/pemprov-dki.svg",
            issuer_name: "Pemprov DKI Jakarta"
        },
        {
            id: 6,
            title: "Surat Keterangan Domisili",
            url: "https://drive.google.com/file/d/1ebtt5z05du7B-EqYCbEddzDTwT8HY5wE/view",
            icon_type: "map-pin",
            publisher_logo: "/images/legal/pemprov-dki.svg",
            issuer_name: "Pemprov DKI Jakarta"
        }
    ];

    return (
        <PublicLayout title="Tentang Kami">

            {/* 1. Hero Section (Split Layout) */}
            <section className="relative py-20 md:py-28 overflow-hidden bg-insani-darkblue text-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-insani-blue/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-insani-blue/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-insani-blue/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-2xl"
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-blue-200 border border-white/15 text-sm font-semibold mb-6 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                                Tentang Kami
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                                Merajut Kebaikan,<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-100 to-white">
                                    Membangun Kemanusiaan
                                </span>
                            </h1>
                            <p className="text-lg text-blue-100/90 mb-8 leading-relaxed font-normal">
                                Insani Indonesia atau Yayasan Peduli Insani Indonesia merupakan lembaga yang bergerak dalam bidang sosial dan kemanusiaan. Kami lahir dari semangat cita-cita kemerdekaan Indonesia yang ingin memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, serta mewujudkan ketertiban dunia.
                            </p>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative lg:ml-auto"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-insani-blue/20 rounded-[2.5rem] blur-2xl opacity-60"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-[2rem] shadow-2xl">
                                <img 
                                    src="/images/about/Logo-About.webp" 
                                    alt="Tentang Insani Indonesia" 
                                    className="w-full h-auto rounded-xl max-w-md mx-auto object-contain bg-white/80 p-3"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Visi, Misi & Nilai-Nilai Insani (Harmonized Civic Bento) */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50/60 to-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-insani-blue/10 text-insani-blue mb-4 border border-insani-blue/15">
                            <Compass className="w-3.5 h-3.5" />
                            {t('Kompas Filosofis Lembaga')}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                            Landasan Gerak Kami
                        </h2>
                        <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                            Kompas nilai dan komitmen yang menuntun setiap ikhtiar kemanusiaan Insani Indonesia.
                        </p>
                    </div>

                    <div className="space-y-12 md:space-y-14">
                        {/* A. VISI KAMI (The North Star Manifesto Card) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#054bad] via-[#043c8a] to-[#02285a] text-white p-8 sm:p-10 lg:p-12 shadow-xl border border-white/10"
                        >
                            {/* Ambient Glows & Watermark */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-insani-blue/25 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-8 -right-8 text-white/[0.04] pointer-events-none">
                                <Quote className="w-44 h-44" />
                            </div>

                            <div className="relative z-10 max-w-4xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-cyan-200 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-xs">
                                    <Target className="w-3.5 h-3.5 text-cyan-300" />
                                    Visi Lembaga
                                </div>
                                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed tracking-tight text-white mb-6">
                                    "{visionText}"
                                </blockquote>
                                <div className="flex items-center gap-3 text-cyan-100/80 text-sm font-medium pt-4 border-t border-white/15">
                                    <div className="w-2 h-2 rounded-full bg-insani-turquoise animate-pulse" />
                                    <span>Mewujudkan masa depan kemanusiaan yang berdaya, adil, dan bermartabat</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* B. MISI KAMI (3 Strategic Pillar Cards) */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-2.5 h-2.5 rounded-full bg-insani-blue" />
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                    Misi Utama Lembaga
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {missions.map((mission: string, idx: number) => {
                                    const IconComp = missionIcons[idx % missionIcons.length];
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-60px" }}
                                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                                            className="group bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-insani-blue/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-insani-blue/0 via-insani-blue/0 to-insani-blue/0 group-hover:from-insani-blue group-hover:via-cyan-400 group-hover:to-insani-turquoise transition-all duration-500" />
                                            
                                            <div>
                                                <div className="flex items-center justify-between mb-5">
                                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-insani-blue/10 text-insani-blue border border-insani-blue/15">
                                                        0{idx + 1}
                                                    </span>
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 shadow-2xs flex items-center justify-center text-insani-blue group-hover:bg-insani-blue group-hover:text-white transition-colors duration-300">
                                                        <IconComp className="w-5 h-5" />
                                                    </div>
                                                </div>
                                                <p className="text-slate-700 leading-relaxed font-normal text-base">
                                                    {mission}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* C. NILAI-NILAI PERJUANGAN (Akrostik INSANI) */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-2.5 h-2.5 rounded-full bg-insani-turquoise" />
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                    Nilai-Nilai Perjuangan
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {values.map((val: any, idx: number) => {
                                    const letter = val.title.charAt(0);
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 15 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-40px" }}
                                            transition={{ duration: 0.35, delay: idx * 0.05 }}
                                            className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-insani-blue/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-start overflow-hidden h-full"
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-insani-blue/5 via-cyan-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                                            
                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/90 text-insani-darkblue font-extrabold text-lg flex items-center justify-center group-hover:bg-insani-blue group-hover:text-white group-hover:border-insani-blue transition-all duration-300 shadow-2xs mb-4 shrink-0">
                                                    {letter}
                                                </div>
                                                <h4 className="font-bold text-[15px] sm:text-base text-slate-900 group-hover:text-insani-blue transition-colors mb-2 tracking-tight">
                                                    {val.title}
                                                </h4>
                                                {val.desc && (
                                                    <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                                                        {val.desc}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2.5 Manajemen Insani Indonesia */}
            {management && management.length > 0 && (
                <section id="manajemen" className="py-24 bg-white border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-insani-blue/10 text-insani-blue mb-4">
                                <Users className="w-3.5 h-3.5" />
                                {t('Tim Manajemen')}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                                Manajemen Insani Indonesia
                            </h2>
                            <p className="text-slate-600 text-lg">
                                Para pegiat kemanusiaan dan profesional yang berdedikasi mengemban amanah, mengawal tata kelola, dan memajukan program kebaikan Insani Indonesia.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {management.map((member: any, index: number) => (
                                <motion.div
                                    key={member.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.08 }}
                                    className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-insani-blue/30 hover:shadow-lg transition-all duration-300 flex flex-col"
                                >
                                    <div className="aspect-[4/5] w-full overflow-hidden bg-slate-200 relative">
                                        {(member.photo_url || member.image_url) ? (
                                            <img
                                                src={(member.photo_url || member.image_url).startsWith('http') || (member.photo_url || member.image_url).startsWith('/') ? (member.photo_url || member.image_url) : `/storage/${member.photo_url || member.image_url}`}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                                <Users className="w-16 h-16 mb-2 opacity-50" />
                                                <span className="text-xs font-medium uppercase tracking-wider">Insani</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-insani-blue transition-colors">
                                            {member.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-insani-blue uppercase tracking-wider mt-1 mb-3">
                                            {getLocalizedValue(member.position_translations || member.position, locale)}
                                        </p>
                                        {(member.bio_translations || member.bio) && (
                                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mt-auto">
                                                {getLocalizedValue(member.bio_translations || member.bio, locale)}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Legalitas & Kredibilitas */}
            <section id="legalitas" className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-insani-blue border border-blue-200/60 mb-4">
                                <Scale className="w-3.5 h-3.5" />
                                {t('Kepatuhan Hukum & Regulasi')}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Legalitas Resmi</h2>
                            <p className="text-slate-600 text-lg">
                                Insani Indonesia beroperasi secara legal dan diakui oleh negara. Kami berkomitmen pada transparansi dan kepatuhan hukum sebagai bentuk tanggung jawab publik.
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeDocuments.map((doc: any, index: number) => {
                            const docUrl = doc.file_url || doc.view_url || doc.external_url || doc.url || '#';
                            const docTitle = doc.title_translations?.[locale] || (typeof doc.title === 'object' ? doc.title?.[locale] || doc.title?.id : doc.title);
                            const docLogo = doc.publisher_logo || doc.image;
                            const docIcon = doc.icon || getDocIcon(doc.icon_type);

                            return (
                                <motion.a 
                                    href={docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={doc.id || index}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="group flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-insani-blue/30 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent -z-0 rounded-bl-3xl group-hover:from-insani-blue/5 transition-colors"></div>
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-insani-blue/10 group-hover:border-insani-blue/20 transition-colors">
                                            {docIcon}
                                        </div>
                                        {docLogo && (
                                            <img src={docLogo} alt={docTitle} className="h-10 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                                        )}
                                    </div>
                                    
                                    <div className="mt-auto relative z-10">
                                        {doc.document_number && (
                                            <div className="inline-block text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mb-2">
                                                {doc.document_number}
                                            </div>
                                        )}
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-insani-blue transition-colors line-clamp-2">
                                            {docTitle}
                                        </h3>
                                        {doc.issuer_name && (
                                            <div className="text-xs text-slate-500 font-medium mb-3">
                                                {doc.issuer_name}
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm font-medium text-insani-blue mt-3 opacity-80 group-hover:opacity-100">
                                            Lihat Dokumen
                                            <ExternalLink className="w-4 h-4 ml-1.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </div>
                                    </div>
                                </motion.a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3.5. Laporan Keuangan & Akuntabilitas Yayasan (Annual Report) */}
            {financialReports && financialReports.length > 0 && (
                <section id="laporan-keuangan" className="py-24 bg-white border-t border-slate-200 relative overflow-hidden">
                    {/* Subtle background ambient gradient */}
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-insani-blue/5 rounded-full blur-3xl pointer-events-none -z-0"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-0"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-4">
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                {t('Transparansi & Akuntabilitas Publik')}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                                Laporan Keuangan & Annual Report
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Sebagai wujud pertanggungjawaban amanah donatur dan kepatuhan hukum, seluruh laporan tahunan dan kinerja keuangan Insani Indonesia dipublikasikan secara terbuka dan dapat diunduh bebas oleh publik.
                            </p>
                        </div>

                        {/* Daftar Kartu Annual Report */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {financialReports.map((report: any, index: number) => {
                                const title = report.title_translations?.[locale] || (typeof report.title === 'object' ? report.title?.[locale] || report.title?.id : report.title);
                                const summary = report.summary_translations?.[locale] || (typeof report.summary === 'object' ? report.summary?.[locale] || report.summary?.id : report.summary);
                                const downloadUrl = `/laporan-keuangan/${report.slug}/unduh`;
                                const viewUrl = report.view_url || '#';

                                return (
                                    <motion.div
                                        key={report.id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.4, delay: index * 0.08 }}
                                        className="bg-slate-50/90 hover:bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-insani-blue/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                                    >
                                        {/* Cover Image / Mockup Top */}
                                        <div className="relative mb-5 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 aspect-[16/10] flex items-center justify-center border border-slate-200/60 group-hover:border-insani-blue/20 transition-colors">
                                            {report.cover_url ? (
                                                <img 
                                                    src={report.cover_url} 
                                                    alt={title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="text-center p-6 flex flex-col items-center justify-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-insani-blue mb-2.5">
                                                        <FileSpreadsheet className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                                                        Insani Report
                                                    </span>
                                                    <span className="text-xl font-black text-slate-800 tracking-tight">
                                                        {report.report_year}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Badge Tahun Floating */}
                                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
                                                    Tahun {report.report_year}
                                                </span>
                                            </div>

                                            {/* Badge Audit WTP Floating */}
                                            {report.audit_status && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/90 backdrop-blur-md text-white shadow-sm">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        {report.audit_status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Konten Utama */}
                                        <div className="flex-1 flex flex-col">
                                            {report.auditor_name && (
                                                <div className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-insani-blue/70 shrink-0" />
                                                    <span className="truncate">{report.auditor_name}</span>
                                                </div>
                                            )}

                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-insani-blue transition-colors line-clamp-2 mb-2">
                                                {title}
                                            </h3>

                                            {summary && (
                                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                                                    {summary}
                                                </p>
                                            )}

                                            {/* Sorotan Finansial jika ada */}
                                            {(report.formatted_revenue || report.formatted_disbursement) && (
                                                <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-100 mb-5 text-xs">
                                                    {report.formatted_revenue && (
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block font-medium">{t('Total Penghimpunan')}</span>
                                                            <span className="font-bold text-slate-800">{report.formatted_revenue}</span>
                                                        </div>
                                                    )}
                                                    {report.formatted_disbursement && (
                                                        <div>
                                                            <span className="text-[10px] text-emerald-600 block font-medium">{t('Total Penyaluran')}</span>
                                                            <span className="font-bold text-emerald-700">{report.formatted_disbursement}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="mt-auto pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
                                                {viewUrl !== '#' ? (
                                                    <a
                                                        href={viewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-insani-blue transition-colors py-2"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Baca Online
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Arsip Resmi</span>
                                                )}

                                                <a
                                                    href={downloadUrl}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-insani-blue text-white hover:bg-insani-blue/90 shadow-sm hover:shadow transition-all active:scale-95 ml-auto"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Unduh PDF</span>
                                                    {report.formatted_file_size && (
                                                        <span className="opacity-80 text-[10px]">({report.formatted_file_size})</span>
                                                    )}
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. FAQ Section Profil Yayasan */}
            {displayedFaqs && displayedFaqs.length > 0 && (
                <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <motion.h2 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight"
                            >
                                Tanya Jawab Seputar Lembaga
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-600 text-lg max-w-2xl mx-auto"
                            >
                                Informasi esensial mengenai profil, legalitas hukum, transparansi, serta tata kelola amanah di Insani Indonesia.
                            </motion.p>
                        </div>
                        
                        <div className="space-y-4">
                            {displayedFaqs.map((faq: any, index: number) => {
                                const question = faq.question_translations?.[locale] || (typeof faq.question === 'object' ? faq.question?.[locale] || faq.question?.id : faq.question);
                                const answer = faq.answer_translations?.[locale] || (typeof faq.answer_html === 'object' ? faq.answer_html?.[locale] || faq.answer_html?.id : (faq.answer_html || faq.answer));

                                return (
                                    <motion.div 
                                        key={faq.id || index} 
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
                                                {question}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${openFaq === index ? 'bg-insani-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>
                                        
                                        <div 
                                            className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                        >
                                            <div className="overflow-hidden">
                                                <div 
                                                    className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed text-base prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2"
                                                    dangerouslySetInnerHTML={{ __html: answer }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-12 text-center">
                            <Link href="/pusat-bantuan">
                                <Button size="lg" className="bg-insani-blue hover:bg-insani-blue/90 text-white rounded-full px-8 h-12 font-semibold shadow-sm transition-transform hover:scale-105">
                                    Lihat Seluruh FAQ di Pusat Bantuan
                                    <ExternalLink className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

        </PublicLayout>
    );
}

