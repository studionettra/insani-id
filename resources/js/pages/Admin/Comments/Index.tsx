import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { Eye, EyeOff } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Comment {
    id: number;
    name: string;
    body: string;
    is_hidden: boolean;
    created_at: string;
    program?: { id: number; title: any } | null;
    donation: { id: number; donation_code: string } | null;
}

interface Props {
    comments: {
        data: Comment[];
        current_page: number;
        last_page: number;
        links: any[];
    };
    filters: {
        is_hidden?: string;
    };
}

const getProgramTitle = (title: any): string => {
    if (!title) return 'Program Tanpa Judul';
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
    return String(title || 'Program Tanpa Judul');
};

export default function CommentIndex({ comments, filters }: Props) {
    const handleFilterChange = (value: string) => {
        router.get('/admin/comments', { is_hidden: value }, { preserveState: true });
    };

    const handleToggleHidden = (commentId: number) => {
        router.put(`/admin/comments/${commentId}/toggle-hidden`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Moderasi Komentar & Doa" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Moderasi Komentar</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola komentar dan doa dari donatur.</p>
                    </div>
                    <div className="w-full sm:w-48">
                        <Select defaultValue={filters.is_hidden || "all"} onValueChange={handleFilterChange}>
                            <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:ring-[#1A56DB] bg-white dark:bg-gray-800 dark:text-gray-200 text-sm">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Komentar</SelectItem>
                                <SelectItem value="0">Ditampilkan</SelectItem>
                                <SelectItem value="1">Disembunyikan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                                    <TableHead className="font-medium text-gray-500 dark:text-gray-400">Tanggal</TableHead>
                                    <TableHead className="font-medium text-gray-500 dark:text-gray-400">Pengirim</TableHead>
                                    <TableHead className="font-medium text-gray-500 dark:text-gray-400">Komentar/Doa</TableHead>
                                    <TableHead className="font-medium text-gray-500 dark:text-gray-400">Program</TableHead>
                                    <TableHead className="font-medium text-gray-500 dark:text-gray-400">Status</TableHead>
                                    <TableHead className="font-medium text-gray-500 dark:text-gray-400 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                                            Tidak ada komentar ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    comments.data.map((comment) => (
                                        <TableRow key={comment.id} className="border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                            <TableCell className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {format(new Date(comment.created_at), 'd MMM yyyy HH:mm', { locale: id })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">{comment.name}</div>
                                                {comment.donation && (
                                                    <Badge variant="outline" className="mt-1 text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">Donatur</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-md line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                                                    {comment.body}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate text-sm text-gray-700 dark:text-gray-300" title={comment.program ? getProgramTitle(comment.program.title) : 'Program Tidak Ditemukan'}>
                                                    {comment.program ? getProgramTitle(comment.program.title) : 'Program Tidak Ditemukan'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`font-medium ${comment.is_hidden ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"}`}>
                                                    {comment.is_hidden ? 'Disembunyikan' : 'Ditampilkan'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleToggleHidden(comment.id)}
                                                    className={`h-8 shadow-none ${comment.is_hidden ? "border-[#1A56DB] text-[#1A56DB] hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/50" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                                >
                                                    {comment.is_hidden ? (
                                                        <><Eye className="mr-1.5 h-4 w-4" /> Tampilkan</>
                                                    ) : (
                                                        <><EyeOff className="mr-1.5 h-4 w-4" /> Sembunyikan</>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        
        </>
        
    );
}

CommentIndex.layout = {
    breadcrumbs: [
        {
            title: 'Moderasi Komentar & Doa',
            href: '/admin/comments',
        },
    ],
};
