import { Head, Link, useForm } from '@inertiajs/react';
import { format, differenceInDays } from 'date-fns';
import { id as dateId } from 'date-fns/locale/id';
import DOMPurify from 'dompurify';
import { Share2, Calendar, ShieldCheck, CheckCircle, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/PublicLayout';
import { formatCurrency, formatDate, getYouTubeEmbedUrl } from '@/lib/utils';

const UpdateCard = ({ update }: { update: any }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-slate-100 rounded-xl p-5 hover:border-insani-blue/20 transition-colors bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                {format(new Date(update.created_at), 'd MMMM yyyy HH:mm', { locale: dateId })}
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-3">{update.title}</h3>
            <div className="relative">
                <div
                    className={`text-slate-600 text-sm leading-relaxed prose prose-sm max-w-none prose-img:max-w-full prose-img:h-auto prose-img:rounded-md break-words overflow-hidden transition-all duration-300 ${expanded ? '' : 'max-h-40'}`}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(update.content) }}
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
                    {expanded ? 'Tutup' : 'Baca Selengkapnya'}
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
    updates?: any[];
    comments?: any[];
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
}

export default function ProgramShow({ program, auth }: Props) {
    const [activeTab, setActiveTab] = useState<'cerita' | 'kabar' | 'donatur'>('cerita');
    const [visibleUpdatesCount, setVisibleUpdatesCount] = useState(5);

    const commentForm = useForm({
        name: auth?.user ? auth.user.name : '',
        body: '',
    });

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        commentForm.post(route('programs.comments.store', program.id), {
            preserveScroll: true,
            onSuccess: () => commentForm.reset('body'),
        });
    };

    const progress = program.target_amount
        ? Math.min(100, Math.round((program.collected_amount / parseFloat(program.target_amount)) * 100))
        : null;

    const campaignerName = program.campaigner_type === 'internal'
        ? 'Insani Indonesia (Official)'
        : (program.campaignerProfile?.type === 'lembaga'
            ? program.campaignerProfile.institution_name
            : program.creator?.name);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${program.title} - Insani.id`,
                text: `Mari bersama wujudkan program kebaikan: ${program.title}`,
                url: window.location.href,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Tautan program disalin ke clipboard!");
        }
    };

    const renderProgramTitle = () => (
        <div className="mb-4">
            <Badge variant="outline" className="text-insani-blue border-insani-blue/30 bg-insani-blue/5 mb-3">
                {program.category?.name?.id || 'Kategori'}
            </Badge>
            <h1 className="text-xl lg:text-xl font-bold text-slate-800 leading-tight mb-2">
                {program.title}
            </h1>
        </div>
    );

    const renderDonationProgress = () => (
        <div className="py-4 lg:py-0 border-t lg:border-t-0 border-b lg:border-b-0 border-slate-100">
            {progress !== null ? (
                    <>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-insani-blue mb-3">
                                {formatCurrency(program.collected_amount)}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-slate-500">
                                    terkumpul dari target <span className="font-semibold text-slate-700">{formatCurrency(parseFloat(program.target_amount!))}</span>
                                </p>
                                {program.deadline ? (
                                    <p className="text-sm font-medium text-slate-600 shrink-0">
                                        {Math.max(0, differenceInDays(new Date(program.deadline), new Date()))} hari lagi
                                    </p>
                                ) : (
                                    <p className="text-sm font-medium text-slate-500 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                                        Tanpa Batas Waktu
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                            <div
                                className="bg-insani-blue h-2.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </>
                ) : (
                    <div>
                        <p className="text-3xl font-bold text-insani-blue mb-1">
                            {formatCurrency(program.collected_amount)}
                        </p>
                        <p className="text-sm text-slate-500">Dana Terkumpul</p>
                    </div>
                )}
        </div>
    );

    const renderCampaignerInfo = () => (
        <>
            <h3 className="font-semibold text-sm text-slate-500 mb-3">Penggalang Dana</h3>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-insani-blue/10 flex items-center justify-center text-insani-blue flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-sm text-slate-800 flex items-center gap-1">
                        {campaignerName}
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    </p>
                    <p className="text-[11px] text-slate-500">Akun Terverifikasi</p>
                </div>
            </div>
        </>
    );

    return (
        <PublicLayout hideFooter={true} hideMobileNav={true} hideTopNav={true}>
            <Head>
                <title>{`${program.title} - Program Donasi`}</title>
                <meta name="description" content={program.story ? program.story.substring(0, 150) + '...' : `Bantu wujudkan program ${program.title} bersama Insani Indonesia.`} />
                <meta property="og:title" content={program.title} />
                <meta property="og:description" content={program.story ? program.story.substring(0, 150) + '...' : `Bantu wujudkan program ${program.title} bersama Insani Indonesia.`} />
                <meta property="og:image" content={program.cover_image ? `/storage/${program.cover_image}` : '/images/default-cover.jpg'} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <div className="bg-slate-50 py-0 lg:py-12">
                <div className="container mx-auto px-0 lg:px-4 max-w-6xl">

                    {/* Breadcrumbs */}
                    <div className="hidden lg:flex items-center text-sm text-slate-500 mb-6">
                        <Link href="/" className="hover:text-insani-blue transition-colors">Beranda</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link href="/program" className="hover:text-insani-blue transition-colors">Program Donasi</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">
                            {program.title}
                        </span>
                    </div>

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
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
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
                                            alt={program.title as string} 
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
                                            Cerita
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('kabar')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'kabar' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Kabar <Badge variant="secondary" className="ml-2 text-xs">{program.updates?.length || 0}</Badge>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('donatur')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'donatur' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Donatur <Badge variant="secondary" className="ml-2 text-xs">{program.comments?.length || 0}</Badge>
                                        </button>
                                    </div>

                                    {/* Tab Content: Cerita */}
                                    {activeTab === 'cerita' && (
                                        <div className="animate-in fade-in slide-in-from-bottom-2">
                                            <div className="mb-3 pb-4 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>Program diterbitkan pada <span className="font-medium text-slate-700">{formatDate(program.published_at)}</span></span>
                                            </div>

                                            <div
                                                className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-justify prose-a:text-insani-blue prose-headings:text-slate-800 prose-strong:text-slate-800 prose-img:max-w-full prose-img:h-auto prose-img:rounded-md prose-img:mx-auto prose-li:marker:text-slate-400 break-words overflow-hidden text-left"
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(program.story) }}
                                            />
                                        </div>
                                    )}

                                    {/* Tab Content: Kabar Terbaru */}
                                    {activeTab === 'kabar' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                            {(!program.updates || program.updates.length === 0) ? (
                                                <div className="text-center py-10 text-slate-500">
                                                    Belum ada kabar terbaru untuk program ini.
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
                                                                Muat Lebih Banyak Kabar
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
                                                    Tulis Dukungan & Doa
                                                </h3>
                                                <form onSubmit={submitComment} className="space-y-4">
                                                    {!auth?.user && (
                                                        <div>
                                                            <Input
                                                                placeholder="Nama Anda"
                                                                value={commentForm.data.name}
                                                                onChange={e => commentForm.setData('name', e.target.value)}
                                                                required
                                                                className="bg-white"
                                                            />
                                                            {/* @ts-ignore */}
                                                            {commentForm.errors.name && <p className="text-sm text-destructive mt-1">{commentForm.errors.name}</p>}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Textarea
                                                            placeholder="Tulis dukungan, doa, atau komentar positif..."
                                                            value={commentForm.data.body}
                                                            onChange={e => commentForm.setData('body', e.target.value)}
                                                            required
                                                            rows={3}
                                                            className="bg-white"
                                                        />
                                                        {/* @ts-ignore */}
                                                        {commentForm.errors.body && <p className="text-sm text-destructive mt-1">{commentForm.errors.body}</p>}
                                                    </div>
                                                    <Button type="submit" disabled={commentForm.processing} className="bg-insani-blue hover:bg-blue-700">
                                                        {commentForm.processing ? 'Mengirim...' : 'Kirim Doa'}
                                                    </Button>
                                                </form>
                                            </div>

                                            {/* List Komentar */}
                                            <div className="space-y-4">
                                                {(!program.comments || program.comments.length === 0) ? (
                                                    <div className="text-center py-10 text-slate-500">
                                                        Belum ada doa dan dukungan. Jadilah yang pertama!
                                                    </div>
                                                ) : (
                                                    program.comments.map((comment: any) => (
                                                        <div key={comment.id} className="flex gap-4 border-b border-slate-100 pb-5 last:border-0">
                                                            <div className="w-10 h-10 rounded-full bg-insani-blue/10 flex items-center justify-center text-insani-blue font-bold flex-shrink-0">
                                                                {comment.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-slate-800">{comment.name}</span>
                                                                    {comment.donation_id && (
                                                                        <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                                                                            Donatur
                                                                        </Badge>
                                                                    )}
                                                                    <span className="text-xs text-slate-400 ml-2">
                                                                        {format(new Date(comment.created_at), 'd MMM yyyy', { locale: dateId })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                                    {comment.body}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
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
                                                Donasi Sekarang
                                            </Button>
                                        </Link>
                                        <Button onClick={handleShare} variant="outline" className="w-full h-12 text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors">
                                            <Share2 className="w-5 h-5 mr-2" />
                                            Bagikan Program
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
                        Bagikan
                    </Button>
                    <Link href={`/program/${program.slug}/donasi`} className="flex-1 block w-full">
                        <Button className="w-full h-12 bg-insani-blue hover:bg-blue-700 text-white font-semibold text-base shadow-md transition-all rounded-md">
                            Donasi Sekarang
                        </Button>
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
