import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarCell from './CalendarCell';

const daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

  const year: number = currentDate.getFullYear();
  const month: number = currentDate.getMonth();
  const daysInMonth: number = getDaysInMonth(year, month);
  const firstDayOfMonth: number = getFirstDayOfMonth(year, month);

  const prevMonth = (): void => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (): void => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderCalendarDays = (): JSX.Element[] => {
    const days: JSX.Element[] = [];
    const totalCells: number = 42; // 6 rows * 7 days
    const daysInPrevMonth: number = getDaysInMonth(year, month - 1);

    for (let i = 0; i < totalCells; i++) {
      const dayNumber: number = i - firstDayOfMonth + 1;
      let day: number;
      let isCurrentMonth: boolean;

      if (dayNumber <= 0) {
        day = daysInPrevMonth + dayNumber;
        isCurrentMonth = false;
      } else if (dayNumber > daysInMonth) {
        day = dayNumber - daysInMonth;
        isCurrentMonth = false;
      } else {
        day = dayNumber;
        isCurrentMonth = true;
      }

      days.push(
        <CalendarCell 
          key={i} 
          day={day} 
          isCurrentMonth={isCurrentMonth} 
        />
      );
    }
    return days;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-lg shadow-md">
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
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;