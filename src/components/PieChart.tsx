import React, { useMemo } from 'react';
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

const PieChart: React.FC<PieChartProps> = ({ data, timeRange }) => {
  // Create a consistent mood-to-color mapping using all data
  const moodColors = useMemo(() => {
    return data.reduce((acc, item) => {
      if (!acc[item.mood_name]) {
        acc[item.mood_name] = item.mood_color;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [data]);

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
        backgroundColor: Object.keys(moodCounts).map(mood => moodColors[mood] || '#000000'),
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
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue;
            const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart