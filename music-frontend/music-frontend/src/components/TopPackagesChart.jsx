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

const TopPackagesChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.vippackage?.name || 'Unknown'),
    datasets: [
      {
        label: 'Số lượng mua',
        data: data.map(item => item.purchaseCount || 0),
        backgroundColor: 'rgba(73, 235, 106, 0.5)', // hồng phấn
        borderColor: 'rgba(82, 222, 72, 1)',       // xanh mint viền



        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
