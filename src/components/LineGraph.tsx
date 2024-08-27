import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodData {
  date: string;
  entry_count: number;
  mood_color: string;
  mood_name: string;
}

interface LineGraphProps {
  data: MoodData[];
  timeRange: '30' | '90' | '180' | '365';
}

export const LineGraph: React.FC<LineGraphProps> = ({ data, timeRange }) => {
  const filterDataByTimeRange = (data: MoodData[], days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(data, parseInt(timeRange));

  const chartData = {
    labels: filteredData.map(item => item.date),
    datasets: [
      {
        label: 'Mood Entries',
        data: filteredData.map(item => item.entry_count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Entry Count',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Mood Entries Over Time (Last ${timeRange} Days)`,
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineGraph