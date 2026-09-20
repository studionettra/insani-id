import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Compass,
    Eye,
    Smartphone,
    Target,
    Calendar,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import RealtimeTab, { RealtimeData } from './tabs/RealtimeTab';
import AcquisitionTab, { AcquisitionData } from './tabs/AcquisitionTab';
import EngagementTab, { EngagementData } from './tabs/EngagementTab';
import TechnologyTab, { TechnologyData } from './tabs/TechnologyTab';
import MetaEventsTab, { MetaEventsData } from './tabs/MetaEventsTab';

interface Props {
    periodDays: number;
    realtime: RealtimeData;
    acquisition: AcquisitionData;
    engagement: EngagementData;
    technology: TechnologyData;
    metaEvents: MetaEventsData;
}

type TabType = 'realtime' | 'acquisition' | 'engagement' | 'technology' | 'meta';

export default function AnalyticsIndex({
    periodDays,
    realtime: initialRealtime,
    acquisition,
    engagement,
    technology,
    metaEvents,
}: Props) {
    const [activeTab, setActiveTab] = useState<TabType>('realtime');
    const [realtimeData, setRealtimeData] = useState<RealtimeData>(initialRealtime);
    const [isRefreshingRealtime, setIsRefreshingRealtime] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch latest realtime data via lightweight JSON endpoint
    const fetchRealtime = useCallback(async () => {
        try {
            setIsRefreshingRealtime(true);
            const res = await fetch('/admin/analytics/realtime');
            if (res.ok) {
                const json = await res.json();
                setRealtimeData(json);
            }
        } catch (err) {
            console.error('Failed to fetch realtime analytics:', err);
        } finally {
            setIsRefreshingRealtime(false);
        }
    }, []);

    // Periodic auto-refresh every 10 seconds when Realtime tab is active
    useEffect(() => {
        if (activeTab !== 'realtime' || !autoRefresh) {
            return;
        }

        const interval = setInterval(() => {
            fetchRealtime();
        }, 10000);

        return () => clearInterval(interval);
    }, [activeTab, autoRefresh, fetchRealtime]);

    const handlePeriodChange = (days: number) => {
        router.get(
            '/admin/analytics',
            { days },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
        {
            id: 'realtime',
            label: 'Realtime',
            icon: <Activity className="w-4 h-4 text-emerald-500" />,
            badge: 'Live',
        },
        {
            id: 'acquisition',
            label: 'Akuisisi Trafik',
            icon: <Compass className="w-4 h-4 text-indigo-500" />,
        },
        {
            id: 'engagement',
            label: 'Perilaku & Konten',
            icon: <Eye className="w-4 h-4 text-blue-500" />,
        },
        {
            id: 'technology',
            label: 'Teknologi & Wilayah',
            icon: <Smartphone className="w-4 h-4 text-purple-500" />,
        },
        {
            id: 'meta',
            label: 'Meta Events Manager',
            icon: <Target className="w-4 h-4 text-rose-500" />,
            badge: 'Pixel',
        },
    ];

    const periodOptions = [
        { label: 'Hari Ini', days: 1 },
        { label: '7 Hari', days: 7 },
        { label: '30 Hari', days: 30 },
        { label: '90 Hari', days: 90 },
    ];

    return (
        <>
            <Head title="Pusat Analitik & Trafik Web" />

            <div className="space-y-6 pb-12">
                {/* Header and Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                                <Activity className="w-5 h-5" />
                            </span>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Pusat Analitik & Trafik Web
                            </h1>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Laporan kinerja pengunjung first-party, konversi donasi, dan diagnostik Meta Pixel.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Period Picker */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl text-xs">
                            {periodOptions.map((opt) => (
                                <button
                                    key={opt.days}
                                    onClick={() => handlePeriodChange(opt.days)}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                        periodDays === opt.days
                                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm font-semibold'
                                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Realtime Auto-refresh toggle */}
                        {activeTab === 'realtime' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`text-xs h-8 ${
                                    autoRefresh
                                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50'
                                        : 'text-gray-500'
                                }`}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${autoRefresh ? 'animate-spin' : ''}`} />
                                {autoRefresh ? 'Auto-refresh Aktif' : 'Auto-refresh Mati'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation Navigation Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-700 custom-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all border ${
                                    isActive
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200/80 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        }`}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Display */}
                <div>
                    {activeTab === 'realtime' && (
                        <RealtimeTab
                            data={realtimeData}
                            onRefresh={fetchRealtime}
                            isRefreshing={isRefreshingRealtime}
                        />
                    )}

                    {activeTab === 'acquisition' && (
                        <AcquisitionTab data={acquisition} />
                    )}

                    {activeTab === 'engagement' && (
                        <EngagementTab data={engagement} />
                    )}

                    {activeTab === 'technology' && (
                        <TechnologyTab data={technology} />
                    )}

                    {activeTab === 'meta' && (
                        <MetaEventsTab data={metaEvents} />
                    )}
                </div>
            </div>
        </>
    );
}

AnalyticsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Analitik Web',
            href: '/admin/analytics',
        },
    ],
};
