import React from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageDropzoneProps {
    id: string;
    label: string;
    helperText?: string;
    accept?: string;
    previewUrl: string | null;
    currentStorageUrl?: string | null;
    onFileSelected: (file: File | null) => void;
    error?: string;
    darkPreview?: boolean;
    aspectRatio?: 'square' | 'wide' | 'auto';
    maxSizeText?: string;
}

export default function ImageDropzone({
    id,
    label,
    helperText,
    accept = 'image/png,image/jpeg,image/webp',
    previewUrl,
    currentStorageUrl,
    onFileSelected,
    error,
    darkPreview = false,
    aspectRatio = 'auto',
    maxSizeText = 'Maksimal 2 MB',
}: ImageDropzoneProps) {
    const activeUrl = previewUrl || (currentStorageUrl ? `/storage/${currentStorageUrl}` : null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFileSelected(file);
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor={id} className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {label}
                </Label>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                    {maxSizeText}
                </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-50/70 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700/80">
                {/* Preview Box */}
                <div className={`relative flex items-center justify-center rounded-lg border overflow-hidden shrink-0 transition-colors ${
                    darkPreview 
                        ? 'bg-slate-900 border-slate-800 text-white' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                } ${
                    aspectRatio === 'square' 
                        ? 'w-16 h-16' 
                        : aspectRatio === 'wide' 
                            ? 'w-32 h-16' 
                            : 'w-24 h-16 sm:w-28'
                }`}>
                    {activeUrl ? (
                        <img 
                            src={activeUrl} 
                            alt={label} 
                            className="w-full h-full object-contain p-1.5" 
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400">
                            <ImageIcon className="w-5 h-5 mb-0.5 opacity-60" />
                            <span className="text-[10px] leading-tight">Belum ada</span>
                        </div>
                    )}
                </div>

                {/* Upload action & info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <label 
                            htmlFor={id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 cursor-pointer shadow-2xs transition-colors"
                        >
                            <UploadCloud className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            <span>{activeUrl ? 'Ganti Berkas' : 'Pilih Berkas'}</span>
                        </label>

                        {previewUrl && (
                            <button
                                type="button"
                                onClick={() => onFileSelected(null)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            >
                                <X className="w-3 h-3" />
                                <span>Batalkan</span>
                            </button>
                        )}
                    </div>

                    <input 
                        id={id}
                        type="file" 
                        accept={accept} 
                        className="hidden" 
                        onChange={handleChange} 
                    />

                    {helperText && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                            {helperText}
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
            )}
        </div>
    );
}
