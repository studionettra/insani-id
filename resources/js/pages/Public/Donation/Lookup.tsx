import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Search, 
    Heart, 
    Calendar, 
    ArrowRight, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ShieldCheck, 
    Sparkles, 
    FileText,
    HelpCircle,
    UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PublicLayout from '@/layouts/PublicLayout';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DonationItem {
    id: number;
    donation_code: string;
    amount: number;
    unique_code?: number;
    channel: string;
    status: string;
    created_at: string;
    paid_at?: string;
    message?: string;
    is_anonymous: boolean;
    donor_email?: string;
    donor_name?: string;
    program?: {
        id: number;
        title: string | { id?: string };
        slug: string;
        cover_image: string;
        category?: {
            name: string | { id?: string };
        };
    };
    payments?: Array<{
        payment_method: string;
        gateway_status: string;
    }>;
}

interface Props {
    search?: string;
    donations?: {
        data: DonationItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
    } | null;
}

export default function DonationLookup({ search = '', donations }: Props) {
    const { auth } = usePage().props as any;
    const [query, setQuery] = useState(search || '');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        router.get(
            '/cek-donasi',
            { q: query.trim() },
            {
                preserveState: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    const getProgramTitle = (program: any) => {
        if (!program) return 'Program Kebaikan';
        const title = program.title;
        if (!title) return 'Program Kebaikan';
        if (typeof title === 'string') return title;
        if (typeof title === 'object' && title !== null) {
            if (typeof title.id === 'string' && title.id.trim() !== '') {
                return title.id;
            }
            const values = Object.values(title).filter(v => typeof v === 'string' && v.trim() !== '');
            if (values.length > 0) {
                return values[0] as string;
            }
        }
        return String(title || 'Program Kebaikan');
    };

    const getCategoryName = (category: any) => {
        if (!category) return 'Umum';
        const name = category.name;
        if (!name) return 'Umum';
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            if (typeof name.id === 'string' && name.id.trim() !== '') {
                return name.id;
            }
            const values = Object.values(name).filter(v => typeof v === 'string' && v.trim() !== '');
            if (values.length > 0) {
                return values[0] as string;
            }
        }
        return String(name || 'Umum');
    };

    return (
        <PublicLayout title="Cek Status & Riwayat Donasi">
            <Head title="Cek Status & Riwayat Donasi - Insani Indonesia" />

            <div className="bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white min-h-[calc(100vh-200px)] py-10 md:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    
                    {/* Logged in notification banner if already auth */}
                    {auth?.user && (
                        <div className="mb-6 p-4 rounded-2xl bg-white border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                                <UserCheck className="w-4 h-4 text-insani-blue shrink-0" />
                                <span>Anda saat ini login sebagai <strong>{auth.user.name}</strong> ({auth.user.email}).</span>
                            </div>
                            <Button asChild size="sm" className="bg-insani-blue hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shrink-0">
                                <Link href="/akun/donasi-saya">
                                    Buka Donasi Saya di Dashboard
                                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Hero Header & Search Box */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-insani-blue text-xs font-semibold mb-4">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Pengecekan Donasi Publik & Transparansi</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            Cek Status & Riwayat Donasi
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2.5 leading-relaxed">
                            Lacak bukti donasi, verifikasi pembayaran instan, dan unduh kuitansi resmi Anda tanpa perlu login.
                        </p>

                        {/* Search Input Form */}
                        <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-2xl shadow-md border border-slate-200/80 focus-within:border-insani-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <div className="flex-1 flex items-center px-3.5 gap-2.5">
                                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Masukkan alamat email donatur atau ID transaksi (DON-...)"
                                        className="w-full bg-transparent border-0 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 py-2.5"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={isSearching}
                                    className="bg-insani-blue hover:bg-blue-700 text-white font-semibold h-11 px-6 rounded-xl shadow-xs transition-all text-xs sm:text-sm shrink-0"
                                >
                                    {isSearching ? 'Memeriksa...' : 'Cari Donasi'}
                                </Button>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2.5 text-center">
                                Contoh: <code>ahmad@example.com</code> atau kode <code>DON-8X91LK20PW</code>
                            </p>
                        </form>
                    </div>

                    {/* Results Section */}
                    {donations ? (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                                    Hasil Pencarian untuk "{search}"
                                </h2>
                                <span className="text-xs text-slate-500 font-medium">
                                    {donations.total} Transaksi Ditemukan
                                </span>
                            </div>

                            {donations.data && donations.data.length > 0 ? (
                                <>
                                    <div className="space-y-4">
                                        {donations.data.map((donation) => {
                                            const programTitle = getProgramTitle(donation.program);
                                            const categoryName = getCategoryName(donation.program?.category);
                                            const totalAmount = Number(donation.amount) + Number(donation.unique_code || 0);

                                            return (
                                                <Card key={donation.id} className="overflow-hidden border border-slate-200/90 shadow-xs hover:border-blue-300 transition-colors">
                                                    <CardContent className="p-4 sm:p-5">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                                                                    {donation.donation_code}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {formatDate(donation.created_at)}
                                                                </span>
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div>
                                                                {donation.status === 'paid' && (
                                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        Berhasil Lunas
                                                                    </Badge>
                                                                )}
                                                                {donation.status === 'pending' && (
                                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 flex items-center gap-1">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        Menunggu Pembayaran
                                                                    </Badge>
                                                                )}
                                                                {['expired', 'failed'].includes(donation.status) && (
                                                                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 flex items-center gap-1">
                                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                                        {donation.status === 'expired' ? 'Kedaluwarsa' : 'Gagal'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="py-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                                            <div className="flex gap-3.5 items-start">
                                                                {donation.program?.cover_image ? (
                                                                    <img 
                                                                        src={donation.program.cover_image.startsWith('http') ? donation.program.cover_image : `/storage/${donation.program.cover_image}`} 
                                                                        alt={programTitle}
                                                                        className="w-20 h-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                                                                    />
                                                                ) : (
                                                                    <div className="w-20 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-insani-blue shrink-0">
                                                                        <Heart className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-[11px] font-semibold text-insani-blue bg-blue-50 px-2 py-0.5 rounded-full">
                                                                        {categoryName}
                                                                    </span>
                                                                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 hover:text-insani-blue transition-colors">
                                                                        <Link href={`/program/${donation.program?.slug || ''}`}>
                                                                            {programTitle}
                                                                        </Link>
                                                                    </h3>
                                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                                        Atas nama: <strong>{donation.is_anonymous ? 'Hamba Allah' : (donation.donor_name || 'Donatur')}</strong>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="w-full md:w-auto text-left md:text-right pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                                                <div className="text-xs text-slate-500">Total Tagihan</div>
                                                                <div className="text-base sm:text-lg font-extrabold text-slate-900">
                                                                    {formatCurrency(totalAmount)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                                                            <div className="text-slate-500">
                                                                Metode: <span className="font-semibold text-slate-700 uppercase">
                                                                    {donation.payments?.[0]?.payment_method || donation.channel}
                                                                </span>
                                                            </div>

                                                            <Button asChild size="sm" className="bg-insani-blue hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-8 px-4">
                                                                <Link href={`/donasi/status/${donation.donation_code}`}>
                                                                    Lihat Status & Kuitansi Lengkap
                                                                    <ArrowRight className="w-3 h-3 ml-1" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}

                                        {/* Pagination */}
                                        {donations.links && donations.links.length > 3 && (
                                            <div className="flex items-center justify-center gap-1.5 pt-4">
                                                {donations.links.map((link, i) => (
                                                    <Button
                                                        key={i}
                                                        asChild={Boolean(link.url)}
                                                        disabled={!link.url}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={`h-8 min-w-8 text-xs font-semibold rounded-lg ${
                                                            link.active 
                                                                ? 'bg-insani-blue text-white' 
                                                                : 'border-slate-200 text-slate-700'
                                                        }`}
                                                    >
                                                        {link.url ? (
                                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                                        ) : (
                                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Conversion Card for Guest Donors */}
                                    {!auth?.user && (
                                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-insani-blue text-white flex items-center justify-center shrink-0 shadow-sm">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-2 flex-1">
                                                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                                        Simpan Semua Riwayat Kebaikan Anda dalam Satu Tempat
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                        Daftar akun Insani sekarang menggunakan email Anda. Seluruh riwayat donasi terdahulu dan yang akan datang otomatis terhubung ke <strong>Dashboard Donatur</strong> Anda.
                                                    </p>
                                                    <div className="pt-2">
                                                        <Button asChild className="bg-insani-blue hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold h-11 px-5 shadow-xs">
                                                            <Link href={`/register?email=${encodeURIComponent(search.includes('@') ? search : '')}`}>
                                                                Daftar Akun Donatur Gratis
                                                                <ArrowRight className="w-4 h-4 ml-2" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Card className="p-10 text-center border-dashed border-2 border-slate-200">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 mb-1">
                                        Tidak Ditemukan Riwayat Donasi
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
                                        Tidak ada transaksi donasi yang cocok dengan kata kunci <strong>"{search}"</strong>. Pastikan alamat email atau kode donasi yang Anda masukkan sudah benar.
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <Button 
                                            onClick={() => setQuery('')} 
                                            variant="outline" 
                                            size="sm"
                                            className="rounded-xl text-xs"
                                        >
                                            Reset Pencarian
                                        </Button>
                                        <Button asChild size="sm" className="bg-insani-blue hover:bg-blue-700 text-white rounded-xl text-xs">
                                            <Link href="/program">
                                                Jelajah Program Kebaikan
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </div>
                    ) : (
                        /* Default Info Cards when no search query yet */
                        <div className="grid sm:grid-cols-3 gap-5 mt-10">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-insani-blue flex items-center justify-center mb-3">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Transparansi Terbuka</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Setiap rupiah donasi yang Anda salurkan tercatat secara transparan di sistem Insani Indonesia.
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">E-Kuitansi Sah</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Dapatkan bukti donasi digital resmi yang sah untuk arsip pribadi maupun pelaporan zakat.
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Bantuan Konfirmasi</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Punya kendala saat transfer donasi? Tim admin kami siap membantu verifikasi dan konfirmasi manual.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </PublicLayout>
    );
}
