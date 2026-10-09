import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const indonesianLocale = {
    weekdays: {
        shorthand: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as [string, string, string, string, string, string, string],
        longhand: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as [string, string, string, string, string, string, string],
    },
    months: {
        shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] as [string, string, string, string, string, string, string, string, string, string, string, string],
        longhand: [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ] as [string, string, string, string, string, string, string, string, string, string, string, string],
    },
    firstDayOfWeek: 1,
    time_24hr: true,
    rangeSeparator: ' - ',
};

export interface DatePickerProps {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (dateStr: string) => void;
    minDate?: string | Date | 'today';
    maxDate?: string | Date;
    placeholder?: string;
    disabled?: boolean;
    enableTime?: boolean;
    className?: string;
    hasIcon?: boolean;
    required?: boolean;
}

export function DatePicker({
    id,
    name,
    value = '',
    onChange,
    minDate,
    maxDate,
    placeholder = 'Pilih tanggal...',
    disabled = false,
    enableTime = false,
    className,
    hasIcon = true,
    required = false,
}: DatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const fpRef = useRef<flatpickr.Instance | null>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        const resolvedMinDate = minDate === 'today'
            ? new Date().toISOString().split('T')[0]
            : minDate;

        const fp = flatpickr(inputRef.current, {
            locale: indonesianLocale,
            dateFormat: enableTime ? 'Y-m-d H:i:S' : 'Y-m-d',
            altInput: true,
            altFormat: enableTime ? 'd F Y, H:i' : 'd F Y',
            altInputClass: cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none cursor-pointer',
                'placeholder:text-muted-foreground',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'dark:bg-gray-950 dark:text-white dark:border-gray-800',
                'disabled:cursor-not-allowed disabled:opacity-50',
                hasIcon && 'pr-9',
                className
            ),
            defaultDate: value || undefined,
            minDate: resolvedMinDate,
            maxDate,
            enableTime: !!enableTime,
            time_24hr: true,
            static: false,
            monthSelectorType: 'static',
            onChange: (_selectedDates, dateStr) => {
                onChange?.(dateStr);
            },
        });

        fpRef.current = fp;

        if (disabled && fp.altInput) {
            fp.altInput.setAttribute('disabled', 'disabled');
        }

        return () => {
            fp.destroy();
            fpRef.current = null;
        };
    }, [minDate, maxDate, enableTime, className, hasIcon]);

    // Sinkronisasi value saat berubah dari parent (state Inertia)
    useEffect(() => {
        if (fpRef.current) {
            const currentDate = fpRef.current.input.value;
            if (value !== currentDate) {
                fpRef.current.setDate(value || '', false);
            }
        }
    }, [value]);

    // Sinkronisasi disabled state
    useEffect(() => {
        if (fpRef.current?.altInput) {
            if (disabled) {
                fpRef.current.altInput.setAttribute('disabled', 'disabled');
            } else {
                fpRef.current.altInput.removeAttribute('disabled');
            }
        }
    }, [disabled]);

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                id={id}
                name={name}
                type="text"
                defaultValue={value}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="hidden"
            />
            {hasIcon && (
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                        if (!disabled && fpRef.current) {
                            fpRef.current.open();
                        }
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors pointer-events-auto"
                >
                    <CalendarIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

export default DatePicker;
