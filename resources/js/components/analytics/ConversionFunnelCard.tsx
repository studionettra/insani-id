import {
    Eye,
    FileCheck2,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    ExternalLink,
    Target,
    Flame,
    ArrowDownRight,
    Layers,
    Sparkles,
} from 'lucide-react';
import React from 'react';
import { formatCurrency } from '@/lib/utils';

export interface FunnelData {
    totalViews: number;
    totalAttempts: number;
    totalPaid: number;
    conversionRate: number;
}

export interface TopProgram {
    id: number;
    title: string;
    slug: string;
    category?: string;
    collected_amount: number;
    target_amount: number;
    views_count: number;
    donation_count: number;
    conversion_rate: number;
}

interface Props {
    funnel: FunnelData;
    topPrograms?: TopProgram[];
}

export default function ConversionFunnelCard({
    funnel,
    topPrograms = [],
}: Props) {
    const totalViews = Number(funnel?.totalViews) || 0;
    const totalAttempts = Number(funnel?.totalAttempts) || 0;
    const totalPaid = Number(funnel?.totalPaid) || 0;
    const overallRate = Number(funnel?.conversionRate) || 0;

    // Step calculations
    const attemptRate = totalViews > 0 ? (totalAttempts / totalViews) * 100 : 0;
    const dropoffViews = Math.max(0, 100 - attemptRate);

    const paidRate = totalAttempts > 0 ? (totalPaid / totalAttempts) * 100 : 0;
    const dropoffAttempts = Math.max(0, 100 - paidRate);

    // Proportional retention bar percentages (baseline 100%)
    const attemptsBarPct =
        totalViews > 0
            ? Math.min(
                  100,
                  Math.max(
                      totalAttempts > 0 ? 5 : 0,
                      (totalAttempts / totalViews) * 100,
                  ),
              )
            : 0;

    const paidBarPct =
        totalViews > 0
            ? Math.min(
                  100,
                  Math.max(
                      totalPaid > 0 ? 3 : 0,
                      (totalPaid / totalViews) * 100,
                  ),
              )
            : 0;

    return (
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs transition-shadow duration-200 hover:shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
            {/* Header Section */}
            <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center dark:border-gray-800/80">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#1A56DB] dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-400">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Corong Konversi Donatur
                            </h3>
                            <span className="hidden items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 sm:inline-flex dark:bg-gray-800 dark:text-gray-300">
                                Donation Funnel
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Alur perjalanan donatur dari melihat halaman program
                            hingga pembayaran terverifikasi
                        </p>
                    </div>
                </div>

                {/* Global Conversion Badge */}
                <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-200/80 bg-emerald-50 px-3.5 py-1.5 text-emerald-800 shadow-2xs sm:self-center dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Target className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-left">
                        <div className="text-[10px] font-medium tracking-wider text-emerald-600/90 uppercase dark:text-emerald-400/90">
                            Konversi Keseluruhan
                        </div>
                        <div className="text-sm font-bold tracking-tight text-emerald-900 dark:text-emerald-200">
                            {overallRate.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Funnel Pipeline Visual Stages */}
            <div className="my-6">
                <div className="relative grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-3">
                    {/* STAGE 1: Views (Awareness) */}
                    <div className="relative flex flex-col justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 p-4.5 transition-all duration-150 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700">
                        <div>
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-700 uppercase dark:bg-slate-700/60 dark:text-slate-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-400" />
                                    Tahap 1 • Tayangan
                                </span>
                                <div className="rounded-lg border border-slate-100 bg-white p-1.5 text-slate-500 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                    <Eye className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="mb-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {totalViews.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Total Tayangan Program
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                                Calon donatur mengunjungi & membaca kampanye
                            </p>
                        </div>

                        <div className="mt-5 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                            <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <span>Retensi Corong</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    100% (Baseline)
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div className="h-full w-full rounded-full bg-slate-600 transition-all duration-500 dark:bg-slate-400" />
                            </div>
                        </div>

                        {/* Inter-step Desktop Connector 1 -> 2 */}
                        <div className="absolute top-1/2 -right-3.5 z-20 hidden -translate-y-1/2 flex-col items-center lg:flex">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Inter-step Indicator 1 -> 2 */}
                    <div className="-my-2 flex items-center justify-center gap-2 py-0.5 text-xs text-gray-500 lg:hidden">
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
                            <ArrowDownRight className="h-3 w-3" />
                            {attemptRate.toFixed(1)}% mengisi formulir
                        </span>
                        <span className="text-[11px] text-gray-400">
                            ({dropoffViews.toFixed(1)}% drop-off)
                        </span>
                    </div>

                    {/* STAGE 2: Attempts (Intent) */}
                    <div className="relative flex flex-col justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4.5 transition-all duration-150 hover:border-blue-200 dark:border-blue-900/50 dark:bg-blue-950/20 dark:hover:border-blue-800">
                        <div>
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 uppercase dark:bg-blue-900/50 dark:text-blue-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    Tahap 2 • Minat
                                </span>
                                <div className="rounded-lg border border-blue-100 bg-white p-1.5 text-blue-600 shadow-2xs dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-400">
                                    <FileCheck2 className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="mb-1 text-2xl font-black tracking-tight text-blue-950 dark:text-blue-100">
                                {totalAttempts.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                                Form Donasi Terkirim
                            </p>
                            <p className="mt-0.5 text-[11px] text-blue-700/80 dark:text-blue-400/80">
                                Calon donatur mengisi nominal & data diri
                            </p>
                        </div>

                        <div className="mt-5 border-t border-blue-100/80 pt-3 dark:border-blue-900/50">
                            <div className="mb-1.5 flex items-center justify-between text-[11px] text-blue-800/80 dark:text-blue-300/80">
                                <span>Rasio dari Tayangan</span>
                                <span className="font-bold text-blue-900 dark:text-blue-200">
                                    {attemptRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200/60 dark:bg-blue-950">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-500"
                                    style={{ width: `${attemptsBarPct}%` }}
                                />
                            </div>
                        </div>

                        {/* Inter-step Desktop Connector 2 -> 3 */}
                        <div className="absolute top-1/2 -right-3.5 z-20 hidden -translate-y-1/2 flex-col items-center lg:flex">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Inter-step Indicator 2 -> 3 */}
                    <div className="-my-2 flex items-center justify-center gap-2 py-0.5 text-xs text-gray-500 lg:hidden">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <ArrowDownRight className="h-3 w-3" />
                            {paidRate.toFixed(1)}% berhasil dibayar
                        </span>
                        <span className="text-[11px] text-gray-400">
                            ({dropoffAttempts.toFixed(1)}% batal)
                        </span>
                    </div>

                    {/* STAGE 3: Paid (Action / Success) */}
                    <div className="relative flex flex-col justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4.5 transition-all duration-150 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:hover:border-emerald-800">
                        <div>
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-800 uppercase dark:bg-emerald-900/60 dark:text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Tahap 3 • Lunas
                                </span>
                                <div className="rounded-lg border border-emerald-100 bg-white p-1.5 text-emerald-600 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="mb-1 text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-100">
                                {totalPaid.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                                Donasi Terverifikasi
                            </p>
                            <p className="mt-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                                Transaksi sukses lunas dan dana diterima
                            </p>
                        </div>

                        <div className="mt-5 border-t border-emerald-100/80 pt-3 dark:border-emerald-900/50">
                            <div className="mb-1.5 flex items-center justify-between text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                                <span>Sukses dari Form</span>
                                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                                    {paidRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200/60 dark:bg-emerald-950">
                                <div
                                    className="h-full rounded-full bg-emerald-600 transition-all duration-500 dark:bg-emerald-500"
                                    style={{ width: `${paidBarPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Funnel Health Diagnostic Strip */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-xs sm:grid-cols-3 dark:border-gray-800 dark:bg-gray-800/40">
                    <div className="flex items-center justify-between px-2 py-1 sm:justify-start sm:gap-2">
                        <span className="text-gray-500 dark:text-gray-400">
                            Daya Tarik Tayangan:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                            {attemptRate.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-gray-200/70 px-2 py-1 sm:justify-start sm:gap-2 sm:border-x dark:border-gray-700/70">
                        <span className="text-gray-500 dark:text-gray-400">
                            Penyelesaian Bayar:
                        </span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">
                            {paidRate.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 sm:justify-start sm:gap-2">
                        <span className="text-gray-500 dark:text-gray-400">
                            Drop-off di Formulir:
                        </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                            {dropoffAttempts.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Performing Programs Section */}
            <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
                <div className="mb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-amber-500" />
                        <h4 className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                            Program Terpopuler & Kinerja Konversi
                        </h4>
                    </div>
                    {topPrograms.length > 0 && (
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                            {topPrograms.length} Program Unggulan
                        </span>
                    )}
                </div>

                {topPrograms.length > 0 ? (
                    <div className="space-y-2">
                        {topPrograms.map((program, idx) => {
                            // Ranks styling
                            const isFirst = idx === 0;
                            const isSecond = idx === 1;
                            const isThird = idx === 2;

                            let rankBadgeClass =
                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                            if (isFirst) {
                                rankBadgeClass =
                                    'bg-amber-100 text-amber-800 border border-amber-300/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
                            } else if (isSecond) {
                                rankBadgeClass =
                                    'bg-slate-200 text-slate-800 border border-slate-300/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
                            } else if (isThird) {
                                rankBadgeClass =
                                    'bg-orange-100 text-orange-800 border border-orange-300/80 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800';
                            }

                            // Conversion rate color
                            let convBadgeClass =
                                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
                            if (program.conversion_rate >= 5) {
                                convBadgeClass =
                                    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
                            } else if (program.conversion_rate >= 2) {
                                convBadgeClass =
                                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60';
                            }

                            const targetPct =
                                program.target_amount > 0
                                    ? Math.min(
                                          100,
                                          Math.round(
                                              (program.collected_amount /
                                                  program.target_amount) *
                                                  100,
                                          ),
                                      )
                                    : null;

                            return (
                                <div
                                    key={program.id}
                                    className="group flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50/80 sm:flex-row sm:items-center dark:border-gray-800/70 dark:bg-gray-900/60 dark:hover:bg-gray-800/40"
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        {/* Rank Indicator */}
                                        <div
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold shadow-2xs ${rankBadgeClass}`}
                                        >
                                            {idx + 1}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                                <a
                                                    href={`/program/${program.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex max-w-full items-center gap-1 truncate text-xs font-semibold text-gray-900 transition-colors hover:text-[#1A56DB] sm:text-sm dark:text-white dark:hover:text-blue-400"
                                                    title={program.title}
                                                >
                                                    <span className="truncate">
                                                        {program.title}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                                </a>

                                                {program.category && (
                                                    <span className="py-0.2 inline-flex items-center rounded-md bg-gray-100 px-2 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                        {program.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Scannable Metric Chips */}
                                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3 w-3 text-slate-400" />
                                                    {program.views_count.toLocaleString(
                                                        'id-ID',
                                                    )}{' '}
                                                    tayangan
                                                </span>
                                                <span>•</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                    {program.donation_count}{' '}
                                                    donasi lunas
                                                </span>
                                                {program.conversion_rate >
                                                    0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span
                                                            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${convBadgeClass}`}
                                                        >
                                                            Konversi{' '}
                                                            {
                                                                program.conversion_rate
                                                            }
                                                            %
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Metrics */}
                                    <div className="shrink-0 pl-9 text-left sm:pl-0 sm:text-right">
                                        <div className="text-xs font-bold text-[#1A56DB] sm:text-sm dark:text-blue-400">
                                            {formatCurrency(
                                                program.collected_amount,
                                            )}
                                        </div>
                                        {targetPct !== null && (
                                            <div className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                                                {targetPct}% dari target
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center dark:border-gray-800">
                        <Layers className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Belum ada data interaksi program
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                            Data konversi akan muncul seiring dengan kunjungan
                            dan donasi yang masuk ke program aktif.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
