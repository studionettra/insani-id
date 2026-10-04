export interface MultilingualField {
    id: string;
    en: string;
    ar: string;
}

export const parseMultilingual = (val: any, defaultText = ''): MultilingualField => {
    if (!val) return { id: defaultText, en: '', ar: '' };
    if (typeof val === 'object' && val !== null) {
        return { 
            id: val.id ?? defaultText, 
            en: val.en ?? '', 
            ar: val.ar ?? '' 
        };
    }
    if (typeof val === 'string' && val.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(val.trim());
            if (typeof parsed === 'object' && parsed !== null) {
                return { 
                    id: parsed.id ?? defaultText, 
                    en: parsed.en ?? '', 
                    ar: parsed.ar ?? '' 
                };
            }
        } catch (e) {}
    }
    return { id: val || defaultText, en: '', ar: '' };
};

export type TabKey = 'general' | 'branding' | 'profile' | 'legal' | 'announcement' | 'marketing' | 'payment';

export type TabCategoryKey = 'identity' | 'finance' | 'communications';

export interface TabCategoryDefinition {
    key: TabCategoryKey;
    label: string;
    description?: string;
}

export const SETTINGS_TAB_CATEGORIES: TabCategoryDefinition[] = [
    {
        key: 'identity',
        label: 'Identitas & Profil',
        description: 'Kontak resmi, branding media, visi-misi, dan dokumen hukum yayasan',
    },
    {
        key: 'finance',
        label: 'Keuangan & Transaksi',
        description: 'Konfigurasi Midtrans Core API, QRIS, E-Wallet, dan rekening yayasan',
    },
    {
        key: 'communications',
        label: 'Publikasi & Pemasaran',
        description: 'Banner pengumuman global, analitik pelacakan donatur, dan iklan',
    },
];

export interface TabDefinition {
    key: TabKey;
    category: TabCategoryKey;
    label: string;
    shortLabel: string;
    description: string;
    icon: any;
    fields: string[];
}
