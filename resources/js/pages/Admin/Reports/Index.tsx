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
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Laporan & Ekspor Data</h1>
                <p className="text-muted-foreground">Unduh laporan transaksi dalam format CSV untuk diolah lebih lanjut.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Donasi Diterima</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalDonations)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Dana Dicairkan</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalDisbursements)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Ekspor Laporan Donasi</CardTitle>
                        <CardDescription>Unduh data seluruh donasi yang berstatus lunas (Paid).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dari Tanggal</Label>
                                <Input 
                                    type="date" 
                                    value={donationsDates.start} 
                                    onChange={(e) => setDonationsDates({...donationsDates, start: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sampai Tanggal</Label>
                                <Input 
                                    type="date" 
                                    value={donationsDates.end} 
                                    onChange={(e) => setDonationsDates({...donationsDates, end: e.target.value})} 
                                />
                            </div>
                        </div>
                        <Button onClick={handleExportDonations} className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Export ke CSV
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ekspor Laporan Pencairan</CardTitle>
                        <CardDescription>Unduh data seluruh pengajuan pencairan dana program.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dari Tanggal</Label>
                                <Input 
                                    type="date" 
                                    value={disbursementsDates.start} 
                                    onChange={(e) => setDisbursementsDates({...disbursementsDates, start: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sampai Tanggal</Label>
                                <Input 
                                    type="date" 
                                    value={disbursementsDates.end} 
                                    onChange={(e) => setDisbursementsDates({...disbursementsDates, end: e.target.value})} 
                                />
                            </div>
                        </div>
                        <Button onClick={handleExportDisbursements} className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Export ke CSV
                        </Button>
                    </CardContent>
                </Card>
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
