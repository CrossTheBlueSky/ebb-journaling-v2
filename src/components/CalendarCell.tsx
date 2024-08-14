import React from 'react';
import {useNavigate} from 'react-router-dom';

interface CalendarCellProps {
  day: number;
  isCurrentMonth: boolean;
  date: string;
  customColor: string;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, isCurrentMonth, customColor, date }) => {
  const navigate = useNavigate();
  const cellColor = customColor ? customColor : 'bg-white'
  const cellClasses = `h-10 flex items-center justify-center border border-gray-200 ${
    isCurrentMonth ? cellColor : 'bg-gray-100 text-gray-400'
  }`;

  const clickHandler: React.MouseEventHandler<HTMLDivElement> = () => {

    if (isCurrentMonth) {
      navigate(`/journal/${date}`, {state: {date: date}})
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