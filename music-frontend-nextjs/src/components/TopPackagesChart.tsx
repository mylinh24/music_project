'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopPackageData {
  vippackage_id: number;
  purchaseCount: number;
  totalRevenue: number;
  name: string;
  price: number;
}

interface TopPackagesChartProps {
  data: TopPackageData[];
}

const TopPackagesChart: React.FC<TopPackagesChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.name || 'Unknown'),
    datasets: [
      {
        label: 'Số lượng mua',
        data: data.map(item => item.purchaseCount || 0),
        backgroundColor: 'rgba(73, 235, 106, 0.5)',
        borderColor: 'rgba(82, 222, 72, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top gói VIP được mua nhiều nhất',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  return (
    <div style={{ width: '400px', height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopPackagesChart;
