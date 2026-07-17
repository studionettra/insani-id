import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, TrendingUp, RefreshCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
    stats: {
        totalDonations: number;
        totalDisbursements: number;
    };
}

export default function ReportIndex({ stats }: Props) {
    const [donationsDates, setDonationsDates] = useState({ start: '', end: '' });
    const [disbursementsDates, setDisbursementsDates] = useState({ start: '', end: '' });

    const handleExportDonations = () => {
        let url = route('admin.reports.donations.export');
        const params = new URLSearchParams();
        if (donationsDates.start) params.append('start_date', donationsDates.start);
        if (donationsDates.end) params.append('end_date', donationsDates.end);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        window.location.href = url;
    };

    const handleExportDisbursements = () => {
        let url = route('admin.reports.disbursements.export');
        const params = new URLSearchParams();
        if (disbursementsDates.start) params.append('start_date', disbursementsDates.start);
        if (disbursementsDates.end) params.append('end_date', disbursementsDates.end);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        window.location.href = url;
    };

    return (
        <>
            <Head title="Laporan & Ekspor" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Laporan & Ekspor Data</h1>
                        <p className="text-sm text-gray-500 mt-1">Unduh laporan transaksi dalam format CSV untuk diolah lebih lanjut.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden p-6 flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Donasi Diterima</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDonations)}</p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden p-6 flex items-center gap-5">
                        <div className="w-12 h-12 bg-blue-50 text-[#1A56DB] rounded-full flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Dana Dicairkan</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDisbursements)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                            <h3 className="font-semibold text-gray-900">Ekspor Laporan Donasi</h3>
                            <p className="text-xs text-gray-500 mt-1">Unduh data seluruh donasi yang berstatus lunas (Paid).</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-gray-700">Dari Tanggal</Label>
                                    <Input 
                                        type="date" 
                                        value={donationsDates.start} 
                                        onChange={(e) => setDonationsDates({...donationsDates, start: e.target.value})} 
                                        className="border-gray-200 focus-visible:ring-[#1A56DB] text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-gray-700">Sampai Tanggal</Label>
                                    <Input 
                                        type="date" 
                                        value={donationsDates.end} 
                                        onChange={(e) => setDonationsDates({...donationsDates, end: e.target.value})} 
                                        className="border-gray-200 focus-visible:ring-[#1A56DB] text-sm"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleExportDonations} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white mt-2">
                                <Download className="mr-2 h-4 w-4" /> Export ke CSV
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 py-4 px-6">
                            <h3 className="font-semibold text-gray-900">Ekspor Laporan Pencairan</h3>
                            <p className="text-xs text-gray-500 mt-1">Unduh data seluruh pengajuan pencairan dana program.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-gray-700">Dari Tanggal</Label>
                                    <Input 
                                        type="date" 
                                        value={disbursementsDates.start} 
                                        onChange={(e) => setDisbursementsDates({...disbursementsDates, start: e.target.value})} 
                                        className="border-gray-200 focus-visible:ring-[#1A56DB] text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-gray-700">Sampai Tanggal</Label>
                                    <Input 
                                        type="date" 
                                        value={disbursementsDates.end} 
                                        onChange={(e) => setDisbursementsDates({...disbursementsDates, end: e.target.value})} 
                                        className="border-gray-200 focus-visible:ring-[#1A56DB] text-sm"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleExportDisbursements} className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white mt-2">
                                <Download className="mr-2 h-4 w-4" /> Export ke CSV
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
        
    );
}

ReportIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan & Ekspor',
            href: '/admin/reports',
        },
    ],
};
