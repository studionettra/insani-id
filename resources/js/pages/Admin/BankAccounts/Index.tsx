import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Search, Building2, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface BankAccount {
    id: number;
    bank_name: string;
    bank_code: string | null;
    account_number: string;
    account_name: string;
    bank_type: 'syariah' | 'konvensional';
    logo_path: string | null;
    logo_url: string | null;
    instructions: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    accounts: {
        data: BankAccount[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        bank_type?: string;
    };
}

export default function BankAccountsIndex({ accounts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [bankTypeFilter, setBankTypeFilter] = useState(filters.bank_type || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        bank_name: '',
        bank_code: '',
        account_number: '',
        account_name: '',
        bank_type: 'syariah',
        logo: null as File | null,
        instructions: '',
        is_active: true,
        sort_order: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/bank-accounts',
            { search, bank_type: bankTypeFilter || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (type: string) => {
        setBankTypeFilter(type);
        router.get(
            '/admin/bank-accounts',
            { search, bank_type: type || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData({
            _method: 'post',
            bank_name: '',
            bank_code: '',
            account_number: '',
            account_name: 'Yayasan Peduli Insani Indonesia',
            bank_type: 'syariah',
            logo: null,
            instructions: 'Transfer tepat sesuai nominal yang tertera ke rekening giro resmi yayasan.',
            is_active: true,
            sort_order: (accounts.data?.length || 0) + 1,
        });
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (account: BankAccount) => {
        setEditingAccount(account);
        setData({
            _method: 'put',
            bank_name: account.bank_name,
            bank_code: account.bank_code || '',
            account_number: account.account_number,
            account_name: account.account_name,
            bank_type: account.bank_type,
            logo: null,
            instructions: account.instructions || '',
            is_active: account.is_active,
            sort_order: account.sort_order,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/bank-accounts', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAccount) return;

        post(`/admin/bank-accounts/${editingAccount.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!accountToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/bank-accounts/${accountToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setAccountToDelete(null);
            },
        });
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <>
            <Head title="Rekening Bank Yayasan" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rekening Bank Yayasan</h2>
                        <p className="text-sm text-slate-500">
                            Kelola rekening resmi yayasan untuk saluran pembayaran donasi manual dan transfer publik.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2 bg-insani-blue hover:bg-insani-blue/90 text-white">
                        <Plus className="h-4 w-4" />
                        Tambah Rekening
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama bank / no. rek..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                        <Button type="submit" variant="secondary">Cari</Button>
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-500 font-medium">Tipe:</span>
                        <select
                            value={bankTypeFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-insani-blue"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="syariah">Syariah</option>
                            <option value="konvensional">Konvensional</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/70">
                                <TableHead className="w-16 text-center">Urutan</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Nomor Rekening</TableHead>
                                <TableHead>Atas Nama</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.data && accounts.data.length > 0 ? (
                                accounts.data.map((acc) => (
                                    <TableRow key={acc.id} className="hover:bg-slate-50/50">
                                        <TableCell className="text-center font-mono text-sm text-slate-500">
                                            {acc.sort_order}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {acc.logo_url ? (
                                                    <img
                                                        src={acc.logo_url}
                                                        alt={acc.bank_name}
                                                        className="h-8 w-12 object-contain rounded border border-slate-100 bg-white p-0.5"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-12 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <Building2 className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-slate-900 block">{acc.bank_name}</span>
                                                    {acc.bank_code && (
                                                        <span className="text-[11px] font-mono text-slate-400">Kode: {acc.bank_code}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-slate-800 text-sm tracking-wide">
                                                    {acc.account_number}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(acc.account_number.replace(/\s+/g, ''), acc.id)}
                                                    className="p-1 text-slate-400 hover:text-insani-blue rounded transition-colors"
                                                    title="Salin nomor rekening"
                                                >
                                                    {copiedId === acc.id ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600 font-medium">
                                            {acc.account_name}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    acc.bank_type === 'syariah'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}
                                            >
                                                {acc.bank_type === 'syariah' ? 'Syariah' : 'Konvensional'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    acc.is_active
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {acc.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(acc)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-insani-blue"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setAccountToDelete(acc)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                                        Belum ada data rekening bank yayasan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal Tambah */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle>Tambah Rekening Bank</DialogTitle>
                        <DialogDescription>
                            Tambahkan rekening giro/tabungan resmi yayasan untuk saluran transfer donatur.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <Label htmlFor="bank_name">Nama Bank *</Label>
                            <Input
                                id="bank_name"
                                value={data.bank_name}
                                onChange={(e) => setData('bank_name', e.target.value)}
                                placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                                required
                            />
                            {errors.bank_name && <p className="text-red-500 text-xs mt-1">{errors.bank_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="account_number">Nomor Rekening *</Label>
                                <Input
                                    id="account_number"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                    placeholder="Contoh: 7132195026"
                                    required
                                />
                                {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>}
                            </div>

                            <div>
                                <Label htmlFor="bank_code">Kode Bank (Opsional)</Label>
                                <Input
                                    id="bank_code"
                                    value={data.bank_code}
                                    onChange={(e) => setData('bank_code', e.target.value)}
                                    placeholder="Contoh: MANUAL_BSI / 451"
                                />
                                {errors.bank_code && <p className="text-red-500 text-xs mt-1">{errors.bank_code}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="account_name">Atas Nama Pemilik Rekening *</Label>
                            <Input
                                id="account_name"
                                value={data.account_name}
                                onChange={(e) => setData('account_name', e.target.value)}
                                placeholder="Contoh: Yayasan Peduli Insani Indonesia"
                                required
                            />
                            {errors.account_name && <p className="text-red-500 text-xs mt-1">{errors.account_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="bank_type">Kategori Bank</Label>
                                <select
                                    id="bank_type"
                                    value={data.bank_type}
                                    onChange={(e) => setData('bank_type', e.target.value as any)}
                                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                >
                                    <option value="syariah">Bank Syariah</option>
                                    <option value="konvensional">Bank Konvensional</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="sort_order">Nomor Urut Tampil</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="logo">Logo Bank (Opsional)</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                        </div>

                        <div>
                            <Label htmlFor="instructions">Instruksi Transfer Singkat</Label>
                            <textarea
                                id="instructions"
                                rows={2}
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                placeholder="Contoh: Transfer tepat sesuai nominal, lalu konfirmasi via WhatsApp."
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                Aktifkan rekening ini untuk donasi publik
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                {processing ? 'Menyimpan...' : 'Simpan Rekening'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Rekening Bank</DialogTitle>
                        <DialogDescription>
                            Perbarui rincian informasi rekening bank yayasan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit_bank_name">Nama Bank *</Label>
                            <Input
                                id="edit_bank_name"
                                value={data.bank_name}
                                onChange={(e) => setData('bank_name', e.target.value)}
                                required
                            />
                            {errors.bank_name && <p className="text-red-500 text-xs mt-1">{errors.bank_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit_account_number">Nomor Rekening *</Label>
                                <Input
                                    id="edit_account_number"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                    required
                                />
                                {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit_bank_code">Kode Bank (Opsional)</Label>
                                <Input
                                    id="edit_bank_code"
                                    value={data.bank_code}
                                    onChange={(e) => setData('bank_code', e.target.value)}
                                />
                                {errors.bank_code && <p className="text-red-500 text-xs mt-1">{errors.bank_code}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit_account_name">Atas Nama Pemilik Rekening *</Label>
                            <Input
                                id="edit_account_name"
                                value={data.account_name}
                                onChange={(e) => setData('account_name', e.target.value)}
                                required
                            />
                            {errors.account_name && <p className="text-red-500 text-xs mt-1">{errors.account_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit_bank_type">Kategori Bank</Label>
                                <select
                                    id="edit_bank_type"
                                    value={data.bank_type}
                                    onChange={(e) => setData('bank_type', e.target.value as any)}
                                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-insani-blue"
                                >
                                    <option value="syariah">Bank Syariah</option>
                                    <option value="konvensional">Bank Konvensional</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="edit_sort_order">Nomor Urut Tampil</Label>
                                <Input
                                    id="edit_sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit_logo">Logo Bank (Ganti bila perlu)</Label>
                            <Input
                                id="edit_logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                        </div>

                        <div>
                            <Label htmlFor="edit_instructions">Instruksi Transfer Singkat</Label>
                            <textarea
                                id="edit_instructions"
                                rows={2}
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-insani-blue"
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit_is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="edit_is_active" className="text-sm font-medium cursor-pointer">
                                Aktifkan rekening ini untuk donasi publik
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-insani-blue hover:bg-insani-blue/90 text-white">
                                {processing ? 'Memperbarui...' : 'Perbarui Rekening'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Hapus */}
            <ConfirmDialog
                open={!!accountToDelete}
                onOpenChange={(open) => !open && setAccountToDelete(null)}
                title="Hapus Rekening Bank?"
                description={`Apakah Anda yakin ingin menghapus rekening ${accountToDelete?.bank_name} (${accountToDelete?.account_number})? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus Rekening"
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}
