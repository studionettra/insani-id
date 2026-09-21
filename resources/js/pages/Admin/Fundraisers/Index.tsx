import { Head, Link, router } from '@inertiajs/react';
import { Search, Sparkles, Users, Heart, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, getLocalizedValue } from '@/lib/utils';

export default function AdminFundraisersIndex({ fundraisers, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/fundraisers',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <>
            <Head title="Manajemen Fundraiser" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Manajemen Fundraiser</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pantau seluruh relawan penggalang program dan pencapaian donasi yang berhasil dihimpun.
                        </p>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                                    Total Fundraiser
                                </span>
                                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    {stats.totalFundraisers} <span className="text-sm font-normal text-slate-500">relawan</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Sparkles className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                                    Total Dihimpun Relawan
                                </span>
                                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {formatCurrency(stats.totalCollected)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Heart className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                                    Total Donatur Diajak
                                </span>
                                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                                    {stats.totalDonors} <span className="text-sm font-normal text-slate-500">donatur</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search */}
                <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari berdasarkan nama relawan, email, kode referral, atau nama program..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                />
                            </div>
                            <Button type="submit" variant="default" className="bg-[#1A56DB] hover:bg-blue-700 text-white">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50">
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase">Relawan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase">Kode Referral</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase">Program Didukung</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase">Terkumpul</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase">Donatur</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase">Status</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 uppercase">Terdaftar</TableCell>
                                <TableCell className="text-right font-semibold text-xs text-gray-500 uppercase">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fundraisers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                        Tidak ada data fundraiser yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fundraisers.data.map((f: any) => (
                                    <TableRow key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {f.user?.name || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {f.user?.email || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs bg-slate-50 dark:bg-gray-800">
                                                {f.referral_code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            <span className="font-medium text-slate-800 dark:text-gray-200">
                                                {f.program ? getLocalizedValue(f.program.title, 'id') : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(f.collected_amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-800 dark:text-gray-200">
                                                {f.donors_count} orang
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={f.is_active ? 'default' : 'outline'} className={f.is_active ? 'bg-emerald-600' : ''}>
                                                {f.is_active ? 'Aktif' : 'Non-aktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {formatDate(f.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {f.program && (
                                                <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <Link href={`/program/${f.program.slug}`} title="Lihat Program">
                                                        <ExternalLink className="h-4 w-4 text-slate-500" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {fundraisers.links && fundraisers.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-1">
                            {fundraisers.links.map((link: any, idx: number) => (
                                <Button
                                    key={idx}
                                    asChild
                                    size="sm"
                                    variant={link.active ? 'default' : 'outline'}
                                    disabled={!link.url}
                                    className={`h-8 text-xs ${link.active ? 'bg-[#1A56DB] text-white' : ''}`}
                                >
                                    <Link
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
