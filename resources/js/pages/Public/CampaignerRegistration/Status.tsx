import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function Status({ profile }: any) {
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock className="w-16 h-16 text-yellow-500 mb-4" />,
                    title: 'Sedang Ditinjau',
                    description: 'Dokumen Anda sedang dalam antrean untuk ditinjau oleh tim verifikator kami. Proses ini biasanya memakan waktu 1-2 hari kerja.',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50 border-yellow-200'
                };
            case 'verified':
                return {
                    icon: <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />,
                    title: 'Terverifikasi',
                    description: 'Selamat! Akun Anda telah terverifikasi sebagai Campaigner. Anda sekarang dapat mulai membuat program penggalangan dana.',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 border-green-200'
                };
            case 'rejected':
                return {
                    icon: <XCircle className="w-16 h-16 text-red-500 mb-4" />,
                    title: 'Verifikasi Ditolak',
                    description: 'Maaf, pengajuan Anda tidak dapat disetujui saat ini. Silakan periksa catatan dari tim kami.',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50 border-red-200'
                };
            case 'suspended':
                return {
                    icon: <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />,
                    title: 'Akun Dibekukan',
                    description: 'Akun Campaigner Anda saat ini dibekukan. Silakan hubungi layanan pelanggan untuk informasi lebih lanjut.',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50 border-orange-200'
                };
            default:
                return {
                    icon: <AlertCircle className="w-16 h-16 text-gray-500 mb-4" />,
                    title: 'Status Tidak Diketahui',
                    description: 'Terjadi kesalahan sistem.',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 border-gray-200'
                };
        }
    };

    const statusInfo = getStatusInfo(profile.verification_status);

    return (
        <>
            <Head title="Status Verifikasi Campaigner" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full min-h-[70vh] items-center justify-center">
                <Card className={`w-full text-center border ${statusInfo.bgColor}`}>
                    <CardHeader className="flex flex-col items-center">
                        {statusInfo.icon}
                        <CardTitle className={`text-2xl ${statusInfo.color}`}>{statusInfo.title}</CardTitle>
                        <CardDescription className="text-base mt-2 text-gray-700">
                            {statusInfo.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Jika ditolak dan ada catatan khusus */}
                        {profile.verification_status === 'rejected' && profile.documents.some((d: any) => d.notes) && (
                            <div className="bg-white p-4 rounded-md text-left mb-6 border">
                                <h3 className="font-semibold text-red-600 mb-2">Catatan Penolakan:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {profile.documents.filter((d: any) => d.status === 'rejected' && d.notes).map((doc: any, i: number) => (
                                        <li key={i}>
                                            <span className="font-medium uppercase">{doc.document_type.replace('_', ' ')}:</span> {doc.notes}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                            <Button asChild variant="outline">
                                <Link href="/dashboard">Kembali ke Dashboard</Link>
                            </Button>
                            
                            {profile.verification_status === 'verified' && (
                                <Button asChild className="bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                    <Link href="/akun/programs">Mulai Buat Program</Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
