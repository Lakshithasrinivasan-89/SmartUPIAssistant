"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AnalyticsBarChart = ({ data, labels }: { data: number[], labels: string[] }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sales (₹)',
        data,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        barThickness: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { display: false },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const AnalyticsLineChart = ({ data, labels }: { data: number[], labels: string[] }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue Growth',
        data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { display: false },
      x: { display: false },
    },
  };

  return <Line data={chartData} options={options} />;
};
