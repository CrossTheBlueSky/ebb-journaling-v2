import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MoodData {
  date: string;
  entry_count: number;
  mood_color: string;
  mood_name: string;
}

interface PieChartProps {
  data: MoodData[];
  timeRange: '30' | '90' | '180' | '365';
}

export const PieChart: React.FC<PieChartProps> = ({ data, timeRange }) => {
  const filterDataByTimeRange = (data: MoodData[], days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(data, parseInt(timeRange));

  const moodCounts = filteredData.reduce((acc, item) => {
    acc[item.mood_name] = (acc[item.mood_name] || 0) + item.entry_count;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        data: Object.values(moodCounts),
        backgroundColor: filteredData.map(item => item.mood_color),
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Mood Distribution (Last ${timeRange} Days)`,
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart