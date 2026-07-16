import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactCreate() {
    const { flash } = usePage().props as any;
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Cloudflare Turnstile Testing Sitekey (Always Passes)
    const turnstileSiteKey = '1x00000000000000000000AA';
    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        'cf-turnstile-response': '',
    });

    useEffect(() => {
        // Load Turnstile script dynamically
        if (!document.getElementById('turnstile-script')) {
            const script = document.createElement('script');
            script.id = 'turnstile-script';
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        // Initialize widget when script loads or component mounts
        const renderWidget = () => {
            if (window.turnstile && turnstileRef.current) {
                try {
                    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                        sitekey: turnstileSiteKey,
                        callback: (token: string) => {
                            setData('cf-turnstile-response', token);
                            clearErrors('cf-turnstile-response');
                        },
                        'expired-callback': () => {
                            setData('cf-turnstile-response', '');
                        },
                        'error-callback': () => {
                            setData('cf-turnstile-response', '');
                        }
                    });
                } catch (e) {
                    console.error("Turnstile rendering error", e);
                }
            } else {
                setTimeout(renderWidget, 500);
            }
        };

        renderWidget();

        return () => {
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (flash?.success) {
            setIsSuccess(true);
            reset();
            // Reset Turnstile
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
            }
            // Auto hide success message after 5 seconds
            setTimeout(() => setIsSuccess(false), 5000);
        }
    }, [flash]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kontak', {
            preserveScroll: true,
            onError: () => {
                // If there's an error (e.g. invalid turnstile), reset the widget
                if (widgetIdRef.current !== null && window.turnstile) {
                    window.turnstile.reset(widgetIdRef.current);
                    setData('cf-turnstile-response', '');
                }
            }
        });
    };

    return (
        <PublicLayout title="Hubungi Kami">
            
            <div className="bg-insani-darkblue text-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Hubungi Kami</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                        Kami siap membantu dan mendengar masukan Anda. Silakan hubungi kami melalui formulir atau kontak yang tersedia di bawah ini.
                    </p>
                </div>
            </div>

            <section className="py-16 md:py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                        
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-3xl font-bold text-insani-darkblue mb-8">Informasi Kontak</h2>
                            <p className="text-gray-600 mb-10 text-lg">
                                Jika Anda memiliki pertanyaan seputar donasi, program kebaikan, kemitraan, atau kendala teknis, jangan ragu untuk menghubungi tim layanan kami.
                            </p>
                            
                            <div className="space-y-8">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-insani-blue shrink-0 mr-6">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Alamat Kantor</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Gedung Yayasan Insani Indonesia<br />
                                            Jl. Kebaikan No. 99, Kecamatan Peduli<br />
                                            Jakarta Selatan, 12345, Indonesia
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 mr-6">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Telepon / WhatsApp</h3>
                                        <p className="text-gray-600 leading-relaxed mb-2">
                                            +62 821 2399 8593
                                        </p>
                                        <a href="https://wa.me/6282123998593" target="_blank" rel="noreferrer" className="text-insani-blue font-medium hover:underline inline-flex items-center">
                                            Chat via WhatsApp
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mr-6">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                                        <a href="mailto:sapa@insani.id" className="text-gray-600 hover:text-insani-blue transition-colors">
                                            sapa@insani.id
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mr-6">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Jam Operasional</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Senin - Jumat: 08:00 - 17:00 WIB<br />
                                            Sabtu - Minggu: Libur
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Contact Form */}
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 md:p-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kirim Pesan</h2>
                            <p className="text-gray-500 mb-8">Isi formulir di bawah ini dan kami akan membalas pesan Anda secepatnya.</p>
                            
                            {isSuccess && (
                                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start text-emerald-800">
                                    <CheckCircle2 className="w-6 h-6 mr-3 shrink-0 text-emerald-500" />
                                    <p className="font-medium text-sm leading-relaxed">{flash.success}</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Lengkap *</Label>
                                        <Input 
                                            id="name" 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)} 
                                            required 
                                            className="bg-slate-50"
                                            disabled={processing}
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input 
                                            id="email" 
                                            type="email"
                                            value={data.email} 
                                            onChange={e => setData('email', e.target.value)} 
                                            required 
                                            className="bg-slate-50"
                                            disabled={processing}
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Nomor Telepon / WA (Opsional)</Label>
                                    <Input 
                                        id="phone" 
                                        type="tel"
                                        value={data.phone} 
                                        onChange={e => setData('phone', e.target.value)} 
                                        className="bg-slate-50"
                                        disabled={processing}
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subjek Pesan *</Label>
                                    <Input 
                                        id="subject" 
                                        value={data.subject} 
                                        onChange={e => setData('subject', e.target.value)} 
                                        required 
                                        className="bg-slate-50"
                                        disabled={processing}
                                    />
                                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Isi Pesan *</Label>
                                    <Textarea 
                                        id="message" 
                                        rows={5}
                                        value={data.message} 
                                        onChange={e => setData('message', e.target.value)} 
                                        required 
                                        className="bg-slate-50 resize-none"
                                        disabled={processing}
                                    />
                                    {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                                </div>

                                {/* Cloudflare Turnstile */}
                                <div className="py-2">
                                    <div ref={turnstileRef}></div>
                                    {errors['cf-turnstile-response'] && <p className="text-sm text-red-500 mt-2">{errors['cf-turnstile-response']}</p>}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-insani-blue hover:bg-insani-darkblue h-12 text-lg rounded-xl"
                                    disabled={processing || !data['cf-turnstile-response']}
                                >
                                    {processing ? 'Mengirim Pesan...' : 'Kirim Pesan'}
                                </Button>
                            </form>
                        </div>

                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}
