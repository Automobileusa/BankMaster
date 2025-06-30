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
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Calculate total balance with some variation
        const totalBalance = accounts.reduce((sum, account) => {
          const balance = parseFloat(account.balance || '0');
          const variation = (Math.random() - 0.5) * 100; // Add some variation
          return sum + (isNaN(balance) ? 0 : balance) + variation;
        }, 0);
        
        data.push(Math.max(0, totalBalance)); // Ensure non-negative
      }
      
      return { dates, data };
    };

    const chartData = generateChartData();

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.dates,
        datasets: [{
          label: 'Total Balance',
          data: chartData.data,
          borderColor: '#c8102e',
          backgroundColor: 'rgba(200, 16, 46, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            border: {
              display: false,
            },
            ticks: {
              callback: function(value) {
                return '$' + Number(value).toLocaleString();
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        elements: {
          point: {
            hoverBackgroundColor: '#c8102e',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2,
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [accounts]);

  if (!accounts.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No account data available for chart
      </div>
    );
  }

  return <canvas ref={chartRef} />;
}

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
