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

  // Sort data by date
  filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get unique mood names and colors
  const moodSet = new Set(filteredData.map(item => item.mood_name));
  const moods = Array.from(moodSet);
  const moodColors = moods.reduce((acc, mood) => {
    acc[mood] = filteredData.find(item => item.mood_name === mood)?.mood_color || '#000000';
    return acc;
  }, {} as Record<string, string>);

  // Calculate cumulative totals
  const cumulativeTotals = filteredData.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = { ...acc[Object.keys(acc).pop() || ''] };
    }
    acc[date][item.mood_name] = (acc[date][item.mood_name] || 0) + item.entry_count;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = {
    labels: Object.keys(cumulativeTotals).map(formatDate),
    datasets: moods.map(mood => ({
      label: mood,
      data: Object.values(cumulativeTotals).map(dailyTotal => dailyTotal[mood] || 0),
      borderColor: moodColors[mood],
      backgroundColor: moodColors[mood],
      fill: false,
      tension: 0.1,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cumulative Mood Occurrences',
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
        text: `Cumulative Mood Occurrences Over Time (Last ${timeRange} Days)`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            if (context[0]) {
              const originalDate = Object.keys(cumulativeTotals)[context[0].dataIndex];
              return new Date(originalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }
            return '';
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineGraph;