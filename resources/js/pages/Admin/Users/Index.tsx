import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    RotateCcw,
    Building2,
    Users,
    User,
    Layers,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Ban,
    ShieldCheck,
    Heart,
    Phone,
    Mail,
    ExternalLink,
    FileCheck,
    UserCheck,
    Power,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import admin from '@/routes/admin';

interface RoleItem {
    id?: number;
    name: string;
}

interface CampaignerProfile {
    id: number;
    user_id: number;
    type: 'lembaga' | 'individu';
    verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
    nama_lembaga?: string;
    institution_name?: string;
    phone?: string;
    nomor_sk?: string;
    npwp?: string;
    max_campaign_slots?: number;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    is_active: boolean;
    last_login_at?: string | null;
    created_at: string;
    roles: RoleItem[];
    campaigner_profile?: CampaignerProfile | null;
    campaignerProfile?: CampaignerProfile | null;
    created_programs_count?: number;
    donations_count?: number;
}

interface Props {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        links: any[];
        total: number;
        from?: number;
        to?: number;
    };
    roles: string[];
    internalRoles: string[];
    counts: {
        all: number;
        internal: number;
        lembaga: number;
        individu: number;
        donatur: number;
        pending_verification: number;
        active_internal: number;
    };
    filters: {
        type?: string;
        status?: string;
        role?: string;
        search?: string;
    };
}

export default function UsersIndex({
    users,
    roles,
    internalRoles = [],
    counts = {
        all: 0,
        internal: 0,
        lembaga: 0,
        individu: 0,
        donatur: 0,
        pending_verification: 0,
        active_internal: 0,
    },
    filters = {},
}: Props) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;

    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
    const isFirstRender = useRef(true);

    const activeTab = filters.type || 'semua';
    const activeStatus = filters.status || 'semua';
    const activeRole = filters.role || 'semua';

    // Form Tambah Pengguna (Fokus Pengelola Sistem Internal)
    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: internalRoles.length > 0 ? internalRoles[0] : (roles[0] || 'Administrator'),
    });

    // Form Edit Pengguna
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        role: '',
        is_active: true,
        password: '',
        password_confirmation: '',
    });

    // Helper: Apply Filters
    const applyFilters = (newFilters: {
        type?: string;
        status?: string;
        role?: string;
        search?: string | null;
    }) => {
        const updated = {
            type: newFilters.type !== undefined ? newFilters.type : activeTab,
            status: newFilters.status !== undefined ? newFilters.status : activeStatus,
            role: newFilters.role !== undefined ? newFilters.role : activeRole,
            search: newFilters.search !== undefined ? newFilters.search : searchInput,
        };

        const query: Record<string, string> = {};
        if (updated.type && updated.type !== 'semua') query.type = updated.type;
        if (updated.status && updated.status !== 'semua') query.status = updated.status;
        if (updated.role && updated.role !== 'semua') query.role = updated.role;
        if (updated.search && updated.search.trim()) query.search = updated.search.trim();

        router.get(admin.users.index().url, query, { preserveState: true, replace: true });
    };

    // Debounce search input
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || '')) {
                applyFilters({ search: searchInput });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleTabChange = (typeId: string) => {
        applyFilters({ type: typeId, status: 'semua', role: 'semua' });
    };

    const handleStatusChange = (statusValue: string) => {
        applyFilters({ status: statusValue });
    };

    const handleRoleChange = (roleValue: string) => {
        applyFilters({ role: roleValue });
    };

    const handleResetFilters = () => {
        setSearchInput('');
        router.get(admin.users.index().url, {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters =
        (filters.type && filters.type !== 'semua') ||
        (filters.status && filters.status !== 'semua') ||
        (filters.role && filters.role !== 'semua') ||
        Boolean(filters.search);

    const openCreateModal = () => {
        createForm.clearErrors();
        createForm.reset();
        if (internalRoles.length > 0) {
            createForm.setData('role', internalRoles[0]);
        }
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user: UserItem) => {
        editForm.clearErrors();
        editForm.reset();
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.roles[0]?.name || '',
            is_active: Boolean(user.is_active),
            password: '',
            password_confirmation: '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(admin.users.store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(admin.users.update(editingUser.id).url, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
            },
        });
    };

    const handleConfirmDelete = () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        router.delete(admin.users.destroy(userToDelete.id).url, {
            onFinish: () => {
                setIsDeleting(false);
                setUserToDelete(null);
            },
        });
    };

    const handleToggleStatus = (user: UserItem) => {
        if (user.id === currentUserId) return;
        setTogglingUserId(user.id);
        router.patch(
            `/admin/users/${user.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingUserId(null),
            }
        );
    };

    // Helper: Role Badge Styling
    const getRoleBadge = (roleName: string) => {
        switch (roleName) {
            case 'Administrator':
                return (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 ring-1 ring-rose-600/20 border-0 font-medium">
                        <ShieldCheck className="w-3 h-3 text-rose-600 mr-1" /> Administrator
                    </Badge>
                );
            case 'Program Officer':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ring-1 ring-blue-600/20 border-0 font-medium">
                        Program Officer
                    </Badge>
                );
            case 'Verifikator':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/20 border-0 font-medium">
                        <FileCheck className="w-3 h-3 text-purple-600 mr-1" /> Verifikator
                    </Badge>
                );
            case 'Keuangan':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600/20 border-0 font-medium">
                        Keuangan
                    </Badge>
                );
            case 'Customer Service':
                return (
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 ring-1 ring-teal-600/20 border-0 font-medium">
                        Customer Service
                    </Badge>
                );
            case 'Content Editor':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-600/20 border-0 font-medium">
                        Content Editor
                    </Badge>
                );
            case 'Eksekutif':
                return (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 ring-1 ring-indigo-600/20 border-0 font-medium">
                        Eksekutif
                    </Badge>
                );
            case 'Campaigner Lembaga':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/20 border-0 font-medium">
                        <Building2 className="w-3 h-3 text-purple-600 mr-1" /> Mitra Lembaga
                    </Badge>
                );
            case 'Campaigner Individu':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-600/20 border-0 font-medium">
                        <User className="w-3 h-3 text-amber-600 mr-1" /> Campaigner Individu
                    </Badge>
                );
            case 'Donatur':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600/20 border-0 font-medium">
                        <Heart className="w-3 h-3 text-emerald-600 mr-1" /> Donatur
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="font-medium">
                        {roleName || '-'}
                    </Badge>
                );
        }
    };

    // Helper: Verification Status Badge
    const getVerificationBadge = (status?: string) => {
        switch (status) {
            case 'verified':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600/20 border-0 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" /> Terverifikasi
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-600/20 border-0 font-medium animate-pulse">
                        <Clock className="w-3 h-3 text-amber-600 mr-1" /> Menunggu Verifikasi
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-600/20 border-0 font-medium">
                        <XCircle className="w-3 h-3 text-red-600 mr-1" /> Ditolak
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ring-1 ring-gray-600/20 border-0 font-medium">
                        <Ban className="w-3 h-3 text-gray-500 mr-1" /> Dibekukan
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="font-medium text-gray-500">
                        Belum Mengajukan
                    </Badge>
                );
        }
    };

    // Helper: Entity Identity Chip for "Semua" tab
    const getEntityIdentity = (user: UserItem) => {
        const profile = user.campaigner_profile || user.campaignerProfile;
        const roleName = user.roles[0]?.name || '';

        if (internalRoles.includes(roleName)) {
            return (
                <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        Internal Yayasan
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {roleName}
                    </div>
                </div>
            );
        }

        if (profile?.type === 'lembaga' || roleName === 'Campaigner Lembaga') {
            const orgName = profile?.nama_lembaga || profile?.institution_name || 'Mitra Lembaga';
            return (
                <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Building2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        Mitra Lembaga
                    </span>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[170px]" title={orgName}>
                        {orgName}
                    </div>
                </div>
            );
        }

        if (profile?.type === 'individu' || roleName === 'Campaigner Individu') {
            return (
                <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Individu
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Penggalang Dana
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Heart className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Donatur Publik
                </span>
            </div>
        );
    };

    const typeTabs = [
        { id: 'semua', label: 'Semua Pengguna', count: counts.all, icon: Layers },
        { id: 'internal', label: 'Pengelola Sistem', count: counts.internal, icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'lembaga', label: 'Mitra Lembaga', count: counts.lembaga, icon: Building2, color: 'text-purple-600 dark:text-purple-400' },
        { id: 'individu', label: 'Campaigner Individu', count: counts.individu, icon: UserCheck, color: 'text-amber-600 dark:text-amber-400' },
        { id: 'donatur', label: 'Donatur Publik', count: counts.donatur, icon: Heart, color: 'text-emerald-600 dark:text-emerald-400' },
    ];

    const getSearchPlaceholder = () => {
        switch (activeTab) {
            case 'internal':
                return 'Cari nama staf, email resmi, nomor telepon...';
            case 'lembaga':
                return 'Cari nama lembaga, nama PIC, email, telepon...';
            case 'individu':
                return 'Cari nama campaigner, email, telepon...';
            case 'donatur':
                return 'Cari nama donatur, email...';
            default:
                return 'Cari nama, email, lembaga, telepon...';
        }
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
            <Head title="Manajemen Pengguna" />

            {/* Header Utama */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Manajemen Pengguna
                        </h1>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {users.total} Pengguna
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Kelola data staf pengelola sistem yayasan, mitra lembaga, campaigner individu, dan donatur terdaftar.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                        asChild
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        <Link href="/admin/campaigners">
                            <FileCheck className="mr-2 h-4 w-4 text-purple-600" />
                            Verifikasi Campaigner
                            {counts.pending_verification > 0 && (
                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                                    {counts.pending_verification}
                                </span>
                            )}
                        </Link>
                    </Button>
                    <Button
                        onClick={openCreateModal}
                        className="bg-[#1A56DB] text-white hover:bg-[#1e40af] shadow-xs"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Pengelola Sistem
                    </Button>
                </div>
            </div>

            {/* Top 4 Quick Metric Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                    onClick={() => handleTabChange('internal')}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 ${
                        activeTab === 'internal'
                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500/80 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-blue-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Pengelola Sistem
                        </span>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {counts.internal}
                    </div>
                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {counts.active_internal} staf aktif sistem
                    </div>
                </button>

                <button
                    onClick={() => handleTabChange('lembaga')}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 ${
                        activeTab === 'lembaga'
                            ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-500/80 ring-2 ring-purple-500/20 shadow-xs'
                            : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-purple-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Mitra Lembaga
                        </span>
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {counts.lembaga}
                    </div>
                    <div className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Yayasan & organisasi mitra
                    </div>
                </button>

                <button
                    onClick={() => handleTabChange('individu')}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 ${
                        activeTab === 'individu'
                            ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500/80 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-amber-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Campaigner Individu
                        </span>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
                            <UserCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {counts.individu}
                    </div>
                    <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Penggalang dana perorangan
                    </div>
                </button>

                <Link
                    href="/admin/campaigners?status=pending"
                    className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-400 transition-all duration-150 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Verifikasi Tertunda
                        </span>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 group-hover:scale-105 transition-transform">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {counts.pending_verification}
                        {counts.pending_verification > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 animate-pulse">
                                Perlu Review
                            </span>
                        )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 group-hover:text-amber-600">
                        Buka antrean verifikasi <ExternalLink className="w-3 h-3" />
                    </div>
                </Link>
            </div>

            {/* Level 1: Tabs Segmentasi Tipe Pengguna */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-px">
                    {typeTabs.map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`group flex items-center gap-2.5 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'border-[#1A56DB] text-[#1A56DB] dark:border-blue-500 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20 rounded-t-lg'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                <IconComponent
                                    className={`w-4 h-4 ${
                                        isActive
                                            ? 'text-[#1A56DB] dark:text-blue-400'
                                            : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                                />
                                <span>{tab.label}</span>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                        isActive
                                            ? 'bg-[#1A56DB] text-white'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notice / Context Banners */}
            {activeTab === 'lembaga' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800 text-sm text-purple-900 dark:text-purple-200">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <span className="font-semibold">Manajemen Mitra Lembaga:</span> Akun di bawah ini mewakili yayasan atau organisasi mitra. Untuk memverifikasi dokumen legalitas (SK Kemenkumham, NPWP, Rekening Bank) silakan kunjungi modul{' '}
                        <Link href="/admin/campaigners" className="font-bold underline hover:text-purple-700">
                            Verifikasi Campaigner
                        </Link>.
                    </div>
                </div>
            )}

            {activeTab === 'individu' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
                    <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <span className="font-semibold">Manajemen Campaigner Individu:</span> Akun inisiator penggalang dana perorangan. Tinjau verifikasi identitas KTP dan foto diri pada menu{' '}
                        <Link href="/admin/campaigners" className="font-bold underline hover:text-amber-700">
                            Verifikasi Campaigner
                        </Link>.
                    </div>
                </div>
            )}

            {/* Level 2: Filter Toolbar Sekunder */}
            <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            className="pl-9 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-[#1A56DB]"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <Ban className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Secondary Filters */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Filter Role (Muncul di tab internal atau semua) */}
                        {(activeTab === 'internal' || activeTab === 'semua') && (
                            <div className="w-[180px]">
                                <Select value={activeRole} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                        <Filter className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">Semua Peran</SelectItem>
                                        {(activeTab === 'internal' ? internalRoles : roles).map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Filter Status */}
                        <div className="w-[190px]">
                            <Select value={activeStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Status</SelectItem>
                                    {activeTab === 'lembaga' || activeTab === 'individu' ? (
                                        <>
                                            <SelectItem value="verified">Terverifikasi</SelectItem>
                                            <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
                                            <SelectItem value="rejected">Ditolak</SelectItem>
                                            <SelectItem value="suspended">Dibekukan</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="active">Akun Aktif</SelectItem>
                                            <SelectItem value="inactive">Akun Nonaktif</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reset Filter Button */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs px-2.5"
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Adaptive Contextual Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs">
                <Table>
                    <TableHeader className="bg-gray-50/60 dark:bg-gray-800/50">
                        <TableRow>
                            {/* TAB 1: PENGELOLA SISTEM */}
                            {activeTab === 'internal' && (
                                <>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Staf Pengelola
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Peran / Divisi
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Status Akun
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Terakhir Login
                                    </TableCell>
                                    <TableCell isHeader className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                        Aksi
                                    </TableCell>
                                </>
                            )}

                            {/* TAB 2: MITRA LEMBAGA */}
                            {activeTab === 'lembaga' && (
                                <>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Lembaga & PIC
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Kontak PIC
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Status Verifikasi
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Program Donasi
                                    </TableCell>
                                    <TableCell isHeader className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                        Aksi & Tautan
                                    </TableCell>
                                </>
                            )}

                            {/* TAB 3: CAMPAIGNER INDIVIDU */}
                            {activeTab === 'individu' && (
                                <>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Campaigner
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Kontak
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Status Verifikasi
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Program
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Terdaftar
                                    </TableCell>
                                    <TableCell isHeader className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                        Aksi
                                    </TableCell>
                                </>
                            )}

                            {/* TAB 4: DONATUR PUBLIK */}
                            {activeTab === 'donatur' && (
                                <>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Donatur
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Kontak
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Status Akun
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Aktivitas Donasi
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Bergabung
                                    </TableCell>
                                    <TableCell isHeader className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                        Aksi
                                    </TableCell>
                                </>
                            )}

                            {/* TAB 5: SEMUA PENGGUNA */}
                            {activeTab === 'semua' && (
                                <>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Pengguna
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Tipe Entitas
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Peran
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Status
                                    </TableCell>
                                    <TableCell isHeader className="font-semibold text-gray-700 dark:text-gray-300">
                                        Aktivitas
                                    </TableCell>
                                    <TableCell isHeader className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                        Aksi
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-44 text-center text-gray-500 dark:text-gray-400"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                        <p className="font-medium text-base text-gray-700 dark:text-gray-300">
                                            Tidak ada data pengguna ditemukan
                                        </p>
                                        <p className="text-xs text-gray-400 max-w-sm">
                                            Coba ubah kata kunci pencarian atau sesuaikan filter segmen dan status di atas.
                                        </p>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResetFilters}
                                                className="mt-2 text-xs"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Filter
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.data.map((user) => {
                                const profile = user.campaigner_profile || user.campaignerProfile;
                                const roleName = user.roles[0]?.name || '-';
                                const initials = user.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase();

                                return (
                                    <TableRow
                                        key={user.id}
                                        className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                                    >
                                        {/* TAB 1: PENGELOLA SISTEM */}
                                        {activeTab === 'internal' && (
                                            <>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                                                            <AvatarFallback>{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                {user.name}
                                                                {user.id === currentUserId && (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                                <span>{user.email}</span>
                                                                {user.phone && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{user.phone}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getRoleBadge(roleName)}</TableCell>
                                                <TableCell>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(user)}
                                                        disabled={user.id === currentUserId || togglingUserId === user.id}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                                            user.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                                                        } ${user.id === currentUserId ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        title={
                                                            user.id === currentUserId
                                                                ? 'Anda tidak dapat menonaktifkan akun sendiri'
                                                                : 'Klik untuk ubah status keaktifan'
                                                        }
                                                    >
                                                        <Power className="w-3 h-3" />
                                                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                                                    {user.last_login_at
                                                        ? new Date(user.last_login_at).toLocaleString('id-ID', {
                                                              dateStyle: 'medium',
                                                              timeStyle: 'short',
                                                          })
                                                        : 'Belum pernah login'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(user)}
                                                            className="h-8 w-8 text-gray-400 hover:text-[#1A56DB] dark:hover:text-blue-400"
                                                            title="Edit Staf"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setUserToDelete(user)}
                                                            disabled={user.id === currentUserId}
                                                            className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40"
                                                            title="Hapus Staf"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        )}

                                        {/* TAB 2: MITRA LEMBAGA */}
                                        {activeTab === 'lembaga' && (
                                            <>
                                                <TableCell>
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 shrink-0 mt-0.5">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">
                                                                {profile?.nama_lembaga || profile?.institution_name || user.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                PIC: <span className="font-medium text-gray-700 dark:text-gray-300">{user.name}</span> ({user.email})
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.phone || profile?.phone ? (
                                                        <div className="space-y-1">
                                                            <a
                                                                href={`https://wa.me/${(user.phone || profile?.phone || '').replace(/[^0-9]/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                                                            >
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {user.phone || profile?.phone}
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {getVerificationBadge(profile?.verification_status)}
                                                        {profile?.max_campaign_slots && (
                                                            <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                Slot: <span className="font-semibold">{profile.max_campaign_slots}</span> program
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/programs?search=${encodeURIComponent(
                                                            profile?.nama_lembaga || user.name
                                                        )}`}
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        <span>{user.created_programs_count || 0} Program Dibuat</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {profile?.id && (
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/50"
                                                            >
                                                                <Link href={`/admin/campaigners/${profile.id}`}>
                                                                    <FileCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />
                                                                    Tinjau Berkas
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(user)}
                                                            className="h-8 w-8 text-gray-400 hover:text-[#1A56DB]"
                                                            title="Edit Akun"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        )}

                                        {/* TAB 3: CAMPAIGNER INDIVIDU */}
                                        {activeTab === 'individu' && (
                                            <>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
                                                            <AvatarFallback>{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.phone ? (
                                                        <a
                                                            href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline dark:text-emerald-400 font-medium"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {user.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getVerificationBadge(profile?.verification_status)}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/programs?search=${encodeURIComponent(user.name)}`}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        <span>{user.created_programs_count || 0} Program</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {profile?.id && (
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300"
                                                            >
                                                                <Link href={`/admin/campaigners/${profile.id}`}>
                                                                    <FileCheck className="w-3.5 h-3.5 mr-1" />
                                                                    Verifikasi
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(user)}
                                                            className="h-8 w-8 text-gray-400 hover:text-[#1A56DB]"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        )}

                                        {/* TAB 4: DONATUR PUBLIK */}
                                        {activeTab === 'donatur' && (
                                            <>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                                                            <AvatarFallback>{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                                                    {user.phone || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            user.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                                                        }`}
                                                    >
                                                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                    {user.donations_count || 0} Kali Donasi
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(user)}
                                                        className="h-8 w-8 text-gray-400 hover:text-[#1A56DB]"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </>
                                        )}

                                        {/* TAB 5: SEMUA PENGGUNA */}
                                        {activeTab === 'semua' && (
                                            <>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold text-xs">
                                                            <AvatarFallback>{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                {user.name}
                                                                {user.id === currentUserId && (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getEntityIdentity(user)}</TableCell>
                                                <TableCell>{getRoleBadge(roleName)}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            user.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                                                        }`}
                                                    >
                                                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                                                    {(user.created_programs_count || 0) > 0 && (
                                                        <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">
                                                            {user.created_programs_count} Program
                                                        </span>
                                                    )}
                                                    {(user.donations_count || 0) > 0 && (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                            {user.donations_count} Donasi
                                                        </span>
                                                    )}
                                                    {!(user.created_programs_count || 0) &&
                                                        !(user.donations_count || 0) && (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {profile?.id && (
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                                title="Tinjau Berkas Verifikasi"
                                                            >
                                                                <Link href={`/admin/campaigners/${profile.id}`}>
                                                                    <FileCheck className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(user)}
                                                            className="h-8 w-8 text-gray-400 hover:text-[#1A56DB]"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setUserToDelete(user)}
                                                            disabled={user.id === currentUserId}
                                                            className="h-8 w-8 text-gray-400 hover:text-red-600 disabled:opacity-40"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Navigation */}
            {users.last_page > 1 && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{users.from || 1}</span> -{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">{users.to || users.data.length}</span> dari{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">{users.total}</span> pengguna
                    </div>
                    <div className="flex space-x-1">
                        {users.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                    link.active
                                        ? 'bg-[#1A56DB] text-white shadow-xs'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Tambah Pengguna (Pengelola Sistem) */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="overflow-hidden border-0 bg-white p-0 shadow-xl sm:max-w-[480px] dark:border dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader className="border-b border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Tambah Pengelola Sistem
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Tambahkan akun staf internal pengelola yayasan ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate}>
                        <div className="space-y-4 px-6 py-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-name" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Nama Lengkap Staf
                                </Label>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Ahmad Dahlan"
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-red-500 font-medium">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-email" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Email Resmi
                                </Label>
                                <Input
                                    id="create-email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="staf@insani.or.id"
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-red-500 font-medium">{createForm.errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-phone" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Nomor Telepon / WhatsApp (Opsional)
                                </Label>
                                <Input
                                    id="create-phone"
                                    value={createForm.data.phone}
                                    onChange={(e) => createForm.setData('phone', e.target.value)}
                                    placeholder="081234567890"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {createForm.errors.phone && (
                                    <p className="text-xs text-red-500 font-medium">{createForm.errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-role" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Peran / Hak Akses
                                </Label>
                                <Select
                                    value={createForm.data.role}
                                    onValueChange={(val) => createForm.setData('role', val)}
                                >
                                    <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800">
                                        <SelectValue placeholder="Pilih Peran Staf" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(internalRoles.length > 0 ? internalRoles : roles).map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.role && (
                                    <p className="text-xs text-red-500 font-medium">{createForm.errors.role}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-password" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Password
                                </Label>
                                <Input
                                    id="create-password"
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Kombinasi wajib: minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol (!@#$%^&*).
                                </p>
                                {createForm.errors.password && (
                                    <p className="text-xs text-red-500 font-medium">{createForm.errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-password_confirmation" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Konfirmasi Password
                                </Label>
                                <Input
                                    id="create-password_confirmation"
                                    type="password"
                                    value={createForm.data.password_confirmation}
                                    onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password"
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {createForm.errors.password_confirmation && (
                                    <p className="text-xs text-red-500 font-medium">{createForm.errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/40 p-3 text-xs text-blue-900 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                                💡 <span className="font-semibold">Catatan:</span> Form ini khusus untuk akun pengelola sistem internal. Pendaftaran Mitra Lembaga & Campaigner Individu diproses secara terpisah melalui portal verifikasi dokumen.
                            </div>
                        </div>

                        <DialogFooter className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-[#1A56DB] text-white hover:bg-[#1e40af]"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Staf'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Pengguna */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="overflow-hidden border-0 bg-white p-0 shadow-xl sm:max-w-[480px] dark:border dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader className="border-b border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Edit className="w-5 h-5 text-[#1A56DB]" />
                            Edit Data Pengguna
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Perbarui informasi akun, hak akses peran, dan status keaktifan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEdit}>
                        <div className="space-y-4 px-6 py-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-name" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {editForm.errors.name && (
                                    <p className="text-xs text-red-500 font-medium">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-email" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Email
                                </Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    required
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {editForm.errors.email && (
                                    <p className="text-xs text-red-500 font-medium">{editForm.errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-phone" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Nomor Telepon / WhatsApp
                                </Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                    placeholder="081234567890"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {editForm.errors.phone && (
                                    <p className="text-xs text-red-500 font-medium">{editForm.errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-role" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Peran / Hak Akses
                                </Label>
                                <Select
                                    value={editForm.data.role}
                                    onValueChange={(val) => editForm.setData('role', val)}
                                >
                                    <SelectTrigger className="border-gray-200 focus:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800">
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.role && (
                                    <p className="text-xs text-red-500 font-medium">{editForm.errors.role}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-gray-50/50 dark:bg-gray-800/40">
                                <div>
                                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        Status Keaktifan Akun
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Nonaktifkan jika user tidak diizinkan masuk ke sistem.
                                    </div>
                                </div>
                                <Switch
                                    checked={editForm.data.is_active}
                                    onCheckedChange={(val) => editForm.setData('is_active', val)}
                                    disabled={editingUser?.id === currentUserId}
                                />
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <Label htmlFor="edit-password" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Password Baru (Opsional)
                                </Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                    placeholder="Kosongkan jika tidak ingin mengubah password"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Jika diubah: minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol.
                                </p>
                                {editForm.errors.password && (
                                    <p className="text-xs text-red-500 font-medium">{editForm.errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-password_confirmation" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Konfirmasi Password Baru
                                </Label>
                                <Input
                                    id="edit-password_confirmation"
                                    type="password"
                                    value={editForm.data.password_confirmation}
                                    onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password baru"
                                    className="border-gray-200 focus-visible:ring-[#1A56DB] dark:border-gray-700 dark:bg-gray-800"
                                />
                                {editForm.errors.password_confirmation && (
                                    <p className="text-xs text-red-500 font-medium">{editForm.errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-[#1A56DB] text-white hover:bg-[#1e40af]"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Konfirmasi Hapus Pengguna */}
            <ConfirmDialog
                open={!!userToDelete}
                onOpenChange={(open) => !open && setUserToDelete(null)}
                title="Hapus Pengguna"
                description={`Apakah Anda yakin ingin menghapus akun pengguna "${userToDelete?.name}" (${userToDelete?.email})? Seluruh data hak akses akun ini akan dihapus dari sistem.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Pengguna',
            href: '/admin/users',
        },
    ],
};
