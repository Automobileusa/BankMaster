import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import type { Account } from "@/types/banking";

Chart.register(...registerables);

interface BalanceChartProps {
  accounts: Account[];
}

export default function BalanceChart({ accounts }: BalanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || accounts.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Generate mock historical data for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const datasets = accounts
      .filter(account => account.accountType !== 'credit')
      .map((account, index) => {
        const currentBalance = parseFloat(account.balance);
        const variation = currentBalance * 0.1; // 10% variation
        
        const data = months.map((_, monthIndex) => {
          const baseVariation = (Math.random() - 0.5) * variation;
          const trendVariation = (monthIndex / 11) * (variation * 0.5); // slight upward trend
          return currentBalance + baseVariation + trendVariation;
        });

        const colors = [
          { border: '#c8102e', background: 'rgba(200, 16, 46, 0.1)' },
          { border: '#004785', background: 'rgba(0, 71, 133, 0.1)' },
          { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' },
        ];

        return {
          label: account.accountName,
          data,
          borderColor: colors[index % colors.length].border,
          backgroundColor: colors[index % colors.length].background,
          tension: 0.4,
          fill: true,
        };
      });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Balance ($)',
            },
            ticks: {
              callback: function(value) {
                return '$' + Number(value).toLocaleString();
              },
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [accounts]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  );
}
