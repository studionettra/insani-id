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
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/campaigners"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Detail Pendaftaran Campaigner</h2>
                        <p className="text-muted-foreground text-sm">
                            Tinjau informasi dan dokumen yang diajukan.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Profil</CardTitle>
                                <CardDescription>Data yang diinputkan oleh pendaftar</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Tipe Campaigner</Label>
                                        <p className="font-medium capitalize">{campaigner.type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Nama Pendaftar (Akun)</Label>
                                        <p className="font-medium">{campaigner.user?.name}</p>
                                    </div>
                                    
                                    {campaigner.type === 'lembaga' && (
                                        <>
                                            <div>
                                                <Label className="text-muted-foreground">Nama Lembaga</Label>
                                                <p className="font-medium">{campaigner.nama_lembaga}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Nomor SK</Label>
                                                <p className="font-medium">{campaigner.nomor_sk}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">NPWP Lembaga</Label>
                                                <p className="font-medium">{campaigner.npwp}</p>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <Label className="text-muted-foreground">Telepon / WA</Label>
                                        <p className="font-medium">{campaigner.phone}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Alamat</Label>
                                        <p className="font-medium">{campaigner.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Rekening</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Bank</Label>
                                        <p className="font-medium">{campaigner.bank_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Nomor Rekening</Label>
                                        <p className="font-medium">{campaigner.bank_account_number}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-muted-foreground">Atas Nama</Label>
                                        <p className="font-medium">{campaigner.bank_account_name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dokumen Verifikasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {campaigner.documents.map((doc: any) => (
                                    <div key={doc.id} className="border p-4 rounded-md space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="font-semibold">{getDocTitle(doc.document_type)}</div>
                                            <a href={`/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="text-insani-blue text-sm flex items-center hover:underline">
                                                Lihat Dokumen <ExternalLink className="ml-1 w-3 h-3" />
                                            </a>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 items-start">
                                            <div className="space-y-2">
                                                <Label>Status Dokumen</Label>
                                                <Select 
                                                    value={data.document_statuses[doc.id]} 
                                                    onValueChange={(val) => setData('document_statuses', {...data.document_statuses, [doc.id]: val})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="verified">Valid</SelectItem>
                                                        <SelectItem value="rejected">Tidak Valid</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Catatan (Jika ditolak)</Label>
                                                <Input 
                                                    placeholder="Contoh: Foto buram" 
                                                    value={data.document_notes[doc.id]}
                                                    onChange={(e) => setData('document_notes', {...data.document_notes, [doc.id]: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Keputusan Verifikasi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status Akhir Akun</Label>
                                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                            <SelectTrigger>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Alasan Penolakan Global</Label>
                                            <Textarea 
                                                id="notes" 
                                                placeholder="Berikan alasan mengapa pengajuan ditolak secara keseluruhan..."
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                            />
                                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full bg-insani-blue hover:bg-insani-blue/90" disabled={processing}>
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
