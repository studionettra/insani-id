import React from 'react';
import Chart from 'react-apexcharts';
import { Activity, Eye, Radio, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActivePage {
    url: string;
    path: string;
    title: string;
    active_readers: number;
}

interface MinuteView {
    time: string;
    views: number;
}

interface RecentEvent {
    id: number;
    event_name: string;
    url: string;
    time_ago: string;
    device: string;
    payload: any;
}

export interface RealtimeData {
    active_visitors_count: number;
    active_pages: ActivePage[];
    views_per_minute: MinuteView[];
    recent_events: RecentEvent[];
    last_updated: string;
}

interface Props {
    data: RealtimeData;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export default function RealtimeTab({ data, onRefresh, isRefreshing }: Props) {
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            sparkline: { enabled: false },
            animations: { enabled: true, dynamicAnimation: { speed: 400 } },
        },
        plotOptions: {
            bar: {
                borderRadius: 3,
                columnWidth: '60%',
            },
        },
        dataLabels: { enabled: false },
        colors: ['#10B981'],
        xaxis: {
            categories: data.views_per_minute.map((item) => item.time),
            labels: {
                show: true,
                rotate: -45,
                style: { colors: '#9CA3AF', fontSize: '10px' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#9CA3AF', fontSize: '10px' },
            },
        },
        grid: {
            borderColor: '#F3F4F6',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
        },
        tooltip: {
            theme: 'light',
            y: {
                formatter: (val) => `${val} tayangan`,
            },
        },
    };

    const series = [
        {
            name: 'Tayangan Halaman',
            data: data.views_per_minute.map((item) => item.views),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Top Realtime Summary Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">Live Saat Ini</span>
                            </div>
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className="text-xs px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1.5"
                                title="Segarkan data realtime"
                            >
                                <Radio className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Memuat...' : 'Refresh'}
                            </button>
                        </div>
                        <div className="text-5xl font-black tracking-tight mb-2">
                            {data.active_visitors_count}
                        </div>
                        <p className="text-emerald-100 text-sm font-medium">
                            Pengunjung aktif di situs dalam 5 menit terakhir
                        </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/20 text-xs text-emerald-100 flex items-center justify-between">
                        <span>Pembaruan otomatis tiap 10 detik</span>
                        <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> First-Party Tracker
                        </span>
                    </div>
                </div>

                {/* Realtime 30-Minute Activity Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                Tayangan Halaman per Menit
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Aktivitas 30 menit terakhir di seluruh halaman publik
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-md">
                            Realtime
                        </span>
                    </div>

                    <div className="w-full h-[140px]">
                        <Chart
                            options={chartOptions}
                            series={series}
                            type="bar"
                            height={140}
                        />
                    </div>
                </div>
            </div>

            {/* Active Pages and Live Event Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Pages Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                Halaman Sedang Dibaca Pengunjung
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">30 Menit Terakhir</span>
                    </div>

                    {data.active_pages.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Belum ada aktivitas halaman dalam 30 menit terakhir.
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                                        <th className="pb-2.5 font-medium">Judul / Path Halaman</th>
                                        <th className="pb-2.5 font-medium text-right">Pembaca Aktif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {data.active_pages.map((page, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                            <td className="py-2.5 pr-2 max-w-[280px] truncate">
                                                <a
                                                    href={page.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-gray-800 dark:text-gray-200 hover:text-emerald-600 transition-colors truncate block"
                                                    title={page.title || page.path}
                                                >
                                                    {page.title || page.path}
                                                </a>
                                                <span className="text-[11px] text-gray-400 block truncate">
                                                    {page.path}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 font-semibold text-[11px]">
                                                    {page.active_readers} orang
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Live Activity Stream */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                Riwayat Peristiwa Terkini
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">12 Event Terakhir</span>
                    </div>

                    {data.recent_events.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Belum ada event tercatat.
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                            {data.recent_events.map((event) => {
                                const isPurchase = event.event_name === 'Purchase';
                                const isCheckout = event.event_name === 'InitiateCheckout';
                                const isView = event.event_name === 'ViewContent';

                                const badgeColor = isPurchase
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : isCheckout
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : isView
                                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                                    : 'bg-gray-100 text-gray-700 border-gray-200';

                                return (
                                    <div
                                        key={event.id}
                                        className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-gray-100/70"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <span className={`px-2 py-0.5 rounded-md font-semibold border text-[10px] uppercase ${badgeColor}`}>
                                                {event.event_name}
                                            </span>
                                            <div className="truncate">
                                                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {event.payload?.program_title || event.url || 'Aksi Pengunjung'}
                                                </div>
                                                {event.payload?.amount && (
                                                    <div className="text-[11px] text-emerald-600 font-semibold">
                                                        Rp {Number(event.payload.amount).toLocaleString('id-ID')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0 text-gray-400 text-[11px] flex items-center gap-1.5">
                                            {event.device === 'mobile' ? (
                                                <Smartphone className="w-3 h-3" />
                                            ) : (
                                                <Monitor className="w-3 h-3" />
                                            )}
                                            <span>{event.time_ago}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
