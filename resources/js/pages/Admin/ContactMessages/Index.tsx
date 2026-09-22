import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Search, Mail, MailOpen, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ContactMessagesIndex({ messages, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/contact-messages',
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const [messageToDelete, setMessageToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteMessage = () => {
        if (!messageToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/contact-messages/${messageToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setMessageToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Pesan Kotak Masuk" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pesan Kotak Masuk</h2>
                        <p className="text-muted-foreground text-sm">
                            Daftar pesan yang dikirim oleh pengunjung melalui form kontak.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Cari nama, email, subjek..."
                                className="w-full pl-8 sm:w-[300px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/70 dark:bg-gray-800/50">
                            <TableRow>
                                <TableCell className="w-[50px] text-center"><Mail className="w-4 h-4 mx-auto text-gray-400" /></TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Pengirim</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Subjek & Pesan</TableCell>
                                <TableCell className="font-semibold text-xs text-gray-500 dark:text-gray-400">Tanggal</TableCell>
                                <TableCell className="text-right font-semibold text-xs text-gray-500 dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Tidak ada pesan ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                messages.data.map((message: any) => (
                                    <TableRow 
                                        key={message.id} 
                                        className={!message.is_read 
                                            ? "bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-50/80 dark:hover:bg-blue-950/50 transition-colors" 
                                            : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                        }
                                    >
                                        <TableCell className="text-center">
                                            {message.is_read ? (
                                                <MailOpen className="w-4 h-4 mx-auto text-gray-400" />
                                            ) : (
                                                <div className="relative inline-flex">
                                                    <Mail className="w-4 h-4 mx-auto text-blue-600 dark:text-blue-400" />
                                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">{message.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{message.email}</div>
                                            {message.phone && <div className="text-xs text-gray-400 dark:text-gray-500">{message.phone}</div>}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className={`truncate ${!message.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {message.subject}
                                            </div>
                                            <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                {message.message}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                {new Date(message.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(message.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/contact-messages/${message.id}`}>
                                                    <Button
                                                        variant={!message.is_read ? "default" : "outline"}
                                                        size="icon"
                                                        className={!message.is_read ? "bg-[#1A56DB] hover:bg-[#1e40af] text-white" : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setMessageToDelete(message)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ConfirmDialog
                open={!!messageToDelete}
                onOpenChange={(open) => !open && setMessageToDelete(null)}
                title="Hapus Pesan Masuk"
                description={`Apakah Anda yakin ingin menghapus pesan dari "${messageToDelete?.name}" (${messageToDelete?.email})? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDeleteMessage}
            />
        </>
    );
}

ContactMessagesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pesan Kotak Masuk',
            href: '/admin/contact-messages',
        },
    ],
};
