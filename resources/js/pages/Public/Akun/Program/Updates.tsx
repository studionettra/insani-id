import { Head, useForm, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import DOMPurify from 'dompurify';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

const UpdateCard = ({ update }: { update: any }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 truncate">{update.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {format(new Date(update.created_at), 'd MMMM yyyy HH:mm', { locale: id })}
                            {!update.is_published && ' • (Draft)'}
                        </p>
                        <div className="relative">
                            <div 
                                className={`prose prose-sm max-w-none text-muted-foreground break-words overflow-hidden transition-all duration-300 prose-img:max-w-full prose-img:h-auto prose-img:rounded-md ${expanded ? '' : 'max-h-40'}`}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(update.content) }}
                            />
                            {!expanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                            )}
                        </div>
                        <div className="mt-2">
                            <button 
                                onClick={() => setExpanded(!expanded)} 
                                className="text-insani-blue font-medium text-sm hover:underline focus:outline-none"
                            >
                                {expanded ? 'Tutup' : 'Baca Selengkapnya'}
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

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
    updates: any; // Paginated response
}

export default function Updates({ program, updates }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        is_published: true,
    });

    const openCreateDialog = () => {
        reset();
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/akun/programs/${program.id}/updates`, {
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kabar Terbaru', href: `/akun/programs/${program.id}/updates` }]}>
            <Head title={`Kabar Terbaru: ${program.title.id}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6 mx-auto w-full max-w-4xl">
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
                    {(!updates.data || updates.data.length === 0) ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg">
                            Belum ada kabar terbaru untuk program ini.
                        </div>
                    ) : (
                        <>
                            {updates.data.map((update: any) => (
                                <UpdateCard key={update.id} update={update} />
                            ))}

                            {updates.last_page > 1 && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex space-x-2">
                                        {updates.links.map((link: any, idx: number) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                                    link.active
                                                        ? 'bg-insani-blue text-white shadow-md'
                                                        : link.url 
                                                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-insani-blue' 
                                                            : 'bg-transparent text-slate-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tambah Kabar Terbaru</DialogTitle>
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
                                <RichTextEditor
                                    value={data.content}
                                    onChange={(value) => setData('content', value)}
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
        </AppLayout>
    );
}
