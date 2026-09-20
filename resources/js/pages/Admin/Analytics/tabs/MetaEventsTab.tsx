import React, { useState } from 'react';
import { Target, CheckCircle, AlertCircle, Code, Eye, ExternalLink, ShieldCheck, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface MetaEventItem {
    id: number;
    session_id: string;
    event_name: string;
    url: string;
    meta_status: string;
    ga4_status: string;
    payload: any;
    created_at: string;
    time_ago: string;
}

export interface MetaEventsData {
    config: {
        meta_pixel_id: string | null;
        google_analytics_id: string | null;
        google_tag_manager_id: string | null;
        tiktok_pixel_id: string | null;
        has_pixel_configured: boolean;
    };
    summary_counts: {
        PageView: number;
        ViewContent: number;
        InitiateCheckout: number;
        Purchase: number;
        Share: number;
        total: number;
    };
    recent_events: MetaEventItem[];
}

interface Props {
    data: MetaEventsData;
}

export default function MetaEventsTab({ data }: Props) {
    const [selectedEvent, setSelectedEvent] = useState<MetaEventItem | null>(null);

    const eventStats = [
        {
            name: 'Purchase',
            count: data.summary_counts.Purchase || 0,
            desc: 'Donasi Berhasil (Lunas)',
            badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        },
        {
            name: 'InitiateCheckout',
            count: data.summary_counts.InitiateCheckout || 0,
            desc: 'Membuka Form Pembayaran',
            badge: 'bg-blue-100 text-blue-800 border-blue-300',
        },
        {
            name: 'ViewContent',
            count: data.summary_counts.ViewContent || 0,
            desc: 'Melihat Detail Program',
            badge: 'bg-purple-100 text-purple-800 border-purple-300',
        },
        {
            name: 'Share',
            count: data.summary_counts.Share || 0,
            desc: 'Klik Bagikan ke Medsos',
            badge: 'bg-amber-100 text-amber-800 border-amber-300',
        },
        {
            name: 'PageView',
            count: data.summary_counts.PageView || 0,
            desc: 'Semua Kunjungan Halaman',
            badge: 'bg-gray-100 text-gray-800 border-gray-300',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Pixel Status Banner */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                Diagnostik & Event Stream Meta Pixel
                            </h3>
                            {data.config.meta_pixel_id ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1 text-[11px]">
                                    <CheckCircle className="w-3 h-3" /> Aktif
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-[11px]">
                                    ID Belum Diatur
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Memantau kesehatan pengiriman sinyal konversi ke Facebook Ads, Instagram Ads, dan Google Analytics.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-400 block text-[10px]">Meta Pixel ID</span>
                        <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                            {data.config.meta_pixel_id || 'Tidak Terpasang'}
                        </span>
                    </div>
                    <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-400 block text-[10px]">Google Analytics ID</span>
                        <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                            {data.config.google_analytics_id || 'Tidak Terpasang'}
                        </span>
                    </div>
                    <a
                        href="/admin/site-settings"
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <span>Atur ID Pixel</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* Event Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {eventStats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <span className={`px-2 py-0.5 rounded-md font-semibold border text-[10px] uppercase ${stat.badge}`}>
                                {stat.name}
                            </span>
                            <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                                {stat.count.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                            {stat.desc}
                        </span>
                    </div>
                ))}
            </div>

            {/* Live Event Stream Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Log Peristiwa Terkini (Event Activity Log)
                        </h3>
                    </div>
                    <span className="text-xs text-gray-400">50 Peristiwa Terbaru</span>
                </div>

                {data.recent_events.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        Belum ada event tercatat dalam log diagnostik.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                                    <th className="pb-2.5 font-medium">Waktu</th>
                                    <th className="pb-2.5 font-medium">Peristiwa (Event)</th>
                                    <th className="pb-2.5 font-medium">Halaman / URL</th>
                                    <th className="pb-2.5 font-medium">Parameter Kunci</th>
                                    <th className="pb-2.5 font-medium">Status Meta</th>
                                    <th className="pb-2.5 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {data.recent_events.map((evt) => {
                                    const isPurchase = evt.event_name === 'Purchase';
                                    const isCheckout = evt.event_name === 'InitiateCheckout';
                                    const isView = evt.event_name === 'ViewContent';

                                    const badgeColor = isPurchase
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : isCheckout
                                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                                        : isView
                                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                                        : 'bg-gray-100 text-gray-700 border-gray-200';

                                    return (
                                        <tr key={evt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                            <td className="py-2.5 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                                                {evt.time_ago}
                                            </td>
                                            <td className="py-2.5 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-md font-semibold border text-[10px] uppercase ${badgeColor}`}>
                                                    {evt.event_name}
                                                </span>
                                            </td>
                                            <td className="py-2.5 max-w-[220px] truncate text-gray-700 dark:text-gray-300 font-mono text-[11px]">
                                                {evt.url}
                                            </td>
                                            <td className="py-2.5 max-w-[240px] truncate text-gray-600 dark:text-gray-400">
                                                {evt.payload?.amount && (
                                                    <span className="font-semibold text-emerald-600 mr-2">
                                                        Rp {Number(evt.payload.amount).toLocaleString('id-ID')}
                                                    </span>
                                                )}
                                                {evt.payload?.program_title && (
                                                    <span className="truncate">
                                                        {evt.payload.program_title}
                                                    </span>
                                                )}
                                                {!evt.payload && '-'}
                                            </td>
                                            <td className="py-2.5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                    <CheckCircle className="w-3 h-3" /> Dispatched
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-right whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedEvent(evt)}
                                                    className="h-7 text-xs px-2.5 border-gray-200"
                                                >
                                                    <Code className="w-3.5 h-3.5 mr-1" /> Payload
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for JSON Payload Inspection */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Code className="w-4 h-4 text-blue-600" />
                            Detail Parameter Payload: {selectedEvent?.event_name}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Format payload data yang dikirimkan ke Meta Pixel & Google Analytics
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="text-gray-400 text-[10px] block">Event Name</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {selectedEvent.event_name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-[10px] block">Waktu Terjadi</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {selectedEvent.created_at}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-400 text-[10px] block">URL Halaman</span>
                                    <span className="font-mono text-gray-700 dark:text-gray-300 break-all text-[11px]">
                                        {selectedEvent.url}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                                    Raw JSON Payload:
                                </span>
                                <pre className="p-3 bg-gray-950 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto custom-scrollbar max-h-60">
                                    {JSON.stringify(selectedEvent.payload, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
