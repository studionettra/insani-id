import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import DOMPurify from 'dompurify';
import HelpCenterView from '@/components/public/page/HelpCenterView';
import HowToDonateView from '@/components/public/page/HowToDonateView';
import LegalDocumentView from '@/components/public/page/LegalDocumentView';

interface PageProps {
    page: {
        slug?: string;
        title: string;
        meta_title?: string;
        meta_description?: string;
        content_html: string;
        attachment_url?: string | null;
    };
    faqs?: any[];
}

export default function Show({ page, faqs }: PageProps) {
    const isPusatBantuan = page.slug === 'pusat-bantuan';
    const isCaraDonasi = page.slug === 'cara-donasi';
    const isLegalPage = page.slug === 'syarat-ketentuan' || page.slug === 'kebijakan-privasi';

    const rawTitle = page.meta_title || page.title || '';
    const cleanTitle = typeof rawTitle === 'string'
        ? rawTitle.replace(/\s*[-|]\s*Insani Indonesia$/i, '').trim()
        : rawTitle;

    return (
        <PublicLayout title={cleanTitle}>
            <Head>
                {page.meta_description && (
                    <meta name="description" content={page.meta_description} />
                )}
            </Head>

            {/* ADAPTIVE RENDERING BASED ON PAGE SLUG */}
            {isPusatBantuan ? (
                <HelpCenterView faqs={faqs} />
            ) : isCaraDonasi ? (
                <HowToDonateView />
            ) : isLegalPage ? (
                <LegalDocumentView 
                    title={page.title}
                    contentHtml={page.content_html}
                    attachmentUrl={page.attachment_url}
                />
            ) : (
                /* FALLBACK STANDARD CMS ARTICLE VIEW */
                <div className="bg-slate-50/50 py-12 md:py-20 min-h-screen">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 md:p-12">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 pb-8 border-b border-slate-100">
                                {page.title}
                            </h1>

                            <div 
                                className="prose prose-lg prose-slate max-w-none text-slate-600
                                    prose-headings:font-bold prose-headings:text-slate-900 
                                    prose-a:text-insani-blue hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content_html) }}
                            />

                            {page.attachment_url && (
                                <div className="mt-12 pt-8 border-t border-slate-100">
                                    <a 
                                        href={page.attachment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-xl font-medium transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Lampiran
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
