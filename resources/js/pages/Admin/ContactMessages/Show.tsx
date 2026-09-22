import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Mail, Calendar, User, Phone, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ContactMessagesShow({ message }: any) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteMessage = () => {
        setIsDeleting(true);
        router.delete(`/admin/contact-messages/${message.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setIsConfirmOpen(false);
            },
        });
    };

    return (
        <>
            <Head title={`Pesan: ${message.subject}`} />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/contact-messages">
                            <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Detail Pesan</h2>
                        </div>
                    </div>
                    
                    <Button 
                        variant="destructive" 
                        onClick={() => setIsConfirmOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus Pesan
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{message.subject}</h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium text-gray-900 dark:text-white">{message.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    <a href={`mailto:${message.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{message.email}</a>
                                </div>
                                {message.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${message.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">{message.phone}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 bg-white dark:bg-gray-900 whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed min-h-[300px]">
                            {message.message}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Informasi Pesan</h4>
                            
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Diterima Pada
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
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
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" /> Status Baca
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {message.read_at ? (
                                        <>
                                            Dibaca pada {new Date(message.read_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })} {new Date(message.read_at).toLocaleTimeString('id-ID', {
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </>
                                    ) : (
                                        <span className="text-amber-600 dark:text-amber-400 font-medium">Belum dibaca</span>
                                    )}
                                </p>
                            </div>
                            
                            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                                <a href={`mailto:${message.email}?subject=Balasan: ${message.subject}`} className="w-full">
                                    <Button className="w-full bg-[#1A56DB] hover:bg-[#1e40af] text-white">
                                        Balas via Email
                                    </Button>
                                </a>
                                {message.phone && (
                                    <a href={`https://wa.me/${message.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="w-full">
                                        <Button variant="outline" className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                                            Hubungi via WhatsApp
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Pesan Masuk"
                description={`Apakah Anda yakin ingin menghapus pesan dari "${message.name}" (${message.email})? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDeleteMessage}
            />
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
