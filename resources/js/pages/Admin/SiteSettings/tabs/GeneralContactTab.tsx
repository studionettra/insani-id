import React from 'react';
import { Phone, MapPin, Share2, Headphones, Clock, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GeneralContactTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

export default function GeneralContactTab({ data, setData, errors }: GeneralContactTabProps) {
    return (
        <div className="space-y-6">
            {/* Grid 2 Kolom: Kontak Utama di Kiri, Divisi & Medsos di Kanan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Kolom Kiri: Kontak Utama & Kantor */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Kontak Utama & Kantor</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nomor komunikasi resmi yang ditampilkan pada header dan footer publik.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contact_whatsapp" className="text-xs font-semibold">Nomor WhatsApp Resmi (Footer)</Label>
                                <Input
                                    id="contact_whatsapp"
                                    value={data.contact_whatsapp}
                                    onChange={(e) => setData('contact_whatsapp', e.target.value)}
                                    placeholder="081319456675"
                                    className="mt-1"
                                />
                                {errors.contact_whatsapp && <p className="text-xs text-red-500 mt-1">{errors.contact_whatsapp}</p>}
                            </div>

                            <div>
                                <Label htmlFor="contact_phone" className="text-xs font-semibold">Telepon Kantor Resmi</Label>
                                <Input
                                    id="contact_phone"
                                    value={data.contact_phone}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                    placeholder="(021) 27871199"
                                    className="mt-1"
                                />
                                {errors.contact_phone && <p className="text-xs text-red-500 mt-1">{errors.contact_phone}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="contact_email" className="text-xs font-semibold">Email Resmi Yayasan</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={data.contact_email}
                                onChange={(e) => setData('contact_email', e.target.value)}
                                placeholder="sapa@insani.id"
                                className="mt-1"
                            />
                            {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                                <Label htmlFor="contact_operating_hours" className="text-xs font-semibold flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>Jam Operasional Kantor</span>
                                </Label>
                                <Input
                                    id="contact_operating_hours"
                                    value={data.contact_operating_hours}
                                    onChange={(e) => setData('contact_operating_hours', e.target.value)}
                                    placeholder="Senin - Jum'at | 10:00 - 18.00 WIB"
                                    className="mt-1"
                                />
                                {errors.contact_operating_hours && <p className="text-xs text-red-500 mt-1">{errors.contact_operating_hours}</p>}
                            </div>

                            <div>
                                <Label htmlFor="contact_holiday_note" className="text-xs font-semibold">Catatan Hari Libur</Label>
                                <Input
                                    id="contact_holiday_note"
                                    value={data.contact_holiday_note}
                                    onChange={(e) => setData('contact_holiday_note', e.target.value)}
                                    placeholder="Tutup Pada Tanggal Merah & Cuti Bersama"
                                    className="mt-1"
                                />
                                {errors.contact_holiday_note && <p className="text-xs text-red-500 mt-1">{errors.contact_holiday_note}</p>}
                            </div>
                        </div>

                        <div className="pt-1">
                            <Label htmlFor="contact_address" className="text-xs font-semibold flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span>Alamat Kantor Yayasan</span>
                            </Label>
                            <textarea
                                id="contact_address"
                                rows={3}
                                value={data.contact_address}
                                onChange={(e) => setData('contact_address', e.target.value)}
                                placeholder="Alamat kantor lengkap yayasan..."
                                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-900"
                            />
                            {errors.contact_address && <p className="text-xs text-red-500 mt-1">{errors.contact_address}</p>}
                        </div>

                        <div>
                            <Label htmlFor="contact_maps_url" className="text-xs font-semibold">Link Google Maps (Tautan / Embed)</Label>
                            <Input
                                id="contact_maps_url"
                                value={data.contact_maps_url}
                                onChange={(e) => setData('contact_maps_url', e.target.value)}
                                placeholder="https://maps.google.com/..."
                                className="mt-1"
                            />
                            {errors.contact_maps_url && <p className="text-xs text-red-500 mt-1">{errors.contact_maps_url}</p>}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Divisi Layanan & Media Sosial */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Card Layanan Spesifik Divisi */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                <Headphones className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Layanan Spesifik Divisi</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Kontak khusus untuk halaman Bantuan & Kontak Lembaga.</p>
                            </div>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <Label htmlFor="contact_donor_support_wa" className="text-xs font-semibold">WhatsApp Dukungan Donatur</Label>
                                <Input
                                    id="contact_donor_support_wa"
                                    value={data.contact_donor_support_wa}
                                    onChange={(e) => setData('contact_donor_support_wa', e.target.value)}
                                    placeholder="081319456675"
                                    className="mt-1"
                                />
                                {errors.contact_donor_support_wa && <p className="text-xs text-red-500 mt-1">{errors.contact_donor_support_wa}</p>}
                            </div>

                            <div>
                                <Label htmlFor="contact_donation_confirm_wa" className="text-xs font-semibold">WhatsApp Konfirmasi Donasi</Label>
                                <Input
                                    id="contact_donation_confirm_wa"
                                    value={data.contact_donation_confirm_wa}
                                    onChange={(e) => setData('contact_donation_confirm_wa', e.target.value)}
                                    placeholder="0895373388880"
                                    className="mt-1"
                                />
                                {errors.contact_donation_confirm_wa && <p className="text-xs text-red-500 mt-1">{errors.contact_donation_confirm_wa}</p>}
                            </div>

                            <div>
                                <Label htmlFor="contact_partnership_wa" className="text-xs font-semibold">WhatsApp Kemitraan Lembaga</Label>
                                <Input
                                    id="contact_partnership_wa"
                                    value={data.contact_partnership_wa}
                                    onChange={(e) => setData('contact_partnership_wa', e.target.value)}
                                    placeholder="082124837496"
                                    className="mt-1"
                                />
                                {errors.contact_partnership_wa && <p className="text-xs text-red-500 mt-1">{errors.contact_partnership_wa}</p>}
                            </div>

                            <div>
                                <Label htmlFor="contact_finance_email" className="text-xs font-semibold flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    <span>Email Khusus Keuangan</span>
                                </Label>
                                <Input
                                    id="contact_finance_email"
                                    type="email"
                                    value={data.contact_finance_email}
                                    onChange={(e) => setData('contact_finance_email', e.target.value)}
                                    placeholder="financial@insani.id"
                                    className="mt-1"
                                />
                                {errors.contact_finance_email && <p className="text-xs text-red-500 mt-1">{errors.contact_finance_email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Card Media Sosial */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/70 pb-4">
                            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tautan Media Sosial</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tautan profil resmi yang disematkan di footer website.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="social_instagram" className="text-xs font-semibold">Instagram URL</Label>
                                <Input
                                    id="social_instagram"
                                    value={data.social_instagram}
                                    onChange={(e) => setData('social_instagram', e.target.value)}
                                    placeholder="https://www.instagram.com/insaniindonesia"
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.social_instagram && <p className="text-xs text-red-500 mt-1">{errors.social_instagram}</p>}
                            </div>

                            <div>
                                <Label htmlFor="social_facebook" className="text-xs font-semibold">Facebook Page URL</Label>
                                <Input
                                    id="social_facebook"
                                    value={data.social_facebook}
                                    onChange={(e) => setData('social_facebook', e.target.value)}
                                    placeholder="https://www.facebook.com/insaniindonesia"
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.social_facebook && <p className="text-xs text-red-500 mt-1">{errors.social_facebook}</p>}
                            </div>

                            <div>
                                <Label htmlFor="social_youtube" className="text-xs font-semibold">YouTube Channel URL</Label>
                                <Input
                                    id="social_youtube"
                                    value={data.social_youtube}
                                    onChange={(e) => setData('social_youtube', e.target.value)}
                                    placeholder="https://www.youtube.com/@insaniindonesia"
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.social_youtube && <p className="text-xs text-red-500 mt-1">{errors.social_youtube}</p>}
                            </div>

                            <div>
                                <Label htmlFor="social_x" className="text-xs font-semibold">X (Twitter) URL</Label>
                                <Input
                                    id="social_x"
                                    value={data.social_x}
                                    onChange={(e) => setData('social_x', e.target.value)}
                                    placeholder="https://x.com/officialinsani"
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.social_x && <p className="text-xs text-red-500 mt-1">{errors.social_x}</p>}
                            </div>

                            <div>
                                <Label htmlFor="social_threads" className="text-xs font-semibold">Threads URL</Label>
                                <Input
                                    id="social_threads"
                                    value={data.social_threads}
                                    onChange={(e) => setData('social_threads', e.target.value)}
                                    placeholder="https://www.threads.com/@insaniindonesia"
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.social_threads && <p className="text-xs text-red-500 mt-1">{errors.social_threads}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
