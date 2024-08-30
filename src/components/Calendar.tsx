//Things this component does:
// 1. Fetch entry data from the backend by month
// 2. Use that data to color-code the cells, and importantly, pass it to the JournalPage component (less api calls this way)
// 3. Render the Calendar and control for navigating between months, repeating the fetch-cache process


import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import CalendarCell from './CalendarCell';
import { useNavigate } from 'react-router-dom';
import { getThemeClass } from '../utils/theme-utils';

const daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


interface Entry {
  id: number;
  date: Date;
  mood_color: string;
  mood_name: string;
}

interface MoodInfo {
  color: string;
  name: string;
}



// Utility functions for caching 
//******REMOVED FOR NOW******
          // const getCachedEntries = (key: string): Entry[] | null => {
          //   const cachedData = localStorage.getItem(key);
          //   return cachedData ? JSON.parse(cachedData, (key, value) => {
          //     if (key === 'date') return new Date(value);
          //     return value;
          //   }) : null;
          // };

          // const setCachedEntries = (key: string, entries: Entry[]): void => {
          //   localStorage.setItem(key, JSON.stringify(entries));
          // };


//Component starts here
const Calendar: React.FC = () => {

  const navigate = useNavigate();
  const  {userId, logout} = useAuth();
  //confirming user is logged in
  


  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [uniqueMoods, setUniqueMoods] = useState<MoodInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
 
  //Lot of things to get the calendar to work with month rollover, caching, date coloring, etc.
  const getDaysInMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const year: number = currentDate.getFullYear();
  const month: number = currentDate.getMonth();
  const daysInMonth: number = getDaysInMonth(currentDate);
  const firstDayOfMonth: number = getFirstDayOfMonth(currentDate);

  const prevMonth = (): void => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (): void => {
    setCurrentDate(new Date(year, month + 1, 1));
  };


  //Fetching entries for current month

  
  const fetchUserEntriesForCurrentMonth = useCallback(async (userId: number) => {

    // Getting the start and end of the month to only fetch entries for the current month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month, getDaysInMonth(currentDate));
    const queryParams = new URLSearchParams({
      userId: userId.toString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/entries?${queryParams}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Entry[] = await response.json();
      // Convert date strings to Date objects

      const entriesWithDates = data.map(entry => {
        //JS is actually obnoxious with trying to automatically adjust 
        //the dates to match the time zone. I can't stop it from doing that, so I have to
        //manually undo it

        const offSetFinder = new Date().getTimezoneOffset();
        const adjustedDate = new Date(new Date(entry.date).getTime() + (offSetFinder * 60 * 1000));

      return {
        ...entry,
        date: adjustedDate,
      }});
      setEntries(entriesWithDates);
      const moods = entriesWithDates.reduce((acc: MoodInfo[], entry) => {
        if (!acc.some(mood => mood.color === entry.mood_color)) {
          acc.push({ color: entry.mood_color, name: entry.mood_name });
        }
        return acc;
      }, []);
      setUniqueMoods(moods);
      setIsLoading(false);
      console.log(entries)
    } catch (error) {
      console.error("Could not fetch entries:", error);
    }
  }, [year, month, currentDate]);

  useEffect(() => {
    fetchUserEntriesForCurrentMonth(userId); 
  }, [fetchUserEntriesForCurrentMonth, userId]);

  const renderCalendarDays = (): JSX.Element[] => {
    const days: JSX.Element[] = [];
    const totalCells: number = 42; // 6 rows * 7 days
  
    const lastDayOfPreviousMonth = new Date(year, month, 0);
    const daysInPreviousMonth = lastDayOfPreviousMonth.getDate();
  
    for (let i = 0; i < totalCells; i++) {
      let cellDate: Date;
      let dayNumber: number;
  
      if (i < firstDayOfMonth) {
        // Days from the previous month
        dayNumber = daysInPreviousMonth - firstDayOfMonth + i + 1;
        cellDate = new Date(year, month - 1, dayNumber);
      } else if (i >= firstDayOfMonth + daysInMonth) {
        // Days from the next month
        dayNumber = i - (firstDayOfMonth + daysInMonth) + 1;
        cellDate = new Date(year, month + 1, dayNumber);
      } else {
        // Days in the current month
        dayNumber = i - firstDayOfMonth + 1;
        cellDate = new Date(year, month, dayNumber);
      }
  
      const isCurrentMonth: boolean = cellDate.getMonth() === month;
  
      const matchingEntry = entries.find(entry => 
        entry.date.getFullYear() === cellDate.getFullYear() &&
        entry.date.getMonth() === cellDate.getMonth() &&
        entry.date.getDate() === cellDate.getDate()
      );

      const customColor = matchingEntry?.mood_color || `${getThemeClass('weekday')}`; 

      days.push(
        <CalendarCell 
          key={i}
          day={dayNumber} 
          date={cellDate}
          customColor={customColor}
          isCurrentMonth={isCurrentMonth} 
          entry = {matchingEntry || null}
        />
      );
    }
    return days;
  };

  const renderMoodLegend = () => {
    return (
      <div className="flex flex-wrap justify-center items-center my-2 space-x-4">
        {uniqueMoods.map((mood, index) => (
          <div key={index} className="flex items-center mr-4 mb-2">
            <div
              className="w-4 h-4 rounded-full mr-1"
              style={{ backgroundColor: mood.color }}
            ></div>
            <span className="text-sm">{mood.name}</span>
          </div>
        ))}
      </div>
    );
  };

 //Give loading feedback while data is being fetched
 if (isLoading) {
  return <div>Loading...</div>;
}


  return (
<div className={`w-full h-full flex flex-col ${getThemeClass('background')} ${getThemeClass('text')} rounded-lg shadow-md`}>
  <div className="flex justify-end p-2">
    <button onClick={logout} className={`px-3 py-1 rounded ${getThemeClass('primary')} text-sm`}>Logout</button>
  </div>
  <div className="flex justify-between items-center px-4 pb-2">
    <button onClick={prevMonth} className={`p-2 rounded-full ${getThemeClass('hover')}`}>
      <ChevronLeft size={24} />
    </button>
    <h2 className={`text-xl font-semibold ${getThemeClass('accent')}`}>
      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
    </h2>
    <button onClick={nextMonth} className={`p-2 rounded-full ${getThemeClass('hover')}`}>
      <ChevronRight size={24} />
    </button>
  </div>
  
  <div className="px-4 pb-2">
    {renderMoodLegend()}
  </div>

    <div className="flex-grow flex flex-col px-4 pb-4">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className={`text-center text-sm font-medium ${getThemeClass('secondary')}`}>
            {day}
          </div>
        ))}
      </div>
      <div className="flex-grow grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>

    <div className="p-4">
      <button 
        onClick={() => navigate('/trends')} 
        className={`w-1/4 p-2 rounded-full ${getThemeClass('primary')}`}
      >
        To Trends
      </button>
    </div>
  </div>
  );
};

export default Calendar;