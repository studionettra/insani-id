import type { ApexOptions } from "apexcharts";
import { Share2 } from "lucide-react";
import React from "react";
import Chart from "react-apexcharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  labels: string[];
  series: number[];
  details: Array<{
    name: string;
    raw_source: string;
    count: number;
    amount: number;
  }>;
}

export default function UtmSourcePieChart({ labels = [], series = [], details = [] }: Props) {
  const chartColors = ["#1A56DB", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#64748B"];

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
              label: "Total Donasi",
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
      y: {
        formatter: (val) => `${val} transaksi`,
      },
    },
  };

  const hasData = series.length > 0 && series.some((val) => val > 0);
  const chartSeries = hasData ? series : [1];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#1A56DB] dark:text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Sebaran Sumber Kanal (UTM)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Atribusi asal donatur bertransaksi
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center py-2">
          {typeof window !== "undefined" && (
            <Chart
              options={options}
              series={chartSeries}
              type="donut"
              height={260}
            />
          )}
        </div>
      </div>

      {details.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {details.slice(0, 4).map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-gray-400 ml-1.5">
                  ({item.count})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
