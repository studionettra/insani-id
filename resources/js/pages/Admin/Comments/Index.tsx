import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Moderasi Komentar</h1>
                <div className="w-48">
                    <Select defaultValue={filters.is_hidden || "all"} onValueChange={handleFilterChange}>
                        <SelectTrigger>
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

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Komentar & Doa</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pengirim</TableHead>
                                <TableHead>Komentar/Doa</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comments.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Tidak ada komentar ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                comments.data.map((comment) => (
                                    <TableRow key={comment.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(comment.created_at), 'd MMM yyyy HH:mm', { locale: id })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{comment.name}</div>
                                            {comment.donation && (
                                                <Badge variant="secondary" className="mt-1 text-xs">Donatur</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-md line-clamp-2 text-sm">
                                                {comment.body}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs truncate" title={comment.program.title.id}>
                                                {comment.program.title.id}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={comment.is_hidden ? "destructive" : "default"}>
                                                {comment.is_hidden ? 'Disembunyikan' : 'Ditampilkan'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                variant={comment.is_hidden ? "outline" : "secondary"} 
                                                size="sm"
                                                onClick={() => handleToggleHidden(comment.id)}
                                            >
                                                {comment.is_hidden ? (
                                                    <><Eye className="mr-2 h-4 w-4" /> Tampilkan</>
                                                ) : (
                                                    <><EyeOff className="mr-2 h-4 w-4" /> Sembunyikan</>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        
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
