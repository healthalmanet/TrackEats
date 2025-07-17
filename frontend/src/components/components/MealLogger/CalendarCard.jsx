import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Better icons for navigation

const CalendarCard = ({ selectedDate, setSelectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-full text-body hover:bg-light transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h2 className="text-lg font-['Poppins'] font-semibold text-heading">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-full text-body hover:bg-light transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const weekStart = startOfWeek(currentMonth, { weekStartsOn: 0 }); // Assuming Sunday start

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-xs font-semibold text-center text-body/70 uppercase">
          {format(addDays(weekStart, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const dayClone = day; // Clone day for the onClick handler
        const isCurrentMonth = day.getMonth() === monthStart.getMonth();
        const isSelected = format(day, 'yyyy-MM-dd') === selectedDate;
        
        let cellClasses = 'text-sm h-9 w-9 flex items-center justify-center rounded-full transition-colors duration-200';

        if (isSelected) {
          cellClasses += ' bg-primary text-light font-bold';
        } else if (isCurrentMonth) {
          cellClasses += ' text-heading hover:bg-primary/10 cursor-pointer';
        } else {
          cellClasses += ' text-body/40 cursor-not-allowed';
        }

        days.push(
          <div
            key={day.toString()}
            onClick={() => isCurrentMonth && setSelectedDate(format(dayClone, 'yyyy-MM-dd'))}
            className={cellClasses}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(<div className="grid grid-cols-7 place-items-center" key={day.toString()}>{days}</div>);
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="bg-section rounded-xl shadow-soft border border-custom p-6 font-['Poppins']">
      <h3 className="text-lg font-['Lora'] font-semibold text-heading mb-3">Select Date</h3>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarCard;