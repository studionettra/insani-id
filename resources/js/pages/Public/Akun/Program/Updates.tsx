import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Update {
    id: number;
    title: string;
    content: string;
    is_published: boolean;
    created_at: string;
}

interface Program {
    id: number;
    title: { id: string };
    program_code: string;
}

interface Props {
    program: Program;
    updates: Update[];
}

export default function Updates({ program, updates }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        content: '',
        is_published: true,
    });

    const openCreateDialog = () => {
        reset();
        setEditingId(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (update: Update) => {
        setData({
            title: update.title,
            content: update.content,
            is_published: update.is_published,
        });
        setEditingId(update.id);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('akun.programs.updates.update', { program: program.id, update: editingId }), {
                onSuccess: () => setIsDialogOpen(false),
            });
        } else {
            post(route('akun.programs.updates.store', program.id), {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const handleDelete = (updateId: number) => {
        if (confirm('Yakin ingin menghapus update ini?')) {
            destroy(route('akun.programs.updates.destroy', { program: program.id, update: updateId }));
        }
    };

    return (
        <PublicLayout>
            <Head title={`Kabar Terbaru - ${program.title.id}`} />
            
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Kabar Terbaru</h1>
                        <p className="text-muted-foreground">{program.title.id}</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Update
                    </Button>
                </div>

                <div className="space-y-4">
                    {updates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg">
                            Belum ada kabar terbaru untuk program ini.
                        </div>
                    ) : (
                        updates.map((update) => (
                            <Card key={update.id}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{update.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {format(new Date(update.created_at), 'd MMMM yyyy HH:mm', { locale: id })}
                                                {!update.is_published && ' • (Draft)'}
                                            </p>
                                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                                {update.content}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(update)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(update.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Kabar Terbaru' : 'Tambah Kabar Terbaru'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Penyaluran Dana Tahap 1"
                                />
                                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                            </div>
                            
                            <div>
                                <Label htmlFor="content">Isi Konten</Label>
                                <Textarea
                                    id="content"
                                    rows={5}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Ceritakan detail kabar terbaru..."
                                />
                                {errors.content && <p className="text-sm text-destructive mt-1">{errors.content}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
                                <Label htmlFor="is_published">Publikasikan (Tampil ke publik)</Label>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </PublicLayout>
    );
}
