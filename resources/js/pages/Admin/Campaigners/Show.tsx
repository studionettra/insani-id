import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowLeft } from 'lucide-react';

export default function CampaignerShow({ campaigner }: any) {
    const { data, setData, put, processing, errors } = useForm({
        status: campaigner.verification_status,
        notes: '',
        document_statuses: campaigner.documents.reduce((acc: any, doc: any) => {
            acc[doc.id] = doc.status;
            return acc;
        }, {}),
        document_notes: campaigner.documents.reduce((acc: any, doc: any) => {
            acc[doc.id] = doc.notes || '';
            return acc;
        }, {}),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/campaigners/${campaigner.id}/status`);
    };

    const getDocTitle = (type: string) => {
        const titles: any = {
            'ktp': 'KTP PIC',
            'selfie_ktp': 'Selfie dengan KTP',
            'buku_rekening': 'Buku Rekening',
            'sk_lembaga': 'SK Kemenkumham',
            'npwp': 'NPWP Lembaga'
        };
        return titles[type] || type;
    };

    return (
        <>
            <Head title={`Verifikasi ${campaigner.user?.name}`} />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="border-gray-200 hover:bg-gray-50 text-gray-600">
                        <Link href="/admin/campaigners"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Detail Pendaftaran Campaigner</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Tinjau informasi dan dokumen yang diajukan.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-gray-200 shadow-sm rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900">Informasi Profil</CardTitle>
                                <CardDescription className="text-gray-500">Data yang diinputkan oleh pendaftar</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Campaigner</Label>
                                        <p className="font-medium text-gray-900 mt-1 capitalize">{campaigner.type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pendaftar (Akun)</Label>
                                        <p className="font-medium text-gray-900 mt-1">{campaigner.user?.name}</p>
                                    </div>
                                    
                                    {campaigner.type === 'lembaga' && (
                                        <>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lembaga</Label>
                                                <p className="font-medium text-gray-900 mt-1">{campaigner.nama_lembaga}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor SK</Label>
                                                <p className="font-medium text-gray-900 mt-1">{campaigner.nomor_sk}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">NPWP Lembaga</Label>
                                                <p className="font-medium text-gray-900 mt-1">{campaigner.npwp}</p>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon / WA</Label>
                                        <p className="font-medium text-gray-900 mt-1">{campaigner.phone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</Label>
                                        <p className="font-medium text-gray-900 mt-1">{campaigner.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 shadow-sm rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900">Informasi Rekening</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</Label>
                                        <p className="font-medium text-gray-900 mt-1">{campaigner.bank_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Rekening</Label>
                                        <p className="font-medium text-gray-900 mt-1">{campaigner.bank_account_number}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Atas Nama</Label>
                                        <p className="font-medium text-gray-900 mt-1">{campaigner.bank_account_name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 shadow-sm rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900">Dokumen Verifikasi</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {campaigner.documents.map((doc: any) => (
                                    <div key={doc.id} className="border border-gray-200 bg-gray-50/30 p-5 rounded-lg space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="font-semibold text-gray-900">{getDocTitle(doc.document_type)}</div>
                                            <a href={`/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="text-[#1A56DB] text-sm font-medium flex items-center hover:underline bg-blue-50 px-3 py-1.5 rounded-md">
                                                Lihat Dokumen <ExternalLink className="ml-1.5 w-4 h-4" />
                                            </a>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 items-start pt-2 border-t border-gray-100">
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium text-gray-700">Status Dokumen</Label>
                                                <Select 
                                                    value={data.document_statuses[doc.id]} 
                                                    onValueChange={(val) => setData('document_statuses', {...data.document_statuses, [doc.id]: val})}
                                                >
                                                    <SelectTrigger className="bg-white border-gray-200 focus:ring-[#1A56DB]">
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="verified">Valid</SelectItem>
                                                        <SelectItem value="rejected">Tidak Valid</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium text-gray-700">Catatan (Jika ditolak)</Label>
                                                <Input 
                                                    placeholder="Contoh: Foto buram" 
                                                    value={data.document_notes[doc.id]}
                                                    onChange={(e) => setData('document_notes', {...data.document_notes, [doc.id]: e.target.value})}
                                                    className="bg-white border-gray-200 focus-visible:ring-[#1A56DB]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-gray-200 shadow-sm rounded-lg overflow-hidden sticky top-6">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900">Keputusan Verifikasi</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={submit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status Akhir Akun</Label>
                                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                            <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB]">
                                                <SelectValue placeholder="Pilih keputusan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending (Menunggu)</SelectItem>
                                                <SelectItem value="verified">Verifikasi Disetujui</SelectItem>
                                                <SelectItem value="rejected">Tolak Pengajuan</SelectItem>
                                                <SelectItem value="suspended">Suspend Akun</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {data.status === 'rejected' && (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Alasan Penolakan Global</Label>
                                            <Textarea 
                                                id="notes" 
                                                placeholder="Berikan alasan mengapa pengajuan ditolak secara keseluruhan..."
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                className="border-gray-200 focus-visible:ring-[#1A56DB] min-h-[100px]"
                                            />
                                            {errors.notes && <p className="text-xs text-red-500">{errors.notes}</p>}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full bg-[#1A56DB] text-white hover:bg-[#1e40af]" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Keputusan'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

CampaignerShow.layout = {
    breadcrumbs: [
        {
            title: 'CampaignerShow',
            href: '#',
        },
    ],
};
