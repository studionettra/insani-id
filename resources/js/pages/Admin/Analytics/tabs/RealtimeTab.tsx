import React from 'react';
import LazyChart from '@/components/ui/lazy-chart';
import {
    Activity,
    Eye,
    Radio,
    ShieldCheck,
    Smartphone,
    Monitor,
} from 'lucide-react';
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white shadow-md">
                    <div className="pointer-events-none absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
                                </span>
                                <span className="text-xs font-semibold tracking-wider text-emerald-100 uppercase">
                                    Live Saat Ini
                                </span>
                            </div>
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-1 text-xs transition-colors hover:bg-white/30"
                                title="Segarkan data realtime"
                            >
                                <Radio
                                    className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                {isRefreshing ? 'Memuat...' : 'Refresh'}
                            </button>
                        </div>
                        <div className="mb-2 text-5xl font-black tracking-tight">
                            {data.active_visitors_count}
                        </div>
                        <p className="text-sm font-medium text-emerald-100">
                            Pengunjung aktif di situs dalam 5 menit terakhir
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-xs text-emerald-100">
                        <span>Pembaruan otomatis tiap 10 detik</span>
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" /> First-Party
                            Tracker
                        </span>
                    </div>
                </div>

                {/* Realtime 30-Minute Activity Chart */}
                <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Tayangan Halaman per Menit
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Aktivitas 30 menit terakhir di seluruh halaman
                                publik
                            </p>
                        </div>
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Realtime
                        </span>
                    </div>

                    <div className="h-[140px] w-full">
                        <LazyChart
                            options={chartOptions}
                            series={series}
                            type="bar"
                            height={140}
                        />
                    </div>
                </div>
            </div>

            {/* Active Pages and Live Event Stream */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Active Pages Table */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-emerald-600" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Halaman Sedang Dibaca Pengunjung
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                            30 Menit Terakhir
                        </span>
                    </div>

                    {data.active_pages.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">
                            Belum ada aktivitas halaman dalam 30 menit terakhir.
                        </div>
                    ) : (
                        <div className="custom-scrollbar overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-gray-700">
                                        <th className="pb-2.5 font-medium">
                                            Judul / Path Halaman
                                        </th>
                                        <th className="pb-2.5 text-right font-medium">
                                            Pembaca Aktif
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {data.active_pages.map((page, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                                        >
                                            <td className="max-w-[280px] truncate py-2.5 pr-2">
                                                <a
                                                    href={page.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block truncate font-medium text-gray-800 transition-colors hover:text-emerald-600 dark:text-gray-200"
                                                    title={
                                                        page.title || page.path
                                                    }
                                                >
                                                    {page.title || page.path}
                                                </a>
                                                <span className="block truncate text-[11px] text-gray-400">
                                                    {page.path}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                >
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
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Riwayat Peristiwa Terkini
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                            12 Event Terakhir
                        </span>
                    </div>

                    {data.recent_events.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">
                            Belum ada event tercatat.
                        </div>
                    ) : (
                        <div className="custom-scrollbar max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
                            {data.recent_events.map((event) => {
                                const isPurchase =
                                    event.event_name === 'Purchase';
                                const isCheckout =
                                    event.event_name === 'InitiateCheckout';
                                const isView =
                                    event.event_name === 'ViewContent';

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
                                        className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs transition-colors hover:bg-gray-100/70 dark:bg-gray-700/40"
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5 pr-2">
                                            <span
                                                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeColor}`}
                                            >
                                                {event.event_name}
                                            </span>
                                            <div className="truncate">
                                                <div className="truncate font-medium text-gray-800 dark:text-gray-200">
                                                    {event.payload
                                                        ?.program_title ||
                                                        event.url ||
                                                        'Aksi Pengunjung'}
                                                </div>
                                                {event.payload?.amount && (
                                                    <div className="text-[11px] font-semibold text-emerald-600">
                                                        Rp{' '}
                                                        {Number(
                                                            event.payload
                                                                .amount,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-shrink-0 items-center gap-1.5 text-right text-[11px] text-gray-400">
                                            {event.device === 'mobile' ? (
                                                <Smartphone className="h-3 w-3" />
                                            ) : (
                                                <Monitor className="h-3 w-3" />
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
