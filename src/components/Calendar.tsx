//Things this component does:
// 1. Fetch entry data from the backend by month
// 2. Use that data to color-code the cells, and importantly, pass it to the JournalPage component (less api calls this way)
// 3. Render the Calendar and control for navigating between months, repeating the fetch-cache process

//TODO: Potentially allow zooming out of month view to a year view


import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarCell from './CalendarCell';

const daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Entry {
  id: number;
  date: Date;
  mood_color: string;
}

// Utility functions for caching
const getCachedEntries = (key: string): Entry[] | null => {
  const cachedData = localStorage.getItem(key);
  return cachedData ? JSON.parse(cachedData, (key, value) => {
    if (key === 'date') return new Date(value);
    return value;
  }) : null;
};

const setCachedEntries = (key: string, entries: Entry[]): void => {
  localStorage.setItem(key, JSON.stringify(entries));
};


//Component starts here
const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
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


  //Fetching entries for current month and caching them to reduce future fetch calls

  
  const fetchUserEntriesForCurrentMonth = useCallback(async (userId: number) => {
    const cacheKey = `entries_${userId}_${year}_${month}`;
    const cachedEntries = getCachedEntries(cacheKey);
    

    
    // don't fetch if already cached
    // if (cachedEntries) {
    //   console.log("cached entries:", cachedEntries)
    //   setEntries(cachedEntries);
    //   return;
    // }

    // Getting the start and end of the month to only fetch entries for the current month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month, getDaysInMonth(currentDate));
    const url = `/api/entries?userId=${userId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

    try {
      const response = await fetch(url);
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
      setCachedEntries(cacheKey, entriesWithDates);
      console.log("Entries fetched:", entriesWithDates);
    } catch (error) {
      console.error("Could not fetch entries:", error);
    }
  }, [year, month, currentDate]);

  useEffect(() => {
    fetchUserEntriesForCurrentMonth(1); // Assuming userId is 1
  }, [fetchUserEntriesForCurrentMonth]);

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
      if(matchingEntry){
        console.log(matchingEntry);
      }
      const customColor = matchingEntry?.mood_color || 'bg-white'
  
      days.push(
        <CalendarCell 
          key={i}
          day={dayNumber} 
          date={cellDate}
          customColor={customColor}
          isCurrentMonth={isCurrentMonth} 
        />
      );
    }
    return days;
  };

  return (
    <div className="w-full h-full mx-auto mt-0 p-4 pt-0 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight size={24} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 my-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="h-[85%] grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;