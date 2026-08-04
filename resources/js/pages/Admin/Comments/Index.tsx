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
    program: { id: number, title: { id: string } };
    donation: { id: number, donation_code: string } | null;
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

export default function CommentIndex({ comments, filters }: Props) {
    const handleFilterChange = (value: string) => {
        router.get(route('admin.comments.index'), { is_hidden: value }, { preserveState: true });
    };

    const handleToggleHidden = (commentId: number) => {
        router.put(route('admin.comments.toggle-hidden', commentId), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Moderasi Komentar & Doa" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Moderasi Komentar</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola komentar dan doa dari donatur.</p>
                    </div>
                    <div className="w-full sm:w-48">
                        <Select defaultValue={filters.is_hidden || "all"} onValueChange={handleFilterChange}>
                            <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB] bg-white text-sm">
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

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="font-medium text-gray-500">Tanggal</TableHead>
                                    <TableHead className="font-medium text-gray-500">Pengirim</TableHead>
                                    <TableHead className="font-medium text-gray-500">Komentar/Doa</TableHead>
                                    <TableHead className="font-medium text-gray-500">Program</TableHead>
                                    <TableHead className="font-medium text-gray-500">Status</TableHead>
                                    <TableHead className="font-medium text-gray-500 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-sm border-b border-gray-100">
                                            Tidak ada komentar ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    comments.data.map((comment) => (
                                        <TableRow key={comment.id} className="border-gray-100 transition-colors hover:bg-gray-50/50">
                                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                                {format(new Date(comment.created_at), 'd MMM yyyy HH:mm', { locale: id })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900 text-sm">{comment.name}</div>
                                                {comment.donation && (
                                                    <Badge variant="outline" className="mt-1 text-[10px] bg-blue-50 text-blue-700 border-blue-200">Donatur</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-md line-clamp-2 text-sm text-gray-600">
                                                    {comment.body}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate text-sm text-gray-700" title={comment.program.title.id}>
                                                    {comment.program.title.id}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`font-medium ${comment.is_hidden ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                                    {comment.is_hidden ? 'Disembunyikan' : 'Ditampilkan'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleToggleHidden(comment.id)}
                                                    className={`h-8 shadow-none ${comment.is_hidden ? "border-[#1A56DB] text-[#1A56DB] hover:bg-blue-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
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
