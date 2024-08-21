import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CalendarCellProps {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
  customColor: string;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, isCurrentMonth, customColor, date }) => {
  const navigate = useNavigate();
  
  const cellClasses = `h-full flex items-center justify-center border border-gray-200 ${isCurrentMonth ? '' : 'text-gray-400'}`;

  const dateString = `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`;
  
  const clickHandler: React.MouseEventHandler<HTMLDivElement> = () => {
    if (isCurrentMonth) {
      navigate(`/journal/${dateString}`, { state: { date: date } });
    } else {
      alert('Please select a date from the current month!');
    }
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: isCurrentMonth ? customColor : '#f3f4f6', // gray-100 equivalent
  };

  return (
    <div onClick={clickHandler} className={cellClasses} style={cellStyle}>
      {day}
    </div>
  );
};

export default CalendarCell;