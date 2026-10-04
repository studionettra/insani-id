import React, { useState, useMemo } from 'react';
import { 
    Building2, 
    Upload, 
    Search, 
    Check, 
    X, 
    Image as ImageIcon,
    CheckCircle2,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface BankPreset {
    id: string;
    code: string;
    bankCode: string;
    name: string;
    type: 'syariah' | 'konvensional';
    src: string;
    keywords: string[];
}

export const BANK_PRESETS: BankPreset[] = [
    {
        id: 'bsi',
        code: 'MANUAL_BSI',
        bankCode: '451',
        name: 'Bank Syariah Indonesia (BSI)',
        type: 'syariah',
        src: 'images/banks/bsi.svg',
        keywords: ['bsi', 'syariah', 'islam', 'indonesia', 'hasanah'],
    },
    {
        id: 'mandiri',
        code: 'MANUAL_MANDIRI',
        bankCode: '008',
        name: 'Bank Mandiri',
        type: 'konvensional',
        src: 'images/banks/mandiri.svg',
        keywords: ['mandiri', 'bumn', 'livin', 'konvensional'],
    },
    {
        id: 'bri',
        code: 'MANUAL_BRI',
        bankCode: '002',
        name: 'Bank Rakyat Indonesia (BRI)',
        type: 'konvensional',
        src: 'images/banks/bri.svg',
        keywords: ['bri', 'rakyat', 'brimo', 'bumn'],
    },
    {
        id: 'bca',
        code: 'MANUAL_BCA',
        bankCode: '014',
        name: 'Bank Central Asia (BCA)',
        type: 'konvensional',
        src: 'images/banks/bca.svg',
        keywords: ['bca', 'central asia', 'klikbca', 'mybca', 'swasta'],
    },
    {
        id: 'bni',
        code: 'MANUAL_BNI',
        bankCode: '009',
        name: 'Bank Negara Indonesia (BNI)',
        type: 'konvensional',
        src: 'images/banks/bni.svg',
        keywords: ['bni', 'wondr', 'negara', 'bumn'],
    },
    {
        id: 'cimb',
        code: 'MANUAL_CIMB',
        bankCode: '022',
        name: 'CIMB Niaga',
        type: 'konvensional',
        src: 'images/banks/cimb.svg',
        keywords: ['cimb', 'niaga', 'octo'],
    },
    {
        id: 'permata',
        code: 'MANUAL_PERMATA',
        bankCode: '013',
        name: 'PermataBank',
        type: 'konvensional',
        src: 'images/banks/permata.svg',
        keywords: ['permata', 'permatabank', 'permata me'],
    },
    {
        id: 'danamon',
        code: 'MANUAL_DANAMON',
        bankCode: '011',
        name: 'Bank Danamon',
        type: 'konvensional',
        src: 'images/banks/danamon.svg',
        keywords: ['danamon', 'd-bank'],
    },
];

interface BankLogoPickerProps {
    presetValue: string | null;
    customFileValue: File | null;
    existingLogoUrl?: string | null;
    onSelectPreset: (preset: BankPreset) => void;
    onSelectCustomFile: (file: File | null) => void;
    onClear: () => void;
}

export default function BankLogoPicker({
    presetValue,
    customFileValue,
    existingLogoUrl,
    onSelectPreset,
    onSelectCustomFile,
    onClear,
}: BankLogoPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'syariah' | 'konvensional'>('all');
    const [tempCustomFile, setTempCustomFile] = useState<File | null>(null);
    const [tempCustomPreview, setTempCustomPreview] = useState<string | null>(null);

    // Filtered gallery presets
    const filteredPresets = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return BANK_PRESETS.filter((preset) => {
            const matchesType = typeFilter === 'all' || preset.type === typeFilter;
            if (!matchesType) return false;
            if (!query) return true;
            return (
                preset.name.toLowerCase().includes(query) ||
                preset.code.toLowerCase().includes(query) ||
                preset.bankCode.includes(query) ||
                preset.keywords.some((k) => k.toLowerCase().includes(query))
            );
        });
    }, [searchQuery, typeFilter]);

    // Active preview determination
    const activePreview = useMemo(() => {
        if (customFileValue) {
            return {
                type: 'file' as const,
                src: URL.createObjectURL(customFileValue),
                label: customFileValue.name,
                sourceBadge: 'Upload Kustom',
            };
        }
        if (presetValue) {
            const cleanPath = presetValue.startsWith('/') ? presetValue : `/${presetValue}`;
            const matched = BANK_PRESETS.find((p) => p.src === presetValue || `/${p.src}` === cleanPath);
            return {
                type: 'preset' as const,
                src: cleanPath,
                label: matched ? matched.name : 'Preset Resmi',
                sourceBadge: 'Galeri Resmi SVG',
            };
        }
        if (existingLogoUrl) {
            return {
                type: 'existing' as const,
                src: existingLogoUrl,
                label: 'Logo Tersimpan',
                sourceBadge: existingLogoUrl.includes('images/banks') ? 'Galeri Resmi' : 'Upload Kustom',
            };
        }
        return null;
    }, [presetValue, customFileValue, existingLogoUrl]);

    const handlePickPreset = (preset: BankPreset) => {
        onSelectPreset(preset);
        setIsOpen(false);
    };

    const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTempCustomFile(file);
            setTempCustomPreview(URL.createObjectURL(file));
        }
    };

    const handleApplyCustomFile = () => {
        if (tempCustomFile) {
            onSelectCustomFile(tempCustomFile);
            setIsOpen(false);
            setTempCustomFile(null);
            setTempCustomPreview(null);
        }
    };

    return (
        <div className="space-y-2">
            {/* Active Display / Trigger Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
                <div className="flex items-center gap-3 min-w-0">
                    {activePreview ? (
                        <div className="relative h-12 w-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                            <img
                                src={activePreview.src}
                                alt="Logo bank"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="h-12 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                    )}

                    <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white truncate block">
                                {activePreview ? activePreview.label : 'Belum Ada Logo Terpilih'}
                            </span>
                            {activePreview && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                    {activePreview.sourceBadge}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {activePreview 
                                ? 'Logo akan tampil di kartu transfer manual & struk donatur.' 
                                : 'Pilih dari galeri resmi atau upload logo manual.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOpen(true)}
                        className="text-xs h-8 gap-1.5 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800"
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>{activePreview ? 'Ganti Logo' : 'Pilih Logo Bank'}</span>
                    </Button>

                    {activePreview && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="text-xs h-8 px-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Hapus logo"
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Modal Dialog Dual-Mode */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl p-0 overflow-hidden border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                    <DialogHeader className="p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <DialogTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                            Pilih Logo Bank
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                            Pilih logo resmi dari galeri vektor SVG atau unggah file gambar logo khusus yayasan.
                        </DialogDescription>

                        {/* Mode Tab Switcher */}
                        <div className="flex items-center gap-2 pt-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('gallery')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'gallery'
                                        ? 'bg-brand-600 text-white shadow-2xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                Galeri Resmi (SVG)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'upload'
                                        ? 'bg-brand-600 text-white shadow-2xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                Upload Kustom
                            </button>
                        </div>
                    </DialogHeader>

                    {/* Tab 1: Galeri Resmi SVG */}
                    {activeTab === 'gallery' && (
                        <div className="p-5 space-y-4">
                            {/* Search & Filter Bar */}
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nama bank (BSI, Mandiri, BCA, BRI, dll)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 text-xs h-9 bg-gray-50/70 dark:bg-gray-800/60 dark:border-gray-700"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
                                    {(['all', 'syariah', 'konvensional'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setTypeFilter(type)}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                                typeFilter === type
                                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {type === 'all' ? 'Semua' : type === 'syariah' ? 'Syariah' : 'Konven'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Presets Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                                {filteredPresets.map((preset) => {
                                    const isSelected = presetValue === preset.src || presetValue === `/${preset.src}`;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => handlePickPreset(preset)}
                                            className={`relative p-3 rounded-xl border text-left flex flex-col items-center justify-between gap-2.5 transition-all group hover:scale-[1.02] cursor-pointer ${
                                                isSelected
                                                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/40 ring-2 ring-brand-500/20 shadow-xs'
                                                    : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/80 hover:border-brand-300 dark:hover:border-brand-700'
                                            }`}
                                        >
                                            {isSelected && (
                                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                </span>
                                            )}

                                            <div className="h-10 w-full flex items-center justify-center p-1">
                                                <img
                                                    src={`/${preset.src}`}
                                                    alt={preset.name}
                                                    className="max-h-full max-w-[80px] object-contain"
                                                />
                                            </div>

                                            <div className="w-full text-center space-y-0.5">
                                                <span className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-1 block">
                                                    {preset.name}
                                                </span>
                                                <span
                                                    className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                                        preset.type === 'syariah'
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                    }`}
                                                >
                                                    {preset.type === 'syariah' ? 'Syariah' : 'Konvensional'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                💡 <em>Memilih logo dari galeri resmi SVG akan otomatis mengisikan nama bank, tipe bank, dan kode bank pada form secara cerdas.</em>
                            </p>
                        </div>
                    )}

                    {/* Tab 2: Upload Kustom */}
                    {activeTab === 'upload' && (
                        <div className="p-5 space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center space-y-3 bg-gray-50/50 dark:bg-gray-800/30">
                                {tempCustomPreview ? (
                                    <div className="space-y-3">
                                        <div className="h-20 w-32 mx-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center shadow-xs">
                                            <img
                                                src={tempCustomPreview}
                                                alt="Preview upload"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-xs mx-auto">
                                                {tempCustomFile?.name}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                {tempCustomFile ? (tempCustomFile.size / 1024).toFixed(1) + ' KB' : ''}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 mx-auto flex items-center justify-center">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="custom-bank-logo-input"
                                                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                                            >
                                                Klik untuk browse file
                                            </label>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                PNG transparan, SVG, JPG, atau WebP (Maksimal 2MB)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <input
                                    id="custom-bank-logo-input"
                                    type="file"
                                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                    onChange={handleCustomFileChange}
                                    className="hidden"
                                />

                                {tempCustomPreview && (
                                    <div className="pt-2">
                                        <label
                                            htmlFor="custom-bank-logo-input"
                                            className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Ganti file lain
                                        </label>
                                    </div>
                                )}
                            </div>

                            {tempCustomFile && (
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={handleApplyCustomFile}
                                        className="gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs h-9"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Gunakan Logo Ini
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="text-xs"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
