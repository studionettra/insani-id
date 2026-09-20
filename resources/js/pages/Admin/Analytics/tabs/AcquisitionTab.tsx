import React from 'react';
import Chart from 'react-apexcharts';
import { Compass, Share2, Search, Link as LinkIcon, Globe, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CampaignRow {
    source: string;
    medium: string;
    campaign: string;
    visitors: number;
    donations_count: number;
    total_amount: number;
    conversion_rate: number;
}

interface ReferrerRow {
    referrer_domain: string;
    visits: number;
}

export interface AcquisitionData {
    channels: {
        'Organic Search': number;
        'Social Media': number;
        'Direct': number;
        'Referral': number;
    };
    campaigns: CampaignRow[];
    referrers: ReferrerRow[];
}

interface Props {
    data: AcquisitionData;
}

export default function AcquisitionTab({ data }: Props) {
    const totalVisits =
        (data.channels['Organic Search'] || 0) +
        (data.channels['Social Media'] || 0) +
        (data.channels['Direct'] || 0) +
        (data.channels['Referral'] || 0);

    const channelCards = [
        {
            title: 'Social Media',
            count: data.channels['Social Media'] || 0,
            icon: <Share2 className="w-5 h-5 text-indigo-500" />,
            color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
            desc: 'WhatsApp, FB, Instagram, TikTok, Telegram',
        },
        {
            title: 'Organic Search',
            count: data.channels['Organic Search'] || 0,
            icon: <Search className="w-5 h-5 text-emerald-500" />,
            color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
            desc: 'Google, Bing, DuckDuckGo, Yahoo',
        },
        {
            title: 'Direct Traffic',
            count: data.channels['Direct'] || 0,
            icon: <Compass className="w-5 h-5 text-blue-500" />,
            color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
            desc: 'Ketik URL langsung, Bookmark, Tanpa perujuk',
        },
        {
            title: 'Referral Luar',
            count: data.channels['Referral'] || 0,
            icon: <LinkIcon className="w-5 h-5 text-amber-500" />,
            color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
            desc: 'Tautan dari portal berita / website mitra',
        },
    ];

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            toolbar: { show: false },
        },
        labels: ['Social Media', 'Organic Search', 'Direct', 'Referral'],
        colors: ['#6366F1', '#10B981', '#3B82F6', '#F59E0B'],
        legend: {
            position: 'bottom',
            labels: { colors: '#6B7280' },
            itemMargin: { horizontal: 10, vertical: 5 },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
        },
        stroke: { width: 0 },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} Sesi Pengunjung`,
            },
        },
    };

    const chartSeries = [
        data.channels['Social Media'] || 0,
        data.channels['Organic Search'] || 0,
        data.channels['Direct'] || 0,
        data.channels['Referral'] || 0,
    ];

    return (
        <div className="space-y-6">
            {/* Top Channel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {channelCards.map((card, idx) => {
                    const pct = totalVisits > 0 ? ((card.count / totalVisits) * 100).toFixed(1) : '0';
                    return (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {card.title}
                                </span>
                                <div className={`p-2 rounded-xl ${card.color}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {card.count.toLocaleString('id-ID')}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-400 truncate">{card.desc}</span>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {pct}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Channels Donut and Top Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        Komposisi Saluran Masuk
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Proporsi kanal pengunjung yang mengakses website
                    </p>

                    <div className="flex-1 flex items-center justify-center min-h-[220px]">
                        {totalVisits === 0 ? (
                            <div className="text-sm text-gray-400">Belum ada data sesi.</div>
                        ) : (
                            <Chart
                                options={chartOptions}
                                series={chartSeries}
                                type="donut"
                                width="100%"
                                height={240}
                            />
                        )}
                    </div>
                </div>

                {/* Top External Referrers */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                Situs Perujuk Teratas (Referrer Domains)
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">Domain Eksternal</span>
                    </div>

                    {data.referrers.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Sebagian besar pengunjung datang langsung (Direct) atau belum ada perujuk eksternal.
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                                        <th className="pb-2.5 font-medium">Domain Perujuk</th>
                                        <th className="pb-2.5 font-medium text-right">Jumlah Kunjungan</th>
                                        <th className="pb-2.5 font-medium text-right">Proporsi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {data.referrers.map((ref, idx) => {
                                        const refPct = totalVisits > 0 ? ((ref.visits / totalVisits) * 100).toFixed(1) : '0';
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                                <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                                                        {ref.referrer_domain}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-right font-bold text-gray-700 dark:text-gray-300">
                                                    {ref.visits.toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-2.5 text-right text-gray-500">
                                                    <Badge variant="outline" className="text-[11px]">
                                                        {refPct}%
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* UTM Campaigns Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Performa Kampanye Pemasaran (UTM Tracking)
                        </h3>
                    </div>
                    <span className="text-xs text-gray-400">Kampanye Aktif</span>
                </div>

                {data.campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Belum ada tautan dengan parameter UTM yang diklik pengunjung dalam periode ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                                    <th className="pb-2.5 font-medium">Sumber (Source)</th>
                                    <th className="pb-2.5 font-medium">Media (Medium)</th>
                                    <th className="pb-2.5 font-medium">Kampanye (Campaign)</th>
                                    <th className="pb-2.5 font-medium text-right">Pengunjung</th>
                                    <th className="pb-2.5 font-medium text-right">Donasi Berhasil</th>
                                    <th className="pb-2.5 font-medium text-right">Nominal Donasi</th>
                                    <th className="pb-2.5 font-medium text-right">Konversi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {data.campaigns.map((camp, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                        <td className="py-3 font-semibold text-gray-900 dark:text-white">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200">
                                                {camp.source}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300 font-mono text-[11px]">
                                            {camp.medium}
                                        </td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300 font-medium">
                                            {camp.campaign}
                                        </td>
                                        <td className="py-3 text-right font-bold text-gray-800 dark:text-gray-200">
                                            {camp.visitors.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 text-right font-bold text-emerald-600">
                                            {camp.donations_count}
                                        </td>
                                        <td className="py-3 text-right font-bold text-gray-900 dark:text-white">
                                            Rp {camp.total_amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 text-right">
                                            <Badge
                                                className={`text-[11px] ${
                                                    camp.conversion_rate > 5
                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                {camp.conversion_rate}%
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
