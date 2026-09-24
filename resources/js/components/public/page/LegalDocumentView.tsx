import React, { useEffect, useState, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    ShieldCheck, 
    Printer, 
    Clock, 
    Calendar, 
    ListFilter, 
    FileText, 
    ArrowLeft,
    CheckCircle2,
    MessageCircle
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface LegalDocumentViewProps {
    title: string;
    contentHtml: string;
    attachmentUrl?: string | null;
}

interface TocItem {
    id: string;
    title: string;
}

export default function LegalDocumentView({ title, contentHtml, attachmentUrl }: LegalDocumentViewProps) {
    const { siteSettings } = usePage().props as any;
    const contactEmail = siteSettings?.contact_email || 'sapa@insani.id';
    const [activeSection, setActiveSection] = useState<string>('');

    // Process HTML to inject unique IDs into <h2> headings for smooth anchor linking
    const { processedHtml, tocItems } = useMemo(() => {
        if (typeof window === 'undefined') {
            return { processedHtml: contentHtml, tocItems: [] };
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHtml, 'text/html');
        const h2Elements = doc.querySelectorAll('h2');
        const items: TocItem[] = [];

        h2Elements.forEach((h2, index) => {
            const rawText = h2.textContent || '';
            const id = `pasal-${index + 1}`;
            h2.setAttribute('id', id);
            h2.classList.add('scroll-mt-24'); // scroll offset for sticky header
            items.push({
                id,
                title: rawText.trim()
            });
        });

        return {
            processedHtml: doc.body.innerHTML,
            tocItems: items
        };
    }, [contentHtml]);

    // Track active heading on scroll
    useEffect(() => {
        const handleScroll = () => {
            const headings = tocItems.map(item => document.getElementById(item.id)).filter(Boolean);
            const scrollPos = window.scrollY + 140;

            for (let i = headings.length - 1; i >= 0; i--) {
                const el = headings[i];
                if (el && el.offsetTop <= scrollPos) {
                    setActiveSection(el.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [tocItems]);

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50/70 pb-20">
            {/* HERO HEADER */}
            <div className="relative bg-insani-darkblue text-white py-12 md:py-16 px-4 print:hidden overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-insani-blue/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-insani-blue/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="container mx-auto max-w-5xl relative z-10">
                    <nav className="flex items-center gap-2 text-xs md:text-sm text-blue-200 font-medium mb-4">
                        <Link href="/" className="hover:underline text-slate-300">Beranda</Link>
                        <span>/</span>
                        <Link href="/pusat-bantuan" className="hover:underline text-slate-300">Pusat Bantuan</Link>
                        <span>/</span>
                        <span className="text-white">{title}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-semibold mb-3 backdrop-blur-md">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                                <span>Dokumen Hukum Resmi Terverifikasi</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                                {title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-all cursor-pointer"
                                title="Cetak Dokumen"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Cetak Dokumen</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Terakhir diperbarui: <strong>18 Agustus 2026</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Estimasi baca: <strong>~5 menit</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Kepatuhan: <strong>UU PDP No. 27/2022 &amp; UU No. 9/1961</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2-COLUMN LAYOUT */}
            <div className="container mx-auto px-4 max-w-5xl mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* SIDEBAR: STICKY TABLE OF CONTENTS */}
                    {tocItems.length > 0 && (
                        <aside className="lg:col-span-4 hidden lg:block sticky top-24 print:hidden">
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-3 border-b border-slate-100">
                                    <ListFilter className="w-4 h-4 text-insani-blue" />
                                    <span>Daftar Isi Dokumen</span>
                                </div>
                                <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 text-xs">
                                    {tocItems.map((item) => {
                                        const isActive = activeSection === item.id;
                                        return (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                onClick={(e) => scrollToSection(e, item.id)}
                                                className={`block px-3 py-2 rounded-xl transition-all font-medium leading-snug ${
                                                    isActive
                                                        ? 'bg-insani-blue/10 text-insani-blue font-bold border-l-3 border-insani-blue'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                            >
                                                {item.title}
                                            </a>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* MAIN ARTICLE BODY */}
                    <main className={tocItems.length > 0 ? 'lg:col-span-8' : 'col-span-12'}>
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 md:p-12 shadow-sm">
                            <div
                                className="prose prose-slate prose-lg max-w-none 
                                    prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight 
                                    prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-6 prose-h2:border-t prose-h2:border-slate-100 
                                    prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 
                                    prose-p:text-slate-600 prose-p:leading-relaxed 
                                    prose-li:text-slate-600 
                                    prose-strong:text-slate-900 prose-strong:font-semibold 
                                    prose-a:text-insani-blue prose-a:font-medium prose-a:no-underline hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedHtml) }}
                            />

                            {/* ATTACHMENT DOWNLOAD IF ANY */}
                            {attachmentUrl && (
                                <div className="mt-10 pt-6 border-t border-slate-200 print:hidden">
                                    <a
                                        href={attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-insani-blue" />
                                        <span>Download Dokumen Lampiran Resmi</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* SUPPORT NOTICE FOOTER */}
                        <div className="mt-6 bg-slate-100/80 rounded-2xl p-5 border border-slate-200 text-xs sm:text-sm text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                            <p>
                                Pertanyaan mengenai ketentuan hukum dan privasi? Hubungi tim legal kami di <strong className="text-slate-800">{contactEmail}</strong>.
                            </p>
                            <Link
                                href="/kontak"
                                className="inline-flex items-center gap-1.5 text-insani-blue font-semibold hover:underline shrink-0"
                            >
                                <span>Kontak Kami</span>
                                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
