import React, { useState, useMemo } from 'react';
import {
    Users,
    UserCheck,
    Heart,
    HeartHandshake,
    Handshake,
    Smile,
    Baby,
    Home,
    Globe,
    MapPin,
    Navigation,
    Flag,
    Truck,
    Building,
    Landmark,
    Coins,
    Wallet,
    Banknote,
    TrendingUp,
    Award,
    Trophy,
    CheckCircle2,
    ShieldCheck,
    Target,
    HeartPulse,
    Activity,
    Stethoscope,
    Utensils,
    Apple,
    Droplets,
    Flame,
    LifeBuoy,
    GraduationCap,
    BookOpen,
    School,
    Briefcase,
    Lightbulb,
    Gift,
    Sparkles,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    type LucideIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface IconItem {
    name: string;
    label: string;
    category: string;
    keywords: string[];
    component: LucideIcon;
}

export const ICONS_LIST: IconItem[] = [
    // Sosial & Kemanusiaan
    { name: 'Users', label: 'Penerima / Relawan', category: 'sosial', keywords: ['users', 'orang', 'relawan', 'masyarakat', 'penerima', 'jamaah'], component: Users },
    { name: 'UserCheck', label: 'Donatur / Terverifikasi', category: 'sosial', keywords: ['user', 'donatur', 'verifikasi', 'anggota', 'member'], component: UserCheck },
    { name: 'Heart', label: 'Kepedulian / Kasih', category: 'sosial', keywords: ['heart', 'hati', 'cinta', 'kasih', 'peduli', 'keberkahan'], component: Heart },
    { name: 'HeartHandshake', label: 'Gotong Royong', category: 'sosial', keywords: ['hearthandshake', 'bantu', 'tolong', 'gotong royong', 'kerjasama'], component: HeartHandshake },
    { name: 'Handshake', label: 'Kemitraan', category: 'sosial', keywords: ['handshake', 'mitra', 'kerjasama', 'partner', 'kolaborasi'], component: Handshake },
    { name: 'Smile', label: 'Kebahagiaan', category: 'sosial', keywords: ['smile', 'senyum', 'bahagia', 'senang', 'harapan'], component: Smile },
    { name: 'Baby', label: 'Anak & Balita', category: 'sosial', keywords: ['baby', 'anak', 'yatim', 'piatu', 'balita', 'bayi'], component: Baby },
    { name: 'Home', label: 'Hunian / Rumah', category: 'sosial', keywords: ['home', 'rumah', 'hunian', 'tempat tinggal', 'panti'], component: Home },

    // Keuangan & Donasi
    { name: 'Coins', label: 'Koin / Donasi', category: 'donasi', keywords: ['coins', 'koin', 'donasi', 'uang', 'rupiah', 'sedekah', 'infaq'], component: Coins },
    { name: 'Wallet', label: 'Dompet / Dana', category: 'donasi', keywords: ['wallet', 'dompet', 'dana', 'kas', 'anggaran', 'penyaluran'], component: Wallet },
    { name: 'Banknote', label: 'Uang Tunai', category: 'donasi', keywords: ['banknote', 'uang', 'cash', 'tunai', 'bantuan tunai'], component: Banknote },
    { name: 'TrendingUp', label: 'Pertumbuhan', category: 'donasi', keywords: ['trending', 'naik', 'tumbuh', 'progres', 'kinerja', 'capaian'], component: TrendingUp },
    { name: 'Award', label: 'Prestasi / Capaian', category: 'donasi', keywords: ['award', 'penghargaan', 'prestasi', 'capaian', 'rekor'], component: Award },
    { name: 'Trophy', label: 'Piala / Sukses', category: 'donasi', keywords: ['trophy', 'piala', 'juara', 'keberhasilan'], component: Trophy },
    { name: 'Target', label: 'Sasaran / Target', category: 'donasi', keywords: ['target', 'sasaran', 'tujuan', 'fokus'], component: Target },
    { name: 'ShieldCheck', label: 'Amanah & Audit', category: 'donasi', keywords: ['shield', 'aman', 'transparan', 'terpercaya', 'amanah', 'audit'], component: ShieldCheck },
    { name: 'CheckCircle2', label: 'Tuntas / Selesai', category: 'donasi', keywords: ['check', 'sukses', 'tuntas', 'berhasil', 'selesai'], component: CheckCircle2 },

    // Jangkauan & Program
    { name: 'Globe', label: 'Wilayah / Global', category: 'wilayah', keywords: ['globe', 'dunia', 'global', 'internasional', 'bumi', 'wilayah'], component: Globe },
    { name: 'MapPin', label: 'Titik Lokasi', category: 'wilayah', keywords: ['map', 'lokasi', 'daerah', 'kota', 'desa', 'titik'], component: MapPin },
    { name: 'Flag', label: 'Provinsi / Wilayah', category: 'wilayah', keywords: ['flag', 'bendera', 'provinsi', 'negara', 'kabupaten'], component: Flag },
    { name: 'Navigation', label: 'Penjelajahan', category: 'wilayah', keywords: ['navigation', 'kompas', 'ekspedisi', 'jangkauan'], component: Navigation },
    { name: 'Truck', label: 'Logistik / Armada', category: 'wilayah', keywords: ['truck', 'truk', 'armada', 'distribusi', 'logistik', 'kirim'], component: Truck },
    { name: 'Building', label: 'Fasilitas / Gedung', category: 'wilayah', keywords: ['building', 'gedung', 'bangunan', 'infrastruktur', 'asrama'], component: Building },
    { name: 'Landmark', label: 'Masjid / Fasilitas', category: 'wilayah', keywords: ['landmark', 'masjid', 'musholla', 'sarana', 'fasilitas'], component: Landmark },

    // Kesehatan, Pangan & Bencana
    { name: 'HeartPulse', label: 'Kesehatan Medis', category: 'kesehatan', keywords: ['pulse', 'jantung', 'kesehatan', 'medis', 'klinik', 'pasien'], component: HeartPulse },
    { name: 'Activity', label: 'Layanan Darurat', category: 'kesehatan', keywords: ['activity', 'aktivitas', 'ambulans', 'gawat darurat'], component: Activity },
    { name: 'Stethoscope', label: 'Tenaga Medis', category: 'kesehatan', keywords: ['stethoscope', 'dokter', 'perawat', 'pengobatan', 'kesehatan'], component: Stethoscope },
    { name: 'Utensils', label: 'Makanan / Dapur', category: 'kesehatan', keywords: ['utensils', 'makanan', 'pangan', 'sembako', 'dapur umum', 'makan'], component: Utensils },
    { name: 'Apple', label: 'Gizi & Nutrisi', category: 'kesehatan', keywords: ['apple', 'gizi', 'nutrisi', 'stunting', 'buah', 'sehat'], component: Apple },
    { name: 'Droplets', label: 'Air Bersih & Sanitasi', category: 'kesehatan', keywords: ['water', 'air', 'sanitasi', 'sumur', 'bersih', 'wudhu'], component: Droplets },
    { name: 'Flame', label: 'Tanggap Darurat', category: 'kesehatan', keywords: ['flame', 'api', 'bencana', 'darurat', 'kebakaran'], component: Flame },
    { name: 'LifeBuoy', label: 'Bantuan Bencana', category: 'kesehatan', keywords: ['lifebuoy', 'pelampung', 'banjir', 'evakuasi', 'penyelamatan'], component: LifeBuoy },

    // Pendidikan & Lainnya
    { name: 'GraduationCap', label: 'Pendidikan / Beasiswa', category: 'pendidikan', keywords: ['education', 'toga', 'kuliah', 'beasiswa', 'sarjana', 'pendidikan'], component: GraduationCap },
    { name: 'BookOpen', label: 'Buku & Literasi', category: 'pendidikan', keywords: ['book', 'buku', 'baca', 'literasi', 'perpustakaan', 'al-quran'], component: BookOpen },
    { name: 'School', label: 'Sekolah / Madrasah', category: 'pendidikan', keywords: ['school', 'sekolah', 'madrasah', 'pesantren', 'kelas'], component: School },
    { name: 'Briefcase', label: 'Ekonomi / UMKM', category: 'pendidikan', keywords: ['briefcase', 'tas', 'kerja', 'umkm', 'usaha', 'modal', 'ekonomi'], component: Briefcase },
    { name: 'Lightbulb', label: 'Inovasi / Pelatihan', category: 'pendidikan', keywords: ['lightbulb', 'ide', 'inovasi', 'pelatihan', 'kursus', 'ilmu'], component: Lightbulb },
    { name: 'Gift', label: 'Paket Kado / Bantuan', category: 'pendidikan', keywords: ['gift', 'kado', 'hadiah', 'bingkisan', 'paket', 'santunan'], component: Gift },
    { name: 'Sparkles', label: 'Dampak & Manfaat', category: 'pendidikan', keywords: ['sparkles', 'bintang', 'cahaya', 'manfaat', 'keberkahan'], component: Sparkles },
];

const ICONS_MAP = new Map<string, IconItem>(ICONS_LIST.map((item) => [item.name.toLowerCase(), item]));

export function renderStatIcon(iconName?: string | null, className: string = 'w-5 h-5') {
    if (!iconName) return null;
    const cleanName = iconName.trim().toLowerCase();
    const item = ICONS_MAP.get(cleanName);
    if (!item) return null;
    const IconComponent = item.component;
    return <IconComponent className={className} />;
}

interface IconPickerProps {
    value?: string;
    onChange: (iconName: string) => void;
    id?: string;
}

export function IconPicker({ value = '', onChange, id = 'icon' }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const selectedItem = useMemo(() => {
        if (!value) return null;
        return ICONS_MAP.get(value.trim().toLowerCase()) || null;
    }, [value]);

    const filteredIcons = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return ICONS_LIST.filter((item) => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!q) return true;
            return (
                item.name.toLowerCase().includes(q) ||
                item.label.toLowerCase().includes(q) ||
                item.keywords.some((k) => k.includes(q))
            );
        });
    }, [searchQuery, selectedCategory]);

    const handleSelectIcon = (iconName: string) => {
        onChange(iconName);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    const categories = [
        { id: 'all', label: 'Semua' },
        { id: 'sosial', label: 'Sosial' },
        { id: 'donasi', label: 'Donasi' },
        { id: 'wilayah', label: 'Wilayah' },
        { id: 'kesehatan', label: 'Kesehatan' },
        { id: 'pendidikan', label: 'Pendidikan' },
    ];

    return (
        <div className="w-full max-w-full min-w-0 space-y-2">
            {/* Box Trigger / Input Style */}
            <div
                id={id}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-w-0 flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-all cursor-pointer select-none ${
                    selectedItem
                        ? 'border-blue-300 bg-blue-50/50 dark:border-blue-900/60 dark:bg-blue-950/30'
                        : 'border-input bg-background hover:bg-muted/40'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    {selectedItem ? (
                        <>
                            <div className="w-7 h-7 rounded-md bg-[#1A56DB] text-white flex items-center justify-center shrink-0 shadow-xs">
                                <selectedItem.component className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                                <span className="font-semibold text-gray-900 dark:text-white mr-1.5">{selectedItem.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">({selectedItem.label})</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Sparkles className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-sm">Pilih ikon visual (opsional)...</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {selectedItem && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Hapus Ikon"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1 pl-1">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>
            </div>

            {/* Dropdown Panel / Grid Selector */}
            {isOpen && (
                <div className="w-full max-w-full min-w-0 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-3 shadow-xs space-y-2.5 animate-in fade-in-50 duration-150">
                    {/* Search Bar + Category Select */}
                    <div className="flex items-center gap-2 w-full min-w-0">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <Input
                                placeholder="Cari ikon (cth: orang, hati, uang)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-7 h-8 text-xs w-full"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring shrink-0 cursor-pointer"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Quick Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] w-full min-w-0 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors shrink-0 ${
                                    selectedCategory === cat.id
                                        ? 'bg-[#1A56DB] text-white font-medium shadow-xs'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Icons Grid */}
                    <div className="max-h-[175px] overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-1.5 w-full min-w-0">
                        {filteredIcons.map((item) => {
                            const isSelected = selectedItem?.name.toLowerCase() === item.name.toLowerCase();
                            const IconComp = item.component;
                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => handleSelectIcon(item.name)}
                                    title={`${item.name} (${item.label})`}
                                    className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all group ${
                                        isSelected
                                            ? 'border-[#1A56DB] bg-blue-50 text-[#1A56DB] ring-1 ring-[#1A56DB] font-medium dark:bg-blue-950/40'
                                            : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#1A56DB] hover:bg-blue-50/40 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <IconComp className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-current shrink-0" />
                                    <span className="text-[10px] truncate max-w-full leading-tight font-medium">
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {filteredIcons.length === 0 && (
                        <div className="py-4 text-center text-xs text-gray-400">
                            Tidak ada ikon yang sesuai dengan kata kunci &quot;{searchQuery}&quot;.
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                        <span>{filteredIcons.length} ikon tersedia</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="h-6 px-2 text-xs"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
