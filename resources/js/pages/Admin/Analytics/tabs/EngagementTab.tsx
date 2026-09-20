import React from 'react';
import { Eye, Users, Clock, ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopPage {
    title: string;
    path: string;
    url: string;
    views: number;
    avg_duration_seconds: number;
}

interface FunnelStep {
    stage: string;
    count: number;
}

export interface EngagementData {
    total_page_views: number;
    unique_visitors: number;
    avg_duration_seconds: number;
    top_pages: TopPage[];
    funnel: FunnelStep[];
}

interface Props {
    data: EngagementData;
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0 dtk';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m === 0) return `${s} dtk`;
    return `${m}m ${s}s`;
}

export default function EngagementTab({ data }: Props) {
    const kpis = [
        {
            label: 'Total Tayangan Halaman',
            value: data.total_page_views.toLocaleString('id-ID'),
            icon: <Eye className="w-5 h-5 text-blue-500" />,
            color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
            subtitle: 'Pageviews di seluruh web',
        },
        {
            label: 'Pengunjung Unik',
            value: data.unique_visitors.toLocaleString('id-ID'),
            icon: <Users className="w-5 h-5 text-emerald-500" />,
            color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
            subtitle: 'Sesi unik pengunjung',
        },
        {
            label: 'Rata-Rata Waktu di Halaman',
            value: formatDuration(data.avg_duration_seconds),
            icon: <Clock className="w-5 h-5 text-purple-500" />,
            color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
            subtitle: 'Estimasi durasi baca per halaman',
        },
    ];

    const baseCount = data.funnel[0]?.count || 1;

    return (
        <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {kpis.map((kpi, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between"
                    >
                        <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                                {kpi.label}
                            </span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {kpi.value}
                            </div>
                            <span className="text-xs text-gray-400 block mt-0.5">{kpi.subtitle}</span>
                        </div>
                        <div className={`p-3 rounded-2xl ${kpi.color}`}>
                            {kpi.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Corong Konversi Donasi (Donation Funnel)
                        </h3>
                    </div>
                    <span className="text-xs text-gray-400">Tahapan Interaksi Pengunjung</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                    {data.funnel.map((step, idx) => {
                        const pctOfBase = baseCount > 0 ? Math.min(100, (step.count / baseCount) * 100) : 0;
                        const prevCount = idx > 0 ? data.funnel[idx - 1]?.count || 1 : baseCount;
                        const stepConv = prevCount > 0 ? ((step.count / prevCount) * 100).toFixed(1) : '0';

                        return (
                            <div
                                key={idx}
                                className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/60 relative flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-2 text-gray-500">
                                        <span className="font-semibold uppercase tracking-wider text-[10px]">
                                            Langkah {idx + 1}
                                        </span>
                                        {idx > 0 && (
                                            <span className="text-emerald-600 font-semibold">
                                                {stepConv}% dari langkah sebelumnya
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                        {step.stage}
                                    </div>
                                    <div className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-3">
                                        {step.count.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                idx === 2 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : 'bg-indigo-500'
                                            }`}
                                            style={{ width: `${Math.max(4, pctOfBase)}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-gray-400 mt-1 block text-right">
                                        {pctOfBase.toFixed(1)}% dari total audiens
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Visited Pages */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Konten Paling Banyak Dibaca (Top Pages)
                        </h3>
                    </div>
                    <span className="text-xs text-gray-400">10 Halaman Teratas</span>
                </div>

                {data.top_pages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Belum ada riwayat halaman tercatat pada periode ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                                    <th className="pb-2.5 font-medium">Judul Konten / URL</th>
                                    <th className="pb-2.5 font-medium text-right">Total Tayangan</th>
                                    <th className="pb-2.5 font-medium text-right">Rata-Rata Durasi Baca</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {data.top_pages.map((page, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                        <td className="py-3 pr-4 max-w-[340px]">
                                            <a
                                                href={page.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 transition-colors truncate block"
                                            >
                                                {page.title}
                                            </a>
                                            <span className="text-[11px] text-gray-400 font-mono block truncate">
                                                {page.path}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-bold text-gray-800 dark:text-gray-100">
                                            {page.views.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                                            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-700/40 text-[11px]">
                                                {formatDuration(page.avg_duration_seconds)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
