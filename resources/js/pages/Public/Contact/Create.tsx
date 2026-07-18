import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, CheckCircle2, UserPlus, Wallet, Handshake, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

const staticFaqs = [
    {
        id: 1,
        question: "Apa itu Insani Indonesia?",
        answer: "Insani Indonesia atau Yayasan Peduli Insani Indonesia merupakan Lembaga yang bergerak dalam bidang sosial dan kemanusiaan. Insani lahir dari semangat cita-cita kemerdekaan Indonesia yang ingin memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa serta mewujudkan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi, dan keadilan sosial.\n\nInsani diinisiasi oleh sekelompok anak muda yang prihatin akan tiada berkahirnya krisis kemanusian di dunia. Merekapun bertekad turut berkontribusi dalam mengentaskan dunia dari krisis kemanusiaan.\n\nTanggal 13 Februari 2019 merupakan hari bersejarah dimana Insani secara resmi didirikan. Sebagai Lembaga yang terhitung masih muda serta dimotori oleh sekelompok anak muda, Insani memposisikan dirinya sebagai wadah bagi siapapun putra bangsa yang bertekad serta berkomitmen untuk terus menebarkan kebaikan."
    },
    {
        id: 2,
        question: "Bagaimana cara berdonasi di INSANI?",
        answer: (
            <div className="space-y-4">
                <p>Berdonasi di INSANI sangatlah mudah. Kami menyediakan beberapa cara berdonasi berikut:</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">Bank Syariah Indonesia (451)</p>
                    <p className="font-mono text-insani-blue text-lg my-1">7132195026</p>
                    <p className="text-sm text-slate-500">A.n Insani Indonesia</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">Bank Rakyat Indonesia (002)</p>
                    <p className="font-mono text-insani-blue text-lg my-1">034501001366304</p>
                    <p className="text-sm text-slate-500">A.n Insani Indonesia</p>
                </div>
                <p>
                    Kemudian kirimkan foto/screenshot bukti transfer ke WhatsApp INSANI di <a href="https://wa.me/62895373388880" target="_blank" rel="noopener noreferrer" className="text-insani-blue hover:underline">0895-3733-88880</a> atau dengan cara menghubungi kami langsung di 0895-3733-88880 atau (021) 27871199.
                </p>
                <p>
                    Anda juga dapat berdonasi via website dengan berbagai metode yang tersedia, cukup klik tautan berikut: <Link href="/galang-dana" className="text-insani-blue hover:underline font-medium">https://insani.id/galang-dana</Link>
                </p>
                <p>
                    Donasi via Gopay/Ovo/DANA/LinkAja/ShopeePay/Qris, caranya cukup scan QR Code berikut melalui aplikasi e-wallet Anda.
                </p>
            </div>
        )
    }
];

export default function ContactCreate() {
    const { flash } = usePage().props as any;
    const [isSuccess, setIsSuccess] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    
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

    const toggleFaq = (index: number) => {
        if (openFaq === index) {
            setOpenFaq(null);
        } else {
            setOpenFaq(index);
        }
    };

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
            <Head title="Kontak | Insani Indonesia" />
            
            {/* Hero Section */}
            <div className="bg-insani-darkblue text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-insani-blue/20 via-transparent to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Kontak</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                        Hubungi kami sesuai kebutuhan Anda. Kami siap memberikan layanan terbaik demi kebaikan bersama.
                    </p>
                </div>
            </div>

            {/* Sesuai Kebutuhanmu Section */}
            <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Hubungi Kami Sesuai Kebutuhanmu</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <a href="https://wa.me/6281319456675" target="_blank" rel="noreferrer" className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(1,112,185,0.15)] hover:border-insani-blue/30 transition-all duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-insani-blue flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-insani-blue group-hover:text-white transition-all">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-insani-blue transition-colors text-xl mb-2">Dukungan Donatur</h3>
                            <p className="text-gray-500 text-sm">Informasi & Konsultasi</p>
                        </a>
                        
                        <a href="https://wa.me/62895373388880" target="_blank" rel="noreferrer" className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(1,112,185,0.15)] hover:border-insani-blue/30 transition-all duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-insani-blue transition-colors text-xl mb-2">Konfirmasi Donasi</h3>
                            <p className="text-gray-500 text-sm">Verifikasi & Validasi</p>
                        </a>

                        <a href="https://wa.me/6282124837496" target="_blank" rel="noreferrer" className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(1,112,185,0.15)] hover:border-insani-blue/30 transition-all duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <Handshake className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-insani-blue transition-colors text-xl mb-2">Kemitraan</h3>
                            <p className="text-gray-500 text-sm">Kelembagaan & Program</p>
                        </a>
                    </div>
                </div>
            </section>

            {/* Main Contact Area */}
            <section className="py-16 md:py-24 bg-white relative">
                <div className="absolute right-0 top-0 w-1/3 h-full bg-slate-50/50 rounded-l-[100px] pointer-events-none hidden lg:block"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                        
                        {/* Hubungi Kami Detail Information */}
                        <div className="pt-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
                            <p className="text-gray-600 mb-12 text-lg">
                                Kami sangat senang berkomunikasi dengan berbagai pihak yang memiliki tujuan untuk kebaikan bersama
                            </p>
                            
                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Dukungan Donatur</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-insani-blue" /> 0813-1945-6675</li>
                                        <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-insani-blue" /> (021) 38820199</li>
                                        <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-insani-blue" /> sapa@insani.id</li>
                                    </ul>
                                </div>
                                
                                <div className="h-px w-full bg-slate-100"></div>
                                
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Konfirmasi Donasi</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-insani-blue" /> 0895-3733-88880</li>
                                        <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-insani-blue" /> 0821-2399-8593</li>
                                        <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-insani-blue" /> financial@insani.id</li>
                                    </ul>
                                </div>
                                
                                <div className="h-px w-full bg-slate-100"></div>
                                
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Kemitraan Lembaga & Program</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-insani-blue" /> 0821-2483-7496</li>
                                        <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-insani-blue" /> sapa@insani.id</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        {/* Contact Form */}
                        <div>
                            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-insani-blue/5 rounded-full blur-3xl"></div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Kirim Kami Pesan</h2>
                                
                                {isSuccess && (
                                    <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start text-emerald-800">
                                        <CheckCircle2 className="w-6 h-6 mr-3 shrink-0 text-emerald-500" />
                                        <p className="font-medium text-sm leading-relaxed">{flash.success}</p>
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <Input 
                                            placeholder="Nama Lengkap"
                                            id="name" 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)} 
                                            required 
                                            className="bg-slate-50/50 border-slate-200 focus:border-insani-blue focus:ring-insani-blue/20 h-12 rounded-xl"
                                            disabled={processing}
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Input 
                                            placeholder="WhatsApp"
                                            id="phone" 
                                            type="tel"
                                            value={data.phone} 
                                            onChange={e => setData('phone', e.target.value)} 
                                            className="bg-slate-50/50 border-slate-200 focus:border-insani-blue focus:ring-insani-blue/20 h-12 rounded-xl"
                                            disabled={processing}
                                        />
                                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Input 
                                            placeholder="Email"
                                            id="email" 
                                            type="email"
                                            value={data.email} 
                                            onChange={e => setData('email', e.target.value)} 
                                            required 
                                            className="bg-slate-50/50 border-slate-200 focus:border-insani-blue focus:ring-insani-blue/20 h-12 rounded-xl"
                                            disabled={processing}
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                    
                                    {/* subject input hide for form visual, but set via message change */}
                                    <input type="hidden" name="subject" value="Pesan dari Halaman Kontak Website" />

                                    <div className="space-y-2">
                                        <Textarea 
                                            placeholder="Pesan Atau Masukan"
                                            id="message" 
                                            rows={5}
                                            value={data.message} 
                                            onChange={e => {
                                                setData('message', e.target.value);
                                                setData('subject', 'Pesan dari Halaman Kontak Website');
                                            }} 
                                            required 
                                            className="bg-slate-50/50 border-slate-200 focus:border-insani-blue focus:ring-insani-blue/20 resize-none rounded-xl"
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
                                        className="w-full bg-[#3d3d3d] hover:bg-black text-white h-12 text-base font-semibold rounded-lg"
                                        disabled={processing || !data['cf-turnstile-response']}
                                    >
                                        {processing ? 'Mengirim...' : 'Kirim'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Kunjungi Kami */}
            <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Map */}
                        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 h-[400px]">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.6219083994824!2d106.8128105!3d-6.313297899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ef82a08035fd%3A0x222843cf2a071b1b!2sInsani%20Indonesia!5e0!3m2!1sid!2sid!4v1784360269332!5m2!1sid!2sid" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen={true} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>

                        {/* Address & Hours */}
                        <div className="lg:pl-8">
                            <h2 className="text-4xl font-bold text-insani-blue mb-8">Kunjungi Kami</h2>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Alamat & Jam Kerja</h3>
                            <div className="space-y-2 text-gray-600 text-lg leading-relaxed mb-8">
                                <p>Jln. Moh Kahfi 1 No 90A</p>
                                <p>Senin - Jum'at | 10:00 - 18.00 WIB</p>
                                <p>Tutup Pada Tanggal Merah & Cuti Bersama</p>
                            </div>

                            <div className="bg-insani-blue/10 rounded-2xl p-6 border border-insani-blue/20">
                                <h4 className="font-bold text-insani-darkblue text-lg mb-2">Pertemuan Dengan Perjanjian</h4>
                                <p className="text-insani-darkblue/80">Silahkan menghubungi bagian dukungan donatur / kemitraan untuk perjanjian pertemuan.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Singkat */}
            <section className="py-20 md:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">FAQ Singkat</h2>
                    </div>

                    <div className="space-y-4">
                        {staticFaqs.map((faq, index) => (
                            <motion.div 
                                key={faq.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white rounded-2xl border ${openFaq === index ? 'border-insani-blue/30 shadow-md' : 'border-slate-200'} overflow-hidden transition-all duration-300`}
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                                >
                                    <h3 className={`text-lg md:text-xl font-bold ${openFaq === index ? 'text-insani-blue' : 'text-slate-800'}`}>
                                        {faq.question}
                                    </h3>
                                    <div className={`ml-4 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${openFaq === index ? 'bg-insani-blue/10 text-insani-blue' : 'bg-slate-50 text-slate-400'}`}>
                                        {openFaq === index ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </div>
                                </button>
                                
                                <motion.div
                                    initial={false}
                                    animate={{ 
                                        height: openFaq === index ? 'auto' : 0,
                                        opacity: openFaq === index ? 1 : 0
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 text-slate-600 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-4">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}
