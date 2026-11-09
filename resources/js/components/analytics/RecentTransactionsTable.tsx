import { Link } from "@inertiajs/react";
import { ArrowUpRight, CheckCircle2, Clock, CreditCard, Heart } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: number;
  donation_code: string;
  donor_name: string;
  amount: number;
  unique_code?: number;
  program_title: string;
  program_slug?: string;
  category: string;
  payment_method: string;
  paid_at: string;
  paid_at_formatted?: string;
}

interface Props {
  transactions: Transaction[];
}

export default function RecentTransactionsTable({ transactions = [] }: Props) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs w-full min-w-0">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
              Transaksi Donasi Terkini
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate sm:whitespace-normal">
              Aliran kebaikan real-time yang baru saja berhasil terverifikasi.
            </p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-xs shrink-0">
          <Link href="/admin/donations">
            Kelola Donasi
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Mobile View: Stacked Card List (Visible only on < md) */}
      <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex flex-col gap-2 hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
              {/* Baris 1: Donatur & Kode (Kiri), Nominal (Kanan) */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm block truncate">
                    {tx.donor_name}
                  </span>
                  <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 block">
                    {tx.donation_code}
                  </span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm shrink-0">
                  {formatCurrency(tx.amount + (tx.unique_code || 0))}
                </span>
              </div>

              {/* Baris 2: Program Donasi & Kategori */}
              <div className="text-xs">
                {tx.program_slug ? (
                  <Link
                    href={`/program/${tx.program_slug}`}
                    target="_blank"
                    className="font-medium text-gray-800 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1"
                    title={tx.program_title}
                  >
                    {tx.program_title}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                    {tx.program_title}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 block">
                  {tx.category}
                </span>
              </div>

              {/* Baris 3: Badge Metode Pembayaran & Waktu */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <CreditCard className="w-3 h-3 text-gray-500" />
                  {tx.payment_method}
                </span>
                <div className="inline-flex items-center gap-1" title={tx.paid_at_formatted || tx.paid_at}>
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{tx.paid_at}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-gray-400 dark:text-gray-500 text-xs">
            <Heart className="w-6 h-6 mx-auto mb-2 opacity-40 text-brand-500" />
            Belum ada transaksi donasi yang terverifikasi saat ini.
          </div>
        )}
      </div>

      {/* Desktop View: Multi-column Table (Visible only on md+) */}
      <div className="hidden md:block p-0 overflow-x-auto custom-scrollbar flex-1 w-full min-w-0">
        <table className="w-full min-w-[620px] text-sm text-left">
          <thead className="bg-gray-50/80 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-5 py-3.5 whitespace-nowrap">Donatur & Kode</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Program Donasi</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Metode</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Nominal</th>
              <th className="px-5 py-3.5 text-right whitespace-nowrap">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                        {tx.donor_name}
                      </span>
                      <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {tx.donation_code}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <div className="flex flex-col">
                      {tx.program_slug ? (
                        <Link
                          href={`/program/${tx.program_slug}`}
                          target="_blank"
                          className="font-medium text-gray-800 dark:text-gray-200 text-xs hover:text-brand-600 transition-colors line-clamp-1"
                          title={tx.program_title}
                        >
                          {tx.program_title}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-xs line-clamp-1">
                          {tx.program_title}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {tx.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <CreditCard className="w-3 h-3 text-gray-500" />
                      {tx.payment_method}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                      {formatCurrency(tx.amount + (tx.unique_code || 0))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap" title={tx.paid_at_formatted || tx.paid_at}>
                    <div className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{tx.paid_at}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400 dark:text-gray-500 text-xs">
                  <Heart className="w-6 h-6 mx-auto mb-2 opacity-40 text-brand-500" />
                  Belum ada transaksi donasi yang terverifikasi saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
