import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheck,
    Building2,
    UserCheck,
    MapPin,
    Calendar,
    FileCheck2,
    CheckCircle2,
    TrendingUp,
    HeartHandshake,
    Users,
    ChevronRight,
    Heart,
} from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';
import { formatCurrency, getLocalizedValue } from '@/lib/utils';
import DonationProgressBar from '@/components/donation/DonationProgressBar';
import useTranslation from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Category {
    id: number;
    name: { id: string } | string;
    icon?: string | null;
}

interface ProgramItem {
    id: number;
    title: { id: string } | string;
    slug: string;
    cover_image: string;
    category?: Category | null;
    target_amount: string | null;
    collected_amount: number;
    is_continuous: boolean;
    deadline?: string | null;
    published_at?: string | null;
}

interface CampaignerData {
    id: number;
    type: 'individu' | 'lembaga';
    nama_lembaga: string | null;
    nomor_sk: string | null;
    has_npwp: boolean;
    npwp_display: string | null;
    location: string | null;
    created_at: string | null;
    name: string;
    user?: {
        name: string;
    };
}

interface StatsData {
    total_collected: number;
    total_programs: number;
    total_donors: number;
    active_programs_count: number;
    completed_programs_count: number;
}

interface Props {
    campaigner: CampaignerData;
    stats: StatsData;
    activePrograms: ProgramItem[];
    completedPrograms: ProgramItem[];
}

export default function CampaignerShow({ campaigner, stats, activePrograms = [], completedPrograms = [] }: Props) {
    const { t, locale, isRtl } = useTranslation();
    const [activeTab, setActiveTab] = useState<'aktif' | 'selesai'>('aktif');

    const displayName = campaigner.name || (campaigner.type === 'lembaga' ? campaigner.nama_lembaga : campaigner.user?.name) || 'Penggalang Dana';
    const isLembaga = campaigner.type === 'lembaga';

    const joinDateFormatted = campaigner.created_at
        ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(campaigner.created_at))
        : null;

    const displayedPrograms = activeTab === 'aktif' ? activePrograms : completedPrograms;

    return (
        <PublicLayout title={`${displayName} - ${t('Profil Penggalang Dana')}`}>
            <Head>
                <title>{`${displayName} - ${t('Profil Penggalang Dana Terverifikasi')}`}</title>
                <meta
                    name="description"
                    content={`Lihat profil resmi, rekam jejak transparansi, dan daftar program kebaikan yang digalang oleh ${displayName} di Insani.id.`}
                />
            </Head>

            <div className="bg-slate-50 min-h-screen py-6 sm:py-10">
                <div className="container mx-auto px-4 max-w-6xl space-y-6 sm:space-y-8">

                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-slate-500">
                        <Link href="/" className="hover:text-insani-blue transition-colors">{t('Beranda')}</Link>
                        <ChevronRight className={`w-4 h-4 mx-2 ${isRtl ? 'rotate-180' : ''}`} />
                        <Link href="/program" className="hover:text-insani-blue transition-colors">{t('Program Donasi')}</Link>
                        <ChevronRight className={`w-4 h-4 mx-2 ${isRtl ? 'rotate-180' : ''}`} />
                        <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
                            {displayName}
                        </span>
                    </div>

                    {/* Header Card: Profile Identity & Verification Badges */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 lg:p-8 shadow-xs relative overflow-hidden">
                        {/* Decorative Top Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-insani-blue via-teal-500 to-emerald-500"></div>

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex items-start gap-3.5 sm:gap-5">
                                {/* Avatar / Institution Crest */}
                                <div className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-insani-blue shadow-inner shrink-0 relative">
                                    {isLembaga ? (
                                        <Building2 className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-insani-blue" />
                                    ) : (
                                        <UserCheck className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-insani-blue" />
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 sm:p-1 ring-2 ring-white shadow-xs">
                                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    </div>
                                </div>

                                {/* Names, Badges & Meta */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                                            {displayName}
                                        </h1>
                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/80 font-semibold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            {isLembaga ? t('Lembaga Terverifikasi') : t('Penggalang Terverifikasi')}
                                        </Badge>
                                    </div>

                                    {/* Sub-info / Legal badges */}
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-600">
                                        {isLembaga && campaigner.nomor_sk && (
                                            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/70">
                                                <FileCheck2 className="w-4 h-4 text-insani-blue" />
                                                <span>SK Kemenkumham: <strong className="text-slate-900">{campaigner.nomor_sk}</strong></span>
                                            </span>
                                        )}

                                        {/* Location only shown for lembaga (foundation/organization) */}
                                        {isLembaga && campaigner.location && (
                                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                                {campaigner.location}
                                            </span>
                                        )}

                                        {joinDateFormatted && (
                                            <span className="inline-flex items-center gap-1.5 text-slate-500">
                                                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                                {t('Tergabung sejak')} {joinDateFormatted}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Metric Cards (3 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
                        {/* Total Dana */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 lg:p-6 shadow-xs flex items-center gap-3.5 sm:gap-4">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">{t('Total Dana Dihimpun')}</p>
                                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate mt-0.5">
                                    {formatCurrency(stats.total_collected)}
                                </p>
                            </div>
                        </div>

                        {/* Program Kebaikan */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 lg:p-6 shadow-xs flex items-center gap-3.5 sm:gap-4">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-insani-blue shrink-0">
                                <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">{t('Program Kebaikan')}</p>
                                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                                    {stats.total_programs} <span className="text-sm font-normal text-slate-500">{t('Program')}</span>
                                </p>
                            </div>
                        </div>

                        {/* Donatur Terhubung */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 lg:p-6 shadow-xs flex items-center gap-3.5 sm:gap-4">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">{t('Donatur Terhubung')}</p>
                                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                                    {stats.total_donors} <span className="text-sm font-normal text-slate-500">{t('Inisiator Kebaikan')}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Program Catalog Section */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('aktif')}
                                    className={`pb-2.5 px-3 text-sm sm:text-base font-bold transition-colors border-b-2 flex items-center gap-2 -mb-3.5 ${
                                        activeTab === 'aktif'
                                            ? 'border-insani-blue text-insani-blue'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <span>{t('Program Berjalan')}</span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                            activeTab === 'aktif' ? 'bg-blue-100 text-insani-blue' : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {activePrograms.length}
                                    </Badge>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('selesai')}
                                    className={`pb-2.5 px-3 text-sm sm:text-base font-bold transition-colors border-b-2 flex items-center gap-2 -mb-3.5 ${
                                        activeTab === 'selesai'
                                            ? 'border-insani-blue text-insani-blue'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <span>{t('Program Selesai')}</span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                            activeTab === 'selesai' ? 'bg-blue-100 text-insani-blue' : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {completedPrograms.length}
                                    </Badge>
                                </button>
                            </div>

                            <p className="text-xs text-slate-400 hidden sm:block">
                                {t('Menampilkan program resmi yang telah diverifikasi')}
                            </p>
                        </div>

                        {/* Program Grid */}
                        {displayedPrograms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                {displayedPrograms.map((program) => {
                                    const programTitle = getLocalizedValue(program.title, locale);
                                    const categoryName = program.category ? getLocalizedValue(program.category.name, locale) : undefined;
                                    const coverUrl = program.cover_image
                                        ? (program.cover_image.startsWith('http')
                                            ? program.cover_image
                                            : `/storage/${program.cover_image}`)
                                        : '/images/default-cover.jpg';

                                    return (
                                        <Link key={program.id} href={`/program/${program.slug}`} className="group h-full flex">
                                            <Card className="h-full w-full flex flex-col overflow-hidden border-slate-200/90 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 bg-white rounded-2xl">
                                                {/* Cover Image */}
                                                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                    <img
                                                        src={coverUrl}
                                                        alt={programTitle}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    {categoryName && (
                                                        <Badge className="absolute top-3 right-3 bg-white/95 text-insani-blue backdrop-blur-xs border-none font-semibold text-xs shadow-xs">
                                                            {categoryName}
                                                        </Badge>
                                                    )}
                                                    {activeTab === 'selesai' && (
                                                        <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                            {t('Program Selesai')}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Content */}
                                                <CardContent className="flex-1 p-5 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-base sm:text-lg text-slate-800 line-clamp-2 leading-snug group-hover:text-insani-blue transition-colors">
                                                            {programTitle}
                                                        </h3>
                                                    </div>

                                                    <div className="mt-5 space-y-3">
                                                        <DonationProgressBar
                                                            collectedAmount={program.collected_amount}
                                                            targetAmount={program.target_amount}
                                                            size="sm"
                                                            percentagePlacement="top-right"
                                                            percentageFormat="badge"
                                                        />

                                                        <div className="flex justify-between items-end text-sm pt-1">
                                                            <div>
                                                                <p className="text-slate-400 text-xs mb-0.5">{t('Terkumpul')}</p>
                                                                <p className="font-bold text-slate-900">
                                                                    {formatCurrency(program.collected_amount)}
                                                                </p>
                                                                {program.target_amount && parseFloat(program.target_amount) > 0 && (
                                                                    <p className="text-[11px] text-slate-400">
                                                                        {t('dari')} {formatCurrency(parseFloat(program.target_amount))}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-slate-400 text-xs mb-0.5">
                                                                    {program.is_continuous ? t('Tipe') : t('Status')}
                                                                </p>
                                                                <p className="font-medium text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                                                                    {program.is_continuous ? t('Fleksibel') : (activeTab === 'selesai' ? t('Selesai') : t('Aktif'))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80">
                                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                    <Heart className="w-7 h-7 text-slate-300" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {activeTab === 'aktif'
                                        ? t('Belum ada program berjalan')
                                        : t('Belum ada arsip program selesai')}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
                                    {activeTab === 'aktif'
                                        ? t('Penggalang dana ini belum memiliki program yang sedang aktif menggalang donasi saat ini.')
                                        : t('Seluruh program yang dijalankan penggalang dana ini masih dalam tahap penggalangan aktif.')}
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
