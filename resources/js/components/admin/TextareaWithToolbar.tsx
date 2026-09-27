import React, { useRef, useState } from 'react';
import { Bold, List, ListOrdered, Edit3, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import FocusNarrativeRenderer from '@/components/public/FocusNarrativeRenderer';

interface TextareaWithToolbarProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    dir?: 'rtl' | 'ltr';
    className?: string;
    locale?: string;
    variant?: 'reality' | 'impact' | 'default';
    error?: string;
    helperText?: string;
}

export default function TextareaWithToolbar({
    id,
    value = '',
    onChange,
    placeholder,
    rows = 6,
    dir = 'ltr',
    className = '',
    locale = 'id',
    variant = 'default',
    error,
    helperText,
}: TextareaWithToolbarProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mode, setMode] = useState<'write' | 'preview'>('write');

    // Insert or wrap with markdown bold (**text**)
    const handleBold = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = textarea.value;
        const selected = currentText.substring(start, end);

        if (selected) {
            const newText = currentText.substring(0, start) + `**${selected}**` + currentText.substring(end);
            onChange(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 2, end + 2);
            }, 0);
        } else {
            const placeholderBold = 'teks tebal';
            const newText = currentText.substring(0, start) + `**${placeholderBold}**` + currentText.substring(end);
            onChange(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 2, start + 2 + placeholderBold.length);
            }, 0);
        }
    };

    // Insert bullet pointer (• ) at current line or selected lines
    const handleBulletList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = textarea.value;

        const lineStart = currentText.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = currentText.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? currentText.length : lineEnd;

        const lines = currentText.substring(lineStart, actualLineEnd).split('\n');
        const modifiedLines = lines.map((line) => {
            if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
                return line.replace(/^[•\-*]\s*/, '');
            }
            return `• ${line}`;
        });

        const replacement = modifiedLines.join('\n');
        const newText = currentText.substring(0, lineStart) + replacement + currentText.substring(actualLineEnd);
        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart + replacement.length);
        }, 0);
    };

    // Insert numbered pointer (1. ) at current line or selected lines
    const handleNumberedList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = textarea.value;

        const lineStart = currentText.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = currentText.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? currentText.length : lineEnd;

        const lines = currentText.substring(lineStart, actualLineEnd).split('\n');
        const modifiedLines = lines.map((line, idx) => {
            const clean = line.replace(/^(\d+[.)]|[•\-*])\s*/, '');
            return `${idx + 1}. ${clean}`;
        });

        const replacement = modifiedLines.join('\n');
        const newText = currentText.substring(0, lineStart) + replacement + currentText.substring(actualLineEnd);
        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart + replacement.length);
        }, 0);
    };

    return (
        <div className="space-y-1.5">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-[#1A56DB] focus-within:border-transparent transition-all">
                {/* Formatting Toolbar Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    {/* Action buttons (only active in write mode) */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={handleBold}
                            disabled={mode === 'preview'}
                            className="inline-flex items-center justify-center p-1.5 rounded hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors"
                            title="Tebal (Bold) - **teks**"
                        >
                            <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleBulletList}
                            disabled={mode === 'preview'}
                            className="inline-flex items-center justify-center p-1.5 rounded hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors"
                            title="Daftar Poin (Bullet List) - • Poin"
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleNumberedList}
                            disabled={mode === 'preview'}
                            className="inline-flex items-center justify-center p-1.5 rounded hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors"
                            title="Daftar Angka (Numbered List) - 1. Poin"
                        >
                            <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Mode switcher tabs: Tulis vs Pratinjau */}
                    <div className="flex items-center p-0.5 rounded-md bg-gray-200/70 dark:bg-gray-800 text-xs">
                        <button
                            type="button"
                            onClick={() => setMode('write')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                mode === 'write'
                                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Edit3 className="w-3 h-3" />
                            <span>Tulis</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('preview')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                mode === 'preview'
                                    ? 'bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Eye className="w-3 h-3" />
                            <span>Pratinjau</span>
                        </button>
                    </div>
                </div>

                {/* Content Area: Textarea or Live Preview */}
                {mode === 'write' ? (
                    <Textarea
                        ref={textareaRef}
                        id={id}
                        rows={rows}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        dir={dir}
                        className={`w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none bg-transparent dark:bg-transparent text-sm leading-relaxed p-3 ${className}`}
                    />
                ) : (
                    <div className="min-h-[160px] p-4 bg-slate-50/50 dark:bg-slate-900/40 text-sm overflow-y-auto max-h-[350px]">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/70 dark:border-gray-800">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A56DB] dark:text-blue-400">
                                Simulasi Tampilan Halaman Publik ({locale.toUpperCase()})
                            </span>
                            <span className="text-[10px] text-gray-400">
                                Ter-render dengan list semantik & hanging indent
                            </span>
                        </div>
                        {value && value.trim() ? (
                            <FocusNarrativeRenderer 
                                text={value} 
                                locale={locale} 
                                variant={variant}
                            />
                        ) : (
                            <p className="text-xs italic text-gray-400 py-6 text-center">
                                Belum ada naskah yang ditulis untuk dipratinjau.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Helper tips & error messages */}
            {helperText && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {helperText}
                </p>
            )}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
