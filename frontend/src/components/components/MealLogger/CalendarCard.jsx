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

const CalendarCard = ({ selectedDate, setSelectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-xl font-bold">&lt;</button>
      <h2 className="text-lg font-semibold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-xl font-bold">&gt;</button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const weekStart = startOfWeek(currentMonth, { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-xs font-semibold text-center text-gray-500 uppercase">
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
        const isCurrentMonth = day.getMonth() === monthStart.getMonth();
        const isSelected = format(day, 'yyyy-MM-dd') === selectedDate;

        days.push(
          <div
            key={day}
            onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
            className={`text-sm text-center py-1 cursor-pointer rounded-md
              ${isSelected ? 'bg-green-500 text-white' :
                isCurrentMonth ? 'text-gray-800 hover:bg-green-100' :
                  'text-gray-400'}
            `}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(<div className="grid grid-cols-7 gap-1" key={day}>{days}</div>);
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Date</h3>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarCard;
