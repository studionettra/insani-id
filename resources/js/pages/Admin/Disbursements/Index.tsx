import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Index({ disbursements, filters }: any) {
    const handleTabChange = (value: string) => {
        router.get(route('admin.disbursements.index'), { status: value }, { preserveState: true });
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

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Penyaluran Dana (Disbursement)</h2>
                    <p className="text-muted-foreground">Kelola permohonan pencairan dana dari campaigner.</p>
                </div>
            </div>

            <Tabs defaultValue={filters.status || 'pending'} onValueChange={handleTabChange} className="mb-6">
                <TabsList>
                    <TabsTrigger value="pending">Menunggu</TabsTrigger>
                    <TabsTrigger value="approved">Disetujui (Siap Transfer)</TabsTrigger>
                    <TabsTrigger value="transferred">Ditransfer</TabsTrigger>
                    <TabsTrigger value="rejected">Ditolak</TabsTrigger>
                    <TabsTrigger value="all">Semua</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Tgl Pengajuan</th>
                                <th className="px-6 py-4">Program</th>
                                <th className="px-6 py-4">Nominal Pengajuan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disbursements.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data pencairan dana
                                    </td>
                                </tr>
                            ) : (
                                disbursements.data.map((item: any) => (
                                    <tr key={item.id} className="border-b hover:bg-slate-50">
                                        <td className="px-6 py-4">{formatDate(item.created_at)}</td>
                                        <td className="px-6 py-4 font-medium">{item.program?.title}</td>
                                        <td className="px-6 py-4">{formatRupiah(item.requested_amount)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                        <td className="px-6 py-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('admin.disbursements.show', item.id)}>
                                                    <Eye className="w-4 h-4 mr-1" /> Detail
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {disbursements.last_page > 1 && (
                <div className="mt-4 flex justify-end">
                    <div className="flex gap-1">
                        {disbursements.links.map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-3 py-1 rounded border ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground hover:bg-muted'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        
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
