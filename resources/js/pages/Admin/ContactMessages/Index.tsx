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

    const deleteMessage = (message: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
            router.delete(`/admin/contact-messages/${message.id}`);
        }
    };

    return (
        <>
            <Head title="Pesan Kotak Masuk" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Pesan Kotak Masuk</h2>
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

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="w-[50px] text-center"><Mail className="w-4 h-4 mx-auto text-gray-500" /></TableCell>
                                <TableCell className="font-medium">Pengirim</TableCell>
                                <TableCell className="font-medium">Subjek & Pesan</TableCell>
                                <TableCell className="font-medium">Tanggal</TableCell>
                                <TableCell className="text-right font-medium">Aksi</TableCell>
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
                                    <TableRow key={message.id} className={!message.is_read ? "bg-blue-50/50" : ""}>
                                        <TableCell className="text-center">
                                            {message.is_read ? (
                                                <MailOpen className="w-4 h-4 mx-auto text-gray-400" />
                                            ) : (
                                                <div className="relative inline-flex">
                                                    <Mail className="w-4 h-4 mx-auto text-blue-600" />
                                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{message.name}</div>
                                            <div className="text-sm text-gray-500">{message.email}</div>
                                            {message.phone && <div className="text-xs text-gray-400">{message.phone}</div>}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className={`truncate ${!message.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {message.subject}
                                            </div>
                                            <div className="truncate text-sm text-gray-500">
                                                {message.message}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm whitespace-nowrap">
                                                {new Date(message.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500">
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
                                                        className={!message.is_read ? "bg-insani-blue hover:bg-insani-blue/90" : ""}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deleteMessage(message)}
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
