import { Head, Link, useForm } from '@inertiajs/react';
import { format, differenceInDays } from 'date-fns';
import { id as dateId } from 'date-fns/locale/id';
import DOMPurify from 'dompurify';
import { Share2, Calendar, ShieldCheck, CheckCircle, MessageCircle, ChevronRight, ArrowLeft, Copy, Check, ExternalLink, Sparkles, Users, Target, TrendingUp, Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import DonationProgressBar from '@/components/donation/DonationProgressBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useTranslation from '@/hooks/use-translation';
import PublicLayout from '@/layouts/PublicLayout';
import { trackShareProgram, trackViewContent } from '@/lib/analytics';
import { formatCurrency, formatDate, getYouTubeEmbedUrl, getLocalizedValue } from '@/lib/utils';

const UpdateCard = ({ update }: { update: any }) => {
    const { t, locale } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-slate-100 rounded-xl p-5 hover:border-insani-blue/20 transition-colors bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                {format(new Date(update.created_at), 'd MMMM yyyy HH:mm', { locale: dateId })}
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-3">{getLocalizedValue(update.title, locale)}</h3>
            <div className="relative">
                <div
                    className={`text-slate-600 text-sm leading-relaxed prose prose-sm max-w-none prose-img:max-w-full prose-img:h-auto prose-img:rounded-md break-words overflow-hidden transition-all duration-300 ${expanded ? '' : 'max-h-40'}`}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getLocalizedValue(update.content, locale)) }}
                />
                {!expanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
            </div>
            <div className="mt-2 text-center">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-insani-blue font-medium text-sm hover:underline focus:outline-none"
                >
                    {expanded ? t('Tutup') : t('Baca Selengkapnya')}
                </button>
            </div>
        </div>
    );
};


interface Program {
    id: number;
    title: string;
    slug: string;
    program_code: string;
    category: { name: { id: string, en?: string } };
    campaigner_type: string;
    creator: { name: string };
    campaignerProfile?: { institution_name: string, pic_name: string, type: string };
    target_amount: string | null;
    collected_amount: number;
    cover_image: string;
    video_url: string | null;
    story: string;
    published_at: string;
    deadline?: string | null;
    updates?: any[];
    comments?: any[];
}

interface FundraiserItem {
    id: number;
    user_id: number;
    program_id: number;
    referral_code: string;
    target_amount: number | string | null;
    personal_message: string | null;
    collected_amount: number;
    donors_count: number;
    progress_percentage: number;
    referral_url: string;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
}

interface Props {
    program: Program;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    currentFundraiser?: FundraiserItem | null;
    topFundraisers?: FundraiserItem[];
    userFundraiser?: FundraiserItem | null;
}

export default function ProgramShow({ program, auth, currentFundraiser, topFundraisers = [], userFundraiser }: Props) {
    const { t, locale, isRtl } = useTranslation();
    const [activeTab, setActiveTab] = useState<'cerita' | 'kabar' | 'donatur' | 'fundraiser'>('cerita');
    const [visibleUpdatesCount, setVisibleUpdatesCount] = useState(5);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isFundraiserModalOpen, setIsFundraiserModalOpen] = useState(false);
    const [fundraiserCopied, setFundraiserCopied] = useState(false);

    const programTitle = getLocalizedValue(program.title, locale);
    const programStory = getLocalizedValue(program.story, locale);
    const categoryName = program.category ? getLocalizedValue(program.category.name, locale) : undefined;

    useEffect(() => {
        trackViewContent(programTitle, program.id, categoryName);
    }, [program.id]);

    const baseProgramUrl = typeof window !== 'undefined' ? `${window.location.origin}/program/${program.slug}` : `https://insani.id/program/${program.slug}`;
    const shareText = `${t('Mari bersama bantu program kebaikan:', 'Mari bersama bantu program kebaikan:')} "${programTitle}" ${t('melalui Insani Indonesia')}`;

    const buildShareLink = (channel: string) => {
        return `${baseProgramUrl}?utm_source=${channel}&utm_medium=share_button&utm_campaign=${encodeURIComponent(program.slug)}`;
    };

    const whatsappShareUrl = buildShareLink('whatsapp');
    const facebookShareUrl = buildShareLink('facebook');
    const telegramShareUrl = buildShareLink('telegram');
    const twitterShareUrl = buildShareLink('twitter');
    const copyShareUrl = buildShareLink('copy_link');
    const nativeShareUrl = buildShareLink('native_share');
    const metaDescription = programStory
        ? programStory.replace(/<[^>]+>/g, '').substring(0, 160).trim() + '...'
        : `Bantu wujudkan program ${programTitle} bersama Insani Indonesia.`;
    const coverImageUrl = program.cover_image
        ? (program.cover_image.startsWith('http')
            ? program.cover_image
            : `${typeof window !== 'undefined' ? window.location.origin : ''}/storage/${program.cover_image}`)
        : '/images/default-cover.jpg';

    const commentForm = useForm({
        name: auth?.user ? auth.user.name : '',
        body: '',
    });

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(`/programs/${program.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => commentForm.reset('body'),
        });
    };

    const fundraiserForm = useForm({
        target_amount: '',
        personal_message: '',
    });

    const handleCreateFundraiser = (e: React.FormEvent) => {
        e.preventDefault();
        fundraiserForm.post(`/program/${program.slug}/fundraiser`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Selamat! Tautan fundraiser Anda siap dibagikan.'));
            },
        });
    };

    const fundraiserUrl = userFundraiser
        ? (typeof window !== 'undefined' ? `${window.location.origin}/program/${program.slug}?ref=${userFundraiser.referral_code}` : `https://insani.id/program/${program.slug}?ref=${userFundraiser.referral_code}`)
        : '';
    const fundraiserShareText = `${t('Mari bersama saya bantu program kebaikan:', 'Mari bersama saya bantu program kebaikan:')} "${programTitle}" ${t('melalui Insani Indonesia')}`;
    const fundraiserWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${fundraiserShareText}\n\n${fundraiserUrl}`)}`;
    const fundraiserFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fundraiserUrl)}`;

    const copyFundraiserToClipboard = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard && fundraiserUrl) {
            navigator.clipboard.writeText(fundraiserUrl).then(() => {
                setFundraiserCopied(true);
                toast.success(t('Tautan fundraiser berhasil disalin!'));
                setTimeout(() => setFundraiserCopied(false), 2500);
            });
        }
    };

    const campaignerName = program.campaigner_type === 'internal'
        ? 'Insani Indonesia'
        : (program.campaignerProfile?.type === 'lembaga'
            ? program.campaignerProfile.institution_name
            : program.creator?.name);

    const copyToClipboard = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(copyShareUrl).then(() => {
                setCopied(true);
                toast.success(t('Tautan berhasil disalin!'));
                setTimeout(() => setCopied(false), 2500);
            });
            trackShareProgram({
                programTitle,
                shareChannel: 'copy_link',
                url: copyShareUrl,
            });
        }
    };

    const handleShare = () => {
        setIsShareOpen(true);
    };

    const handleNativeShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: `${programTitle} - Insani Indonesia`,
                text: shareText,
                url: nativeShareUrl,
            }).catch(() => {});
            trackShareProgram({
                programTitle,
                shareChannel: 'native_share',
                url: nativeShareUrl,
            });
        } else {
            copyToClipboard();
        }
    };

    const renderProgramTitle = () => (
        <div className="mb-4">
            <Badge variant="outline" className="text-insani-blue border-insani-blue/30 bg-insani-blue/5 mb-3">
                {categoryName || t('Kategori')}
            </Badge>
            <h1 className="text-xl lg:text-xl font-bold text-slate-800 leading-tight mb-2">
                {programTitle}
            </h1>
        </div>
    );

    const renderDonationProgress = () => {
        const hasTarget = Boolean(program.target_amount && parseFloat(program.target_amount) > 0);

        return (
            <div className="py-4 lg:py-0 border-t lg:border-t-0 border-b lg:border-b-0 border-slate-100">
                {hasTarget ? (
                    <>
                        <div className="mb-3">
                            <p className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                {formatCurrency(program.collected_amount)}
                            </p>
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-slate-500">
                                    {t('Terkumpul')} {t('dari target')} <span className="font-semibold text-slate-700">{formatCurrency(parseFloat(program.target_amount!))}</span>
                                </p>
                                {program.deadline ? (
                                    <p className="text-sm font-medium text-slate-600 shrink-0">
                                        {Math.max(0, differenceInDays(new Date(program.deadline), new Date()))} {t('Hari lagi')}
                                    </p>
                                ) : (
                                    <p className="text-xs font-medium text-slate-500 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {t('Tanpa Batas Waktu', 'Tanpa Batas Waktu')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mb-3">
                            <DonationProgressBar
                                collectedAmount={program.collected_amount}
                                targetAmount={program.target_amount}
                                size="md"
                                percentagePlacement="top-right"
                                percentageFormat="badge"
                                label={t('Ketercapaian Target', 'Target')}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <p className="text-3xl font-bold text-slate-900 mb-1">
                            {formatCurrency(program.collected_amount)}
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-500 mt-1">
                            <span>{t('Terkumpul')}</span>
                            <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600">
                                {t('Donasi Fleksibel')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCampaignerInfo = () => (
        <>
            <h3 className="font-semibold text-sm text-slate-500 mb-3">{t('Penggalang Dana')}</h3>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-insani-blue/10 flex items-center justify-center text-insani-blue flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-sm text-slate-800 flex items-center gap-1">
                        {campaignerName}
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    </p>
                    <p className="text-[11px] text-slate-500">{t('Akun Terverifikasi')}</p>
                </div>
            </div>
        </>
    );

    return (
        <PublicLayout title={programTitle} hideFooter={false} hideMobileNav={true} hideTopNav={false}>
            <Head>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={baseProgramUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={baseProgramUrl} />
                <meta property="og:title" content={programTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={coverImageUrl} />
                <meta property="og:site_name" content="Insani Indonesia" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={baseProgramUrl} />
                <meta name="twitter:title" content={programTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={coverImageUrl} />
            </Head>

            <div className="bg-slate-50 py-0 lg:py-12">
                <div className="container mx-auto px-0 lg:px-4 max-w-6xl">

                    {/* Breadcrumbs */}
                    <div className="hidden lg:flex items-center text-sm text-slate-500 mb-6">
                        <Link href="/" className="hover:text-insani-blue transition-colors">{t('Beranda')}</Link>
                        <ChevronRight className={`w-4 h-4 mx-2 ${isRtl ? 'rotate-180' : ''}`} />
                        <Link href="/program" className="hover:text-insani-blue transition-colors">{t('Program Donasi')}</Link>
                        <ChevronRight className={`w-4 h-4 mx-2 ${isRtl ? 'rotate-180' : ''}`} />
                        <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">
                            {programTitle}
                        </span>
                    </div>

                    {/* Fundraiser Referral Banner */}
                    {currentFundraiser && (
                        <div className="mb-6 mx-4 lg:mx-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                            <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs ring-2 ring-emerald-100">
                                {currentFundraiser.user?.name ? currentFundraiser.user.name.charAt(0).toUpperCase() : 'R'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-emerald-700" />
                                        {t('Relawan Fundraiser')}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {t('Mengajak Anda berdonasi di program ini')}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 mt-1">
                                    {currentFundraiser.user?.name}
                                </p>
                                {currentFundraiser.personal_message && (
                                    <p className="text-xs text-slate-600 italic mt-1 bg-white/80 p-2.5 rounded-xl border border-emerald-100 leading-relaxed">
                                        &ldquo;{currentFundraiser.personal_message}&rdquo;
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content (Left) */}
                        <div className="lg:col-span-2 space-y-0 lg:space-y-4">
                            {/* Image/Video Gallery */}
                            <div className="rounded-none lg:rounded-2xl overflow-hidden shadow-sm bg-white relative">
                                {/* Mobile Back Button */}
                                <Link
                                    href="/program"
                                    className="lg:hidden absolute top-4 left-4 z-10 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                                >
                                    <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                                </Link>
                                <div className="lg:hidden absolute top-4 right-4 z-10">
                                    <LanguageSwitcher />
                                </div>
                                {(() => {
                                    const embedUrl = getYouTubeEmbedUrl(program.video_url);

                                    return embedUrl ? (
                                        <div className="aspect-video w-full bg-slate-900 relative">
                                            <iframe 
                                                className="absolute inset-0 w-full h-full"
                                                src={embedUrl}
                                                title="YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <img 
                                            src={`/storage/${program.cover_image}`} 
                                            alt={programTitle} 
                                            className="w-full h-auto aspect-video object-cover"
                                        />
                                    );
                                })()}
                            </div>

                            {/* Title & Info */}
                            <div className="px-4 lg:px-0 py-4 lg:py-0 bg-white lg:bg-transparent mb-2 lg:mb-0">
                                {/* Mobile Only Title & Donation Progress */}
                                <div className="block lg:hidden">
                                    {renderProgramTitle()}
                                    {renderDonationProgress()}
                                </div>

                                <div className="mt-3 mb-3 lg:mt-0 p-0 lg:p-4 lg:bg-white lg:rounded-xl lg:border lg:border-slate-100 lg:shadow-sm">
                                    {renderCampaignerInfo()}
                                </div>
                            </div>

                            {/* Story Section */}
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardContent className="p-4 md:p-6 md:pt-4">
                                    {/* Tabs Navigation */}
                                    <div className="flex border-b border-slate-200 mb-6 overflow-x-auto hide-scrollbar">
                                        <button
                                            onClick={() => setActiveTab('cerita')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'cerita' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t('Cerita')}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('kabar')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'kabar' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t('Kabar')} <Badge variant="secondary" className="ml-2 text-xs">{program.updates?.length || 0}</Badge>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('donatur')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'donatur' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t('Donatur')} <Badge variant="secondary" className="ml-2 text-xs">{program.comments?.length || 0}</Badge>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('fundraiser')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'fundraiser' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t('Fundraiser')} <Badge variant="secondary" className="ml-2 text-xs">{topFundraisers?.length || 0}</Badge>
                                        </button>
                                    </div>

                                    {/* Tab Content: Cerita */}
                                    {activeTab === 'cerita' && (
                                        <div className="animate-in fade-in slide-in-from-bottom-2">
                                            <div className="mb-3 pb-4 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>{t('Program diterbitkan pada')} <span className="font-medium text-slate-700">{formatDate(program.published_at)}</span></span>
                                            </div>

                                            <div
                                                className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-justify prose-a:text-insani-blue prose-headings:text-slate-800 prose-strong:text-slate-800 prose-img:max-w-full prose-img:h-auto prose-img:rounded-md prose-img:mx-auto prose-li:marker:text-slate-400 break-words overflow-hidden text-left"
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(programStory) }}
                                            />
                                        </div>
                                    )}

                                    {/* Tab Content: Kabar Terbaru */}
                                    {activeTab === 'kabar' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                            {(!program.updates || program.updates.length === 0) ? (
                                                <div className="text-center py-10 text-slate-500">
                                                    {t('Belum ada kabar terbaru untuk program ini.')}
                                                </div>
                                            ) : (
                                                <>
                                                    {program.updates.slice(0, visibleUpdatesCount).map((update: any) => (
                                                        <UpdateCard key={update.id} update={update} />
                                                    ))}
                                                    {program.updates.length > visibleUpdatesCount && (
                                                        <div className="text-center mt-6">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setVisibleUpdatesCount(prev => prev + 5)}
                                                                className="border-insani-blue text-insani-blue hover:bg-insani-blue/5"
                                                            >
                                                                {t('Muat Lebih Banyak Kabar')}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Content: Donatur & Doa */}
                                    {activeTab === 'donatur' && (
                                        <div className="animate-in fade-in slide-in-from-bottom-2">
                                            {/* Form Komentar */}
                                            <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
                                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <MessageCircle className="w-5 h-5 text-insani-blue" />
                                                    {t('Tulis Dukungan & Doa')}
                                                </h3>
                                                <form onSubmit={submitComment} className="space-y-4">
                                                    {!auth?.user && (
                                                        <div>
                                                            <Input
                                                                placeholder={t('Nama Anda')}
                                                                value={commentForm.data.name}
                                                                onChange={e => commentForm.setData('name', e.target.value)}
                                                                required
                                                                className="bg-white"
                                                            />
                                                            {commentForm.errors.name && <p className="text-sm text-destructive mt-1">{commentForm.errors.name}</p>}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Textarea
                                                            placeholder={t('Tulis dukungan, doa, atau komentar positif...')}
                                                            value={commentForm.data.body}
                                                            onChange={e => commentForm.setData('body', e.target.value)}
                                                            required
                                                            rows={3}
                                                            className="bg-white"
                                                        />
                                                        {commentForm.errors.body && <p className="text-sm text-destructive mt-1">{commentForm.errors.body}</p>}
                                                    </div>
                                                    <Button type="submit" disabled={commentForm.processing} className="bg-insani-blue hover:bg-blue-700">
                                                        {commentForm.processing ? t('Mengirim...') : t('Kirim Doa')}
                                                    </Button>
                                                </form>
                                            </div>

                                            {/* List Komentar & Donatur */}
                                            <div className="space-y-4">
                                                {(!program.comments || program.comments.length === 0) ? (
                                                    <div className="text-center py-10 text-slate-500">
                                                        {t('Belum ada donasi atau doa yang masuk.')} {t('Jadilah yang pertama mendoakan atau berdonasi untuk program ini!')}
                                                    </div>
                                                ) : (
                                                    program.comments.map((comment: any) => (
                                                        <div key={comment.id} className="flex gap-3.5 sm:gap-4 border-b border-slate-100 pb-5 last:border-0 items-start">
                                                            <div className="w-10 h-10 rounded-full bg-insani-blue/10 flex items-center justify-center text-insani-blue font-bold flex-shrink-0 text-sm">
                                                                {comment.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-3 mb-1">
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="font-bold text-slate-800 text-sm sm:text-base truncate">{comment.name}</span>
                                                                            {comment.donation_id && (
                                                                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-4.5 bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200/60 font-semibold rounded-full">
                                                                                    {t('Donatur')}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-slate-400 block mt-0.5">
                                                                            {format(new Date(comment.created_at), 'd MMM yyyy', { locale: dateId })}
                                                                        </span>
                                                                    </div>
                                                                    {comment.donation?.amount && (
                                                                        <div className="text-right flex-shrink-0">
                                                                            <span className="text-[11px] text-slate-400 block font-normal leading-tight">{t('Berdonasi')}</span>
                                                                            <span className="font-bold text-sm sm:text-base text-insani-blue tracking-tight">
                                                                                {formatCurrency(comment.donation.amount)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {comment.body && (
                                                                    <p className="text-slate-600 text-sm leading-relaxed mt-1.5 break-words">
                                                                        {comment.body}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab Content: Fundraiser */}
                                    {activeTab === 'fundraiser' && (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex-wrap gap-3">
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                                                        <Sparkles className="w-4 h-4 text-emerald-600" />
                                                        {t('Gerakan Relawan Fundraiser')}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {t('Bantu sebarkan program ini dan pantau donasi yang berhasil Anda ajak.')}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        if (!auth?.user) {
                                                            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                                                            return;
                                                        }
                                                        setIsFundraiserModalOpen(true);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                                                >
                                                    {userFundraiser ? t('Lihat Tautan Saya') : t('Gabung Jadi Fundraiser')}
                                                </Button>
                                            </div>

                                            {(!topFundraisers || topFundraisers.length === 0) ? (
                                                <div className="text-center py-10 text-slate-500">
                                                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                                    <p className="text-sm font-medium">{t('Belum ada relawan fundraiser untuk program ini.')}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{t('Jadilah yang pertama mengajak kebaikan!')}</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {topFundraisers.map((item, idx) => (
                                                        <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 transition-colors shadow-xs">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                                    {item.user?.name ? item.user.name.charAt(0).toUpperCase() : `#${idx + 1}`}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-xs font-bold text-slate-800 truncate">
                                                                            {item.user?.name || 'Relawan Insani'}
                                                                        </p>
                                                                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50">
                                                                            {item.donors_count} {t('donatur')}
                                                                        </Badge>
                                                                    </div>
                                                                    {item.personal_message && (
                                                                        <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                                                                            &ldquo;{item.personal_message}&rdquo;
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-2 text-xs">
                                                                        <span className="text-slate-400 text-[10px] uppercase font-semibold">{t('Terkumpul')}:</span>{' '}
                                                                        <span className="font-bold text-emerald-700">{formatCurrency(item.collected_amount)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar (Right) - Hidden on Mobile */}
                        <div className="hidden lg:block space-y-6 sticky top-24 self-start">

                            {/* Donation Action Card */}
                            <Card className="border-none shadow-theme-md">
                                <CardContent className="p-6 md:p-6 md:pt-0 md:pb-0">
                                    <div className="mb-6">
                                        {renderProgramTitle()}
                                        {renderDonationProgress()}
                                    </div>

                                    <div className="space-y-3">
                                        <Link href={`/program/${program.slug}/donasi`} className="w-full">
                                            <Button className="mb-3 w-full bg-insani-blue hover:bg-blue-700 text-white font-semibold h-12 text-lg shadow-md hover:shadow-lg transition-all rounded-xl">
                                                {t('Donasi Sekarang')}
                                            </Button>
                                        </Link>
                                        <Button onClick={handleShare} variant="outline" className="w-full h-12 text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors">
                                            <Share2 className="w-5 h-5 mr-2" />
                                            {t('Bagikan Program Ini')}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (!auth?.user) {
                                                    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                                                    return;
                                                }
                                                setIsFundraiserModalOpen(true);
                                            }}
                                            variant="outline"
                                            className="w-full h-11 border-dashed border-emerald-400 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors font-semibold flex items-center justify-center gap-2 rounded-xl"
                                        >
                                            <Sparkles className="w-4 h-4 text-emerald-600" />
                                            {userFundraiser ? t('Lihat Tautan Fundraiser Saya') : t('Jadi Fundraiser Program Ini')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Action Bar (Mobile Only) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 pb-safe">
                <div className="flex gap-3 w-full">
                    <Button
                        onClick={handleShare}
                        variant="outline"
                        className="w-[28%] h-12 flex-shrink-0 flex items-center justify-center border-insani-blue text-insani-blue rounded-md bg-white hover:bg-insani-blue/5 font-semibold text-sm px-2"
                    >
                        <Share2 className="w-4 h-4 mr-1.5" />
                        {t('Bagikan')}
                    </Button>
                    <Link href={`/program/${program.slug}/donasi`} className="flex-1 block w-full">
                        <Button className="w-full h-12 bg-insani-blue hover:bg-blue-700 text-white font-semibold text-base shadow-md transition-all rounded-md">
                            {t('Donasi Sekarang')}
                        </Button>
                    </Link>
                </div>
            </div>
            {/* Share Modal */}
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-lg font-bold text-slate-800">
                            {t('Bagikan Program Ini')}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            {t('Sebarkan program ini ke keluarga dan kerabat untuk memperluas jangkauan kebaikan.', 'Sebarkan program ini ke keluarga dan kerabat untuk memperluas jangkauan kebaikan.')}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Program Preview */}
                    <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center mt-2">
                        <img
                            src={coverImageUrl}
                            alt={programTitle}
                            className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 line-clamp-1">{programTitle}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{campaignerName}</p>
                        </div>
                    </div>

                    {/* Social Share Grid */}
                    <div className="grid grid-cols-4 gap-2 py-3">
                        {/* WhatsApp */}
                        <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${whatsappShareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackShareProgram({ programTitle, shareChannel: 'whatsapp', url: whatsappShareUrl })}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-50 transition-colors group text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-medium text-slate-700">WhatsApp</span>
                        </a>

                        {/* Facebook */}
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookShareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackShareProgram({ programTitle, shareChannel: 'facebook', url: facebookShareUrl })}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-blue-50 transition-colors group text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-medium text-slate-700">Facebook</span>
                        </a>

                        {/* Telegram */}
                        <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(telegramShareUrl)}&text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackShareProgram({ programTitle, shareChannel: 'telegram', url: telegramShareUrl })}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-sky-50 transition-colors group text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/>
                                </svg>
                            </div>
                            <span className="text-[11px] font-medium text-slate-700">Telegram</span>
                        </a>

                        {/* Twitter / X */}
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(twitterShareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackShareProgram({ programTitle, shareChannel: 'twitter', url: twitterShareUrl })}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 transition-colors group text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </div>
                            <span className="text-[11px] font-medium text-slate-700">X / Twitter</span>
                        </a>
                    </div>

                    {/* Copy Link Input Bar */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                        <input
                            type="text"
                            readOnly
                            value={copyShareUrl}
                            className="w-full bg-transparent px-3 text-xs text-slate-600 outline-none truncate"
                        />
                        <Button
                            size="sm"
                            onClick={copyToClipboard}
                            className={`flex-shrink-0 h-9 px-4 text-xs font-semibold rounded-lg transition-all ${
                                copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-insani-blue hover:bg-blue-700 text-white'
                            }`}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 mr-1.5" />
                                    {t('Tersalin', 'Tersalin')}
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    {t('Salin Tautan')}
                                </>
                            )}
                        </Button>
                    </div>

                    {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                        <Button
                            variant="outline"
                            onClick={handleNativeShare}
                            className="w-full mt-1 text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
                        >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            {t('Opsi Berbagi Lainnya')}
                        </Button>
                    )}
                </DialogContent>
            </Dialog>

            {/* Fundraiser Modal */}
            <Dialog open={isFundraiserModalOpen} onOpenChange={setIsFundraiserModalOpen}>
                <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                            {userFundraiser ? t('Tautan Fundraiser Anda') : t('Jadi Relawan Fundraiser')}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            {userFundraiser 
                                ? t('Bagikan tautan unik Anda untuk mengajak lebih banyak kebaikan.')
                                : t('Ajak keluarga dan sahabat berdonasi untuk program ini melalui tautan referral pribadi Anda.')}
                        </DialogDescription>
                    </DialogHeader>

                    {userFundraiser ? (
                        <div className="space-y-4 pt-2">
                            {/* Stats Card */}
                            <div className="grid grid-cols-2 gap-3 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('Terkumpul')}</span>
                                    <span className="text-base font-extrabold text-emerald-700">{formatCurrency(userFundraiser.collected_amount)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('Donatur Diajak')}</span>
                                    <span className="text-base font-extrabold text-slate-800">{userFundraiser.donors_count} {t('orang')}</span>
                                </div>
                                {userFundraiser.target_amount && Number(userFundraiser.target_amount) > 0 && (
                                    <div className="col-span-2 pt-2 border-t border-emerald-100/80">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>{t('Target Pribadi')}: {formatCurrency(Number(userFundraiser.target_amount))}</span>
                                            <span className="font-semibold text-emerald-700">{userFundraiser.progress_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-emerald-200/60 rounded-full h-2">
                                            <div 
                                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min(100, userFundraiser.progress_percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Share Grid */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <a
                                    href={fundraiserWhatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>WhatsApp</span>
                                </a>
                                <a
                                    href={fundraiserFacebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Facebook</span>
                                </a>
                            </div>

                            {/* Copy Link Input Bar */}
                            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                                <input
                                    type="text"
                                    readOnly
                                    value={fundraiserUrl}
                                    className="w-full bg-transparent px-3 text-xs text-slate-600 outline-none truncate"
                                />
                                <Button
                                    size="sm"
                                    onClick={copyFundraiserToClipboard}
                                    className={`flex-shrink-0 h-9 px-4 text-xs font-semibold rounded-lg transition-all ${
                                        fundraiserCopied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                >
                                    {fundraiserCopied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 mr-1.5" />
                                            {t('Tersalin')}
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                                            {t('Salin')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleCreateFundraiser} className="space-y-4 pt-2">
                            <div>
                                <Label htmlFor="target_amount" className="text-xs font-medium text-slate-700">
                                    {t('Target Pengumpulan Dana Pribadi (Opsional)')}
                                </Label>
                                <Input
                                    id="target_amount"
                                    type="number"
                                    placeholder="Contoh: 1000000"
                                    value={fundraiserForm.data.target_amount}
                                    onChange={(e) => fundraiserForm.setData('target_amount', e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {t('Tentukan target penggalangan dana yang ingin Anda capai bersama donatur Anda.')}
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="personal_message" className="text-xs font-medium text-slate-700">
                                    {t('Kalimat Ajakan / Pesan Motivasi (Opsional)')}
                                </Label>
                                <Textarea
                                    id="personal_message"
                                    rows={3}
                                    placeholder={t('Contoh: Mari bersama saya bantu wujudkan kebaikan untuk program ini...')}
                                    value={fundraiserForm.data.personal_message}
                                    onChange={(e) => fundraiserForm.setData('personal_message', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={fundraiserForm.processing}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl shadow-xs"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {fundraiserForm.processing ? t('Membuat Tautan...') : t('Aktifkan & Buat Tautan Fundraiser')}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}
