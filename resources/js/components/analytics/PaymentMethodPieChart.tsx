import type { ApexOptions } from "apexcharts";
import { CreditCard } from "lucide-react";
import React from "react";
import Chart from "react-apexcharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  labels: string[];
  series: number[];
  details: Array<{
    name: string;
    raw_method: string;
    count: number;
    amount: number;
  }>;
}

export default function PaymentMethodPieChart({ labels = [], series = [], details = [] }: Props) {
  const chartColors = ["#00A6C0", "#1A56DB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#64748B"];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    labels: labels.length > 0 ? labels : ["Belum ada data"],
    colors: chartColors,
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontSize: "12px",
      labels: {
        colors: "#64748B",
      },
    },
    stroke: {
      width: 2,
      colors: ["#fff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Transaksi",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748B",
              formatter: () => {
                const total = series.reduce((acc, curr) => acc + curr, 0);
                return `${total}`;
              },
            },
          },
        },
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val, opts) => {
          const index = opts.seriesIndex;
          const detail = details[index];
          const amountStr = detail ? ` (${formatCurrency(detail.amount)})` : "";
          return `${val} donasi${amountStr}`;
        },
      },
    },
  };

  const hasData = series.length > 0 && series.some((v) => v > 0);
  const totalAmount = details.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Metode Pembayaran</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Kanal bayar terverifikasi donatur</p>
            </div>
          </div>
          {totalAmount > 0 && (
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              {formatCurrency(totalAmount)}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center min-h-[220px]">
          {hasData ? (
            <div className="w-full max-w-[280px]">
              <Chart options={options} series={series} type="donut" height={220} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 dark:text-gray-500">
              <CreditCard className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-xs">Belum ada transaksi terverifikasi</p>
            </div>
          )}
        </div>
      </div>

      {hasData && details.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800 space-y-2">
          {details.map((item, idx) => {
            const totalCount = series.reduce((a, b) => a + b, 0);
            const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                  />
                  <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.count} ({percent}%)
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
