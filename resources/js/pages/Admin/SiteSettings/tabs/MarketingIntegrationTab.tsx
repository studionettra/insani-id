import React from 'react';
import { BarChart3, Megaphone, Globe, ExternalLink, ShieldCheck, Info, Sparkles } from 'lucide-react';
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

    return (
        <div className="space-y-6">
            {/* Card 1: Pelacakan & Analitik */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pelacakan & Analitik Web</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Container Tag Manager dan piksel konversi iklan donasi.</p>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/60 px-3 py-1 rounded-full self-start sm:self-auto">
                        <Sparkles className="w-3 h-3" /> Hanya aktif di publik
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Google Tag Manager */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="google_tag_manager_id" className="text-xs font-semibold">
                                Google Tag Manager (GTM) Container ID
                            </Label>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                Direkomendasikan
                            </span>
                        </div>
                        <Input
                            id="google_tag_manager_id"
                            value={data.google_tag_manager_id}
                            onChange={(e) => setData('google_tag_manager_id', e.target.value)}
                            placeholder="GTM-XXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            Jika GTM diisi, tag GA4 dan Meta Pixel cukup dikelola terpusat di dashboard GTM Anda.
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
                            value={data.google_analytics_id}
                            onChange={(e) => setData('google_analytics_id', e.target.value)}
                            placeholder="G-XXXXXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            Digunakan langsung jika Anda tidak memasang container GTM terpusat.
                        </p>
                        {errors.google_analytics_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.google_analytics_id}</p>
                        )}
                    </div>

                    {/* Meta Pixel */}
                    <div className="space-y-1.5">
                        <Label htmlFor="meta_pixel_id" className="text-xs font-semibold">
                            Meta Pixel ID (Facebook & Instagram Ads)
                        </Label>
                        <Input
                            id="meta_pixel_id"
                            value={data.meta_pixel_id}
                            onChange={(e) => setData('meta_pixel_id', e.target.value)}
                            placeholder="123456789012345"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            ID Piksel Meta untuk mengukur konversi kampanye iklan donasi.
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
                            value={data.tiktok_pixel_id}
                            onChange={(e) => setData('tiktok_pixel_id', e.target.value)}
                            placeholder="CXXXXXXXXXXXXXXX"
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400">
                            ID Piksel TikTok Ads untuk pelacakan donasi dari konten video pendek.
                        </p>
                        {errors.tiktok_pixel_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.tiktok_pixel_id}</p>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <span>
                        <strong>Catatan SPA:</strong> Sistem Insani ID otomatis memicu <em>Virtual Pageview</em> dan event e-commerce standar (<code>InitiateCheckout</code> dan <code>Purchase</code> donasi sukses) setiap kali pengunjung berinteraksi.
                    </span>
                </div>
            </div>

            {/* Card 2: Google AdSense */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Google AdSense (Monetisasi Khusus Berita)
                                </h2>
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                                    Khusus /berita
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Atur slot unit iklan Google AdSense dan file otorisasi ads.txt.
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
                            value={data.google_adsense_client_id}
                            onChange={(e) => setData('google_adsense_client_id', e.target.value)}
                            placeholder="ca-pub-1234567890123456"
                            className="font-mono text-xs"
                        />
                        {errors.google_adsense_client_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.google_adsense_client_id}</p>
                        )}
                    </div>

                    {/* Unit Slot Iklan 4 Kolom */}
                    <div className="space-y-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Unit Slot Iklan Berita (Ad Slots)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 space-y-1.5">
                                <Label htmlFor="adsense_slot_blog_index" className="text-xs font-semibold block">
                                    1. Indeks Berita
                                </Label>
                                <p className="text-[11px] text-gray-400">Banner di atas daftar artikel</p>
                                <Input
                                    id="adsense_slot_blog_index"
                                    value={data.adsense_slot_blog_index}
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
                                    value={data.adsense_slot_article_top}
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
                                    value={data.adsense_slot_article_middle}
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
                                    value={data.adsense_slot_article_bottom}
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
                                <span>Isi Berkas ads.txt (Otorisasi Publisher)</span>
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
                            value={data.ads_txt_content}
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
                            <strong>Jaminan Isolasi Kebaikan:</strong> Iklan Google AdSense hanya akan dimuat pada rute <code>/berita</code>. Seluruh halaman program kebaikan, donasi, checkout pembayaran, dan dashboard admin 100% bebas dari script iklan.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
