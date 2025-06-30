import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import type { Account } from "@/types/banking";

Chart.register(...registerables);

interface BalanceChartProps {
  accounts: Account[];
}

export default function BalanceChart({ accounts }: BalanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !accounts.length) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Generate sample historical data for the chart
    const generateChartData = () => {
      const dates = [];
      const data = [];
      const currentDate = new Date();
      
      // Generate 12 months of data
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        
        // Calculate balance with some variation
        const totalBalance = accounts.reduce((sum, account) => {
          const balance = parseFloat(account.balance);
          const variation = (Math.random() - 0.5) * balance * 0.1; // 10% variation
          return sum + balance + variation;
        }, 0);
        
        data.push(Math.max(0, totalBalance));
      }
      
      return { dates, data };
    };

    const { dates, data } = generateChartData();

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Total Balance',
          data: data,
          borderColor: '#c8102e',
          backgroundColor: 'rgba(200, 16, 46, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `Balance: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
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
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [accounts]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  );
}