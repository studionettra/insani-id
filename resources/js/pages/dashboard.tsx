import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import akun from '@/routes/akun';
import { Users, Wallet, Target, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { auth } = usePage().props as any;
    const isAdministrator = auth?.user?.roles?.some((role: any) => role.name === 'Administrator' || role === 'Administrator');
    const isCampaigner = auth?.user?.roles?.some((role: any) => role.name === 'Campaigner' || role === 'Campaigner');
    
    let createProgramUrl = '/campaigner/register';
    if (isAdministrator) {
        createProgramUrl = admin.programs.create().url;
    } else if (isCampaigner) {
        createProgramUrl = akun.programs.create().url;
    }

    return (
        <>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 lg:p-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Ringkasan Kampanye</h1>
                        <p className="text-sm text-gray-500 mt-1">Pantau performa program galang dana Anda hari ini.</p>
                    </div>
                    <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm h-10 px-4 rounded-lg hover:-translate-y-[1px] transition-transform">
                        <Link href={createProgramUrl}>Buat Kampanye Baru</Link>
                    </Button>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Metric 1 */}
                    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <Wallet className="h-4 w-4" />
                            <span className="text-sm font-medium">Total Donasi</span>
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">Rp 124.5M</div>
                        <div className="flex items-center text-sm font-medium text-brand-600">
                            <TrendingUp className="h-3.5 w-3.5 mr-1" />
                            +12% bulan ini
                        </div>
                    </div>
                    
                    {/* Metric 2 */}
                    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <Target className="h-4 w-4" />
                            <span className="text-sm font-medium">Kampanye Aktif</span>
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">24</div>
                        <div className="flex items-center text-sm text-gray-500">
                            4 hampir mencapai target
                        </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">Total Donatur</span>
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">1,432</div>
                        <div className="flex items-center text-sm font-medium text-brand-600">
                            <TrendingUp className="h-3.5 w-3.5 mr-1" />
                            +54 donatur baru
                        </div>
                    </div>

                    {/* Metric 4 */}
                    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm font-medium">Penyaluran</span>
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">Rp 89.2M</div>
                        <div className="flex items-center text-sm text-gray-500">
                            Ke 15 wilayah
                        </div>
                    </div>
                </div>
                
                {/* Main Content Split */}
                <div className="grid gap-6 lg:grid-cols-3 flex-1 mt-2">
                    {/* Active Campaigns */}
                    <div className="lg:col-span-2 flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Kampanye Sedang Berjalan</h2>
                            <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700 font-medium">
                                Lihat Semua
                            </Button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 font-medium whitespace-nowrap">Nama Program</th>
                                        <th className="px-5 py-3 font-medium whitespace-nowrap">Terkumpul</th>
                                        <th className="px-5 py-3 font-medium text-right whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { title: 'Bantuan Air Bersih Gunungkidul', amount: 'Rp 45.000.000', percent: 90, status: 'Aktif' },
                                        { title: 'Renovasi Masjid Al-Ikhlas', amount: 'Rp 12.500.000', percent: 25, status: 'Aktif' },
                                        { title: 'Beasiswa Anak Yatim Berprestasi', amount: 'Rp 8.000.000', percent: 40, status: 'Aktif' },
                                        { title: 'Sembako Lansia Dhuafa', amount: 'Rp 21.300.000', percent: 100, status: 'Selesai' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4 font-medium text-gray-900">{row.title}</td>
                                            <td className="px-5 py-4 min-w-[200px]">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-semibold text-gray-900">{row.amount}</span>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${row.percent === 100 ? 'bg-green-500' : 'bg-brand-500'}`} 
                                                            style={{ width: `${row.percent}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    row.status === 'Selesai' 
                                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                                    : 'bg-brand-50 text-brand-700 border border-brand-200'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Recent Activities */}
                    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Aktivitas Terkini</h2>
                        </div>
                        <div className="p-5 flex flex-col gap-6">
                            {[
                                { name: 'Hamba Allah', action: 'berdonasi Rp 500.000', time: '10 menit yang lalu' },
                                { name: 'Budi Santoso', action: 'berdonasi Rp 1.000.000', time: '25 menit yang lalu' },
                                { name: 'Siti Aminah', action: 'berdonasi Rp 150.000', time: '1 jam yang lalu' },
                                { name: 'PT Berkah Jaya', action: 'berdonasi Rp 5.000.000', time: '3 jam yang lalu' },
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-none mt-0.5">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <Heart className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-semibold">{activity.name}</span> {activity.action}
                                        </p>
                                        <span className="text-xs text-gray-500 mt-1">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 mt-auto">
                            <Button variant="ghost" className="w-full text-sm font-medium text-gray-600 hover:text-gray-900">
                                Lihat Semua Aktivitas
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard.url(),
        },
    ],
};
