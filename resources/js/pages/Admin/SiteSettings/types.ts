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

export type TabKey = 'general' | 'branding' | 'profile' | 'legal' | 'announcement' | 'marketing';

export interface TabDefinition {
    key: TabKey;
    label: string;
    shortLabel: string;
    description: string;
    icon: any;
    fields: string[];
}
