import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, Calendar, ShieldCheck, CheckCircle, MessageCircle, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { id as dateId } from 'date-fns/locale/id';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Program {
    id: number;
    title: { id: string };
    slug: string;
    program_code: string;
    category: { title: { id: string }, name: { id: string } };
    campaigner_type: string;
    creator: { name: string };
    campaignerProfile?: { institution_name: string, pic_name: string, type: string };
    target_amount: string | null;
    collected_amount: number;
    cover_image: string;
    video_url: string | null;
    story: { id: string };
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

    return (
        <PublicLayout>
            <Head>
                <title>{`${program.title} - Program Donasi`}</title>
                <meta name="description" content={program.story ? program.story.substring(0, 150) + '...' : `Bantu wujudkan program ${program.title} bersama Insani Indonesia.`} />
                <meta property="og:title" content={program.title} />
                <meta property="og:description" content={program.story ? program.story.substring(0, 150) + '...' : `Bantu wujudkan program ${program.title} bersama Insani Indonesia.`} />
                <meta property="og:image" content={program.cover_image ? `/storage/${program.cover_image}` : '/images/default-cover.jpg'} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <div className="bg-slate-50 py-8 md:py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-slate-500 mb-6">
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
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image/Video Gallery */}
                            <div className="rounded-2xl overflow-hidden shadow-sm bg-white">
                                {program.video_url ? (
                                    <div className="aspect-video w-full bg-slate-900 relative">
                                        <iframe 
                                            className="absolute inset-0 w-full h-full"
                                            src={program.video_url.replace('watch?v=', 'embed/')} 
                                            title="YouTube video player" 
                                            frameBorder="0" 
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
                                )}
                            </div>

                            {/* Story Section */}
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardContent className="p-6 md:p-8">
                                    {/* Tabs Navigation */}
                                    <div className="flex border-b border-slate-200 mb-6 overflow-x-auto hide-scrollbar">
                                        <button 
                                            onClick={() => setActiveTab('cerita')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'cerita' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Cerita Program
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('kabar')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'kabar' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Kabar Terbaru <Badge variant="secondary" className="ml-2 text-xs">{program.updates?.length || 0}</Badge>
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('donatur')}
                                            className={`pb-4 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'donatur' ? 'border-insani-blue text-insani-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Donatur & Doa <Badge variant="secondary" className="ml-2 text-xs">{program.comments?.length || 0}</Badge>
                                        </button>
                                    </div>

                                    {/* Tab Content: Cerita */}
                                    {activeTab === 'cerita' && (
                                        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap prose-p:leading-relaxed prose-a:text-insani-blue prose-headings:text-slate-800 animate-in fade-in slide-in-from-bottom-2">
                                            {program.story}
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
                                                program.updates.map((update: any) => (
                                                    <div key={update.id} className="border border-slate-100 rounded-xl p-5 hover:border-insani-blue/20 transition-colors bg-white shadow-sm">
                                                        <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
                                                            <Calendar className="w-4 h-4" />
                                                            {format(new Date(update.created_at), 'd MMMM yyyy HH:mm', { locale: dateId })}
                                                        </div>
                                                        <h3 className="font-bold text-lg text-slate-800 mb-3">{update.title}</h3>
                                                        <div className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">
                                                            {update.content}
                                                        </div>
                                                    </div>
                                                ))
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

                        {/* Sidebar (Right) */}
                        <div className="space-y-6">
                            
                            {/* Donation Action Card */}
                            <Card className="border-none shadow-theme-md sticky top-24">
                                <CardContent className="p-6">
                                    <div className="mb-4">
                                        <Badge variant="outline" className="text-insani-blue border-insani-blue/30 bg-insani-blue/5 mb-3">
                                            {program.category?.name?.id || 'Kategori'}
                                        </Badge>
                                        <h1 className="text-2xl font-bold text-slate-800 leading-tight mb-2">
                                            {program.title}
                                        </h1>
                                    </div>

                                    <div className="py-4 border-t border-b border-slate-100 mb-6">
                                        {progress !== null ? (
                                            <>
                                                <div className="flex justify-between items-end mb-2">
                                                    <div>
                                                        <p className="text-2xl font-bold text-insani-blue">
                                                            {formatCurrency(program.collected_amount)}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            terkumpul dari target {formatCurrency(parseFloat(program.target_amount!))}
                                                        </p>
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

                                    <div className="space-y-3">
                                        <Link href={`/program/${program.slug}/donasi`} className="w-full">
                                            <Button className="w-full bg-insani-blue hover:bg-blue-700 text-white font-semibold h-12 text-lg shadow-md hover:shadow-lg transition-all rounded-xl">
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

                            {/* Campaigner Info Card */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-slate-800 mb-4">Penggalang Dana</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-insani-blue/10 flex items-center justify-center text-insani-blue">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 flex items-center gap-1">
                                                {campaignerName}
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            </p>
                                            <p className="text-xs text-slate-500">Akun Terverifikasi</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Dipublikasikan:</span> {formatDate(program.published_at)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
