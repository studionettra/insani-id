import { CreditCard } from "lucide-react";
import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  labels?: string[];
  series?: number[];
  details?: Array<{
    name: string;
    raw_method: string;
    count: number;
    amount: number;
  }>;
}

export default function PaymentMethodPieChart({ details = [] }: Props) {
  const chartColors = ["#00A6C0", "#1A56DB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#64748B"];
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalCount = details.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = details.reduce((sum, item) => sum + item.amount, 0);
  const hasData = totalCount > 0 && details.length > 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Metode Pembayaran</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Kanal bayar terverifikasi donatur</p>
            </div>
          </div>
          <div className="text-right">
            {totalAmount > 0 ? (
              <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {formatCurrency(totalAmount)}
              </div>
            ) : null}
            <div className="text-[10.5px] font-medium text-gray-400 dark:text-gray-500">
              {totalCount} Transaksi
            </div>
          </div>
        </div>

        {hasData ? (
          <div className="mt-4 space-y-4">
            {/* Segmented Distribution Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex gap-0.5 p-0.5 shadow-inner">
                {details.map((item, idx) => {
                  const percent = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                  if (percent <= 0) return null;
                  const color = chartColors[idx % chartColors.length];
                  const isHovered = hoveredIdx === idx;
                  const isAnyHovered = hoveredIdx !== null;
                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className={`h-full rounded-full transition-all duration-300 cursor-pointer ${
                        isHovered ? "brightness-110 scale-y-125" : isAnyHovered ? "opacity-40" : "opacity-100"
                      }`}
                      style={{
                        width: `${percent}%`,
                        backgroundColor: color,
                        minWidth: details.length > 1 ? "6px" : "100%",
                      }}
                      title={`${item.name}: ${Math.round(percent)}% • ${formatCurrency(item.amount)} (${item.count} donasi)`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Ranked Distribution List */}
            <div className="space-y-2.5 pt-1">
              {details.map((item, idx) => {
                const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                const color = chartColors[idx % chartColors.length];
                const isHovered = hoveredIdx === idx;
                const isAnyHovered = hoveredIdx !== null;

                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`group flex flex-col gap-1 rounded-lg p-1.5 -mx-1.5 transition-all duration-200 cursor-default ${
                      isHovered ? "bg-teal-50/60 dark:bg-teal-950/20" : isAnyHovered ? "opacity-50" : "hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate font-medium text-gray-800 dark:text-gray-200" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {percent}%
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          ({item.count})
                        </span>
                      </div>
                    </div>
                    {/* Micro track bar */}
                    <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 dark:text-gray-500">
            <CreditCard className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-xs">Belum ada transaksi terverifikasi</p>
          </div>
        )}
      </div>
    </div>
  );
}
