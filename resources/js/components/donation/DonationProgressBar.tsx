import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export interface DonationProgressBarProps {
    collectedAmount: number;
    targetAmount?: number | string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showPercentage?: boolean;
    percentagePlacement?: 'top-right' | 'inline' | 'none';
    percentageFormat?: 'badge' | 'text';
    label?: string;
    showCompleteBadge?: boolean;
    className?: string;
    trackClassName?: string;
    barClassName?: string;
    animated?: boolean;
}

export function getDonationProgressDetails(collectedAmount: number, targetAmount?: number | string | null) {
    const numericTarget = targetAmount ? parseFloat(String(targetAmount)) : null;
    const hasTarget = Boolean(numericTarget !== null && !isNaN(numericTarget) && numericTarget > 0);
    const validCollected = Math.max(0, collectedAmount || 0);

    const rawPercentage = hasTarget && numericTarget
        ? (validCollected / numericTarget) * 100
        : null;

    let percentage: number | null = null;
    let percentageDisplay = '0%';

    if (rawPercentage !== null) {
        percentage = Math.round(rawPercentage);
        if (validCollected > 0 && rawPercentage < 1) {
            percentageDisplay = '< 1%';
        } else {
            percentageDisplay = `${percentage}%`;
        }
    }

    // Minimum visual width: jika ada donasi masuk (> 0), berikan visual minimal 1.5% agar bar terlihat mulai bergerak
    const visualWidth = rawPercentage !== null
        ? (validCollected > 0 ? Math.max(1.5, Math.min(100, rawPercentage)) : 0)
        : 0;
    const isCompleted = rawPercentage !== null && rawPercentage >= 100;

    // Determine Tier Color Scheme
    let tier: 1 | 2 | 3 | 4 = 1;
    let barGradient = 'from-sky-400 to-brand-500';
    let badgeColor = 'text-sky-700 bg-sky-50 border-sky-200/70 dark:text-sky-300 dark:bg-sky-950/60 dark:border-sky-800/60';
    let textColor = 'text-sky-600 dark:text-sky-400';

    if (rawPercentage !== null) {
        if (rawPercentage >= 100) {
            tier = 4;
            barGradient = 'from-emerald-500 to-teal-400';
            badgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300/80 dark:text-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-700';
            textColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (rawPercentage >= 75) {
            tier = 3;
            barGradient = 'from-teal-500 to-emerald-500';
            badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/70 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800/60';
            textColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (rawPercentage >= 25) {
            tier = 2;
            barGradient = 'from-brand-500 via-[#00a8cc] to-[#00d1b4]';
            badgeColor = 'text-brand-700 bg-brand-50 border-brand-200/70 dark:text-brand-300 dark:bg-brand-950/50 dark:border-brand-800/60';
            textColor = 'text-brand-600 dark:text-brand-400';
        } else {
            tier = 1;
            barGradient = 'from-sky-400 to-brand-500';
            badgeColor = 'text-sky-700 bg-sky-50 border-sky-200/70 dark:text-sky-300 dark:bg-sky-950/60 dark:border-sky-800/60';
            textColor = 'text-sky-600 dark:text-sky-400';
        }
    }

    return {
        hasTarget,
        numericTarget,
        percentage,
        rawPercentage,
        percentageDisplay,
        visualWidth,
        isCompleted,
        tier,
        barGradient,
        badgeColor,
        textColor,
    };
}

export default function DonationProgressBar({
    collectedAmount,
    targetAmount,
    size = 'sm',
    showPercentage = true,
    percentagePlacement = 'top-right',
    percentageFormat = 'badge',
    label,
    showCompleteBadge = true,
    className,
    trackClassName,
    barClassName,
    animated = true,
}: DonationProgressBarProps) {
    const {
        hasTarget,
        percentage,
        percentageDisplay,
        visualWidth,
        isCompleted,
        barGradient,
        badgeColor,
        textColor,
    } = getDonationProgressDetails(collectedAmount, targetAmount);

    // Height sizing
    const heightMap = {
        xs: 'h-1.5',
        sm: 'h-2',
        md: 'h-2.5',
        lg: 'h-3',
    };
    const barHeight = heightMap[size] || 'h-2';

    if (!hasTarget) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
                    Donasi Fleksibel (Tanpa Target)
                </span>
            </div>
        );
    }

    const renderPercentageElement = () => {
        if (!showPercentage || percentage === null) return null;

        if (percentageFormat === 'badge') {
            return (
                <span
                    className={cn(
                        'inline-flex items-center gap-1 font-bold rounded-md border text-xs px-1.5 py-0.5 tracking-tight transition-colors',
                        badgeColor,
                        size === 'xs' && 'text-[10px] px-1 py-0',
                        size === 'lg' && 'text-sm px-2 py-0.5'
                    )}
                >
                    {isCompleted && showCompleteBadge && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    <span>{percentageDisplay}</span>
                </span>
            );
        }

        return (
            <span
                className={cn(
                    'font-bold tracking-tight transition-colors',
                    textColor,
                    size === 'xs' ? 'text-[11px]' : size === 'lg' ? 'text-base font-extrabold' : 'text-xs'
                )}
            >
                {percentageDisplay}
            </span>
        );
    };

    return (
        <div className={cn('w-full flex flex-col gap-1.5', className)}>
            {(label || (showPercentage && percentagePlacement === 'top-right')) && (
                <div className="flex items-center justify-between text-xs">
                    {label ? (
                        <span className="text-slate-500 dark:text-gray-400 font-medium text-xs">
                            {label}
                        </span>
                    ) : (
                        <span />
                    )}
                    {percentagePlacement === 'top-right' && renderPercentageElement()}
                </div>
            )}

            <div
                className={cn(
                    'w-full bg-slate-100 dark:bg-gray-800/80 rounded-full overflow-hidden relative shadow-inner',
                    barHeight,
                    trackClassName
                )}
            >
                <div
                    role="progressbar"
                    aria-valuenow={percentage || 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className={cn(
                        'h-full rounded-full bg-gradient-to-r relative overflow-hidden',
                        barGradient,
                        animated && 'transition-all duration-1000 ease-out',
                        barClassName
                    )}
                    style={{ width: `${visualWidth}%` }}
                >
                    {animated && (
                        <div className="absolute inset-0 bg-white/20 w-full h-full origin-left animate-pulse pointer-events-none" />
                    )}
                </div>
            </div>

            {showPercentage && percentagePlacement === 'inline' && (
                <div className="mt-1 flex justify-end">
                    {renderPercentageElement()}
                </div>
            )}
        </div>
    );
}
