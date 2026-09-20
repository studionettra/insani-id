import { Eye, FileCheck, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";
import React from "react";
import { formatCurrency } from "@/lib/utils";

interface FunnelData {
  totalViews: number;
  totalAttempts: number;
  totalPaid: number;
  conversionRate: number;
}

interface TopProgram {
  id: number;
  title: string;
  slug: string;
  category?: string;
  collected_amount: number;
  target_amount: number;
  views_count: number;
  donation_count: number;
  conversion_rate: number;
}

interface Props {
  funnel: FunnelData;
  topPrograms?: TopProgram[];
}

export default function ConversionFunnelCard({ funnel, topPrograms = [] }: Props) {
  const attemptRate =
    funnel.totalViews > 0
      ? ((funnel.totalAttempts / funnel.totalViews) * 100).toFixed(1)
      : "0.0";
  const paidRate =
    funnel.totalAttempts > 0
      ? ((funnel.totalPaid / funnel.totalAttempts) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1A56DB] dark:text-blue-400" />
            Corong Konversi Donatur (Donation Funnel)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Perjalanan donatur dari membaca program hingga transaksi lunas
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60">
          Conversion Rate: {funnel.conversionRate}%
        </div>
      </div>

      {/* Funnel Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Step 1: Views */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 relative">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Langkah 1</span>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {funnel.totalViews.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Total Tayangan Program</p>
          <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {/* Step 2: Form Attempts */}
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 relative">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Langkah 2</span>
            <FileCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-950 dark:text-blue-200">
            {funnel.totalAttempts.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            Form Donasi Terkirim ({attemptRate}%)
          </p>
          <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {/* Step 3: Paid */}
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Langkah 3</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
            {funnel.totalPaid.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            Donasi Lunas / Terverifikasi ({paidRate}%)
          </p>
        </div>
      </div>

      {/* Top Performing Programs by Views & Conversions */}
      {topPrograms.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Program Terpopuler & Kinerja Konversi
          </h4>
          <div className="space-y-2.5">
            {topPrograms.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {program.title}
                  </p>
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                    <span>{program.views_count.toLocaleString("id-ID")} tayangan</span>
                    <span>•</span>
                    <span>{program.donation_count} donasi lunas</span>
                    {program.conversion_rate > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Konversi {program.conversion_rate}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#1A56DB] dark:text-blue-400">
                    {formatCurrency(program.collected_amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
