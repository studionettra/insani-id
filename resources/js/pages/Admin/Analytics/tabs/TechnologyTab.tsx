import React from 'react';
import Chart from 'react-apexcharts';
import { Smartphone, Monitor, Tablet, Globe2, Cpu, Compass } from 'lucide-react';
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
    const totalDevices = data.devices.mobile + data.devices.desktop + data.devices.tablet;

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device Distribution Donut */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Kategori Perangkat
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Perbandingan pengunjung dari HP, Komputer, dan Tablet
                    </p>

                    <div className="flex-1 flex items-center justify-center min-h-[220px]">
                        {totalDevices === 0 ? (
                            <div className="text-sm text-gray-400">Belum ada data perangkat.</div>
                        ) : (
                            <Chart
                                options={deviceChartOptions}
                                series={deviceChartSeries}
                                type="donut"
                                width="100%"
                                height={230}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                        <div>
                            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                <Smartphone className="w-3 h-3" /> HP
                            </div>
                            <div className="font-bold text-sm text-emerald-600 mt-0.5">
                                {data.devices.mobile}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                <Monitor className="w-3 h-3" /> Desktop
                            </div>
                            <div className="font-bold text-sm text-blue-600 mt-0.5">
                                {data.devices.desktop}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                <Tablet className="w-3 h-3" /> Tablet
                            </div>
                            <div className="font-bold text-sm text-amber-600 mt-0.5">
                                {data.devices.tablet}
                            </div>
                        </div>
                    </div>
                </div>

                {/* City & Geography Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Globe2 className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                Sebaran Wilayah / Kota Pengunjung
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">Deteksi IP & Jaringan</span>
                    </div>

                    {data.locations.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Data kota pengunjung belum tersedia atau sebagian besar dari jaringan lokal.
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                                        <th className="pb-2.5 font-medium">Kota / Daerah</th>
                                        <th className="pb-2.5 font-medium">Negara</th>
                                        <th className="pb-2.5 font-medium text-right">Pengunjung</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {data.locations.map((loc, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                            <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">
                                                {loc.city}
                                            </td>
                                            <td className="py-2.5 text-gray-500">
                                                {loc.country || 'Indonesia'}
                                            </td>
                                            <td className="py-2.5 text-right font-bold text-gray-700 dark:text-gray-300">
                                                <Badge variant="outline" className="text-[11px]">
                                                    {loc.count.toLocaleString('id-ID')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Operating Systems */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Cpu className="w-4 h-4 text-purple-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Sistem Operasi (OS)
                        </h3>
                    </div>

                    {data.operating_systems.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">Belum ada data OS.</div>
                    ) : (
                        <div className="space-y-3">
                            {data.operating_systems.map((os, idx) => {
                                const pct = Math.round((os.count / maxOs) * 100);
                                return (
                                    <div key={idx} className="space-y-1 text-xs">
                                        <div className="flex justify-between font-medium">
                                            <span className="text-gray-700 dark:text-gray-200">{os.name}</span>
                                            <span className="text-gray-500">{os.count} kunjungan</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-purple-500 h-full rounded-full transition-all duration-500"
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Compass className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Peramban Web (Browser)
                        </h3>
                    </div>

                    {data.browsers.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">Belum ada data browser.</div>
                    ) : (
                        <div className="space-y-3">
                            {data.browsers.map((b, idx) => {
                                const pct = Math.round((b.count / maxBrowser) * 100);
                                return (
                                    <div key={idx} className="space-y-1 text-xs">
                                        <div className="flex justify-between font-medium">
                                            <span className="text-gray-700 dark:text-gray-200">{b.name}</span>
                                            <span className="text-gray-500">{b.count} kunjungan</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-full rounded-full transition-all duration-500"
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
