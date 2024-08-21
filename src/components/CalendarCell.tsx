import React from 'react';
import {useNavigate} from 'react-router-dom';

interface CalendarCellProps {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
  customColor: string;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, isCurrentMonth, customColor, date }) => {
  const navigate = useNavigate();
  const cellColor = customColor
  const cellClasses = `h-full flex items-center justify-center border border-gray-200 ${
    isCurrentMonth ? `bg-[${cellColor}]` : 'bg-gray-100 text-gray-400'
  }`;
  const dateString = `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`
  const clickHandler: React.MouseEventHandler<HTMLDivElement> = () => {

    if (isCurrentMonth) {
      navigate(`/journal/${dateString}`, {state: {date: date}})
    }else{
      alert('Not yet implemented')
    }
    
  }

  return (
    <div onClick={clickHandler} className={cellClasses}>
      {day}
    </div>
  );
};

export default CalendarCell;