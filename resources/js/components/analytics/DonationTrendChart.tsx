import type { ApexOptions } from "apexcharts";
import { TrendingUp, CreditCard } from "lucide-react";
import React, { useState } from "react";
import Chart from "react-apexcharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  categories: string[];
  amounts: number[];
  counts: number[];
}

export default function DonationTrendChart({ categories = [], amounts = [], counts = [] }: Props) {
  const [metric, setMetric] = useState<"amount" | "count">("amount");

  const totalAmount = amounts.reduce((acc, curr) => acc + curr, 0);
  const totalCount = counts.reduce((acc, curr) => acc + curr, 0);

  const series = [
    {
      name: metric === "amount" ? "Nominal Donasi" : "Jumlah Transaksi",
      data: metric === "amount" ? amounts : counts,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 300,
      fontFamily: "inherit",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: [metric === "amount" ? "#1A56DB" : "#10B981"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: -30,
        style: {
          fontSize: "11px",
          colors: "#64748B",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => {
          if (metric === "amount") {
            if (val >= 1000000) {
              return `Rp ${(val / 1000000).toFixed(1)} jt`;
            }

            if (val >= 1000) {
              return `Rp ${(val / 1000).toFixed(0)} rb`;
            }

            return `Rp ${val}`;
          }

          return `${val}`;
        },
        style: {
          fontSize: "11px",
          colors: "#64748B",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => {
          if (metric === "amount") {
            return formatCurrency(val);
          }

          return `${val} transaksi`;
        },
      },
    },
    grid: {
      borderColor: "#F1F5F9",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Tren Donasi (30 Hari Terakhir)
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1A56DB] dark:bg-blue-950/50 dark:text-blue-400">
              Live
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Total {formatCurrency(totalAmount)} dari {totalCount.toLocaleString("id-ID")} transaksi donasi lunas.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetric("amount")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              metric === "amount"
                ? "bg-white dark:bg-gray-900 text-[#1A56DB] dark:text-blue-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Nominal (Rp)
          </button>
          <button
            type="button"
            onClick={() => setMetric("count")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              metric === "count"
                ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Jumlah Transaksi
          </button>
        </div>
      </div>

      <div className="w-full">
        {typeof window !== "undefined" && (
          <Chart options={options} series={series} type="area" height={280} />
        )}
      </div>
    </div>
  );
}
