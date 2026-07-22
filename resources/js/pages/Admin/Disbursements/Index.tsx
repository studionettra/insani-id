import { Head, Link, router } from '@inertiajs/react';
import { Eye, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRupiah, formatDate } from '@/lib/utils';
import admin from '@/routes/admin';

export default function Index({ disbursements, filters }: any) {
    const handleTabChange = (value: string) => {
        router.get(admin.disbursements.index().url, { status: value }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Menunggu</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="w-3 h-3 mr-1"/> Disetujui</Badge>;
            case 'transferred':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Download className="w-3 h-3 mr-1"/> Ditransfer</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1"/> Ditolak</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Kelola Penyaluran Dana" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Penyaluran Dana (Disbursement)</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola permohonan pencairan dana dari campaigner.</p>
                    </div>
                </div>

                <Tabs defaultValue={filters.status || 'pending'} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-gray-100 border border-gray-200">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Menunggu</TabsTrigger>
                        <TabsTrigger value="approved" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Disetujui (Siap Transfer)</TabsTrigger>
                        <TabsTrigger value="transferred" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Ditransfer</TabsTrigger>
                        <TabsTrigger value="rejected" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Ditolak</TabsTrigger>
                        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Semua</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Tgl Pengajuan</th>
                                    <th className="px-6 py-4 font-medium">Program</th>
                                    <th className="px-6 py-4 font-medium">Nominal Pengajuan</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disbursements.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm border-b border-gray-100">
                                            Tidak ada data pencairan dana
                                        </td>
                                    </tr>
                                ) : (
                                    disbursements.data.map((item: any) => (
                                        <tr key={item.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-gray-600">{formatDate(item.created_at)}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.program?.title}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{formatRupiah(item.requested_amount)}</td>
                                            <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <Button variant="outline" size="sm" asChild className="border-gray-200 text-gray-600 hover:bg-gray-50 h-8 shadow-none">
                                                        <Link href={admin.disbursements.show(item.id).url}>
                                                            <Eye className="w-4 h-4 mr-1.5" /> Detail
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {disbursements.last_page > 1 && (
                    <div className="flex justify-end">
                        <div className="flex gap-1">
                            {disbursements.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 text-sm rounded-md border ${link.active ? 'bg-[#1A56DB] text-white border-[#1A56DB]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
        </>
        
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Penyaluran Dana',
            href: '/admin/disbursements',
        },
    ],
};
