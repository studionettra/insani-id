import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function FlashMessages() {
    const { flash } = usePage<any>().props;
    const prevFlashRef = useRef<{ success?: string; error?: string }>({});

    useEffect(() => {
        if (flash?.success && flash.success !== prevFlashRef.current.success) {
            toast.success(flash.success, { id: `flash-success-${flash.success}` });
        }

        if (flash?.error && flash.error !== prevFlashRef.current.error) {
            toast.error(flash.error, { id: `flash-error-${flash.error}` });
        }

        prevFlashRef.current = {
            success: flash?.success,
            error: flash?.error,
        };
    }, [flash]);

    return null;
}
