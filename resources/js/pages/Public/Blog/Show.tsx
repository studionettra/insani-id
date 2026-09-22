import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, User, ArrowLeft, Eye, Share2, Copy, Check } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import GoogleAd from '@/components/ads/GoogleAd';
import { Button } from '@/components/ui/button';
import useTranslation from '@/hooks/use-translation';
import PublicLayout from '@/layouts/PublicLayout';
import { trackShareProgram } from '@/lib/analytics';
import { getLocalizedValue } from '@/lib/utils';
import DOMPurify from 'dompurify';

export default function BlogShow({ blog, relatedBlogs }: any) {
    const { t, locale, isRtl } = useTranslation();
    const { siteSettings } = usePage().props as any;
    const [copied, setCopied] = useState(false);

    const blogTitle = getLocalizedValue(blog.title, locale);
    const blogContent = getLocalizedValue(blog.content_html || blog.content || '', locale);
    const blogExcerpt = getLocalizedValue(blog.excerpt || '', locale);

    // Split content to safely inject in-article ad between paragraphs
    const contentParts = useMemo(() => {
        if (!blogContent) return { before: '', after: '' };
        const paragraphs = blogContent.split('</p>');
        // If article has at least 4 paragraphs, insert ad after paragraph 3
        if (paragraphs.length > 4) {
            const before = paragraphs.slice(0, 3).join('</p>') + '</p>';
            const after = paragraphs.slice(3).join('</p>');
            return { before, after };
        }
        return { before: blogContent, after: '' };
    }, [blogContent]);

    const baseShareUrl = typeof window !== 'undefined' ? `${window.location.origin}/berita/${blog.slug}` : `https://insani.id/berita/${blog.slug}`;
    const rawDescription = blogExcerpt || blogContent || '';
    const cleanExcerpt = rawDescription
        ? rawDescription.replace(/<[^>]+>/g, '').substring(0, 160).trim() + '...'
        : `Baca selengkapnya mengenai ${blogTitle} di Insani Indonesia.`;
    const imageUrl = blog.thumbnail_url || blog.featured_image_url || '/images/logo/logo-landscape-color.png';
    const absoluteImageUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `${typeof window !== 'undefined' ? window.location.origin : ''}${imageUrl.startsWith('/') ? imageUrl : '/storage/' + imageUrl}`;

    const buildShareLink = (channel: string) => {
        return `${baseShareUrl}?utm_source=${channel}&utm_medium=share_button&utm_campaign=${encodeURIComponent(blog.slug)}`;
    };

    const handleShare = (channel: string, targetUrl: string) => {
        trackShareProgram({
            programTitle: blogTitle,
            shareChannel: channel,
            url: targetUrl,
        });

        if (channel === 'copy_link') {
            navigator.clipboard.writeText(targetUrl);
            setCopied(true);
            toast.success('Tautan berita berhasil disalin!');
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        window.open(targetUrl, '_blank', 'noopener,noreferrer');
    };

    const shareText = `${t('Baca artikel menarik:', 'Baca artikel menarik:')} "${blogTitle}" ${t('melalui Insani Indonesia')}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + buildShareLink('whatsapp'))}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShareLink('facebook'))}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(buildShareLink('telegram'))}&text=${encodeURIComponent(shareText)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(buildShareLink('twitter'))}`;
    const copyUrl = buildShareLink('copy_link');

    return (
        <PublicLayout title={blogTitle}>
            <Head>
                <title>{`${blogTitle} - Insani Indonesia`}</title>
                <meta name="description" content={cleanExcerpt} />
                <link rel="canonical" href={baseShareUrl} />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={baseShareUrl} />
                <meta property="og:title" content={`${blogTitle} - Insani Indonesia`} />
                <meta property="og:description" content={cleanExcerpt} />
                <meta property="og:image" content={absoluteImageUrl} />
                <meta property="og:site_name" content="Insani Indonesia" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={baseShareUrl} />
                <meta name="twitter:title" content={`${blogTitle} - Insani Indonesia`} />
                <meta name="twitter:description" content={cleanExcerpt} />
                <meta name="twitter:image" content={absoluteImageUrl} />
            </Head>
            
            <div className="bg-slate-50 py-12 md:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <Link href="/berita" className="inline-flex items-center text-insani-blue hover:text-insani-darkblue mb-8 font-medium">
                        <ArrowLeft className={`w-4 h-4 ${isRtl ? 'ml-2 rotate-180' : 'mr-2'}`} /> {t('Kembali')}
                    </Link>
                    
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        
                        {/* Hero Image */}
                        {blog.thumbnail_url && (
                            <div className="w-full aspect-[21/9] bg-slate-100">
                                <img 
                                    src={blog.thumbnail_url} 
                                    alt={blogTitle} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        )}
                        
                        <div className="p-8 md:p-12">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4 sm:gap-6 border-b border-slate-100 pb-6">
                                {blog.wp_category && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                                        {blog.wp_category}
                                    </span>
                                )}
                                <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-insani-blue" />
                                    {new Date(blog.published_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : (locale === 'en' ? 'en-US' : 'id-ID'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-insani-blue" />
                                    {blog.author_name || 'Admin Insani'}
                                </span>
                                <span className="flex items-center text-slate-500">
                                    <Eye className="w-4 h-4 mr-1.5 text-insani-blue" />
                                    {(blog.views_count || 0).toLocaleString(locale === 'ar' ? 'ar-EG' : (locale === 'en' ? 'en-US' : 'id-ID'))} pembaca
                                </span>
                            </div>
                            
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                                {blogTitle}
                            </h1>

                            {/* Google AdSense Slot: Top Article */}
                            <GoogleAd 
                                slot={siteSettings?.adsense_slot_article_top} 
                                className="mb-8"
                            />
                            
                            {/* Content (with optional in-article ad in the middle) */}
                            {contentParts.after ? (
                                <>
                                    <div 
                                        className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentParts.before) }} 
                                    />

                                    {/* Google AdSense Slot: In-Article Middle */}
                                    <GoogleAd 
                                        slot={siteSettings?.adsense_slot_article_middle} 
                                        format="fluid"
                                        className="my-8"
                                    />

                                    <div 
                                        className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentParts.after) }} 
                                    />
                                </>
                            ) : (
                                <div 
                                    className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blogContent) }} 
                                />
                            )}

                            {/* Google AdSense Slot: Bottom Article */}
                            <GoogleAd 
                                slot={siteSettings?.adsense_slot_article_bottom} 
                                className="mt-8 mb-4"
                            />

                            {/* Smart Share Section */}
                            <div className="mt-12 pt-8 border-t border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                            <Share2 className="w-4 h-4 text-insani-blue" />
                                            Bagikan Informasi Ini
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Sebarkan berita kebaikan ini kepada keluarga dan teman Anda
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleShare('whatsapp', whatsappUrl)}
                                            className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                                        >
                                            WhatsApp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleShare('facebook', facebookUrl)}
                                            className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                                        >
                                            Facebook
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleShare('telegram', telegramUrl)}
                                            className="px-3 py-1.5 bg-[#229ED9] hover:bg-[#1f8fc4] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                                        >
                                            Telegram
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleShare('twitter', twitterUrl)}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                                        >
                                            X / Twitter
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleShare('copy_link', copyUrl)}
                                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 shadow-xs"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Tersalin' : 'Salin Tautan'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* Related Blogs Section */}
            {relatedBlogs && relatedBlogs.length > 0 && (
                <section className="py-16 bg-white border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-2xl font-bold text-insani-darkblue">{t('Berita Lainnya', 'Berita Lainnya')}</h2>
                            <Link href="/berita" className="text-insani-blue font-semibold hover:text-insani-darkblue">
                                {t('Lihat Semua')}
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedBlogs.map((item: any) => (
                                <Link 
                                    key={item.id} 
                                    href={`/berita/${item.slug}`} 
                                    className="flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md transition-all duration-300 group"
                                >
                                    {item.thumbnail_url && (
                                        <div className="aspect-[16/10] bg-slate-200 overflow-hidden">
                                            <img 
                                                src={item.thumbnail_url} 
                                                alt={getLocalizedValue(item.title, locale)} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center text-xs text-slate-500 mb-2 gap-3">
                                                {item.wp_category && (
                                                    <span className="font-semibold text-insani-blue">
                                                        {item.wp_category}
                                                    </span>
                                                )}
                                                <span>{new Date(item.published_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : (locale === 'en' ? 'en-US' : 'id-ID'), { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg line-clamp-2 group-hover:text-insani-blue transition-colors">
                                                {getLocalizedValue(item.title, locale)}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
