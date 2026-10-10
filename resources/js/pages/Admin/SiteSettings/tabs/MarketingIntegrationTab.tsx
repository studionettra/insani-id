import React from 'react';
import { 
    BarChart3, 
    Megaphone, 
    Globe, 
    ExternalLink, 
    ShieldCheck, 
    Info, 
    Server, 
    CheckCircle2, 
    Search, 
    Layers 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface MarketingIntegrationTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

export default function MarketingIntegrationTab({
    data,
    setData,
    errors,
}: MarketingIntegrationTabProps) {
    const isAdsenseEnabled = data.adsense_enabled === '1';
    const isCapiEnabled = data.meta_capi_enabled === '1';
    const trackingMode = data.tracking_mode_gtm || 'hybrid';

    return (
        <div className="space-y-6">
            {/* Card 1: Pelacakan & Analitik Web */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pelacakan & Tag Pemasaran</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Container Tag Manager dan piksel konversi iklan donasi.</p>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/60 px-3 py-1 rounded-full self-start sm:self-auto">
                        <Globe className="w-3 h-3" /> Hanya aktif di publik
                    </span>
                </div>

                {/* Kontrol Mode Integrasi GTM */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                Mode Eksekusi Google Tag Manager (GTM)
                            </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
                            <button
                                type="button"
                                onClick={() => setData('tracking_mode_gtm', 'hybrid')}
                                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                    trackingMode === 'hybrid'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                }`}
                            >
                                Mode Hybrid (Disarankan)
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('tracking_mode_gtm', 'gtm_only')}
                                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                    trackingMode === 'gtm_only'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                }`}
                            >
                                Terpusat GTM Saja
                            </button>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {trackingMode === 'hybrid'
                            ? 'Mode Hybrid: Container GTM dan Direct Pixels (GA4/Meta/TikTok) sama-sama di-inject ke publik. Sangat aman dan fleksibel untuk kampanye donasi umum.'
                            : 'Mode Terpusat: Script GA4, Meta Pixel, dan TikTok Pixel bawaan dinonaktifkan di Blade. Seluruh tag pelacakan wajib Anda pasang di dalam container GTM Anda.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Google Tag Manager */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="google_tag_manager_id" className="text-xs font-semibold">
                                Google Tag Manager (GTM) Container ID
                            </Label>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                Rekomendasi
                            </span>
                        </div>
                        <Input
                            id="google_tag_manager_id"
                            value={data.google_tag_manager_id || ''}
                            onChange={(e) => setData('google_tag_manager_id', e.target.value)}
                            placeholder="GTM-XXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            ID Container GTM dari Google Tag Manager (misal: GTM-N8K5Z2Q).
                        </p>
                        {errors.google_tag_manager_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.google_tag_manager_id}</p>
                        )}
                    </div>

                    {/* Google Analytics 4 */}
                    <div className="space-y-1.5">
                        <Label htmlFor="google_analytics_id" className="text-xs font-semibold">
                            Google Analytics 4 (GA4) Measurement ID
                        </Label>
                        <Input
                            id="google_analytics_id"
                            value={data.google_analytics_id || ''}
                            onChange={(e) => setData('google_analytics_id', e.target.value)}
                            placeholder="G-XXXXXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            ID Properti GA4 untuk analitik trafik dan konversi donatur.
                        </p>
                        {errors.google_analytics_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.google_analytics_id}</p>
                        )}
                    </div>

                    {/* Google Ads Conversion ID */}
                    <div className="space-y-1.5">
                        <Label htmlFor="google_ads_id" className="text-xs font-semibold">
                            Google Ads Conversion ID (Opsional)
                        </Label>
                        <Input
                            id="google_ads_id"
                            value={data.google_ads_id || ''}
                            onChange={(e) => setData('google_ads_id', e.target.value)}
                            placeholder="AW-XXXXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            Untuk pelacakan konversi kampanye Google Ads atau Google Ad Grants Yayasan.
                        </p>
                        {errors.google_ads_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.google_ads_id}</p>
                        )}
                    </div>

                    {/* Meta Pixel (Facebook/Instagram) */}
                    <div className="space-y-1.5">
                        <Label htmlFor="meta_pixel_id" className="text-xs font-semibold">
                            Meta Pixel ID (Facebook & Instagram Ads)
                        </Label>
                        <Input
                            id="meta_pixel_id"
                            value={data.meta_pixel_id || ''}
                            onChange={(e) => setData('meta_pixel_id', e.target.value)}
                            placeholder="123456789012345"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            ID Piksel Meta untuk mengukur konversi donasi dari iklan Facebook & Instagram.
                        </p>
                        {errors.meta_pixel_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.meta_pixel_id}</p>
                        )}
                    </div>

                    {/* TikTok Pixel */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tiktok_pixel_id" className="text-xs font-semibold">
                            TikTok Pixel ID (Opsional)
                        </Label>
                        <Input
                            id="tiktok_pixel_id"
                            value={data.tiktok_pixel_id || ''}
                            onChange={(e) => setData('tiktok_pixel_id', e.target.value)}
                            placeholder="CXXXXXXXXXXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            ID Piksel TikTok Ads untuk pelacakan kampanye video TikTok.
                        </p>
                        {errors.tiktok_pixel_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.tiktok_pixel_id}</p>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <span>
                        <strong>Sistem Pelacakan Otomatis:</strong> Insani ID otomatis memicu <em>Virtual Pageview</em> di awal dan saat pindah halaman, serta event e-commerce standar (<code>InitiateCheckout</code> dan <code>Purchase</code> donasi sukses) ke seluruh tag di atas.
                    </span>
                </div>
            </div>

            {/* Card 2: Meta Conversions API (CAPI) - Server-Side Tracking */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            <Server className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Meta Conversions API (CAPI Server-Side)
                                </h2>
                                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                                    Kebal AdBlock
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Mengirimkan sinyal donasi berhasil langsung dari server Laravel ke Meta Graph API.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                        <span className="text-xs font-semibold">
                            {isCapiEnabled ? 'CAPI Aktif' : 'CAPI Nonaktif'}
                        </span>
                        <Switch
                            checked={isCapiEnabled}
                            onCheckedChange={(checked) => setData('meta_capi_enabled', checked ? '1' : '0')}
                        />
                    </div>
                </div>

                {isCapiEnabled && (
                    <div className="space-y-4 pt-1">
                        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                            <p className="font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Deduplikasi Otomatis Aktif
                            </p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                Sistem menggunakan Kode Donasi unik (<code>donation_code</code>) sebagai <code>event_id</code>. Meta Ads akan menggabungkan sinyal browser dan server sehingga tidak terjadi hitungan ganda (*double counting*).
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Meta CAPI Access Token */}
                            <div className="space-y-1.5 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="meta_capi_access_token" className="text-xs font-semibold">
                                        Meta Conversions API Access Token
                                    </Label>
                                    <span className="text-[10px] text-gray-400">Dari Meta Events Manager &gt; Pengaturan &gt; Buat Token Akses</span>
                                </div>
                                <Textarea
                                    id="meta_capi_access_token"
                                    rows={2}
                                    value={data.meta_capi_access_token || ''}
                                    onChange={(e) => setData('meta_capi_access_token', e.target.value)}
                                    placeholder="EAA..."
                                    className="font-mono text-xs"
                                />
                                {errors.meta_capi_access_token && (
                                    <p className="text-xs text-red-500 mt-1">{errors.meta_capi_access_token}</p>
                                )}
                            </div>

                            {/* Meta CAPI Test Event Code */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="meta_capi_test_event_code" className="text-xs font-semibold">
                                        Test Event Code (Opsional untuk Debugging)
                                    </Label>
                                    <span className="text-[10px] font-mono text-gray-400">TESTXXXXX</span>
                                </div>
                                <Input
                                    id="meta_capi_test_event_code"
                                    value={data.meta_capi_test_event_code || ''}
                                    onChange={(e) => setData('meta_capi_test_event_code', e.target.value)}
                                    placeholder="TEST12345"
                                    className="font-mono text-xs"
                                />
                                <p className="text-[11px] text-gray-400">
                                    Isi kode dari tab "Uji Peristiwa" (Test Events) di Meta Events Manager untuk memantau pengiriman live. Kosongkan saat live produksi.
                                </p>
                                {errors.meta_capi_test_event_code && (
                                    <p className="text-xs text-red-500 mt-1">{errors.meta_capi_test_event_code}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Card 3: Verifikasi Webmaster & Domain */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Verifikasi Webmaster & Domain
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tag HTML meta untuk memverifikasi kepemilikan situs di Google dan Meta Business Suite.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Google Site Verification */}
                    <div className="space-y-1.5">
                        <Label htmlFor="google_site_verification" className="text-xs font-semibold">
                            Google Search Console Verification Tag
                        </Label>
                        <Input
                            id="google_site_verification"
                            value={data.google_site_verification || ''}
                            onChange={(e) => setData('google_site_verification', e.target.value)}
                            placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            Isi nilai parameter <code>content="..."</code> dari tag meta Google Search Console.
                        </p>
                        {errors.google_site_verification && (
                            <p className="text-xs text-red-500 mt-1">{errors.google_site_verification}</p>
                        )}
                    </div>

                    {/* Meta Domain Verification */}
                    <div className="space-y-1.5">
                        <Label htmlFor="meta_domain_verification" className="text-xs font-semibold">
                            Meta Domain Verification Tag (Facebook Ads)
                        </Label>
                        <Input
                            id="meta_domain_verification"
                            value={data.meta_domain_verification || ''}
                            onChange={(e) => setData('meta_domain_verification', e.target.value)}
                            placeholder="facebook-domain-verification=XXXXXXXXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            Isi nilai parameter <code>content="..."</code> dari meta tag verifikasi domain Facebook.
                        </p>
                        {errors.meta_domain_verification && (
                            <p className="text-xs text-red-500 mt-1">{errors.meta_domain_verification}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Card 4: Google AdSense */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Google AdSense (Monetisasi Khusus Kabar)
                                </h2>
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                                    Khusus /kabar
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Atur slot unit iklan Google AdSense dan file verifikasi ads.txt.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                        <span className="text-xs font-semibold">
                            {isAdsenseEnabled ? 'Iklan Aktif' : 'Iklan Nonaktif'}
                        </span>
                        <Switch
                            checked={isAdsenseEnabled}
                            onCheckedChange={(checked) => setData('adsense_enabled', checked ? '1' : '0')}
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Publisher Client ID */}
                    <div className="space-y-1.5 max-w-lg">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="google_adsense_client_id" className="text-xs font-semibold">
                                Google AdSense Publisher ID (Client ID)
                            </Label>
                            <span className="text-[10px] font-mono text-gray-400">ca-pub-XXXXXXXXXXXXXXXX</span>
                        </div>
                        <Input
                            id="google_adsense_client_id"
                            value={data.google_adsense_client_id || ''}
                            onChange={(e) => setData('google_adsense_client_id', e.target.value)}
                            placeholder="ca-pub-1234567890123456"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            Sistem otomatis menambahkan awalan <code>ca-pub-</code> jika Anda hanya menyalin deretan nomor.
                        </p>
                        {errors.google_adsense_client_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.google_adsense_client_id}</p>
                        )}
                    </div>

                    {/* Unit Slot Iklan 4 Kolom */}
                    <div className="space-y-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Unit Slot Iklan Kabar (Ad Slots)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 space-y-1.5">
                                <Label htmlFor="adsense_slot_blog_index" className="text-xs font-semibold block">
                                    1. Indeks Kabar
                                </Label>
                                <p className="text-[11px] text-gray-400">Banner di atas daftar artikel</p>
                                <Input
                                    id="adsense_slot_blog_index"
                                    value={data.adsense_slot_blog_index || ''}
                                    onChange={(e) => setData('adsense_slot_blog_index', e.target.value)}
                                    placeholder="1234567890"
                                    className="font-mono text-xs"
                                />
                                {errors.adsense_slot_blog_index && (
                                    <p className="text-xs text-red-500">{errors.adsense_slot_blog_index}</p>
                                )}
                            </div>

                            <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 space-y-1.5">
                                <Label htmlFor="adsense_slot_article_top" className="text-xs font-semibold block">
                                    2. Atas Konten Artikel
                                </Label>
                                <p className="text-[11px] text-gray-400">Sebelum paragraf awal</p>
                                <Input
                                    id="adsense_slot_article_top"
                                    value={data.adsense_slot_article_top || ''}
                                    onChange={(e) => setData('adsense_slot_article_top', e.target.value)}
                                    placeholder="2345678901"
                                    className="font-mono text-xs"
                                />
                                {errors.adsense_slot_article_top && (
                                    <p className="text-xs text-red-500">{errors.adsense_slot_article_top}</p>
                                )}
                            </div>

                            <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 space-y-1.5">
                                <Label htmlFor="adsense_slot_article_middle" className="text-xs font-semibold block">
                                    3. Tengah Paragraf
                                </Label>
                                <p className="text-[11px] text-gray-400">Setelah paragraf ke-3</p>
                                <Input
                                    id="adsense_slot_article_middle"
                                    value={data.adsense_slot_article_middle || ''}
                                    onChange={(e) => setData('adsense_slot_article_middle', e.target.value)}
                                    placeholder="3456789012"
                                    className="font-mono text-xs"
                                />
                                {errors.adsense_slot_article_middle && (
                                    <p className="text-xs text-red-500">{errors.adsense_slot_article_middle}</p>
                                )}
                            </div>

                            <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 space-y-1.5">
                                <Label htmlFor="adsense_slot_article_bottom" className="text-xs font-semibold block">
                                    4. Bawah Konten Artikel
                                </Label>
                                <p className="text-[11px] text-gray-400">Sebelum kotak share</p>
                                <Input
                                    id="adsense_slot_article_bottom"
                                    value={data.adsense_slot_article_bottom || ''}
                                    onChange={(e) => setData('adsense_slot_article_bottom', e.target.value)}
                                    placeholder="4567890123"
                                    className="font-mono text-xs"
                                />
                                {errors.adsense_slot_article_bottom && (
                                    <p className="text-xs text-red-500">{errors.adsense_slot_article_bottom}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ads.txt Editor */}
                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/70">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="ads_txt_content" className="text-xs font-semibold flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Isi Berkas ads.txt (Verifikasi Penayang Iklan)</span>
                            </Label>
                            <a 
                                href="/ads.txt" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                                /ads.txt <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <Textarea
                            id="ads_txt_content"
                            rows={3}
                            value={data.ads_txt_content || ''}
                            onChange={(e) => setData('ads_txt_content', e.target.value)}
                            placeholder="google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
                            className="font-mono text-xs"
                        />
                        {errors.ads_txt_content && (
                            <p className="text-xs text-red-500 mt-1">{errors.ads_txt_content}</p>
                        )}
                    </div>

                    {/* Jaminan Isolasi Iklan */}
                    <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                            <strong>Jaminan Isolasi Kebaikan:</strong> Iklan Google AdSense hanya akan dimuat pada rute <code>/kabar</code>. Seluruh halaman program kebaikan, donasi, checkout pembayaran, dan dashboard admin 100% bebas dari script iklan.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
