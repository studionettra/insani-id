import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Mail, Calendar, User, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactMessagesShow({ message }: any) {

    const deleteMessage = () => {
        if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
            router.delete(`/admin/contact-messages/${message.id}`);
        }
    };

    return (
        <>
            <Head title={`Pesan: ${message.subject}`} />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/contact-messages">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Detail Pesan</h2>
                        </div>
                    </div>
                    
                    <Button 
                        variant="destructive" 
                        onClick={deleteMessage}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus Pesan
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                    <div className="rounded-md border bg-white shadow-sm flex flex-col">
                        <div className="p-6 border-b bg-gray-50/50">
                            <h3 className="text-xl font-semibold mb-2">{message.subject}</h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium text-gray-900">{message.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">{message.email}</a>
                                </div>
                                {message.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">{message.phone}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 bg-white whitespace-pre-wrap text-gray-800 leading-relaxed min-h-[300px]">
                            {message.message}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-md border bg-white shadow-sm p-5 flex flex-col gap-4">
                            <h4 className="font-semibold border-b pb-2">Informasi Pesan</h4>
                            
                            <div>
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Diterima Pada
                                </p>
                                <p className="text-sm font-medium">
                                    {new Date(message.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                    <br/>
                                    Pukul {new Date(message.created_at).toLocaleTimeString('id-ID', {
                                        hour: '2-digit', minute: '2-digit'
                                    })} WIB
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" /> Status Baca
                                </p>
                                <p className="text-sm font-medium">
                                    {message.read_at ? (
                                        <>
                                            Dibaca pada {new Date(message.read_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })} {new Date(message.read_at).toLocaleTimeString('id-ID', {
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </>
                                    ) : (
                                        <span className="text-amber-600">Belum dibaca</span>
                                    )}
                                </p>
                            </div>
                            
                            <div className="pt-4 mt-2 border-t flex flex-col gap-2">
                                <a href={`mailto:${message.email}?subject=Balasan: ${message.subject}`} className="w-full">
                                    <Button className="w-full bg-insani-blue hover:bg-insani-blue/90 text-white">
                                        Balas via Email
                                    </Button>
                                </a>
                                {message.phone && (
                                    <a href={`https://wa.me/${message.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="w-full">
                                        <Button variant="outline" className="w-full">
                                            Hubungi via WhatsApp
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ContactMessagesShow.layout = {
    breadcrumbs: [
        {
            title: 'Pesan Kotak Masuk',
            href: '/admin/contact-messages',
        },
        {
            title: 'Detail Pesan',
            href: '#',
        },
    ],
};
