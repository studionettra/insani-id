import { Head, Link } from '@inertiajs/react';
import { Sparkles, Copy, Check, Share2, ExternalLink, Heart, Users, Target, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useTranslation from '@/hooks/use-translation';
import { formatCurrency, formatDate, getLocalizedValue } from '@/lib/utils';

interface FundraiserItem {
    id: number;
    user_id: number;
    program_id: number;
    referral_code: string;
    target_amount: string | number | null;
    personal_message: string | null;
    collected_amount: number;
    donors_count: number;
    progress_percentage: number;
    referral_url: string;
    is_active: boolean;
    created_at: string;
    program?: {
        id: number;
        title: { id: string; en?: string } | string;
        slug: string;
        cover_image: string;
        category?: {
            name: { id: string; en?: string } | string;
        };
    };
}

interface Props {
    fundraisers: {
        data: FundraiserItem[];
        current_page: number;
        last_page: number;
        links: any[];
    };
    stats: {
        totalCollected: number;
        totalDonors: number;
        activeCount: number;
    };
}

export default function AkunFundraiserIndex({ fundraisers, stats }: Props) {
    const { t, locale } = useTranslation();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (url: string, code: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                setCopiedCode(code);
                toast.success(t('Tautan fundraiser berhasil disalin!'));
                setTimeout(() => setCopiedCode(null), 2500);
            });
        }
    };

    return (
        <>
            <Head title="Fundraiser Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Fundraiser Saya</h1>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100">
                                Relawan
                            </Badge>
                        </div>
                        <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm">
                            Kelola tautan kebaikan yang Anda sebarkan dan pantau donatur yang Anda ajak.
                        </p>
                    </div>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                        <Link href="/program">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Cari Program Untuk Didukung
                        </Link>
                    </Button>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                                    Total Dihimpun
                                </span>
                                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {formatCurrency(stats.totalCollected)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Heart className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                                    Donatur Diajak
                                </span>
                                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.totalDonors} <span className="text-sm font-normal text-slate-500">orang</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                                    Program Aktif
                                </span>
                                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.activeCount} <span className="text-sm font-normal text-slate-500">program</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Target className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Fundraisers List */}
                <div className="space-y-4">
                    {fundraisers.data.length > 0 ? (
                        fundraisers.data.map((item) => {
                            const program = item.program;
                            const programTitle = program ? getLocalizedValue(program.title, locale) : 'Program Donasi';
                            const referralUrl = typeof window !== 'undefined'
                                ? `${window.location.origin}/program/${program?.slug}?ref=${item.referral_code}`
                                : `https://insani.id/program/${program?.slug}?ref=${item.referral_code}`;
                            const isCopied = copiedCode === item.referral_code;

                            const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Mari bersama saya mendukung program kebaikan "${programTitle}":\n\n${referralUrl}`)}`;
                            const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;

                            return (
                                <Card key={item.id} className="overflow-hidden border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-sm transition-all p-5">
                                    <div className="flex flex-col md:flex-row gap-5 items-start">
                                        {/* Cover image */}
                                        <div className="w-full md:w-56 shrink-0 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 relative shadow-2xs border border-slate-100 dark:border-gray-800">
                                            {program?.cover_image ? (
                                                <img
                                                    src={program.cover_image.startsWith('http') ? program.cover_image : `/storage/${program.cover_image}`}
                                                    alt={programTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <Heart className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 space-y-3 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                                        Kode: {item.referral_code}
                                                    </span>
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                                                        {programTitle}
                                                    </h3>
                                                </div>
                                                <Badge variant={item.is_active ? 'default' : 'outline'} className={item.is_active ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                                                    {item.is_active ? 'Aktif' : 'Non-aktif'}
                                                </Badge>
                                            </div>

                                            {item.personal_message && (
                                                <p className="text-xs text-slate-600 dark:text-gray-400 italic bg-slate-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-gray-800">
                                                    &ldquo;{item.personal_message}&rdquo;
                                                </p>
                                            )}

                                            {/* Progress / Metric */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
                                                <div>
                                                    <span className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-bold block">Terkumpul</span>
                                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.collected_amount)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-bold block">Donatur</span>
                                                    <span className="text-sm font-bold text-slate-800 dark:text-gray-200">{item.donors_count} orang</span>
                                                </div>
                                                {item.target_amount && Number(item.target_amount) > 0 && (
                                                    <div>
                                                        <span className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-bold block">Target Pribadi</span>
                                                        <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">{formatCurrency(Number(item.target_amount))}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Referral Link & Actions */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-gray-800">
                                                <div className="flex-1 flex items-center bg-slate-100 dark:bg-gray-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-gray-700 min-w-0">
                                                    <span className="text-xs text-slate-600 dark:text-gray-300 truncate select-all">{referralUrl}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => copyToClipboard(referralUrl, item.referral_code)}
                                                        className={`text-xs font-semibold ${isCopied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 dark:bg-gray-700 text-white hover:bg-slate-800'}`}
                                                    >
                                                        {isCopied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                                        {isCopied ? 'Tersalin' : 'Salin'}
                                                    </Button>
                                                    <Button asChild size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950">
                                                        <a href={whatsappShare} target="_blank" rel="noopener noreferrer" title="Bagikan ke WhatsApp">
                                                            <Share2 className="w-3.5 h-3.5" />
                                                        </a>
                                                    </Button>
                                                    <Button asChild size="sm" variant="outline" className="border-slate-200 dark:border-gray-700">
                                                        <Link href={`/program/${program?.slug}`} title="Lihat Halaman Program">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <Card className="border-dashed border-2 border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-2xs">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Anda Belum Memiliki Tautan Fundraiser
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                                Jadilah bagian dari gerakan kebaikan dengan membantu menyebarkan program-program di Insani. Tanpa verifikasi rumit, langsung aktif dalam satu klik!
                            </p>
                            <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Link href="/program">
                                    Jelajahi Program Sekarang
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
