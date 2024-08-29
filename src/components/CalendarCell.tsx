import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getThemeClass } from '../utils/theme-utils';

interface CalendarCellProps {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
  customColor: string;
  entry: object | null;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, isCurrentMonth, customColor, date, entry }) => {
  const navigate = useNavigate();
  
  const cellClasses = `h-full flex items-center justify-center border border-gray-200  ${isCurrentMonth ? `text-black-700` : 'text-gray-400'}`;

  const dateString = `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`;
  
  const clickHandler: React.MouseEventHandler<HTMLDivElement> = () => {
    if (isCurrentMonth) {
      navigate(`/journal/${dateString}`, { state: {date, entry} });
    } else {
      alert('Please select a date from the current month!');
    }
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: isCurrentMonth ? customColor : getThemeClass('non_month'),
  };

  return (
    <div onClick={clickHandler} className={cellClasses} style={cellStyle}>
      {day}
    </div>
  );
};

export default CalendarCell;