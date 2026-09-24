import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DonationReceiptData {
    id: number;
    donation_code: string;
    amount: number;
    channel: string;
    status: string;
    created_at: string;
    is_anonymous: boolean;
    donor_name?: string;
    program?: any;
    payments?: any;
}

interface Props {
    receipt: DonationReceiptData | null;
    onClose: () => void;
}

export default function DonationReceiptModal({ receipt, onClose }: Props) {
    useEffect(() => {
        if (!receipt) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [receipt, onClose]);

    if (!receipt) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
            <div 
                className="w-full h-full max-w-4xl sm:h-[90vh] sm:rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800">Pratinjau Kuitansi Resmi</h3>
                        <p className="text-xs text-slate-500">Gunakan tombol Cetak di dalam kuitansi untuk menyimpan PDF</p>
                    </div>
                    <Button 
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 rounded-full hover:bg-slate-200"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>
                
                {/* Iframe content */}
                <div className="flex-1 bg-slate-200 p-2 sm:p-4 overflow-hidden relative">
                    {/* Spinner placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insani-blue"></div>
                    </div>
                    <iframe 
                        src={`/donasi/kwitansi/${receipt.donation_code}?hide_back_btn=1`}
                        className="w-full h-full rounded-xl bg-white border-0 shadow-sm relative z-10"
                        title="Kuitansi Donasi"
                        onLoad={(e) => {
                            (e.target as HTMLIFrameElement).style.opacity = '1';
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                    />
                </div>
            </div>
        </div>
    );
}
