import { Link } from "@inertiajs/react";
import { AlertTriangle, ArrowRight, Clock, Target } from "lucide-react";
import React from "react";
import { formatCurrency } from "@/lib/utils";
import DonationProgressBar from "@/components/donation/DonationProgressBar";

interface UrgentProgram {
  id: number;
  title: string;
  slug: string;
  category: string;
  collected_amount: number;
  target_amount: number;
  deadline: string;
  days_remaining: number;
  percentage: number;
}

interface Props {
  programs: UrgentProgram[];
}

export default function UrgentProgramsCard({ programs = [] }: Props) {
  if (programs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-orange-50/20 to-white dark:border-amber-900/50 dark:from-amber-950/20 dark:to-gray-900 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
              Mendekati Batas Waktu
            </h3>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              {programs.length} program butuh dorongan donasi
            </p>
          </div>
        </div>
        <Link
          href="/admin/programs"
          className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
        >
          Lihat Semua
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-amber-100/80 dark:border-amber-900/30 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/admin/programs/${prog.id}`}
                className="text-xs font-semibold text-gray-900 dark:text-white hover:text-brand-600 line-clamp-1"
                title={prog.title}
              >
                {prog.title}
              </Link>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {prog.days_remaining === 0 ? "Hari Terakhir" : `${prog.days_remaining} hari lagi`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {formatCurrency(prog.collected_amount)}
              </span>
              <span>Target {formatCurrency(prog.target_amount)}</span>
            </div>

            <DonationProgressBar
              collectedAmount={prog.collected_amount}
              targetAmount={prog.target_amount}
              size="xs"
              percentagePlacement="none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
