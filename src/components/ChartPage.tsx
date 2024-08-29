import React, { useState, useEffect } from 'react';
import LineGraph from './LineGraph';
import PieChart from './PieChart';
import { useAuth } from '../context/AuthContext';
import { getThemeClass} from '../utils/theme-utils';
import { useNavigate } from 'react-router-dom';


type TimeRange = '30' | '90' | '180' | '365';

const ChartPage = () => {

  const [activeChart, setActiveChart] = useState('line');
  const [timeRange, setTimeRange] = useState('30');
  const  {userId, username} = useAuth();
  const [moodData, setMoodData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('/api/chart-data/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const moodData = await response.json();
      console.log('Chart moodData:', moodData);
      setMoodData(moodData);
    } catch (error) {
      console.error('Error fetching chart moodData:', error);
      throw error;
    }
  };

  const handleChartTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveChart(event.target.value as 'line' | 'pie');
  };

  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(event.target.value as TimeRange);
  };

  return (
    <div className={`mood-tracking-chart ${getThemeClass('background')}`}>
      <div className={`${getThemeClass('primary')}`}>
      <button onClick={() => navigate("/")} className={`text-2xl m-1`}>
            Back to Calendar
          </button>
      </div>
      <div className="chart-controls m-2">
        <select value={activeChart} onChange={handleChartTypeChange}>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
        <select value={timeRange} onChange={handleTimeRangeChange}>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
          <option value="180">180 Days</option>
          <option value="365">1 Year</option>
        </select>
      </div>
      <div className="mt-2 chart-container w-11/12">
        {activeChart === 'line' ? (
          <LineGraph data={moodData} timeRange={timeRange} />
        ) : (
          <PieChart data={moodData} timeRange={timeRange} />
        )}
      </div>
    </div>
  );
};

export default ChartPage;