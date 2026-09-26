import { toast } from 'sonner';

/**
 * Helper to call /admin/auto-translate endpoint for batch fields.
 */
export async function autoTranslateFields(
    fields: Record<string, string | null | undefined>,
    source: 'id' | 'en' | 'ar' = 'id',
    targets: Array<'id' | 'en' | 'ar'> = ['en', 'ar']
): Promise<Record<string, Record<string, string>> | null> {
    const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    // Filter non-empty strings
    const payloadFields: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
        if (typeof value === 'string' && value.trim()) {
            payloadFields[key] = value.trim();
        }
    }

    if (Object.keys(payloadFields).length === 0) {
        toast.error('Silakan isi data dalam Bahasa Indonesia terlebih dahulu sebelum menerjemahkan.');
        return null;
    }

    try {
        const res = await fetch('/admin/auto-translate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                fields: payloadFields,
                source,
                targets,
            }),
        });

        if (!res.ok) {
            const errorJson = await res.json().catch(() => null);
            toast.error(errorJson?.message || 'Gagal menghubungi layanan terjemahan.');
            return null;
        }

        const json = await res.json();
        if (json.success && json.translations) {
            toast.success('✨ Terjemahan EN & AR berhasil digenerate otomatis!');
            return json.translations;
        } else {
            toast.error(json.message || 'Gagal menerjemahkan konten.');
            return null;
        }
    } catch (err) {
        console.error('Auto-translate error:', err);
        toast.error('Terjadi kesalahan jaringan saat memproses auto-translate.');
        return null;
    }
}
