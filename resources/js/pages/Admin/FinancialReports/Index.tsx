import { Head, useForm, router } from '@inertiajs/react';
import { 
    Trash2, 
    Edit, 
    Plus, 
    Search, 
    FileText, 
    ExternalLink, 
    Download, 
    Eye, 
    CheckCircle2, 
    XCircle, 
    ShieldCheck, 
    Calendar,
    Wallet,
    TrendingUp,
    Users,
    FileSpreadsheet,
    Building2,
    Languages,
    SlidersHorizontal,
    Clock3,
    ChevronDown,
    ChevronUp,
    Save,
    MessageCircle,
    Info,
    Minus,
    Phone
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TranslationStatusCard from '@/components/admin/TranslationStatusCard';
import { autoTranslateFields } from '@/lib/translate';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const CATEGORY_OPTIONS = [
    { value: 'annual_report', label: 'Laporan Tahunan' },
    { value: 'audited_financial', label: 'Laporan Keuangan Audited' },
    { value: 'impact_report', label: 'Laporan Penyaluran & Dampak' },
    { value: 'interim', label: 'Laporan Triwulan / Semester' },
];

const formatRupiahInput = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined || val === '') return '';
    const digits = String(val).replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('id-ID').format(BigInt(digits));
};

export default function FinancialReportsIndex({ reports, availableYears = [], filters = {}, settings = {} }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<any>(null);
    const [reportToDelete, setReportToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState<'id' | 'en' | 'ar'>('id');

    // Panel Pengaturan Publikasi & Status Penyiapan
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [activeSettingLang, setActiveSettingLang] = useState<'id' | 'en' | 'ar'>('id');
    const [isTranslatingSettings, setIsTranslatingSettings] = useState(false);

    const [settingForm, setSettingForm] = useState({
        financial_report_notice_enabled: settings?.financial_report_notice_enabled ?? '1',
        financial_report_notice_year: settings?.financial_report_notice_year ?? String(new Date().getFullYear() - 1),
        financial_report_section_title: {
            id: settings?.financial_report_section_title?.id || 'Laporan Keuangan & Annual Report',
            en: settings?.financial_report_section_title?.en || '',
            ar: settings?.financial_report_section_title?.ar || '',
        },
        financial_report_notice_headline: {
            id: settings?.financial_report_notice_headline?.id || 'Laporan Keuangan Tahun Buku {year} Sedang Dalam Proses Finalisasi & Audit',
            en: settings?.financial_report_notice_headline?.en || '',
            ar: settings?.financial_report_notice_headline?.ar || '',
        },
        financial_report_notice_description: {
            id: settings?.financial_report_notice_description?.id || 'Sebagai wujud pertanggungjawaban amanah donatur dan kepatuhan terhadap standar akuntansi entitas nirlaba, laporan keuangan tahunan Insani Indonesia saat ini sedang dalam proses rekapitulasi akhir dan audit independen oleh Kantor Akuntan Publik (KAP). Seluruh berkas akan dipublikasikan secara terbuka setelah proses audit selesai.',
            en: settings?.financial_report_notice_description?.en || '',
            ar: settings?.financial_report_notice_description?.ar || '',
        },
        financial_report_wa_custom_text: {
            id: settings?.financial_report_wa_custom_text?.id || 'Hubungi Layanan Donatur via WhatsApp',
            en: settings?.financial_report_wa_custom_text?.en || '',
            ar: settings?.financial_report_wa_custom_text?.ar || '',
        },
        financial_report_notice_stage: settings?.financial_report_notice_stage ?? '2',
        financial_report_wa_number: settings?.financial_report_wa_number ?? '',
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const hasSettingId = Boolean(
        settingForm.financial_report_section_title.id &&
        settingForm.financial_report_notice_headline.id &&
        settingForm.financial_report_notice_description.id
    );
    const hasSettingEn = Boolean(
        settingForm.financial_report_section_title.en &&
        settingForm.financial_report_notice_headline.en &&
        settingForm.financial_report_notice_description.en
    );
    const hasSettingAr = Boolean(
        settingForm.financial_report_section_title.ar &&
        settingForm.financial_report_notice_headline.ar &&
        settingForm.financial_report_notice_description.ar
    );

    const handleAutoTranslateSettings = async () => {
        const titleId = settingForm.financial_report_section_title.id;
        const headlineId = settingForm.financial_report_notice_headline.id;
        const descId = settingForm.financial_report_notice_description.id;
        const waId = settingForm.financial_report_wa_custom_text.id;

        if (!titleId.trim() && !headlineId.trim() && !descId.trim()) {
            toast.error('Silakan isi teks Bahasa Indonesia terlebih dahulu sebelum menerjemahkan.');
            return;
        }

        setIsTranslatingSettings(true);
        try {
            const fieldsToTranslate: Record<string, string> = {};
            if (titleId.trim()) fieldsToTranslate.section_title = titleId;
            if (headlineId.trim()) fieldsToTranslate.notice_headline = headlineId;
            if (descId.trim()) fieldsToTranslate.notice_description = descId;
            if (waId.trim()) fieldsToTranslate.wa_custom_text = waId;

            const res = await autoTranslateFields(fieldsToTranslate);

            if (res) {
                setSettingForm((prev) => ({
                    ...prev,
                    financial_report_section_title: {
                        ...prev.financial_report_section_title,
                        en: res.section_title?.en || prev.financial_report_section_title.en,
                        ar: res.section_title?.ar || prev.financial_report_section_title.ar,
                    },
                    financial_report_notice_headline: {
                        ...prev.financial_report_notice_headline,
                        en: res.notice_headline?.en || prev.financial_report_notice_headline.en,
                        ar: res.notice_headline?.ar || prev.financial_report_notice_headline.ar,
                    },
                    financial_report_notice_description: {
                        ...prev.financial_report_notice_description,
                        en: res.notice_description?.en || prev.financial_report_notice_description.en,
                        ar: res.notice_description?.ar || prev.financial_report_notice_description.ar,
                    },
                    financial_report_wa_custom_text: {
                        ...prev.financial_report_wa_custom_text,
                        en: res.wa_custom_text?.en || prev.financial_report_wa_custom_text.en,
                        ar: res.wa_custom_text?.ar || prev.financial_report_wa_custom_text.ar,
                    },
                }));

                toast.success('Pengaturan berhasil diterjemahkan ke Bahasa Inggris dan Arab.');
            }
        } catch (error) {
            console.error('Translation error:', error);
            toast.error('Gagal menerjemahkan secara otomatis. Silakan coba lagi.');
        } finally {
            setIsTranslatingSettings(false);
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        router.post('/admin/financial-reports/settings', settingForm, {
            preserveScroll: true,
            onFinish: () => {
                setIsSavingSettings(false);
            },
        });
    };

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        _method: 'post',
        title: { id: '', en: '', ar: '' },
        report_year: new Date().getFullYear(),
        category: 'annual_report',
        audit_status: 'WTP (Wajar Tanpa Pengecualian)',
        auditor_name: '',
        file: null as File | null,
        cover_file: null as File | null,
        external_url: '',
        summary: { id: '', en: '', ar: '' },
        total_revenue: '' as string | number,
        total_disbursement: '' as string | number,
        beneficiaries_count: '' as string | number,
        is_active: true,
        sort_order: 0,
    });

    const handleRupiahChange = (field: 'total_revenue' | 'total_disbursement', rawValue: string) => {
        const digits = rawValue.replace(/\D/g, '');
        setData(field, digits ? formatRupiahInput(digits) : '');
    };

    const handleAutoTranslate = async () => {
        const sourceTitle = data.title.id;
        const sourceSummary = data.summary.id;

        if (!sourceTitle.trim() && !sourceSummary.trim()) {
            toast.error('Silakan isi Judul Laporan (ID) terlebih dahulu sebelum menerjemahkan.');
            return;
        }

        setIsTranslating(true);
        try {
            const fieldsToTranslate: Record<string, string> = {};
            if (sourceTitle.trim()) {
                fieldsToTranslate.title = sourceTitle.trim();
            }
            if (sourceSummary.trim()) {
                fieldsToTranslate.summary = sourceSummary.trim();
            }

            const res = await autoTranslateFields(fieldsToTranslate);

            if (res) {
                setData(prev => ({
                    ...prev,
                    title: {
                        id: prev.title.id,
                        en: res.title?.en || prev.title.en,
                        ar: res.title?.ar || prev.title.ar,
                    },
                    summary: {
                        id: prev.summary.id,
                        en: res.summary?.en || prev.summary.en,
                        ar: res.summary?.ar || prev.summary.ar,
                    },
                }));
                toast.success('Laporan keuangan berhasil diterjemahkan ke bahasa Inggris dan Arab.');
            }
        } catch (err) {
            toast.error('Gagal menerjemahkan secara otomatis. Silakan coba lagi.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleFilter = (params: { search?: string; year?: string; category?: string }) => {
        router.get(
            '/admin/financial-reports',
            {
                search: params.search !== undefined ? params.search : search,
                year: params.year !== undefined ? params.year : selectedYear,
                category: params.category !== undefined ? params.category : selectedCategory,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter({ search });
    };

    const openCreateModal = () => {
        reset();
        setData({
            _method: 'post',
            title: { id: '', en: '', ar: '' },
            report_year: new Date().getFullYear(),
            category: 'annual_report',
            audit_status: 'WTP (Wajar Tanpa Pengecualian)',
            auditor_name: '',
            file: null,
            cover_file: null,
            external_url: '',
            summary: { id: '', en: '', ar: '' },
            total_revenue: '',
            total_disbursement: '',
            beneficiaries_count: '',
            is_active: true,
            sort_order: (reports.data?.length || 0) + 1,
        });
        clearErrors();
        setActiveLangTab('id');
        setIsCreateModalOpen(true);
    };

    const openEditModal = (report: any) => {
        setEditingReport(report);
        setData({
            _method: 'put',
            title: { 
                id: report.title_translations?.id || report.title?.id || (typeof report.title === 'string' ? report.title : ''), 
                en: report.title_translations?.en || report.title?.en || '',
                ar: report.title_translations?.ar || report.title?.ar || '',
            },
            report_year: report.report_year || new Date().getFullYear(),
            category: report.category || 'annual_report',
            audit_status: report.audit_status || '',
            auditor_name: report.auditor_name || '',
            file: null,
            cover_file: null,
            external_url: report.external_url || '',
            summary: { 
                id: report.summary_translations?.id || report.summary?.id || (typeof report.summary === 'string' ? report.summary : ''), 
                en: report.summary_translations?.en || report.summary?.en || '',
                ar: report.summary_translations?.ar || report.summary?.ar || '',
            },
            total_revenue: report.total_revenue ? formatRupiahInput(report.total_revenue) : '',
            total_disbursement: report.total_disbursement ? formatRupiahInput(report.total_disbursement) : '',
            beneficiaries_count: report.beneficiaries_count ?? '',
            is_active: !!report.is_active,
            sort_order: report.sort_order ?? 0,
        });
        clearErrors();
        setActiveLangTab('id');
        setIsEditModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            total_revenue: data.total_revenue ? String(data.total_revenue).replace(/\./g, '') : '',
            total_disbursement: data.total_disbursement ? String(data.total_disbursement).replace(/\./g, '') : '',
        }));
        post('/admin/financial-reports', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReport) return;

        transform((data) => ({
            ...data,
            total_revenue: data.total_revenue ? String(data.total_revenue).replace(/\./g, '') : '',
            total_disbursement: data.total_disbursement ? String(data.total_disbursement).replace(/\./g, '') : '',
        }));
        post(`/admin/financial-reports/${editingReport.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!reportToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/financial-reports/${reportToDelete.id}`, {
            onSuccess: () => {
                setReportToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'annual_report':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Laporan Tahunan</span>;
            case 'audited_financial':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Laporan Audited</span>;
            case 'impact_report':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Laporan Dampak</span>;
            case 'interim':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Laporan Interim</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{cat}</span>;
        }
    };

    return (
        <>
            <Head title="Manajemen Laporan Keuangan & Annual Report" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Laporan Keuangan & Annual Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola arsip laporan tahunan, laporan keuangan audited, dan transparansi publik yayasan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
                            className={`rounded-xl shadow-2xs gap-2 transition-all ${
                                isSettingsPanelOpen 
                                    ? 'bg-insani-blue/10 border-insani-blue/40 text-insani-blue dark:bg-insani-blue/20' 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4 text-insani-blue" />
                            <span>Pengaturan Publikasi</span>
                            {isSettingsPanelOpen ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            )}
                        </Button>
                        <Button 
                            onClick={openCreateModal}
                            className="bg-insani-blue hover:bg-insani-blue/90 text-white rounded-xl shadow-xs gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Laporan
                        </Button>
                    </div>
                </div>

                {/* Panel Pengaturan Visibilitas Publik & Status Penyiapan */}
                {isSettingsPanelOpen && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/90 dark:border-gray-700/90 shadow-sm space-y-6">
                        {/* Header Panel */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700/70">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-insani-blue/10 text-insani-blue dark:bg-insani-blue/20">
                                    <SlidersHorizontal className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                        Pengaturan Visibilitas & Pesan Publik (Halaman Tentang Kami)
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Kontrol kemunculan status penyiapan laporan keuangan pada seksi #laporan-keuangan di halaman Tentang Kami.
                                    </p>
                                </div>
                            </div>

                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                settingForm.financial_report_notice_enabled === '1'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${settingForm.financial_report_notice_enabled === '1' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                {settingForm.financial_report_notice_enabled === '1' ? 'Pesan Publik: Aktif' : 'Pesan Publik: Nonaktif'}
                            </span>
                        </div>

                        {/* Konten 2 Kolom: Form (Kiri) dan Pratinjau (Kanan) */}
                        <form onSubmit={handleSaveSettings}>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Kolom Kiri: Form Controls */}
                                <div className="lg:col-span-7 space-y-4">
                                    {/* Panel Pengaturan Operasional Terpadu (Unified Operational Box) */}
                                    <div className="rounded-2xl bg-slate-50/70 dark:bg-gray-900/60 border border-slate-200/90 dark:border-gray-700/80 p-4 sm:p-5 space-y-4 transition-all">
                                        {/* Baris 1: Master Toggle Switch */}
                                        <div className="flex items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-gray-800">
                                            <div className="space-y-0.5 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="notice-toggle" className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer">
                                                        Tampilkan Pesan Penyiapan & Banner Publik
                                                    </Label>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        settingForm.financial_report_notice_enabled === '1'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                            : 'bg-slate-200/80 text-slate-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${settingForm.financial_report_notice_enabled === '1' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                        {settingForm.financial_report_notice_enabled === '1' ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    Tampilkan banner status audit berjalan dan pesan penyiapan pada seksi laporan keuangan publik.
                                                </p>
                                            </div>
                                            <Switch
                                                id="notice-toggle"
                                                checked={settingForm.financial_report_notice_enabled === '1'}
                                                onCheckedChange={(checked) => 
                                                    setSettingForm({ ...settingForm, financial_report_notice_enabled: checked ? '1' : '0' })
                                                }
                                                className="data-[state=checked]:bg-insani-blue shrink-0 cursor-pointer"
                                            />
                                        </div>

                                        {/* Baris 2: Grid 2-Kolom Berdampingan (Tahun Buku & WhatsApp Donatur) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            {/* Kolom 1: Tahun Buku Audit */}
                                            <div className="space-y-1.5 bg-white dark:bg-gray-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700/80 shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-insani-blue" />
                                                        <Label htmlFor="notice_year" className="text-xs font-bold text-gray-900 dark:text-white cursor-pointer">
                                                            Tahun Buku Audit
                                                        </Label>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium">Periode Acuan</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    Tahun acuan pada banner & redaksi
                                                </p>
                                                <div className="flex items-center pt-1">
                                                    <div className="flex items-center w-full bg-slate-50 dark:bg-gray-900/90 rounded-lg border border-slate-200/90 dark:border-gray-700 p-0.5 focus-within:ring-2 focus-within:ring-insani-blue/20 focus-within:border-insani-blue transition-all">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const current = parseInt(settingForm.financial_report_notice_year, 10) || (new Date().getFullYear() - 1);
                                                                setSettingForm({ ...settingForm, financial_report_notice_year: String(current - 1) });
                                                            }}
                                                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-insani-blue hover:bg-white dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
                                                            title="Kurangi 1 tahun"
                                                            aria-label="Kurangi tahun buku"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <Input
                                                            id="notice_year"
                                                            type="number"
                                                            value={settingForm.financial_report_notice_year}
                                                            onChange={(e) => setSettingForm({ ...settingForm, financial_report_notice_year: e.target.value })}
                                                            placeholder={String(new Date().getFullYear() - 1)}
                                                            className="flex-1 h-7 border-none text-center font-bold text-xs text-slate-800 dark:text-white bg-transparent shadow-none focus-visible:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const current = parseInt(settingForm.financial_report_notice_year, 10) || (new Date().getFullYear() - 1);
                                                                setSettingForm({ ...settingForm, financial_report_notice_year: String(current + 1) });
                                                            }}
                                                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-insani-blue hover:bg-white dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
                                                            title="Tambah 1 tahun"
                                                            aria-label="Tambah tahun buku"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Kolom 2: Nomor WhatsApp Layanan Donatur */}
                                            <div className="space-y-1.5 bg-white dark:bg-gray-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700/80 shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        <Label htmlFor="wa_number" className="text-xs font-bold text-gray-900 dark:text-white cursor-pointer">
                                                            WhatsApp Donatur
                                                        </Label>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium">Opsional</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    Nomor khusus atau default situs
                                                </p>
                                                <div className="pt-1">
                                                    <Input
                                                        id="wa_number"
                                                        type="text"
                                                        value={settingForm.financial_report_wa_number}
                                                        onChange={(e) => setSettingForm({ ...settingForm, financial_report_wa_number: e.target.value })}
                                                        placeholder="Contoh: 081234567890"
                                                        className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-gray-900/90 border-slate-200/90 dark:border-gray-700 shadow-none focus:ring-insani-blue/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Baris 3: Tahapan Progres Akuntabilitas Publik */}
                                        <div className="space-y-2.5 pt-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    <Label className="text-xs font-bold text-gray-900 dark:text-white">
                                                        Tahapan Progres Akuntabilitas Publik
                                                    </Label>
                                                </div>
                                                <span className="text-[11px] text-gray-400 hidden sm:inline">
                                                    Pilih fase yang sedang berlangsung
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                {/* Tahap 1 */}
                                                <button
                                                    type="button"
                                                    onClick={() => setSettingForm({ ...settingForm, financial_report_notice_stage: '1' })}
                                                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                                                        settingForm.financial_report_notice_stage === '1'
                                                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-insani-blue text-insani-blue shadow-2xs ring-1 ring-insani-blue/20'
                                                            : 'bg-white dark:bg-gray-800/80 border-slate-200/80 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                Tahap 1
                                                            </span>
                                                            {settingForm.financial_report_notice_stage === '1' && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-insani-blue shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                                            Rekonsiliasi & Tutup Buku
                                                        </p>
                                                    </div>
                                                    <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 dark:border-gray-700/50 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            Sedang Berjalan
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Tahap 2 */}
                                                <button
                                                    type="button"
                                                    onClick={() => setSettingForm({ ...settingForm, financial_report_notice_stage: '2' })}
                                                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                                                        settingForm.financial_report_notice_stage === '2'
                                                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500/20'
                                                            : 'bg-white dark:bg-gray-800/80 border-slate-200/80 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                Tahap 2 (Bawaan)
                                                            </span>
                                                            {settingForm.financial_report_notice_stage === '2' && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                                            Audit Independen KAP
                                                        </p>
                                                    </div>
                                                    <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 dark:border-gray-700/50 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                                            Tahap 1 Selesai • Berjalan
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Tahap 3 */}
                                                <button
                                                    type="button"
                                                    onClick={() => setSettingForm({ ...settingForm, financial_report_notice_stage: '3' })}
                                                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                                                        settingForm.financial_report_notice_stage === '3'
                                                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-insani-blue text-insani-blue shadow-2xs ring-1 ring-insani-blue/20'
                                                            : 'bg-white dark:bg-gray-800/80 border-slate-200/80 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                Tahap 3
                                                            </span>
                                                            {settingForm.financial_report_notice_stage === '3' && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-insani-blue shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                                            Pengesahan & Publikasi
                                                        </p>
                                                    </div>
                                                    <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 dark:border-gray-700/50 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        <span className="text-[10px] text-insani-blue dark:text-blue-400 font-semibold">
                                                            Tahap 1 & 2 Selesai • Final
                                                        </span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seksi Redaksi Konten Multi-Bahasa */}
                                    <div className="pt-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                    Redaksi Konten Publik
                                                </h3>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    Sesuaikan teks judul, penjelasan, dan tombol sesuai bahasa
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-gray-900 rounded-xl self-start sm:self-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSettingLang('id')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                        activeSettingLang === 'id'
                                                            ? 'bg-white dark:bg-gray-800 text-insani-blue shadow-xs font-bold'
                                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    <span>🇮🇩</span> Indonesia
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSettingLang('en')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                        activeSettingLang === 'en'
                                                            ? 'bg-white dark:bg-gray-800 text-insani-blue shadow-xs font-bold'
                                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    <span>🇬🇧</span> English
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSettingLang('ar')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                        activeSettingLang === 'ar'
                                                            ? 'bg-white dark:bg-gray-800 text-insani-blue shadow-xs font-bold'
                                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    <span>🇸🇦</span> العربية
                                                </button>
                                            </div>

                                            <span className="text-[11px] text-gray-400">
                                                Edit: <span className="font-bold text-gray-700 dark:text-gray-300 uppercase">{activeSettingLang}</span>
                                            </span>
                                        </div>

                                        {/* Field Redaksi berdasarkan Bahasa Aktif */}
                                        <div className="space-y-4">
                                            {/* Judul Utama Seksi */}
                                            <div>
                                                <Label htmlFor={`section_title_${activeSettingLang}`} className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                                                    Judul Utama Seksi ({activeSettingLang.toUpperCase()})
                                                </Label>
                                                <Input
                                                    id={`section_title_${activeSettingLang}`}
                                                    type="text"
                                                    dir={activeSettingLang === 'ar' ? 'rtl' : 'ltr'}
                                                    value={settingForm.financial_report_section_title[activeSettingLang] || ''}
                                                    onChange={(e) => setSettingForm({
                                                        ...settingForm,
                                                        financial_report_section_title: {
                                                            ...settingForm.financial_report_section_title,
                                                            [activeSettingLang]: e.target.value,
                                                        },
                                                    })}
                                                    placeholder={
                                                        activeSettingLang === 'id' ? 'Laporan Keuangan & Annual Report' :
                                                        activeSettingLang === 'en' ? 'Financial Reports & Annual Report' :
                                                        'التقارير المالية والتقرير السنوي'
                                                    }
                                                    className="text-sm rounded-xl bg-white dark:bg-gray-900"
                                                />
                                            </div>

                                            {/* Sub-judul Status Penyiapan */}
                                            <div>
                                                <Label htmlFor={`notice_headline_${activeSettingLang}`} className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                                                    Sub-judul Status Penyiapan ({activeSettingLang.toUpperCase()})
                                                </Label>
                                                <Input
                                                    id={`notice_headline_${activeSettingLang}`}
                                                    type="text"
                                                    dir={activeSettingLang === 'ar' ? 'rtl' : 'ltr'}
                                                    value={settingForm.financial_report_notice_headline[activeSettingLang] || ''}
                                                    onChange={(e) => setSettingForm({
                                                        ...settingForm,
                                                        financial_report_notice_headline: {
                                                            ...settingForm.financial_report_notice_headline,
                                                            [activeSettingLang]: e.target.value,
                                                        },
                                                    })}
                                                    placeholder={
                                                        activeSettingLang === 'id' ? 'Laporan Keuangan Tahun Buku {year} Sedang Dalam Proses Finalisasi & Audit' :
                                                        activeSettingLang === 'en' ? 'Fiscal Year {year} Financial Report is Currently Under Finalization & Audit' :
                                                        'التقرير المالي للسنة المالية {year} قيد المراجعة والتدقيق حالياً'
                                                    }
                                                    className="text-sm rounded-xl bg-white dark:bg-gray-900"
                                                />
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    Gunakan tag <code>{'{year}'}</code> untuk menyisipkan Tahun Buku Audit secara dinamis.
                                                </p>
                                            </div>

                                            {/* Deskripsi Baku */}
                                            <div>
                                                <Label htmlFor={`notice_desc_${activeSettingLang}`} className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                                                    Deskripsi Baku / Keterangan Akuntabilitas Publik ({activeSettingLang.toUpperCase()})
                                                </Label>
                                                <Textarea
                                                    id={`notice_desc_${activeSettingLang}`}
                                                    rows={4}
                                                    dir={activeSettingLang === 'ar' ? 'rtl' : 'ltr'}
                                                    value={settingForm.financial_report_notice_description[activeSettingLang] || ''}
                                                    onChange={(e) => setSettingForm({
                                                        ...settingForm,
                                                        financial_report_notice_description: {
                                                            ...settingForm.financial_report_notice_description,
                                                            [activeSettingLang]: e.target.value,
                                                        },
                                                    })}
                                                    placeholder={
                                                        activeSettingLang === 'id' ? 'Sebagai wujud pertanggungjawaban amanah donatur...' :
                                                        activeSettingLang === 'en' ? 'As a commitment to donor accountability and nonprofit governance...' :
                                                        'كجزء من التزامنا بمساءلة المتبرعين ومعايير الحوكمة...'
                                                    }
                                                    className="text-xs sm:text-sm rounded-xl leading-relaxed bg-white dark:bg-gray-900"
                                                />
                                            </div>

                                            {/* Teks Tombol WhatsApp */}
                                            <div>
                                                <Label htmlFor={`wa_custom_text_${activeSettingLang}`} className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                                                    Teks Tombol WhatsApp Donatur ({activeSettingLang.toUpperCase()})
                                                </Label>
                                                <Input
                                                    id={`wa_custom_text_${activeSettingLang}`}
                                                    type="text"
                                                    dir={activeSettingLang === 'ar' ? 'rtl' : 'ltr'}
                                                    value={settingForm.financial_report_wa_custom_text[activeSettingLang] || ''}
                                                    onChange={(e) => setSettingForm({
                                                        ...settingForm,
                                                        financial_report_wa_custom_text: {
                                                            ...settingForm.financial_report_wa_custom_text,
                                                            [activeSettingLang]: e.target.value,
                                                        },
                                                    })}
                                                    placeholder={
                                                        activeSettingLang === 'id' ? 'Hubungi Layanan Donatur via WhatsApp' :
                                                        activeSettingLang === 'en' ? 'Contact Donor Support via WhatsApp' :
                                                        'تواصل مع خدمة المتبرعين عبر واتساب'
                                                    }
                                                    className="text-sm rounded-xl bg-white dark:bg-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Kolom Kanan: Status Terjemahan & Pratinjau Langsung */}
                                <div className="lg:col-span-5 space-y-4">
                                    {/* Kartu Status Terjemahan AI */}
                                    <TranslationStatusCard
                                        hasId={hasSettingId}
                                        hasEn={hasSettingEn}
                                        hasAr={hasSettingAr}
                                        onTranslate={handleAutoTranslateSettings}
                                        isTranslating={isTranslatingSettings}
                                        activeLocale={activeSettingLang}
                                        onLocaleChange={(lang) => setActiveSettingLang(lang)}
                                        compact
                                        description="Terjemahkan judul dan pesan status penyiapan laporan ke bahasa Inggris dan Arab secara otomatis menggunakan AI."
                                    />

                                    {/* Pratinjau Langsung (Live Preview) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5 text-insani-blue" />
                                                Pratinjau Halaman ({activeSettingLang.toUpperCase()})
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                /tentang-kami#laporan-keuangan
                                            </span>
                                        </div>

                                        <div 
                                            dir={activeSettingLang === 'ar' ? 'rtl' : 'ltr'}
                                            className="bg-slate-50 dark:bg-gray-900/80 p-5 rounded-2xl border border-slate-200/80 dark:border-gray-800 space-y-4 text-left"
                                        >
                                            {/* Simulasi Header Seksi */}
                                            <div className="text-center space-y-1 pb-3 border-b border-slate-200/60 dark:border-gray-800">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                                                    {activeSettingLang === 'en' ? 'Public Transparency & Accountability' : activeSettingLang === 'ar' ? 'الشفافية والمساءلة العامة' : 'Transparansi & Akuntabilitas Publik'}
                                                </span>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {settingForm.financial_report_section_title[activeSettingLang] || settingForm.financial_report_section_title.id || 'Laporan Keuangan & Annual Report'}
                                                </h4>
                                            </div>

                                            {/* Kartu Status Simulasi */}
                                            {settingForm.financial_report_notice_enabled === '1' ? (
                                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-2xs space-y-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mb-1">
                                                                <Clock3 className="w-3 h-3" />
                                                                {activeSettingLang === 'en' ? 'Active Audit Period' : activeSettingLang === 'ar' ? 'فترة التدقيق الجارية' : 'Periode Audit Berjalan'}
                                                            </div>
                                                            <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                                                                {(settingForm.financial_report_notice_headline[activeSettingLang] || settingForm.financial_report_notice_headline.id || 'Laporan Keuangan Tahun Buku {year} Sedang Disiapkan').replace('{year}', settingForm.financial_report_notice_year || String(new Date().getFullYear() - 1))}
                                                            </h5>
                                                        </div>
                                                    </div>

                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        {settingForm.financial_report_notice_description[activeSettingLang] || settingForm.financial_report_notice_description.id || 'Laporan keuangan sedang dalam proses penyiapan dan audit independen oleh Kantor Akuntan Publik.'}
                                                    </p>

                                                    {/* Mini Steps */}
                                                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                                                        {/* Step 1 */}
                                                        <div className={`p-1.5 rounded-lg border text-center transition-all ${
                                                            settingForm.financial_report_notice_stage === '1'
                                                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                                                                : 'bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-800'
                                                        }`}>
                                                            <span className={`font-bold block ${
                                                                settingForm.financial_report_notice_stage === '1'
                                                                    ? 'text-emerald-900 dark:text-emerald-300'
                                                                    : 'text-slate-800 dark:text-slate-200'
                                                            }`}>
                                                                {activeSettingLang === 'en' ? '1. Closing' : activeSettingLang === 'ar' ? '١. الإغلاق' : '1. Tutup Buku'}
                                                            </span>
                                                            <span className="text-[9px] text-emerald-600 font-semibold">
                                                                {settingForm.financial_report_notice_stage === '1'
                                                                    ? (activeSettingLang === 'en' ? 'In Progress ⏳' : activeSettingLang === 'ar' ? 'جارٍ ⏳' : 'Berjalan ⏳')
                                                                    : (activeSettingLang === 'en' ? 'Done ✓' : activeSettingLang === 'ar' ? 'مكتمل ✓' : 'Selesai ✓')}
                                                            </span>
                                                        </div>

                                                        {/* Step 2 */}
                                                        <div className={`p-1.5 rounded-lg border text-center transition-all ${
                                                            settingForm.financial_report_notice_stage === '2'
                                                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                                                                : 'bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-800'
                                                        }`}>
                                                            <span className={`font-bold block ${
                                                                settingForm.financial_report_notice_stage === '2'
                                                                    ? 'text-emerald-900 dark:text-emerald-300'
                                                                    : 'text-slate-800 dark:text-slate-200'
                                                            }`}>
                                                                {activeSettingLang === 'en' ? '2. Audit' : activeSettingLang === 'ar' ? '٢. التدقيق' : '2. Audit KAP'}
                                                            </span>
                                                            <span className={`text-[9px] font-semibold ${
                                                                settingForm.financial_report_notice_stage === '1'
                                                                    ? 'text-slate-400'
                                                                    : 'text-emerald-700 dark:text-emerald-400'
                                                            }`}>
                                                                {settingForm.financial_report_notice_stage === '1'
                                                                    ? (activeSettingLang === 'en' ? 'Next' : activeSettingLang === 'ar' ? 'التالي' : 'Berikutnya')
                                                                    : settingForm.financial_report_notice_stage === '2'
                                                                    ? (activeSettingLang === 'en' ? 'In Progress ⏳' : activeSettingLang === 'ar' ? 'جارٍ ⏳' : 'Berjalan ⏳')
                                                                    : (activeSettingLang === 'en' ? 'Done ✓' : activeSettingLang === 'ar' ? 'مكتمل ✓' : 'Selesai ✓')}
                                                            </span>
                                                        </div>

                                                        {/* Step 3 */}
                                                        <div className={`p-1.5 rounded-lg border text-center transition-all ${
                                                            settingForm.financial_report_notice_stage === '3'
                                                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                                                                : 'bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-800'
                                                        }`}>
                                                            <span className={`font-bold block ${
                                                                settingForm.financial_report_notice_stage === '3'
                                                                    ? 'text-emerald-900 dark:text-emerald-300'
                                                                    : 'text-slate-800 dark:text-slate-200'
                                                            }`}>
                                                                {activeSettingLang === 'en' ? '3. Release' : activeSettingLang === 'ar' ? '٣. النشر' : '3. Publikasi'}
                                                            </span>
                                                            <span className={`text-[9px] font-semibold ${
                                                                settingForm.financial_report_notice_stage === '3'
                                                                    ? 'text-emerald-700 dark:text-emerald-400'
                                                                    : 'text-slate-400'
                                                            }`}>
                                                                {settingForm.financial_report_notice_stage === '3'
                                                                    ? (activeSettingLang === 'en' ? 'In Progress ⏳' : activeSettingLang === 'ar' ? 'جارٍ ⏳' : 'Berjalan ⏳')
                                                                    : (activeSettingLang === 'en' ? 'Next' : activeSettingLang === 'ar' ? 'التالي' : 'Berikutnya')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Simulasi Tombol WA */}
                                                    <div className="pt-2 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between gap-2">
                                                        <span className="text-[10px] text-slate-400 truncate">
                                                            {settingForm.financial_report_wa_number ? `Ke: ${settingForm.financial_report_wa_number}` : 'Ke: Hotline Resmi Yayasan'}
                                                        </span>
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-600 text-white shadow-2xs shrink-0">
                                                            <MessageCircle className="w-3 h-3" />
                                                            <span>{settingForm.financial_report_wa_custom_text[activeSettingLang] || settingForm.financial_report_wa_custom_text.id || 'Hubungi Layanan Donatur'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-gray-400 dark:text-gray-500 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                    <Info className="w-6 h-6 mx-auto mb-1.5 opacity-60" />
                                                    <p className="text-xs font-semibold">Pesan publik dinonaktifkan.</p>
                                                    <p className="text-[11px] mt-0.5">Seksi laporan keuangan hanya akan tampil jika ada berkas yang diunggah.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bilah Aksi Bawah Terpadu (Full-width Card Footer) */}
                            <div className="pt-5 mt-6 border-t border-slate-100 dark:border-gray-700/80 flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsSettingsPanelOpen(false)}
                                    className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-gray-800"
                                >
                                    Tutup Panel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSavingSettings}
                                    className="bg-insani-blue hover:bg-insani-blue/90 text-white rounded-xl shadow-xs gap-2 text-xs font-semibold px-5 h-9"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96 flex">
                        <Input
                            type="text"
                            placeholder="Cari judul, auditor, status audit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 rounded-xl text-sm w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-900"
                        />
                        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Year Filter */}
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                handleFilter({ year: e.target.value });
                            }}
                            className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-insani-blue/20"
                        >
                            <option value="">Semua Tahun</option>
                            {availableYears.map((yr: number) => (
                                <option key={yr} value={yr}>{yr}</option>
                            ))}
                        </select>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                handleFilter({ category: e.target.value });
                            }}
                            className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-insani-blue/20"
                        >
                            <option value="">Semua Kategori</option>
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800">
                                <TableHead className="w-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Sampul</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tahun & Kategori</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Judul Laporan</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Opini & Auditor</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Penerimaan / Penyaluran</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">Dokumen Laporan</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Unduhan</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableHead>
                                <TableHead className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-56 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto py-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">Belum ada dokumen laporan keuangan yang diunggah.</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {settingForm.financial_report_notice_enabled === '1'
                                                        ? 'Status Tampilan Publik: Pesan penyiapan & transparansi audit saat ini AKTIF di halaman Tentang Kami.'
                                                        : 'Status Tampilan Publik: Seksi laporan keuangan saat ini DISEMBUNYIKAN di halaman Tentang Kami.'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Button 
                                                    size="sm"
                                                    onClick={openCreateModal}
                                                    className="bg-insani-blue hover:bg-insani-blue/90 text-white rounded-xl shadow-xs gap-1.5 text-xs font-semibold"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Tambah Laporan
                                                </Button>
                                                <Button 
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setIsSettingsPanelOpen(true)}
                                                    className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold gap-1.5"
                                                >
                                                    <SlidersHorizontal className="w-3.5 h-3.5 text-insani-blue" />
                                                    Atur Pesan Publikasi
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.data.map((report: any) => {
                                    const title = report.title_translations?.id || report.title?.id || report.title;
                                    const titleEn = report.title_translations?.en || report.title?.en;

                                    return (
                                        <TableRow key={report.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-800 transition-colors">
                                            {/* Sampul */}
                                            <TableCell className="text-center">
                                                {report.cover_url ? (
                                                    <img 
                                                        src={report.cover_url} 
                                                        alt={title} 
                                                        className="w-10 h-14 object-cover rounded shadow-xs border border-gray-200 dark:border-gray-700 mx-auto"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 rounded flex flex-col items-center justify-center mx-auto text-gray-400 dark:text-gray-500">
                                                        <FileText className="w-5 h-5 text-insani-blue/60" />
                                                        <span className="text-[8px] font-bold mt-0.5">{report.report_year}</span>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Tahun & Kategori */}
                                            <TableCell>
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {report.report_year}
                                                </div>
                                                <div className="mt-1">
                                                    {getCategoryBadge(report.category)}
                                                </div>
                                            </TableCell>

                                            {/* Judul Laporan */}
                                            <TableCell className="max-w-xs">
                                                <div className="font-semibold text-gray-900 dark:text-white line-clamp-2" title={title}>
                                                    {title}
                                                </div>
                                                {titleEn && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 italic line-clamp-1 mt-0.5">
                                                        {titleEn}
                                                    </div>
                                                )}
                                                {/* Language readiness badges */}
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        ID ✓
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                                        report.title_translations?.en || report.title?.en
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                    }`}>
                                                        EN {report.title_translations?.en || report.title?.en ? '✓' : '—'}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                                        report.title_translations?.ar || report.title?.ar
                                                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                    }`}>
                                                        AR {report.title_translations?.ar || report.title?.ar ? '✓' : '—'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Opini & Auditor */}
                                            <TableCell>
                                                {report.audit_status ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        {report.audit_status}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                                                )}
                                                {report.auditor_name && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                                                        {report.auditor_name}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Finansial */}
                                            <TableCell className="text-xs">
                                                {report.formatted_revenue ? (
                                                    <div className="text-gray-700 dark:text-gray-300">
                                                        <span className="text-gray-400 dark:text-gray-500">Masuk:</span> {report.formatted_revenue}
                                                    </div>
                                                ) : null}
                                                {report.formatted_disbursement ? (
                                                    <div className="text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                                                        <span className="text-gray-400 dark:text-gray-500">Salur:</span> {report.formatted_disbursement}
                                                    </div>
                                                ) : null}
                                                {!report.formatted_revenue && !report.formatted_disbursement && (
                                                    <span className="text-gray-400 dark:text-gray-500">-</span>
                                                )}
                                            </TableCell>

                                            {/* Dokumen Laporan */}
                                            <TableCell>
                                                {report.file_url ? (
                                                    <a
                                                        href={report.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 transition-colors shadow-2xs group"
                                                        title="Buka dokumen PDF di tab baru"
                                                    >
                                                        <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                                        <span>Berkas PDF</span>
                                                        {report.formatted_file_size && (
                                                            <span className="text-[10px] text-rose-500/80 dark:text-rose-400/80 font-normal">
                                                                • {report.formatted_file_size}
                                                            </span>
                                                        )}
                                                    </a>
                                                ) : report.external_url ? (
                                                    <a 
                                                        href={report.external_url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40 transition-colors shadow-2xs group"
                                                        title={report.external_url}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                        <span>Tautan Dokumen</span>
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                                                        Belum Ada Dokumen
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Unduhan */}
                                            <TableCell className="text-center font-mono text-xs text-gray-600 dark:text-gray-400">
                                                {report.download_count || 0}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                {report.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                                        <XCircle className="w-3 h-3 text-gray-400" />
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Aksi */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {report.view_url && (
                                                        <a
                                                            href={report.view_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 text-gray-500 hover:text-insani-blue hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                            title="Pratinjau Laporan"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => openEditModal(report)}
                                                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                        title="Ubah Laporan"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setReportToDelete(report)}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                        title="Hapus Laporan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {reports.links && reports.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan {reports.from || 0} sampai {reports.to || 0} dari {reports.total || 0} laporan
                        </div>
                        <div className="flex items-center gap-1">
                            {reports.links.map((link: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url || link.active}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                        link.active 
                                            ? 'bg-insani-blue text-white font-medium' 
                                            : !link.url 
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah / Edit */}
            <Dialog 
                open={isCreateModalOpen || isEditModalOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateModalOpen(false);
                        setIsEditModalOpen(false);
                    }
                }}
            >
                <DialogContent className="w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                    <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <Building2 className="w-5 h-5 text-insani-blue" />
                                    <span>{isCreateModalOpen ? 'Tambah Laporan Keuangan Baru' : 'Perbarui Laporan Keuangan'}</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Isi detail informasi dokumen tahunan dan berkas laporan pertanggungjawaban publik.
                                </DialogDescription>
                            </div>

                            {/* Tab Bahasa Toggle */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setActiveLangTab('id')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                        activeLangTab === 'id' 
                                            ? 'bg-white dark:bg-slate-900 text-insani-blue shadow-xs font-bold' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Bahasa Indonesia 🇮🇩
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveLangTab('en')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                        activeLangTab === 'en' 
                                            ? 'bg-white dark:bg-slate-900 text-insani-blue shadow-xs font-bold' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    English 🇬🇧
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveLangTab('ar')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                        activeLangTab === 'ar' 
                                            ? 'bg-white dark:bg-slate-900 text-insani-blue shadow-xs font-bold' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    العربية 🇸🇦
                                </button>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={isCreateModalOpen ? submitCreate : submitEdit} className="space-y-6 pt-2">
                        {/* Translation Status Card */}
                        <TranslationStatusCard
                            hasId={Boolean(data.title.id)}
                            hasEn={Boolean(data.title.en)}
                            hasAr={Boolean(data.title.ar)}
                            onTranslate={handleAutoTranslate}
                            isTranslating={isTranslating}
                            compact
                            description="Terjemahkan judul dan ringkasan eksekutif laporan keuangan ke bahasa Inggris dan Arab secara otomatis."
                        />

                        {/* Judul Laporan */}
                        {activeLangTab === 'id' ? (
                            <div>
                                <Label htmlFor="title_id" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Judul Laporan (ID) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title_id"
                                    value={data.title.id}
                                    onChange={(e) => setData('title', { ...data.title, id: e.target.value })}
                                    placeholder="Contoh: Laporan Tahunan & Akuntabilitas Yayasan 2024"
                                    className="mt-1.5 h-10 text-sm"
                                    required
                                />
                                {errors['title.id'] && <p className="text-xs text-red-500 mt-1">{errors['title.id']}</p>}
                            </div>
                        ) : activeLangTab === 'en' ? (
                            <div>
                                <Label htmlFor="title_en" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Judul Laporan (EN)
                                </Label>
                                <Input
                                    id="title_en"
                                    value={data.title.en}
                                    onChange={(e) => setData('title', { ...data.title, en: e.target.value })}
                                    placeholder="e.g. Annual & Accountability Report 2024"
                                    className="mt-1.5 h-10 text-sm"
                                />
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="title_ar" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Judul Laporan (AR - العربية)
                                </Label>
                                <Input
                                    id="title_ar"
                                    dir="rtl"
                                    value={data.title.ar}
                                    onChange={(e) => setData('title', { ...data.title, ar: e.target.value })}
                                    placeholder="مثال: التقرير السنوي والمساءلة لمؤسسة إنساني 2024"
                                    className="mt-1.5 h-10 text-sm"
                                />
                            </div>
                        )}

                        {/* Grid Baris: Tahun, Kategori, Status Audit, KAP */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="report_year" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Tahun Buku <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="report_year"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={data.report_year}
                                    onChange={(e) => setData('report_year', parseInt(e.target.value) || new Date().getFullYear())}
                                    className="mt-1.5 h-10 text-sm"
                                />
                                {errors.report_year && <p className="text-xs text-red-500 mt-1">{errors.report_year}</p>}
                            </div>

                            <div>
                                <Label htmlFor="category" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Kategori Laporan <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="mt-1.5 h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-insani-blue/20"
                                >
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="audit_status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Status Opini Audit
                                </Label>
                                <Input
                                    id="audit_status"
                                    value={data.audit_status}
                                    onChange={(e) => setData('audit_status', e.target.value)}
                                    placeholder="e.g. WTP / Proses Audit"
                                    className="mt-1.5 h-10 text-sm"
                                />
                            </div>

                            <div>
                                <Label htmlFor="auditor_name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title="Nama Kantor Akuntan Publik (KAP)">
                                    Kantor Akuntan Publik (KAP)
                                </Label>
                                <Input
                                    id="auditor_name"
                                    value={data.auditor_name}
                                    onChange={(e) => setData('auditor_name', e.target.value)}
                                    placeholder="e.g. KAP Heliantono & Rekan"
                                    className="mt-1.5 h-10 text-sm"
                                />
                            </div>
                        </div>

                        {/* Ringkasan Eksekutif */}
                        {activeLangTab === 'id' ? (
                            <div>
                                <Label htmlFor="summary_id" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Ringkasan Laporan / Kata Pengantar Pengurus (ID)
                                </Label>
                                <Textarea
                                    id="summary_id"
                                    rows={3}
                                    value={data.summary.id}
                                    onChange={(e) => setData('summary', { ...data.summary, id: e.target.value })}
                                    placeholder="Tuliskan ringkasan singkat pencapaian atau kata pengantar pengurus yayasan..."
                                    className="mt-1.5 text-sm"
                                />
                            </div>
                        ) : activeLangTab === 'en' ? (
                            <div>
                                <Label htmlFor="summary_en" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Executive Summary / Foreword (EN)
                                </Label>
                                <Textarea
                                    id="summary_en"
                                    rows={3}
                                    value={data.summary.en}
                                    onChange={(e) => setData('summary', { ...data.summary, en: e.target.value })}
                                    placeholder="Brief summary of achievements or executive foreword..."
                                    className="mt-1.5 text-sm"
                                />
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="summary_ar" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Ringkasan Laporan / Kata Pengantar (AR - العربية)
                                </Label>
                                <Textarea
                                    id="summary_ar"
                                    dir="rtl"
                                    rows={3}
                                    value={data.summary.ar}
                                    onChange={(e) => setData('summary', { ...data.summary, ar: e.target.value })}
                                    placeholder="ملخص موجز للإنجازات أو كلمة تمهيدية لإدارة المؤسسة..."
                                    className="mt-1.5 text-sm"
                                />
                            </div>
                        )}

                        {/* Sorotan Angka Finansial (Opsional) */}
                        <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4 text-insani-blue" />
                                    Sorotan Angka Utama (Opsional untuk Ringkasan Cepat)
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Tampil di kartu ringkasan publik
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="total_revenue" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Penghimpunan</Label>
                                    <div className="relative mt-1.5 rounded-lg shadow-2xs">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Rp</span>
                                        </div>
                                        <Input
                                            id="total_revenue"
                                            type="text"
                                            inputMode="numeric"
                                            value={data.total_revenue}
                                            onChange={(e) => handleRupiahChange('total_revenue', e.target.value)}
                                            placeholder="Contoh: 4.850.000.000"
                                            className="pl-9 h-10 text-sm bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    {errors.total_revenue && <p className="text-xs text-red-500 mt-1">{errors.total_revenue}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="total_disbursement" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Penyaluran</Label>
                                    <div className="relative mt-1.5 rounded-lg shadow-2xs">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Rp</span>
                                        </div>
                                        <Input
                                            id="total_disbursement"
                                            type="text"
                                            inputMode="numeric"
                                            value={data.total_disbursement}
                                            onChange={(e) => handleRupiahChange('total_disbursement', e.target.value)}
                                            placeholder="Contoh: 4.320.000.000"
                                            className="pl-9 h-10 text-sm bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    {errors.total_disbursement && <p className="text-xs text-red-500 mt-1">{errors.total_disbursement}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="beneficiaries_count" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Penerima Manfaat (Jiwa)</Label>
                                    <Input
                                        id="beneficiaries_count"
                                        type="number"
                                        min="0"
                                        value={data.beneficiaries_count}
                                        onChange={(e) => setData('beneficiaries_count', e.target.value)}
                                        placeholder="Contoh: 38500"
                                        className="mt-1.5 h-10 text-sm bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upload Berkas PDF & Sampul */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Berkas PDF */}
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 space-y-2">
                                <Label htmlFor="file" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Berkas PDF Dokumen Laporan</span>
                                    <span className="text-[11px] font-normal text-slate-500">Maks. 25MB</span>
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('file', e.target.files[0]);
                                        }
                                    }}
                                    className="mt-1.5 h-10 text-xs sm:text-sm cursor-pointer"
                                />
                                {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
                                {isEditModalOpen && editingReport?.file_path && (
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                        <span>Berkas saat ini:</span>
                                        <a href={editingReport.file_url} target="_blank" rel="noreferrer" className="text-insani-blue underline font-medium inline-flex items-center">
                                            Lihat Dokumen PDF <ExternalLink className="w-3 h-3 ml-0.5" />
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Cover Sampul Gambar */}
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 space-y-2">
                                <Label htmlFor="cover_file" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Gambar Sampul Buku</span>
                                    <span className="text-[11px] font-normal text-slate-500">JPG, PNG, WebP</span>
                                </Label>
                                <Input
                                    id="cover_file"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('cover_file', e.target.files[0]);
                                        }
                                    }}
                                    className="mt-1.5 h-10 text-xs sm:text-sm cursor-pointer"
                                />
                                {errors.cover_file && <p className="text-xs text-red-500 mt-1">{errors.cover_file}</p>}
                                {isEditModalOpen && editingReport?.cover_url && (
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                        <span>Sampul saat ini:</span>
                                        <a href={editingReport.cover_url} target="_blank" rel="noreferrer" className="text-insani-blue underline font-medium inline-flex items-center">
                                            Lihat Gambar Sampul <ExternalLink className="w-3 h-3 ml-0.5" />
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Tautan Dokumen Eksternal & Urutan */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <Label htmlFor="external_url" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Tautan Dokumen Eksternal (Opsional: Google Drive / Arsip Daring)
                                </Label>
                                <Input
                                    id="external_url"
                                    value={data.external_url}
                                    onChange={(e) => setData('external_url', e.target.value)}
                                    placeholder="https://drive.google.com/file/d/..."
                                    className="mt-1.5 h-10 text-sm"
                                />
                            </div>

                            <div>
                                <Label htmlFor="sort_order" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Urutan Tampil
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="mt-1.5 h-10 text-sm"
                                />
                            </div>
                        </div>

                        {/* Pengaturan Tambahan: Aktif */}
                        <div className="flex items-center justify-between pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-2.5">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    className="data-[state=checked]:bg-insani-blue data-[state=checked]:border-insani-blue"
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                                    Tampilkan laporan ke publik (Status Aktif)
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                }}
                                className="h-10 px-5 text-sm"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-insani-blue hover:bg-insani-blue/90 text-white h-10 px-6 text-sm font-semibold shadow-xs"
                            >
                                {processing ? 'Menyimpan...' : (isCreateModalOpen ? 'Simpan Laporan' : 'Perbarui Laporan')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Konfirmasi Hapus */}
            <ConfirmDialog
                open={!!reportToDelete}
                onOpenChange={(open) => !open && setReportToDelete(null)}
                title="Hapus Laporan Keuangan"
                description={`Apakah Anda yakin ingin menghapus laporan "${reportToDelete?.title_translations?.id || reportToDelete?.title?.id || reportToDelete?.title}"? Berkas fisik di storage juga akan dihapus secara permanen.`}
                variant="danger"
                loading={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}

FinancialReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan Keuangan',
            href: '/admin/financial-reports',
        },
    ],
};
