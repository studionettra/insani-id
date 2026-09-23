import { Head } from '@inertiajs/react';
import { Download, TrendingUp, RefreshCcw, BarChart3, FileSpreadsheet } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface AttributionRow {
    source: string;
    medium: string;
    campaign: string;
    transactions_count: number;
    total_amount: number;
    average_amount: number;
    max_amount: number;
}

interface Props {
    stats: {
        totalDonations: number;
        totalDisbursements: number;
    };
    channelAttributions?: AttributionRow[];
}

export default function ReportIndex({ stats, channelAttributions = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'attribution' | 'export'>('attribution');
    const [donationsDates, setDonationsDates] = useState({ start: '', end: '' });
    const [disbursementsDates, setDisbursementsDates] = useState({ start: '', end: '' });

    const handleExportDonations = () => {
        let url = '/admin/reports/donations/export';
        const params = new URLSearchParams();

        if (donationsDates.start) {
            params.append('start_date', donationsDates.start);
        }

        if (donationsDates.end) {
            params.append('end_date', donationsDates.end);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        window.location.href = url;
    };

    const handleExportDisbursements = () => {
        let url = '/admin/reports/disbursements/export';
        const params = new URLSearchParams();

        if (disbursementsDates.start) {
            params.append('start_date', disbursementsDates.start);
        }

        if (disbursementsDates.end) {
            params.append('end_date', disbursementsDates.end);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        window.location.href = url;
    };

    const getSourceBadge = (source: string) => {
        const lower = source.toLowerCase();

        if (lower.includes('whatsapp')) {
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">WhatsApp</Badge>;
        }

        if (lower.includes('facebook') || lower.includes('fb')) {
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Facebook</Badge>;
        }

        if (lower.includes('instagram') || lower.includes('ig')) {
            return <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">Instagram</Badge>;
        }

        if (lower.includes('telegram')) {
            return <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">Telegram</Badge>;
        }

        if (lower.includes('twitter') || lower.includes('x')) {
            return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300">X (Twitter)</Badge>;
        }

        if (lower.includes('google')) {
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Google</Badge>;
        }

        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{source}</Badge>;
    };

    return (
        <>
            <Head title="Laporan & Analitik" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Laporan & Analitik Performa</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pantau efektivitas kanal pemasaran, atribusi kampanye donasi, dan ekspor data CSV.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setActiveTab('attribution')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                                activeTab === 'attribution'
                                    ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Atribusi Kanal Pemasaran
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('export')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                                activeTab === 'export'
                                    ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Ekspor Data CSV
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden p-6 flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Donasi Diterima</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalDonations)}</p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden p-6 flex items-center gap-5">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-[#1A56DB] dark:text-blue-400 rounded-full flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Dana Dicairkan</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalDisbursements)}</p>
                        </div>
                    </div>
                </div>

                {activeTab === 'attribution' && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Performa Kanal & Kampanye Pemasaran (UTM)</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Laporan perolehan transaksi donasi berdasarkan kanal asal pengunjung
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1A56DB] dark:bg-blue-950/40 dark:text-blue-400 w-fit">
                                {channelAttributions.length} Kombinasi Kampanye
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 text-xs">
                                        <TableHead className="font-semibold">Kanal</TableHead>
                                        <TableHead className="font-semibold">Media</TableHead>
                                        <TableHead className="font-semibold">Nama Kampanye</TableHead>
                                        <TableHead className="font-semibold text-right">Donasi Sukses</TableHead>
                                        <TableHead className="font-semibold text-right">Total Perolehan</TableHead>
                                        <TableHead className="font-semibold text-right">Rata-rata Donasi</TableHead>
                                        <TableHead className="font-semibold text-right">Tertinggi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {channelAttributions.length > 0 ? (
                                        channelAttributions.map((row, index) => (
                                            <TableRow key={`${row.source}-${row.medium}-${row.campaign}-${index}`} className="text-xs">
                                                <TableCell className="font-medium">
                                                    {getSourceBadge(row.source)}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {row.medium}
                                                </TableCell>
                                                <TableCell className="text-gray-800 dark:text-gray-200 font-medium">
                                                    {row.campaign}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {row.transactions_count.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-[#1A56DB] dark:text-blue-400">
                                                    {formatCurrency(row.total_amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-600 dark:text-gray-300">
                                                    {formatCurrency(row.average_amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-600 dark:text-gray-300">
                                                    {formatCurrency(row.max_amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-xs">
                                                Belum ada data atribusi kampanye yang tercatat.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {activeTab === 'export' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Ekspor Laporan Donasi</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unduh data seluruh donasi yang berstatus lunas lengkap dengan parameter UTM.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dari Tanggal</Label>
                                        <Input 
                                            type="date" 
                                            value={donationsDates.start} 
                                            onChange={(e) => setDonationsDates({...donationsDates, start: e.target.value})} 
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sampai Tanggal</Label>
                                        <Input 
                                            type="date" 
                                            value={donationsDates.end} 
                                            onChange={(e) => setDonationsDates({...donationsDates, end: e.target.value})} 
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] text-sm"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleExportDonations} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white mt-2">
                                    <Download className="mr-2 h-4 w-4" /> Export ke CSV
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Ekspor Laporan Pencairan</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unduh data seluruh pengajuan pencairan dana program.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dari Tanggal</Label>
                                        <Input 
                                            type="date" 
                                            value={disbursementsDates.start} 
                                            onChange={(e) => setDisbursementsDates({...disbursementsDates, start: e.target.value})} 
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sampai Tanggal</Label>
                                        <Input 
                                            type="date" 
                                            value={disbursementsDates.end} 
                                            onChange={(e) => setDisbursementsDates({...disbursementsDates, end: e.target.value})} 
                                            className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-[#1A56DB] text-sm"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleExportDisbursements} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white mt-2">
                                    <Download className="mr-2 h-4 w-4" /> Export ke CSV
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
        </>
    );
}

ReportIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan & Analitik',
            href: '/admin/reports',
        },
    ],
};
