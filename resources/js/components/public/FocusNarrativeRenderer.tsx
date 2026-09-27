import React from 'react';

interface FocusNarrativeRendererProps {
    text: string | null | undefined;
    locale?: string;
    variant?: 'reality' | 'impact' | 'default';
    className?: string;
}

type Block = 
    | { type: 'paragraph'; content: string }
    | { type: 'bullet-list'; items: string[] }
    | { type: 'numbered-list'; items: { num: string; text: string }[] };

/**
 * Parses inline formatting like markdown bold (**bold**)
 * and automatically bolds titles before a colon (:) if not already formatted.
 */
function renderInlineText(text: string) {
    if (!text) return null;

    // 1. If markdown bold syntax (**text**) is present
    if (text.includes('**')) {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                return (
                    <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return <React.Fragment key={idx}>{part}</React.Fragment>;
        });
    }

    // 2. If it has a colon separator like "Title (123 Program): Description"
    const colonIdx = text.indexOf(':');
    if (colonIdx > 0 && colonIdx < 120) {
        const titlePart = text.slice(0, colonIdx);
        const bodyPart = text.slice(colonIdx + 1);
        return (
            <span>
                <strong className="font-semibold text-slate-800 dark:text-slate-100">
                    {titlePart}:
                </strong>
                {bodyPart}
            </span>
        );
    }

    return text;
}

/**
 * Smart Narrative Renderer:
 * Parses multiline text into paragraphs and semantic lists (<ul> / <ol>)
 * with hanging indentation, custom bullet dots, and clean typographic spacing.
 */
export default function FocusNarrativeRenderer({
    text,
    locale = 'id',
    variant = 'default',
    className = '',
}: FocusNarrativeRendererProps) {
    if (!text || !text.trim()) {
        return null;
    }

    const isRtl = locale === 'ar';
    const lines = text.split(/\r?\n/);
    const blocks: Block[] = [];
    let currentParagraph: string[] = [];
    let currentBullets: string[] = [];
    let currentNumbers: { num: string; text: string }[] = [];

    const flushParagraph = () => {
        if (currentParagraph.length > 0) {
            blocks.push({ type: 'paragraph', content: currentParagraph.join(' ') });
            currentParagraph = [];
        }
    };

    const flushBullets = () => {
        if (currentBullets.length > 0) {
            blocks.push({ type: 'bullet-list', items: [...currentBullets] });
            currentBullets = [];
        }
    };

    const flushNumbers = () => {
        if (currentNumbers.length > 0) {
            blocks.push({ type: 'numbered-list', items: [...currentNumbers] });
            currentNumbers = [];
        }
    };

    const flushAllLists = () => {
        flushBullets();
        flushNumbers();
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            // Empty line acts as paragraph / list separator
            flushParagraph();
            flushAllLists();
            continue;
        }

        // Check for bullet list (•, -, *)
        const bulletMatch = line.match(/^[•\-*]\s*(.+)$/);
        if (bulletMatch) {
            flushParagraph();
            flushNumbers();
            currentBullets.push(bulletMatch[1]);
            continue;
        }

        // Check for numbered list (1., 2., etc.)
        const numberMatch = line.match(/^(\d+)[.)]\s*(.+)$/);
        if (numberMatch) {
            flushParagraph();
            flushBullets();
            currentNumbers.push({ num: numberMatch[1], text: numberMatch[2] });
            continue;
        }

        // Regular line
        if (currentBullets.length > 0 || currentNumbers.length > 0) {
            flushAllLists();
        }
        currentParagraph.push(line);
    }

    // Flush any remaining blocks
    flushParagraph();
    flushAllLists();

    // Style configuration based on variant
    const bulletDotClass = variant === 'reality'
        ? 'bg-rose-500 dark:bg-rose-400'
        : variant === 'impact'
            ? 'bg-[#1A56DB] dark:bg-blue-400'
            : 'bg-brand-600 dark:bg-brand-400';

    const numberBadgeClass = variant === 'reality'
        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'
        : variant === 'impact'
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900'
            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

    return (
        <div 
            dir={isRtl ? 'rtl' : 'ltr'} 
            className={`space-y-4 text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed ${className}`}
        >
            {blocks.map((block, idx) => {
                if (block.type === 'paragraph') {
                    return (
                        <p key={idx} className="leading-relaxed">
                            {renderInlineText(block.content)}
                        </p>
                    );
                }

                if (block.type === 'bullet-list') {
                    return (
                        <ul key={idx} className="space-y-3 my-4 list-none p-0">
                            {block.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3">
                                    <span 
                                        className={`w-2 h-2 rounded-full mt-2.5 shrink-0 ${bulletDotClass}`} 
                                        aria-hidden="true" 
                                    />
                                    <span className="flex-1 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                                        {renderInlineText(item)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    );
                }

                if (block.type === 'numbered-list') {
                    return (
                        <ol key={idx} className="space-y-3 my-4 list-none p-0">
                            {block.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3">
                                    <span 
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold border mt-0.5 shrink-0 ${numberBadgeClass}`}
                                    >
                                        {item.num}
                                    </span>
                                    <span className="flex-1 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                                        {renderInlineText(item.text)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    );
                }

                return null;
            })}
        </div>
    );
}
