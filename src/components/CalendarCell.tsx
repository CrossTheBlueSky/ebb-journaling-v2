import React from 'react';

interface CalendarCellProps {
  day: number;
  isCurrentMonth: boolean;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, isCurrentMonth }) => {
  const cellClasses = `h-10 flex items-center justify-center border border-gray-200 ${
    isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-400'
  }`;

  return (
    <div className={cellClasses}>
      {day}
    </div>
  );
};

export default CalendarCell;