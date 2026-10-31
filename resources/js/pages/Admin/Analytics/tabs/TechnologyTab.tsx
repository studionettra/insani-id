import React from 'react';
import LazyChart from '@/components/ui/lazy-chart';
import {
    Smartphone,
    Monitor,
    Tablet,
    Globe2,
    Cpu,
    Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ItemCount {
    name: string;
    count: number;
}

interface LocationItem {
    city: string;
    country: string;
    count: number;
}

export interface TechnologyData {
    devices: {
        mobile: number;
        desktop: number;
        tablet: number;
    };
    browsers: ItemCount[];
    operating_systems: ItemCount[];
    locations: LocationItem[];
}

interface Props {
    data: TechnologyData;
}

export default function TechnologyTab({ data }: Props) {
    const totalDevices =
        data.devices.mobile + data.devices.desktop + data.devices.tablet;

    const deviceChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            toolbar: { show: false },
        },
        labels: ['Mobile (HP)', 'Desktop (PC/Laptop)', 'Tablet'],
        colors: ['#10B981', '#3B82F6', '#F59E0B'],
        legend: {
            position: 'bottom',
            labels: { colors: '#6B7280' },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
        },
        stroke: { width: 0 },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} Pengunjung`,
            },
        },
    };

    const deviceChartSeries = [
        data.devices.mobile,
        data.devices.desktop,
        data.devices.tablet,
    ];

    const maxOs = Math.max(...data.operating_systems.map((o) => o.count), 1);
    const maxBrowser = Math.max(...data.browsers.map((b) => b.count), 1);

    return (
        <div className="space-y-6">
            {/* Device breakdown & Geo Location */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Device Distribution Donut */}
                <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-1 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Kategori Perangkat
                        </h3>
                    </div>
                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                        Perbandingan pengunjung dari HP, Komputer, dan Tablet
                    </p>

                    <div className="flex min-h-[220px] flex-1 items-center justify-center">
                        {totalDevices === 0 ? (
                            <div className="text-sm text-gray-400">
                                Belum ada data perangkat.
                            </div>
                        ) : (
                            <LazyChart
                                options={deviceChartOptions}
                                series={deviceChartSeries}
                                type="donut"
                                width="100%"
                                height={230}
                            />
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center dark:border-gray-700">
                        <div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                <Smartphone className="h-3 w-3" /> HP
                            </div>
                            <div className="mt-0.5 text-sm font-bold text-emerald-600">
                                {data.devices.mobile}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                <Monitor className="h-3 w-3" /> Desktop
                            </div>
                            <div className="mt-0.5 text-sm font-bold text-blue-600">
                                {data.devices.desktop}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                <Tablet className="h-3 w-3" /> Tablet
                            </div>
                            <div className="mt-0.5 text-sm font-bold text-amber-600">
                                {data.devices.tablet}
                            </div>
                        </div>
                    </div>
                </div>

                {/* City & Geography Table */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Globe2 className="h-4 w-4 text-blue-600" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Sebaran Wilayah / Kota Pengunjung
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                            Deteksi IP & Jaringan
                        </span>
                    </div>

                    {data.locations.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">
                            Data kota pengunjung belum tersedia atau sebagian
                            besar dari jaringan lokal.
                        </div>
                    ) : (
                        <div className="custom-scrollbar overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-gray-700">
                                        <th className="pb-2.5 font-medium">
                                            Kota / Daerah
                                        </th>
                                        <th className="pb-2.5 font-medium">
                                            Negara
                                        </th>
                                        <th className="pb-2.5 text-right font-medium">
                                            Pengunjung
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {data.locations.map((loc, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                                        >
                                            <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">
                                                {loc.city}
                                            </td>
                                            <td className="py-2.5 text-gray-500">
                                                {loc.country || 'Indonesia'}
                                            </td>
                                            <td className="py-2.5 text-right font-bold text-gray-700 dark:text-gray-300">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[11px]"
                                                >
                                                    {loc.count.toLocaleString(
                                                        'id-ID',
                                                    )}
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

            {/* OS and Browser breakdown */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Operating Systems */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-purple-600" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Sistem Operasi (OS)
                        </h3>
                    </div>

                    {data.operating_systems.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-400">
                            Belum ada data OS.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.operating_systems.map((os, idx) => {
                                const pct = Math.round(
                                    (os.count / maxOs) * 100,
                                );
                                return (
                                    <div
                                        key={idx}
                                        className="space-y-1 text-xs"
                                    >
                                        <div className="flex justify-between font-medium">
                                            <span className="text-gray-700 dark:text-gray-200">
                                                {os.name}
                                            </span>
                                            <span className="text-gray-500">
                                                {os.count} kunjungan
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                            <div
                                                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Browsers */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center gap-2">
                        <Compass className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Peramban Web (Browser)
                        </h3>
                    </div>

                    {data.browsers.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-400">
                            Belum ada data browser.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.browsers.map((b, idx) => {
                                const pct = Math.round(
                                    (b.count / maxBrowser) * 100,
                                );
                                return (
                                    <div
                                        key={idx}
                                        className="space-y-1 text-xs"
                                    >
                                        <div className="flex justify-between font-medium">
                                            <span className="text-gray-700 dark:text-gray-200">
                                                {b.name}
                                            </span>
                                            <span className="text-gray-500">
                                                {b.count} kunjungan
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                            <div
                                                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
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
