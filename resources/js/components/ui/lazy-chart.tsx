import React, { lazy, Suspense, useEffect, useState } from 'react';
import type { Props as ApexChartProps } from 'react-apexcharts';

const ApexChart = lazy(() => import('react-apexcharts'));

export interface LazyChartProps extends ApexChartProps {
    fallbackHeight?: number | string;
    className?: string;
}

export default function LazyChart({
    fallbackHeight,
    height = 300,
    className = '',
    ...props
}: LazyChartProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const targetHeight = fallbackHeight ?? height;
    const heightStyle = typeof targetHeight === 'number' ? `${targetHeight}px` : targetHeight;

    const skeletonPlaceholder = (
        <div
            style={{ height: heightStyle }}
            className={`flex w-full items-center justify-center rounded-xl border border-gray-100 bg-gray-50/60 text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-500 animate-pulse ${className}`}
        >
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent dark:border-emerald-400" />
                <span>Memuat grafik...</span>
            </div>
        </div>
    );

    if (!isMounted) {
        return skeletonPlaceholder;
    }

    return (
        <Suspense fallback={skeletonPlaceholder}>
            <div className={className}>
                <ApexChart height={height} {...props} />
            </div>
        </Suspense>
    );
}

